import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getCurrentWorkspaceContext } from "@/lib/workspace-access";
import { evaluateAutomationRule } from "@/lib/automation/rules";
import { generateAntiSpamPublicReply } from "@/lib/utils/anti-spam-reply";
import { formatBrandedArtistDM } from "@/lib/utils/artist-dm";

export const dynamic = "force-dynamic";

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

export async function POST(request: NextRequest) {
  const context = await getCurrentWorkspaceContext();
  if (!context) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const commentText = text(body.commentText);
    const commenterName = text(body.commenterName, "music_fan_265");
    const isFollowing = body.isFollowing !== undefined ? Boolean(body.isFollowing) : true;
    const triggerType = text(body.triggerType, "COMMENT");
    const requestedAccountId = text(body.instagramAccountId);
    const mediaId = text(body.mediaId) || null;
    const originalMediaId = text(body.originalMediaId) || null;

    if (!commentText) {
      return NextResponse.json(
        { success: false, error: "Comment text is required" },
        { status: 400 }
      );
    }

    const account = requestedAccountId
      ? await prisma.instagramAccount.findFirst({
          where: { id: requestedAccountId, workspaceId: context.workspaceId },
          select: { id: true, instagramId: true, username: true },
        })
      : await prisma.instagramAccount.findFirst({
          where: { workspaceId: context.workspaceId },
          orderBy: { connectedAt: "asc" },
          select: { id: true, instagramId: true, username: true },
        });

    if (!account) {
      return NextResponse.json(
        { success: false, error: "Connect an Instagram account first" },
        { status: 400 }
      );
    }

    const automations = await prisma.automation.findMany({
      where: {
        workspaceId: context.workspaceId,
        instagramAccountId: account.id,
        isActive: true,
      },
      include: {
        trackedLinks: {
          orderBy: { createdAt: "asc" },
          select: { slug: true, destinationUrl: true, label: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    let matchedAutomation: (typeof automations)[number] | null = null;
    let matchedKeyword: string | null = null;
    let ruleReason: string | null = null;

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

      if (decision.matched) {
        matchedAutomation = automation;
        matchedKeyword = decision.matchedKeyword;
        ruleReason = decision.reason;
        break;
      }
    }

    if (!matchedAutomation) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        sent: false,
        persisted: false,
        matched: false,
        message: "No active automation matched the current Smart Rules.",
        availableCampaigns: automations.map((automation) => ({
          id: automation.id,
          name: automation.name,
          postId: automation.postId,
          matchAnyPost: automation.matchAnyPost,
          keywords: automation.keywords,
          matchAnyWord: automation.matchAnyWord,
        })),
      });
    }

    let publicReply: string | null = null;
    if (matchedAutomation.publicReplyEnabled) {
      publicReply = generateAntiSpamPublicReply(
        matchedAutomation.publicReplyMessages,
        matchedAutomation.publicReplyMessage,
        commenterName
      );
    }

    const requiresFollowGate = matchedAutomation.requireFollow && !isFollowing;
    const primaryLink =
      matchedAutomation.trackedLinks[0]?.destinationUrl ||
      "https://v3nja-official.web.app";

    const dmMessage = formatBrandedArtistDM({
      rawMessage: matchedAutomation.dmMessage,
      commenterName,
      campaignTitle: matchedAutomation.name,
      smartLinkUrl: primaryLink,
      followGated: requiresFollowGate,
      followPrompt:
        matchedAutomation.followPromptMessage ||
        "Please follow @v3nja2.0 on Instagram to unlock this link!",
    });

    const unlockedMessage = formatBrandedArtistDM({
      rawMessage: matchedAutomation.dmMessage,
      commenterName,
      campaignTitle: matchedAutomation.name,
      smartLinkUrl: primaryLink,
      followGated: false,
    });

    return NextResponse.json({
      success: true,
      dryRun: true,
      sent: false,
      persisted: false,
      triggerType,
      isFollowing,
      isFollowGatedPrompt: requiresFollowGate,
      ruleReason,
      account: {
        id: account.id,
        instagramId: account.instagramId,
        username: account.username,
      },
      campaign: {
        id: matchedAutomation.id,
        name: matchedAutomation.name,
        goal: matchedAutomation.goal,
        matchedKeyword,
        keywords: matchedAutomation.keywords,
        matchAnyWord: matchedAutomation.matchAnyWord,
        matchAnyPost: matchedAutomation.matchAnyPost,
        postId: matchedAutomation.postId,
        requireFollow: matchedAutomation.requireFollow,
        followUpEnabled: matchedAutomation.followUpEnabled,
        followUpMessage: matchedAutomation.followUpMessage,
      },
      publicReply: triggerType === "COMMENT" ? publicReply : null,
      dmMessage,
      linkButtonLabel: requiresFollowGate
        ? matchedAutomation.followPromptButtonLabel ||
          "✅ I Follow @v3nja2.0 — Unlock Link"
        : matchedAutomation.linkButtonLabel || "Stream Track 🎧",
      fullDmMessageUnlocked: unlockedMessage,
      fullLinkButtonLabelUnlocked:
        matchedAutomation.linkButtonLabel || "Stream Track 🎧",
      trackedLinks: matchedAutomation.trackedLinks,
    });
  } catch (error) {
    console.error(
      "[Tester Simulate Error]",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { success: false, error: "Simulation failed" },
      { status: 500 }
    );
  }
}
