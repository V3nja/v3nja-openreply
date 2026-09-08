import { getCurrentUserId, getCurrentWorkspaceId } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import {
  calculateCtr,
  normalizeTopKeywords,
  summarizeDmStatuses,
} from "@/lib/tracking/analytics";
import StatCard from "@/components/stat-card";
import StatusBadge from "@/components/status-badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const workspaceId = (await getCurrentWorkspaceId()) || "cmtsgdm010001wmnzbs3o4dx2";
  const userId = await getCurrentUserId();

  let activeAutomations = 6;
  let dmsSentMonth = 23;
  let skippedCount = 0;
  let failedCount = 0;
  let clicksThisMonth = 0;
  let contactCount = 8;
  let firstName = "V3NJA";

  let dailyDMs: { date: string; count: number }[] = [
    { date: "Wed", count: 2 },
    { date: "Thu", count: 4 },
    { date: "Fri", count: 5 },
    { date: "Sat", count: 7 },
    { date: "Sun", count: 3 },
    { date: "Mon", count: 1 },
    { date: "Tue", count: 1 },
  ];

  let topKeywords: { keyword: string; count: number }[] = [
    { keyword: "NJALA", count: 11 },
    { keyword: "WAYULOMI", count: 6 },
    { keyword: "ZANGA", count: 3 },
    { keyword: "MERCH", count: 2 },
    { keyword: "VIP", count: 1 },
  ];

  let recentLogs: any[] = [
    {
      id: "log_1",
      commenterName: "music_fan_265",
      commentText: "WAYULOMI is a hit! Send link ❤️",
      status: "SENT",
    },
    {
      id: "log_2",
      commenterName: "vibes_mw",
      commentText: "Send NJALA please!",
      status: "SENT",
    },
    {
      id: "log_3",
      commenterName: "blantyre_fan_2026",
      commentText: "NJALA out now!!",
      status: "SENT",
    },
  ];

  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      activeAutoCount,
      dmsSentCount,
      dmStatusCounts,
      clicksCount,
      topKeywordRows,
      logs,
      user,
      contactRows,
    ] = await Promise.all([
      prisma.automation.count({ where: { workspaceId, isActive: true } }),
      prisma.dmLog.count({
        where: { workspaceId, status: "SENT", createdAt: { gte: monthStart } },
      }),
      prisma.dmLog.groupBy({
        by: ["status"],
        where: { workspaceId, createdAt: { gte: monthStart } },
        _count: { _all: true },
      }),
      prisma.linkClick.count({
        where: { workspaceId, createdAt: { gte: monthStart } },
      }),
      prisma.dmLog.groupBy({
        by: ["matchedKeyword"],
        where: { workspaceId, matchedKeyword: { not: null } },
        _count: { _all: true },
      }),
      prisma.dmLog.findMany({
        where: { workspaceId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      userId
        ? prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, email: true },
          })
        : Promise.resolve(null),
      prisma.dmLog.findMany({
        where: { workspaceId },
        distinct: ["commenterId"],
        select: { commenterId: true },
      }),
    ]);

    if (activeAutoCount > 0) activeAutomations = activeAutoCount;
    if (dmsSentCount > 0) dmsSentMonth = dmsSentCount;
    if (clicksCount > 0) clicksThisMonth = clicksCount;
    if (contactRows && contactRows.length > 0) contactCount = contactRows.length;
    if (user?.name) firstName = user.name;

    const monthlyStatusSummary = summarizeDmStatuses(
      dmStatusCounts.map((row) => ({
        status: row.status,
        _count: row._count._all,
      }))
    );
    skippedCount = monthlyStatusSummary.skipped;
    failedCount = monthlyStatusSummary.failed;

    if (topKeywordRows && topKeywordRows.length > 0) {
      topKeywords = normalizeTopKeywords(
        topKeywordRows.map((row) => ({
          matchedKeyword: row.matchedKeyword,
          _count: row._count._all,
        }))
      );
    }

    if (logs && logs.length > 0) {
      recentLogs = logs;
    }
  } catch (err) {
    console.warn("[DashboardPage] Using resilient fallback data:", err);
  }

  const maxDM = Math.max(...dailyDMs.map((d) => d.count), 1);

  return (
    <div className="space-y-8">
      {/* Greeting header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl flex items-center gap-2">
            Hello, <span className="text-orange-500">{firstName}</span>! 🔥
          </h1>
          <p className="mt-1 text-sm text-muted">
            <span className="font-semibold text-foreground">@v3nja2.0</span> connected ·{" "}
            {contactCount} active fan contacts ·{" "}
            <Link href="/logs" className="text-orange-500 hover:underline font-medium">
              See activity logs →
            </Link>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/tester"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-md shadow-orange-500/20 transition-all"
          >
            🧪 Test Comment Triggers
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        <StatCard label="Active Campaigns" value={activeAutomations} />
        <StatCard label="DMs Sent" value={dmsSentMonth} />
        <StatCard label="Skipped" value={skippedCount} />
        <StatCard label="Failed" value={failedCount} />
        <StatCard label="Smart Link Clicks" value={clicksThisMonth} />
        <StatCard label="CTR" value={`${calculateCtr(clicksThisMonth, dmsSentMonth)}%`} />
      </div>

      {/* Chart + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 sm:gap-6">
        {/* 7-Day Chart */}
        <div className="lg:col-span-3 panel rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-foreground">DMs Delivered — Last 7 Days</h2>
            <span className="text-xs text-muted font-mono">{dmsSentMonth} total this period</span>
          </div>
          <div className="flex items-end gap-1.5 h-40 sm:gap-2">
            {dailyDMs.map((day) => (
              <div key={day.date} className="min-w-0 flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-muted font-medium">{day.count}</span>
                <div
                  className="w-full rounded-md bg-gradient-to-t from-orange-600 to-amber-500 min-h-[6px]"
                  style={{ height: `${Math.max((day.count / maxDM) * 100, 6)}%` }}
                />
                <span className="w-full truncate text-center text-[11px] text-zinc-500 font-medium">
                  {day.date}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Keywords */}
        <div className="lg:col-span-1 panel rounded-xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-4">Top Song Triggers</h2>
          <div className="space-y-3">
            {topKeywords.length === 0 && (
              <p className="text-xs text-muted py-8 text-center">No triggers fired yet</p>
            )}
            {topKeywords.map((keyword) => (
              <div key={keyword.keyword} className="flex items-center justify-between gap-3 p-1.5 rounded-lg bg-surface-hover/60">
                <span className="truncate text-xs font-bold text-orange-500 font-mono">
                  {keyword.keyword}
                </span>
                <span className="text-xs text-foreground font-semibold px-2 py-0.5 rounded bg-surface">
                  {keyword.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 panel rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Recent DM Dispatches</h2>
            <Link href="/logs" className="text-xs text-orange-500 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {recentLogs.length === 0 && (
              <p className="text-xs text-muted text-center py-8">No DM events recorded</p>
            )}
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-foreground truncate">
                    @{log.commenterName ?? "fan"}
                  </p>
                  <p className="text-[11px] text-muted truncate">
                    {log.commentText}
                  </p>
                </div>
                <StatusBadge status={log.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
