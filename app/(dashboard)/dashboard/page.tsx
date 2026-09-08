import { LiveDataStore } from "@/lib/db/live-store";
import StatCard from "@/components/stat-card";
import StatusBadge from "@/components/status-badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = LiveDataStore.getAggregatedStats();

  const activeAutomations = stats.activeAutomations;
  const dmsSentMonth = stats.dmsSentMonth;
  const skippedCount = stats.dmsSkippedMonth;
  const failedCount = stats.dmsFailedMonth;
  const clicksThisMonth = stats.clicksThisMonth;
  const contactCount = stats.contactsCount;
  const firstName = stats.userName;
  const dailyDMs = stats.dailyDMs;
  const topKeywords = stats.topKeywords;
  const recentLogs = stats.recentLogs;
  const ctr = stats.ctrThisMonth;

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
          <Link
            href="/campaigns/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface hover:bg-surface-hover border border-border text-foreground font-semibold text-xs transition-all"
          >
            + New Campaign
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
        <StatCard label="CTR" value={`${ctr}%`} />
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
                  className="w-full rounded-md bg-gradient-to-t from-orange-600 to-amber-500 min-h-[6px] transition-all"
                  style={{ height: `${Math.max((day.count / maxDM) * 100, 8)}%` }}
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
            <Link href="/logs" className="text-xs text-orange-500 hover:underline font-medium">
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
                <StatusBadge status={log.status as any} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
