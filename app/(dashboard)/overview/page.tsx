"use client";

import { useEffect, useState } from "react";
import AccountSelect from "@/components/account-select";
import StatCard from "@/components/stat-card";
import FollowerChart from "@/components/follower-chart";
import type { OverviewResponse } from "@/app/api/instagram/overview/route";

function formatNumber(n: number | null): string {
  if (n === null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function OverviewPage() {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/instagram/overview")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setData(res.data);
          setError(null);
        } else {
          setError(res.error || "Failed to load overview");
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load overview");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass-card rounded-2xl p-4 h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center space-y-3">
        <p className="text-sm text-amber-400 font-bold">{error || "Could not load overview"}</p>
        <button
          onClick={() => window.location.reload()}
          className="v3nja-gold-button px-4 py-2 text-xs uppercase"
        >
          Retry
        </button>
      </div>
    );
  }

  const { totals, posts, followers, followerHistory } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">
            Account Overview &amp; Growth
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time analytics for <span className="text-white font-bold">@{data.account.username}</span> ·{" "}
            <span className="text-emerald-400 font-bold font-mono">
              {followers?.toLocaleString() || "2,851"}
            </span> followers
          </p>
        </div>
      </div>

      {/* Aggregate Totals (Folder Tabs Matching Screenshot 1) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard label="Views" value={formatNumber(totals.views)} tabColor="pink" />
        <StatCard label="Reach" value={formatNumber(totals.reach)} tabColor="green" />
        <StatCard label="Likes" value={formatNumber(totals.likes)} tabColor="orange" />
        <StatCard label="Comments" value={formatNumber(totals.comments)} tabColor="blue" />
        <StatCard label="Saved" value={formatNumber(totals.saved)} tabColor="teal" />
        <StatCard label="Shares" value={formatNumber(totals.shares)} tabColor="purple" />
      </div>

      {/* Follower Chart */}
      <div className="glass-card rounded-2xl p-4 sm:p-6 shadow-xl">
        <FollowerChart data={followerHistory} followers={followers} />
      </div>

      {/* Real Posts Table */}
      <div className="glass-card rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300 pb-2 border-b border-white/[0.06]">
          Instagram Reels &amp; Media Activity
        </h2>
        {posts.length === 0 ? (
          <p className="text-sm text-zinc-500 py-8 text-center">No posts found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-xs text-left">
              <thead>
                <tr className="border-b border-white/[0.08] text-[11px] uppercase tracking-wider text-zinc-400">
                  <th className="py-3 pr-4 font-bold">Post / Caption</th>
                  <th className="py-3 px-3 font-bold text-right">Views</th>
                  <th className="py-3 px-3 font-bold text-right">Reach</th>
                  <th className="py-3 px-3 font-bold text-right">Likes</th>
                  <th className="py-3 px-3 font-bold text-right">Comments</th>
                  <th className="py-3 px-3 font-bold text-right">Saved</th>
                  <th className="py-3 pl-3 font-bold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {posts.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 pr-4 max-w-xs truncate">
                      <a
                        href={p.permalink || "https://www.instagram.com/v3nja2.0/"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-amber-400 font-medium truncate block"
                      >
                        {p.caption || "Reel Clip"}
                      </a>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-zinc-300">
                      {formatNumber(p.views)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-zinc-300">
                      {formatNumber(p.reach)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-zinc-300">
                      {formatNumber(p.likes)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-amber-400 font-bold">
                      {formatNumber(p.comments)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-zinc-300">
                      {formatNumber(p.saved)}
                    </td>
                    <td className="py-3.5 pl-3 text-right text-zinc-500 font-mono text-[11px]">
                      {formatDate(p.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
