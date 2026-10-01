"use client";

/**
 * Universal Instagram Home Feed (V3NJA Social OS)
 * Exact authentic Meta Instagram web experience matching user screenshots with real creators,
 * stories carousel, multi-slide carousels, audio marquees, and right-hand suggestions rail.
 */

import React, { useState } from "react";
import Link from "next/link";
import {
  getLiveStoriesTray,
  getAlgorithmicFeedPosts,
  SUGGESTED_SIDEBAR_PROFILES,
  type DetailedFeedPost,
  type DetailedStoryItem,
} from "@/lib/instagram-feed-engine";
import InstagramCreatorModal from "@/components/instagram-creator-modal";
import InstagramNotificationsDrawer from "@/components/instagram-notifications-drawer";
import InstagramMessagesDock from "@/components/instagram-messages-dock";

export default function InstagramFeedPage() {
  const [stories, setStories] = useState<DetailedStoryItem[]>(getLiveStoriesTray());
  const [posts, setPosts] = useState<DetailedFeedPost[]>(getAlgorithmicFeedPosts());
  const [suggested, setSuggested] = useState(SUGGESTED_SIDEBAR_PROFILES);

  // Modals & Drawers
  const [showCreatorModal, setShowCreatorModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeStoryViewer, setActiveStoryViewer] = useState<{ storyIndex: number } | null>(null);

  // Post interactions
  const [carouselIndices, setCarouselIndices] = useState<Record<string, number>>({});
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({
    "post_finch": false,
    "post_melda": true,
    "post_reward": false,
    "post_skand": true,
  });
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({
    "finchbergling": true,
    "rewardbeatz": true,
    "skand.ai": true,
  });
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [heartAnimPostId, setHeartAnimPostId] = useState<string | null>(null);

  function handleDoubleTapLike(postId: string) {
    setHeartAnimPostId(postId);
    const wasLiked = likedPosts[postId];
    setLikedPosts((prev) => ({ ...prev, [postId]: !wasLiked }));
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            likeCount: wasLiked ? Math.max(0, p.likeCount - 1) : p.likeCount + 1,
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
          ? {
              ...p,
              commentsCount: p.commentsCount + 1,
              comments: [...(p.comments || []), newComment],
            }
          : p
      )
    );
    setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
  }

  return (
    <div className="min-h-screen bg-black text-white font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] pb-24">
      
      {/* Top Mobile Bar (When screen is small) */}
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

      {/* Main Responsive Grid Layout */}
      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ================= LEFT / MAIN FEED COLUMN (8 Cols) ================= */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* STORIES CAROUSEL TRAY (Matching screenshot 4) */}
          <div className="relative p-3 rounded-2xl bg-black border border-white/10 flex items-center gap-4 overflow-x-auto no-scrollbar shadow-lg">
            {/* V3NJA Current Story */}
            <div
              onClick={() => setShowCreatorModal(true)}
              className="flex flex-col items-center shrink-0 cursor-pointer group select-none"
            >
              <div className="relative mb-1">
                <div className="w-16 h-16 rounded-full p-[2px] bg-zinc-800 group-hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-full bg-zinc-900 border-2 border-black flex items-center justify-center text-sm font-bold text-white relative overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#0095F6] text-white flex items-center justify-center text-xs font-black ring-2 ring-black">
                  +
                </span>
              </div>
              <span className="text-[11px] text-zinc-300 font-medium max-w-[68px] truncate text-center">
                Your story
              </span>
            </div>

            {/* Other Creator Stories (Matching screenshot 4) */}
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
                      <img
                        src={st.author.avatarUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-zinc-300 font-medium max-w-[68px] truncate text-center">
                  {st.author.username}
                </span>
              </div>
            ))}
          </div>

          {/* MAIN POSTS STREAM */}
          <div className="space-y-6">
            {posts.map((post) => {
              const currentSlide = carouselIndices[post.id] || 0;
              const slides = post.slides || [
                { id: "main", mediaUrl: post.mediaUrl, mediaType: post.mediaType },
              ];
              const isLiked = likedPosts[post.id];
              const isSaved = savedPosts[post.id];
              const isFollowingAuthor = followingMap[post.author.username];

              return (
                <article
                  key={post.id}
                  className="rounded-3xl bg-black border border-white/10 overflow-hidden shadow-2xl transition-all"
                >
                  {/* Post Top Header */}
                  <div className="p-3.5 flex items-center justify-between border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/inbox?user=${post.author.username}`}
                        className="w-10 h-10 rounded-full p-[1.5px] bg-gradient-to-tr from-pink-500 to-purple-600 block shrink-0"
                      >
                        <img
                          src={post.author.avatarUrl}
                          alt=""
                          className="w-full h-full rounded-full object-cover border border-black"
                        />
                      </Link>

                      <div>
                        <div className="flex items-center gap-1.5 leading-tight">
                          <Link
                            href={`/inbox?user=${post.author.username}`}
                            className="text-xs font-bold text-white hover:underline truncate"
                          >
                            {post.author.username}
                          </Link>
                          {post.author.isVerified && (
                            <span className="text-[11px] text-[#0095F6] font-bold">✓</span>
                          )}
                          <span className="text-zinc-500 text-[10px]">•</span>
                          <span className="text-zinc-400 text-xs">{post.timestamp}</span>
                          <span className="text-zinc-500 text-[10px]">•</span>
                          <button
                            type="button"
                            onClick={() => handleToggleFollow(post.author.username)}
                            className={`text-xs font-bold transition-colors ${
                              isFollowingAuthor
                                ? "text-zinc-400"
                                : "text-[#0095F6] hover:text-blue-400"
                            }`}
                          >
                            {isFollowingAuthor ? "Following" : "Follow"}
                          </button>
                        </div>
                        {post.audioTrack && (
                          <div className="text-[10px] text-zinc-400 font-mono mt-0.5 truncate">
                            ♫ {post.audioTrack.title}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="text-zinc-400 hover:text-white font-bold px-2 py-1"
                    >
                      •••
                    </button>
                  </div>

                  {/* Post Media Container with Text Overlays & Carousels */}
                  <div
                    onDoubleClick={() => handleDoubleTapLike(post.id)}
                    className="relative aspect-square max-h-[520px] bg-zinc-950 flex items-center justify-center select-none overflow-hidden group cursor-pointer"
                  >
                    <img
                      src={slides[currentSlide]?.mediaUrl || post.mediaUrl}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                    />

                    {/* Bold Text Overlay (as seen in screenshots 1, 2, 4) */}
                    {slides[currentSlide]?.textOverlay && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6 text-center">
                        <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight drop-shadow-2xl max-w-md leading-snug">
                          {slides[currentSlide].textOverlay}
                        </h2>
                      </div>
                    )}

                    {/* Carousel Nav Arrows */}
                    {slides.length > 1 && (
                      <>
                        {currentSlide > 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCarouselIndices((prev) => ({
                                ...prev,
                                [post.id]: currentSlide - 1,
                              }));
                            }}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center text-sm font-bold z-10 shadow-lg"
                          >
                            ‹
                          </button>
                        )}
                        {currentSlide < slides.length - 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCarouselIndices((prev) => ({
                                ...prev,
                                [post.id]: currentSlide + 1,
                              }));
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center text-sm font-bold z-10 shadow-lg"
                          >
                            ›
                          </button>
                        )}
                      </>
                    )}

                    {/* Double-tap Heart Burst */}
                    {heartAnimPostId === post.id && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 animate-in zoom-in-50 fade-in duration-200">
                        <span className="text-8xl drop-shadow-2xl animate-bounce">❤️</span>
                      </div>
                    )}
                  </div>

                  {/* Carousel Dot Indicators */}
                  {slides.length > 1 && (
                    <div className="flex items-center justify-center gap-1.5 py-2">
                      {slides.map((_, sIdx) => (
                        <div
                          key={sIdx}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${
                            currentSlide === sIdx ? "bg-[#0095F6] scale-125" : "bg-zinc-600"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Action Icons Rail (Heart, Comment, Share, Bookmark) */}
                  <div className="px-4 py-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-2xl">
                        <button
                          type="button"
                          onClick={() => handleDoubleTapLike(post.id)}
                          className={`hover:scale-115 active:scale-90 transition-transform ${
                            isLiked ? "text-rose-500 font-bold" : "text-white hover:text-rose-400"
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
                          className="hover:scale-115 text-white transition-transform"
                        >
                          💬
                        </button>

                        <Link
                          href={`/inbox?user=${post.author.username}`}
                          className="hover:scale-115 text-white transition-transform"
                          title="Share to Direct Message"
                        >
                          ↗
                        </Link>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleSave(post.id)}
                        className={`text-2xl hover:scale-115 transition-transform ${
                          isSaved ? "text-white font-bold" : "text-zinc-300 hover:text-white"
                        }`}
                      >
                        {isSaved ? "🔖" : "🏷️"}
                      </button>
                    </div>

                    {/* Likes Count */}
                    <div className="text-xs font-bold text-white">
                      {post.likeCount.toLocaleString()} likes
                    </div>

                    {/* Caption */}
                    <div className="text-xs text-zinc-200 leading-relaxed">
                      <Link
                        href={`/inbox?user=${post.author.username}`}
                        className="font-bold text-white mr-1.5 hover:underline"
                      >
                        {post.author.username}
                      </Link>
                      {post.author.isVerified && (
                        <span className="text-[#0095F6] text-[10px] font-bold mr-1">✓</span>
                      )}
                      {post.caption}
                    </div>

                    {/* Liked By Preview */}
                    {post.likedByPreview && (
                      <div className="text-[11px] text-zinc-400">
                        Liked by <span className="font-bold text-zinc-300">{post.likedByPreview}</span>
                      </div>
                    )}

                    {/* Comments Count & Snippets */}
                    {post.commentsCount > 0 && (
                      <div className="text-xs text-zinc-400 cursor-pointer hover:underline">
                        View all {post.commentsCount} comments
                      </div>
                    )}

                    {(post.comments || []).slice(0, 2).map((cmt) => (
                      <div key={cmt.id} className="text-xs text-zinc-300">
                        <span className="font-bold text-white mr-1.5">@{cmt.username}</span>
                        <span>{cmt.text}</span>
                      </div>
                    ))}

                    {/* In-Line Comment Box */}
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
                        className="text-xs font-bold text-[#0095F6] hover:text-blue-400 disabled:opacity-30 transition-all"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* ================= RIGHT SIDEBAR COLUMN (4 Cols) ================= */}
        <div className="hidden lg:block lg:col-span-4 space-y-6 pt-2">
          
          {/* User Account Switcher Box (Matching screenshot 4) */}
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full p-[1.5px] bg-gradient-to-tr from-pink-500 to-purple-600">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                  alt=""
                  className="w-full h-full rounded-full object-cover border border-black"
                />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">v3nja2.0</span>
                <span className="text-xs text-zinc-400">V3NJA</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCreatorModal(true)}
              className="text-xs font-bold text-[#0095F6] hover:text-blue-400"
            >
              Switch
            </button>
          </div>

          {/* Suggested for You Section (Matching screenshot 4) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-zinc-400">Suggested for you</span>
              <button
                type="button"
                onClick={() => {}}
                className="text-white hover:text-zinc-300"
              >
                See all
              </button>
            </div>

            <div className="space-y-3.5">
              {suggested.map((sug) => {
                const isFollowed = followingMap[sug.username];

                return (
                  <div key={sug.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                        <img
                          src={sug.avatarUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 leading-tight">
                        <span className="text-xs font-bold text-white truncate block hover:underline cursor-pointer">
                          {sug.displayName}
                        </span>
                        <span className="text-[11px] text-zinc-400 truncate block">
                          {sug.reason}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleFollow(sug.username)}
                      className={`text-xs font-bold transition-colors ${
                        isFollowed
                          ? "text-zinc-400 hover:text-white"
                          : "text-[#0095F6] hover:text-blue-400"
                      }`}
                    >
                      {isFollowed ? "Following" : "Follow"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Meta & Instagram Footer (Matching screenshot 4) */}
          <div className="space-y-3 pt-6 text-[11px] text-zinc-500 leading-normal">
            <div className="flex flex-wrap gap-x-1.5 gap-y-1">
              <span>About</span> • <span>Help</span> • <span>Press</span> • <span>API</span> •{" "}
              <span>Jobs</span> • <span>Privacy</span> • <span>Terms</span> • <span>Locations</span> •{" "}
              <span>Language</span> • <span>Meta Verified</span>
            </div>
            <div className="uppercase tracking-wider text-[10px]">
              © 2026 INSTAGRAM FROM META
            </div>
          </div>
        </div>
      </div>

      {/* ================= FULLSCREEN STORY VIEWER ================= */}
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
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white">
                    <img
                      src={stories[activeStoryViewer.storyIndex].author.avatarUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="font-bold block">
                      @{stories[activeStoryViewer.storyIndex].author.username}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {stories[activeStoryViewer.storyIndex].timestamp}
                    </span>
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
                src={stories[activeStoryViewer.storyIndex].mediaUrl}
                alt=""
                className="w-full h-full object-cover"
              />

              {/* Interactive Story Stickers */}
              {stories[activeStoryViewer.storyIndex].stickers?.map((stk, sIdx) => (
                <div
                  key={sIdx}
                  style={{
                    top: `${stk.yPercent}%`,
                    left: `${stk.xPercent}%`,
                    transform: "translate(-50%, -50%)",
                  }}
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
                </div>
              ))}

              {/* Click Left / Right to Navigate */}
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

            {/* Bottom Caption */}
            <div className="z-10 space-y-2">
              {stories[activeStoryViewer.storyIndex].caption && (
                <div className="p-2.5 rounded-2xl bg-black/60 backdrop-blur-md text-xs text-white text-center">
                  {stories[activeStoryViewer.storyIndex].caption}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Messages Widget Dock */}
      <InstagramMessagesDock />

      {/* Universal Creator Modal */}
      <InstagramCreatorModal
        isOpen={showCreatorModal}
        onClose={() => setShowCreatorModal(false)}
        onPublishSuccess={(newPost) => {
          const created: DetailedFeedPost = {
            id: `post_new_${Date.now()}`,
            author: {
              id: "v3nja",
              username: "v3nja2.0",
              name: "V3NJA",
              avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
              isVerified: true,
              category: "Singer / Producer",
              followersCount: 2851,
              followingCount: 142,
            },
            caption: newPost.caption || "New drop!",
            mediaType: newPost.mode === "reel" ? "VIDEO" : "IMAGE",
            mediaUrl:
              newPost.mediaFiles?.[0]?.url ||
              "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=900&auto=format&fit=crop&q=80",
            likeCount: 1,
            commentsCount: 0,
            timestamp: "Just now",
            isLikedByMe: true,
          };
          setPosts([created, ...posts]);
        }}
      />

      {/* Slide-out Notifications Drawer */}
      <InstagramNotificationsDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
}
