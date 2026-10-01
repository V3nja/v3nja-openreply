"use client";

/**
 * Authentic iOS & Instagram Direct Messaging Suite (V3NJA WRLD)
 *
 * Full iOS Liquid Glass & Instagram Direct design system:
 * - Per-Chat dynamic Theme & Custom Wallpaper Engine (stored per conversation)
 * - Custom Wallpaper photo upload & preset atmospheric backgrounds
 * - iOS Liquid Glass Long-Press & Context Action Popover (exact match to iOS 19 / iMessage)
 * - Single-line tight-fitting pill bubbles for short messages (zero unwanted wrapping)
 * - Double-tap / double-click to Heart with bursting heart animation
 * - Instagram Direct Stories & Notes top bar
 * - Rich Smart Link preview cards for v3nja-official.web.app links
 * - Audio Voice Note player & waveform recorder simulation
 * - Saved quick replies (Canned Responses) drawer
 * - Interactive Audio & Video Calling simulation modal
 * - Live Meta Graph API direct dispatch with instant receipts
 * - Integrated Fan Context CRM
 */

import { useCallback, useEffect, useRef, useState } from "react";
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

// Authentic Instagram & iOS Themes
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
    id: "emerald-mint",
    name: "Emerald Mint",
    badge: "Fresh Mint",
    bubbleClass: "bg-gradient-to-r from-[#0BA360] via-[#10B981] to-[#3CBA92] text-white shadow-lg shadow-emerald-500/25",
    glowColor: "rgba(16, 185, 129, 0.4)",
    accentColor: "#10B981",
    swatchGradient: "linear-gradient(135deg, #0BA360 0%, #3CBA92 100%)",
    wallpaperBg: "radial-gradient(circle at 50% 15%, rgba(16, 185, 129, 0.14) 0%, transparent 60%), #050806",
    textSelection: "selection:bg-emerald-500 selection:text-white",
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
  {
    id: "berry-lavender",
    name: "Berry Lavender",
    badge: "Fuchsia",
    bubbleClass: "bg-gradient-to-r from-[#8A2387] via-[#E94057] to-[#F27121] text-white shadow-lg shadow-pink-500/25",
    glowColor: "rgba(233, 64, 87, 0.4)",
    accentColor: "#E94057",
    swatchGradient: "linear-gradient(135deg, #8A2387 0%, #F27121 100%)",
    wallpaperBg: "radial-gradient(circle at 30% 20%, rgba(138, 35, 135, 0.15) 0%, transparent 55%), radial-gradient(circle at 70% 80%, rgba(242, 113, 33, 0.12) 0%, transparent 50%), #080406",
    textSelection: "selection:bg-fuchsia-600 selection:text-white",
  },
];

// Atmospheric Wallpapers
export interface WallpaperOption {
  id: string;
  name: string;
  preview: string;
  css: string;
}

export const WALLPAPER_OPTIONS: WallpaperOption[] = [
  {
    id: "theme-default",
    name: "Theme Atmosphere",
    preview: "linear-gradient(135deg, #1c1c24, #000000)",
    css: "default",
  },
  {
    id: "deep-space",
    name: "Deep Space Aurora",
    preview: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
    css: "radial-gradient(circle at 50% 0%, rgba(120, 119, 198, 0.25) 0%, transparent 60%), radial-gradient(circle at 100% 100%, rgba(76, 29, 149, 0.2) 0%, transparent 50%), #090714",
  },
  {
    id: "cyber-matrix",
    name: "Cyber Neon Glow",
    preview: "linear-gradient(135deg, #000428, #004e92)",
    css: "radial-gradient(circle at 50% 10%, rgba(0, 242, 254, 0.18) 0%, transparent 55%), radial-gradient(circle at 10% 90%, rgba(79, 172, 254, 0.15) 0%, transparent 50%), #020713",
  },
  {
    id: "twilight-mesh",
    name: "Twilight Mesh",
    preview: "linear-gradient(135deg, #2b1055, #7597de)",
    css: "radial-gradient(circle at 70% 20%, rgba(236, 72, 153, 0.18) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.18) 0%, transparent 50%), #06050b",
  },
  {
    id: "noir-carbon",
    name: "Pure Apple Dark",
    preview: "#000000",
    css: "#000000",
  },
];

