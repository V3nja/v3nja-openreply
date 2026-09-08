import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getCurrentWorkspaceContext } from "@/lib/workspace-access";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ instagramUserId: string }> }
) {
  const context = await getCurrentWorkspaceContext();
  if (!context) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { instagramUserId } = await params;
    const accountId = request.nextUrl.searchParams.get("instagramAccountId");

    if (!instagramUserId.trim()) {
      return NextResponse.json({ success: false, error: "Instagram user ID is required" }, { status: 400 });
    }

    const fan = await prisma.$queryRaw<{
      id: string;
      instagramUserId: string;
      username: string | null;
      firstName: string | null;
      tags: string[];
      interactionCount: number;
      lastInteractionAt: Date;
    }[]>`
      SELECT "id", "instagramUserId", "username", "firstName", "tags", "interactionCount", "lastInteractionAt"
      FROM "Fan"
      WHERE "workspaceId" = ${context.workspaceId}
        AND "instagramUserId" = ${instagramUserId}
        ${accountId ? prisma.$queryRaw`AND "instagramAccountId" = ${accountId}` : prisma.$queryRaw``}
      ORDER BY "lastInteractionAt" DESC
      LIMIT 1;
    `;

    if (!fan[0]) {
      return NextResponse.json({ success: true, data: null }, { headers: { "Cache-Control": "no-store" } });
    }

    const profile = fan[0];
    const interactions = await prisma.dmLog.findMany({
      where: { workspaceId: context.workspaceId, commenterId: instagramUserId },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        commentId: true,
        commentText: true,
        matchedKeyword: true,
        status: true,
        createdAt: true,
        automation: { select: { id: true, name: true } },
      },
    });

    const campaignGroups = await prisma.dmLog.groupBy({
      by: ["automationId"],
      where: { workspaceId: context.workspaceId, commenterId: instagramUserId },
      _count: { _all: true },
    });
    const campaignIds = campaignGroups.map((item) => item.automationId);
    const campaigns = campaignIds.length
      ? await prisma.automation.findMany({
          where: { workspaceId: context.workspaceId, id: { in: campaignIds } },
          select: { id: true, name: true, isActive: true },
        })
      : [];
    const counts = new Map(campaignGroups.map((item) => [item.automationId, item._count._all]));

    return NextResponse.json(
      {
        success: true,
        data: {
          fan: {
            ...profile,
            lastInteractionAt: profile.lastInteractionAt.toISOString(),
          },
          interactions: interactions.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() })),
          campaigns: campaigns.map((campaign) => ({ ...campaign, interactions: counts.get(campaign.id) ?? 0 })).sort((a, b) => b.interactions - a.interactions),
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("[Fan Lookup Error]", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ success: false, error: "Failed to load fan context" }, { status: 500 });
  }
}
