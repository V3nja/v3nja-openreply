import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getCurrentUserId, getCurrentWorkspaceId } from "@/lib/auth";

export const dynamic = "force-dynamic";

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function GET() {
  try {
    const [userId, workspaceId] = await Promise.all([
      getCurrentUserId(),
      getCurrentWorkspaceId(),
    ]);

    if (!userId || !workspaceId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const [
      user,
      instagramAccounts,
      activeAutomations,
      monthLogs,
      sevenDayLogs,
      recentLogs,
      topKeywordGroups,
      clickCount,
    ] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
      prisma.instagramAccount.findMany({
        where: { workspaceId },
        select: { id: true, instagramId: true, username: true, name: true, webhookSubscribed: true },
        orderBy: { connectedAt: "asc" },
      }),
      prisma.automation.count({ where: { workspaceId, isActive: true } }),
      prisma.dmLog.findMany({
        where: { workspaceId, createdAt: { gte: monthStart } },
        select: { status: true, commenterId: true },
      }),
      prisma.dmLog.findMany({
        where: { workspaceId, createdAt: { gte: sevenDaysAgo } },
        select: { status: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.dmLog.findMany({
        where: { workspaceId },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          commenterName: true,
          commenterId: true,
          commentText: true,
          status: true,
          createdAt: true,
          automation: { select: { id: true, name: true } },
          instagramAccount: { select: { username: true } },
        },
      }),
      prisma.dmLog.groupBy({
        by: ["matchedKeyword"],
        where: {
          workspaceId,
          matchedKeyword: { not: null },
          createdAt: { gte: monthStart },
        },
        _count: { matchedKeyword: true },
        orderBy: { _count: { matchedKeyword: "desc" } },
        take: 8,
      }),
      prisma.linkClick.count({ where: { workspaceId, createdAt: { gte: monthStart } } }),
    ]);

    const sent = monthLogs.filter((log) => log.status === "SENT").length;
    const skipped = monthLogs.filter((log) => log.status.startsWith("SKIPPED_")).length;
    const failed = monthLogs.filter((log) => log.status === "FAILED").length;
    const contactsCount = new Set(monthLogs.map((log) => log.commenterId)).size;
    const ctr = sent > 0 ? Number(((clickCount / sent) * 100).toFixed(1)) : 0;

    const dailyMap = new Map<string, number>();
    for (let i = 0; i < 7; i += 1) {
      const day = new Date(sevenDaysAgo);
      day.setDate(sevenDaysAgo.getDate() + i);
      dailyMap.set(dateKey(day), 0);
    }
    for (const log of sevenDayLogs) {
      if (log.status !== "SENT") continue;
      const key = dateKey(log.createdAt);
      if (dailyMap.has(key)) dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
    }

    const dailyDMs = [...dailyMap.entries()].map(([iso, count]) => ({
      date: new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { weekday: "short" }),
      count,
    }));

    const firstName = user?.name?.trim()?.split(/\s+/)[0] || user?.email?.split("@")[0] || "V3NJA";
    const primaryAccount = instagramAccounts[0];

    return NextResponse.json(
      {
        success: true,
        data: {
          userName: firstName,
          activeAutomations,
          dmsSentMonth: sent,
          dmsSkippedMonth: skipped,
          dmsFailedMonth: failed,
          clicksThisMonth: clickCount,
          contactsCount,
          ctrThisMonth: ctr,
          dailyDMs,
          topKeywords: topKeywordGroups
            .filter((row) => row.matchedKeyword)
            .map((row) => ({ keyword: row.matchedKeyword as string, count: row._count.matchedKeyword })),
          recentLogs,
          instagramAccounts,
          connection: {
            username: primaryAccount?.username ?? null,
            connected: instagramAccounts.length > 0,
            webhookSubscribed: instagramAccounts.some((account) => account.webhookSubscribed),
          },
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[Dashboard Stats Error]", err instanceof Error ? err.message : "unknown error");
    return NextResponse.json(
      { success: false, error: "Failed to load dashboard statistics" },
      { status: 500 }
    );
  }
}
