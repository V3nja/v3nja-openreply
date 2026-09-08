"use client";

/**
 * DM Logs — Luxury Glass Activity Stream
 */

import { useEffect, useState, useCallback } from "react";
import StatusBadge from "@/components/status-badge";
import Link from "next/link";

interface DmLog {
  id: string;
  commenterId: string;
  commenterName: string | null;
  commentText: string;
  status: string;
  matchedKeyword?: string | null;
  errorMessage: string | null;
  createdAt: string;
  automation: { name: string; keywords: string[] };
  instagramAccount: { username: string };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_FILTERS = [
  "ALL",
  "SENT",
  "FAILED",
  "PENDING",
  "SKIPPED_DEDUP",
  "SKIPPED_RATE_LIMIT",
];

export default function LogsPage() {
  const [logs, setLogs] = useState<DmLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/logs?${params}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data.logs);
        setPagination(data.data.pagination);
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchLogs();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchLogs]);

  function handleFilterChange(status: string) {
    setLoading(true);
    setStatusFilter(status);
    setPage(1);
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            Real-Time DM Logs &amp; Activity
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Live telemetry of all comment triggers, anti-spam replies, and direct messages sent on{" "}
            <span className="text-orange-400 font-bold">@v3nja2.0</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setLoading(true);
              void fetchLogs();
            }}
            className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            <span>🔄 Refresh</span>
          </button>
          <Link
            href="/tester"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs shadow-md shadow-orange-500/20 hover:opacity-95 transition-all"
          >
            🧪 Test Triggers
          </Link>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => handleFilterChange(status)}
            className={`
              px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all
              ${
                statusFilter === status
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 scale-105"
                  : "bg-white/[0.03] text-zinc-400 border border-white/10 hover:border-white/20 hover:text-white"
              }
            `}
          >
            {status === "ALL" ? "All Activity" : status.replace("SKIPPED_", "Skipped: ")}
          </button>
        ))}
      </div>

      {/* Luxury Glass Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-left">
                <th className="px-5 py-3.5 text-xs font-bold text-zinc-400 uppercase tracking-wider">Commenter</th>
                <th className="px-5 py-3.5 text-xs font-bold text-zinc-400 uppercase tracking-wider">Comment / Trigger</th>
                <th className="px-5 py-3.5 text-xs font-bold text-zinc-400 uppercase tracking-wider">Matched Campaign</th>
                <th className="px-5 py-3.5 text-xs font-bold text-zinc-400 uppercase tracking-wider">Target IG</th>
                <th className="px-5 py-3.5 text-xs font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-xs font-bold text-zinc-400 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {loading && (
                <>
                  {[...Array(4)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-5 py-4">
                        <div className="h-4 bg-white/[0.05] rounded-lg" />
                      </td>
                    </tr>
                  ))}
                </>
              )}
              {!loading && logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-zinc-500">
                    No activity logs found for this filter.
                  </td>
                </tr>
              )}
              {!loading &&
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500/30 to-orange-500/30 border border-orange-500/30 flex items-center justify-center text-xs font-bold text-orange-300">
                          @
                        </div>
                        <span className="font-bold text-white">
                          @{log.commenterName ?? "fan"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 max-w-[220px]">
                      <span className="text-zinc-200 block truncate font-medium">
                        &ldquo;{log.commentText}&rdquo;
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-orange-300">
                        {log.automation.name}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-zinc-400 font-mono">@{log.instagramAccount.username}</span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={log.status} />
                    </td>
                    <td className="px-5 py-4 text-xs text-zinc-400 whitespace-nowrap font-mono">
                      {new Date(log.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.08] bg-white/[0.01]">
            <p className="text-xs text-zinc-400">
              Showing {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} events
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => {
                  setLoading(true);
                  setPage(page - 1);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-300 bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                Previous
              </button>
              <span className="text-xs text-zinc-400 px-2 font-mono">
                {page} / {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => {
                  setLoading(true);
                  setPage(page + 1);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-300 bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none transition-all"
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