// Curated Instagram & iOS Popover Reactions (exact match to image-1.png)
const REACTION_EMOJIS = ["❤️", "👍", "👎", "😂", "‼️", "❓", "🔥", "🎵"];
const QUICK_EMOJIS = ["❤️", "🔥", "😂", "👏", "😮", "🎵", "🙏🏾", "🚀", "✨", "💯", "🎧", "💿", "🎤", "👀", "⚡", "👑"];

// Instagram Saved Responses (Canned Quick Replies)
const SAVED_REPLIES = [
  {
    label: "🎵 Wayulomi Smart Link",
    text: "Stream my latest official single WAYULOMI here: https://v3nja-official.web.app/wayulomi 🔥",
  },
  {
    label: "👕 Official Merch Store",
    text: "Check out the official V3NJA merch drops at: https://v3nja-official.web.app/merch 🚀",
  },
  {
    label: "🔥 Fan Love / Thanks",
    text: "Appreciate the massive love and support! More music dropping soon 🙏🏾✨",
  },
  {
    label: "🎧 Njala Track Link",
    text: "Listen to NJALA on all streaming platforms: https://v3nja-official.web.app/njala 🎧",
  },
  {
    label: "⚡ Booking / Inquiries",
    text: "For features, management, and bookings, reach out directly or check: https://v3nja-official.web.app ⚡",
  },
];

// Instagram Story / Note mockup items
const STORY_NOTES = [
  { id: "self", username: "Your note", note: "Dropping heat soon 🔥", isSelf: true },
  { id: "v3nja", username: "v3nja2.0", note: "WAYULOMI Live 🎵", hasUnseen: true },
  { id: "fan1", username: "urban_dj", note: "On repeat 🎧", hasUnseen: true },
  { id: "fan2", username: "music_plug", note: "Fire beat 💥", hasUnseen: false },
  { id: "fan3", username: "blantyre_vibes", note: "V3NJA WRLD 🚀", hasUnseen: true },
];

interface ExtendedMessage extends ThreadMessage {
  replyTo?: { text: string; username?: string | null };
  reactions?: string[];
  isVoice?: boolean;
  voiceDuration?: string;
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

// Helper to detect smart link URLs in messages
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

// Helper to parse legacy quoted replies formatted inside raw message strings
function parseMessageContent(rawText: string) {
  const match = rawText.match(/^💬 Replying to:\s*"(.*?)"\n\n([\s\S]*)$/);
  if (match) {
    return {
      quotedText: match[1],
      actualText: match[2],
    };
  }
  return {
    quotedText: null,
    actualText: rawText,
  };
}

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
  const [searchQuery, setSearchQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ id: string; text: string; username?: string | null } | null>(null);

  // Per-Chat Theme & Wallpaper State
  const [chatThemes, setChatThemes] = useState<Record<string, { themeId: string; wallpaperId: string; customWallpaperUrl?: string }>>({});
  const [globalThemeId, setGlobalThemeId] = useState<string>("instagram-twilight");
  const [showThemeModal, setShowThemeModal] = useState(false);

