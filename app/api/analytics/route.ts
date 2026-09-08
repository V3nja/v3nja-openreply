import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getCurrentWorkspaceContext } from "@/lib/workspace-access";

export const dynamic = "force-dynamic";

function rangeStart(days: number, now: Date) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return start;
}

export async function GET(request: NextRequest) {
  const context = await getCurrentWorkspaceContext();
  if (!context) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const rawDays = Number(request.nextUrl.searchParams.get("days") ?? "30");
  const days = rawDays === 7 || rawDays === 90 ? rawDays : 30;
  const now = new Date();
  const start = rangeStart(days, now);

  try {
    const [logs, clicks, campaigns, fans] = await Promise.all([
      prisma.dmLog.findMany({
        where: { workspaceId: context.workspaceId, createdAt: { gte: start } },
        select: {
          automationId: true,
          status: true,
          matchedKeyword: true,
          commenterId: true,
          createdAt: true,
          dmSentAt: true,
          automation: { select: { name: true } },
        },
      }),
      prisma.linkClick.findMany({
        where: { workspaceId: context.workspaceId, createdAt: { gte: start } },
        select: { automationId: true, createdAt: true },
      }),
      prisma.automation.findMany({
        where: { workspaceId: context.workspaceId },
        select: { id: true, name: true, isActive: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint AS count
        FROM "Fan"
        WHERE "workspaceId" = ${context.workspaceId}
      `,
    ]);

    const sent = logs.filter((row) => row.status === "SENT");
    const failed = logs.filter((row) => row.status === "FAILED");
    const skipped = logs.filter((row) => row.status.startsWith("SKIPPED_"));
    const uniqueContacts = new Set(logs.map((row) => row.commenterId)).size;
    const clickCount = clicks.length;

    const dailyMap = new Map<string, { sent: number; clicks: number }>();
    for (let i = 0; i < days; i += 1) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      dailyMap.set(day.toISOString().slice(0, 10), { sent: 0, clicks: 0 });
    }

    for (const row of sent) {
      const key = row.dmSentAt?.toISOString().slice(0, 10) ?? row.createdAt.toISOString().slice(0, 10);
      const bucket = dailyMap.get(key);
      if (bucket) bucket.sent += 1;
    }
    for (const row of clicks) {
      const bucket = dailyMap.get(row.createdAt.toISOString().slice(0, 10));
      if (bucket) bucket.clicks += 1;
    }

    const campaignMap = new Map<string, {
      id: string;
      name: string;
      sent: number;
      failed: number;
      skipped: number;
      clicks: number;
      contacts: Set<string>;
      keywords: Map<string, number>;
    }>();

    for (const campaign of campaigns) {
      campaignMap.set(campaign.id, {
        id: campaign.id,
        name: campaign.name,
        sent: 0,
        failed: 0,
        skipped: 0,
        clicks: 0,
        contacts: new Set(),
        keywords: new Map(),
      });
    }

    for (const row of logs) {
      const campaign = campaignMap.get(row.automationId);
      if (!campaign) continue;
      campaign.contacts.add(row.commenterId);
      if (row.status === "SENT") campaign.sent += 1;
      else if (row.status === "FAILED") campaign.failed += 1;
      else if (row.status.startsWith("SKIPPED_")) campaign.skipped += 1;
      if (row.matchedKeyword) {
        campaign.keywords.set(row.matchedKeyword, (campaign.keywords.get(row.matchedKeyword) ?? 0) + 1);
      }
    }
    for (const row of clicks) {
      const campaign = campaignMap.get(row.automationId);
      if (campaign) campaign.clicks += 1;
    }

    const topKeywords = new Map<string, number>();
    for (const row of logs) {
      if (!row.matchedKeyword) continue;
      topKeywords.set(row.matchedKeyword, (topKeywords.get(row.matchedKeyword) ?? 0) + 1);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          days,
          range: { start: start.toISOString(), end: now.toISOString() },
          overview: {
            dmsSent: sent.length,
            clicks: clickCount,
            ctr: sent.length ? Number(((clickCount / sent.length) * 100).toFixed(1)) : 0,
            failed: failed.length,
            skipped: skipped.length,
            uniqueContacts,
            totalFans: Number(fans[0]?.count ?? 0n),
            activeCampaigns: campaigns.filter((campaign) => campaign.isActive).length,
          },
          daily: [...dailyMap.entries()].map(([date, values]) => ({ date, ...values })),
          campaigns: [...campaignMap.values()]
            .map((campaign) => ({
              id: campaign.id,
              name: campaign.name,
              sent: campaign.sent,
              failed: campaign.failed,
              skipped: campaign.skipped,
              clicks: campaign.clicks,
              contacts: campaign.contacts.size,
              ctr: campaign.sent ? Number(((campaign.clicks / campaign.sent) * 100).toFixed(1)) : 0,
              topKeywords: [...campaign.keywords.entries()]
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([keyword, count]) => ({ keyword, count })),
            }))
            .sort((a, b) => b.sent - a.sent),
          topKeywords: [...topKeywords.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([keyword, count]) => ({ keyword, count })),
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("[Analytics API Error]", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ success: false, error: "Failed to load analytics" }, { status: 500 });
  }
}
