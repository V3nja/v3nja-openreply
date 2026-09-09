import { Worker, type Job } from "bullmq";
import {
  getDMQueue,
  getRedisConnection,
  MANUAL_MESSAGE_JOB_NAME,
  MESSAGE_JOB_NAME,
  POSTBACK_JOB_NAME,
  FOLLOWUP_JOB_NAME,
  type DmQueueJob,
  type ProcessCommentJob,
  type ProcessMessageJob,
  type ProcessManualMessageJob,
  type ProcessPostbackJob,
  type ProcessFollowUpJob,
} from "./client";
import { prisma } from "@/lib/db/client";
import {
  MetaApiError,
  RateLimitError,
  TokenExpiredError,
  getUserFollowStatus,
  sendCommentReply,
  sendDirectMessage,
  sendDirectMessageWithButton,
  sendDirectMessageWithLinkButton,
  sendPrivateReply,
  sendPrivateReplyWithButton,
  sendPrivateReplyWithLinkButton,
} from "@/lib/meta/client";
import { decryptToken } from "@/lib/meta/oauth";
import { evaluateAutomationRule } from "@/lib/automation/rules";
import { reserveDMSlot } from "@/lib/utils/rate-limiter";
import {
  releaseWorkspaceDMReservation,
  reserveWorkspaceDMSend,
} from "@/lib/billing/usage";
import { recordWorkerAlert } from "@/lib/ops/worker-health";
import {
  buildTrackedUrl,
  renderMessageWithTracking,
  renderMessageWithoutLink,
} from "@/lib/tracking/message";
import { acquireDeliveryLease, markDmLogFailed, markDmLogSent, withDeliveryLock } from "./idempotency";

const BACKOFF_DELAYS = [5 * 60 * 1000, 15 * 60 * 1000, 45 * 60 * 1000];

function formatError(error: unknown): string {
  if (error instanceof MetaApiError) {
    return `Meta API Error ${error.code}: ${error.message}`;
  }
  if (error instanceof Error) return error.message;
  return "Unknown error";
}

const NON_TEMPLATE_REJECTIONS = [
  /outside of allowed window/i,
  /invalid for a private reply/i,
  /requested user cannot be found/i,
];

function isTemplateRejection(error: unknown): boolean {
  if (error instanceof TokenExpiredError || error instanceof RateLimitError) {
    return false;
  }
  const message = error instanceof Error ? error.message : "";
  return !NON_TEMPLATE_REJECTIONS.some((pattern) => pattern.test(message));
}

type WorkerTrackedLink = {
  slug: string;
  label: string | null;
  destinationUrl: string;
};

function buildLinkButtons(
  trackedLinks: WorkerTrackedLink[],
  primaryLabel: string | null
): { title: string; url: string }[] {
  return trackedLinks.slice(0, 3).map((link, index) => ({
    url: buildTrackedUrl(link.slug),
    title: (index === 0 ? primaryLabel : link.label) || link.label || "Open link",
  }));
}

function buildInlineLinkFallback(
  message: string,
  commenterName: string | null | undefined,
  trackedLinks: WorkerTrackedLink[],
  bodyText: string
): string {
  const base =
    renderMessageWithTracking({ message, commenterName, trackedLinks }) ||
    bodyText;
  const extraUrls = trackedLinks.slice(1).map((link) => buildTrackedUrl(link.slug));
  return extraUrls.length > 0 ? `${base}\n${extraUrls.join("\n")}` : base;
}

type RevealAutomation = {
  dmMessage: string;
  linkButtonLabel: string | null;
  trackedLinks: WorkerTrackedLink[];
  instagramAccount: { instagramId: string };
};

async function sendRevealDirectMessage(
  accessToken: string,
  automation: RevealAutomation,
  userId: string,
  commenterName: string | null,
  context: string
): Promise<void> {
  if (automation.trackedLinks.length === 0) {
    await sendDirectMessage(
      accessToken,
      automation.instagramAccount.instagramId,
      userId,
      renderMessageWithTracking({
        message: automation.dmMessage,
        commenterName,
        trackedLinks: automation.trackedLinks,
      })
    );
    return;
  }

  const bodyText =
    renderMessageWithoutLink({
      message: automation.dmMessage,
      commenterName,
    }) || "Here's your link:";
  const buttons = buildLinkButtons(automation.trackedLinks, automation.linkButtonLabel);

  try {
    await sendDirectMessageWithLinkButton(
      accessToken,
      automation.instagramAccount.instagramId,
      userId,
      bodyText,
      buttons
    );
  } catch (buttonError) {
    if (!isTemplateRejection(buttonError)) throw buttonError;
    try {
      await sendDirectMessage(
        accessToken,
        automation.instagramAccount.instagramId,
        userId,
        buildInlineLinkFallback(
          automation.dmMessage,
          commenterName,
          automation.trackedLinks,
          bodyText
        )
      );
    } catch {
      throw buttonError;
    }
  }
}