  // iOS Long-Press / Context Menu Popover (Exact match to image-1.png)
  const [activeContextMenuMessageId, setActiveContextMenuMessageId] = useState<string | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Drawers & Modals
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSavedReplies, setShowSavedReplies] = useState(false);
  const [showInfoSidebar, setShowInfoSidebar] = useState(true);
  const [activeCallModal, setActiveCallModal] = useState<"audio" | "video" | null>(null);
  const [callDurationSec, setCallDurationSec] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // iOS Settings Toggles (image-2.png / image-3.png)
  const [sendReadReceipts, setSendReadReceipts] = useState(true);
  const [showSmartPreviews, setShowSmartPreviews] = useState(true);
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [mutedNotifications, setMutedNotifications] = useState(false);

  // Micro-interactions
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [heartAnimId, setHeartAnimId] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordTimerSec, setRecordTimerSec] = useState(0);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function handleSetChatTheme(themeId: string) {
    if (!activeId) {
      setGlobalThemeId(themeId);
      if (typeof window !== "undefined") localStorage.setItem("v3nja:inbox:globalTheme", themeId);
      return;
    }
    const next = {
      ...chatThemes,
      [activeId]: {
        themeId,
        wallpaperId: activeChatCustom?.wallpaperId || "theme-default",
        customWallpaperUrl: activeChatCustom?.customWallpaperUrl,
      },
    };
    setChatThemes(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("v3nja:inbox:chatThemes", JSON.stringify(next));
    }
  }

  function handleSetChatWallpaper(wallpaperId: string, customUrl?: string) {
    if (!activeId) return;
    const next = {
      ...chatThemes,
      [activeId]: {
        themeId: activeChatCustom?.themeId || globalThemeId,
        wallpaperId,
        customWallpaperUrl: customUrl !== undefined ? customUrl : activeChatCustom?.customWallpaperUrl,
      },
    };
    setChatThemes(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("v3nja:inbox:chatThemes", JSON.stringify(next));
    }
  }

  function handleWallpaperFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !activeId) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        handleSetChatWallpaper("custom", reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  // Voice note recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecordingVoice) {
      setRecordTimerSec(0);
      interval = setInterval(() => setRecordTimerSec((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  // Call simulation timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeCallModal) {
      setCallDurationSec(0);
      interval = setInterval(() => setCallDurationSec((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [activeCallModal]);

  // Initial Instagram Accounts Fetch
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
    setShowEmojiPicker(false);
    setShowSavedReplies(false);
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

    // Clean, natural message text sent directly to Meta API (no artificial prefix pollution)
    const messagePayload = text;

    const optimistic: ExtendedMessage = {
      id: `optimistic-${Date.now()}`,
      text: messagePayload,
      fromMe: true,
      fromUsername: null,
      createdTime: new Date().toISOString(),
      replyTo: replyingTo ? { text: replyingTo.text, username: replyingTo.username } : undefined,
    };

    setMessages((prev) => [...prev, optimistic]);
    if (!customText) setDraft("");
    setReplyingTo(null);
    setShowEmojiPicker(false);
    setShowSavedReplies(false);

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

  function handleFinishVoiceRecord() {
    setIsRecordingVoice(false);
    const durationStr = `0:${recordTimerSec < 10 ? `0${recordTimerSec}` : recordTimerSec}`;
    const optimistic: ExtendedMessage = {
      id: `optimistic-voice-${Date.now()}`,
      text: "🎤 Voice Message",
      fromMe: true,
      fromUsername: null,
      createdTime: new Date().toISOString(),
      isVoice: true,
      voiceDuration: durationStr === "0:00" ? "0:04" : durationStr,
    };
    setMessages((prev) => [...prev, optimistic]);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  function insertEmoji(emoji: string) {
    setDraft((prev) => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
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

  // Touch Long-Press handlers for mobile
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

  return (
    <div className={`space-y-3 font-[-apple-system,BlinkMacSystemFont,"SF_Pro_Text","SF_Pro_Display",system-ui,-apple-system,"Segoe_UI",Roboto,Helvetica,Arial,sans-serif] ${activeTheme.textSelection}`}>
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <span className="text-xl">💬</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Instagram Direct</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 border border-white/15 text-white/90 backdrop-blur-md">
                iOS 19 Liquid Glass
              </span>
            </h1>
            <p className="text-xs text-zinc-400">Direct Meta sync, per-chat wallpapers, Apple glass popovers & fan CRM</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme & Wallpaper Button */}
          <button
            type="button"
            onClick={() => setShowThemeModal(true)}
            className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-zinc-200 hover:text-white transition-all flex items-center gap-2 shadow-sm"
          >
            <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ background: activeTheme.swatchGradient }} />
            <span className="hidden sm:inline font-bold">{activeTheme.name}</span>
            <span className="text-[10px] text-zinc-400">🎨 Wallpaper</span>
          </button>

          {accounts.length > 1 && (
            <AccountSelect accounts={accounts} value={selectedAccountId} onChange={setSelectedAccountId} includeAll={false} />
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="grid h-[calc(100dvh-11.5rem)] grid-cols-1 overflow-hidden rounded-3xl border border-white/[0.08] bg-[#000000] shadow-2xl backdrop-blur-2xl sm:grid-cols-[290px_1fr] lg:grid-cols-[290px_1fr_310px]">
        {/* ================= COLUMN 1: CONVERSATIONS LIST & NOTES ================= */}
        <div className={`min-h-0 flex-col border-b border-white/[0.08] sm:flex sm:border-b-0 sm:border-r border-zinc-800 bg-[#0f0f13] ${active ? "hidden sm:flex" : "flex"}`}>
          
          {/* Instagram Story & Profile Notes Bar */}
          <div className="px-3 pt-3 pb-2 border-b border-white/[0.06] bg-[#14141a]/90">
            <div className="flex items-center gap-3 overflow-x-auto pb-1.5 no-scrollbar">
              {STORY_NOTES.map((story) => (
                <div key={story.id} className="flex flex-col items-center shrink-0 cursor-pointer group">
                  <div className="relative mb-1">
                    <div className={`w-12 h-12 rounded-full p-[2px] transition-transform group-hover:scale-105 ${
                      story.hasUnseen ? "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]" : "bg-zinc-700/60"
                    }`}>
                      <div className="w-full h-full rounded-full bg-zinc-900 border-2 border-black flex items-center justify-center text-xs font-black text-white">
                        {story.username[0].toUpperCase()}
                      </div>
                    </div>
                    {/* Story Note Floating Pill */}
                    {story.note && (
                      <div className="absolute -top-1.5 -right-1 px-1.5 py-0.5 rounded-full bg-zinc-800 border border-white/20 text-[8px] text-zinc-200 shadow-md max-w-[58px] truncate">
                        {story.note}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-400 max-w-[50px] truncate text-center">
                    {story.isSelf ? "Your note" : story.username}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="p-3 border-b border-white/[0.06] bg-[#0f0f13]">
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-zinc-500">🔍</span>
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

          {/* Conversation Rows */}
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
              filteredConversations.map((c) => (
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
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10 flex items-center justify-center text-xs font-black text-white shadow-md">
                        {(c.contact.username || "U")[0].toUpperCase()}
                      </div>
                      {c.unread && (
                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-blue-500 ring-2 ring-black" />
                      )}
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
              ))
            )}
          </div>
        </div>

        {/* ================= COLUMN 2: AUTHENTIC iOS & INSTAGRAM CHAT THREAD ================= */}
        <div className={`min-h-0 flex-col ${active ? "flex" : "hidden sm:flex"}`}>
          {!active ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center bg-[#07070a]">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500/20 via-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-3xl mb-4 shadow-2xl">
                💬
              </div>
              <h3 className="text-base font-bold text-white mb-1">Your Direct Messages</h3>
              <p className="text-xs text-zinc-400 max-w-sm">Select any conversation to chat live, customize wallpapers, react with liquid glass, or trigger voice notes.</p>
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
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setActiveId(null)} className="rounded-lg p-1.5 text-xs font-bold text-zinc-400 hover:text-white sm:hidden bg-white/[0.05]">
                    ←
                  </button>
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xs font-extrabold text-white shadow-md">
                      {(active.contact.username || "U")[0].toUpperCase()}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-black" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-bold text-white">@{active.contact.username ?? "unknown"}</span>
                      <span className="text-[11px] text-[#0095F6]">✓</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active now
                    </span>
                  </div>
                </div>

                {/* Header Action Shortcuts (Call, Video, Profile, Info) */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveCallModal("audio")}
                    className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/10 flex items-center justify-center text-xs transition-all"
                    title="Audio Call"
                  >
                    📞
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCallModal("video")}
                    className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/10 flex items-center justify-center text-xs transition-all"
                    title="Video Call"
                  >
                    📹
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowThemeModal(true)}
                    className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 border border-white/10 flex items-center justify-center text-xs transition-all"
                    title="Change Chat Theme & Wallpaper"
                  >
                    🎨
                  </button>
                  <a
                    href={`https://www.instagram.com/${active.contact.username || ""}/`}
                    target="_blank"
                    rel="noreferrer"
                    className="hidden sm:flex px-2.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/10 text-[11px] font-semibold transition-all items-center gap-1"
                  >
                    <span>Profile</span>
                    <span className="text-[10px]">↗</span>
                  </a>
                  <button
                    onClick={() => setShowInfoSidebar(!showInfoSidebar)}
                    className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 border border-white/10 flex items-center justify-center text-xs font-bold transition-all"
                    title="Toggle Fan Details & iOS Settings"
                  >
                    ℹ️
                  </button>
                </div>
              </div>

              {/* Messages Stream */}
              <div ref={scrollRef} className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-4 sm:p-5 relative">
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
                        {/* ================= iOS LIQUID GLASS POPOVER (EXACT MATCH TO IMAGE-1.png) ================= */}
                        {isMenuOpen && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
                            {/* Backdrop click to dismiss */}
                            <div className="absolute inset-0" onClick={() => setActiveContextMenuMessageId(null)} />

                            <div className="relative z-10 flex flex-col items-center max-w-sm w-full space-y-3">
                              {/* 1. Top Liquid Glass Reaction Pill */}
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

                              {/* 2. Highlighted Message Preview with Theme Glow */}
                              <div
                                style={{ boxShadow: `0 0 35px ${activeTheme.glowColor}` }}
                                className={`w-fit max-w-[85%] px-4 py-2.5 rounded-[22px] text-[14.5px] leading-relaxed ${
                                  m.fromMe ? activeTheme.bubbleClass : "bg-[#262626] text-white border border-white/10"
                                }`}
                              >
                                {parsed.actualText}
                              </div>

                              {/* 3. Bottom iOS Glass Context Action Sheet */}
                              <div className="w-56 rounded-2xl bg-[#1c1c24]/95 border border-white/15 shadow-2xl backdrop-blur-3xl overflow-hidden divide-y divide-white/10 animate-in slide-in-from-top-2 duration-150 text-xs font-semibold">
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

                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(`https://translate.google.com/?text=${encodeURIComponent(parsed.actualText)}`);
                                    setActiveContextMenuMessageId(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-zinc-200 hover:bg-white/10 flex items-center justify-between"
                                >
                                  <span>Translate</span>
                                  <span className="text-zinc-400">🌐</span>
                                </button>

                                {m.fromMe && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteMessage(m.id)}
                                    className="w-full px-4 py-2.5 text-left text-rose-400 hover:bg-rose-500/10 flex items-center justify-between font-bold"
                                  >
                                    <span>Undo Send / Delete</span>
                                    <span>🗑️</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Quoted Message Tag (if explicit replyTo) */}
                        {m.replyTo && (
                          <div className={`mb-1 px-2.5 py-1 rounded-xl text-[10px] max-w-[70%] border-l-2 bg-white/[0.04] text-zinc-400 ${
                            m.fromMe ? "border-purple-400 text-right" : "border-zinc-500 text-left"
                          }`}>
                            <span className="font-bold text-zinc-300 block">Replying to {m.replyTo.username ? `@${m.replyTo.username}` : "message"}:</span>
                            <span className="truncate block">{m.replyTo.text}</span>
                          </div>
                        )}

                        {/* Main Message Bubble (Tight fitting w-fit min-w-[48px] for single-line perfection) */}
                        <div className="relative flex flex-col w-fit max-w-[76%] sm:max-w-[65%] min-w-[48px]">
                          {/* Heart Explosion on Double Tap */}
                          {isHeartBursting && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-ping">
                              <span className="text-4xl">❤️</span>
                            </div>
                          )}

                          {/* Voice Note Audio Card */}
                          {m.isVoice ? (
                            <div
                              className={`w-fit rounded-[20px] px-3.5 py-2.5 flex items-center gap-3 shadow-md ${
                                m.fromMe ? activeTheme.bubbleClass : "bg-[#262626]/90 text-white border border-white/[0.08]"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => setPlayingVoiceId(playingVoiceId === m.id ? null : m.id)}
                                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-sm shrink-0 transition-all"
                              >
                                {playingVoiceId === m.id ? "⏸" : "▶"}
                              </button>
                              <div className="flex items-center gap-0.5 h-6">
                                {[40, 70, 90, 30, 80, 100, 60, 40, 85, 50, 95, 30, 70, 45].map((h, i) => (
                                  <div
                                    key={i}
                                    style={{ height: `${h}%` }}
                                    className={`w-[2.5px] rounded-full transition-all ${
                                      playingVoiceId === m.id ? "bg-white animate-pulse" : "bg-white/60"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-[11px] font-mono font-medium ml-1 shrink-0 opacity-90">
                                {m.voiceDuration || "0:14"}
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
                              {/* Parsed embedded quote header if present */}
                              {parsed.quotedText && (
                                <div className="mb-1.5 pb-1 border-b border-white/20 text-[10.5px] opacity-80 flex items-center gap-1">
                                  <span>💬 Replying to:</span>
                                  <span className="truncate italic">"{parsed.quotedText}"</span>
                                </div>
                              )}
                              <span className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] inline-block">{parsed.actualText}</span>
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

                        {/* Micro Delivery Time / Seen Receipt under last message */}
                        {(!isConsecutiveNext || idx === messages.length - 1) && (
                          <div className={`flex items-center gap-1 mt-1 text-[9.5px] px-1 text-zinc-500`}>
                            <span>{formatTime(m.createdTime)}</span>
                            {m.fromMe && sendReadReceipts && (
                              <span className="text-zinc-400 font-bold" title="Delivered to Instagram Direct">
                                • Delivered ✓✓
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

              {/* Saved Canned Replies Drawer */}
              {showSavedReplies && (
                <div className="px-3 py-2 bg-[#121218]/95 backdrop-blur-2xl border-t border-white/[0.08] space-y-1 max-h-44 overflow-y-auto z-10">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-1 mb-1">
                    ⚡ Instant Saved Replies (Canned Responses)
                  </div>
                  {SAVED_REPLIES.map((reply, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => void handleSend(reply.text)}
                      className="w-full text-left p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 transition-all text-xs flex items-center justify-between group"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="font-bold text-white text-[11px]">{reply.label}</div>
                        <div className="text-[10px] text-zinc-400 truncate">{reply.text}</div>
                      </div>
                      <span className="text-purple-400 font-bold text-xs shrink-0 group-hover:translate-x-0.5 transition-transform">
                        Send ↗
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Quick Emojis Drawer */}
              {showEmojiPicker && (
                <div className="px-4 py-2 bg-[#121218]/95 backdrop-blur-2xl border-t border-white/[0.08] flex items-center gap-2 overflow-x-auto no-scrollbar z-10">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 shrink-0">Quick Emojis:</span>
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => insertEmoji(emoji)}
                      className="text-base hover:scale-130 active:scale-95 transition-transform px-1 py-0.5"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Voice Recording Active Bar */}
              {isRecordingVoice && (
                <div className="px-4 py-2.5 bg-rose-950/80 border-t border-rose-500/30 flex items-center justify-between text-xs backdrop-blur-md z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                    <span className="font-bold text-rose-300">Recording Voice Note… (0:{recordTimerSec < 10 ? `0${recordTimerSec}` : recordTimerSec})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsRecordingVoice(false)}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleFinishVoiceRecord}
                      className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold"
                    >
                      Send 🎙️
                    </button>
                  </div>
                </div>
              )}

              {/* iOS Pill Composer */}
              <div className="shrink-0 p-3 bg-[#0a0a0f]/90 border-t border-zinc-800/80 backdrop-blur-2xl z-20">
                {sendError && <p className="mb-2 text-xs text-rose-400 px-2 font-medium">{sendError}</p>}

                <div className="flex items-center gap-1.5 bg-[#1c1c24]/90 border border-white/[0.08] rounded-full px-2 py-1 focus-within:border-purple-500/50 transition-all">
                  
                  {/* Saved Replies Action Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowSavedReplies(!showSavedReplies);
                      setShowEmojiPicker(false);
                    }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                      showSavedReplies ? "bg-purple-500/20 text-purple-400" : "text-zinc-400 hover:text-white"
                    }`}
                    title="Saved Canned Replies"
                  >
                    ⚡
                  </button>

                  {/* Emoji Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmojiPicker(!showEmojiPicker);
                      setShowSavedReplies(false);
                    }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                      showEmojiPicker ? "bg-purple-500/20 text-purple-400" : "text-zinc-400 hover:text-white"
                    }`}
                    title="Insert Emojis"
                  >
                    😊
                  </button>

                  {/* Voice Note Button */}
                  <button
                    type="button"
                    onClick={() => setIsRecordingVoice(true)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-zinc-400 hover:text-white transition-all"
                    title="Record Voice Note"
                  >
                    🎙️
                  </button>

                  {/* Expanding Textarea */}
                  <textarea
                    ref={textareaRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder="Message…"
                    className="max-h-24 min-h-[34px] flex-1 resize-none bg-transparent py-1.5 text-xs sm:text-[13.5px] text-white placeholder:text-zinc-500 focus:outline-none"
                  />

                  {/* Right Action: Quick Heart ❤️ when empty, Send ↑ when typing */}
                  {draft.trim() ? (
                    <button
                      type="button"
                      onClick={() => void handleSend()}
                      disabled={sending}
                      className="w-7 h-7 rounded-full text-white font-black hover:scale-105 active:scale-95 disabled:opacity-30 transition-all shadow-md flex items-center justify-center shrink-0 text-xs"
                      style={{ background: activeTheme.swatchGradient }}
                      title="Send message"
                    >
                      {sending ? "…" : "↑"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendQuickHeart}
                      className="w-7 h-7 rounded-full text-rose-500 hover:scale-120 active:scale-90 transition-transform flex items-center justify-center shrink-0 text-base"
                      title="Send instant Like ❤️"
                    >
                      ❤️
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= COLUMN 3: FAN CONTEXT CRM & iOS SETTINGS (image-2.png / image-3.png) ================= */}
        {active && showInfoSidebar && (
          <div className="hidden lg:flex min-h-0 flex-col border-l border-zinc-800 bg-[#0c0c12] overflow-y-auto">
            {/* iOS Conversation Settings Section */}
            <div className="p-4 border-b border-white/[0.08] space-y-3 bg-[#111117]/80">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                <span>Chat Preferences</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">iOS 19</span>
              </div>

              {/* iOS Toggle Cards (Matching image-2.png / image-3.png) */}
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
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        sendReadReceipts ? "translate-x-4.5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-1 px-1 border-t border-white/5">
                  <span className="text-zinc-200">Smart Link Cards</span>
                  <button
                    type="button"
                    onClick={() => setShowSmartPreviews(!showSmartPreviews)}
                    className={`w-9 h-5 rounded-full transition-colors relative ${
                      showSmartPreviews ? "bg-emerald-500" : "bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        showSmartPreviews ? "translate-x-4.5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-1 px-1 border-t border-white/5">
                  <span className="text-zinc-200">Auto-Translate</span>
                  <button
                    type="button"
                    onClick={() => setAutoTranslate(!autoTranslate)}
                    className={`w-9 h-5 rounded-full transition-colors relative ${
                      autoTranslate ? "bg-emerald-500" : "bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        autoTranslate ? "translate-x-4.5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-1 px-1 border-t border-white/5">
                  <span className="text-zinc-200">Mute Notifications</span>
                  <button
                    type="button"
                    onClick={() => setMutedNotifications(!mutedNotifications)}
                    className={`w-9 h-5 rounded-full transition-colors relative ${
                      mutedNotifications ? "bg-emerald-500" : "bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        mutedNotifications ? "translate-x-4.5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Wallpaper & Theme Quick Trigger */}
              <button
                type="button"
                onClick={() => setShowThemeModal(true)}
                className="w-full py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-zinc-200 transition-all flex items-center justify-center gap-2"
              >
                <span>🎨 Customize Chat Atmosphere</span>
              </button>
            </div>

            {/* Fan CRM Data */}
            <InboxFanContext data={fanContext} loading={fanLoading} />
          </div>
        )}
      </div>

      {/* ================= MODAL: THEME & CUSTOM WALLPAPER CUSTOMIZER ================= */}
      {showThemeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-2xl p-4">
          <div className="w-full max-w-lg rounded-3xl bg-zinc-900 border border-white/15 p-6 shadow-2xl flex flex-col max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Chat Themes & Wallpapers</h3>
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

            {/* 1. Theme Presets Grid */}
            <div className="mb-5">
              <label className="text-[11px] uppercase font-bold tracking-wider text-zinc-400 block mb-2.5">
                Bubble Color & Glow Theme
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CHAT_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => handleSetChatTheme(theme.id)}
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

            {/* 2. Wallpaper Presets Grid */}
            <div className="mb-5">
              <label className="text-[11px] uppercase font-bold tracking-wider text-zinc-400 block mb-2.5">
                Atmospheric Background Wallpaper
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {WALLPAPER_OPTIONS.map((wall) => (
                  <button
                    key={wall.id}
                    type="button"
                    onClick={() => handleSetChatWallpaper(wall.id)}
                    className={`p-2.5 rounded-2xl border text-left transition-all ${
                      currentWallpaperId === wall.id && !customWallpaperUrl
                        ? "border-purple-500 bg-purple-500/15 shadow-md"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <span className="block w-full h-10 rounded-xl mb-1.5 shadow-inner border border-white/10" style={{ background: wall.preview }} />
                    <span className="text-[11px] font-bold text-white block truncate">{wall.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Custom Photo / Image Wallpaper Upload */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-bold text-white block">Upload Custom Photo / Wallpaper</span>
                  <span className="text-[10px] text-zinc-400">Set any custom image as the background for this chat</span>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleWallpaperFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all shrink-0"
                >
                  Choose File 🖼️
                </button>
              </div>

              {customWallpaperUrl && (
                <div className="mt-3 flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/10">
                  <div className="flex items-center gap-2">
                    <img src={customWallpaperUrl} alt="Custom Wallpaper" className="w-8 h-8 rounded-lg object-cover border border-white/20" />
                    <span className="text-xs text-zinc-300 font-medium">Custom Wallpaper Active</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSetChatWallpaper("theme-default", "")}
                    className="text-xs text-rose-400 hover:text-rose-300 font-bold px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              )}
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
            
            {/* Caller Avatar */}
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 p-1 animate-pulse">
                <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center text-2xl font-black text-white">
                  {(active.contact.username || "U")[0].toUpperCase()}
                </div>
              </div>
              <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 ring-4 ring-zinc-900" />
            </div>

            <h3 className="text-base font-bold text-white mb-0.5">@{active.contact.username}</h3>
            <p className="text-xs text-zinc-400 mb-6 font-mono">
              {activeCallModal === "video" ? "Instagram Video Call" : "Instagram Audio Call"} • {Math.floor(callDurationSec / 60)}:{(callDurationSec % 60).toString().padStart(2, "0")}
            </p>

            {/* Video View Placeholder if in Video Mode */}
            {activeCallModal === "video" && (
              <div className="w-full h-32 rounded-2xl bg-zinc-950 border border-white/10 mb-6 flex items-center justify-center text-xs text-zinc-500 font-medium">
                {isVideoOff ? "Camera is Off" : "HD Video Stream Connected"}
              </div>
            )}

            {/* In-Call Controls */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-all ${
                  isMuted ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"
                }`}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? "🔇" : "🎙️"}
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
                  {isVideoOff ? "🚫" : "📹"}
                </button>
              )}

              {/* End Call Button */}
              <button
                type="button"
                onClick={() => setActiveCallModal(null)}
                className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white flex items-center justify-center text-xl shadow-lg shadow-rose-600/40 transition-all"
                title="End Call"
              >
                📞
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
