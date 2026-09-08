"use client";

/* eslint-disable @next/next/no-img-element */

/**
 * Luxury Post Picker
 */

import { useEffect, useState } from "react";
import { readCache, writeCache } from "@/lib/client-cache";

const PAGE_SIZE = 60;

interface InstagramPost {
  id: string;
  caption?: string;
  media_type: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp: string;
}

interface PostPickerProps {
  selectedPostId: string | null;
  instagramAccountId?: string | null;
  usedPostIds?: Record<string, string>;
  onSelect: (
    postId: string,
    postUrl?: string,
    thumbUrl?: string,
    caption?: string
  ) => void;
}

export default function PostPicker({
  selectedPostId,
  instagramAccountId,
  usedPostIds,
  onSelect,
}: PostPickerProps) {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [shown, setShown] = useState(PAGE_SIZE);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (instagramAccountId) {
      params.set("instagramAccountId", instagramAccountId);
    }
    params.set("all", "true");

    const cacheKey = `ig-posts:${instagramAccountId ?? "default"}`;
    const cached = readCache<InstagramPost[]>(cacheKey, 15 * 60 * 1000);
    if (cached.data) {
      setPosts(cached.data);
      setLoading(false);
    }

    fetch(`/api/instagram/posts${params.size ? `?${params}` : ""}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success) {
          setPosts(data.data);
          writeCache(cacheKey, data.data);
        } else if (!cached.data) {
          setError(data.error ?? "Failed to load posts");
        }
      })
      .catch(() => {
        if (!cancelled && !cached.data) setError("Failed to load posts");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [instagramAccountId]);

  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-square rounded-xl bg-white/[0.04] animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-xs text-rose-400">{error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-xs text-zinc-500">No posts found on @v3nja2.0</p>
      </div>
    );
  }

  const matching = query.trim()
    ? posts.filter((p) =>
        (p.caption ?? "").toLowerCase().includes(query.trim().toLowerCase())
      )
    : posts;

  const visible = matching.slice(0, shown);
  const remaining = matching.length - visible.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShown(PAGE_SIZE);
          }}
          placeholder="Search reels & posts by caption…"
          className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white placeholder:text-zinc-600 focus:border-orange-500/60 focus:outline-none"
        />
        <span className="shrink-0 text-xs font-mono text-zinc-500">{posts.length} posts</span>
      </div>

      {visible.length === 0 ? (
        <p className="py-6 text-center text-xs text-zinc-500">
          No posts match &ldquo;{query}&rdquo;
        </p>
      ) : (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-64 auto-rows-min content-start overflow-y-auto p-1">
            {visible.map((post) => {
              const isSelected = selectedPostId === post.id;
              const usedByName = usedPostIds?.[post.id];
              const isUsed = Boolean(usedByName) && !isSelected;
              const thumb = post.thumbnail_url ?? post.media_url;
              const isVideo = post.media_type === "VIDEO";
              const showVideo =
                isVideo && hoveredId === post.id && Boolean(post.media_url);

              return (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => onSelect(post.id, post.permalink, thumb, post.caption)}
                  onMouseEnter={() => setHoveredId(post.id)}
                  onMouseLeave={() =>
                    setHoveredId((cur) => (cur === post.id ? null : cur))
                  }
                  aria-pressed={isSelected}
                  title={isUsed ? `Used by "${usedByName}"` : undefined}
                  className={`
                    relative aspect-square rounded-xl overflow-hidden border-2 transition-all group
                    ${
                      isSelected
                        ? "border-orange-500 ring-2 ring-orange-500/50 shadow-lg shadow-orange-500/30 scale-[1.02]"
                        : isUsed
                        ? "border-amber-500/40 hover:border-amber-500/70"
                        : "border-white/10 hover:border-white/30"
                    }
                  `}
                >
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={post.caption?.slice(0, 50) ?? "Instagram post"}
                      loading="lazy"
                      decoding="async"
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                        isUsed ? "opacity-75" : ""
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                      <span className="text-[10px] text-zinc-500">No preview</span>
                    </div>
                  )}

                  {showVideo && (
                    <video
                      src={post.media_url}
                      poster={thumb}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="none"
                      className={`absolute inset-0 h-full w-full object-cover ${
                        isUsed ? "opacity-60" : ""
                      }`}
                    />
                  )}

                  {isVideo && !showVideo && (
                    <span className="absolute top-1.5 right-1.5 text-xs bg-black/60 px-1 rounded backdrop-blur-sm">
                      🎬
                    </span>
                  )}

                  {isSelected && (
                    <span className="absolute bottom-0 inset-x-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black py-0.5 tracking-wider uppercase">
                      Selected
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {remaining > 0 && (
            <button
              type="button"
              onClick={() => setShown((n) => n + PAGE_SIZE)}
              className="w-full rounded-xl border border-white/10 py-2 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all"
            >
              Show {Math.min(PAGE_SIZE, remaining)} more
            </button>
          )}
        </>
      )}
    </div>
  );
}
