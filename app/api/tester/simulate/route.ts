import { NextRequest, NextResponse } from "next/server";
import { LiveDataStore } from "@/lib/db/live-store";
import { matchKeywords } from "@/lib/utils/keyword-matcher";
import { generateAntiSpamPublicReply } from "@/lib/utils/anti-spam-reply";
import { formatBrandedArtistDM } from "@/lib/utils/artist-dm";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      commentText,
      commenterName = "music_fan_265",
      isFollowing = true,
      triggerType = "COMMENT", // "COMMENT", "STORY_REPLY", "STORY_MENTION"
      mediaTitle,
    } = body;

    if (!commentText) {
      return NextResponse.json({ success: false, error: "Comment text is required" }, { status: 400 });
    }

    const automations = LiveDataStore.getCampaigns().filter((a) => a.isActive);

    let matchedAutomation: any = null;
    let matchedKeyword: string | null = null;

    for (const auto of automations) {
      const matchRes = matchKeywords(commentText, auto.keywords, auto.wholeWordMatch);
      if (matchRes.matched) {
        matchedAutomation = auto;
        matchedKeyword = matchRes.matchedKeyword;
        break;
      }
    }

    if (!matchedAutomation) {
      return NextResponse.json({
        success: true,
        matched: false,
        message: "No active automation matched this keyword.",
        availableCampaigns: automations.map((a) => ({
          name: a.name,
          keywords: a.keywords,
        })),
      });
    }

    // Determine anti-spam randomized public reply
    let publicReply: string | null = null;
    if (matchedAutomation.publicReplyEnabled) {
      publicReply = generateAntiSpamPublicReply(
        matchedAutomation.publicReplyMessages,
        matchedAutomation.publicReplyMessage,
        commenterName
      );
    }

    // Follow-gating logic
    const requiresFollowGate = matchedAutomation.requireFollow && !isFollowing;

    const primaryLink = matchedAutomation.trackedLinks?.[0]?.destinationUrl || "https://v3njamusic.web.app";
    const brandedDmMessage = formatBrandedArtistDM({
      rawMessage: matchedAutomation.dmMessage,
      commenterName,
      campaignTitle: matchedAutomation.name,
      smartLinkUrl: primaryLink,
      followGated: requiresFollowGate,
      followPrompt: matchedAutomation.followPromptMessage || "Please follow @v3nja2.0 on Instagram to unlock this link!",
    });

    const fullDmMessageUnlocked = formatBrandedArtistDM({
      rawMessage: matchedAutomation.dmMessage,
      commenterName,
      campaignTitle: matchedAutomation.name,
      smartLinkUrl: primaryLink,
      followGated: false,
    });

    // Record live event in Data Store
    const newLog = LiveDataStore.recordDmEvent({
      commenterId: `sim_${Date.now()}`,
      commenterName,
      commentText,
      commentId: `sim_comment_${Date.now()}`,
      matchedKeyword: matchedKeyword || matchedAutomation.keywords[0],
      automationId: matchedAutomation.id,
      automationName: matchedAutomation.name,
      automationKeywords: matchedAutomation.keywords,
      status: "SENT",
      publicReplyText: triggerType === "COMMENT" ? publicReply : null,
    });

    return NextResponse.json({
      success: true,
      matched: true,
      triggerType,
      isFollowing,
      isFollowGatedPrompt: requiresFollowGate,
      campaign: {
        id: matchedAutomation.id,
        name: matchedAutomation.name,
        goal: matchedAutomation.goal,
        matchedKeyword,
        requireFollow: matchedAutomation.requireFollow,
        followUpEnabled: matchedAutomation.followUpEnabled,
        followUpMessage: matchedAutomation.followUpMessage,
      },
      publicReply: triggerType === "COMMENT" ? publicReply : null,
      dmMessage: brandedDmMessage,
      linkButtonLabel: requiresFollowGate
        ? matchedAutomation.followPromptButtonLabel || "✅ I Follow @v3nja2.0 — Unlock Link"
        : matchedAutomation.linkButtonLabel || "Stream Track 🎧",
      fullDmMessageUnlocked,
      fullLinkButtonLabelUnlocked: matchedAutomation.linkButtonLabel || "Stream Track 🎧",
      logId: newLog.id,
      timestamp: newLog.createdAt,
    });
  } catch (err: any) {
    console.error("[Tester Simulate Error]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