async function processManualMessage(job: Job<ProcessManualMessageJob>): Promise<void> {
  const { workspaceId, instagramAccountId, recipientId, text, requestId } = job.data;

  const account = await prisma.instagramAccount.findFirst({
    where: { id: instagramAccountId, workspaceId },
    select: { id: true, instagramId: true, accessToken: true },
  });
  if (!account?.accessToken) throw new Error("Instagram account not connected");

  let accessToken: string;
  try {
    accessToken = decryptToken(account.accessToken);
  } catch {
    throw new Error("Failed to decrypt Instagram access token");
  }

  const usage = await reserveWorkspaceDMSend(workspaceId);
  if (!usage.allowed) throw new Error(`Monthly DM limit reached (${usage.limit})`);

  let rateLimit;
  try {
    rateLimit = await reserveDMSlot(account.id, 0);
  } catch (error) {
    await releaseWorkspaceDMReservation(workspaceId, usage.periodStart);
    throw error;
  }

  if (!rateLimit.allowed) {
    await releaseWorkspaceDMReservation(workspaceId, usage.periodStart);
    if (rateLimit.shouldRequeue) {
      await getDMQueue().add(
        MANUAL_MESSAGE_JOB_NAME,
        { ...job.data },
        { delay: rateLimit.requeueDelayMs, jobId: `${requestId}_retry` }
      );
      return;
    }
    throw new Error(
      rateLimit.shouldSkip
        ? "Hourly Instagram DM rate limit reached"
        : "Instagram messaging rate limit reached"
    );
  }

  try {
    await sendDirectMessage(accessToken, account.instagramId, recipientId, text);
    await prisma.operationalEvent.create({
      data: {
        workspaceId,
        source: "INBOX",
        level: "INFO",
        message: "Manual Instagram DM sent",
        payload: { requestId, instagramAccountId, recipientId },
      },
    });
  } catch (error) {
    await releaseWorkspaceDMReservation(workspaceId, usage.periodStart);
    throw error;
  }
}

