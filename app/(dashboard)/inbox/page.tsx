"use client";

/**
 * Next-Gen iOS-Style Instagram Direct Inbox
 *
 * Ultra-sleek messaging interface with real-time Meta Graph API sync,
 * emoji reactions, inline message replying/quoting, copy, unsend,
 * quick emoji picker, and persistent Fan CRM context.
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

const QUICK_EMOJIS = ["🔥", "🎧", "🎵", "❤️", "🙏🏾", "🚀", "😂", "✨", "💯", "👏", "💥", "💿", "🎤", "👑", "👀", "⚡"];
const REACTION_EMOJIS = ["❤️", "🔥", "😂", "👏", "😮", "🎵"];

interface ExtendedMessage extends ThreadMessage {
  replyTo?: { text: string; username?: string | null };
  reactions?: string[];
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showInfoSidebar, setShowInfoSidebar] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const active = conversations.find((c) => c.id === activeId) ?? null;

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
    const cached = readCache<ThreadMessage[]>(msgCacheKey(id), CACHE_MAX_AGE_MS);
    setMessages(cached.data ?? []);
    setThreadLoading(!cached.data);
  }

  async function handleSend() {
    const text = draft.trim();
    if (!text || !active?.contact.id || sending) return;
    setSending(true);
    setSendError(null);

    const messagePayload = replyingTo
      ? `💬 Replying to: "${replyingTo.text.slice(0, 40)}..."\n\n${text}`
      : text;

    const optimistic: ExtendedMessage = {
      id: `optimistic-${Date.now()}`,
      text: messagePayload,
      fromMe: true,
      fromUsername: null,
      createdTime: new Date().toISOString(),
      replyTo: replyingTo ? { text: replyingTo.text, username: replyingTo.username } : undefined,
    };

    setMessages((prev) => [...prev, optimistic]);
    setDraft("");
    setReplyingTo(null);
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
        window.setTimeout(() => void loadMessages(active.id, true), 800);
        void loadConversations(true);
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        setDraft(text);
        setSendError(data.error ?? "Failed to send message");
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setDraft(text);
      setSendError("Failed to deliver message via Meta API");
    } finally {
      setSending(false);
    }
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
  }

  function handleCopy(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  }

  function handleDeleteMessage(messageId: string) {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
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
    <div className="space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Instagram Direct Messages</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/15 border border-orange-500/30 text-orange-400">
              LIVE CRM
            </span>
          </h1>
          <p className="text-xs text-zinc-400">Manage 2-way fan conversations, clients, and automated campaign handoffs</p>
        </div>
        {accounts.length > 1 && (
          <AccountSelect accounts={accounts} value={selectedAccountId} onChange={setSelectedAccountId} includeAll={false} />
        )}
      </div>

      {/* Main Container */}
      <div className="grid h-[calc(100dvh-11.5rem)] grid-cols-1 overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0c0c12] shadow-2xl backdrop-blur-2xl sm:grid-cols-[290px_1fr] lg:grid-cols-[290px_1fr_310px]">
        {/* ================= COLUMN 1: CONVERSATIONS LIST ================= */}
        <div className={`min-h-0 flex-col border-b border-white/[0.08] sm:flex sm:border-b-0 sm:border-r bg-zinc-950/60 ${active ? "hidden sm:flex" : "flex"}`}>
          {/* Search Box */}
          <div className="p-3 border-b border-white/[0.06] bg-zinc-950/80">
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-zinc-500">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats or messages…"
                className="w-full bg-zinc-900/90 border border-white/[0.08] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-orange-500/50"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-2 text-xs text-zinc-400 hover:text-white">
                  ✕
                </button>
              )}
            </div>

            {/* Folder Tabs */}
            <div className="flex items-center gap-1 p-0.5 rounded-xl bg-zinc-900/80 border border-white/[0.06] text-[11px] font-semibold mt-2.5">
              {(["primary", "unread", "general", "requests"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-1 rounded-lg text-center capitalize transition-all ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {tab}
                  {tab === "unread" && unreadCount > 0 && (
                    <span className="ml-1 px-1 py-0.2 rounded-full text-[9px] bg-white text-orange-600 font-mono font-black">
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
                    c.id === activeId ? "bg-white/[0.08] border-l-4 border-orange-500" : "hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center text-xs font-black text-white shadow-inner">
                        {(c.contact.username || "U")[0].toUpperCase()}
                      </div>
                      {c.unread && (
                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-orange-500 ring-2 ring-zinc-950" />
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
                        <p className={`mt-0.5 truncate text-[11px] ${c.unread ? "text-zinc-200 font-semibold" : "text-zinc-400"}`}>
                          {c.lastMessage.fromMe ? <span className="text-orange-400 font-medium">You: </span> : ""}
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

        {/* ================= COLUMN 2: iOS-STYLE CHAT THREAD ================= */}
        <div className={`min-h-0 flex-col ${active ? "flex" : "hidden sm:flex"}`}>
          {!active ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center bg-radial from-orange-500/[0.02] to-transparent">
              <div className="w-16 h-16 rounded-3xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-2xl mb-3 shadow-inner">
                💬
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Your Direct Messages</h3>
              <p className="text-xs text-zinc-500 max-w-sm">Select any conversation on the left to read history, react, send links, and chat live.</p>
            </div>
          ) : (
            <div className="flex flex-1 flex-col min-h-0 bg-[#09090e]">
              {/* iOS Chat Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-white/[0.08] px-4 py-3 bg-zinc-950/80 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setActiveId(null)} className="rounded-lg p-1.5 text-xs font-bold text-zinc-400 hover:text-white sm:hidden bg-white/[0.05]">
                    ←
                  </button>
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-xs font-extrabold text-white shadow-lg">
                      {(active.contact.username || "U")[0].toUpperCase()}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">@{active.contact.username ?? "unknown"}</span>
                      <span className="text-[10px] text-blue-400">✓</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                      Active on Instagram
                    </span>
                  </div>
                </div>

                {/* Header Action Shortcuts */}
                <div className="flex items-center gap-2">
                  <a
                    href={`https://www.instagram.com/${active.contact.username || ""}/`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/10 text-[11px] font-semibold transition-all flex items-center gap-1"
                  >
                    <span>Profile</span>
                    <span className="text-[10px]">↗</span>
                  </a>

                  <button
                    onClick={() => setShowInfoSidebar(!showInfoSidebar)}
                    className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/10 flex items-center justify-center text-xs font-bold transition-all"
                    title="Toggle Fan Details"
                  >
                    ℹ️
                  </button>
                </div>
              </div>

              {/* Messages Stream */}
              <div ref={scrollRef} className="min-h-0 flex-1 space-y-3.5 overflow-y-auto p-4 sm:p-5 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:16px_16px]">
                {threadLoading && messages.length === 0 ? (
                  <div className="flex items-center justify-center h-40 text-xs text-zinc-500 animate-pulse">Loading message stream…</div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-40 text-xs text-zinc-500">No previous messages in this conversation.</div>
                ) : (
                  messages.map((m) => {
                    const isHovered = hoveredMessageId === m.id;
                    const isCopied = copiedId === m.id;

                    return (
                      <div
                        key={m.id}
                        onMouseEnter={() => setHoveredMessageId(m.id)}
                        onMouseLeave={() => setHoveredMessageId(null)}
                        className={`flex flex-col group ${m.fromMe ? "items-end" : "items-start"}`}
                      >
                        {/* iOS Hover Reaction / Action Bar */}
                        <div
                          className={`flex items-center gap-1 mb-1 px-2 py-0.5 rounded-full bg-zinc-900/90 border border-white/10 shadow-lg backdrop-blur transition-all ${
                            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none h-0 p-0 m-0 border-0 overflow-hidden"
                          }`}
                        >
                          {REACTION_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleReact(m.id, emoji)}
                              className="text-xs hover:scale-130 transition-transform px-0.5"
                            >
                              {emoji}
                            </button>
                          ))}
                          <div className="w-[1px] h-3 bg-white/10 mx-1" />
                          <button
                            type="button"
                            onClick={() => setReplyingTo({ id: m.id, text: m.text, username: m.fromUsername || active.contact.username })}
                            className="text-[10px] font-semibold text-zinc-300 hover:text-white px-1"
                          >
                            Reply
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(m.id, m.text)}
                            className="text-[10px] font-semibold text-zinc-300 hover:text-white px-1"
                          >
                            {isCopied ? "✓" : "Copy"}
                          </button>
                          {m.fromMe && (
                            <button
                              type="button"
                              onClick={() => handleDeleteMessage(m.id)}
                              className="text-[10px] font-semibold text-rose-400 hover:text-rose-300 px-1"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Quoted Message Preview if applicable */}
                        {m.replyTo && (
                          <div className={`mb-1 px-3 py-1 rounded-xl text-[10px] max-w-[70%] border-l-2 bg-white/[0.03] text-zinc-400 ${m.fromMe ? "border-orange-400 text-right" : "border-zinc-500"}`}>
                            <span className="font-bold text-zinc-300 block">Replying to {m.replyTo.username ? `@${m.replyTo.username}` : "message"}:</span>
                            <span className="truncate block">{m.replyTo.text}</span>
                          </div>
                        )}

                        {/* Main Message Bubble */}
                        <div className="relative group/bubble">
                          <div
                            className={`max-w-[82%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-md backdrop-blur transition-all ${
                              m.fromMe
                                ? "bg-gradient-to-br from-[#ff5500] via-[#ff7700] to-[#ee0979] text-white font-medium rounded-tr-xs"
                                : "bg-[#1c1c26]/90 border border-white/[0.08] text-zinc-100 rounded-tl-xs"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{m.text}</p>
                            
                            <div className="flex items-center justify-end gap-1 mt-1 text-[9px]">
                              <span className={m.fromMe ? "text-white/80" : "text-zinc-500"}>{formatTime(m.createdTime)}</span>
                              {m.fromMe && (
                                <span className="text-white font-bold" title="Delivered to Instagram">
                                  ✓✓
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Reaction Badges on Bubble */}
                          {m.reactions && m.reactions.length > 0 && (
                            <div className={`absolute -bottom-2 ${m.fromMe ? "right-2" : "left-2"} flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-zinc-900 border border-white/20 shadow-md text-[10px]`}>
                              {m.reactions.map((r, i) => (
                                <span key={i}>{r}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Replying Banner */}
              {replyingTo && (
                <div className="px-4 py-2 bg-zinc-900 border-t border-white/[0.08] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-orange-400 font-bold">↳ Replying to @{replyingTo.username ?? "user"}:</span>
                    <span className="truncate text-zinc-400">{replyingTo.text}</span>
                  </div>
                  <button onClick={() => setReplyingTo(null)} className="text-zinc-400 hover:text-white font-bold px-2">
                    ✕
                  </button>
                </div>
              )}

              {/* Quick Emojis Drawer */}
              {showEmojiPicker && (
                <div className="px-4 py-2.5 bg-zinc-900/90 border-t border-white/[0.08] flex items-center gap-2 overflow-x-auto">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 shrink-0">Quick Emojis:</span>
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => insertEmoji(emoji)}
                      className="text-base hover:scale-130 transition-transform px-1 py-0.5"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* iOS Pill Composer */}
              <div className="shrink-0 p-3 bg-zinc-950/90 border-t border-white/[0.08] backdrop-blur-xl">
                {sendError && <p className="mb-2 text-xs text-rose-400 px-2 font-medium">{sendError}</p>}

                <div className="flex items-center gap-2 bg-zinc-900/90 border border-white/[0.1] rounded-2xl pl-3 pr-1.5 py-1.5 focus-within:border-orange-500/60 focus-within:ring-1 focus-within:ring-orange-500/40 transition-all">
                  {/* Emoji Button */}
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all ${
                      showEmojiPicker ? "bg-orange-500/20 text-orange-400" : "text-zinc-400 hover:text-white"
                    }`}
                    title="Insert Emojis"
                  >
                    😊
                  </button>

                  <textarea
                    ref={textareaRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder="Message… (Enter to send)"
                    className="max-h-28 min-h-[36px] flex-1 resize-none bg-transparent py-1.5 text-xs sm:text-[13px] text-white placeholder:text-zinc-500 focus:outline-none"
                  />

                  {/* Send Button */}
                  <button
                    type="button"
                    onClick={() => void handleSend()}
                    disabled={sending || !draft.trim()}
                    className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-black hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all shadow-md flex items-center justify-center shrink-0 text-sm"
                    title="Send to Instagram"
                  >
                    {sending ? "…" : "↑"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= COLUMN 3: FAN CONTEXT CRM ================= */}
        {active && showInfoSidebar && (
          <div className="hidden lg:flex min-h-0 flex-col border-l border-white/[0.08] bg-zinc-950/70 overflow-y-auto">
            <InboxFanContext data={fanContext} loading={fanLoading} />
          </div>
        )}
      </div>
    </div>
  );
}
