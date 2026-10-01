"use client";

/**
 * Floating Instagram Direct Messages Dock Pill (Bottom-Right)
 * Replicates the authentic Instagram web floating Messages widget with avatar stack and unread badge.
 */

import React from "react";
import Link from "next/link";

export default function InstagramMessagesDock() {
  return (
    <Link
      href="/inbox"
      className="fixed bottom-5 right-5 z-70 flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-white/15 text-white shadow-2xl backdrop-blur-xl transition-all hover:scale-105 group"
    >
      <div className="relative flex items-center">
        {/* Unread badge pill */}
        <span className="w-4 h-4 rounded-full bg-rose-600 text-white font-black text-[9px] flex items-center justify-center mr-1.5 shadow-md">
          6
        </span>
        <span className="text-xs font-bold tracking-tight">Messages</span>
      </div>

      {/* Stacked contact avatars */}
      <div className="flex items-center -space-x-2 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"
          alt=""
          className="w-5 h-5 rounded-full border border-black object-cover"
        />
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
          alt=""
          className="w-5 h-5 rounded-full border border-black object-cover"
        />
        <img
          src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&auto=format&fit=crop&q=80"
          alt=""
          className="w-5 h-5 rounded-full border border-black object-cover"
        />
      </div>
    </Link>
  );
}
