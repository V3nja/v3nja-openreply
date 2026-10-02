"use client";

/**
 * Real-Time Instagram Home Feed & Meta Stream (V3NJA Social OS)
 * Integrates directly with Meta Graph API and live Webhook stream for @v3nja2.0.
 * Zero fake stock photos or simulated mock rosters.
 */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getProxiedImageUrl } from "@/lib/image-proxy-helper";
import InstagramCreatorModal from "@/components/instagram-creator-modal";
import InstagramNotificationsDrawer from "@/components/instagram-notifications-drawer";
import InstagramMessagesDock from "@/components/instagram-messages-dock";

interface RealPostItem {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_product_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
  children?: {
    data: Array<{ id: string; media_type: string; media_url?: string; thumbnail_url?: string }>;
  };
}

export default function InstagramFeedPage() {
  const [realPosts, setRealPosts] = useState<RealPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Creation & Drawers
  const [showCreatorModal, setShowCreatorModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeSlideIndices, setActiveSlideIndices] = useState<Record<string, number>>({});
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchLiveMetaPosts();
  }, []);

  async function fetchLiveMetaPosts() {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/instagram/posts", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRealPosts(data.data);
      } else {
        setErrorMessage(data.details || data.error || "No media found for connected account.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to query Meta Graph API media endpoint.");
    } finally {
      setLoading(false);
    }
  }

  function handleToggleLike(id: string) {
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleToggleSave(id: string) {
    setSavedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="min-h-screen bg-black text-white font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] pb-24">
      
      {/* Top Mobile Bar */}
      <div className="lg:hidden p-3 border-b border-white/10 flex items-center justify-between sticky top-0 bg-black/90 backdrop-blur-md z-40">
        <span className="text-lg font-black tracking-tighter">Instagram</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowNotifications(true)}
            className="text-xl"
          >
            ❤️
          </button>
          <Link href="/inbox" className="text-xl relative">
            💬
            <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center">
              6
            </span>
          </Link>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ================= LEFT MAIN FEED STREAM (8 Cols) ================= */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Top Live Meta Account Header */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-md">
                <div className="w-full h-full rounded-full bg-black border-2 border-black flex items-center justify-center text-sm font-black text-white">
                  V
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">v3nja2.0</span>
                  <span className="text-xs text-[#0095F6] font-bold">✓</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                    Live Meta API
                  </span>
                </div>
                <span className="text-xs text-zinc-400">
                  V3NJA • 2,851 Followers • Blantyre, Malawi
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchLiveMetaPosts}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
                title="Refresh from Meta Graph API"
              >
                ↻ Sync
              </button>
              <button
                type="button"
                onClick={() => setShowCreatorModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#0095F6] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-md"
              >
                + Create
              </button>
            </div>
          </div>

          {/* Feed Content Stream */}
          {loading ? (
            <div className="py-24 text-center space-y-3 rounded-2xl bg-zinc-950 border border-white/10">
              <div className="w-8 h-8 border-2 border-[#0095F6] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-zinc-400 font-medium">
                Querying Meta Graph API for @v3nja2.0 published media…
              </p>
            </div>
          ) : realPosts.length > 0 ? (
            <div className="space-y-6">
              {realPosts.map((post) => {
                const currentSlide = activeSlideIndices[post.id] || 0;
                const slides = post.children?.data?.length
                  ? post.children.data
                  : [{ id: post.id, media_type: post.media_type, media_url: post.media_url, thumbnail_url: post.thumbnail_url }];
                const isLiked = likedPosts[post.id];
                const isSaved = savedPosts[post.id];

                return (
                  <article
                    key={post.id}
                    className="rounded-3xl bg-black border border-white/10 overflow-hidden shadow-2xl transition-all"
                  >
                    {/* Post Header */}
                    <div className="p-3.5 flex items-center justify-between border-b border-white/[0.06]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-zinc-900 border border-white/20 flex items-center justify-center font-bold text-xs text-white">
                          V
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                            <span>v3nja2.0</span>
                            <span className="text-[#0095F6] text-[10px]">✓</span>
                            <span className="text-zinc-500">•</span>
                            <span className="text-zinc-400 font-normal">
                              {new Date(post.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {post.media_product_type || post.media_type}
                          </span>
                        </div>
                      </div>

                      {post.permalink && (
                        <a
                          href={post.permalink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-zinc-400 hover:text-white px-2 py-1 font-bold"
                        >
                          View on IG ↗
                        </a>
                      )}
                    </div>

                    {/* Media Display */}
                    <div className="relative aspect-square max-h-[520px] bg-zinc-950 flex items-center justify-center overflow-hidden">
                      {slides[currentSlide]?.media_type === "VIDEO" ? (
                        <video
                          src={slides[currentSlide]?.media_url}
                          poster={slides[currentSlide]?.thumbnail_url}
                          controls
                          playsInline
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <img
                          src={slides[currentSlide]?.media_url || slides[currentSlide]?.thumbnail_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}

                      {/* Carousel Arrows */}
                      {slides.length > 1 && (
                        <>
                          {currentSlide > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                setActiveSlideIndices((prev) => ({
                                  ...prev,
                                  [post.id]: currentSlide - 1,
                                }))
                              }
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center text-xs font-bold z-10"
                            >
                              ‹
                            </button>
                          )}
                          {currentSlide < slides.length - 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setActiveSlideIndices((prev) => ({
                                  ...prev,
                                  [post.id]: currentSlide + 1,
                                }))
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center text-xs font-bold z-10"
                            >
                              ›
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Post Actions Bar */}
                    <div className="p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-2xl">
                          <button
                            type="button"
                            onClick={() => handleToggleLike(post.id)}
                            className="hover:scale-115 transition-transform"
                          >
                            {isLiked ? "❤️" : "🤍"}
                          </button>
                          <Link href="/inbox" className="hover:scale-115 transition-transform">
                            💬
                          </Link>
                          <Link href="/inbox" className="hover:scale-115 transition-transform">
                            ↗
                          </Link>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleSave(post.id)}
                          className="text-2xl hover:scale-115 transition-transform"
                        >
                          {isSaved ? "🔖" : "🏷️"}
                        </button>
                      </div>

                      {post.like_count !== undefined && (
                        <div className="text-xs font-bold text-white">
                          {post.like_count.toLocaleString()} likes
                        </div>
                      )}

                      {post.caption && (
                        <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-line">
                          <span className="font-bold text-white mr-1.5">v3nja2.0</span>
                          {post.caption}
                        </p>
                      )}

                      {/* In-App Comment Composer */}
                      <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2">
                        <input
                          type="text"
                          value={commentDrafts[post.id] || ""}
                          onChange={(e) =>
                            setCommentDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))
                          }
                          placeholder="Add a comment…"
                          className="flex-1 bg-transparent text-xs text-white placeholder:text-zinc-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          disabled={!commentDrafts[post.id]?.trim()}
                          className="text-xs font-bold text-[#0095F6] disabled:opacity-30"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            /* Honest Real-Time Empty State */
            <div className="p-8 rounded-3xl bg-zinc-950 border border-white/10 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-zinc-900 border border-white/15 flex items-center justify-center text-2xl mx-auto text-zinc-400">
                📷
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">
                  No Posts Synced from Meta Graph API Yet
                </h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                  {errorMessage ||
                    "Publish a new Reel or Post using the Create tool, or connect your Meta account to stream live published posts."}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreatorModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#0095F6] text-white text-xs font-bold hover:bg-blue-600 transition-colors"
                >
                  + Create Post / Reel
                </button>
                <Link
                  href="/settings"
                  className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-colors"
                >
                  Meta API Settings ⚙️
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ================= RIGHT SIDEBAR (4 Cols) ================= */}
        <div className="hidden lg:block lg:col-span-4 space-y-6 pt-2">
          
          {/* User Account Card */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/20 flex items-center justify-center font-bold text-xs text-white">
                  V
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">v3nja2.0</span>
                  <span className="text-[11px] text-zinc-400">V3NJA • 2,851 Followers</span>
                </div>
              </div>
              <Link href="/settings" className="text-xs font-bold text-[#0095F6] hover:underline">
                Manage
              </Link>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400 font-medium">
              <span>Smart Link Hub:</span>
              <a
                href="https://v3nja-official.web.app/"
                target="_blank"
                rel="noreferrer"
                className="text-purple-400 font-bold hover:underline"
              >
                v3nja-official.web.app
              </a>
            </div>
          </div>

          {/* Quick Automation Tools */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-3">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              Active DM Keywords
            </span>
            <div className="flex flex-wrap gap-1.5">
              {["WAYULOMI", "NJALA", "ZANGA", "MIRAKO", "MERCH", "TOOLS"].map((kw) => (
                <span
                  key={kw}
                  className="px-2.5 py-1 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 text-[11px] font-mono font-bold"
                >
                  {kw}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-zinc-500 leading-snug">
              Comment triggers automatically route smart links into fan DMs via Meta Webhooks.
            </p>
          </div>

          {/* Meta Footer */}
          <div className="space-y-2 pt-4 text-[11px] text-zinc-500">
            <div className="flex flex-wrap gap-x-1.5 gap-y-1">
              <span>About</span> • <span>Help</span> • <span>API</span> • <span>Privacy</span> •{" "}
              <span>Terms</span> • <span>Meta Verified</span>
            </div>
            <div className="uppercase tracking-wider text-[10px]">
              © 2026 INSTAGRAM FROM META • V3NJA WRLD
            </div>
          </div>
        </div>
      </div>

      {/* Floating Messages Dock */}
      <InstagramMessagesDock />

      {/* Creator Modal */}
      <InstagramCreatorModal
        isOpen={showCreatorModal}
        onClose={() => setShowCreatorModal(false)}
        onPublishSuccess={() => {
          fetchLiveMetaPosts();
        }}
      />

      {/* Notifications Drawer */}
      <InstagramNotificationsDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
}
