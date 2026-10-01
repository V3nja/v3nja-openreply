"use client";

/**
 * Universal Instagram Explore & Discovery Engine
 * Authentic Instagram search for Accounts, Audio, Hashtags, and Places, with categorized discovery grid.
 */

import React, { useState } from "react";
import Link from "next/link";
import { getProxiedImageUrl } from "@/lib/image-proxy-helper";
import {
  CREATOR_ROSTER,
  TRENDING_SOUNDS,
  getAlgorithmicFeedPosts,
  type DetailedFeedPost,
  type FeedAuthor,
  type AudioTrack,
} from "@/lib/instagram-feed-engine";

export default function InstagramExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"top" | "accounts" | "audio" | "tags">("top");
  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [selectedPost, setSelectedPost] = useState<DetailedFeedPost | null>(null);

  const TOPICS = ["All", "🎵 Music", "🔥 Afrobeats", "🎬 Reels", "💃 Dance", "🌍 Malawi & Africa", "🎨 Visuals", "💻 Tech"];
  const posts = getAlgorithmicFeedPosts();

  // Search filtering
  const matchingAccounts = CREATOR_ROSTER.filter(
    (c) =>
      c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const matchingAudio = TRENDING_SOUNDS.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">
      
      {/* Top Search & Discovery Bar */}
      <div className="p-4 rounded-3xl bg-zinc-950/80 border border-white/[0.08] shadow-2xl backdrop-blur-xl space-y-3">
        <div className="relative">
          <span className="absolute left-3.5 top-3 text-sm text-zinc-400">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search accounts, audio tracks, hashtags (#V3NJA), and places…"
            className="w-full bg-zinc-900 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500 transition-colors shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-2.5 text-xs text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Search Result Category Tabs */}
        {searchQuery && (
          <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-xs font-bold">
            {(["top", "accounts", "audio", "tags"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setActiveTab(t)}
                className={`px-3 py-1 rounded-xl capitalize transition-all ${
                  activeTab === t ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Topic Filter Pills */}
        {!searchQuery && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            {TOPICS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => setSelectedTopic(topic)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedTopic === topic
                    ? "bg-white text-black shadow-md scale-102"
                    : "bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300"
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search Live Results Stream */}
      {searchQuery ? (
        <div className="space-y-4">
          {/* Accounts Search Results */}
          {(activeTab === "top" || activeTab === "accounts") && matchingAccounts.length > 0 && (
            <div className="p-4 rounded-3xl bg-zinc-950/80 border border-white/[0.08] space-y-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Accounts</span>
              <div className="space-y-2">
                {matchingAccounts.map((acc) => (
                  <Link
                    key={acc.id}
                    href={`/inbox?user=${acc.username}`}
                    className="flex items-center justify-between p-2 rounded-2xl hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full p-[1.5px] bg-gradient-to-tr from-pink-500 to-purple-600">
                        <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center text-xs font-bold text-white relative overflow-hidden">
                          <span>{acc.username[0].toUpperCase()}</span>
                          {acc.avatarUrl && (
                            <img src={getProxiedImageUrl(acc.avatarUrl)} alt="" className="absolute inset-0 w-full h-full object-cover" />
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">@{acc.username}</span>
                          {acc.isVerified && <span className="text-blue-400 text-[10px]">✓</span>}
                        </div>
                        <span className="text-[11px] text-zinc-400">{acc.name} • {acc.category}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-purple-400">View In-App →</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Audio Tracks Search Results */}
          {(activeTab === "top" || activeTab === "audio") && matchingAudio.length > 0 && (
            <div className="p-4 rounded-3xl bg-zinc-950/80 border border-white/[0.08] space-y-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Audio & Music</span>
              <div className="space-y-2">
                {matchingAudio.map((snd) => (
                  <div key={snd.id} className="flex items-center justify-between p-2 rounded-2xl hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-black shrink-0">
                        <img src={snd.albumArtUrl} alt={snd.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">{snd.title}</span>
                        <span className="text-[11px] text-zinc-400">{snd.artist} • {snd.usesCount ? `${snd.usesCount.toLocaleString()} reels` : "Sound"}</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-white/10 rounded-xl text-xs font-bold text-white">Use Audio</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Dynamic Explore Grid (Mix of 1x1 Photos, 1x2 Vertical Reels) */
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {posts.map((post, idx) => {
            const isFeatured = idx % 5 === 1;

            return (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className={`group relative rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 cursor-pointer shadow-md hover:border-purple-500/60 transition-all ${
                  isFeatured ? "row-span-2 aspect-[9/16]" : "aspect-square"
                }`}
              >
                <img
                  src={getProxiedImageUrl(post.thumbnailUrl || post.mediaUrl)}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { (e.currentTarget as HTMLElement).style.display = "none"; }}
                />

                {/* Media Type Icon */}
                <div className="absolute top-2 right-2 text-xs bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-lg text-white">
                  {post.mediaType === "VIDEO" ? "🎬" : post.slides ? "▦" : "📷"}
                </div>

                {/* Hover Overlay with Stats & Author */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-between p-3 text-white transition-opacity">
                  <div className="text-[11px] font-bold truncate">@{post.author.username}</div>
                  <div className="flex items-center justify-center gap-3 text-xs font-bold">
                    <span>❤️ {post.likeCount}</span>
                    <span>💬 {post.commentsCount}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Explore Post Lightbox Zoom */}
      {selectedPost && (
        <div
          onClick={() => setSelectedPost(null)}
          className="fixed inset-0 z-80 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-3xl bg-zinc-950 border border-white/15 overflow-hidden shadow-2xl"
          >
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs font-bold text-white">@{selectedPost.author.username}</span>
              <button onClick={() => setSelectedPost(null)} className="text-xs text-white">✕</button>
            </div>
            <div className="aspect-square bg-black flex items-center justify-center">
              <img src={getProxiedImageUrl(selectedPost.mediaUrl)} alt="" className="max-h-full max-w-full object-contain" />
            </div>
            <div className="p-4 space-y-2 text-xs">
              <p className="text-zinc-200">{selectedPost.caption}</p>
              <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                <span>❤️ {selectedPost.likeCount} likes</span>
                <Link href={`/inbox?user=${selectedPost.author.username}`} className="text-purple-400 font-bold hover:underline">
                  Message Creator →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
