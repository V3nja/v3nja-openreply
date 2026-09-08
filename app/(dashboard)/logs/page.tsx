"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import StatusBadge from "@/components/status-badge";
import type { LiveDmLog } from "@/lib/db/live-store";

export default function LogsPage() {
  const [logs, setLogs] = useState<LiveDmLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const limit = 25;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        limit: String(limit),
        offset: String(page * limit),
      });
      const res = await fetch(`/api/logs?${params}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data.logs || []);
        setTotal(data.data.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    void fetchLogs();
    const interval = setInterval(fetchLogs, 8000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const filterTabs = [
    { label: "All Activity", value: "ALL" },
    { label: "SENT", value: "SENT" },
    { label: "FAILED", value: "FAILED" },
    { label: "PENDING", value: "PENDING" },
    { label: "Skipped: DEDUP", value: "SKIPPED_DEDUP" },
    { label: "Skipped: RATE_LIMIT", value: "SKIPPED_RATE_LIMIT" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Real-Time DM Logs &amp; Activity
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Live telemetry of verified comment triggers, anti-spam replies, and direct messages sent on{" "}
            <span className="text-amber-400 font-bold">@v3nja2.0</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => void fetchLogs()}
            className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>
          <Link
            href="/tester"
            className="v3nja-gold-button px-4 py-2 text-xs uppercase tracking-wider flex items-center gap-1.5"
          >
            <span>🧪</span>
            <span>Test Triggers</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => {
          const isSelected = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(0);
              }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                isSelected
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black border-amber-400 shadow-md shadow-amber-500/20"
                  : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Logs Table with Liquid Glass Styling */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="py-3.5 px-4">Commenter</th>
                <th className="py-3.5 px-4">Comment / Trigger</th>
                <th className="py-3.5 px-4">Matched Campaign</th>
                <th className="py-3.5 px-4">Target IG</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      <span>Loading real-time DM records...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    No DM events recorded for this filter.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-500 text-black font-black text-[10px] flex items-center justify-center">
                          @
                        </span>
                        <span className="text-white">@{log.commenterName || "fan"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-zinc-300">
                      &ldquo;{log.commentText}&rdquo;
                      {log.publicReplyText && (
                        <span className="block text-[10px] text-amber-400/80 truncate">
                          ↳ Replied: {log.publicReplyText}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-[10px] font-bold text-amber-300">
                        {log.automation?.name || "Official Drop"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-400">
                      @{log.instagramAccount?.username || "v3nja2.0"}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={log.status} />
                    </td>
                    <td className="py-3 px-4 text-right text-zinc-500 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {total > limit && (
          <div className="p-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
            <span>
              Showing {page * limit + 1}–{Math.min((page + 1) * limit, total)} of {total} events
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.02] disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={(page + 1) * limit >= total}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.02] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
