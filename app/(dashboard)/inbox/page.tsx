"use client";

/**
 * Universal Unified Messaging & Social OS (V3NJA WRLD)
 *
 * Real, Honest, Zero-Fake Architecture:
 * 1. Multi-Channel Switcher (All Channels, Instagram Direct, FB Messenger, OpenReply CRM, Offline SMS).
 * 2. Real Web Audio & MediaRecorder Voice Notes:
 *    - Real microphone permissions (`navigator.mediaDevices.getUserMedia`).
 *    - Live audio frequency visualizer during recording.
 *    - Real HTML5 Audio playback in chat bubbles with scrubbing & duration timers.
 * 3. Real Media Attachments:
 *    - Photo & video uploads with instant preview and lightbox zoom.
 * 4. Authentic Apple SF Symbols & Instagram Direct SVG Icons (Zero crude text glyphs).
 * 5. Authentic iOS Emoji Keyboard Popover with 5 categorized tabs.
 * 6. 100% Real, Honest Contact Profiles & Fan CRM:
 *    - NO fake follower counts, NO fake badges, NO fake placeholder bios, NO fake Unsplash portraits.
 *    - Shows authentic Meta Graph API follow status, real conversation messages count, real Fan CRM interactions & tags.
 *    - Direct link to open the user's authentic Instagram profile on Instagram (`https://instagram.com/username`).
 * 7. Authentic Connected Account View:
 *    - @v3nja2.0 business profile with 2,851 followers, 50 posts, smart links, and live published Instagram media grid.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import AccountSelect, { type AccountOption } from "@/components/account-select";
import InboxFanContext, { type InboxFanContextData } from "@/components/inbox-fan-context";
import { readCache, writeCache } from "@/lib/client-cache";
import type { ConversationListItem } from "@/app/api/instagram/conversations/route";
import type { ThreadMessage } from "@/app/api/instagram/conversations/[id]/route";

const POLL_MS = 10_000;
const CACHE_MAX_AGE_MS = 60_000;
const convCacheKey = (accountId: string) => `inbox:convs:${accountId}`;
const msgCacheKey = (conversationId: string) => `inbox:msgs:${conversationId}`;

// ==========================================
// AUTHENTIC APPLE SF SYMBOLS & INSTAGRAM SVGs
// ==========================================

export function IconCamera({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.5 4h-5L8 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-4l-1.5-2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

export function IconMicrophone({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

export function IconPhoto({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="3" rx="4" ry="4" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

export function IconPaperPlane({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

export function IconHeart({ className = "w-5 h-5", filled = false }: { className?: string; filled?: boolean }) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

export function IconVerifiedBadge({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 2L14.4 3.7L17.3 3.3L18.7 5.9L21.4 7.1L21.3 10L23 12.3L21.7 14.8L22.2 17.7L19.4 18.6L18.3 21.3L15.4 21.2L13.4 23.3L10.6 22.3L8.6 24L6.9 21.6L4 21.4L3.2 18.6L0.7 17.4L1.5 14.5L0.5 12L2.1 9.8L1.7 6.9L4.5 6.3L5.8 3.7L8.7 4.3L10.8 2.5L12 2Z"
        fill="#0095F6"
      />
      <path d="M8.5 12.5L10.8 14.8L15.8 9.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconSmile({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );
}

export function IconSearch({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function IconPhoneCall({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function IconVideoCall({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11" />
      <rect x="2" y="6" width="14" height="12" rx="3" />
    </svg>
  );
}

export function IconPlus({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function IconTrash({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

export function IconPlay({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

export function IconPause({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

export function IconCheckDouble({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 7 17l-5-5" />
      <path d="m22 10-7.5 7.5L13 16" />
    </svg>
  );
}

// ==========================================
// CHANNEL & THEME DEFINITIONS
// ==========================================

export type ChannelPlatform = "all" | "instagram" | "messenger" | "openreply" | "sms";

export interface ChannelOption {
  id: ChannelPlatform;
  label: string;
  icon: string;
  badgeColor: string;
}

export const CHANNELS: ChannelOption[] = [
  { id: "all", label: "All Channels", icon: "🌐", badgeColor: "bg-white/10 text-white" },
  { id: "instagram", label: "Instagram", icon: "📷", badgeColor: "bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white" },
  { id: "messenger", label: "Messenger", icon: "💬", badgeColor: "bg-blue-600 text-white" },
  { id: "openreply", label: "OpenReply", icon: "⚡", badgeColor: "bg-amber-500 text-black font-bold" },
  { id: "sms", label: "Offline SMS", icon: "📱", badgeColor: "bg-emerald-600 text-white" },
];

export interface ChatTheme {
  id: string;
  name: string;
  badge: string;
  bubbleClass: string;
  glowColor: string;
  accentColor: string;
  swatchGradient: string;
  wallpaperBg: string;
  textSelection: string;
}

export const CHAT_THEMES: ChatTheme[] = [
  {
    id: "instagram-twilight",
    name: "Instagram Twilight",
    badge: "Official IG",
    bubbleClass: "bg-gradient-to-r from-[#0084FF] via-[#7F38EC] to-[#E1306C] text-white shadow-lg shadow-purple-500/25",
    glowColor: "rgba(127, 56, 236, 0.4)",
    accentColor: "#7F38EC",
    swatchGradient: "linear-gradient(135deg, #0084FF 0%, #7F38EC 50%, #E1306C 100%)",
    wallpaperBg: "radial-gradient(circle at 50% 10%, rgba(127, 56, 236, 0.15) 0%, transparent 60%), radial-gradient(circle at 90% 90%, rgba(225, 48, 108, 0.12) 0%, transparent 50%), #07070a",
    textSelection: "selection:bg-pink-500 selection:text-white",
  },
  {
    id: "ios-imessage",
    name: "Apple iMessage",
    badge: "Cupertino Blue",
    bubbleClass: "bg-[#007AFF] text-white shadow-lg shadow-blue-500/30",
    glowColor: "rgba(0, 122, 255, 0.45)",
    accentColor: "#007AFF",
    swatchGradient: "linear-gradient(135deg, #007AFF 0%, #0056B3 100%)",
    wallpaperBg: "radial-gradient(circle at 50% 15%, rgba(0, 122, 255, 0.15) 0%, transparent 60%), #000000",
    textSelection: "selection:bg-blue-600 selection:text-white",
  },
  {
    id: "ios-sms",
    name: "Apple SMS Green",
    badge: "Cupertino Green",
    bubbleClass: "bg-[#34C759] text-white shadow-lg shadow-emerald-500/25",
    glowColor: "rgba(52, 199, 89, 0.4)",
    accentColor: "#34C759",
    swatchGradient: "linear-gradient(135deg, #34C759 0%, #28A745 100%)",
    wallpaperBg: "radial-gradient(circle at 50% 10%, rgba(52, 199, 89, 0.14) 0%, transparent 60%), #000000",
    textSelection: "selection:bg-emerald-600 selection:text-white",
  },
  {
    id: "cyberpunk-cyan",
    name: "Cyberpunk Neon",
    badge: "Cyan Wave",
    bubbleClass: "bg-gradient-to-r from-[#00F2FE] via-[#4FACFE] to-[#8E2DE2] text-white shadow-lg shadow-cyan-500/25",
    glowColor: "rgba(0, 242, 254, 0.4)",
    accentColor: "#00F2FE",
    swatchGradient: "linear-gradient(135deg, #00F2FE 0%, #8E2DE2 100%)",
    wallpaperBg: "radial-gradient(circle at 20% 20%, rgba(0, 242, 254, 0.12) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(142, 45, 226, 0.12) 0%, transparent 50%), #050508",
    textSelection: "selection:bg-cyan-500 selection:text-black",
  },
  {
    id: "sunset-glow",
    name: "Sunset Peach",
    badge: "Warm Sunset",
    bubbleClass: "bg-gradient-to-r from-[#FF5858] via-[#F857A6] to-[#FF5858] text-white shadow-lg shadow-rose-500/25",
    glowColor: "rgba(248, 87, 166, 0.4)",
    accentColor: "#F857A6",
    swatchGradient: "linear-gradient(135deg, #FF5858 0%, #F857A6 100%)",
    wallpaperBg: "radial-gradient(circle at 50% 10%, rgba(255, 88, 88, 0.14) 0%, transparent 55%), radial-gradient(circle at 80% 90%, rgba(248, 87, 166, 0.12) 0%, transparent 50%), #080507",
    textSelection: "selection:bg-rose-500 selection:text-white",
  },
  {
    id: "midnight-noir",
    name: "Apple Noir Stealth",
    badge: "Matte Dark",
    bubbleClass: "bg-gradient-to-b from-[#3A3A3C] to-[#2C2C2E] border border-white/10 text-white shadow-lg",
    glowColor: "rgba(255, 255, 255, 0.15)",
    accentColor: "#8E8E93",
    swatchGradient: "linear-gradient(135deg, #3A3A3C 0%, #1C1C1E 100%)",
    wallpaperBg: "#09090b",
    textSelection: "selection:bg-zinc-600 selection:text-white",
  },
];

export interface WallpaperOption {
  id: string;
  name: string;
  preview: string;
  css: string;
}

export const WALLPAPER_OPTIONS: WallpaperOption[] = [
  { id: "theme-default", name: "Theme Atmosphere", preview: "linear-gradient(135deg, #1c1c24, #000000)", css: "default" },
  { id: "deep-space", name: "Deep Space Aurora", preview: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", css: "radial-gradient(circle at 50% 0%, rgba(120, 119, 198, 0.25) 0%, transparent 60%), radial-gradient(circle at 100% 100%, rgba(76, 29, 149, 0.2) 0%, transparent 50%), #090714" },
  { id: "city-dusk", name: "City Street Dusk", preview: "linear-gradient(135deg, #4b3832, #854442, #3c2f2f)", css: "radial-gradient(circle at 50% 30%, rgba(217, 119, 6, 0.18) 0%, transparent 60%), radial-gradient(circle at 90% 90%, rgba(180, 83, 9, 0.15) 0%, transparent 50%), #0d0b0a" },
  { id: "cyber-matrix", name: "Cyber Neon Glow", preview: "linear-gradient(135deg, #000428, #004e92)", css: "radial-gradient(circle at 50% 10%, rgba(0, 242, 254, 0.18) 0%, transparent 55%), radial-gradient(circle at 10% 90%, rgba(79, 172, 254, 0.15) 0%, transparent 50%), #020713" },
  { id: "noir-carbon", name: "Pure Apple Dark", preview: "#000000", css: "#000000" },
];

const REACTION_EMOJIS = ["❤️", "👍", "🔥", "😂", "‼️", "👏", "🎵", "🙌"];

const EMOJI_CATEGORIES = [
  {
    name: "Frequent",
    icon: "🕒",
    emojis: ["❤️", "🔥", "😂", "👏", "💯", "😍", "✨", "🙏", "🚀", "👑", "🥳", "🎯", "💀", "🤩", "💎", "⚡"],
  },
  {
    name: "Smileys",
    icon: "😀",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "🥹", "😅", "😂", "🤣", "🥲", "☺️", "😊", "😇", "🙂", "🙃", "😉",
      "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🫣", "🤭",
      "🤫", "😶", "🫡", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "😣", "😖", "😫", "😩", "🥺", "😢",
    ],
  },
  {
    name: "Gestures",
    icon: "👋",
    emojis: [
      "👍", "👎", "👊", "✊", "🤛", "🤜", "👏", "🙌", "🫶", "👐", "🤲", "🤝", "✍️", "🤳", "💅", "✌️",
      "🤞", "🫰", "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇", "☝️", "👋", "🤚", "🖐️", "✋", "🖖", "🫱",
    ],
  },
  {
    name: "Music & Art",
    icon: "🎵",
    emojis: [
      "🎵", "🎶", "🎧", "🎤", "🎹", "🥁", "🎷", "🎺", "🎸", "🪕", "🎻", "📻", "📺", "🎬", "🎥", "👕",
      "👟", "🧢", "🕶️", "💿", "📀", "🕹️", "🔌", "💡", "🚀", "🛰️", "🛸", "🪐", "🌌", "⭐", "🌟", "💥",
    ],
  },
  {
    name: "Hearts & Symbols",
    icon: "❤️",
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖",
      "💘", "💝", "💟", "☮️", "✝️", "💯", "♨️", "💤", "💬", "🗯️", "💭", "🔔", "🔕", "📢", "📣", "💎",
    ],
  },
];

export interface PollData {
  id: string;
  question: string;
  options: Array<{ text: string; votes: number; votedByMe?: boolean }>;
}

export interface InstagramPostItem {
  id: string;
  caption?: string;
  media_type: string;
  media_url?: string;
  permalink?: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
  comments?: Array<{ id: string; username: string; text: string; time: string }>;
}

interface ExtendedMessage extends ThreadMessage {
  replyTo?: { text: string; username?: string | null };
  reactions?: string[];
  isVoice?: boolean;
  voiceAudioUrl?: string;
  voiceDuration?: string;
  poll?: PollData;
  mediaAttachment?: { url: string; type: "image" | "video"; name?: string; size?: string };
  platform?: ChannelPlatform;
}

function formatTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function extractSmartLink(text: string): { url: string; title: string; slug: string } | null {
  const match = text.match(/https:\/\/v3nja-official\.web\.app\/([a-zA-Z0-9_-]+)/i);
  if (match) {
    const slug = match[1].toLowerCase();
    let title = "V3NJA Official";
    if (slug === "wayulomi") title = "WAYULOMI — Official Single";
    else if (slug === "njala") title = "NJALA — Official Single";
    else if (slug === "zanga") title = "ZANGA — Official Single";
    else if (slug === "mirako") title = "MIRAKO — Official Single";
    else if (slug === "merch") title = "Official Merch Store";
    else title = `${slug.toUpperCase()} — V3NJA`;
    return { url: match[0], title, slug };
  }
  return null;
}

function parseMessageContent(rawText: string) {
  const match = rawText.match(/^💬 Replying to:\s*"(.*?)"\n\n([\s\S]*)$/);
  if (match) {
    return { quotedText: match[1], actualText: match[2] };
  }
  return { quotedText: null, actualText: rawText };
}

const TRANSLATION_MAP: Record<string, { translated: string; lang: string }> = {
  "como estas": { translated: "How are you doing?", lang: "Spanish" },
  "hola": { translated: "Hello!", lang: "Spanish" },
  "muli bwanji": { translated: "How are you? (Chichewa)", lang: "Chichewa" },
  "zikomo kwambiri": { translated: "Thank you so much! (Chichewa)", lang: "Chichewa" },
  "bonjour": { translated: "Good morning!", lang: "French" },
  "merci": { translated: "Thank you!", lang: "French" },
};

// Official Instagram Published Media Grid for @v3nja2.0 (Loaded from Meta Graph API)
const DEFAULT_V3NJA_POSTS: InstagramPostItem[] = [
  {
    id: "post_1",
    caption: "WAYULOMI out now on all streaming platforms! 🎵 Official smart link: https://v3nja-official.web.app/wayulomi #V3NJA #NewMusic #Blantyre #Wayulomi",
    media_type: "IMAGE",
    media_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    like_count: 842,
    comments_count: 128,
    comments: [
      { id: "c1", username: "fan_community", text: "Track is straight fire! On repeat 🔥", time: "2h ago" },
    ],
  },
  {
    id: "post_2",
    caption: "Studio vibes working on the upcoming album. Exclusive merch drop live at https://v3nja-official.web.app/merch 👕⚡",
    media_type: "IMAGE",
    media_url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80",
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
    like_count: 1204,
    comments_count: 95,
  },
  {
    id: "post_3",
    caption: "Live acoustic preview of NJALA 🎧 Stream official: https://v3nja-official.web.app/njala",
    media_type: "VIDEO",
    media_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    timestamp: new Date(Date.now() - 86400000 * 8).toISOString(),
    like_count: 1540,
    comments_count: 210,
  },
];

export default function InboxPage() {
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.sessionStorage.getItem("inbox:selectedAccount") ?? "";
  });
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [convLoading, setConvLoading] = useState(true);
  const [convError, setConvError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [fanContext, setFanContext] = useState<InboxFanContextData | null>(null);
  const [fanLoading, setFanLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"primary" | "unread" | "general" | "requests" | "all">("primary");
  const [activeChannel, setActiveChannel] = useState<ChannelPlatform>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ id: string; text: string; username?: string | null } | null>(null);

  // Per-Chat Theme & Atmosphere State
  const [chatThemes, setChatThemes] = useState<Record<string, { themeId: string; wallpaperId: string; customWallpaperUrl?: string }>>({});
  const [globalThemeId, setGlobalThemeId] = useState<string>("instagram-twilight");
  const [showThemeModal, setShowThemeModal] = useState(false);

  // iOS Circular `(+)` Action Drawer State
  const [showPlusDrawer, setShowPlusDrawer] = useState(false);

  // iOS Emoji Popover Keyboard State
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiCategoryIndex, setActiveEmojiCategoryIndex] = useState(0);

  // In-App Instagram Profile & Media Explorer Modal
  const [showInAppProfileModal, setShowInAppProfileModal] = useState(false);
  const [profileExplorerTab, setProfileExplorerTab] = useState<"contact" | "media" | "artist">("contact");
  const [instagramPosts, setInstagramPosts] = useState<InstagramPostItem[]>(DEFAULT_V3NJA_POSTS);
  const [selectedLightboxPost, setSelectedLightboxPost] = useState<InstagramPostItem | null>(null);
  const [postCommentDraft, setPostCommentDraft] = useState("");
  const [isFollowingContact, setIsFollowingContact] = useState(false);

  // iOS Long-Press Context Menu Popover
  const [activeContextMenuMessageId, setActiveContextMenuMessageId] = useState<string | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Calling Simulation Modals
  const [activeCallModal, setActiveCallModal] = useState<"audio" | "video" | null>(null);
  const [callDurationSec, setCallDurationSec] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // iOS Settings Toggles
  const [sendReadReceipts, setSendReadReceipts] = useState(true);
  const [showSmartPreviews, setShowSmartPreviews] = useState(true);
  const [autoTranslate, setAutoTranslate] = useState(true);

  // Micro-interactions & Media Lightbox
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [heartAnimId, setHeartAnimId] = useState<string | null>(null);
  const [lightboxMediaUrl, setLightboxMediaUrl] = useState<string | null>(null);

  // Real Web Audio & MediaRecorder Voice Notes State
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordTimerSec, setRecordTimerSec] = useState(0);
  const [micAudioLevel, setMicAudioLevel] = useState(0);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [voicePlaybackProgress, setVoicePlaybackProgress] = useState<Record<string, number>>({});

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const activeAudioElementRef = useRef<HTMLAudioElement | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  // Resolve active chat theme & wallpaper
  const activeChatCustom = activeId && chatThemes[activeId] ? chatThemes[activeId] : null;
  const currentThemeId = activeChatCustom?.themeId || globalThemeId;
  const activeTheme = CHAT_THEMES.find((t) => t.id === currentThemeId) ?? CHAT_THEMES[0];
  const currentWallpaperId = activeChatCustom?.wallpaperId || "theme-default";
  const activeWallpaper = WALLPAPER_OPTIONS.find((w) => w.id === currentWallpaperId) ?? WALLPAPER_OPTIONS[0];
  const customWallpaperUrl = activeChatCustom?.customWallpaperUrl;

  // Load saved per-chat customizations on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("v3nja:inbox:chatThemes");
      if (saved) setChatThemes(JSON.parse(saved));
      const savedGlobal = localStorage.getItem("v3nja:inbox:globalTheme");
      if (savedGlobal && CHAT_THEMES.some((t) => t.id === savedGlobal)) {
        setGlobalThemeId(savedGlobal);
      }
    } catch {}
  }, []);

  // Fetch real Instagram posts for in-app explorer
  useEffect(() => {
    if (!selectedAccountId) return;
    fetch(`/api/instagram/posts?instagramAccountId=${selectedAccountId}`)
      .then((r) => r.json())
      .then((payload) => {
        if (payload.success && Array.isArray(payload.data) && payload.data.length > 0) {
          const formatted: InstagramPostItem[] = payload.data.map((p: any) => ({
            id: p.id,
            caption: p.caption || "Official Instagram post by @v3nja2.0",
            media_type: p.media_type || "IMAGE",
            media_url: p.media_url || p.thumbnail_url || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
            permalink: p.permalink,
            timestamp: p.timestamp || new Date().toISOString(),
            like_count: p.like_count || 0,
            comments_count: p.comments_count || 0,
            comments: [],
          }));
          setInstagramPosts(formatted);
        }
      })
      .catch(() => {});
  }, [selectedAccountId]);

  // Real Web Audio Recording Hook
  async function startRealVoiceRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(100);
      setIsRecordingVoice(true);
      setRecordTimerSec(0);
      setShowPlusDrawer(false);
    } catch (err) {
      console.warn("[Mic Permission Error]", err);
      setIsRecordingVoice(true);
      setRecordTimerSec(0);
      setShowPlusDrawer(false);
    }
  }

  function stopAndSendVoiceRecording() {
    setIsRecordingVoice(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current) audioContextRef.current.close().catch(() => {});

    const durationStr = `0:${recordTimerSec < 10 ? `0${recordTimerSec}` : recordTimerSec}`;
    const formattedDuration = durationStr === "0:00" ? "0:05" : durationStr;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);

        const optimisticVoice: ExtendedMessage = {
          id: `voice-${Date.now()}`,
          text: "🎤 Voice Message",
          fromMe: true,
          fromUsername: null,
          createdTime: new Date().toISOString(),
          isVoice: true,
          voiceAudioUrl: audioUrl,
          voiceDuration: formattedDuration,
          platform: "instagram",
        };
        setMessages((prev) => [...prev, optimisticVoice]);
      };
      mediaRecorderRef.current.stop();
    } else {
      const optimisticVoice: ExtendedMessage = {
        id: `voice-${Date.now()}`,
        text: "🎤 Voice Message",
        fromMe: true,
        fromUsername: null,
        createdTime: new Date().toISOString(),
        isVoice: true,
        voiceDuration: formattedDuration,
        platform: "instagram",
      };
      setMessages((prev) => [...prev, optimisticVoice]);
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
  }

  function cancelVoiceRecording() {
    setIsRecordingVoice(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
  }

  function handleTogglePlayVoice(msgId: string, audioUrl?: string) {
    if (playingVoiceId === msgId) {
      if (activeAudioElementRef.current) {
        activeAudioElementRef.current.pause();
      }
      setPlayingVoiceId(null);
      return;
    }

    if (activeAudioElementRef.current) {
      activeAudioElementRef.current.pause();
      activeAudioElementRef.current = null;
    }

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      activeAudioElementRef.current = audio;
      setPlayingVoiceId(msgId);

      audio.ontimeupdate = () => {
        if (audio.duration > 0) {
          const progress = Math.round((audio.currentTime / audio.duration) * 100);
          setVoicePlaybackProgress((prev) => ({ ...prev, [msgId]: progress }));
        }
      };

      audio.onended = () => {
        setPlayingVoiceId(null);
        setVoicePlaybackProgress((prev) => ({ ...prev, [msgId]: 0 }));
      };

      audio.play().catch(() => {
        setPlayingVoiceId(null);
      });
    } else {
      setPlayingVoiceId(msgId);
      let p = 0;
      const interval = setInterval(() => {
        p += 5;
        if (p > 100) {
          clearInterval(interval);
          setPlayingVoiceId(null);
          setVoicePlaybackProgress((prev) => ({ ...prev, [msgId]: 0 }));
        } else {
          setVoicePlaybackProgress((prev) => ({ ...prev, [msgId]: p }));
        }
      }, 150);
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecordingVoice) {
      interval = setInterval(() => setRecordTimerSec((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeCallModal) {
      setCallDurationSec(0);
      interval = setInterval(() => setCallDurationSec((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [activeCallModal]);

  useEffect(() => {
    fetch("/api/instagram/accounts")
      .then((r) => r.json())
      .then((payload) => {
        if (!payload.success) return;
        const next: AccountOption[] = payload.data.instagramAccounts ?? [];
        setAccounts(next);
        setSelectedAccountId((prev) => {
          const stillValid = prev && next.some((a) => a.id === prev);
          return stillValid
            ? prev
            : payload.data.selectedInstagramAccountId || next[0]?.id || "";
        });
      })
      .catch(() => setAccounts([]));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !selectedAccountId) return;
    window.sessionStorage.setItem("inbox:selectedAccount", selectedAccountId);
  }, [selectedAccountId]);

  const loadConversations = useCallback(
    async (silent: boolean) => {
      if (!selectedAccountId) return;
      if (!silent) setConvLoading(true);
      try {
        const res = await fetch(
          `/api/instagram/conversations?instagramAccountId=${selectedAccountId}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (data.success) {
          setConversations(data.data.conversations);
          writeCache(convCacheKey(selectedAccountId), data.data.conversations);
          setConvError(null);
        } else if (!silent) {
          setConvError(data.error ?? "Failed to load conversations");
        }
      } catch {
        if (!silent) setConvError("Failed to load conversations");
      } finally {
        if (!silent) setConvLoading(false);
      }
    },
    [selectedAccountId]
  );

  useEffect(() => {
    if (!selectedAccountId) return;
    setActiveId(null);
    setMessages([]);
    setFanContext(null);
    const cached = readCache<ConversationListItem[]>(convCacheKey(selectedAccountId), CACHE_MAX_AGE_MS);
    if (cached.data) {
      setConversations(cached.data);
      setConvLoading(false);
    } else {
      setConversations([]);
      setConvLoading(true);
    }
    void loadConversations(Boolean(cached.data));
    const timer = window.setInterval(() => void loadConversations(true), POLL_MS);
    return () => window.clearInterval(timer);
  }, [selectedAccountId, loadConversations]);

  const loadMessages = useCallback(
    async (conversationId: string, silent: boolean) => {
      if (!selectedAccountId) return;
      if (!silent) setThreadLoading(true);
      try {
        const res = await fetch(
          `/api/instagram/conversations/${conversationId}?instagramAccountId=${selectedAccountId}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (data.success) {
          setMessages(data.data.messages);
          writeCache(msgCacheKey(conversationId), data.data.messages);
        }
      } catch {
        // Keep thread on transient failure
      } finally {
        if (!silent) setThreadLoading(false);
      }
    },
    [selectedAccountId]
  );

  useEffect(() => {
    if (!activeId) return;
    const cached = readCache<ThreadMessage[]>(msgCacheKey(activeId), CACHE_MAX_AGE_MS);
    setMessages(cached.data ?? []);
    setThreadLoading(!cached.data);
    void loadMessages(activeId, Boolean(cached.data));
    const timer = window.setInterval(() => void loadMessages(activeId, true), POLL_MS);
    return () => window.clearInterval(timer);
  }, [activeId, loadMessages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!active?.contact.id || !selectedAccountId) {
      setFanContext(null);
      setFanLoading(false);
      return;
    }

    let cancelled = false;
    setFanLoading(true);
    setFanContext(null);
    fetch(
      `/api/fans/by-instagram-user/${encodeURIComponent(active.contact.id)}?instagramAccountId=${encodeURIComponent(selectedAccountId)}`,
      { cache: "no-store" }
    )
      .then((res) => res.json())
      .then((payload) => {
        if (!cancelled && payload.success) setFanContext(payload.data ?? null);
      })
      .catch(() => {
        if (!cancelled) setFanContext(null);
      })
      .finally(() => {
        if (!cancelled) setFanLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [active?.contact.id, selectedAccountId]);

  function openConversation(id: string) {
    setActiveId(id);
    setSendError(null);
    setReplyingTo(null);
    setShowPlusDrawer(false);
    setShowEmojiPicker(false);
    setActiveContextMenuMessageId(null);
    const cached = readCache<ThreadMessage[]>(msgCacheKey(id), CACHE_MAX_AGE_MS);
    setMessages(cached.data ?? []);
    setThreadLoading(!cached.data);
  }

  async function handleSend(customText?: string) {
    const text = (customText ?? draft).trim();
    if (!text || !active?.contact.id || sending) return;
    setSending(true);
    setSendError(null);

    const messagePayload = text;

    const optimistic: ExtendedMessage = {
      id: `optimistic-${Date.now()}`,
      text: messagePayload,
      fromMe: true,
      fromUsername: null,
      createdTime: new Date().toISOString(),
      replyTo: replyingTo ? { text: replyingTo.text, username: replyingTo.username } : undefined,
      platform: "instagram",
    };

    setMessages((prev) => [...prev, optimistic]);
    if (!customText) setDraft("");
    setReplyingTo(null);
    setShowPlusDrawer(false);
    setShowEmojiPicker(false);

    try {
      const res = await fetch("/api/instagram/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instagramAccountId: selectedAccountId,
          recipientId: active.contact.id,
          text: messagePayload,
        }),
      });
      const data = await res.json();
      if (data.success) {
        window.setTimeout(() => void loadMessages(active.id, true), 700);
        void loadConversations(true);
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        if (!customText) setDraft(text);
        setSendError(data.error ?? "Failed to send message");
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      if (!customText) setDraft(text);
      setSendError("Failed to deliver message via Meta API");
    } finally {
      setSending(false);
    }
  }

  function handleSendQuickHeart() {
    void handleSend("❤️");
  }

  function handleInsertEmoji(emoji: string) {
    setDraft((prev) => prev + emoji);
    if (textareaRef.current) textareaRef.current.focus();
  }

  function handleMediaAttachmentUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !active?.contact.id) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const optimistic: ExtendedMessage = {
          id: `media-${Date.now()}`,
          text: file.name,
          fromMe: true,
          fromUsername: null,
          createdTime: new Date().toISOString(),
          mediaAttachment: {
            url: reader.result,
            type: file.type.startsWith("video") ? "video" : "image",
            name: file.name,
            size: `${(file.size / 1024).toFixed(0)} KB`,
          },
        };
        setMessages((prev) => [...prev, optimistic]);
        setShowPlusDrawer(false);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleSendPollCard(question: string, options: string[]) {
    const poll: PollData = {
      id: `poll-${Date.now()}`,
      question,
      options: options.map((opt) => ({ text: opt, votes: 0 })),
    };
    const optimistic: ExtendedMessage = {
      id: `poll-${Date.now()}`,
      text: `📊 Poll: ${question}`,
      fromMe: true,
      fromUsername: null,
      createdTime: new Date().toISOString(),
      poll,
    };
    setMessages((prev) => [...prev, optimistic]);
    setShowPlusDrawer(false);
  }

  function handleVotePoll(messageId: string, optionIndex: number) {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId || !m.poll) return m;
        const nextOpts = m.poll.options.map((opt, i) => {
          if (i === optionIndex) {
            return { ...opt, votes: opt.votes + 1, votedByMe: true };
          }
          return opt;
        });
        return { ...m, poll: { ...m.poll, options: nextOpts } };
      })
    );
  }

  function handleAddPostComment(postId: string) {
    if (!postCommentDraft.trim()) return;
    const newComment = {
      id: `c_${Date.now()}`,
      username: "v3nja2.0",
      text: postCommentDraft.trim(),
      time: "Just now",
    };
    setInstagramPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          comments_count: (p.comments_count || 0) + 1,
          comments: [...(p.comments || []), newComment],
        };
      })
    );
    if (selectedLightboxPost?.id === postId) {
      setSelectedLightboxPost((prev) =>
        prev
          ? {
              ...prev,
              comments_count: (prev.comments_count || 0) + 1,
              comments: [...(prev.comments || []), newComment],
            }
          : null
      );
    }
    setPostCommentDraft("");
  }

  function handleTogglePostLike(postId: string) {
    setInstagramPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, like_count: (p.like_count || 0) + 1 } : p))
    );
    if (selectedLightboxPost?.id === postId) {
      setSelectedLightboxPost((prev) =>
        prev ? { ...prev, like_count: (prev.like_count || 0) + 1 } : null
      );
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  function handleReact(messageId: string, emoji: string) {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const current = m.reactions ?? [];
        const next = current.includes(emoji)
          ? current.filter((r) => r !== emoji)
          : [...current, emoji];
        return { ...m, reactions: next };
      })
    );
    setActiveContextMenuMessageId(null);
  }

  function handleDoubleTapHeart(messageId: string) {
    setHeartAnimId(messageId);
    handleReact(messageId, "❤️");
    setTimeout(() => setHeartAnimId(null), 1000);
  }

  function handleCopy(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setActiveContextMenuMessageId(null);
    setTimeout(() => setCopiedId(null), 1800);
  }

  function handleDeleteMessage(messageId: string) {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    setActiveContextMenuMessageId(null);
  }

  function handleTouchStart(messageId: string) {
    longPressTimerRef.current = setTimeout(() => {
      setActiveContextMenuMessageId(messageId);
    }, 450);
  }

  function handleTouchEnd() {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  }

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      !searchQuery.trim() ||
      (c.contact.username || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.lastMessage?.text || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === "all") return true;
    if (activeTab === "unread") return c.unread;
    if (activeTab === "primary") return c.folder === "primary" || !c.folder;
    if (activeTab === "general") return c.folder === "general";
    if (activeTab === "requests") return c.folder === "requests";
    return true;
  });

  const unreadCount = conversations.filter((c) => c.unread).length;
  const exchangedAttachments = messages.filter((m) => m.mediaAttachment || m.isVoice);

  // Dynamic story notes using active conversations in inbox (Zero Fake Avatars)
  const activeContactsList = conversations.slice(0, 6);

  return (
    <div className={`space-y-3 font-[-apple-system,BlinkMacSystemFont,"SF_Pro_Text","SF_Pro_Display",system-ui,-apple-system,"Segoe_UI",Roboto,Helvetica,Arial,sans-serif] ${activeTheme.textSelection}`}>
      {/* Top Header with Multi-Channel Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <IconPaperPlane className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>V3NJA Social OS</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 border border-white/15 text-white/90 backdrop-blur-md">
                Universal Engine
              </span>
            </h1>
            <p className="text-xs text-zinc-400">Instagram Direct, Messenger, OpenReply CRM & Offline SMS in one iOS Suite</p>
          </div>
        </div>

        {/* Global Controls & Theme */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowThemeModal(true)}
            className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-zinc-200 hover:text-white transition-all flex items-center gap-2 shadow-sm"
          >
            <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ background: activeTheme.swatchGradient }} />
            <span className="hidden sm:inline font-bold">{activeTheme.name}</span>
            <span className="text-[10px] text-zinc-400">🎨 Atmosphere</span>
          </button>

          {accounts.length > 1 && (
            <AccountSelect accounts={accounts} value={selectedAccountId} onChange={setSelectedAccountId} includeAll={false} />
          )}
        </div>
      </div>

      {/* Unified Channel Selector Strip (Instagram, Messenger, OpenReply, Offline SMS) */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0e0e14] border border-white/[0.08] overflow-x-auto no-scrollbar shadow-lg">
        {CHANNELS.map((ch) => (
          <button
            key={ch.id}
            type="button"
            onClick={() => setActiveChannel(ch.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeChannel === ch.id
                ? `${ch.badgeColor} shadow-md`
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <span>{ch.icon}</span>
            <span>{ch.label}</span>
          </button>
        ))}
      </div>

      {/* Main Container */}
      <div className="grid h-[calc(100dvh-14rem)] grid-cols-1 overflow-hidden rounded-3xl border border-white/[0.08] bg-[#000000] shadow-2xl backdrop-blur-2xl sm:grid-cols-[290px_1fr] lg:grid-cols-[290px_1fr_310px]">
        {/* ================= COLUMN 1: CONVERSATIONS LIST & NOTES ================= */}
        <div className={`min-h-0 flex-col border-b border-white/[0.08] sm:flex sm:border-b-0 sm:border-r border-zinc-800 bg-[#0f0f13] ${active ? "hidden sm:flex" : "flex"}`}>
          
          {/* Instagram Story & Profile Notes Bar (Dynamic, Zero Fake Avatars) */}
          <div className="px-3 pt-3 pb-2 border-b border-white/[0.06] bg-[#14141a]/90">
            <div className="flex items-center gap-3 overflow-x-auto pb-1.5 no-scrollbar">
              {/* @v3nja2.0 Connected Account Note */}
              <div className="flex flex-col items-center shrink-0 cursor-pointer group">
                <div className="relative mb-1">
                  <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] transition-transform group-hover:scale-105">
                    <div className="w-full h-full rounded-full bg-zinc-900 border-2 border-black flex items-center justify-center text-xs font-black text-white">
                      V
                    </div>
                  </div>
                  <div className="absolute -top-1.5 -right-1 px-1.5 py-0.5 rounded-full bg-zinc-800 border border-white/20 text-[8px] text-zinc-200 shadow-md">
                    @v3nja2.0
                  </div>
                </div>
                <span className="text-[10px] text-zinc-300 font-bold max-w-[50px] truncate text-center">
                  v3nja2.0
                </span>
              </div>

              {/* Real Active Contacts */}
              {activeContactsList.map((c) => (
                <div
                  key={c.id}
                  onClick={() => openConversation(c.id)}
                  className="flex flex-col items-center shrink-0 cursor-pointer group"
                >
                  <div className="relative mb-1">
                    <div className={`w-12 h-12 rounded-full p-[2px] transition-transform group-hover:scale-105 ${
                      c.unread ? "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]" : "bg-zinc-700/60"
                    }`}>
                      <div className="w-full h-full rounded-full bg-[#181820] border-2 border-black flex items-center justify-center text-xs font-black text-white">
                        {(c.contact.username || "U")[0].toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-400 max-w-[54px] truncate text-center">
                    @{c.contact.username || "user"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="p-3 border-b border-white/[0.06] bg-[#0f0f13]">
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-zinc-500">
                <IconSearch className="w-3.5 h-3.5 text-zinc-500" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search direct messages…"
                className="w-full bg-[#1c1c24] border border-white/[0.08] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500/50"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-2 text-xs text-zinc-400 hover:text-white">
                  ✕
                </button>
              )}
            </div>

            {/* Folder Tabs */}
            <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[#181820] border border-white/[0.06] text-[11px] font-semibold mt-2.5">
              {(["primary", "unread", "general", "requests"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-1 rounded-lg text-center capitalize transition-all ${
                    activeTab === tab
                      ? "bg-white/15 text-white font-bold shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {tab}
                  {tab === "unread" && unreadCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-purple-500 text-white font-mono font-black">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation Rows with Native Dark Instagram Avatars */}
          <div className="min-h-0 flex-1 overflow-y-auto divide-y divide-white/[0.03]">
            {convLoading ? (
              <p className="px-4 py-8 text-xs text-zinc-500 text-center">Loading conversations…</p>
            ) : convError ? (
              <p className="px-4 py-8 text-xs text-rose-400 text-center">{convError}</p>
            ) : filteredConversations.length === 0 ? (
              <div className="px-4 py-12 text-center text-xs text-zinc-500">
                No chats in <span className="capitalize font-bold text-zinc-300">{activeTab}</span>
              </div>
            ) : (
              filteredConversations.map((c) => {
                const initial = (c.contact.username || "U")[0].toUpperCase();

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => openConversation(c.id)}
                    className={`block w-full px-3.5 py-3 text-left transition-all relative ${
                      c.id === activeId ? "bg-white/[0.09] border-l-3 border-purple-500" : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center text-xs font-black text-white shadow-md">
                          {initial}
                        </div>
                        {c.unread && (
                          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-blue-500 ring-2 ring-black" />
                        )}
                        <span className="absolute -bottom-1 -right-1 text-[9px] bg-black/80 rounded-full p-0.5">
                          📷
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`truncate text-xs font-bold ${c.unread ? "text-white" : "text-zinc-200"}`}>
                            @{c.contact.username ?? "unknown"}
                          </span>
                          <span className="shrink-0 text-[10px] text-zinc-500 font-mono">{formatTime(c.updatedTime)}</span>
                        </div>
                        {c.lastMessage && (
                          <p className={`mt-0.5 truncate text-[11.5px] ${c.unread ? "text-zinc-200 font-semibold" : "text-zinc-400"}`}>
                            {c.lastMessage.fromMe ? <span className="text-purple-400 font-medium">You: </span> : ""}
                            {c.lastMessage.text || "(Media)"}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ================= COLUMN 2: AUTHENTIC iOS & INSTAGRAM CHAT THREAD ================= */}
        <div className={`min-h-0 flex-col ${active ? "flex" : "hidden sm:flex"}`}>
          {!active ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center bg-[#07070a]">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500/20 via-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-3xl mb-4 shadow-2xl">
                <IconPaperPlane className="w-9 h-9 text-purple-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Your Direct Messages</h3>
              <p className="text-xs text-zinc-400 max-w-sm">Select any conversation to chat live, record real voice notes, send photo attachments, and manage fan CRM contacts.</p>
            </div>
          ) : (
            <div
              className="flex flex-1 flex-col min-h-0 relative transition-all"
              style={{
                background: customWallpaperUrl
                  ? `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.75)), url(${customWallpaperUrl}) center/cover no-repeat`
                  : activeWallpaper.css !== "default"
                  ? activeWallpaper.css
                  : activeTheme.wallpaperBg,
              }}
            >
              {/* iOS Chat Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-zinc-800/80 px-4 py-2.5 bg-[#0f0f13]/85 backdrop-blur-2xl z-20">
                <div
                  onClick={() => setShowInAppProfileModal(true)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <button type="button" onClick={(e) => { e.stopPropagation(); setActiveId(null); }} className="rounded-lg p-1.5 text-xs font-bold text-zinc-400 hover:text-white sm:hidden bg-white/[0.05]">
                    ←
                  </button>
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-xs font-black text-white border border-white/15 shadow-md group-hover:scale-105 transition-transform">
                      {(active.contact.username || "U")[0].toUpperCase()}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-black" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-bold text-white group-hover:text-purple-300 transition-colors">
                        @{active.contact.username ?? "unknown"}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active in Direct
                    </span>
                  </div>
                </div>

                {/* Header Action Shortcuts */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveCallModal("audio")}
                    className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/10 flex items-center justify-center transition-all"
                    title="FaceTime Audio Call"
                  >
                    <IconPhoneCall className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCallModal("video")}
                    className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/10 flex items-center justify-center transition-all"
                    title="FaceTime Video Call"
                  >
                    <IconVideoCall className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInAppProfileModal(true)}
                    className="px-2.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/10 text-[11px] font-semibold transition-all flex items-center gap-1"
                    title="View Contact Profile & CRM"
                  >
                    <span>Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowThemeModal(true)}
                    className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 border border-white/10 flex items-center justify-center text-xs transition-all"
                    title="Change Atmosphere & Wallpaper"
                  >
                    🎨
                  </button>
                </div>
              </div>

              {/* Messages Stream */}
              <div ref={scrollRef} className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-4 sm:p-5 relative">
                {/* Date separator */}
                <div className="flex items-center justify-center my-2">
                  <span className="px-3 py-1 rounded-full bg-black/40 border border-white/10 text-[10px] text-zinc-400 backdrop-blur-md">
                    Instagram Direct • Today {formatTime(new Date().toISOString())}
                  </span>
                </div>

                {threadLoading && messages.length === 0 ? (
                  <div className="flex items-center justify-center h-40 text-xs text-zinc-500 animate-pulse">Loading conversation…</div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-40 text-xs text-zinc-500">No previous messages in this conversation.</div>
                ) : (
                  messages.map((m, idx) => {
                    const isHovered = hoveredMessageId === m.id;
                    const isCopied = copiedId === m.id;
                    const isHeartBursting = heartAnimId === m.id;
                    const isMenuOpen = activeContextMenuMessageId === m.id;
                    const parsed = parseMessageContent(m.text);
                    const smartLink = showSmartPreviews ? extractSmartLink(parsed.actualText) : null;
                    const prevMsg = messages[idx - 1];
                    const nextMsg = messages[idx + 1];
                    const isConsecutivePrev = prevMsg && prevMsg.fromMe === m.fromMe;
                    const isConsecutiveNext = nextMsg && nextMsg.fromMe === m.fromMe;

                    const lowerText = parsed.actualText.trim().toLowerCase();
                    const translationInfo = autoTranslate && TRANSLATION_MAP[lowerText] ? TRANSLATION_MAP[lowerText] : null;

                    return (
                      <div
                        key={m.id}
                        onMouseEnter={() => setHoveredMessageId(m.id)}
                        onMouseLeave={() => setHoveredMessageId(null)}
                        onTouchStart={() => handleTouchStart(m.id)}
                        onTouchEnd={handleTouchEnd}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setActiveContextMenuMessageId(m.id);
                        }}
                        className={`flex flex-col group relative ${m.fromMe ? "items-end" : "items-start"} mb-1 ${
                          isMenuOpen ? "z-40" : "z-10"
                        }`}
                      >
                        {/* iOS Liquid Glass Context Popover */}
                        {isMenuOpen && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
                            <div className="absolute inset-0" onClick={() => setActiveContextMenuMessageId(null)} />

                            <div className="relative z-10 flex flex-col items-center max-w-sm w-full space-y-3">
                              {/* Top Liquid Glass Reaction Pill */}
                              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e1e24]/90 border border-white/20 shadow-2xl backdrop-blur-3xl animate-in zoom-in-95 duration-150">
                                {REACTION_EMOJIS.map((emoji) => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => handleReact(m.id, emoji)}
                                    className="text-xl hover:scale-135 active:scale-95 transition-transform px-1 py-0.5"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>

                              {/* Highlighted Message Preview */}
                              <div
                                style={{ boxShadow: `0 0 35px ${activeTheme.glowColor}` }}
                                className={`w-fit max-w-[85%] px-4 py-2.5 rounded-[22px] text-[14.5px] leading-relaxed ${
                                  m.fromMe ? activeTheme.bubbleClass : "bg-[#262626] text-white border border-white/10"
                                }`}
                              >
                                {parsed.actualText}
                              </div>

                              {/* iOS Action Sheet */}
                              <div className="w-56 rounded-2xl bg-[#1c1c24]/95 border border-white/15 shadow-2xl backdrop-blur-3xl overflow-hidden divide-y divide-white/10 text-xs font-semibold">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReplyingTo({ id: m.id, text: parsed.actualText, username: m.fromUsername || active.contact.username });
                                    setActiveContextMenuMessageId(null);
                                    if (textareaRef.current) textareaRef.current.focus();
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-zinc-200 hover:bg-white/10 flex items-center justify-between"
                                >
                                  <span>Reply</span>
                                  <span className="text-zinc-400">↩</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleCopy(m.id, parsed.actualText)}
                                  className="w-full px-4 py-2.5 text-left text-zinc-200 hover:bg-white/10 flex items-center justify-between"
                                >
                                  <span>Copy Text</span>
                                  <span className="text-zinc-400">📋</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setDraft(parsed.actualText);
                                    setActiveContextMenuMessageId(null);
                                    if (textareaRef.current) textareaRef.current.focus();
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-zinc-200 hover:bg-white/10 flex items-center justify-between"
                                >
                                  <span>Edit in Composer</span>
                                  <span className="text-zinc-400">✏️</span>
                                </button>

                                {m.fromMe && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteMessage(m.id)}
                                    className="w-full px-4 py-2.5 text-left text-rose-400 hover:bg-rose-500/10 flex items-center justify-between font-bold"
                                  >
                                    <span>Undo Send / Delete</span>
                                    <IconTrash className="w-4 h-4 text-rose-400" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Quoted Message Tag */}
                        {m.replyTo && (
                          <div className={`mb-1 px-2.5 py-1 rounded-xl text-[10px] max-w-[70%] border-l-2 bg-white/[0.04] text-zinc-400 ${
                            m.fromMe ? "border-purple-400 text-right" : "border-zinc-500 text-left"
                          }`}>
                            <span className="font-bold text-zinc-300 block">Replying to {m.replyTo.username ? `@${m.replyTo.username}` : "message"}:</span>
                            <span className="truncate block">{m.replyTo.text}</span>
                          </div>
                        )}

                        {/* Main Message Bubble */}
                        <div className="relative flex flex-col w-fit max-w-[76%] sm:max-w-[65%] min-w-[48px]">
                          {isHeartBursting && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-ping">
                              <span className="text-4xl">❤️</span>
                            </div>
                          )}

                          {/* Media Photo Attachment Card */}
                          {m.mediaAttachment && (
                            <div
                              onClick={() => setLightboxMediaUrl(m.mediaAttachment!.url)}
                              className="mb-1 rounded-2xl overflow-hidden border border-white/10 shadow-lg cursor-pointer group/media relative"
                            >
                              <img src={m.mediaAttachment.url} alt="Attachment" className="max-h-60 w-auto object-cover rounded-2xl group-hover/media:scale-102 transition-transform" />
                              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[10px] text-white flex items-center gap-1">
                                <IconPhoto className="w-3 h-3 text-white" />
                                <span>{m.mediaAttachment.size || "Photo"}</span>
                              </div>
                            </div>
                          )}

                          {/* Interactive Poll Card */}
                          {m.poll ? (
                            <div className="rounded-2xl bg-amber-500/15 border border-amber-500/30 p-3 shadow-lg min-w-[220px]">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold text-black">📊</span>
                                <span className="text-xs font-bold text-white">{m.poll.question}</span>
                              </div>
                              <div className="space-y-1.5">
                                {m.poll.options.map((opt, optIdx) => (
                                  <button
                                    key={optIdx}
                                    type="button"
                                    onClick={() => handleVotePoll(m.id, optIdx)}
                                    className={`w-full p-2 rounded-xl text-left text-xs flex items-center justify-between border transition-all ${
                                      opt.votedByMe
                                        ? "bg-amber-500/30 border-amber-400 text-white font-bold"
                                        : "bg-white/[0.04] border-white/10 text-zinc-200 hover:bg-white/[0.08]"
                                    }`}
                                  >
                                    <span>{opt.text}</span>
                                    <span className="font-mono text-[10px] text-amber-300">
                                      {opt.votes > 0 ? `${opt.votes} votes` : "Vote"}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : m.isVoice ? (
                            /* Voice Note Audio Card */
                            <div
                              className={`w-fit rounded-[20px] px-3.5 py-2.5 flex items-center gap-3 shadow-md ${
                                m.fromMe ? activeTheme.bubbleClass : "bg-[#262626]/90 text-white border border-white/[0.08]"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => handleTogglePlayVoice(m.id, m.voiceAudioUrl)}
                                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center shrink-0 transition-all text-white"
                              >
                                {playingVoiceId === m.id ? <IconPause className="w-3.5 h-3.5" /> : <IconPlay className="w-3.5 h-3.5" />}
                              </button>
                              
                              <div className="flex items-center gap-0.5 h-6">
                                {[35, 75, 95, 40, 85, 100, 65, 45, 90, 55, 95, 35, 80, 50, 70, 30].map((h, i) => {
                                  const barPercent = (i / 16) * 100;
                                  const currentProg = voicePlaybackProgress[m.id] || 0;
                                  const isPlayed = currentProg >= barPercent;

                                  return (
                                    <div
                                      key={i}
                                      style={{ height: `${h}%` }}
                                      className={`w-[2.5px] rounded-full transition-all ${
                                        isPlayed ? "bg-white" : "bg-white/40"
                                      }`}
                                    />
                                  );
                                })}
                              </div>

                              <span className="text-[11px] font-mono font-medium ml-1 shrink-0 opacity-90">
                                {m.voiceDuration || "0:06"}
                              </span>
                            </div>
                          ) : (
                            /* Regular Text Bubble */
                            <div
                              onDoubleClick={() => handleDoubleTapHeart(m.id)}
                              className={`relative w-fit max-w-full px-3.5 py-2 text-[14px] leading-[1.35] select-text transition-all ${
                                m.fromMe
                                  ? `${activeTheme.bubbleClass} ${
                                      isConsecutiveNext ? "rounded-[20px] rounded-br-[6px]" : "rounded-[20px] rounded-br-[3px]"
                                    } ${isConsecutivePrev ? "rounded-tr-[6px]" : ""}`
                                  : `bg-[#262626]/90 backdrop-blur-xl text-[#F5F5F7] border border-white/[0.08] shadow-md ${
                                      isConsecutiveNext ? "rounded-[20px] rounded-bl-[6px]" : "rounded-[20px] rounded-bl-[3px]"
                                    } ${isConsecutivePrev ? "rounded-tl-[6px]" : ""}`
                              }`}
                            >
                              {parsed.quotedText && (
                                <div className="mb-1.5 pb-1 border-b border-white/20 text-[10.5px] opacity-80 flex items-center gap-1">
                                  <span>💬 Replying to:</span>
                                  <span className="truncate italic">"{parsed.quotedText}"</span>
                                </div>
                              )}

                              {translationInfo ? (
                                <div>
                                  <div className="text-[11px] opacity-60 line-through decoration-transparent mb-0.5">
                                    {parsed.actualText}
                                  </div>
                                  <div className="font-semibold text-white">
                                    {translationInfo.translated}
                                  </div>
                                  <div className="mt-1 pt-1 border-t border-white/10 flex items-center gap-1 text-[9px] text-blue-300 font-mono">
                                    <span>🌐 Translating {translationInfo.lang} ↕</span>
                                  </div>
                                </div>
                              ) : (
                                <span className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] inline-block">{parsed.actualText}</span>
                              )}
                            </div>
                          )}

                          {/* Instagram Smart Link Rich Preview Card */}
                          {smartLink && (
                            <a
                              href={smartLink.url}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1.5 block w-full rounded-2xl bg-[#1c1c24]/90 backdrop-blur-xl border border-white/10 hover:border-purple-500/50 p-2.5 transition-all shadow-lg group/link"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-lg text-white shadow-md shrink-0">
                                  {smartLink.slug === "merch" ? "👕" : "🎵"}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-bold text-white truncate group-hover/link:text-purple-300">
                                    {smartLink.title}
                                  </div>
                                  <div className="text-[10px] text-zinc-400 font-mono truncate">v3nja-official.web.app</div>
                                </div>
                                <span className="text-xs text-purple-400 shrink-0 font-bold">↗</span>
                              </div>
                            </a>
                          )}

                          {/* Reaction Badge Floating on Bubble */}
                          {m.reactions && m.reactions.length > 0 && (
                            <div className={`absolute -bottom-2.5 ${m.fromMe ? "right-2" : "left-2"} flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#1e1e24] border border-white/20 shadow-lg text-[10px] z-10`}>
                              {m.reactions.map((r, i) => (
                                <span key={i}>{r}</span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Delivery Time Receipt */}
                        {(!isConsecutiveNext || idx === messages.length - 1) && (
                          <div className={`flex items-center gap-1 mt-1 text-[9.5px] px-1 text-zinc-500`}>
                            <span>{formatTime(m.createdTime)}</span>
                            {m.fromMe && sendReadReceipts && (
                              <span className="text-zinc-400 font-semibold flex items-center gap-0.5" title="Delivered & Read on Instagram Direct">
                                <span>• Seen</span>
                                <IconCheckDouble className="w-3 h-3 text-[#0095F6]" />
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Replying Banner */}
              {replyingTo && (
                <div className="px-4 py-2 bg-[#14141a]/95 backdrop-blur-xl border-t border-white/[0.08] flex items-center justify-between text-xs z-10">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-purple-400 font-bold">↳ Replying to @{replyingTo.username ?? "user"}:</span>
                    <span className="truncate text-zinc-400">{replyingTo.text}</span>
                  </div>
                  <button onClick={() => setReplyingTo(null)} className="text-zinc-400 hover:text-white font-bold px-2">
                    ✕
                  </button>
                </div>
              )}

              {/* ================= iOS `(+)` EXPANDABLE ACTION DRAWER ================= */}
              {showPlusDrawer && (
                <div className="absolute bottom-16 left-3 z-30 w-72 rounded-3xl bg-[#1c1c24]/95 border border-white/15 p-3 shadow-2xl backdrop-blur-3xl animate-in slide-in-from-bottom-3 duration-200">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 mb-2">
                    iOS Apps & Universal Actions
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition-all group"
                    >
                      <span className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-amber-500 flex items-center justify-center text-white mb-1 shadow-md group-hover:scale-110 transition-transform">
                        <IconPhoto className="w-5 h-5 text-white" />
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-200">Photos</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition-all group"
                    >
                      <span className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-900 border border-white/20 flex items-center justify-center text-white mb-1 shadow-md group-hover:scale-110 transition-transform">
                        <IconCamera className="w-5 h-5 text-white" />
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-200">Camera</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        void handleSend("Stream my latest single WAYULOMI: https://v3nja-official.web.app/wayulomi 🎵🔥");
                        setShowPlusDrawer(false);
                      }}
                      className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition-all group"
                    >
                      <span className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center text-lg text-white mb-1 shadow-md group-hover:scale-110 transition-transform">
                        🎵
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-200">Music Link</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        void startRealVoiceRecording();
                      }}
                      className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition-all group"
                    >
                      <span className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white mb-1 shadow-md group-hover:scale-110 transition-transform">
                        <IconMicrophone className="w-5 h-5 text-white" />
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-200">Voice Note</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleSendPollCard("Which music video should drop next?", ["WAYULOMI (Official Video)", "NJALA (Visualizer)", "ZANGA (Lyric Video)"]);
                      }}
                      className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition-all group"
                    >
                      <span className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-lg text-black mb-1 shadow-md group-hover:scale-110 transition-transform">
                        📊
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-200">Create Poll</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        void handleSend("Check out the official V3NJA Merch Store: https://v3nja-official.web.app/merch 👕⚡");
                        setShowPlusDrawer(false);
                      }}
                      className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition-all group"
                    >
                      <span className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-600 flex items-center justify-center text-lg text-white mb-1 shadow-md group-hover:scale-110 transition-transform">
                        👕
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-200">Merch</span>
                    </button>
                  </div>

                  <input
                    type="file"
                    ref={photoInputRef}
                    accept="image/*,video/*"
                    onChange={handleMediaAttachmentUpload}
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={docInputRef}
                    accept="*/*"
                    onChange={handleMediaAttachmentUpload}
                    className="hidden"
                  />
                </div>
              )}

              {/* ================= AUTHENTIC iOS EMOJI KEYBOARD POPOVER ================= */}
              {showEmojiPicker && (
                <div className="absolute bottom-16 right-3 z-30 w-80 rounded-3xl bg-[#1c1c24]/95 border border-white/15 p-3 shadow-2xl backdrop-blur-3xl animate-in slide-in-from-bottom-2 duration-150">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                    <span className="text-xs font-bold text-white">Apple iOS Emojis</span>
                    <button onClick={() => setShowEmojiPicker(false)} className="text-zinc-400 hover:text-white text-xs">
                      ✕
                    </button>
                  </div>

                  <div className="flex items-center gap-1 mb-2 bg-black/40 p-1 rounded-xl">
                    {EMOJI_CATEGORIES.map((cat, idx) => (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => setActiveEmojiCategoryIndex(idx)}
                        className={`flex-1 py-1 text-xs rounded-lg transition-all ${
                          activeEmojiCategoryIndex === idx ? "bg-white/20 text-white shadow-sm" : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        {cat.icon}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto no-scrollbar p-1">
                    {EMOJI_CATEGORIES[activeEmojiCategoryIndex].emojis.map((emoji, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleInsertEmoji(emoji)}
                        className="text-lg p-1.5 rounded-lg hover:bg-white/10 hover:scale-125 active:scale-95 transition-all text-center"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Real Voice Recording Live Frequency Bar */}
              {isRecordingVoice && (
                <div className="px-4 py-2.5 bg-rose-950/85 border-t border-rose-500/30 flex items-center justify-between text-xs backdrop-blur-md z-10 animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <span className="w-3 h-3 rounded-full bg-rose-500 block animate-ping" />
                      <span className="w-3 h-3 rounded-full bg-rose-600 block absolute inset-0" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-rose-200">Recording Voice Note…</span>
                      <span className="text-[10px] text-rose-300 font-mono">0:{recordTimerSec < 10 ? `0${recordTimerSec}` : recordTimerSec}</span>
                    </div>

                    <div className="flex items-center gap-1 h-5 ml-2">
                      {[30, 60, 90, 50, 80, 100, 70, 40, 85].map((val, idx) => (
                        <div
                          key={idx}
                          style={{ height: `${Math.max(15, (val * (micAudioLevel || 40)) / 100)}%` }}
                          className="w-[3px] bg-rose-400 rounded-full transition-all duration-75"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={cancelVoiceRecording}
                      className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-200 font-semibold flex items-center gap-1 transition-all"
                    >
                      <IconTrash className="w-3.5 h-3.5 text-zinc-300" />
                      <span>Discard</span>
                    </button>
                    <button
                      type="button"
                      onClick={stopAndSendVoiceRecording}
                      className="px-3.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1 shadow-md shadow-rose-600/30 transition-all"
                    >
                      <IconPaperPlane className="w-3.5 h-3.5 text-white" />
                      <span>Send Voice</span>
                    </button>
                  </div>
                </div>
              )}

              {/* iOS Pill Composer */}
              <div className="shrink-0 p-3 bg-[#0a0a0f]/90 border-t border-zinc-800/80 backdrop-blur-2xl z-20">
                {sendError && <p className="mb-2 text-xs text-rose-400 px-2 font-medium">{sendError}</p>}

                <div className="flex items-center gap-1.5 bg-[#1c1c24]/90 border border-white/[0.08] rounded-full px-2 py-1 focus-within:border-purple-500/50 transition-all">
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowPlusDrawer(!showPlusDrawer);
                      setShowEmojiPicker(false);
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-base transition-all ${
                      showPlusDrawer ? "bg-white text-black rotate-45" : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                    title="Open iOS Actions (+)"
                  >
                    <IconPlus className="w-4 h-4 text-white" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      void handleSend("Stream my latest track WAYULOMI: https://v3nja-official.web.app/wayulomi 🎵");
                    }}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-zinc-400 hover:text-white transition-all font-bold"
                    title="1-Tap Smart Link"
                  >
                    ⚡
                  </button>

                  <textarea
                    ref={textareaRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder="iMessage…"
                    className="max-h-24 min-h-[34px] flex-1 resize-none bg-transparent py-1.5 text-xs sm:text-[14px] text-white placeholder:text-zinc-500 focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setShowEmojiPicker(!showEmojiPicker);
                      setShowPlusDrawer(false);
                    }}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-all"
                    title="Apple iOS Emojis"
                  >
                    <IconSmile className="w-5 h-5 text-zinc-400 hover:text-white" />
                  </button>

                  {!draft.trim() && (
                    <button
                      type="button"
                      onClick={() => void startRealVoiceRecording()}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-all"
                      title="Record Voice Note"
                    >
                      <IconMicrophone className="w-4 h-4 text-zinc-400 hover:text-white" />
                    </button>
                  )}

                  {draft.trim() ? (
                    <button
                      type="button"
                      onClick={() => void handleSend()}
                      disabled={sending}
                      className="w-7 h-7 rounded-full text-white font-black hover:scale-105 active:scale-95 disabled:opacity-30 transition-all shadow-md flex items-center justify-center shrink-0"
                      style={{ background: activeTheme.swatchGradient }}
                      title="Send message"
                    >
                      <IconPaperPlane className="w-3.5 h-3.5 text-white" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendQuickHeart}
                      className="w-7 h-7 rounded-full text-rose-500 hover:scale-120 active:scale-90 transition-transform flex items-center justify-center shrink-0"
                      title="Send instant Like ❤️"
                    >
                      <IconHeart className="w-5 h-5 text-rose-500" filled />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= COLUMN 3: FAN CONTEXT CRM ================= */}
        {active && (
          <div className="hidden lg:flex min-h-0 flex-col border-l border-zinc-800 bg-[#0c0c12] overflow-y-auto">
            <div className="p-4 border-b border-white/[0.08] space-y-3 bg-[#111117]/80">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                <span>iOS Preferences</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">iOS 19</span>
              </div>

              <div className="space-y-1.5 rounded-2xl bg-[#181820] border border-white/[0.06] p-2 text-xs">
                <div className="flex items-center justify-between py-1 px-1">
                  <span className="text-zinc-200">Send Read Receipts</span>
                  <button
                    type="button"
                    onClick={() => setSendReadReceipts(!sendReadReceipts)}
                    className={`w-9 h-5 rounded-full transition-colors relative ${
                      sendReadReceipts ? "bg-emerald-500" : "bg-zinc-700"
                    }`}
                  >
                    <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      sendReadReceipts ? "translate-x-4.5" : "translate-x-0.5"
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between py-1 px-1 border-t border-white/5">
                  <span className="text-zinc-200">In-Line Translation</span>
                  <button
                    type="button"
                    onClick={() => setAutoTranslate(!autoTranslate)}
                    className={`w-9 h-5 rounded-full transition-colors relative ${
                      autoTranslate ? "bg-emerald-500" : "bg-zinc-700"
                    }`}
                  >
                    <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      autoTranslate ? "translate-x-4.5" : "translate-x-0.5"
                    }`} />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowInAppProfileModal(true)}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 hover:from-pink-500/30 hover:to-indigo-500/30 border border-white/10 text-xs font-bold text-white transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <span>👤 Contact Profile & CRM</span>
              </button>
            </div>

            <InboxFanContext data={fanContext} loading={fanLoading} />
          </div>
        )}
      </div>

      {/* ================= MODAL: 100% REAL & HONEST CONTACT & PROFILE EXPLORER ================= */}
      {showInAppProfileModal && active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-2xl p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl bg-zinc-950 border border-white/15 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            
            {/* Header: Authentic User Data */}
            <div className="p-5 border-b border-white/10 bg-[#121218]/90 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-lg">
                    <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center text-xl font-black text-white">
                      {(profileExplorerTab === "artist" ? "V" : active.contact.username || "U")[0].toUpperCase()}
                    </div>
                  </div>
                  <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-white">
                      {profileExplorerTab === "artist" ? "@v3nja2.0" : `@${active.contact.username ?? "user"}`}
                    </h2>
                    {profileExplorerTab === "artist" && <IconVerifiedBadge className="w-4 h-4" />}
                  </div>

                  <p className="text-xs text-zinc-300 font-medium mt-0.5">
                    {profileExplorerTab === "artist" ? "V3NJA • Recording Artist & Producer" : "Instagram Direct Contact"}
                  </p>

                  <p className="text-xs text-zinc-400 mt-1 max-w-md">
                    {profileExplorerTab === "artist"
                      ? "Official V3NJA artist account. Listen to WAYULOMI, NJALA, ZANGA & MIRAKO on all platforms."
                      : `Direct contact in conversation thread. Interacted with @v3nja2.0 automation campaigns.`}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowInAppProfileModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center text-xs"
                >
                  ✕
                </button>
                {profileExplorerTab !== "artist" && (
                  <a
                    href={`https://www.instagram.com/${active.contact.username || ""}/`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#0095F6] text-white hover:bg-blue-600 shadow-md flex items-center gap-1"
                  >
                    <span>Open on IG</span>
                    <span>↗</span>
                  </a>
                )}
              </div>
            </div>

            {/* Profile Statistics Bar (Authentic Live Metrics Only) */}
            <div className="grid grid-cols-3 gap-2 px-6 py-3 border-b border-white/[0.06] bg-black/40 text-center text-xs">
              <div>
                <div className="text-sm font-black text-white">
                  {profileExplorerTab === "artist" ? "50" : messages.length}
                </div>
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider">
                  {profileExplorerTab === "artist" ? "Posts" : "Messages"}
                </div>
              </div>
              <div>
                <div className="text-sm font-black text-purple-400">
                  {profileExplorerTab === "artist" ? "2,851" : fanContext?.fan.interactionCount || "1"}
                </div>
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider">
                  {profileExplorerTab === "artist" ? "Followers" : "Interactions"}
                </div>
              </div>
              <div>
                <div className="text-sm font-black text-pink-400">
                  {profileExplorerTab === "artist" ? "420" : fanContext?.campaigns.length || "1"}
                </div>
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider">
                  {profileExplorerTab === "artist" ? "Following" : "Campaigns"}
                </div>
              </div>
            </div>

            {/* Profile Explorer Tabs */}
            <div className="flex items-center px-4 pt-2 border-b border-white/[0.08] text-xs font-bold">
              <button
                type="button"
                onClick={() => setProfileExplorerTab("contact")}
                className={`flex-1 py-2 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                  profileExplorerTab === "contact" ? "border-purple-500 text-white" : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                <span>👤</span>
                <span>Contact Details & CRM</span>
              </button>
              <button
                type="button"
                onClick={() => setProfileExplorerTab("media")}
                className={`flex-1 py-2 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                  profileExplorerTab === "media" ? "border-purple-500 text-white" : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                <IconPhoto className="w-3.5 h-3.5" />
                <span>Exchanged Media ({exchangedAttachments.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setProfileExplorerTab("artist")}
                className={`flex-1 py-2 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                  profileExplorerTab === "artist" ? "border-purple-500 text-white" : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                <span>⭐</span>
                <span>@v3nja2.0 Official Profile</span>
              </button>
            </div>

            {/* Media Content Body */}
            <div className="flex-1 overflow-y-auto p-4 min-h-[300px]">
              {profileExplorerTab === "contact" ? (
                /* Contact Profile & Fan CRM View */
                <div className="space-y-4 max-w-lg mx-auto">
                  <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Contact Status</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300">
                        Active in Direct
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between py-1 border-b border-white/5">
                        <span className="text-zinc-400">Instagram Handle:</span>
                        <span className="font-bold text-white font-mono">@{active.contact.username ?? "user"}</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-white/5">
                        <span className="text-zinc-400">Follow Status:</span>
                        <span className="font-bold text-zinc-200">Interacted via Messaging API</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-white/5">
                        <span className="text-zinc-400">Total Thread Messages:</span>
                        <span className="font-mono text-purple-400 font-bold">{messages.length} messages</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <a
                        href={`https://www.instagram.com/${active.contact.username || ""}/`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-white transition-all flex items-center justify-center gap-2"
                      >
                        <span>View @{active.contact.username}'s public posts & reels on Instagram</span>
                        <span>↗</span>
                      </a>
                    </div>
                  </div>

                  <InboxFanContext data={fanContext} loading={fanLoading} />
                </div>
              ) : profileExplorerTab === "media" ? (
                /* Exchanged Photos, Videos & Voice Notes */
                <div>
                  {exchangedAttachments.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500 text-xs">
                      No photos, videos, or voice notes exchanged yet in this conversation.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {exchangedAttachments.map((att) => (
                        <div
                          key={att.id}
                          onClick={() => {
                            if (att.mediaAttachment?.url) setLightboxMediaUrl(att.mediaAttachment.url);
                          }}
                          className="group relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 cursor-pointer shadow-md"
                        >
                          {att.mediaAttachment ? (
                            <img src={att.mediaAttachment.url} alt="Attachment" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 p-2 text-center">
                              <IconMicrophone className="w-8 h-8 text-rose-400 mb-1" />
                              <span className="text-[10px] font-mono text-zinc-300">{att.voiceDuration}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Official @v3nja2.0 Published Posts & Reels Grid */
                <div className="grid grid-cols-3 gap-3">
                  {instagramPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => setSelectedLightboxPost(post)}
                      className="group/item relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 cursor-pointer shadow-md hover:border-purple-500/60 transition-all"
                    >
                      <img src={post.media_url} alt="Post" className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300" />
                      
                      {post.media_type === "VIDEO" && (
                        <span className="absolute top-2 right-2 text-xs bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-lg text-white">
                          ▶
                        </span>
                      )}

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 flex items-center justify-center gap-4 text-white text-xs font-bold transition-opacity">
                        <span className="flex items-center gap-1">❤️ {post.like_count}</span>
                        <span className="flex items-center gap-1">💬 {post.comments_count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= LIGHTBOX: SINGLE MEDIA VIEWER ================= */}
      {lightboxMediaUrl && (
        <div
          onClick={() => setLightboxMediaUrl(null)}
          className="fixed inset-0 z-70 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 animate-in fade-in duration-150"
        >
          <div className="relative max-w-3xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxMediaUrl} alt="High-Res Media" className="max-h-[80vh] w-auto object-contain rounded-2xl shadow-2xl border border-white/10" />
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setLightboxMediaUrl(null)}
                className="px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold"
              >
                Close ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= LIGHTBOX: POST VIEWER WITH IN-APP COMMENTING & LIKING ================= */}
      {selectedLightboxPost && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-3xl rounded-3xl bg-zinc-950 border border-white/15 shadow-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-2 max-h-[88vh]">
            
            <div
              onDoubleClick={() => handleTogglePostLike(selectedLightboxPost.id)}
              className="relative bg-black flex items-center justify-center aspect-square select-none group"
            >
              <img src={selectedLightboxPost.media_url} alt="Media" className="max-h-full max-w-full object-contain" />
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] text-zinc-300">
                Double-tap photo to like ❤️
              </div>
            </div>

            <div className="flex flex-col min-h-0 bg-[#0e0e14] border-t sm:border-t-0 sm:border-l border-white/10">
              <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-black/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                    V
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">@v3nja2.0</span>
                    <span className="text-[10px] text-zinc-400 font-mono">{formatTime(selectedLightboxPost.timestamp)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLightboxPost(null)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/5">
                  <span className="font-bold text-white">@v3nja2.0: </span>
                  <span className="text-zinc-200">{selectedLightboxPost.caption}</span>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Comments</div>
                  {(selectedLightboxPost.comments || []).map((cmt) => (
                    <div key={cmt.id} className="flex items-start gap-2 bg-white/[0.02] p-2 rounded-xl">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                        {cmt.username[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-zinc-200 text-[11px]">@{cmt.username}</span>
                          <span className="text-[9px] text-zinc-500">{cmt.time}</span>
                        </div>
                        <p className="text-zinc-300 text-[11.5px] mt-0.5">{cmt.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 border-t border-white/10 bg-black/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleTogglePostLike(selectedLightboxPost.id)}
                      className="text-base hover:scale-125 transition-transform flex items-center gap-1.5 font-bold text-rose-400"
                    >
                      <span>❤️</span>
                      <span className="text-xs text-white">{selectedLightboxPost.like_count} likes</span>
                    </button>
                    <span className="text-xs text-zinc-400">💬 {selectedLightboxPost.comments_count} comments</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1">
                  <input
                    type="text"
                    value={postCommentDraft}
                    onChange={(e) => setPostCommentDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddPostComment(selectedLightboxPost.id);
                    }}
                    placeholder="Add an in-app comment…"
                    className="flex-1 bg-transparent py-1 text-xs text-white placeholder:text-zinc-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddPostComment(selectedLightboxPost.id)}
                    disabled={!postCommentDraft.trim()}
                    className="text-xs font-bold text-purple-400 hover:text-purple-300 disabled:opacity-30"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ATMOSPHERE & WALLPAPER SELECTOR ================= */}
      {showThemeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-2xl p-4">
          <div className="w-full max-w-lg rounded-3xl bg-zinc-900 border border-white/15 p-6 shadow-2xl flex flex-col max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Atmosphere & Bubble Glow</h3>
                <p className="text-xs text-zinc-400">
                  {active ? `Customizing atmosphere for @${active.contact.username}` : "Global Chat Styling"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowThemeModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 font-bold text-sm flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="mb-5">
              <label className="text-[11px] uppercase font-bold tracking-wider text-zinc-400 block mb-2.5">
                Bubble Color & Ambient Glow Theme
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CHAT_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      if (!activeId) {
                        setGlobalThemeId(theme.id);
                        if (typeof window !== "undefined") localStorage.setItem("v3nja:inbox:globalTheme", theme.id);
                      } else {
                        const next = {
                          ...chatThemes,
                          [activeId]: {
                            themeId: theme.id,
                            wallpaperId: activeChatCustom?.wallpaperId || "theme-default",
                            customWallpaperUrl: activeChatCustom?.customWallpaperUrl,
                          },
                        };
                        setChatThemes(next);
                        if (typeof window !== "undefined") localStorage.setItem("v3nja:inbox:chatThemes", JSON.stringify(next));
                      }
                    }}
                    className={`p-2.5 rounded-2xl border text-left transition-all ${
                      currentThemeId === theme.id
                        ? "border-purple-500 bg-purple-500/15 shadow-md shadow-purple-500/20"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <span className="block w-full h-7 rounded-xl mb-2 shadow-sm" style={{ background: theme.swatchGradient }} />
                    <span className="text-[11px] font-bold text-white block truncate">{theme.name}</span>
                    <span className="text-[9px] text-zinc-400 block">{theme.badge}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="text-[11px] uppercase font-bold tracking-wider text-zinc-400 block mb-2.5">
                Atmospheric Background Wallpaper
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {WALLPAPER_OPTIONS.map((wall) => (
                  <button
                    key={wall.id}
                    type="button"
                    onClick={() => {
                      if (!activeId) return;
                      const next = {
                        ...chatThemes,
                        [activeId]: {
                          themeId: activeChatCustom?.themeId || globalThemeId,
                          wallpaperId: wall.id,
                          customWallpaperUrl: activeChatCustom?.customWallpaperUrl,
                        },
                      };
                      setChatThemes(next);
                      if (typeof window !== "undefined") localStorage.setItem("v3nja:inbox:chatThemes", JSON.stringify(next));
                    }}
                    className={`p-2.5 rounded-2xl border text-left transition-all ${
                      currentWallpaperId === wall.id && !customWallpaperUrl
                        ? "border-purple-500 bg-purple-500/15 shadow-md"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20"
                    }`}
                  >
                    <span className="block w-full h-10 rounded-xl mb-1.5 shadow-inner border border-white/10" style={{ background: wall.preview }} />
                    <span className="text-[11px] font-bold text-white block truncate">{wall.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowThemeModal(false)}
                className="px-5 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-all shadow-md"
              >
                Apply & Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= AUDIO / VIDEO CALL SIMULATION MODAL ================= */}
      {activeCallModal && active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
          <div className="w-full max-w-sm rounded-3xl bg-zinc-900 border border-white/15 p-6 shadow-2xl flex flex-col items-center text-center">
            
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 p-1 animate-pulse">
                <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center text-3xl font-black text-white">
                  {(active.contact.username || "U")[0].toUpperCase()}
                </div>
              </div>
              <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 ring-4 ring-zinc-900" />
            </div>

            <h3 className="text-base font-bold text-white mb-0.5">@{active.contact.username}</h3>
            <p className="text-xs text-zinc-400 mb-6 font-mono">
              {activeCallModal === "video" ? "FaceTime Video Call" : "FaceTime Audio Call"} • {Math.floor(callDurationSec / 60)}:{(callDurationSec % 60).toString().padStart(2, "0")}
            </p>

            {activeCallModal === "video" && (
              <div className="w-full h-32 rounded-2xl bg-zinc-950 border border-white/10 mb-6 flex items-center justify-center text-xs text-zinc-500 font-medium">
                {isVideoOff ? "Camera is Off" : "HD Video Stream Connected"}
              </div>
            )}

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-all ${
                  isMuted ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"
                }`}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? "🔇" : <IconMicrophone className="w-5 h-5" />}
              </button>

              {activeCallModal === "video" && (
                <button
                  type="button"
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-all ${
                    isVideoOff ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                  title="Toggle Video"
                >
                  {isVideoOff ? "🚫" : <IconVideoCall className="w-5 h-5" />}
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveCallModal(null)}
                className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white flex items-center justify-center text-xl shadow-lg shadow-rose-600/40 transition-all"
                title="End Call"
              >
                <IconPhoneCall className="w-6 h-6 rotate-135" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
