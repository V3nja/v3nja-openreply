"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Interaction {
  id: string;
  commentId: string;
  commentText: string;
  matchedKeyword: string | null;
  status: string;
  attempts: number;
  dmSentAt: string | null;
  publicReplySentAt: string | null;
  errorMessage: string | null;
  createdAt: string;
  automation: { id: string; name: string; goal: string | null };
}

interface ProfileData {
  fan: {
    id: string;
    instagramUserId: string;
    username: string | null;
    firstName: string | null;
    tags: string[];
    interactionCount: number;
    lastInteractionAt: string;
    createdAt: string;
  };
  interactions: Interaction[];
  campaigns: Array<{
    id: string;
    name: string;
    goal: string | null;
    isActive: boolean;
    interactions: number;
  }>;
}

function displayName(fan: ProfileData["fan"]) {
  return fan.username || fan.firstName || `instagram_${fan.instagramUserId.slice(-6)}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function FanProfilePage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = params?.id;
    if (!id) return;
    fetch(`/api/fans/${encodeURIComponent(id)}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || !payload.success) {
          throw new Error(payload.error || "Failed to load fan profile");
        }
        setData(payload.data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load fan profile"))
      .finally(() => setLoading(false));
  }, [params]);

  if (loading) return <div className="panel h-80 rounded-2xl" />;

  if (error || !data) {
    return (
      <div className="panel rounded-2xl p-10 text-center">
        <p className="text-sm font-bold text-white">{error || "Fan not found"}</p>
        <Link href="/fans" className="mt-4 inline-flex rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-foreground">
          Back to audience
        </Link>
      </div>
    );
  }

  const name = displayName(data.fan);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/fans" className="text-sm text-muted hover:text-foreground">← Fans &amp; Audience</Link>
        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">Fan profile</span>
      </div>

      <section className="panel rounded-2xl p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-xl font-black text-black">
            {name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-2xl font-black text-foreground">@{name}</p>
            <p className="mt-1 font-mono text-xs text-muted">{data.fan.instagramUserId}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {data.fan.tags.map((tag) => (
                <span key={tag} className="rounded-md border border-success/20 bg-success/5 px-2 py-1 text-[10px] font-bold text-success">{tag}</span>
              ))}
              {!data.fan.tags.length && <span className="text-xs text-muted">No tags yet</span>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-[240px]">
            <div className="rounded-xl border border-border bg-surface p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted">Interactions</p>
              <p className="mt-1 text-xl font-black text-accent">{data.fan.interactionCount}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted">Campaigns</p>
              <p className="mt-1 text-xl font-black text-accent">{data.campaigns.length}</p>
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-4 text-xs text-muted">
          <span>First seen {formatDate(data.fan.createdAt)}</span>
          <span>Last interaction {formatDate(data.fan.lastInteractionAt)}</span>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="panel rounded-2xl p-6">
          <h2 className="text-sm font-black uppercase tracking-wider text-muted">Campaign attribution</h2>
          <div className="mt-4 space-y-3">
            {data.campaigns.length === 0 ? (
              <p className="text-sm text-muted">No campaign activity recorded yet.</p>
            ) : data.campaigns.map((campaign) => (
              <div key={campaign.id} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">{campaign.name}</p>
                    <p className="mt-1 truncate text-xs text-muted">{campaign.goal || "No campaign goal"}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-accent/10 px-2 py-1 text-[10px] font-bold text-accent">{campaign.interactions} touch{campaign.interactions === 1 ? "" : "es"}</span>
                </div>
                <p className="mt-3 text-[10px] text-muted">{campaign.isActive ? "Currently active" : "Paused"}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="panel overflow-hidden rounded-2xl">
          <div className="border-b border-border px-6 py-5">
            <h2 className="text-sm font-black uppercase tracking-wider text-muted">Interaction history</h2>
            <p className="mt-1 text-xs text-muted">Latest comment-triggered automation events for this fan.</p>
          </div>
          {data.interactions.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted">No interaction history yet.</div>
          ) : (
            <div className="divide-y divide-border">
              {data.interactions.map((item) => (
                <div key={item.id} className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-bold text-foreground">{item.automation.name}</p>
                    <span className="rounded-full border border-border px-2 py-1 text-[10px] font-semibold text-muted">{item.status}</span>
                  </div>
                  <p className="mt-2 text-xs text-foreground">“{item.commentText}”</p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted">
                    {item.matchedKeyword && <span>Keyword: <strong>{item.matchedKeyword}</strong></span>}
                    <span>{formatDate(item.createdAt)}</span>
                    <span>{item.attempts} attempt{item.attempts === 1 ? "" : "s"}</span>
                    {item.dmSentAt && <span className="text-success">DM sent</span>}
                  </div>
                  {item.errorMessage && <p className="mt-2 text-[10px] text-red-300">{item.errorMessage}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
