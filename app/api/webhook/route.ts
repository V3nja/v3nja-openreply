import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import {
  parseCommentEvents,
  parseMessageEvents,
} from "@/lib/meta/webhook";
import { matchKeywords } from "@/lib/utils/keyword-matcher";

const HARDCODED_CAMPAIGNS = [
  {
    id: "camp_njala",
    name: "NJALA STREAMING CAMPAIGN",
    keywords: ["NJALA", "NJALAH", "STREAM"],
    wholeWordMatch: true,
    dmMessage:
      "Yo! 🔥 Here is the NJALA smart link you asked for.\n\nListen to V3NJA — NJALA on Apple Music, Spotify, Audiomack & YouTube ❤️👇\nhttps://v3njamusic.web.app/njala\n\nTag @v3nja2.0 in your IG story with the track!",
    publicReplyEnabled: true,
    publicReplyMessage: "Check your DMs 🔥❤️",
    requireFollow: true,
  },
  {
    id: "camp_wayulomi",
    name: "WAYULOMI VISUALS & AUDIO",
    keywords: ["WAYULOMI", "WAYU"],
    wholeWordMatch: true,
    dmMessage:
      "Yo! 🚀 Here is the official smart link for WAYULOMI.\n\nStream audio & watch official visuals here:\nhttps://v3njamusic.web.app/wayulomi\n\nDrop a comment on YouTube telling me your favourite line! 🔥",
    publicReplyEnabled: true,
    publicReplyMessage: "Sent you the vibe! 🎶",
    requireFollow: false,
  },
  {
    id: "camp_zanga",
    name: "ZANGA VIRAL REEL",
    keywords: ["ZANGA"],
    wholeWordMatch: true,
    dmMessage:
      "⚡ ZANGA is out now! Stream it on all platforms via official smart link:\nhttps://v3njamusic.web.app/zanga\n\nAppreciate the love fam! ❤️",
    publicReplyEnabled: true,
    publicReplyMessage: "In your inbox now! ⚡",
    requireFollow: false,
  },
  {
    id: "camp_moto",
    name: "MOTO RELEASE DROP",
    keywords: ["MOTO", "FIRE"],
    wholeWordMatch: true,
    dmMessage:
      "🔥 MOTO is live!\n\nOfficial smart link to all platforms:\nhttps://v3njamusic.web.app/moto\n\nTurn the volume all the way up! 🎧",
    publicReplyEnabled: true,
    publicReplyMessage: "Check DM! 🔥",
    requireFollow: false,
  },
  {
    id: "camp_merch",
    name: "EXCLUSIVE V3NJA MERCH DROP",
    keywords: ["MERCH", "TEE", "HOODIE", "CAP"],
    wholeWordMatch: true,
    dmMessage:
      "Yo fam! Exclusive V3NJA Merch & Tees are live.\n\n🛒 Store: https://v3njamusic.web.app/merch\nUse discount code **V3NJA10** for 10% off your entire order!\n\nLimited stock worldwide.",
    publicReplyEnabled: true,
    publicReplyMessage: "DMed you the drop link 👕",
    requireFollow: false,
  },
  {
    id: "camp_vip",
    name: "V3NJA WRLD VIP / INNER CIRCLE",
    keywords: ["FAN", "JOIN", "V3NJA", "WRLD", "VIP"],
    wholeWordMatch: true,
    dmMessage:
      "Welcome to V3NJA WRLD VIP! 🌍❤️\n\nYou are now in the inner circle. Access official music hub & secret drops:\nhttps://v3njamusic.web.app\n\nStay locked in right here on Instagram!",
    publicReplyEnabled: true,
    publicReplyMessage: "Welcome to the family ❤️",
    requireFollow: false,
  },
];

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

    // 1. Load automations from DB or fallback
    let automations = HARDCODED_CAMPAIGNS;
    try {
      const dbAutomations = await prisma.automation.findMany({
        where: { isActive: true },
      });
      if (dbAutomations && dbAutomations.length > 0) {
        automations = dbAutomations as any;
      }
    } catch (e) {
      console.warn("[Webhook] Using embedded active campaigns fallback");
    }

    // 2. Process Inbound Comments
    for (const event of commentEvents) {
      const { commentId, commentText, commenterName, commenterId, instagramAccountId } = event;

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
        const targetAccountId = instagramAccountId || "17841450944703637";
        const dmUrl = `https://graph.facebook.com/v22.0/${targetAccountId}/messages`;
        
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
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("[Webhook Error]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 200 });
  }
}
