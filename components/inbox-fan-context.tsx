"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export interface InboxFanContextData {
  fan: {
    id: string;
    username: string | null;
    firstName: string | null;
    tags: string[];
    interactionCount: number;
    lastInteractionAt: string;
  };
  interactions: Array<{
    id: string;
    commentText: string;
    matchedKeyword: string | null;
    status: string;
    createdAt: string;
    automation: { id: string; name: string } | null;
  }>;
  campaigns: Array<{ id: string; name: string; isActive: boolean; interactions: number }>;
}

const QUICK_TAGS = ["VIP", "LEAD", "FAN", "STREAMER"];

export default function InboxFanContext({ data, loading }: { data: InboxFanContextData | null; loading: boolean }) {
  const [tagBusy, setTagBusy] = useState<string | null>(null);
  const [localTags, setLocalTags] = useState<string[]>([]);

  useEffect(() => {
    setLocalTags(data?.fan.tags ?? []);
  }, [data]);

  async function toggleTag(tag: string) {
    if (!data?.fan.id || tagBusy) return;
    const remove = localTags.includes(tag);
    setTagBusy(tag);
    try {
      const response = await fetch(`/api/fans/${encodeURIComponent(data.fan.id)}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: remove ? "remove" : "add", tag }),
      });
      const payload = await response.json();
      if (payload.success) setLocalTags(payload.data.tags);
    } catch {
      // Keep the current UI state on transient network failures.
    } finally {
      setTagBusy(null);
    }
  }

  return (
    <aside className="w-full shrink-0 border-t border-border bg-surface/70 p-4 sm:w-64 sm:border-l sm:border-t-0">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Fan context</div>
      {loading ? (
        <div className="mt-3 space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-surface-hover" />
          <div className="h-3 w-24 animate-pulse rounded bg-surface-hover" />
          <div className="h-16 w-full animate-pulse rounded bg-surface-hover" />
        </div>
      ) : !data ? (
        <p className="mt-3 text-xs text-muted">No saved fan profile yet.</p>
      ) : (
        <div className="mt-3 space-y-4">
          <div>
            <div className="text-sm font-semibold text-foreground">@{data.fan.username ?? "unknown"}</div>
            {data.fan.firstName && <div className="text-xs text-muted">{data.fan.firstName}</div>}
          </div>

          <Link
            href={`/fans/${encodeURIComponent(data.fan.id)}`}
            className="inline-flex w-full items-center justify-center rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:border-accent/40 hover:text-accent"
          >
            Open full fan profile →
          </Link>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-border p-2">
              <div className="text-[10px] uppercase text-muted">Interactions</div>
              <div className="mt-1 text-lg font-bold text-foreground">{data.fan.interactionCount}</div>
            </div>
            <div className="rounded-lg border border-border p-2">
              <div className="text-[10px] uppercase text-muted">Campaigns</div>
              <div className="mt-1 text-lg font-bold text-foreground">{data.campaigns.length}</div>
            </div>
          </div>

          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted">Quick tags</div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TAGS.map((tag) => {
                const active = localTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    disabled={tagBusy === tag}
                    onClick={() => void toggleTag(tag)}
                    className={`rounded-full border px-2 py-1 text-[10px] font-semibold transition-colors ${
                      active
                        ? "border-accent/40 bg-accent/10 text-accent"
                        : "border-border text-muted hover:text-foreground"
                    } disabled:opacity-50`}
                  >
                    {active ? "✓ " : "+ "}{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {localTags.length > 0 && (
            <div>
              <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted">Tags</div>
              <div className="flex flex-wrap gap-1.5">
                {localTags.map((tag) => (
                  <span key={tag} className="rounded-full bg-accent/10 px-2 py-1 text-[10px] font-medium text-accent">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {data.campaigns.length > 0 && (
            <div>
              <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted">Campaign activity</div>
              <div className="space-y-1.5">
                {data.campaigns.slice(0, 5).map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate text-foreground">{campaign.name}</span>
                    <span className="shrink-0 font-mono text-muted">{campaign.interactions}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.interactions.length > 0 && (
            <div>
              <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted">Recent activity</div>
              <div className="space-y-2">
                {data.interactions.slice(0, 5).map((interaction) => (
                  <div key={interaction.id} className="rounded-lg border border-border/70 p-2">
                    <div className="line-clamp-2 text-[11px] text-foreground">{interaction.commentText}</div>
                    <div className="mt-1 flex items-center justify-between gap-2 text-[9px] text-muted">
                      <span className="truncate">{interaction.automation?.name ?? "Interaction"}</span>
                      <span>{interaction.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
