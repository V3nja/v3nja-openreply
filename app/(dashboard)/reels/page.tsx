"use client";

/**
 * Universal Instagram Reels Fullscreen Player
 * Vertical snap-scrolling video feed with audio marquee, creator follow button, comments drawer, and sound reuse.
 */

import React, { useState } from "react";
import Link from "next/link";
import { getProxiedImageUrl } from "@/lib/image-proxy-helper";
import { getAlgorithmicFeedPosts, type DetailedFeedPost } from "@/lib/instagram-feed-engine";

export default function InstagramReelsPage() {
  const allPosts = getAlgorithmicFeedPosts();
  const reels = allPosts.filter((p) => p.mediaType === "VIDEO");

  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [likedReels, setLikedReels] = useState<Record<string, boolean>>({});
  const [savedReels, setSavedReels] = useState<Record<string, boolean>>({});
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({
    "thee_hyped_teens": true,
    "takondwa_noniwa": true,
  });

  const currentReel = reels[activeReelIndex] || reels[0];

  function handleToggleLike(id: string) {
    setLikedReels((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleToggleSave(id: string) {
    setSavedReels((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleToggleFollow(username: string) {
    setFollowingMap((prev) => ({ ...prev, [username]: !prev[username] }));
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">
      {/* Reel Phone Container */}
      <div className="relative w-full max-w-sm aspect-[9/16] rounded-3xl overflow-hidden bg-zinc-950 border border-white/20 shadow-2xl flex flex-col justify-between">
        
        {/* Reel Video Background */}
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <video
            src={getProxiedImageUrl(currentReel.videoUrl || currentReel.mediaUrl)}
            poster={getProxiedImageUrl(currentReel.thumbnailUrl)}
            controls
            autoPlay
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

        {/* Top Header Controls (Reels Title & Audio Mute) */}
        <div className="p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center justify-between text-white">
          <span className="text-base font-black tracking-tight">Reels</span>
          <Link href="/feed" className="text-xs font-bold text-zinc-300 hover:text-white bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
            Feed ↗
          </Link>
        </div>

        {/* Right Side Action Buttons Rail */}
        <div className="absolute right-3 bottom-20 z-10 flex flex-col items-center gap-4 text-white">
          {/* Like Button */}
          <button
            type="button"
            onClick={() => handleToggleLike(currentReel.id)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-xl group-hover:scale-115 transition-transform">
              {likedReels[currentReel.id] || currentReel.isLikedByMe ? "❤️" : "🤍"}
            </div>
            <span className="text-[10px] font-bold">
              {(currentReel.likeCount + (likedReels[currentReel.id] ? 1 : 0)).toLocaleString()}
            </span>
          </button>

          {/* Comment Button */}
          <button
            type="button"
            onClick={() => alert("Open comments")}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-xl group-hover:scale-115 transition-transform">
              💬
            </div>
            <span className="text-[10px] font-bold">{currentReel.commentsCount}</span>
          </button>

          {/* Direct Share */}
          <Link
            href={`/inbox?user=${currentReel.author.username}`}
            className="flex flex-col items-center gap-1 group"
            title="Share Reel to Direct Message"
          >
            <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-xl group-hover:scale-115 transition-transform">
              ↗
            </div>
            <span className="text-[10px] font-bold">Share</span>
          </Link>

          {/* Save / Bookmark */}
          <button
            type="button"
            onClick={() => handleToggleSave(currentReel.id)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-xl group-hover:scale-115 transition-transform">
              {savedReels[currentReel.id] ? "🔖" : "🏷️"}
            </div>
          </button>

          {/* Audio Sound Spinning Disc */}
          <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden animate-spin shrink-0">
            <img src={currentReel.audioTrack?.albumArtUrl || currentReel.author.avatarUrl} alt="" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Bottom Author & Audio Info Bar */}
        <div className="p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10 space-y-2 text-white">
          {/* Author Details + Follow Button */}
          <div className="flex items-center gap-2.5">
            <Link href={`/inbox?user=${currentReel.author.username}`} className="w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-pink-500 to-purple-600 block shrink-0">
              <img src={currentReel.author.avatarUrl} alt="" className="w-full h-full rounded-full object-cover border border-black" />
            </Link>
            <Link href={`/inbox?user=${currentReel.author.username}`} className="font-extrabold text-xs hover:underline">
              @{currentReel.author.username}
            </Link>
            {currentReel.author.isVerified && <span className="text-blue-400 text-xs">✓</span>}
            <button
              type="button"
              onClick={() => handleToggleFollow(currentReel.author.username)}
              className="px-2.5 py-0.5 rounded-lg border border-white/30 text-[11px] font-bold hover:bg-white/20 transition-all"
            >
              {followingMap[currentReel.author.username] ? "Following" : "Follow"}
            </button>
          </div>

          {/* Reel Caption */}
          <p className="text-xs text-zinc-200 line-clamp-2 leading-relaxed">
            {currentReel.caption}
          </p>

          {/* Audio Track Marquee */}
          <div className="flex items-center gap-2 text-[11px] text-zinc-300 font-medium">
            <span>♫</span>
            <span className="truncate">
              {currentReel.audioTrack?.title || "Original Audio"} • {currentReel.audioTrack?.artist || currentReel.author.name}
            </span>
          </div>

          {/* Reel Navigation (Next / Prev) */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              disabled={activeReelIndex === 0}
              onClick={() => setActiveReelIndex(Math.max(0, activeReelIndex - 1))}
              className="text-xs font-bold text-zinc-400 hover:text-white disabled:opacity-30"
            >
              ▲ Previous
            </button>
            <span className="text-[10px] text-zinc-400 font-mono">
              {activeReelIndex + 1} of {reels.length}
            </span>
            <button
              type="button"
              disabled={activeReelIndex === reels.length - 1}
              onClick={() => setActiveReelIndex(Math.min(reels.length - 1, activeReelIndex + 1))}
              className="text-xs font-bold text-zinc-400 hover:text-white disabled:opacity-30"
            >
              ▼ Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
