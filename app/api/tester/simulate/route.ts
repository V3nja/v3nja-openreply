import { NextRequest, NextResponse } from "next/server";
import { getCurrentWorkspaceId } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { matchKeywords } from "@/lib/utils/keyword-matcher";

export async function POST(request: NextRequest) {
  try {
    const workspaceId = (await getCurrentWorkspaceId()) || "cmtsgdm010001wmnzbs3o4dx2";

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

    // Find active automations in this workspace
    const automations = await prisma.automation.findMany({
      where: {
        workspaceId,
        isActive: true,
      },
      include: {
        instagramAccount: true,
        trackedLinks: true,
      },
    });

    let matchedAutomation = null;
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

    // Determine public reply variation
    let publicReply = matchedAutomation.publicReplyMessage;
    if (
      matchedAutomation.publicReplyMessages &&
      matchedAutomation.publicReplyMessages.length > 0
    ) {
      const randomIndex = Math.floor(
        Math.random() * matchedAutomation.publicReplyMessages.length
      );
      publicReply = matchedAutomation.publicReplyMessages[randomIndex];
    }

    // Follow-gating logic
    const requiresFollowGate = matchedAutomation.requireFollow && !isFollowing;

    let dmMessageToSend = matchedAutomation.dmMessage;
    let buttonLabelToSend = matchedAutomation.linkButtonLabel;
    let isFollowGatedPrompt = false;

    if (requiresFollowGate) {
      isFollowGatedPrompt = true;
      dmMessageToSend =
        matchedAutomation.followPromptMessage ||
        `Yo @${commenterName.replace(/^@/, "")}! 🔥 Thanks for showing love on the track. To unlock the exclusive smart link, make sure you hit Follow on @v3nja2.0!`;
      buttonLabelToSend =
        matchedAutomation.followPromptButtonLabel || "✅ I Follow @v3nja2.0 — Unlock Link";
    }

    // Create DmLog in DB
    const log = await prisma.dmLog.create({
      data: {
        workspaceId,
        automationId: matchedAutomation.id,
        instagramAccountId: matchedAutomation.instagramAccountId,
        commenterId: `sim_${Date.now()}`,
        commenterName: commenterName.replace(/^@/, ""),
        commentText: commentText,
        commentId: `sim_comment_${Date.now()}`,
        matchedKeyword: matchedKeyword || matchedAutomation.keywords[0],
        status: "SENT",
        attempts: 1,
        dmSentAt: new Date(),
        publicReplySentAt:
          triggerType === "COMMENT" && matchedAutomation.publicReplyEnabled
            ? new Date()
            : null,
      },
    });

    return NextResponse.json({
      success: true,
      matched: true,
      triggerType,
      isFollowing,
      isFollowGatedPrompt,
      campaign: {
        id: matchedAutomation.id,
        name: matchedAutomation.name,
        goal: matchedAutomation.goal,
        matchedKeyword,
        requireFollow: matchedAutomation.requireFollow,
        followUpEnabled: matchedAutomation.followUpEnabled,
        followUpMessage: matchedAutomation.followUpMessage,
      },
      publicReply:
        triggerType === "COMMENT" && matchedAutomation.publicReplyEnabled
          ? publicReply
          : null,
      dmMessage: dmMessageToSend,
      linkButtonLabel: buttonLabelToSend,
      fullDmMessageUnlocked: matchedAutomation.dmMessage,
      fullLinkButtonLabelUnlocked: matchedAutomation.linkButtonLabel,
      logId: log.id,
      timestamp: log.createdAt,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
