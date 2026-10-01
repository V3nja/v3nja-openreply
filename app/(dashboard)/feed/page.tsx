"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { getProxiedImageUrl, type RealtimeInstagramPost, type SuggestedProfileItem } from "@/lib/image-proxy-helper";

interface FeedPostItem extends RealtimeInstagramPost {
  authorUsername: string;
  authorName: string;
  authorAvatar: string;
  isVerified?: boolean;
  location?: string;
  isLikedByMe?: boolean;
  isSaved?: boolean;
}

interface StoryItem {
  id: string;
  username: string;
  avatarUrl: string;
  hasUnseen: boolean;
  stories: Array<{ id: string; mediaUrl: string; mediaType: "IMAGE" | "VIDEO"; caption?: string }>;
}

export default function InstagramFeedPage() {
  const [feedPosts, setFeedPosts] = useState<FeedPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggestedProfiles, setSuggestedProfiles] = useState<SuggestedProfileItem[]>([]);
  const [activeStoryViewer, setActiveStoryViewer] = useState<{
    username: string;
    avatarUrl: string;
    stories: Array<{ id: string; mediaUrl: string; mediaType: "IMAGE" | "VIDEO"; caption?: string }>;
    currentIndex: number;
  } | null>(null);

  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [heartAnimPostId, setHeartAnimPostId] = useState<string | null>(null);
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadFeed() {
      setLoading(true);
      try {
        const handles = ["thee_hyped_teens", "zaluude", "takondwa_noniwa", "v3nja2.0"];
        const res = await Promise.all(
          handles.map((h) => fetch(`/api/instagram/contact-profile?username=${h}`).then((r) => r.json()).catch(() => null))
        );

        const loadedPosts: FeedPostItem[] = [];
        const loadedSuggested: SuggestedProfileItem[] = [];

        for (const r of res) {
          if (r?.success && r?.data) {
            const data = r.data;
            const authorPosts: FeedPostItem[] = (data.posts || []).map((p: any) => ({
              ...p,
              authorUsername: data.username,
              authorName: data.name,
              authorAvatar: data.avatarUrl,
              isVerified: data.isVerified,
              location: data.username === "thee_hyped_teens" ? "Blantyre, Malawi" : data.username === "zaluude" ? "Newcastle, UK" : "Lilongwe, Malawi",
            }));
            loadedPosts.push(...authorPosts);

            if (data.suggestedProfiles && data.suggestedProfiles.length > 0) {
              for (const sp of data.suggestedProfiles) {
                if (!loadedSuggested.some((x) => x.username === sp.username)) {
                  loadedSuggested.push(sp);
                }
              }
            }
          }
        }

        // Shuffle / interleave posts for authentic feed feel
        loadedPosts.sort(() => 0.5 - Math.random());
        setFeedPosts(loadedPosts);
        setSuggestedProfiles(loadedSuggested.slice(0, 5));
      } catch (err) {
        console.error("Feed load error", err);
      } finally {
        setLoading(false);
      }
    }

    void loadFeed();
  }, []);

  const stories: StoryItem[] = [
    {
      id: "st_v3nja",
      username: "v3nja2.0",
      avatarUrl: getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.82787-19/799754867_18082733579698157_1761305583527068474_n.jpg"),
      hasUnseen: true,
      stories: [
        {
          id: "s1",
          mediaUrl: getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.82787-15/611632478_18050199779698157_1169468304699992097_n.webp"),
          mediaType: "IMAGE",
          caption: "WAYULOMI on full blast in Blantyre! 🚗💨",
        },
      ],
    },
    {
      id: "st_thee",
      username: "thee_hyped_teens",
      avatarUrl: getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.2885-19/471725408_3906345189623833_416055767123729958_n.jpg"),
      hasUnseen: true,
      stories: [
        {
          id: "s2",
          mediaUrl: getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.82787-15/619812138_17894085294394214_8280450705160981738_n.webp"),
          mediaType: "IMAGE",
          caption: "DOHA Single Out Now! Support local music 🇲🇼🔥",
        },
      ],
    },
    {
      id: "st_zaluude",
      username: "zaluude",
      avatarUrl: getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.82787-19/773725399_18622810783020039_7056424547350975810_n.jpg"),
      hasUnseen: true,
      stories: [
        {
          id: "s3",
          mediaUrl: getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.82787-15/610895894_17858646288586869_6021966672195869338_n.webp"),
          mediaType: "IMAGE",
          caption: "Newcastle DJ sets tonight 🪩✨",
        },
      ],
    },
    {
      id: "st_takondwa",
      username: "takondwa_noniwa",
      avatarUrl: getProxiedImageUrl("https://scontent-lax3-1.cdninstagram.com/v/t51.2885-19/573323465_1219825463302212_7278921664109726296_n.png"),
      hasUnseen: false,
      stories: [
        {
          id: "s4",
          mediaUrl: getProxiedImageUrl("https://scontent-lax3-1.cdninstagram.com/v/t51.2885-19/573323465_1219825463302212_7278921664109726296_n.png"),
          mediaType: "IMAGE",
          caption: "Progress not perfection 🦋🖤",
        },
      ],
    },
  ];

  function handleDoubleTapLike(postId: string) {
    setHeartAnimPostId(postId);
    setTimeout(() => setHeartAnimPostId(null), 800);

    setFeedPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const nextLiked = !p.isLikedByMe;
        return {
          ...p,
          isLikedByMe: nextLiked,
          likeCount: nextLiked ? p.likeCount + 1 : Math.max(0, p.likeCount - 1),
        };
      })
    );
  }

  function handleToggleFollow(username: string) {
    setFollowingStates((prev) => ({
      ...prev,
      [username]: !prev[username],
    }));
  }

  function handleAddComment(postId: string) {
    const text = commentDrafts[postId]?.trim();
    if (!text) return;

    setFeedPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const newCmt = {
          id: `cmt_${Date.now()}`,
          username: "v3nja2.0",
          text,
          time: "Just now",
        };
        return {
          ...p,
          commentsCount: p.commentsCount + 1,
          comments: [...(p.comments || []), newCmt],
        };
      })
    );

    setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
  }

  return (
    <div className="max-w-5xl mx-auto py-2 font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text','SF_Pro_Display',system-ui,sans-serif]">
      {/* Top Instagram App Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent tracking-tight">
            Instagram
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-zinc-300 border border-white/10">
            Live Feed & Explore
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/inbox"
            className="px-3.5 py-1.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-bold transition-all flex items-center gap-2 border border-white/10 shadow-sm"
          >
            <span>💬</span>
            <span>Direct Inbox</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        {/* Main Feed Column */}
        <div className="space-y-6">
          {/* Top Instagram Stories Tray */}
          <div className="flex items-center gap-4 p-3.5 rounded-3xl bg-zinc-950/80 border border-white/[0.08] overflow-x-auto no-scrollbar shadow-lg">
            {stories.map((st) => (
              <div
                key={st.id}
                onClick={() =>
                  setActiveStoryViewer({
                    username: st.username,
                    avatarUrl: st.avatarUrl,
                    stories: st.stories,
                    currentIndex: 0,
                  })
                }
                className="flex flex-col items-center shrink-0 cursor-pointer group select-none"
              >
                <div className="relative mb-1">
                  <div
                    className={`w-16 h-16 rounded-full p-[2.5px] transition-transform group-hover:scale-105 shadow-md ${
                      st.hasUnseen
                        ? "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]"
                        : "bg-zinc-700/60"
                    }`}
                  >
                    <img
                      src={st.avatarUrl}
                      alt={st.username}
                      className="w-full h-full rounded-full object-cover border-2 border-black"
                    />
                  </div>
                </div>
                <span className="text-[11px] text-zinc-300 font-medium max-w-[64px] truncate text-center">
                  {st.username === "v3nja2.0" ? "Your Story" : st.username}
                </span>
              </div>
            ))}
          </div>

          {/* Posts Stream */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs text-zinc-400 font-semibold">Loading real-time Instagram feed…</p>
            </div>
          ) : feedPosts.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-zinc-950 border border-white/10 text-zinc-400 text-xs">
              No feed posts available right now.
            </div>
          ) : (
            feedPosts.map((post) => (
              <div
                key={post.id}
                className="rounded-3xl bg-zinc-950/90 border border-white/[0.08] overflow-hidden shadow-2xl transition-all"
              >
                {/* Post Header */}
                <div className="p-3.5 flex items-center justify-between border-b border-white/[0.06] bg-black/40">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/inbox?user=${post.authorUsername}`}
                      className="w-10 h-10 rounded-full p-[1.5px] bg-gradient-to-tr from-pink-500 to-purple-600 block shadow-sm"
                    >
                      <img
                        src={post.authorAvatar}
                        alt={post.authorUsername}
                        className="w-full h-full rounded-full object-cover border-2 border-black"
                      />
                    </Link>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/inbox?user=${post.authorUsername}`}
                          className="text-xs font-bold text-white hover:text-purple-300 transition-colors"
                        >
                          {post.authorUsername}
                        </Link>
                        {post.isVerified && <span className="text-[10px] text-blue-400 font-bold">✓</span>}
                        <span className="text-zinc-500 text-[10px]">•</span>
                        <button
                          type="button"
                          onClick={() => handleToggleFollow(post.authorUsername)}
                          className={`text-[11px] font-bold transition-all ${
                            followingStates[post.authorUsername]
                              ? "text-zinc-400"
                              : "text-blue-400 hover:text-blue-300"
                          }`}
                        >
                          {followingStates[post.authorUsername] ? "Following" : "Follow"}
                        </button>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">{post.location || "Instagram"}</span>
                    </div>
                  </div>

                  <button className="text-zinc-400 hover:text-white text-sm font-bold px-2 py-1">•••</button>
                </div>

                {/* Media Container with Double Tap Heart */}
                <div
                  onDoubleClick={() => handleDoubleTapLike(post.id)}
                  className="relative aspect-square bg-black flex items-center justify-center select-none overflow-hidden group cursor-pointer"
                >
                  {post.mediaType === "VIDEO" ? (
                    <video
                      src={post.videoUrl || post.mediaUrl}
                      poster={post.thumbnailUrl}
                      controls
                      playsInline
                      loop
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img
                      src={post.mediaUrl}
                      alt="Post Media"
                      className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
                    />
                  )}

                  {/* Animated Double Tap Heart */}
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
                          post.isLikedByMe ? "text-rose-500 font-bold" : "text-zinc-200 hover:text-rose-400"
                        }`}
                      >
                        {post.isLikedByMe ? "❤️" : "🤍"}
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
                        href={`/inbox?user=${post.authorUsername}`}
                        className="hover:scale-125 text-zinc-200 hover:text-white transition-transform text-lg"
                        title="Send in Direct Message"
                      >
                        ↗
                      </Link>
                    </div>

                    <button className="text-zinc-300 hover:text-white text-lg transition-transform">
                      🔖
                    </button>
                  </div>

                  {/* Like Count */}
                  <div className="text-xs font-bold text-white">
                    {post.likeCount.toLocaleString()} {post.likeCount === 1 ? "like" : "likes"}
                  </div>

                  {/* Caption */}
                  <div className="text-xs leading-relaxed">
                    <span className="font-bold text-white mr-1.5">{post.authorUsername}</span>
                    <span className="text-zinc-200 whitespace-pre-line">{post.caption || "✨ V3NJA WRLD Official"}</span>
                  </div>

                  {/* Comments Count */}
                  {post.commentsCount > 0 && (
                    <div className="text-[11px] text-zinc-400 cursor-pointer hover:text-zinc-300">
                      View all {post.commentsCount} comments
                    </div>
                  )}

                  {/* Comments Stream */}
                  {(post.comments || []).slice(-3).map((cmt) => (
                    <div key={cmt.id} className="text-xs flex items-baseline gap-1.5">
                      <span className="font-bold text-zinc-200 text-[11px]">@{cmt.username}</span>
                      <span className="text-zinc-300 text-[11.5px]">{cmt.text}</span>
                    </div>
                  ))}

                  {/* Timestamp */}
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
                    {post.timestamp}
                  </div>

                  {/* In-App Comment Composer */}
                  <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2">
                    <input
                      id={`comment_inp_${post.id}`}
                      type="text"
                      value={commentDrafts[post.id] || ""}
                      onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))}
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
            ))
          )}
        </div>

        {/* Right Sidebar: Profile & Suggested Creators */}
        <div className="hidden lg:block space-y-6">
          {/* Current Connected User Card */}
          <div className="p-4 rounded-3xl bg-zinc-950/80 border border-white/[0.08] flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 to-purple-600 shadow-md">
                <img
                  src={getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.82787-19/799754867_18082733579698157_1761305583527068474_n.jpg")}
                  alt="V3NJA"
                  className="w-full h-full rounded-full object-cover border-2 border-black"
                />
              </div>
              <div>
                <span className="text-xs font-extrabold text-white block">v3nja2.0</span>
                <span className="text-[11px] text-zinc-400">V3NJA • 2,834 Followers</span>
              </div>
            </div>

            <Link href="/inbox" className="text-xs font-bold text-purple-400 hover:text-purple-300">
              Inbox
            </Link>
          </div>

          {/* Suggested Creators For You */}
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
              {suggestedProfiles.map((sug) => (
                <div key={sug.username} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={sug.avatarUrl}
                      alt={sug.username}
                      className="w-9 h-9 rounded-full object-cover border border-white/10 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white truncate block">
                        {sug.username}
                      </span>
                      <span className="text-[10px] text-zinc-400 truncate block">
                        {sug.followersCount ? `${sug.followersCount.toLocaleString()} followers` : sug.category}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleFollow(sug.username)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      followingStates[sug.username]
                        ? "bg-white/10 text-zinc-300 hover:bg-white/20"
                        : "bg-[#0095F6] text-white hover:bg-blue-600 shadow-sm"
                    }`}
                  >
                    {followingStates[sug.username] ? "Following" : "Follow"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Story Viewer Modal */}
      {activeStoryViewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm aspect-[9/16] rounded-3xl overflow-hidden bg-zinc-900 border border-white/15 shadow-2xl flex flex-col justify-between p-4">
            {/* Top Story Header & Progress Bars */}
            <div className="z-10 space-y-2">
              <div className="flex items-center gap-1">
                {activeStoryViewer.stories.map((_, idx) => (
                  <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full w-full" />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-white text-xs">
                <div className="flex items-center gap-2">
                  <img
                    src={activeStoryViewer.avatarUrl}
                    alt={activeStoryViewer.username}
                    className="w-7 h-7 rounded-full object-cover border border-white"
                  />
                  <span className="font-bold">@{activeStoryViewer.username}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStoryViewer(null)}
                  className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Media Background */}
            <div className="absolute inset-0">
              <img
                src={activeStoryViewer.stories[activeStoryViewer.currentIndex]?.mediaUrl}
                alt="Story"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
            </div>

            {/* Bottom Story Footer with Reactions */}
            <div className="z-10 space-y-2">
              <p className="text-xs text-white font-medium text-center">
                {activeStoryViewer.stories[activeStoryViewer.currentIndex]?.caption}
              </p>
              <div className="flex items-center justify-around py-2">
                {["❤️", "🔥", "👏", "😂", "😮", "🙌"].map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setActiveStoryViewer(null)}
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
    </div>
  );
}
