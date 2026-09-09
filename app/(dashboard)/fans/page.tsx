"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

interface Fan {
  id: string;
  instagramUserId: string;
  username: string | null;
  firstName: string | null;
  tags: string[];
  interactionCount: number;
  lastInteractionAt: string;
}

function displayName(fan: Fan): string {
  return fan.username || fan.firstName || `instagram_${fan.instagramUserId.slice(-6)}`;
}

function formatTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function FansPage() {
  const [fans, setFans] = useState<Fan[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFans = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (query.trim()) params.set("search", query.trim());
      const response = await fetch(`/api/fans?${params.toString()}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || "Failed to load fans");
      setFans(payload.data ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load fans");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadFans(search), 250);
    return () => window.clearTimeout(timer);
  }, [loadFans, search]);

  const filtered = useMemo(() => fans, [fans]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Audience</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">Fans &amp; Conversations</h1>
          <p className="mt-1 text-sm text-zinc-400">Persistent Instagram audience records built from real webhook interactions.</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-zinc-400">
          <span className="font-black text-white">{fans.length}</span> result{fans.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-4 shadow-xl">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search username, name, Instagram ID, or tag…"
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-amber-400/40"
        />
      </div>

      <div className="glass-card overflow-hidden rounded-2xl shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-sm text-zinc-500">Loading audience…</div>
        ) : error ? (
          <div className="p-12 text-center text-sm text-red-300">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-bold text-white">No fans found</p>
            <p className="mt-1 text-xs text-zinc-500">Real interactions will appear here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                <tr><th className="px-5 py-4">Fan</th><th className="px-4 py-4">Tags</th><th className="px-4 py-4 text-center">Interactions</th><th className="px-5 py-4 text-right">Last seen</th></tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filtered.map((fan) => (
                  <tr key={fan.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-4">
                      <Link href={`/fans/${encodeURIComponent(fan.id)}`} className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-xs font-black text-black">{displayName(fan).slice(0, 1).toUpperCase()}</div>
                        <div className="min-w-0"><p className="truncate font-bold text-white hover:underline">@{displayName(fan)}</p><p className="truncate font-mono text-[10px] text-zinc-600">{fan.instagramUserId}</p></div>
                      </Link>
                    </td>
                    <td className="px-4 py-4"><div className="flex flex-wrap gap-1.5">{fan.tags.length ? fan.tags.map((tag) => <span key={tag} className="rounded-md border border-emerald-400/15 bg-emerald-400/5 px-2 py-1 text-[10px] font-bold text-emerald-300">{tag}</span>) : <span className="text-zinc-600">Unlabelled</span>}</div></td>
                    <td className="px-4 py-4 text-center font-mono font-bold text-amber-400">{fan.interactionCount}</td>
                    <td className="px-5 py-4 text-right font-mono text-[11px] text-zinc-500">{formatTime(fan.lastInteractionAt)}</td>
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
