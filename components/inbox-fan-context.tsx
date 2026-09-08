"use client";

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

export default function InboxFanContext({ data, loading }: { data: InboxFanContextData | null; loading: boolean }) {
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
            <div className="text-sm font-semibold text-foreground">
              @{data.fan.username ?? "unknown"}
            </div>
            {data.fan.firstName && <div className="text-xs text-muted">{data.fan.firstName}</div>}
          </div>

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

          {data.fan.tags.length > 0 && (
            <div>
              <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted">Tags</div>
              <div className="flex flex-wrap gap-1.5">
                {data.fan.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-accent/10 px-2 py-1 text-[10px] font-medium text-accent">
                    {tag}
                  </span>
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
