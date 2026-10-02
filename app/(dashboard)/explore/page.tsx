"use client";

/**
 * Real-Time Instagram Explore & Discovery Engine (V3NJA Social OS)
 * Real-time search for live Instagram accounts, hashtags, and Meta Graph API media.
 * Zero fake stock photos or simulated mock rosters.
 */

import React, { useState } from "react";
import Link from "next/link";
import InstagramMessagesDock from "@/components/instagram-messages-dock";

export default function InstagramExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchedProfile, setSearchedProfile] = useState<any>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const QUICK_PROFILES = [
    { username: "v3nja2.0", name: "V3NJA", category: "Singer / Producer" },
    { username: "thee_hyped_teens", name: "DAILY HYPES", category: "Musician/band" },
    { username: "zaluude", name: "ZALU̶U̶DE⚡️", category: "DJ & Producer" },
    { username: "takondwa_noniwa", name: "Tee 🦋", category: "Visual Creator" },
    { username: "bilion_vibez", name: "BIL!ON VIBEZ", category: "Record Label" },
  ];

  async function handleSearch(targetUsername?: string) {
    const q = (targetUsername || searchQuery).trim().replace(/^@/, "");
    if (!q) return;
    setLoading(true);
    setSearchError(null);
    setSearchedProfile(null);

    try {
      const res = await fetch(`/api/instagram/contact-profile?username=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success && data.data) {
        setSearchedProfile(data.data);
      } else {
        setSearchError(data.error || `No public profile found for @${q}.`);
      }
    } catch (err: any) {
      setSearchError(err?.message || "Failed to search Instagram profile.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] pb-24">
      
      {/* Search Header */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        <div className="text-center space-y-1">
          <h1 className="text-xl font-black tracking-tight">Instagram Live Discovery & Search</h1>
          <p className="text-xs text-zinc-400">
            Real-time profile exploration, followers, media, and zero-redirect CRM routing.
          </p>
        </div>

        {/* Live Search Input */}
        <div className="relative max-w-lg mx-auto">
          <span className="absolute left-3.5 top-3 text-zinc-400 text-sm">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            placeholder="Search Instagram username (e.g. v3nja2.0, thee_hyped_teens)…"
            className="w-full bg-zinc-900 border border-white/10 rounded-2xl pl-10 pr-20 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#0095F6] transition-colors"
          />
          <button
            type="button"
            onClick={() => handleSearch()}
            disabled={loading || !searchQuery.trim()}
            className="absolute right-2 top-1.5 px-3 py-1.5 rounded-xl bg-[#0095F6] hover:bg-blue-600 disabled:opacity-40 text-white text-xs font-bold transition-all"
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </div>

        {/* Quick Profile Suggestions */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <span className="text-[11px] text-zinc-500 font-bold mr-1">Quick Search:</span>
          {QUICK_PROFILES.map((p) => (
            <button
              key={p.username}
              type="button"
              onClick={() => {
                setSearchQuery(p.username);
                handleSearch(p.username);
              }}
              className="px-3 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-bold text-zinc-300 transition-colors"
            >
              @{p.username}
            </button>
          ))}
        </div>

        {/* Search Results Display */}
        {loading && (
          <div className="py-16 text-center space-y-2">
            <div className="w-8 h-8 border-2 border-[#0095F6] border-t-transparent rounded-full animate-spin mx-auto" />
            <span className="text-xs text-zinc-400 font-medium">Fetching live Instagram profile…</span>
          </div>
        )}

        {searchError && (
          <div className="p-4 rounded-2xl bg-zinc-950 border border-red-500/20 text-center text-xs text-red-400">
            {searchError}
          </div>
        )}

        {searchedProfile && (
          <div className="p-6 rounded-3xl bg-zinc-950 border border-white/10 space-y-6 shadow-2xl animate-in fade-in duration-200">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 to-purple-600 shrink-0">
                <div className="w-full h-full rounded-full bg-black border-2 border-black flex items-center justify-center font-bold text-xl text-white">
                  {searchedProfile.username[0].toUpperCase()}
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="text-lg font-bold text-white">@{searchedProfile.username}</span>
                  <Link
                    href={`/inbox?user=${searchedProfile.username}`}
                    className="px-4 py-1.5 rounded-xl bg-[#0095F6] text-white text-xs font-bold hover:bg-blue-600 transition-colors inline-block"
                  >
                    Open in Direct CRM 💬
                  </Link>
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-6 text-xs font-semibold text-zinc-300">
                  <span>
                    <strong className="text-white">{searchedProfile.postsCount || 0}</strong> posts
                  </span>
                  <span>
                    <strong className="text-white">
                      {(searchedProfile.followersCount || 0).toLocaleString()}
                    </strong>{" "}
                    followers
                  </span>
                  <span>
                    <strong className="text-white">{searchedProfile.followingCount || 0}</strong> following
                  </span>
                </div>

                {searchedProfile.name && (
                  <div className="text-xs font-bold text-white">{searchedProfile.name}</div>
                )}
                {searchedProfile.bio && (
                  <p className="text-xs text-zinc-300 whitespace-pre-line leading-relaxed">
                    {searchedProfile.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Profile Media Grid */}
            {searchedProfile.posts && searchedProfile.posts.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-white/10">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  Published Posts & Reels
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {searchedProfile.posts.map((p: any) => (
                    <div
                      key={p.id}
                      className="aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-white/5 relative group"
                    >
                      {p.mediaType === "VIDEO" ? (
                        <video
                          src={p.mediaUrl}
                          poster={p.thumbnailUrl}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={p.thumbnailUrl || p.mediaUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute top-1.5 right-1.5 px-1 py-0.5 rounded bg-black/60 text-[10px] text-white">
                        {p.mediaType === "VIDEO" ? "🎬" : "📷"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Messages Dock */}
      <InstagramMessagesDock />
    </div>
  );
}
