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
      {/* Greeting Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl flex items-center gap-2">
            Hello, <span className="text-amber-400">{firstName}</span>! 🔥
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            <span className="font-semibold text-white">@v3nja2.0</span> connected ·{" "}
            <span className="text-emerald-400 font-bold">{contactCount}</span> verified fan contact{contactCount === 1 ? "" : "s"} ·{" "}
            <Link href="/logs" className="text-amber-400 hover:underline font-medium">
              See activity logs →
            </Link>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/tester"
            className="v3nja-gold-button inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-wider"
          >
            <span>🧪</span>
            <span>Test Comment Triggers</span>
          </Link>
          <Link
            href="/campaigns/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white font-semibold text-xs transition-all"
          >
            + New Campaign
          </Link>
        </div>
      </div>

      {/* Stat Cards with V3NJA Folder-Tab Colors (Screenshot 1 Match) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          label="Active Campaigns"
          value={activeAutomations}
          tabColor="pink"
          sublabel="LIVE"
        />
        <StatCard
          label="DMs Sent"
          value={dmsSentMonth}
          tabColor="green"
          sublabel="VERIFIED"
        />
        <StatCard
          label="Skipped"
          value={skippedCount}
          tabColor="orange"
          sublabel="DEDUP"
        />
        <StatCard
          label="Failed"
          value={failedCount}
          tabColor="blue"
          sublabel="ERROR"
        />
        <StatCard
          label="Smart Link Clicks"
          value={clicksThisMonth}
          tabColor="teal"
          sublabel="TRACKED"
        />
        <StatCard
          label="CTR"
          value={`${ctr}%`}
          tabColor="purple"
          sublabel="CONVERSION"
        />
      </div>

      {/* Chart + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 sm:gap-6">
        {/* 7-Day Real Delivery Chart */}
        <div className="lg:col-span-3 glass-card rounded-2xl p-4 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/[0.06]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              DMs Delivered — Last 7 Days
            </h2>
            <span className="text-xs text-amber-400 font-mono font-bold">
              {dmsSentMonth} total verified
            </span>
          </div>
          <div className="flex items-end gap-2 h-44 sm:gap-3">
            {dailyDMs.map((day) => (
              <div key={day.date} className="min-w-0 flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-zinc-400 font-mono font-bold">{day.count}</span>
                <div
                  className="w-full rounded-lg bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-400 min-h-[6px] transition-all shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                  style={{ height: `${Math.max((day.count / maxDM) * 100, 8)}%` }}
                />
                <span className="w-full truncate text-center text-[11px] text-zinc-400 font-medium">
                  {day.date}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Song Triggers */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-4 sm:p-6 shadow-xl">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-4 pb-2 border-b border-white/[0.06]">
            Top Song Triggers
          </h2>
          <div className="space-y-2.5">
            {topKeywords.length === 0 && (
              <p className="text-xs text-zinc-500 py-8 text-center">No triggers fired yet</p>
            )}
            {topKeywords.map((keyword) => (
              <div
                key={keyword.keyword}
                className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white/[0.03] border border-white/10"
              >
                <span className="truncate text-xs font-bold text-amber-400 font-mono">
                  {keyword.keyword}
                </span>
                <span className="text-xs text-white font-bold px-2 py-0.5 rounded-md bg-white/[0.06]">
                  {keyword.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Real DM Dispatches */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-4 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.06]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Recent DM Dispatches
            </h2>
            <Link href="/logs" className="text-xs text-amber-400 hover:underline font-bold">
              View all →
            </Link>
          </div>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {recentLogs.length === 0 && (
              <p className="text-xs text-zinc-500 text-center py-8">No DM events recorded</p>
            )}
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between gap-3 py-2 border-b border-white/[0.06] last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">
                    @{log.commenterName ?? "fan"}
                  </p>
                  <p className="text-[11px] text-zinc-400 truncate">
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
