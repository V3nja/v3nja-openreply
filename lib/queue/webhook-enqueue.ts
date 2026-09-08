import { createHash } from "node:crypto";
import { prisma } from "@/lib/db/client";
import { getDMQueue } from "@/lib/queue/client";
import {
  parseCommentEvents,
  parseMessageEvents,
  parsePostbackEvents,
} from "@/lib/meta/webhook";

/**
 * Persist a verified Meta webhook and enqueue its actionable events.
 *
 * The webhook route remains responsible for signature verification and the
 * legacy direct-delivery path remains available behind WEBHOOK_QUEUE_ENABLED.
 * Once enabled, this module becomes the hand-off point and the worker is the
 * only component that sends Instagram messages.
 */
export async function enqueueVerifiedWebhook(
  rawBody: string,
  payload: Parameters<typeof parseCommentEvents>[0]
): Promise<{ eventId: string; queued: number; duplicate: boolean }> {
  const eventId = createHash("sha256").update(rawBody).digest("hex");

  const existing = await prisma.webhookEvent.findUnique({
    where: { id: eventId },
    select: { id: true, status: true },
  });

  if (existing) {
    return { eventId, queued: 0, duplicate: true };
  }

  const accountIds = new Set<string>();
  for (const event of [
    ...parseCommentEvents(payload),
    ...parseMessageEvents(payload),
    ...parsePostbackEvents(payload),
  ]) {
    accountIds.add(event.instagramAccountId);
  }

  const accounts =
    accountIds.size > 0
      ? await prisma.instagramAccount.findMany({
          where: { instagramId: { in: [...accountIds] } },
          select: { id: true, instagramId: true, workspaceId: true },
        })
      : [];

  const accountMap = new Map(accounts.map((account) => [account.instagramId, account]));
  const workspaceIds = new Set(accounts.map((account) => account.workspaceId));
  const workspaceId = workspaceIds.size === 1 ? [...workspaceIds][0] : null;

  await prisma.webhookEvent.create({
    data: {
      id: eventId,
      workspaceId,
      object: payload.object,
      payload,
      status: "PENDING",
    },
  });

  const queue = getDMQueue();
  let queued = 0;

  try {
    for (const event of parseCommentEvents(payload)) {
      const account = accountMap.get(event.instagramAccountId);
      if (!account) continue;

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
        {
          jobId: `comment_${event.instagramAccountId}_${event.commentId}`,
        }
      );
      queued += 1;
    }

    for (const event of parseMessageEvents(payload)) {
      const account = accountMap.get(event.instagramAccountId);
      if (!account) continue;

      await queue.add(
        "process-message",
        {
          instagramAccountId: event.instagramAccountId,
          messageId: event.messageId,
          messageText: event.messageText,
          senderId: event.senderId,
        },
        {
          jobId: `message_${event.instagramAccountId}_${event.messageId}`,
        }
      );
      queued += 1;
    }

    for (const event of parsePostbackEvents(payload)) {
      const account = accountMap.get(event.instagramAccountId);
      if (!account) continue;

      await queue.add(
        "process-postback",
        {
          instagramAccountId: event.instagramAccountId,
          userId: event.userId,
          payload: event.payload,
          mid: event.mid,
        },
        {
          jobId: `postback_${event.instagramAccountId}_${event.mid ?? event.userId}_${event.payload}`,
        }
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
