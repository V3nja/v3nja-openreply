import { createHash } from "node:crypto";
import { prisma } from "@/lib/db/client";
import { getDMQueue } from "@/lib/queue/client";
import { recordFanInteraction } from "@/lib/fans/engine";
import { evaluateAutomationRule } from "@/lib/automation/rules";
import {
  parseCommentEvents,
  parseMessageEvents,
  parsePostbackEvents,
} from "@/lib/meta/webhook";

export async function enqueueVerifiedWebhook(
  rawBody: string,
  payload: Parameters<typeof parseCommentEvents>[0]
): Promise<{ eventId: string; queued: number; duplicate: boolean }> {
  const eventId = createHash("sha256").update(rawBody).digest("hex");

  const existing = await prisma.webhookEvent.findUnique({
    where: { id: eventId },
    select: { id: true, status: true },
  });

  if (existing?.status === "PROCESSED") {
    return { eventId, queued: 0, duplicate: true };
  }

  if (existing?.status === "FAILED") {
    await prisma.webhookEvent.update({
      where: { id: eventId },
      data: { status: "PENDING", errorMessage: null, processedAt: null },
    });
  }

  const commentEvents = parseCommentEvents(payload);
  const messageEvents = parseMessageEvents(payload);
  const postbackEvents = parsePostbackEvents(payload);
  const accountIds = new Set<string>();

  for (const event of [...commentEvents, ...messageEvents, ...postbackEvents]) {
    accountIds.add(event.instagramAccountId);
  }

  const accounts = accountIds.size > 0
    ? await prisma.instagramAccount.findMany({
        where: { instagramId: { in: [...accountIds] } },
        select: { id: true, instagramId: true, workspaceId: true },
      })
    : [];

  const accountMap = new Map(accounts.map((account) => [account.instagramId, account]));
  const workspaceIds = new Set(accounts.map((account) => account.workspaceId));
  const workspaceId = workspaceIds.size === 1 ? [...workspaceIds][0] : null;

  if (!existing) {
    await prisma.webhookEvent.create({
      data: {
        id: eventId,
        workspaceId,
        object: payload.object,
        payload,
        status: "PENDING",
      },
    });
  }

  const queue = getDMQueue();
  let queued = 0;

  try {
    for (const event of commentEvents) {
      const account = accountMap.get(event.instagramAccountId);
      if (!account) continue;

      await recordFanInteraction({
        workspaceId: account.workspaceId,
        instagramAccountId: account.id,
        instagramUserId: event.commenterId,
        username: event.commenterName,
        tag: "comment",
        webhookEventId: eventId,
        dedupeKey: `webhook:${eventId}:comment:${event.commentId}`,
        interactionType: "comment",
      });

      if (event.mediaId) {
        const pendingAutomations = await prisma.automation.findMany({
          where: {
            workspaceId: account.workspaceId,
            instagramAccountId: account.id,
            isActive: true,
            pendingNextReel: true,
            postId: null,
          },
          select: {
            id: true,
            postId: true,
            matchAnyPost: true,
            pendingNextReel: true,
            keywords: true,
            matchAnyWord: true,
            wholeWordMatch: true,
          },
        });

        for (const automation of pendingAutomations) {
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
              text: event.commentText,
              mediaId: event.mediaId,
              originalMediaId: event.originalMediaId,
            }
          );
          if (!decision.matched) continue;

          await prisma.automation.updateMany({
            where: {
              id: automation.id,
              workspaceId: account.workspaceId,
              instagramAccountId: account.id,
              isActive: true,
              pendingNextReel: true,
              postId: null,
            },
            data: { postId: event.mediaId, pendingNextReel: false },
          });
        }
      }

      await queue.add(
        "process-comment",
        {
          instagramAccountId: event.instagramAccountId,
          commentId: event.commentId,
          commentText: event.commentText,
          commenterId: event.commenterId,
          commenterName: event.commenterName,
          mediaId: event.mediaId,
          originalMediaId: event.originalMediaId,
          source: "WEBHOOK",
        },
        { jobId: `comment_${event.instagramAccountId}_${event.commentId}` }
      );
      queued += 1;
    }

    for (const event of messageEvents) {
      const account = accountMap.get(event.instagramAccountId);
      if (!account) continue;

      await recordFanInteraction({
        workspaceId: account.workspaceId,
        instagramAccountId: account.id,
        instagramUserId: event.senderId,
        tag: "dm",
        webhookEventId: eventId,
        dedupeKey: `webhook:${eventId}:message:${event.messageId}`,
        interactionType: "dm",
      });

      await queue.add(
        "process-message",
        {
          instagramAccountId: event.instagramAccountId,
          messageId: event.messageId,
          messageText: event.messageText,
          senderId: event.senderId,
        },
        { jobId: `message_${event.instagramAccountId}_${event.messageId}` }
      );
      queued += 1;
    }

    for (const event of postbackEvents) {
      const account = accountMap.get(event.instagramAccountId);
      if (!account) continue;

      const postbackKey = event.mid ?? `${event.userId}:${event.payload}`;
      await recordFanInteraction({
        workspaceId: account.workspaceId,
        instagramAccountId: account.id,
        instagramUserId: event.userId,
        tag: "button-tap",
        webhookEventId: eventId,
        dedupeKey: `webhook:${eventId}:postback:${postbackKey}`,
        interactionType: "button-tap",
      });

      await queue.add(
        "process-postback",
        {
          instagramAccountId: event.instagramAccountId,
          userId: event.userId,
          payload: event.payload,
          mid: event.mid,
        },
        { jobId: `postback_${event.instagramAccountId}_${event.mid ?? event.userId}_${event.payload}` }
      );
      queued += 1;
    }

    await prisma.webhookEvent.update({
      where: { id: eventId },
      data: { status: "PROCESSED", processedAt: new Date(), errorMessage: null },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown queue error";
    await prisma.webhookEvent.update({
      where: { id: eventId },
      data: { status: "FAILED", errorMessage: message.slice(0, 1000) },
    });
    throw error;
  }

  return { eventId, queued, duplicate: false };
}
