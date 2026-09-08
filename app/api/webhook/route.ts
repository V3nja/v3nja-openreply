import { NextRequest, NextResponse } from "next/server";
import {
  parseCommentEvents,
  parseMessageEvents,
  verifyWebhookSignature,
} from "@/lib/meta/webhook";
import { matchKeywords } from "@/lib/utils/keyword-matcher";
import { generateAntiSpamPublicReply } from "@/lib/utils/anti-spam-reply";
import { formatBrandedArtistDM } from "@/lib/utils/artist-dm";
import { LiveDataStore } from "@/lib/db/live-store";

const LIVE_TOKEN =
  process.env.PAGE_ACCESS_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN;

const PAGE_ID = process.env.INSTAGRAM_PAGE_ID || "100148156116636";
const GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION || "v25.0";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = process.env.WEBHOOK_VERIFY_TOKEN;

  if (!expectedToken) {
    console.error("[Webhook] WEBHOOK_VERIFY_TOKEN is not configured");
    return NextResponse.json(
      { success: false, error: "Webhook verification is not configured" },
      { status: 500 }
    );
  }

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
    if (!LIVE_TOKEN) {
      console.error("[Webhook] Meta access token is not configured");
      return NextResponse.json(
        { success: false, error: "Webhook delivery is not configured" },
        { status: 503 }
      );
    }

    const signature = request.headers.get("x-hub-signature-256");
    let signatureValid = false;
    try {
      signatureValid = verifyWebhookSignature(rawBody, signature);
    } catch (error: any) {
      console.error("[Webhook] Signature verification is not configured:", error?.message || "unknown error");
      return NextResponse.json(
        { success: false, error: "Webhook signature verification is not configured" },
        { status: 503 }
      );
    }

    if (!signatureValid) {
      console.warn("[Webhook] Rejected request with invalid signature");
      return NextResponse.json(
        { success: false, error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody);

    // Never log the raw Meta payload: it can contain user and message data.
    const commentEvents = parseCommentEvents(payload);
    const messageEvents = parseMessageEvents(payload);
    const activeCampaigns = LiveDataStore.getCampaigns().filter((c) => c.isActive);

    // 1. Process Inbound Comments
    for (const event of commentEvents) {
      const { commentId, commentText, commenterName, commenterId } = event;

      let matchedAutomation: any = null;
      let matchedKeyword: string | null = null;

      for (const auto of activeCampaigns) {
        const res = matchKeywords(commentText, auto.keywords, auto.wholeWordMatch);
        if (res.matched) {
          matchedAutomation = auto;
          matchedKeyword = res.matchedKeyword;
          break;
        }
      }

      if (matchedAutomation) {
        console.log(`[Webhook] Matched campaign "${matchedAutomation.name}"`);

        const primaryLink = matchedAutomation.trackedLinks?.[0]?.destinationUrl || "https://v3nja-official.web.app";
        const brandedDmText = formatBrandedArtistDM({
          rawMessage: matchedAutomation.dmMessage,
          commenterName: commenterName || "fam",
          campaignTitle: matchedAutomation.name,
          smartLinkUrl: primaryLink,
          followGated: matchedAutomation.requireFollow,
          followPrompt: matchedAutomation.followPromptMessage,
        });

        const dmUrl = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PAGE_ID}/messages?access_token=${LIVE_TOKEN}`;
        let dmSuccess = false;
        let dmErrorMessage: string | null = null;

        try {
          const dmRes = await fetch(dmUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              recipient: { comment_id: commentId },
              message: { text: brandedDmText },
            }),
          });
          const dmJson = await dmRes.json();
          console.log("[Webhook] Direct message delivery completed", {
            success: Boolean(dmJson.recipient_id || dmJson.message_id),
          });
          if (dmJson.recipient_id || dmJson.message_id) {
            dmSuccess = true;
          } else if (dmJson.error) {
            dmErrorMessage = dmJson.error.message;
          }
        } catch (e: any) {
          console.warn("[Webhook] Direct message send error:", e?.message || "unknown error");
          dmErrorMessage = e?.message || "unknown error";
        }

        let publicReplyText: string | null = null;
        if (matchedAutomation.publicReplyEnabled) {
          publicReplyText = generateAntiSpamPublicReply(
            matchedAutomation.publicReplyMessages,
            matchedAutomation.publicReplyMessage,
            commenterName
          );

          const replyUrl = `https://graph.facebook.com/${GRAPH_API_VERSION}/${commentId}/replies?access_token=${LIVE_TOKEN}`;
          try {
            const replyRes = await fetch(replyUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                message: publicReplyText,
              }),
            });
            const replyJson = await replyRes.json();
            console.log("[Webhook] Public comment reply delivery completed", {
              success: Boolean(replyJson.id || replyJson.message_id),
            });
          } catch (e: any) {
            console.warn("[Webhook] Public reply error:", e?.message || "unknown error");
          }
        }

        LiveDataStore.recordDmEvent({
          commenterId: commenterId || `fan_${Date.now()}`,
          commenterName: commenterName || "music_fan",
          commentText,
          commentId,
          matchedKeyword: matchedKeyword || matchedAutomation.keywords[0] || "MUSIC",
          automationId: matchedAutomation.id,
          automationName: matchedAutomation.name,
          automationKeywords: matchedAutomation.keywords,
          status: dmSuccess ? "SENT" : "FAILED",
          publicReplyText,
          errorMessage: dmErrorMessage,
        });
      }
    }

    // 2. Process Inbound Direct Messages
    for (const event of messageEvents) {
      const { messageText, senderId } = event;

      let matchedAutomation: any = null;
      let matchedKeyword: string | null = null;

      for (const auto of activeCampaigns) {
        if (!auto.dmTriggerEnabled) continue;
        const res = matchKeywords(messageText, auto.keywords, auto.wholeWordMatch);
        if (res.matched) {
          matchedAutomation = auto;
          matchedKeyword = res.matchedKeyword;
          break;
        }
      }

      if (matchedAutomation) {
        const primaryLink = matchedAutomation.trackedLinks?.[0]?.destinationUrl || "https://v3nja-official.web.app";
        const brandedDmText = formatBrandedArtistDM({
          rawMessage: matchedAutomation.dmMessage,
          commenterName: "fam",
          campaignTitle: matchedAutomation.name,
          smartLinkUrl: primaryLink,
        });

        const dmUrl = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PAGE_ID}/messages?access_token=${LIVE_TOKEN}`;
        try {
          const dmRes = await fetch(dmUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              recipient: { id: senderId },
              message: { text: brandedDmText },
            }),
          });
          const dmJson = await dmRes.json();
          console.log("[Webhook] Inbound DM reply delivery completed", {
            success: Boolean(dmJson.message_id),
          });

          LiveDataStore.recordDmEvent({
            commenterId: senderId,
            commenterName: "instagram_user",
            commentText: messageText,
            commentId: `dm_${Date.now()}`,
            matchedKeyword: matchedKeyword || "DM",
            automationId: matchedAutomation.id,
            automationName: matchedAutomation.name,
            automationKeywords: matchedAutomation.keywords,
            status: dmJson.message_id ? "SENT" : "FAILED",
            publicReplyText: null,
            errorMessage: dmJson.error?.message || null,
          });
        } catch (e: any) {
          console.warn("[Webhook] Inbound DM reply error:", e?.message || "unknown error");
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("[Webhook Error]:", err?.message || "unknown error");
    return NextResponse.json({ success: false, error: "Webhook processing failed" }, { status: 200 });
  }
}
