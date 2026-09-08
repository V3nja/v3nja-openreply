import StatCard from "@/components/stat-card";
import StatusBadge from "@/components/status-badge";
import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { getCurrentUserId, getCurrentWorkspaceId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [userId, workspaceId] = await Promise.all([
    getCurrentUserId(),
    getCurrentWorkspaceId(),
  ]);

  if (!userId || !workspaceId) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <h1 className="text-xl font-black text-white">Session required</h1>
        <p className="mt-2 text-sm text-zinc-400">Sign in to view your V3NJA OpenReply command center.</p>
        <Link href="/login" className="v3nja-gold-button mt-5 inline-flex px-5 py-2.5 text-xs uppercase">
          Sign in
        </Link>
      </div>
    );
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const [
    user,
    account,
    activeAutomations,
    monthLogs,
    sevenDayLogs,
    recentLogs,
    topKeywordGroups,
    clicksThisMonth,
  ] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
    prisma.instagramAccount.findFirst({
      where: { workspaceId },
      select: { username: true, webhookSubscribed: true },
      orderBy: { connectedAt: "asc" },
    }),
    prisma.automation.count({ where: { workspaceId, isActive: true } }),
    prisma.dmLog.findMany({
      where: { workspaceId, createdAt: { gte: monthStart } },
      select: { status: true, commenterId: true },
    }),
    prisma.dmLog.findMany({
      where: { workspaceId, createdAt: { gte: sevenDaysAgo }, status: "SENT" },
      select: { createdAt: true },
    }),
    prisma.dmLog.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        commenterName: true,
        commentText: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.dmLog.groupBy({
      by: ["matchedKeyword"],
      where: { workspaceId, matchedKeyword: { not: null }, createdAt: { gte: monthStart } },
      _count: { matchedKeyword: true },
      orderBy: { _count: { matchedKeyword: "desc" } },
      take: 8,
    }),
    prisma.linkClick.count({ where: { workspaceId, createdAt: { gte: monthStart } } }),
  ]);

  const dmsSentMonth = monthLogs.filter((log) => log.status === "SENT").length;
  const skippedCount = monthLogs.filter((log) => log.status.startsWith("SKIPPED_")).length;
  const failedCount = monthLogs.filter((log) => log.status === "FAILED").length;
  const contactCount = new Set(monthLogs.map((log) => log.commenterId)).size;
  const ctr = dmsSentMonth > 0 ? Number(((clicksThisMonth / dmsSentMonth) * 100).toFixed(1)) : 0;

  const dailyMap = new Map<string, number>();
  for (let i = 0; i < 7; i += 1) {
    const day = new Date(sevenDaysAgo);
    day.setDate(day.getDate() + i);
    dailyMap.set(day.toISOString().slice(0, 10), 0);
  }
  for (const log of sevenDayLogs) {
    const key = log.createdAt.toISOString().slice(0, 10);
    if (dailyMap.has(key)) dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
  }

  const dailyDMs = [...dailyMap.entries()].map(([iso, count]) => ({
    date: new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { weekday: "short" }),
    count,
  }));
  const maxDM = Math.max(...dailyDMs.map((d) => d.count), 1);
  const firstName = user?.name?.trim()?.split(/\s+/)[0] || user?.email?.split("@")[0] || "V3NJA";
  const topKeywords = topKeywordGroups
    .filter((row) => row.matchedKeyword)
    .map((row) => ({ keyword: row.matchedKeyword as string, count: row._count.matchedKeyword }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl flex items-center gap-2">
            Hello, <span className="text-amber-400">{firstName}</span>! 🔥
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            <span className="font-semibold text-white">@{account?.username || "not connected"}</span>{" "}
            {account?.webhookSubscribed ? "connected · webhook subscribed · " : "connected · "}
            <span className="text-emerald-400 font-bold">{contactCount}</span>{" "}
            verified fan contact{contactCount === 1 ? "" : "s"} ·{" "}
            <Link href="/logs" className="text-amber-400 hover:underline font-medium">See activity logs →</Link>
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/tester" className="v3nja-gold-button inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-wider">
            <span>🧪</span><span>Test Comment Triggers</span>
          </Link>
          <Link href="/campaigns/new" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white font-semibold text-xs transition-all">
            + New Campaign
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        <StatCard label="Active Campaigns" value={activeAutomations} tabColor="pink" sublabel="LIVE" />
        <StatCard label="DMs Sent" value={dmsSentMonth} tabColor="green" sublabel="VERIFIED" />
        <StatCard label="Skipped" value={skippedCount} tabColor="orange" sublabel="DEDUP" />
        <StatCard label="Failed" value={failedCount} tabColor="blue" sublabel="ERROR" />
        <StatCard label="Smart Link Clicks" value={clicksThisMonth} tabColor="teal" sublabel="TRACKED" />
        <StatCard label="CTR" value={`${ctr}%`} tabColor="purple" sublabel="CONVERSION" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 sm:gap-6">
        <div className="lg:col-span-3 glass-card rounded-2xl p-4 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/[0.06]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">DMs Delivered — Last 7 Days</h2>
            <span className="text-xs text-amber-400 font-mono font-bold">{dmsSentMonth} total verified</span>
          </div>
          <div className="flex items-end gap-2 h-44 sm:gap-3">
            {dailyDMs.map((day) => (
              <div key={day.date} className="min-w-0 flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-zinc-400 font-mono font-bold">{day.count}</span>
                <div className="w-full rounded-lg bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-400 min-h-[6px] transition-all shadow-[0_0_12px_rgba(245,158,11,0.25)]" style={{ height: `${Math.max((day.count / maxDM) * 100, 8)}%` }} />
                <span className="w-full truncate text-center text-[11px] text-zinc-400 font-medium">{day.date}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 glass-card rounded-2xl p-4 sm:p-6 shadow-xl">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-4 pb-2 border-b border-white/[0.06]">Top Song Triggers</h2>
          <div className="space-y-2.5">
            {topKeywords.length === 0 && <p className="text-xs text-zinc-500 py-8 text-center">No triggers fired yet</p>}
            {topKeywords.map((keyword) => (
              <div key={keyword.keyword} className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="truncate text-xs font-bold text-amber-400 font-mono">{keyword.keyword}</span>
                <span className="text-xs text-white font-bold px-2 py-0.5 rounded-md bg-white/[0.06]">{keyword.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 glass-card rounded-2xl p-4 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.06]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Recent DM Dispatches</h2>
            <Link href="/logs" className="text-xs text-amber-400 hover:underline font-bold">View all →</Link>
          </div>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {recentLogs.length === 0 && <p className="text-xs text-zinc-500 text-center py-8">No DM events recorded</p>}
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between gap-3 py-2 border-b border-white/[0.06] last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">@{log.commenterName ?? "fan"}</p>
                  <p className="text-[11px] text-zinc-400 truncate">{log.commentText}</p>
                </div>
                <StatusBadge status={log.status as any} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
