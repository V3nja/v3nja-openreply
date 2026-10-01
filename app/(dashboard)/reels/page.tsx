"use client";

/**
 * Universal Instagram Reels Fullscreen Player (V3NJA Social OS)
 * Exact authentic Meta Instagram web Reels player matching user screenshots 9, 10, 11, 12
 * with up/down navigation chevrons, right action buttons, audio marquee, and creator follow controls.
 */

import React, { useState } from "react";
import Link from "next/link";
import InstagramMessagesDock from "@/components/instagram-messages-dock";

interface ReelItem {
  id: string;
  author: {
    username: string;
    avatarUrl: string;
    isVerified: boolean;
    location?: string;
  };
  caption: string;
  videoUrl: string;
  thumbnailUrl: string;
  audioTrack: {
    title: string;
    artist: string;
    albumArtUrl: string;
  };
  likes: string;
  comments: string;
  shares: string;
  textOverlay?: string;
}

const REELS_STREAM: ReelItem[] = [
  {
    id: "reel_bianca",
    author: {
      username: "biancaxher",
      avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80",
      isVerified: false,
    },
    caption: "She love a bimmer with speed ❤️🔥 @valiant_music",
    videoUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80",
    audioTrack: {
      title: "summer • Valiant, RK Trap - Bimmer",
      artist: "Valiant",
      albumArtUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=120&auto=format&fit=crop&q=80",
    },
    likes: "18.8K",
    comments: "501",
    shares: "569",
  },
  {
    id: "reel_bec",
    author: {
      username: "becgorton_",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
      isVerified: true,
      location: "Gold Coast, Australia",
    },
    caption: "Would you come say hi ? 🤎",
    videoUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80",
    audioTrack: {
      title: "Gold Coast Breeze (Original Mix)",
      artist: "becgorton_",
      albumArtUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=120&auto=format&fit=crop&q=80",
    },
    likes: "22.1K",
    comments: "641",
    shares: "310",
  },
  {
    id: "reel_janemena",
    author: {
      username: "janemena",
      avatarUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&auto=format&fit=crop&q=80",
      isVerified: true,
    },
    caption:
      "Have you ever used Our Isoko Palm kernel Pomade wey no dey congeal on your skin!? I have been using this Oil on my kids from birth…",
    videoUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
    textOverlay: "It's the Palm kernel we will use to make the Pomade",
    audioTrack: {
      title: "Isoko Heritage Melodies",
      artist: "janemena",
      albumArtUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=120&auto=format&fit=crop&q=80",
    },
    likes: "132K",
    comments: "346",
    shares: "520",
  },
  {
    id: "reel_yo_anim",
    author: {
      username: "yo_animations",
      avatarUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&auto=format&fit=crop&q=80",
      isVerified: true,
    },
    caption: "You want to pray when you are sleepy keh 😭😭 The battle go long gann ooo 🥴 ...",
    textOverlay: "POV : trying to pray when you are sleepy😂",
    videoUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=80",
    audioTrack: {
      title: "Night Prayer Vibes",
      artist: "yo_animations",
      albumArtUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=120&auto=format&fit=crop&q=80",
    },
    likes: "152K",
    comments: "4,007",
    shares: "13.2K",
  },
];

