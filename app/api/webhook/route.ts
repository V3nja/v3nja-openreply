import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import {
  parseCommentEvents,
  parseMessageEvents,
  parsePostbackEvents,
  verifyWebhookSignature,
} from "@/lib/meta/webhook";
import { matchKeywords } from "@/lib/utils/keyword-matcher";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken =
    process.env.WEBHOOK_VERIFY_TOKEN || "v3nja_webhook_secret_2026";

  if (mode === "subscribe" && token === expectedToken) {
    console.log("[Webhook] Verified successfully by Meta!");
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json(
    { success: false, error: "Verification failed" },
    { status: 403 }
  );
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  try {
    const payload = JSON.parse(rawBody);
    console.log("[Webhook] Inbound Meta event payload:", JSON.stringify(payload));

    const commentEvents = parseCommentEvents(payload);
    const messageEvents = parseMessageEvents(payload);

    const token =
      process.env.INSTAGRAM_ACCESS_TOKEN ||
      "1283029104898866|NXSXQuDYiNgo84tvoyLI9zgfg5E";

    // 1. Process Inbound Comments
    for (const event of commentEvents) {
      const { commentId, commentText, commenterName, commenterId, instagramAccountId } = event;

      // Find active automations
      const automations = await prisma.automation.findMany({
        where: { isActive: true },
      });

      let matchedAutomation: any = null;
      let matchedKeyword: string | null = null;

      for (const auto of automations) {
        const res = matchKeywords(commentText, auto.keywords, auto.wholeWordMatch);
        if (res.matched) {
          matchedAutomation = auto;
          matchedKeyword = res.matchedKeyword;
          break;
        }
      }

      if (matchedAutomation) {
        console.log(`[Webhook] Matched campaign "${matchedAutomation.name}" for keyword "${matchedKeyword}"`);

        // Send Private Reply DM via Meta Graph API
        const dmUrl = `https://graph.facebook.com/v22.0/${instagramAccountId || "17841450944703637"}/messages`;
        try {
          const dmRes = await fetch(dmUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              recipient: { comment_id: commentId },
              message: { text: matchedAutomation.dmMessage },
            }),
          });
          const dmJson = await dmRes.json();
          console.log("[Webhook] Direct message response:", JSON.stringify(dmJson));
        } catch (e) {
          console.warn("[Webhook] Direct message send error:", e);
        }

        // Send Public Reply on Comment
        if (matchedAutomation.publicReplyEnabled && matchedAutomation.publicReplyMessage) {
          const replyUrl = `https://graph.facebook.com/v22.0/${commentId}/replies`;
          try {
            await fetch(replyUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                message: matchedAutomation.publicReplyMessage,
              }),
            });
          } catch (e) {
            console.warn("[Webhook] Public reply error:", e);
          }
        }

        // Save to Database
        try {
          await prisma.dmLog.create({
            data: {
              workspaceId: matchedAutomation.workspaceId,
              automationId: matchedAutomation.id,
              instagramAccountId: matchedAutomation.instagramAccountId,
              commenterId: commenterId || `fan_${Date.now()}`,
              commenterName: commenterName || "fan",
              commentText: commentText,
              commentId: commentId,
              matchedKeyword: matchedKeyword || "NJALA",
              status: "SENT",
              attempts: 1,
              dmSentAt: new Date(),
            },
          });
        } catch (e) {
          console.warn("[Webhook] DB log error:", e);
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("[Webhook Error]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 200 });
  }
}
