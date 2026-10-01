"use client";

/**
 * Universal Instagram Home Feed, Explore & Multi-Category Stream (V3NJA Social OS)
 * Full Meta & Instagram experience with multi-slide carousels, audio tracks, story stickers,
 * double-tap heart reactions, in-app comments, and live creator publishing suite.
 */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getProxiedImageUrl } from "@/lib/image-proxy-helper";
import {
  getLiveStoriesTray,
  getAlgorithmicFeedPosts,
  TRENDING_SOUNDS,
  CREATOR_ROSTER,
  type DetailedFeedPost,
  type DetailedStoryItem,
  type AudioTrack,
} from "@/lib/instagram-feed-engine";
import InstagramCreatorModal from "@/components/instagram-creator-modal";

export default function InstagramFeedPage() {
  const [feedMode, setFeedMode] = useState<"foryou" | "following" | "reels" | "favorites">("foryou");
  const [stories, setStories] = useState<DetailedStoryItem[]>([]);
  const [posts, setPosts] = useState<DetailedFeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Story Viewer
  const [activeStoryViewer, setActiveStoryViewer] = useState<{
    storyIndex: number;
  } | null>(null);

  // Creator Modal
  const [showCreatorModal, setShowCreatorModal] = useState(false);

  // Carousel slide tracking per post
  const [carouselIndices, setCarouselIndices] = useState<Record<string, number>>({});
  const [revealedTagsPostId, setRevealedTagsPostId] = useState<string | null>(null);

  // Double-tap heart animations & like counts
  const [heartAnimPostId, setHeartAnimPostId] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({
    "thee_hyped_teens": true,
    "bilion_vibez": true,
    "takondwa_noniwa": true,
  });

  useEffect(() => {
    // Load live algorithmic stories & posts
    setLoading(true);
    const liveStories = getLiveStoriesTray();
    const livePosts = getAlgorithmicFeedPosts();
    setStories(liveStories);
    setPosts(livePosts);
    setLoading(false);
  }, []);

  function handleDoubleTapLike(postId: string) {
    setHeartAnimPostId(postId);
    setLikedPosts((prev) => {
      const isCurrentlyLiked = prev[postId];
      return { ...prev, [postId]: !isCurrentlyLiked };
    });
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isCurrentlyLiked = likedPosts[postId];
          return {
            ...p,
            likeCount: isCurrentlyLiked ? Math.max(0, p.likeCount - 1) : p.likeCount + 1,
          };
        }
        return p;
      })
    );
    setTimeout(() => setHeartAnimPostId(null), 800);
  }

  function handleToggleSave(postId: string) {
    setSavedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  }

  function handleToggleFollow(username: string) {
    setFollowingMap((prev) => ({ ...prev, [username]: !prev[username] }));
  }

  function handleAddComment(postId: string) {
    const text = commentDrafts[postId]?.trim();
    if (!text) return;
    const newComment = {
      id: `c_${Date.now()}`,
      username: "v3nja2.0",
      text,
      time: "Just now",
    };
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, commentsCount: p.commentsCount + 1, comments: [...(p.comments || []), newComment] }
          : p
      )
    );
    setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
  }

  const filteredPosts = posts.filter((p) => {
    if (feedMode === "reels") return p.mediaType === "VIDEO";
    if (feedMode === "following") return followingMap[p.author.username];
    if (feedMode === "favorites") return savedPosts[p.id] || p.isLikedByMe;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">
      
      {/* Top Header & Feed Category Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-zinc-950/80 border border-white/[0.08] shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shadow-lg shadow-pink-500/20 text-xl font-bold">
            📷
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>Instagram Home Feed</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 border border-pink-500/30 text-pink-300">
                Meta Universal
              </span>
            </h1>
            <p className="text-xs text-zinc-400">Stories, Multi-Slide Carousels, Vertical Reels, Audio & Discoveries</p>
          </div>
        </div>

        {/* Action Controls & (+) Create Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCreatorModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-purple-500/20"
          >
            <span className="text-base font-black">+</span>
            <span>Create</span>
          </button>

          <Link
            href="/inbox"
            className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-bold text-zinc-200 hover:text-white transition-all flex items-center gap-1.5"
          >
            <span>💬</span>
            <span>Direct</span>
          </Link>
        </div>
      </div>

      {/* Feed Filter Segment Pills: [ For You ] [ Following ] [ Reels ] [ Favorites ] */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-950/80 border border-white/[0.08] overflow-x-auto no-scrollbar shadow-lg">
        {[
          { id: "foryou", label: "For You", icon: "✨" },
          { id: "following", label: "Following", icon: "👥" },
          { id: "reels", label: "Reels Stream", icon: "🎬" },
          { id: "favorites", label: "Saved & Liked", icon: "⭐" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFeedMode(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              feedMode === tab.id
                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md scale-[1.02]"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Stories Tray & Feed Posts Stream (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* ================= STORIES TRAY ================= */}
          <div className="p-4 rounded-3xl bg-zinc-950/80 border border-white/[0.08] flex items-center gap-4 overflow-x-auto no-scrollbar shadow-xl">
            {/* Current User Story Bubble with (+) Add Button */}
            <div
              onClick={() => setShowCreatorModal(true)}
              className="flex flex-col items-center shrink-0 cursor-pointer group select-none"
            >
              <div className="relative mb-1">
                <div className="w-16 h-16 rounded-full p-[2px] bg-zinc-800 group-hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-full bg-zinc-900 border-2 border-black flex items-center justify-center text-sm font-bold text-white relative overflow-hidden">
                    <span>V</span>
                    <img
                      src={getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.82787-19/799754867_18082733579698157_1761305583527068474_n.jpg")}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover rounded-full"
                      onError={(e) => { (e.currentTarget as HTMLElement).style.display = "none"; }}
                    />
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#0095F6] text-white flex items-center justify-center text-xs font-black ring-2 ring-black">
                  +
                </span>
              </div>
              <span className="text-[11px] text-zinc-300 font-medium max-w-[64px] truncate text-center">
                Your Story
              </span>
            </div>

            {/* Stories from Other Creators */}
            {stories.map((st, i) => (
              <div
                key={st.id}
                onClick={() => setActiveStoryViewer({ storyIndex: i })}
                className="flex flex-col items-center shrink-0 cursor-pointer group select-none"
              >
                <div className="relative mb-1">
                  <div
                    className={`w-16 h-16 rounded-full p-[2.5px] transition-transform group-hover:scale-105 shadow-md ${
                      !st.hasSeen
                        ? "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]"
                        : "bg-zinc-700/60"
                    }`}
                  >
                    <div className="w-full h-full rounded-full bg-zinc-900 border-2 border-black flex items-center justify-center text-sm font-bold text-white relative overflow-hidden">
                      <span>{st.author.username[0].toUpperCase()}</span>
                      {st.author.avatarUrl && (
                        <img
                          src={getProxiedImageUrl(st.author.avatarUrl)}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="absolute inset-0 w-full h-full rounded-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLElement).style.display = "none"; }}
                        />
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-zinc-300 font-medium max-w-[64px] truncate text-center">
                  {st.author.username}
                </span>
              </div>
            ))}
          </div>

          {/* ================= POSTS FEED STREAM ================= */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs text-zinc-400 font-semibold">Loading algorithmic Instagram feed…</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-zinc-950 border border-white/10 text-zinc-400 text-xs">
              No posts found in this feed view.
            </div>
          ) : (
            filteredPosts.map((post) => {
              const currentSlide = carouselIndices[post.id] || 0;
              const slides = post.slides || [{ id: "main", mediaUrl: post.mediaUrl, mediaType: post.mediaType }];
              const isLiked = likedPosts[post.id] || post.isLikedByMe;
              const isSaved = savedPosts[post.id];

              return (
                <div
                  key={post.id}
                  className="rounded-3xl bg-zinc-950/90 border border-white/[0.08] overflow-hidden shadow-2xl transition-all space-y-2"
                >
                  {/* Post Header */}
                  <div className="p-3.5 flex items-center justify-between border-b border-white/[0.06] bg-black/40">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/inbox?user=${post.author.username}`}
                        className="w-10 h-10 rounded-full p-[1.5px] bg-gradient-to-tr from-pink-500 to-purple-600 block shadow-sm overflow-hidden shrink-0"
                      >
                        <div className="w-full h-full rounded-full bg-zinc-900 border-2 border-black flex items-center justify-center text-xs font-bold text-white relative overflow-hidden">
                          <span>{post.author.username[0].toUpperCase()}</span>
                          {post.author.avatarUrl && (
                            <img
                              src={getProxiedImageUrl(post.author.avatarUrl)}
                              alt=""
                              referrerPolicy="no-referrer"
                              className="absolute inset-0 w-full h-full rounded-full object-cover"
                              onError={(e) => { (e.currentTarget as HTMLElement).style.display = "none"; }}
                            />
                          )}
                        </div>
                      </Link>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/inbox?user=${post.author.username}`}
                            className="text-xs font-bold text-white hover:text-purple-300 transition-colors truncate"
                          >
                            {post.author.username}
                          </Link>
                          {post.author.isVerified && <span className="text-[10px] text-blue-400 font-bold">✓</span>}
                          <span className="text-zinc-500 text-[10px]">•</span>
                          <button
                            type="button"
                            onClick={() => handleToggleFollow(post.author.username)}
                            className={`text-[11px] font-bold transition-all ${
                              followingMap[post.author.username]
                                ? "text-zinc-400"
                                : "text-blue-400 hover:text-blue-300"
                            }`}
                          >
                            {followingMap[post.author.username] ? "Following" : "Follow"}
                          </button>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono truncate">
                          <span>{post.location || "Instagram"}</span>
                          {post.audioTrack && (
                            <>
                              <span>•</span>
                              <span>♫ {post.audioTrack.title}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button className="text-zinc-400 hover:text-white text-sm font-bold px-2 py-1">•••</button>
                  </div>

                  {/* Media Container with Carousel & Double Tap Heart */}
                  <div
                    onDoubleClick={() => handleDoubleTapLike(post.id)}
                    className="relative aspect-square bg-gradient-to-tr from-purple-950/40 via-zinc-900 to-black flex items-center justify-center select-none overflow-hidden group cursor-pointer"
                  >
                    <div className="flex flex-col items-center justify-center p-3 text-center text-zinc-500 select-none">
                      <span className="text-3xl mb-1">📷</span>
                      <span className="text-xs font-bold text-zinc-400">View Instagram Media</span>
                    </div>

                    {slides[currentSlide]?.mediaType === "VIDEO" ? (
                      <video
                        src={getProxiedImageUrl(slides[currentSlide].mediaUrl)}
                        controls
                        playsInline
                        loop
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                    ) : (
                      <img
                        src={getProxiedImageUrl(slides[currentSlide]?.mediaUrl)}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
                        onError={(e) => { (e.currentTarget as HTMLElement).style.display = "none"; }}
                      />
                    )}

                    {/* Carousel Navigation Buttons & Dots Indicator */}
                    {slides.length > 1 && (
                      <>
                        {currentSlide > 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCarouselIndices((prev) => ({ ...prev, [post.id]: currentSlide - 1 }));
                            }}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center text-xs font-bold z-10"
                          >
                            ‹
                          </button>
                        )}
                        {currentSlide < slides.length - 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCarouselIndices((prev) => ({ ...prev, [post.id]: currentSlide + 1 }));
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center text-xs font-bold z-10"
                          >
                            ›
                          </button>
                        )}

                        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-white font-mono font-bold z-10">
                          {currentSlide + 1}/{slides.length}
                        </div>
                      </>
                    )}

                    {/* Tagged People Reveal Icon (`👤`) */}
                    {post.taggedUsers && post.taggedUsers.length > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRevealedTagsPostId(revealedTagsPostId === post.id ? null : post.id);
                        }}
                        className="absolute bottom-3 left-3 w-7 h-7 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center text-xs shadow-lg z-10"
                        title="Tagged Accounts"
                      >
                        👤
                      </button>
                    )}

                    {/* Tagged People Tags Overlay */}
                    {revealedTagsPostId === post.id && post.taggedUsers && (
                      <div className="absolute inset-0 p-4 pointer-events-none z-10">
                        {post.taggedUsers.map((tag, tIdx) => (
                          <div
                            key={tIdx}
                            style={{ top: `${tag.yPercent}%`, left: `${tag.xPercent}%`, transform: "translate(-50%, -50%)" }}
                            className="absolute bg-black/85 backdrop-blur-md border border-white/20 text-white px-2.5 py-1 rounded-xl text-[11px] font-bold shadow-2xl pointer-events-auto"
                          >
                            <Link href={`/inbox?user=${tag.username}`}>@{tag.username}</Link>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Animated Double Tap Heart Burst */}
                    {heartAnimPostId === post.id && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 animate-in zoom-in-50 fade-in duration-200">
                        <span className="text-7xl drop-shadow-2xl animate-bounce">❤️</span>
                      </div>
                    )}
                  </div>

                  {/* Post Action Buttons Bar */}
                  <div className="p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xl">
                        <button
                          type="button"
                          onClick={() => handleDoubleTapLike(post.id)}
                          className={`hover:scale-125 active:scale-95 transition-transform ${
                            isLiked ? "text-rose-500 font-bold" : "text-zinc-200 hover:text-rose-400"
                          }`}
                        >
                          {isLiked ? "❤️" : "🤍"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const inp = document.getElementById(`comment_inp_${post.id}`);
                            if (inp) inp.focus();
                          }}
                          className="hover:scale-125 text-zinc-200 hover:text-white transition-transform text-lg"
                        >
                          💬
                        </button>

                        <Link
                          href={`/inbox?user=${post.author.username}`}
                          className="hover:scale-125 text-zinc-200 hover:text-white transition-transform text-lg"
                          title="Share to Direct Message"
                        >
                          ↗
                        </Link>
                      </div>

                      {/* Bookmark / Save Post */}
                      <button
                        type="button"
                        onClick={() => handleToggleSave(post.id)}
                        className={`text-xl hover:scale-125 transition-transform ${
                          isSaved ? "text-purple-400 font-bold" : "text-zinc-300 hover:text-white"
                        }`}
                        title="Save to Collections"
                      >
                        {isSaved ? "🔖" : "🏷️"}
                      </button>
                    </div>

                    {/* Likes Count */}
                    <div className="text-xs font-bold text-white">
                      {post.likeCount.toLocaleString()} likes
                    </div>

                    {/* Caption */}
                    <div className="text-xs text-zinc-200 whitespace-pre-line leading-relaxed">
                      <Link href={`/inbox?user=${post.author.username}`} className="font-bold text-white mr-1.5">
                        {post.author.username}
                      </Link>
                      {post.caption}
                    </div>

                    {/* Audio Attribution Marquee Bar */}
                    {post.audioTrack && (
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-medium">
                        <span>🎵</span>
                        <span className="truncate">{post.audioTrack.title} • {post.audioTrack.artist}</span>
                      </div>
                    )}

                    {/* Comments Stream */}
                    {(post.comments || []).length > 0 && (
                      <div className="space-y-1 text-xs pt-1">
                        {(post.comments || []).slice(0, 3).map((cmt) => (
                          <div key={cmt.id} className="text-zinc-300">
                            <span className="font-bold text-white mr-1">@{cmt.username}</span>
                            <span>{cmt.text}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* In-App Interactive Comment Bar */}
                    <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2">
                      <input
                        id={`comment_inp_${post.id}`}
                        type="text"
                        value={commentDrafts[post.id] || ""}
                        onChange={(e) =>
                          setCommentDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddComment(post.id);
                        }}
                        placeholder="Add a comment…"
                        className="flex-1 bg-transparent text-xs text-white placeholder:text-zinc-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddComment(post.id)}
                        disabled={!commentDrafts[post.id]?.trim()}
                        className="text-xs font-bold text-purple-400 hover:text-purple-300 disabled:opacity-30 transition-all"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: User Profile Card, Trending Audio & Suggested Creators */}
        <div className="hidden lg:block space-y-6">
          {/* User Profile Card */}
          <div className="p-4 rounded-3xl bg-zinc-950/80 border border-white/[0.08] flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 to-purple-600 shadow-md">
                <div className="w-full h-full rounded-full bg-zinc-900 border-2 border-black flex items-center justify-center text-sm font-bold text-white relative overflow-hidden">
                  <span>V</span>
                  <img
                    src={getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.82787-19/799754867_18082733579698157_1761305583527068474_n.jpg")}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full rounded-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLElement).style.display = "none"; }}
                  />
                </div>
              </div>
              <div>
                <span className="text-xs font-extrabold text-white block">v3nja2.0</span>
                <span className="text-[11px] text-zinc-400">V3NJA • 2,851 Followers</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCreatorModal(true)}
              className="text-xs font-bold text-purple-400 hover:text-purple-300"
            >
              + Create
            </button>
          </div>

          {/* Trending Music & Sound Library */}
          <div className="p-5 rounded-3xl bg-zinc-950/80 border border-white/[0.08] space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 uppercase tracking-wider">
                <span>🎵</span> Trending Sounds
              </span>
              <span className="text-[11px] font-bold text-purple-400">See All</span>
            </div>

            <div className="space-y-3">
              {TRENDING_SOUNDS.slice(0, 4).map((snd) => (
                <div key={snd.id} className="flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-black shrink-0">
                      <img src={snd.albumArtUrl} alt={snd.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white truncate block">
                        {snd.title}
                      </span>
                      <span className="text-[10px] text-zinc-400 truncate block">
                        {snd.artist} • {snd.usesCount ? `${snd.usesCount.toLocaleString()} reels` : "Sound"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCreatorModal(true)}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-purple-600 text-white text-[10px] font-bold transition-colors"
                  >
                    Use
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Creators for You */}
          <div className="p-5 rounded-3xl bg-zinc-950/80 border border-white/[0.08] space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Suggested For You
              </span>
              <span className="text-[11px] font-bold text-white hover:text-purple-300 cursor-pointer">
                See All
              </span>
            </div>

            <div className="space-y-3.5">
              {CREATOR_ROSTER.slice(1, 6).map((sug) => (
                <div key={sug.username} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0 relative overflow-hidden">
                      <span>{sug.username[0].toUpperCase()}</span>
                      {sug.avatarUrl && (
                        <img
                          src={getProxiedImageUrl(sug.avatarUrl)}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLElement).style.display = "none"; }}
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link href={`/inbox?user=${sug.username}`} className="text-xs font-bold text-white truncate block hover:underline">
                        @{sug.username}
                      </Link>
                      <span className="text-[10px] text-zinc-400 truncate block">
                        {sug.followersCount.toLocaleString()} followers
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleFollow(sug.username)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      followingMap[sug.username]
                        ? "bg-white/10 text-zinc-300 hover:bg-white/20"
                        : "bg-[#0095F6] text-white hover:bg-blue-600 shadow-sm"
                    }`}
                  >
                    {followingMap[sug.username] ? "Following" : "Follow"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= FULLSCREEN STORY VIEWER WITH STICKERS & AUDIO ================= */}
      {activeStoryViewer !== null && stories[activeStoryViewer.storyIndex] && (
        <div className="fixed inset-0 z-90 flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm aspect-[9/16] rounded-3xl overflow-hidden bg-zinc-900 border border-white/15 shadow-2xl flex flex-col justify-between p-4">
            
            {/* Top Progress Segment Bars */}
            <div className="z-10 space-y-2">
              <div className="flex items-center gap-1">
                {stories.map((_, idx) => (
                  <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-white rounded-full transition-all ${
                        idx < activeStoryViewer.storyIndex
                          ? "w-full"
                          : idx === activeStoryViewer.storyIndex
                          ? "w-full animate-pulse"
                          : "w-0"
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* Story Author Header */}
              <div className="flex items-center justify-between text-white text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white flex items-center justify-center text-xs font-bold text-white relative overflow-hidden">
                    <span>{stories[activeStoryViewer.storyIndex].author.username[0].toUpperCase()}</span>
                    {stories[activeStoryViewer.storyIndex].author.avatarUrl && (
                      <img
                        src={getProxiedImageUrl(stories[activeStoryViewer.storyIndex].author.avatarUrl)}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLElement).style.display = "none"; }}
                      />
                    )}
                  </div>
                  <div>
                    <span className="font-bold block">@{stories[activeStoryViewer.storyIndex].author.username}</span>
                    <span className="text-[10px] text-zinc-400">{stories[activeStoryViewer.storyIndex].timestamp}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveStoryViewer(null)}
                  className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Media Background */}
            <div className="absolute inset-0 bg-zinc-950 flex items-center justify-center">
              <img
                src={getProxiedImageUrl(stories[activeStoryViewer.storyIndex].mediaUrl)}
                alt=""
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLElement).style.display = "none"; }}
              />

              {/* Interactive Story Stickers */}
              {stories[activeStoryViewer.storyIndex].stickers?.map((stk, sIdx) => (
                <div
                  key={sIdx}
                  style={{ top: `${stk.yPercent}%`, left: `${stk.xPercent}%`, transform: "translate(-50%, -50%)" }}
                  className="absolute z-10"
                >
                  {stk.type === "link" && (
                    <a
                      href={stk.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-2xl bg-white text-black font-extrabold text-xs shadow-2xl flex items-center gap-1.5 hover:scale-105 transition-transform"
                    >
                      <span>🔗</span>
                      <span>{stk.text}</span>
                    </a>
                  )}

                  {stk.type === "poll" && (
                    <div className="p-3 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/20 text-white text-center space-y-2 shadow-2xl min-w-[180px]">
                      <div className="font-bold text-xs">{stk.question}</div>
                      <div className="space-y-1">
                        {stk.options?.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => alert(`Voted: ${opt}`)}
                            className="w-full py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {stk.type === "mention" && (
                    <div className="px-3 py-1 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold shadow-lg">
                      @{stk.username}
                    </div>
                  )}
                </div>
              ))}

              {/* Click Left / Right to Navigate Stories */}
              <div
                className="absolute inset-y-0 left-0 w-1/3 cursor-pointer z-0"
                onClick={() => {
                  if (activeStoryViewer.storyIndex > 0) {
                    setActiveStoryViewer({ storyIndex: activeStoryViewer.storyIndex - 1 });
                  }
                }}
              />
              <div
                className="absolute inset-y-0 right-0 w-1/3 cursor-pointer z-0"
                onClick={() => {
                  if (activeStoryViewer.storyIndex < stories.length - 1) {
                    setActiveStoryViewer({ storyIndex: activeStoryViewer.storyIndex + 1 });
                  } else {
                    setActiveStoryViewer(null);
                  }
                }}
              />
            </div>

            {/* Bottom Caption & Reactions Bar */}
            <div className="z-10 space-y-2">
              {stories[activeStoryViewer.storyIndex].caption && (
                <div className="p-2.5 rounded-2xl bg-black/60 backdrop-blur-md text-xs text-white text-center">
                  {stories[activeStoryViewer.storyIndex].caption}
                </div>
              )}

              {/* Story Audio Track Bar */}
              {stories[activeStoryViewer.storyIndex].audioTrack && (
                <div className="p-1.5 rounded-xl bg-black/60 backdrop-blur-md text-[11px] text-white flex items-center justify-center gap-1.5 font-medium">
                  <span>🎵</span>
                  <span>{stories[activeStoryViewer.storyIndex].audioTrack?.title} • {stories[activeStoryViewer.storyIndex].audioTrack?.artist}</span>
                </div>
              )}

              {/* Quick Reactions */}
              <div className="flex items-center justify-around py-1">
                {["❤️", "🔥", "👏", "😂", "😮", "🙌"].map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => {
                      alert(`Sent ${em} to @${stories[activeStoryViewer.storyIndex].author.username}`);
                      setActiveStoryViewer(null);
                    }}
                    className="text-2xl hover:scale-130 active:scale-90 transition-transform"
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= UNIVERSAL INSTAGRAM CREATOR MODAL ================= */}
      <InstagramCreatorModal
        isOpen={showCreatorModal}
        onClose={() => setShowCreatorModal(false)}
        onPublishSuccess={(newPost) => {
          const created: DetailedFeedPost = {
            id: `post_new_${Date.now()}`,
            author: CREATOR_ROSTER[0],
            caption: newPost.caption || "New drop!",
            mediaType: newPost.mode === "reel" ? "VIDEO" : (newPost.mediaFiles?.length > 1 ? "CAROUSEL" : "IMAGE"),
            mediaUrl: newPost.mediaFiles?.[0]?.url || getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.82787-19/799754867_18082733579698157_1761305583527068474_n.jpg"),
            thumbnailUrl: newPost.mediaFiles?.[0]?.url || getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.82787-19/799754867_18082733579698157_1761305583527068474_n.jpg"),
            slides: newPost.mediaFiles?.map((f: any, idx: number) => ({ id: `sl_${idx}`, mediaUrl: f.url, mediaType: f.type === "video" ? "VIDEO" : "IMAGE" })),
            audioTrack: newPost.audioTrack,
            location: "Blantyre, Malawi",
            likeCount: 1,
            commentsCount: 0,
            timestamp: "Just now",
            isLikedByMe: true,
          };
          setPosts([created, ...posts]);
        }}
      />
    </div>
  );
}
