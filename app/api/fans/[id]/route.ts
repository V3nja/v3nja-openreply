import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getCurrentWorkspaceId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const fan = await prisma.$queryRaw<{
      id: string;
      instagramUserId: string;
      username: string | null;
      firstName: string | null;
      tags: string[];
      interactionCount: number;
      lastInteractionAt: Date;
      createdAt: Date;
    }[]>`
      SELECT "id", "instagramUserId", "username", "firstName", "tags", "interactionCount", "lastInteractionAt", "createdAt"
      FROM "Fan"
      WHERE "id" = ${id} AND "workspaceId" = ${workspaceId}
      LIMIT 1;
    `;

    if (!fan[0]) {
      return NextResponse.json({ success: false, error: "Fan not found" }, { status: 404 });
    }

    const interactions = await prisma.dmLog.findMany({
      where: {
        workspaceId,
        commenterId: fan[0].instagramUserId,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        commentId: true,
        commentText: true,
        matchedKeyword: true,
        status: true,
        attempts: true,
        dmSentAt: true,
        publicReplySentAt: true,
        errorMessage: true,
        createdAt: true,
        automation: { select: { id: true, name: true, goal: true } },
      },
    });

    const attribution = await prisma.dmLog.groupBy({
      by: ["automationId"],
      where: { workspaceId, commenterId: fan[0].instagramUserId },
      _count: { _all: true },
    });

    const campaignIds = attribution.map((item) => item.automationId);
    const campaigns = campaignIds.length
      ? await prisma.automation.findMany({
          where: { workspaceId, id: { in: campaignIds } },
          select: { id: true, name: true, goal: true, isActive: true },
        })
      : [];

    const countById = new Map(attribution.map((item) => [item.automationId, item._count._all]));

    return NextResponse.json(
      {
        success: true,
        data: {
          fan: {
            ...fan[0],
            lastInteractionAt: fan[0].lastInteractionAt.toISOString(),
            createdAt: fan[0].createdAt.toISOString(),
          },
          interactions: interactions.map((item) => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
            dmSentAt: item.dmSentAt?.toISOString() ?? null,
            publicReplySentAt: item.publicReplySentAt?.toISOString() ?? null,
          })),
          campaigns: campaigns
            .map((campaign) => ({ ...campaign, interactions: countById.get(campaign.id) ?? 0 }))
            .sort((a, b) => b.interactions - a.interactions),
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("[Fan Profile API Error]", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ success: false, error: "Failed to load fan profile" }, { status: 500 });
  }
}