async function processComment(job: Job<ProcessCommentJob>): Promise<void> {
  const {
    instagramAccountId,
    commentId,
    commentText,
    commenterId,
    commenterName,
    mediaId,
    originalMediaId,
  } = job.data;
  const requeueAttempt = job.data.requeueAttempt ?? 0;

  const automations = await prisma.automation.findMany({
    where: {
      OR: [
        { postId: mediaId },
        ...(originalMediaId ? [{ postId: originalMediaId }] : []),
        { matchAnyPost: true },
        { pendingNextReel: true },
      ],
      isActive: true,
      instagramAccount: { instagramId: instagramAccountId },
    },
    include: {
      instagramAccount: true,
      workspace: true,
      trackedLinks: {
        select: {
          slug: true,
          label: true,
          destinationUrl: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  for (const automation of automations) {
    const decision = evaluateAutomationRule(
      {
        postId: automation.postId,
        matchAnyPost: automation.matchAnyPost,
        pendingNextReel: automation.pendingNextReel,
        keywords: automation.keywords,
        matchAnyWord: automation.matchAnyWord,
        wholeWordMatch: automation.wholeWordMatch,
      },
      {
        text: commentText,
        mediaId,
        originalMediaId,
      }
    );
    if (!decision.matched) continue;
    const matchResult = decision;
    const existingLog = await prisma.dmLog.findUnique({
      where: { automationId_commentId: { automationId: automation.id, commentId } },
    });
    const alreadyDmd = existingLog?.status === "SENT";
    const alreadyPublicReplied = Boolean(existingLog?.publicReplySentAt);
    const needsDm = !alreadyDmd;
    if (existingLog?.status === "SKIPPED_PLAN_LIMIT") continue;
    if (alreadyDmd && (alreadyPublicReplied || !automation.publicReplyEnabled)) continue;

    if (!automation.instagramAccount.accessToken) continue;
    let accessToken: string;
    try {
      accessToken = decryptToken(automation.instagramAccount.accessToken);
    } catch {
      continue;
    }

    if (!existingLog) {
      await prisma.dmLog.create({
        data: {
          workspaceId: automation.workspaceId,
          automationId: automation.id,
          instagramAccountId: automation.instagramAccountId,
          commenterId,
          commenterName,
          commentText,
          commentId,
          matchedKeyword: matchResult.matchedKeyword,
          status: "PENDING",
          attempts: job.attemptsMade + 1,
        },
      });
    } else if (needsDm) {
      await prisma.dmLog.update({
        where: { automationId_commentId: { automationId: automation.id, commentId } },
        data: { status: "PENDING", attempts: job.attemptsMade + 1, matchedKeyword: matchResult.matchedKeyword, errorMessage: null },
      });
    }

    const replyPool = automation.publicReplyMessages.length > 0
      ? automation.publicReplyMessages
      : automation.publicReplyMessage ? [automation.publicReplyMessage] : [];
    if (automation.publicReplyEnabled && replyPool.length > 0 && !existingLog?.publicReplySentAt) {
      try {
        const publicReplyLock = await withDeliveryLock(
          `${automation.workspaceId}:automation:${automation.id}:comment:${commentId}:public`,
          async () => {
            const chosen = replyPool[Math.floor(Math.random() * replyPool.length)];
            const publicReply = renderMessageWithTracking({ message: chosen, commenterName, trackedLinks: automation.trackedLinks });
            await sendCommentReply(accessToken, commentId, publicReply);
          }
        );
        if (publicReplyLock.acquired) {
          await prisma.dmLog.update({ where: { automationId_commentId: { automationId: automation.id, commentId } }, data: { publicReplySentAt: new Date(), publicReplyError: null } });
        }
      } catch (error) {
        await prisma.dmLog.update({ where: { automationId_commentId: { automationId: automation.id, commentId } }, data: { publicReplyError: formatError(error) } }).catch(() => {});
      }
    }
    if (!needsDm) continue;

    const deliveryKey = `${automation.workspaceId}:automation:${automation.id}:comment:${commentId}:dm`;
    const deliveryLease = await acquireDeliveryLease(deliveryKey);
    if (!deliveryLease) continue;

    const usage = await reserveWorkspaceDMSend(automation.workspaceId);
    if (!usage.allowed) {
      await deliveryLease.release().catch(() => {});
      await prisma.dmLog.update({ where: { automationId_commentId: { automationId: automation.id, commentId } }, data: { status: "SKIPPED_PLAN_LIMIT", matchedKeyword: matchResult.matchedKeyword, errorMessage: `Monthly DM limit reached (${usage.limit})` } });
      continue;
    }

    let rateLimit;
    try {
      rateLimit = await reserveDMSlot(instagramAccountId, requeueAttempt);
    } catch (error) {
      await releaseWorkspaceDMReservation(automation.workspaceId, usage.periodStart);
      await deliveryLease.release().catch(() => {});
      await markDmLogFailed({ automationId: automation.id, commentId }, formatError(error), job.attemptsMade + 1);
      throw error;
    }
    if (!rateLimit.allowed) {
      await releaseWorkspaceDMReservation(automation.workspaceId, usage.periodStart);
      await deliveryLease.release().catch(() => {});
      if (rateLimit.shouldSkip) {
        await prisma.dmLog.update({ where: { automationId_commentId: { automationId: automation.id, commentId } }, data: { status: "SKIPPED_RATE_LIMIT", errorMessage: "Hourly Instagram DM rate limit reached" } });
        continue;
      }
      if (rateLimit.shouldRequeue) {
        await prisma.dmLog.update({ where: { automationId_commentId: { automationId: automation.id, commentId } }, data: { status: "PENDING", errorMessage: "Hourly rate limit hit; retry scheduled" } });
        await getDMQueue().add("process-comment", { ...job.data, requeueAttempt: requeueAttempt + 1 }, { delay: rateLimit.requeueDelayMs, jobId: `comment_${instagramAccountId}_${commentId}_retry_${requeueAttempt + 1}` });
        continue;
      }
      continue;
    }

    const useOpeningDm = automation.openingDmEnabled && Boolean(automation.openingDmMessage) && Boolean(automation.openingDmButtonLabel);
    let sendFollowPrompt = false;
    try {
      if (automation.requireFollow && !useOpeningDm) {
        const alreadyFollows = await getUserFollowStatus(accessToken, commenterId);
        sendFollowPrompt = alreadyFollows !== true;
      }
    } catch (error) {
      await releaseWorkspaceDMReservation(automation.workspaceId, usage.periodStart);
      await deliveryLease.release().catch(() => {});
      await markDmLogFailed({ automationId: automation.id, commentId }, formatError(error), job.attemptsMade + 1);
      throw error;
    }

    try {
      if (useOpeningDm) {
        const openingText = renderMessageWithTracking({ message: automation.openingDmMessage as string, commenterName, trackedLinks: [] });
        await sendPrivateReplyWithButton(accessToken, automation.instagramAccount.instagramId, commentId, openingText, automation.openingDmButtonLabel as string, automation.requireFollow ? `followcheck:${automation.id}` : `reveal:${automation.id}`);
      } else if (sendFollowPrompt) {
        const promptText = renderMessageWithoutLink({ message: automation.followPromptMessage || "Follow me and tap the button to grab your link!", commenterName });
        await sendPrivateReplyWithButton(accessToken, automation.instagramAccount.instagramId, commentId, promptText, automation.followPromptButtonLabel || "I'm following", `followcheck:${automation.id}`);
      } else if (automation.trackedLinks.length > 0) {
        const bodyText = renderMessageWithoutLink({ message: automation.dmMessage, commenterName }) || "Here's your link:";
        const buttons = buildLinkButtons(automation.trackedLinks, automation.linkButtonLabel);
        try {
          await sendPrivateReplyWithLinkButton(accessToken, automation.instagramAccount.instagramId, commentId, bodyText, buttons);
        } catch (buttonError) {
          if (!isTemplateRejection(buttonError)) throw buttonError;
          await sendPrivateReply(accessToken, automation.instagramAccount.instagramId, commentId, buildInlineLinkFallback(automation.dmMessage, commenterName, automation.trackedLinks, bodyText));
        }
      } else {
        await sendPrivateReply(accessToken, automation.instagramAccount.instagramId, commentId, renderMessageWithTracking({ message: automation.dmMessage, commenterName, trackedLinks: automation.trackedLinks }));
      }
      await markDmLogSent({ automationId: automation.id, commentId });
    } catch (error) {
      await releaseWorkspaceDMReservation(automation.workspaceId, usage.periodStart);
      await deliveryLease.release().catch(() => {});
      await markDmLogFailed({ automationId: automation.id, commentId }, formatError(error), job.attemptsMade + 1);
      throw error;
    }
  }
}

async function processPostback(job: Job<ProcessPostbackJob>): Promise<void> {
  const { instagramAccountId, userId, payload, mid, fallback } = job.data;
  const match = payload.match(/^(?:reveal|followcheck):(.+)$/);
  if (!match) return;
  const automation = await prisma.automation.findFirst({
    where: { id: match[1], instagramAccount: { instagramId: instagramAccountId } },
    include: { instagramAccount: true, workspace: true, trackedLinks: { select: { slug: true, label: true, destinationUrl: true }, orderBy: { createdAt: "asc" } } },
  });
  if (!automation?.instagramAccount.accessToken) return;
  const isFollowCheck = payload.startsWith("followcheck:");
  const commenterName = (await prisma.dmLog.findFirst({ where: { automationId: automation.id, commenterId: userId }, select: { commenterName: true } }))?.commenterName ?? null;
  const accessToken = decryptToken(automation.instagramAccount.accessToken);
  if (isFollowCheck && automation.requireFollow) {
    const follows = await getUserFollowStatus(accessToken, userId);
    if (follows === false) {
      try {
        const promptLock = await withDeliveryLock(
          `${automation.workspaceId}:automation:${automation.id}:postback:${mid || userId}:follow-prompt`,
          () => sendDirectMessageWithButton(accessToken, automation.instagramAccount.instagramId, userId, renderMessageWithoutLink({ message: automation.followPromptMessage || "Follow me and tap the button once you're following.", commenterName }), automation.followPromptButtonLabel || "I'm following", `followcheck:${automation.id}`)
        );
        if (!promptLock.acquired) return;
      } catch (error) {
        throw error;
      }
      return;
    }
  }
  const revealDedupeId = `reveal:${userId}`;
  const existingReveal = await prisma.dmLog.findUnique({ where: { automationId_commentId: { automationId: automation.id, commentId: revealDedupeId } }, select: { status: true } });
  if (existingReveal?.status === "SENT") return;

  const revealDeliveryKey = `${automation.workspaceId}:automation:${automation.id}:postback:${revealDedupeId}`;
  const deliveryLease = await acquireDeliveryLease(revealDeliveryKey);
  if (!deliveryLease) return;

  const usage = await reserveWorkspaceDMSend(automation.workspaceId);
  if (!usage.allowed) {
    await deliveryLease.release().catch(() => {});
    return;
  }

  let rateLimit;
  try {
    rateLimit = await reserveDMSlot(instagramAccountId, job.attemptsMade);
  } catch (error) {
    await releaseWorkspaceDMReservation(automation.workspaceId, usage.periodStart);
    await deliveryLease.release().catch(() => {});
    await markDmLogFailed({ automationId: automation.id, commentId: revealDedupeId }, formatError(error), job.attemptsMade + 1);
    throw error;
  }
  if (!rateLimit.allowed) {
    await releaseWorkspaceDMReservation(automation.workspaceId, usage.periodStart);
    await deliveryLease.release().catch(() => {});
    if (rateLimit.shouldSkip) return;
    throw new Error("Hourly Instagram DM rate limit reached");
  }

  try {
    await prisma.dmLog.upsert({
      where: { automationId_commentId: { automationId: automation.id, commentId: revealDedupeId } },
      create: {
        workspaceId: automation.workspaceId,
        automationId: automation.id,
        instagramAccountId: automation.instagramAccountId,
        commenterId: userId,
        commenterName,
        commentText: "(button tap)",
        commentId: revealDedupeId,
        status: "PENDING",
        attempts: job.attemptsMade + 1,
        errorMessage: null,
      },
      update: {
        status: "PENDING",
        attempts: job.attemptsMade + 1,
        commenterName,
        errorMessage: null,
      },
    });
    await sendRevealDirectMessage(accessToken, automation, userId, commenterName, "postback");
    await markDmLogSent({ automationId: automation.id, commentId: revealDedupeId });
  } catch (error) {
    await releaseWorkspaceDMReservation(automation.workspaceId, usage.periodStart);
    await deliveryLease.release().catch(() => {});
    await markDmLogFailed({ automationId: automation.id, commentId: revealDedupeId }, formatError(error), job.attemptsMade + 1);
    throw error;
  }
}

async function processFollowUp(job: Job<ProcessFollowUpJob>): Promise<void> {
  const { instagramAccountId, userId, automationId, commenterName } = job.data;
  const automation = await prisma.automation.findFirst({ where: { id: automationId, isActive: true }, include: { instagramAccount: true } });
  if (!automation?.followUpEnabled || !automation.followUpMessage?.trim() || automation.instagramAccount.instagramId !== instagramAccountId || !automation.instagramAccount.accessToken) return;
  const dedupeId = `followup:${userId}`;
  const existingLog = await prisma.dmLog.findUnique({
    where: { automationId_commentId: { automationId: automation.id, commentId: dedupeId } },
    select: { status: true },
  });
  if (existingLog?.status === "SENT") return;
  const accessToken = decryptToken(automation.instagramAccount.accessToken);

  const deliveryKey = `${automation.workspaceId}:automation:${automation.id}:followup:${userId}`;
  const deliveryLease = await acquireDeliveryLease(deliveryKey);
  if (!deliveryLease) return;

  const usage = await reserveWorkspaceDMSend(automation.workspaceId);
  if (!usage.allowed) {
    await deliveryLease.release().catch(() => {});
    return;
  }

  let rateLimit;
  try {
    rateLimit = await reserveDMSlot(instagramAccountId, job.attemptsMade);
  } catch (error) {
    await releaseWorkspaceDMReservation(automation.workspaceId, usage.periodStart);
    await deliveryLease.release().catch(() => {});
    throw error;
  }
  if (!rateLimit.allowed) {
    await releaseWorkspaceDMReservation(automation.workspaceId, usage.periodStart);
    await deliveryLease.release().catch(() => {});
    if (rateLimit.shouldSkip) return;
    if (rateLimit.shouldRequeue) {
      await getDMQueue().add(FOLLOWUP_JOB_NAME, { ...job.data }, { delay: rateLimit.requeueDelayMs, jobId: `followup_${automation.id}_${userId}_retry_${job.attemptsMade + 1}` });
      return;
    }
    throw new Error("Instagram messaging rate limit reached");
  }

  try {
    await prisma.dmLog.upsert({
      where: { automationId_commentId: { automationId: automation.id, commentId: dedupeId } },
      create: {
        workspaceId: automation.workspaceId,
        automationId: automation.id,
        instagramAccountId: automation.instagramAccountId,
        commenterId: userId,
        commenterName: commenterName ?? null,
        commentText: "(scheduled follow-up)",
        commentId: dedupeId,
        status: "PENDING",
        attempts: job.attemptsMade + 1,
        errorMessage: null,
      },
      update: {
        status: "PENDING",
        attempts: job.attemptsMade + 1,
        commenterName: commenterName ?? null,
        errorMessage: null,
      },
    });
    await sendDirectMessage(
      accessToken,
      automation.instagramAccount.instagramId,
      userId,
      renderMessageWithoutLink({ message: automation.followUpMessage, commenterName: commenterName ?? null })
    );
    await markDmLogSent({ automationId: automation.id, commentId: dedupeId });
  } catch (error) {
    await releaseWorkspaceDMReservation(automation.workspaceId, usage.periodStart);
    await deliveryLease.release().catch(() => {});
    await markDmLogFailed({ automationId: automation.id, commentId: dedupeId }, formatError(error), job.attemptsMade + 1);
    throw error;
  }
}

async function processMessage(job: Job<ProcessMessageJob>): Promise<void> {
  const { instagramAccountId, messageId, messageText, senderId } = job.data;
  const automations = await prisma.automation.findMany({ where: { dmTriggerEnabled: true, isActive: true, instagramAccount: { instagramId: instagramAccountId } }, include: { instagramAccount: true, workspace: true, trackedLinks: { select: { slug: true, label: true, destinationUrl: true }, orderBy: { createdAt: "asc" } } }, orderBy: { createdAt: "asc" } });
  const dedupeId = `dm:${messageId}`;
  for (const automation of automations) {
    const decision = evaluateAutomationRule(
      {
        postId: null,
        matchAnyPost: true,
        pendingNextReel: false,
        keywords: automation.keywords,
        matchAnyWord: automation.matchAnyWord,
        wholeWordMatch: automation.wholeWordMatch,
      },
      { text: messageText }
    );
    if (!decision.matched) continue;
    const matchResult = decision;
    const existingLog = await prisma.dmLog.findUnique({ where: { automationId_commentId: { automationId: automation.id, commentId: dedupeId } } });
    if (existingLog?.status === "SENT" || existingLog?.status === "SKIPPED_PLAN_LIMIT") continue;
    if (!automation.instagramAccount.accessToken) continue;
    const accessToken = decryptToken(automation.instagramAccount.accessToken);
    const priorLog = await prisma.dmLog.findFirst({ where: { automationId: automation.id, commenterId: senderId }, select: { commenterName: true } });
    const commenterName = priorLog?.commenterName ?? null;
    let sendFollowPrompt = false;
    if (automation.requireFollow) { const follows = await getUserFollowStatus(accessToken, senderId); sendFollowPrompt = follows !== true; }

    const deliveryKey = `${automation.workspaceId}:automation:${automation.id}:message:${messageId}`;
    const deliveryLease = await acquireDeliveryLease(deliveryKey);
    if (!deliveryLease) continue;

    const usage = await reserveWorkspaceDMSend(automation.workspaceId);
    if (!usage.allowed) {
      await deliveryLease.release().catch(() => {});
      continue;
    }

    let rateLimit;
    try {
      rateLimit = await reserveDMSlot(instagramAccountId, job.attemptsMade);
    } catch (error) {
      await releaseWorkspaceDMReservation(automation.workspaceId, usage.periodStart);
      await deliveryLease.release().catch(() => {});
      throw error;
    }
    if (!rateLimit.allowed) {
      await releaseWorkspaceDMReservation(automation.workspaceId, usage.periodStart);
      await deliveryLease.release().catch(() => {});
      if (rateLimit.shouldSkip) continue;
      if (rateLimit.shouldRequeue) {
        await getDMQueue().add(MESSAGE_JOB_NAME, { ...job.data }, { delay: rateLimit.requeueDelayMs, jobId: `message_${instagramAccountId}_${messageId}_retry_${job.attemptsMade + 1}` });
        continue;
      }
      throw new Error("Instagram messaging rate limit reached");
    }

    try {
      if (!existingLog) {
        await prisma.dmLog.create({
          data: {
            workspaceId: automation.workspaceId,
            automationId: automation.id,
            instagramAccountId: automation.instagramAccountId,
            commenterId: senderId,
            commenterName,
            commentText: messageText,
            commentId: dedupeId,
            matchedKeyword: matchResult.matchedKeyword,
            status: "PENDING",
            attempts: job.attemptsMade + 1,
          },
        });
      } else {
        await prisma.dmLog.update({ where: { automationId_commentId: { automationId: automation.id, commentId: dedupeId } }, data: { status: "PENDING", attempts: job.attemptsMade + 1, matchedKeyword: matchResult.matchedKeyword, errorMessage: null } });
      }
      if (sendFollowPrompt) {
        await sendDirectMessageWithButton(accessToken, automation.instagramAccount.instagramId, senderId, renderMessageWithoutLink({ message: automation.followPromptMessage || "Almost there! Follow me and tap the button below to grab your link 💛", commenterName }), automation.followPromptButtonLabel || "I'm following ✅", `followcheck:${automation.id}`);
      } else {
        await sendRevealDirectMessage(accessToken, automation, senderId, commenterName, "message trigger");
      }
      await markDmLogSent({ automationId: automation.id, commentId: dedupeId });
    } catch (error) {
      await releaseWorkspaceDMReservation(automation.workspaceId, usage.periodStart);
      await deliveryLease.release().catch(() => {});
      await markDmLogFailed({ automationId: automation.id, commentId: dedupeId }, formatError(error), job.attemptsMade + 1);
      throw error;
    }
  }
}

async function processJob(job: Job<DmQueueJob>): Promise<void> {
  if (job.name === POSTBACK_JOB_NAME) return processPostback(job as Job<ProcessPostbackJob>);
  if (job.name === FOLLOWUP_JOB_NAME) return processFollowUp(job as Job<ProcessFollowUpJob>);
  if (job.name === MESSAGE_JOB_NAME) return processMessage(job as Job<ProcessMessageJob>);
  if (job.name === MANUAL_MESSAGE_JOB_NAME) return processManualMessage(job as Job<ProcessManualMessageJob>);
  return processComment(job as Job<ProcessCommentJob>);
}

async function recordWorkerFailure(job: Job<DmQueueJob> | undefined, error: Error) {
  try {
    const instagramAccountId = job?.data.instagramAccountId;
    const commentId = job && "commentId" in job.data ? job.data.commentId : null;
    const account = instagramAccountId ? await prisma.instagramAccount.findUnique({ where: { instagramId: instagramAccountId }, select: { workspaceId: true } }) : null;
    await prisma.operationalEvent.create({ data: { workspaceId: account?.workspaceId ?? (job && "workspaceId" in job.data ? job.data.workspaceId : null), source: "WORKER", level: "ERROR", message: `DM worker job ${job?.id ?? "unknown"} failed: ${error.message}`, payload: { jobId: job?.id ?? null, attemptsMade: job?.attemptsMade ?? null, instagramAccountId: instagramAccountId ?? null, commentId } } });
    await recordWorkerAlert({ level: "error", message: error.message, jobId: job?.id, instagramAccountId, commentId: commentId ?? undefined });
  } catch (recordError) {
    console.error("[DM Worker] Failed to record worker failure:", formatError(recordError));
  }
}

export function createDMWorker(): Worker<DmQueueJob> {
  const worker = new Worker<DmQueueJob>("dm-processing", processJob, {
    connection: getRedisConnection(),
    concurrency: 5,
    settings: { backoffStrategy: (attemptsMade: number) => BACKOFF_DELAYS[Math.min(attemptsMade - 1, BACKOFF_DELAYS.length - 1)] },
  });
  worker.on("completed", (job) => console.log(`[DM Worker] Job ${job.id} completed`));
  worker.on("failed", (job, err) => { console.error(`[DM Worker] Job ${job?.id} failed (attempt ${job?.attemptsMade}):`, err.message); void recordWorkerFailure(job, err); });
  worker.on("error", (err) => { console.error("[DM Worker] Worker error:", err.message); void prisma.operationalEvent.create({ data: { source: "WORKER", level: "ERROR", message: `DM worker process error: ${err.message}`, payload: { name: err.name } } }).catch((recordError) => console.error("[DM Worker] Failed to record worker process error:", formatError(recordError))); });
  return worker;
}
