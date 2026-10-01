"use client";

/**
 * Universal Instagram Explore & Discovery Engine (V3NJA Social OS)
 * Exact authentic Meta Instagram web explore grid matching screenshots 7 & 8 with rich tiles,
 * video reel indicators, live likes & comments, and interactive lightbox.
 */

import React, { useState } from "react";
import Link from "next/link";
import { getExploreGridItems, type ExploreTileItem } from "@/lib/instagram-feed-engine";
import InstagramMessagesDock from "@/components/instagram-messages-dock";

export default function InstagramExplorePage() {
  const [items, setItems] = useState<ExploreTileItem[]>(getExploreGridItems());
  const [selectedItem, setSelectedItem] = useState<ExploreTileItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTopic, setActiveTopic] = useState("All");

  const TOPICS = [
    "All",
    "🤖 AI & Tech",
    "🎵 Music",
    "🎬 Reels",
    "💃 Dance",
    "🌍 Africa & Culture",
    "👗 Fashion",
    "🚗 Cars",
    "🎨 3D Art",
  ];

  const filteredItems = items.filter((item) => {
    if (activeTopic !== "All" && item.topic && !activeTopic.includes(item.topic)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.caption.toLowerCase().includes(q) ||
        item.author.username.toLowerCase().includes(q) ||
        (item.topic && item.topic.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-black text-white font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] pb-24">
      
      {/* Top Search Bar & Topic Navigation */}
      <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        
        {/* Search Input Bar */}
        <div className="relative max-w-lg mx-auto">
          <span className="absolute left-3.5 top-2.5 text-zinc-400 text-sm">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search creators, audio tracks, AI tools, hashtags…"
            className="w-full bg-zinc-900 border border-white/10 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-2 text-xs text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Topic Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar justify-start sm:justify-center">
          {TOPICS.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => setActiveTopic(topic)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTopic === topic
                  ? "bg-white text-black shadow-md scale-102"
                  : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/5"
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Explore Grid (Matching screenshots 7 & 8) */}
      <div className="max-w-5xl mx-auto px-2 sm:px-4">
        <div className="grid grid-cols-3 gap-1 sm:gap-2">
          {filteredItems.map((item, idx) => {
            const isTallReel = idx % 5 === 1;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`group relative rounded-lg sm:rounded-xl overflow-hidden bg-zinc-900 cursor-pointer select-none border border-white/5 transition-transform ${
                  isTallReel ? "row-span-2 aspect-[9/16]" : "aspect-square"
                }`}
              >
                {/* Media Thumbnail */}
                <img
                  src={item.thumbnailUrl}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Badge Indicator (Reel play icon / Carousel icon) */}
                <div className="absolute top-2 right-2 text-xs bg-black/50 backdrop-blur-md px-1.5 py-0.5 rounded text-white font-mono">
                  {item.badge === "reel" ? "▶" : item.badge === "carousel" ? "▦" : ""}
                </div>

                {/* Caption Banner (for meme & news items as seen in screenshot 7 & 8) */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2 text-[11px] font-bold text-white line-clamp-2">
                  {item.caption}
                </div>

                {/* Hover Dark Overlay with Likes & Comments Count */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 text-white text-xs font-extrabold transition-opacity">
                  <span className="flex items-center gap-1">
                    <span>❤️</span>
                    <span>{item.likeCount}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span>💬</span>
                    <span>{item.commentsCount}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Explore Lightbox Modal */}
      {selectedItem && (
        <div
          onClick={() => setSelectedItem(null)}
          className="fixed inset-0 z-90 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[85vh] rounded-3xl bg-black border border-white/15 overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12"
          >
            {/* Left Media Area */}
            <div className="md:col-span-7 bg-zinc-950 flex items-center justify-center max-h-[75vh]">
              <img
                src={selectedItem.mediaUrl}
                alt=""
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Right Information & Interactions Rail */}
            <div className="md:col-span-5 p-5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10 space-y-4">
              {/* Creator Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-white">
                    <img
                      src={selectedItem.author.avatarUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      @{selectedItem.author.username}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {selectedItem.author.category}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Caption & Comments */}
              <div className="flex-1 overflow-y-auto space-y-3 text-xs text-zinc-200">
                <p className="leading-relaxed">{selectedItem.caption}</p>
                <div className="p-3 rounded-2xl bg-zinc-900 border border-white/5 space-y-1">
                  <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    Community Response
                  </div>
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span>❤️ {selectedItem.likeCount} likes</span>
                    <span>💬 {selectedItem.commentsCount} comments</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <Link
                  href={`/inbox?user=${selectedItem.author.username}`}
                  className="px-4 py-2 rounded-xl bg-[#0095F6] hover:bg-blue-600 text-white text-xs font-bold transition-colors"
                >
                  Direct Message Creator
                </Link>

                <button
                  type="button"
                  onClick={() => alert("Saved to collection!")}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
                >
                  Save 🔖
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Messages Dock */}
      <InstagramMessagesDock />
    </div>
  );
}
