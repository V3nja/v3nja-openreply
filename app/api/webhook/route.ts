import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getDMQueue } from "@/lib/queue/client";
import {
  parseCommentEvents,
  parseMessageEvents,
  parsePostbackEvents,
  verifyWebhookSignature,
} from "@/lib/meta/webhook";

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;
const QUEUE_ENABLED = process.env.WEBHOOK_QUEUE_ENABLED === "true";

function jsonError(message: string, status = 500) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function deterministicId(prefix: string, value: string) {
  const hash = createHash("sha256").update(value).digest("hex").slice(0, 32);
  return `${prefix}_${hash}`;
}

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && VERIFY_TOKEN && token === VERIFY_TOKEN && challenge) {
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256");

    if (!signature || !verifyWebhookSignature(rawBody, signature)) {
      return jsonError("Invalid webhook signature", 403);
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return jsonError("Invalid JSON payload", 400);
    }

    if (!payload || typeof payload !== "object") {
      return jsonError("Invalid webhook payload", 400);
    }

    if (!QUEUE_ENABLED) {
      console.error("[Webhook] Queue mode is disabled; refusing webhook delivery");
      return jsonError("Webhook queue is not enabled", 503);
    }

    const body = payload as { entry?: Array<{ id?: string }> };
    const instagramUserId = body.entry?.[0]?.id;
    if (!instagramUserId) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const instagramAccount = await prisma.instagramAccount.findUnique({
      where: { instagramUserId },
      select: { id: true, workspaceId: true },
    });

    if (!instagramAccount) {
      console.warn("[Webhook] Unregistered Instagram account", { instagramUserId });
      return NextResponse.json({ ok: true, ignored: true });
    }

    const webhookEventId = deterministicId("webhook", rawBody);
    await prisma.webhookEvent.upsert({
      where: { id: webhookEventId },
      create: {
        id: webhookEventId,
        workspaceId: instagramAccount.workspaceId,
        payload: payload as object,
        status: "RECEIVED",
      },
      update: {},
    });

    const queue = getDMQueue();
    const commentEvents = parseCommentEvents(payload);
    const messageEvents = parseMessageEvents(payload);
    const postbackEvents = parsePostbackEvents(payload);
    let queued = 0;

    for (const event of commentEvents) {
      await queue.add(
        "process-comment",
        {
          instagramAccountId: instagramAccount.id,
          commentId: event.commentId,
          commentText: event.commentText,
          commenterId: event.commenterId,
          commenterName: event.commenterName,
          mediaId: event.mediaId,
          originalMediaId: event.originalMediaId,
          source: "webhook",
        },
        { jobId: `comment_${instagramAccount.id}_${event.commentId}` },
      );
      queued += 1;
    }

    for (const event of messageEvents) {
      await queue.add(
        "process-message",
        {
          instagramAccountId: instagramAccount.id,
          messageId: event.messageId,
          messageText: event.messageText,
          senderId: event.senderId,
        },
        { jobId: `message_${instagramAccount.id}_${event.messageId}` },
      );
      queued += 1;
    }

    for (const event of postbackEvents) {
      const key = event.mid || JSON.stringify(event.payload);
      await queue.add(
        "process-postback",
        {
          instagramAccountId: instagramAccount.id,
          userId: event.userId,
          payload: event.payload,
          mid: event.mid,
          fallbackMessage: event.fallbackMessage,
        },
        { jobId: `postback_${instagramAccount.id}_${deterministicId("event", key)}` },
      );
      queued += 1;
    }

    await prisma.webhookEvent.update({
      where: { id: webhookEventId },
      data: { status: "QUEUED" },
    });

    console.info("[Webhook] Accepted and queued", {
      instagramUserId,
      comments: commentEvents.length,
      messages: messageEvents.length,
      postbacks: postbackEvents.length,
      queued,
    });

    return NextResponse.json({ ok: true, queued }, { status: 200 });
  } catch (error) {
    console.error("[Webhook] Processing failed", {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return jsonError("Webhook processing failed", 500);
  }
}