export default function InstagramReelsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({
    "reel_bianca": true,
    "reel_bec": false,
    "reel_janemena": false,
    "reel_yo_anim": true,
  });
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({
    "biancaxher": false,
    "becgorton_": false,
    "janemena": true,
    "yo_animations": false,
  });
  const [isMuted, setIsMuted] = useState(false);

  const currentReel = REELS_STREAM[currentIndex] || REELS_STREAM[0];

  function handleToggleLike(id: string) {
    setLikedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleToggleSave(id: string) {
    setSavedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleToggleFollow(username: string) {
    setFollowingMap((prev) => ({ ...prev, [username]: !prev[username] }));
  }

  function handleNextReel() {
    if (currentIndex < REELS_STREAM.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }

  function handlePrevReel() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] flex items-center justify-center p-2 sm:p-4 pb-20">
      
      <div className="relative flex items-center justify-center gap-6">
        
        {/* Main 9:16 Vertical Reel Player Container */}
        <div className="relative w-full max-w-[380px] sm:max-w-[420px] h-[82vh] max-h-[750px] aspect-[9/16] rounded-3xl overflow-hidden bg-zinc-950 border border-white/15 shadow-2xl flex flex-col justify-between select-none">
          
          {/* Reel Media */}
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            <img
              src={currentReel.videoUrl || currentReel.thumbnailUrl}
              alt=""
              className="w-full h-full object-cover"
            />

            {/* In-Video Text Overlay (as seen in screenshots 11 & 12) */}
            {currentReel.textOverlay && (
              <div className="absolute top-20 inset-x-6 text-center">
                <span className="inline-block px-4 py-2 rounded-2xl bg-black/60 backdrop-blur-md text-white font-black text-sm drop-shadow-lg leading-snug">
                  {currentReel.textOverlay}
                </span>
              </div>
            )}
          </div>

          {/* Top Subtle Overlay */}
          <div className="p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center justify-between">
            <span className="text-base font-black tracking-tight">Reels</span>
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center text-xs font-bold"
            >
              {isMuted ? "🔇" : "🔊"}
            </button>
          </div>

          {/* Bottom Creator & Audio Details Overlay (Matching screenshots 9-12) */}
          <div className="p-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-10 space-y-2.5">
            {/* Author Bar */}
            <div className="flex items-center gap-2.5">
              <Link
                href={`/inbox?user=${currentReel.author.username}`}
                className="w-9 h-9 rounded-full overflow-hidden border border-white shrink-0 block"
              >
                <img
                  src={currentReel.author.avatarUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </Link>

              <div className="flex items-center gap-1.5 leading-tight">
                <Link
                  href={`/inbox?user=${currentReel.author.username}`}
                  className="font-extrabold text-xs text-white hover:underline truncate"
                >
                  {currentReel.author.username}
                </Link>
                {currentReel.author.isVerified && (
                  <span className="text-[#0095F6] text-xs font-bold">✓</span>
                )}
                <span className="text-zinc-500 text-[10px]">•</span>
                <button
                  type="button"
                  onClick={() => handleToggleFollow(currentReel.author.username)}
                  className={`text-xs font-bold transition-colors ${
                    followingMap[currentReel.author.username]
                      ? "text-zinc-400"
                      : "text-white hover:text-zinc-300"
                  }`}
                >
                  {followingMap[currentReel.author.username] ? "Following" : "Follow"}
                </button>
              </div>
            </div>

            {currentReel.author.location && (
              <div className="text-[10px] text-zinc-400">
                📍 {currentReel.author.location}
              </div>
            )}

            {/* Caption */}
            <p className="text-xs text-zinc-200 line-clamp-2 leading-relaxed">
              {currentReel.caption}
            </p>

            {/* Audio Track Marquee */}
            <div className="flex items-center gap-2 text-[11px] text-zinc-300 font-medium">
              <span>♫</span>
              <span className="truncate">{currentReel.audioTrack.title}</span>
            </div>
          </div>
        </div>

        {/* Right Action Rail (Matching screenshots 9-12) */}
        <div className="flex flex-col items-center gap-5 text-white z-20">
          
          {/* Like */}
          <button
            type="button"
            onClick={() => handleToggleLike(currentReel.id)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-11 h-11 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 flex items-center justify-center text-2xl group-hover:scale-115 transition-transform shadow-lg">
              {likedMap[currentReel.id] ? "❤️" : "🤍"}
            </div>
            <span className="text-[11px] font-bold">{currentReel.likes}</span>
          </button>

          {/* Comment */}
          <button
            type="button"
            onClick={() => alert(`Comments for @${currentReel.author.username}`)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-11 h-11 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 flex items-center justify-center text-xl group-hover:scale-115 transition-transform shadow-lg">
              💬
            </div>
            <span className="text-[11px] font-bold">{currentReel.comments}</span>
          </button>

          {/* Direct Share */}
          <Link
            href={`/inbox?user=${currentReel.author.username}`}
            className="flex flex-col items-center gap-1 group"
            title="Share Reel to Direct"
          >
            <div className="w-11 h-11 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 flex items-center justify-center text-xl group-hover:scale-115 transition-transform shadow-lg">
              ↗
            </div>
            <span className="text-[11px] font-bold">{currentReel.shares}</span>
          </Link>

          {/* Bookmark */}
          <button
            type="button"
            onClick={() => handleToggleSave(currentReel.id)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-11 h-11 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 flex items-center justify-center text-xl group-hover:scale-115 transition-transform shadow-lg">
              {savedMap[currentReel.id] ? "🔖" : "🏷️"}
            </div>
          </button>

          {/* Menu */}
          <button
            type="button"
            className="w-11 h-11 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 flex items-center justify-center text-sm font-bold shadow-lg"
          >
            •••
          </button>

          {/* Audio Cover Disc */}
          <div className="w-8 h-8 rounded-lg overflow-hidden border-2 border-white/30 shrink-0 mt-2 shadow-lg">
            <img
              src={currentReel.audioTrack.albumArtUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>

          {/* Up & Down Scroll Chevrons (Matching user screenshots) */}
          <div className="flex flex-col gap-2 pt-4">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={handlePrevReel}
              className="w-9 h-9 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-white/15 flex items-center justify-center text-sm font-black disabled:opacity-20 shadow-md transition-all"
              title="Previous Reel"
            >
              ⌃
            </button>
            <button
              type="button"
              disabled={currentIndex === REELS_STREAM.length - 1}
              onClick={handleNextReel}
              className="w-9 h-9 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-white/15 flex items-center justify-center text-sm font-black disabled:opacity-20 shadow-md transition-all"
              title="Next Reel"
            >
              ⌄
            </button>
          </div>
        </div>
      </div>

      {/* Floating Messages Dock */}
      <InstagramMessagesDock />
    </div>
  );
}
