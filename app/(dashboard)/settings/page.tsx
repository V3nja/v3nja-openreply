"use client";

import { Suspense, useEffect, useState } from "react";
import type { AccountOption } from "@/components/account-select";
import { InstagramConnectNotice } from "@/components/instagram-connect-notice";

interface SettingsData {
  dmsSentMonth: number;
  instagramAccounts: Array<
    AccountOption & {
      tokenExpiresAt: string | null;
      webhookSubscribed: boolean;
    }
  >;
}

export default function SettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [directToken, setDirectToken] = useState("");
  const [tokenStatus, setTokenStatus] = useState<string | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  function refreshData() {
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((statsPayload) => {
        if (statsPayload.success) setData(statsPayload.data);
      })
      .finally(() => setLoading(false));
  }

  async function handleDirectConnect(e: React.FormEvent) {
    e.preventDefault();
    if (!directToken.trim()) return;
    setBusy("connecting");
    setTokenStatus(null);

    try {
      const res = await fetch("/api/instagram/direct-connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: directToken.trim() }),
      });
      const result = await res.json();
      if (result.success) {
        setTokenStatus("✓ Connected successfully to @" + result.data.username);
        setDirectToken("");
        refreshData();
      } else {
        setTokenStatus("✗ Error: " + (result.error || "Failed to connect"));
      }
    } catch (err: any) {
      setTokenStatus("✗ Network error: " + err.message);
    } finally {
      setBusy(null);
    }
  }

  async function disconnectInstagram(instagramAccountId: string) {
    if (!confirm("Disconnect Instagram? Campaigns for this account will stop sending DMs.")) {
      return;
    }

    setBusy(`disconnect:${instagramAccountId}`);
    await fetch("/api/instagram/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instagramAccountId }),
    });
    refreshData();
    setBusy(null);
  }

  if (loading) {
    return <div className="panel rounded p-8 h-64" />;
  }

  const accounts = data?.instagramAccounts ?? [];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Suspense fallback={null}>
        <InstagramConnectNotice />
      </Suspense>

      <section className="panel rounded p-4 sm:p-6 bg-zinc-900/60 border border-zinc-800">
        <h2 className="text-base font-semibold mb-6 flex items-center justify-between">
          <span>Instagram Account Connection</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              accounts.length > 0
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            }`}
          >
            {accounts.length > 0 ? "Connected" : "Not connected"}
          </span>
        </h2>

        <div className="space-y-4 mb-6">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex flex-col gap-3 rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  @{account.username}
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  ID: {account.instagramId} · Webhook: Active
                </p>
              </div>
              <button
                onClick={() => disconnectInstagram(account.id)}
                disabled={busy === `disconnect:${account.id}`}
                className="inline-flex items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-all"
              >
                {busy === `disconnect:${account.id}` ? "Disconnecting..." : "Disconnect"}
              </button>
            </div>
          ))}

          {accounts.length === 0 && (
            <p className="text-xs text-zinc-400">
              No Instagram account connected yet. Paste your Meta Access Token below to connect @v3nja2.0.
            </p>
          )}
        </div>

        <div className="pt-5 border-t border-zinc-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-2">
            Direct Meta Token Connection
          </h3>
          <p className="text-xs text-zinc-400 mb-4">
            Paste your Meta Access Token (from Meta Graph API Explorer) to connect @v3nja2.0 directly.
          </p>

          <form onSubmit={handleDirectConnect} className="space-y-3">
            <input
              type="password"
              value={directToken}
              onChange={(e) => setDirectToken(e.target.value)}
              placeholder="Paste Meta Access Token here"
              className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-white placeholder:text-zinc-500 focus:border-orange-500 outline-none"
            />

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy === "connecting"}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-orange-600 hover:to-amber-600 disabled:opacity-50"
              >
                {busy === "connecting" ? "Verifying..." : "⚡ Connect @v3nja2.0"}
              </button>
            </div>

            {tokenStatus && (
              <p
                className={`text-xs font-medium mt-2 ${
                  tokenStatus.startsWith("✓") ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {tokenStatus}
              </p>
            )}
          </form>
        </div>
      </section>

      <section className="panel rounded p-4 sm:p-6 bg-zinc-900/60 border border-zinc-800">
        <h2 className="text-base font-semibold mb-4">Automation Usage</h2>
        <div className="flex items-center justify-between py-2 border-b border-zinc-800">
          <div>
            <p className="text-sm font-medium text-white">DMs Sent This Month</p>
            <p className="text-xs text-zinc-400">Self-hosted V3NJA OpenReply Engine</p>
          </div>
          <span className="text-sm font-bold text-orange-400">
            {data?.dmsSentMonth ?? 0}
          </span>
        </div>
      </section>
    </div>
  );
}
