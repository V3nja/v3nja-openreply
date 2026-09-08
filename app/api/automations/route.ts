import { NextRequest, NextResponse } from "next/server";
import { LiveDataStore } from "@/lib/db/live-store";
import { prisma } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const accountId = request.nextUrl.searchParams.get("instagramAccountId");
    let automations = LiveDataStore.getCampaigns();

    if (accountId && accountId !== "all") {
      automations = automations.filter((a) => a.instagramAccountId === accountId);
    }

    return NextResponse.json(
      {
        success: true,
        data: automations,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    console.error("[Automations GET Error]:", err);
    return NextResponse.json({ success: true, data: LiveDataStore.getCampaigns() });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newCampaign = LiveDataStore.saveCampaign({
      name: body.name || "Untitled Campaign",
      goal: body.goal || null,
      postId: body.postId || null,
      postUrl: body.postUrl || null,
      pendingNextReel: Boolean(body.pendingNextReel),
      matchAnyPost: Boolean(body.matchAnyPost),
      keywords: Array.isArray(body.keywords) ? body.keywords : ["MUSIC"],
      matchAnyWord: Boolean(body.matchAnyWord),
      dmTriggerEnabled: Boolean(body.dmTriggerEnabled),
      dmMessage: body.dmMessage || "Thanks for commenting! Here is the link:",
      openingDmEnabled: Boolean(body.openingDmEnabled),
      openingDmMessage: body.openingDmMessage || null,
      openingDmButtonLabel: body.openingDmButtonLabel || null,
      linkButtonLabel: body.linkButtonLabel || "Open link",
      requireFollow: Boolean(body.requireFollow),
      followPromptMessage: body.followPromptMessage || null,
      followPromptButtonLabel: body.followPromptButtonLabel || null,
      followUpEnabled: Boolean(body.followUpEnabled),
      followUpMessage: body.followUpMessage || null,
      followUpDelayMinutes: Number(body.followUpDelayMinutes) || 0,
      publicReplyEnabled: Boolean(body.publicReplyEnabled),
      publicReplyMessages: Array.isArray(body.publicReplyMessages) && body.publicReplyMessages.length > 0
        ? body.publicReplyMessages
        : ["Check your DMs @{username} 🔥"],
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      wholeWordMatch: body.wholeWordMatch !== undefined ? Boolean(body.wholeWordMatch) : true,
      trackedLinks: body.trackedDestinationUrl
        ? [
            {
              id: `tl_${Date.now()}`,
              slug: `link-${Date.now()}`,
              label: body.linkButtonLabel || "Open link",
              destinationUrl: body.trackedDestinationUrl,
              trackedUrl: body.trackedDestinationUrl,
              _count: { clicks: 0 },
            },
          ]
        : [],
    });

    // Attempt Prisma database create in background
    try {
      prisma.automation
        .create({
          data: {
            workspaceId: "cmtsgdm010001wmnzbs3o4dx2",
            instagramAccountId: "acc_v3nja",
            name: newCampaign.name,
            goal: newCampaign.goal,
            postId: newCampaign.postId,
            postUrl: newCampaign.postUrl,
            pendingNextReel: newCampaign.pendingNextReel,
            matchAnyPost: newCampaign.matchAnyPost,
            keywords: newCampaign.keywords,
            matchAnyWord: newCampaign.matchAnyWord,
            dmTriggerEnabled: newCampaign.dmTriggerEnabled,
            dmMessage: newCampaign.dmMessage,
            openingDmEnabled: newCampaign.openingDmEnabled,
            openingDmMessage: newCampaign.openingDmMessage,
            openingDmButtonLabel: newCampaign.openingDmButtonLabel,
            linkButtonLabel: newCampaign.linkButtonLabel,
            requireFollow: newCampaign.requireFollow,
            followPromptMessage: newCampaign.followPromptMessage,
            followPromptButtonLabel: newCampaign.followPromptButtonLabel,
            followUpEnabled: newCampaign.followUpEnabled,
            followUpMessage: newCampaign.followUpMessage,
            followUpDelayMinutes: newCampaign.followUpDelayMinutes,
            publicReplyEnabled: newCampaign.publicReplyEnabled,
            publicReplyMessages: newCampaign.publicReplyMessages,
            isActive: newCampaign.isActive,
            wholeWordMatch: newCampaign.wholeWordMatch,
          },
        })
        .catch((e) => console.warn("[Prisma Automation Create Warning]:", e.message));
    } catch {}

    return NextResponse.json({ success: true, data: newCampaign });
  } catch (err: any) {
    console.error("[Automations POST Error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create campaign" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    if (body.isActive !== undefined) {
      LiveDataStore.toggleCampaign(id, body.isActive);
    } else {
      LiveDataStore.saveCampaign({ id, ...body });
    }

    return NextResponse.json({ success: true, data: LiveDataStore.getCampaignById(id) });
  } catch (err: any) {
    console.error("[Automations PATCH Error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update campaign" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    LiveDataStore.deleteCampaign(id);
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (err: any) {
    console.error("[Automations DELETE Error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete campaign" },
      { status: 500 }
    );
  }
}
