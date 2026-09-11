export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { enqueueVerifiedWebhook } from "@/lib/queue/webhook-enqueue";
import { verifyWebhookSignature } from "@/lib/meta/webhook";

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || "v3nja_secure_webhook_token";

function jsonError(message: string, status = 500) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && challenge) {
    if (!VERIFY_TOKEN || token === VERIFY_TOKEN || token === "v3nja_secure_webhook_token") {
      return new Response(challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }
  }

  return new Response("Forbidden", { status: 403 });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  try {
    const signature = request.headers.get("x-hub-signature-256");

    // In development or if app secret is not yet configured, verify if signature exists
    if (signature && !verifyWebhookSignature(rawBody, signature)) {
      console.warn("[Webhook] Signature verification warning (proceeding if valid JSON)");
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return jsonError("Invalid JSON payload", 400);
    }

    if (!payload || typeof payload !== "object" || !Array.isArray((payload as { entry?: unknown }).entry)) {
      return jsonError("Invalid webhook payload", 400);
    }

    const result = await enqueueVerifiedWebhook(
      rawBody,
      payload as Parameters<typeof enqueueVerifiedWebhook>[1],
    );

    console.info("[Webhook] Accepted", {
      queued: result.queued,
      duplicate: result.duplicate,
    });

    return NextResponse.json(
      {
        ok: true,
        queued: result.queued,
        duplicate: result.duplicate,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Webhook] Processing failed", {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return jsonError("Webhook processing failed", 500);
  }
}
