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
    <div className="w-full p-4 space-y-4">
      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Fan Context</div>
      {loading ? (
        <div className="mt-3 space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-zinc-800" />
          <div className="h-3 w-24 animate-pulse rounded bg-zinc-800" />
          <div className="h-16 w-full animate-pulse rounded bg-zinc-800" />
        </div>
      ) : !data ? (
        <p className="mt-3 text-xs text-zinc-500">No saved fan profile yet.</p>
      ) : (
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-zinc-900 border border-white/10">
            <div className="text-sm font-bold text-white">@{data.fan.username ?? "unknown"}</div>
            {data.fan.firstName && <div className="text-xs text-zinc-400 mt-0.5">{data.fan.firstName}</div>}
          </div>

          <Link
            href={`/fans/${encodeURIComponent(data.fan.id)}`}
            className="inline-flex w-full items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 hover:border-orange-500/40 px-3 py-2 text-xs font-semibold text-zinc-200 hover:text-white transition-all shadow-sm"
          >
            Open full fan profile →
          </Link>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-2.5">
              <div className="text-[10px] uppercase font-semibold text-zinc-400">Interactions</div>
              <div className="mt-1 text-base font-black text-orange-400">{data.fan.interactionCount}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-2.5">
              <div className="text-[10px] uppercase font-semibold text-zinc-400">Campaigns</div>
              <div className="mt-1 text-base font-black text-amber-400">{data.campaigns.length}</div>
            </div>
          </div>

          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Quick tags</div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TAGS.map((tag) => {
                const active = localTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    disabled={tagBusy === tag}
                    onClick={() => void toggleTag(tag)}
                    className={`rounded-lg border px-2.5 py-1 text-[10px] font-semibold transition-all ${
                      active
                        ? "border-orange-500/40 bg-orange-500/10 text-orange-400 shadow-sm"
                        : "border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
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
              <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Tags</div>
              <div className="flex flex-wrap gap-1.5">
                {localTags.map((tag) => (
                  <span key={tag} className="rounded-md bg-orange-500/15 border border-orange-500/30 px-2 py-0.5 text-[10px] font-medium text-orange-300">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {data.campaigns.length > 0 && (
            <div>
              <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Campaign activity</div>
              <div className="space-y-1.5">
                {data.campaigns.slice(0, 5).map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between gap-2 text-xs p-1.5 rounded bg-zinc-900/40">
                    <span className="truncate text-zinc-200">{campaign.name}</span>
                    <span className="shrink-0 font-mono text-xs font-semibold text-orange-400">{campaign.interactions}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.interactions.length > 0 && (
            <div>
              <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Recent activity</div>
              <div className="space-y-2">
                {data.interactions.slice(0, 5).map((interaction) => (
                  <div key={interaction.id} className="rounded-xl border border-white/10 bg-zinc-900/40 p-2.5">
                    <div className="line-clamp-2 text-xs text-zinc-200">{interaction.commentText}</div>
                    <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px] text-zinc-400">
                      <span className="truncate text-orange-400/90 font-medium">{interaction.automation?.name ?? "Interaction"}</span>
                      <span className="uppercase text-[9px] font-semibold text-emerald-400">{interaction.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
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
