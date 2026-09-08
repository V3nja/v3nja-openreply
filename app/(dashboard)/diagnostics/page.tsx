"use client";

import { useEffect, useState } from "react";

interface DiagnosticsData {
  metaApiStatus: {
    connected: boolean;
    account: string;
    accountId: string;
    graphApiVersion: string;
    webhookSubscribed: boolean;
    connectedAt: string | null;
    updatedAt: string | null;
  };
  queueCounts: { waiting: number; active: number; delayed: number; failed: number };
  workerHealth: {
    healthy: boolean;
    ageMs: number | null;
    heartbeat: { checkedAt: string; hostname?: string; pid: number; startedAt?: string } | null;
  };
  workerAlerts: unknown[];
  webhookFailures: Array<{ id: string; object: string | null; errorMessage: string | null; createdAt: string }>;
  dmFailures: Array<{
    id: string;
    status: string;
    commentId: string;
    commentText: string;
    errorMessage: string | null;
    updatedAt: string;
    automation: { name: string };
  }>;
  tokenRefreshFailures: unknown[];
  operationalEvents: Array<{
    id: string;
    source: string;
    level: string;
    message: string;
    createdAt: string;
    resolvedAt: string | null;
  }>;
}

export default function DiagnosticsPage() {
  const [data, setData] = useState<DiagnosticsData | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshDiagnostics() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/diagnostics", { cache: "no-store" });
      const payload = await response.json();
      if (payload.success) setData(payload.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshDiagnostics();
  }, []);

  const meta = data?.metaApiStatus;
  const worker = data?.workerHealth;
  const queue = data?.queueCounts;
  const infraOk = Boolean(meta?.connected && meta?.webhookSubscribed && worker?.healthy);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">System Telemetry &amp; Infrastructure Health</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">Live PostgreSQL, Redis/BullMQ, worker, and Instagram webhook state.</p>
        </div>
        <button onClick={refreshDiagnostics} disabled={loading} className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-white transition-all">
          {loading ? "Refreshing..." : "↻ Ping Telemetry"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Instagram / Meta</span><span className={`w-2.5 h-2.5 rounded-full ${meta?.connected ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} /></div>
          <p className={`text-2xl font-extrabold ${meta?.connected ? "text-emerald-400" : "text-red-400"}`}>{meta?.connected ? "Connected" : "Not connected"}</p>
          <div className="text-xs text-zinc-300 space-y-1"><p>Account: <strong className="text-white">{meta?.account || "—"}</strong></p><p>Graph API: <strong className="text-white">{meta?.graphApiVersion || "—"}</strong></p></div>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Webhook</span><span className={`w-2.5 h-2.5 rounded-full ${meta?.webhookSubscribed ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} /></div>
          <p className={`text-2xl font-extrabold ${meta?.webhookSubscribed ? "text-emerald-400" : "text-red-400"}`}>{meta?.webhookSubscribed ? "Subscribed" : "Not subscribed"}</p>
          <p className="text-xs text-zinc-300">Inbound events are persisted before queue hand-off.</p>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Worker / Queue</span><span className={`w-2.5 h-2.5 rounded-full ${infraOk ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} /></div>
          <p className={`text-2xl font-extrabold ${worker?.healthy ? "text-emerald-400" : "text-amber-400"}`}>{worker?.healthy ? "Healthy" : "Degraded"}</p>
          <p className="text-xs text-zinc-300">Waiting {queue?.waiting ?? 0} · Active {queue?.active ?? 0} · Failed {queue?.failed ?? 0}</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">Live Delivery Pipeline</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          {["Meta webhook", "PostgreSQL event", "BullMQ queue", "Worker delivery"].map((step, index) => (
            <div key={step} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-zinc-500 font-mono mb-1">0{index + 1}</div>
              <div className="font-bold text-white">{step}</div>
              <div className={`mt-2 font-semibold ${infraOk || index < 2 ? "text-emerald-400" : "text-amber-400"}`}>{infraOk || index < 2 ? "READY" : "CHECK"}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">Recent Webhook Failures</h2>
          {data?.webhookFailures.length ? data.webhookFailures.map((item) => (
            <div key={item.id} className="p-3 rounded-xl bg-red-500/5 border border-red-500/10"><p className="text-xs text-zinc-300">{item.errorMessage || "Webhook processing failed"}</p><p className="text-[10px] text-zinc-500 mt-1">{new Date(item.createdAt).toLocaleString()}</p></div>
          )) : <p className="text-xs text-zinc-500">No webhook failures recorded.</p>}
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">Recent DM Failures</h2>
          {data?.dmFailures.length ? data.dmFailures.map((item) => (
            <div key={item.id} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10"><p className="text-xs text-white font-semibold">{item.automation.name}</p><p className="text-[11px] text-zinc-400 mt-1">{item.errorMessage || "Delivery failed"}</p></div>
          )) : <p className="text-xs text-zinc-500">No failed DM deliveries recorded.</p>}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">Operational Event Timeline</h2><span className="text-[11px] text-zinc-500">{worker?.heartbeat ? `Last heartbeat ${Math.round((worker.ageMs ?? 0) / 1000)}s ago` : "No heartbeat"}</span></div>
        <div className="space-y-3">{data?.operationalEvents.map((event) => (
          <div key={event.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]"><div className="flex items-center gap-2.5"><span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-[10px] font-bold text-zinc-300 uppercase">{event.source}</span><span className="text-xs font-medium text-zinc-200">{event.message}</span></div><span className="text-[11px] text-zinc-500 font-mono whitespace-nowrap">{new Date(event.createdAt).toLocaleTimeString()}</span></div>
        ))}</div>
      </div>
    </div>
  );
}
