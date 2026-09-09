"use client";

import { useEffect, useState } from "react";

type Analytics = {
  days: number;
  overview: {
    dmsSent: number;
    clicks: number;
    ctr: number;
    failed: number;
    skipped: number;
    uniqueContacts: number;
    totalFans: number;
    activeCampaigns: number;
  };
  daily: Array<{ date: string; sent: number; clicks: number }>;
  campaigns: Array<{
    id: string;
    name: string;
    sent: number;
    failed: number;
    skipped: number;
    clicks: number;
    contacts: number;
    ctr: number;
    topKeywords: Array<{ keyword: string; count: number }>;
  }>;
  topKeywords: Array<{ keyword: string; count: number }>;
};

function number(value: number) {
  return value.toLocaleString();
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/analytics?days=${days}`, { cache: "no-store" })
      .then(async (res) => {
        const payload = await res.json();
        if (!res.ok || !payload.success) throw new Error(payload.error || "Failed to load analytics");
        if (!cancelled) {
          setData(payload.data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load analytics");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Performance</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">Analytics Command Center</h1>
          <p className="mt-1 text-sm text-zinc-400">Real campaign delivery, response and tracked-link performance.</p>
        </div>
        <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {[7, 30, 90].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDays(option)}
              className={`rounded-lg px-3 py-2 text-xs font-bold transition ${days === option ? "bg-white text-black" : "text-zinc-400 hover:text-white"}`}
            >
              {option}d
            </button>
          ))}
        </div>
      </div>

      {loading && !data ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => <div key={index} className="glass-card h-28 animate-pulse rounded-2xl" />)}
        </div>
      ) : error && !data ? (
        <div className="glass-card rounded-2xl p-8 text-center text-sm text-red-300">{error}</div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ["DMs sent", number(data.overview.dmsSent)],
              ["Link clicks", number(data.overview.clicks)],
              ["CTR", `${data.overview.ctr}%`],
              ["Unique contacts", number(data.overview.uniqueContacts)],
              ["Known fans", number(data.overview.totalFans)],
              ["Active campaigns", number(data.overview.activeCampaigns)],
              ["Skipped", number(data.overview.skipped)],
              ["Failed", number(data.overview.failed)],
            ].map(([label, value]) => (
              <div key={label} className="glass-card rounded-2xl p-4 shadow-xl">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{label}</p>
                <p className="mt-2 text-2xl font-black text-white">{value}</p>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-2xl p-5 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">Daily delivery trend</h2>
                <p className="mt-1 text-xs text-zinc-500">Sent DMs and tracked link clicks per day.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="flex min-w-[720px] items-end gap-2" style={{ height: 220 }}>
                {data.daily.map((day) => {
                  const max = Math.max(1, ...data.daily.map((item) => item.sent));
                  const height = Math.max(6, (day.sent / max) * 170);
                  return (
                    <div key={day.date} className="flex min-w-8 flex-1 flex-col items-center justify-end gap-2">
                      <div className="text-[10px] font-mono text-zinc-500">{day.sent}</div>
                      <div className="w-full max-w-8 rounded-t-md bg-amber-400/80" style={{ height }} title={`${day.sent} sent · ${day.clicks} clicks`} />
                      <div className="text-[9px] text-zinc-600">{new Date(`${day.date}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="glass-card rounded-2xl p-5 shadow-xl">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">Top campaigns</h2>
              <div className="mt-4 space-y-3">
                {data.campaigns.slice(0, 10).map((campaign) => (
                  <div key={campaign.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-bold text-white">{campaign.name}</p>
                      <span className="shrink-0 font-mono text-xs text-amber-400">{campaign.ctr}% CTR</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-zinc-500">
                      <span>{campaign.sent} sent</span><span>{campaign.clicks} clicks</span><span>{campaign.contacts} contacts</span><span>{campaign.failed} failed</span>
                    </div>
                    {campaign.topKeywords.length > 0 && <p className="mt-2 text-[10px] text-zinc-600">Top: {campaign.topKeywords.map((item) => `${item.keyword} (${item.count})`).join(" · ")}</p>}
                  </div>
                ))}
                {data.campaigns.length === 0 && <p className="py-6 text-center text-xs text-zinc-600">No campaign activity in this period.</p>}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 shadow-xl">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">Top trigger keywords</h2>
              <div className="mt-4 space-y-2">
                {data.topKeywords.map((item, index) => (
                  <div key={item.keyword} className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3">
                    <div className="flex items-center gap-3"><span className="text-[10px] font-mono text-zinc-600">0{index + 1}</span><span className="text-sm font-semibold text-white">{item.keyword}</span></div>
                    <span className="font-mono text-xs font-bold text-emerald-400">{number(item.count)}</span>
                  </div>
                ))}
                {data.topKeywords.length === 0 && <p className="py-6 text-center text-xs text-zinc-600">No keyword activity in this period.</p>}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
