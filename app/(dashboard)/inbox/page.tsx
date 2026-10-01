"use client";

/**
 * Inbox
 *
 * Instagram DM conversations for the selected account, with live message
 * history, a reply composer, and persistent Fan Engine context for the open
 * contact. Messages are read from Meta and refreshed by polling.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import AccountSelect, { type AccountOption } from "@/components/account-select";
import InboxFanContext, { type InboxFanContextData } from "@/components/inbox-fan-context";
import { readCache, writeCache } from "@/lib/client-cache";
import type { ConversationListItem } from "@/app/api/instagram/conversations/route";
import type { ThreadMessage } from "@/app/api/instagram/conversations/[id]/route";

const POLL_MS = 12_000;
const CACHE_MAX_AGE_MS = 60_000;
const convCacheKey = (accountId: string) => `inbox:convs:${accountId}`;
const msgCacheKey = (conversationId: string) => `inbox:msgs:${conversationId}`;

function formatTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
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
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [fanContext, setFanContext] = useState<InboxFanContextData | null>(null);
  const [fanLoading, setFanLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"primary" | "unread" | "general" | "requests" | "all">("primary");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [queuedRequestId, setQueuedRequestId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  const filteredConversations = conversations.filter((c) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return c.unread;
    if (activeTab === "primary") return c.folder === "primary" || !c.folder;
    if (activeTab === "general") return c.folder === "general";
    if (activeTab === "requests") return c.folder === "requests";
    return true;
  });

  const unreadCount = conversations.filter((c) => c.unread).length;

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
          setQueuedRequestId(null);
        }
      } catch {
        // Keep the currently visible thread on transient failures.
      } finally {
        if (!silent) setThreadLoading(false);
      }
    },
    [selectedAccountId]
  );

  useEffect(() => {
    if (!activeId) return;
    const cached = readCache<ThreadMessage[]>(msgCacheKey(activeId), CACHE_MAX_AGE_MS);
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    setQueuedRequestId(null);
    const cached = readCache<ThreadMessage[]>(msgCacheKey(id), CACHE_MAX_AGE_MS);
    setMessages(cached.data ?? []);
    setThreadLoading(!cached.data);
  }

  async function handleSend() {
    const text = draft.trim();
    if (!text || !active?.contact.id || sending) return;
    setSending(true);
    setSendError(null);

    const optimistic: ThreadMessage = {
      id: `optimistic-${Date.now()}`,
      text,
      fromMe: true,
      fromUsername: null,
      createdTime: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft("");

    try {
      const res = await fetch("/api/instagram/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instagramAccountId: selectedAccountId,
          recipientId: active.contact.id,
          text,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.queued) {
          setQueuedRequestId(data.data?.requestId ?? null);
          void loadConversations(true);
          window.setTimeout(() => void loadMessages(active.id, true), 1500);
        } else {
          await loadMessages(active.id, true);
          void loadConversations(true);
        }
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        setDraft(text);
        setSendError(data.error ?? "Failed to send message");
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setDraft(text);
      setSendError("Failed to send message");
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

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Instagram Direct Inbox</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Live Instagram direct message stream and fan relationship context</p>
        </div>
        {accounts.length > 1 && (
          <AccountSelect accounts={accounts} value={selectedAccountId} onChange={setSelectedAccountId} includeAll={false} />
        )}
      </div>

      <div className="grid h-[calc(100dvh-12rem)] grid-cols-1 overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d12] shadow-2xl sm:grid-cols-[280px_1fr] lg:grid-cols-[280px_1fr_290px]">
        {/* Column 1: Conversations list with Instagram Folder Tabs */}
        <div className={`min-h-0 flex-col border-b border-white/10 sm:flex sm:border-b-0 sm:border-r bg-zinc-950/50 ${active ? "hidden sm:flex" : "flex"}`}>
          <div className="shrink-0 border-b border-white/10 px-3.5 py-3 bg-zinc-950/80">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Direct Messages</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.08] text-zinc-300 font-mono font-semibold">
                {conversations.length}
              </span>
            </div>

            {/* Instagram Category Tabs */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-900 border border-white/[0.06] text-[11px] font-medium">
              <button
                type="button"
                onClick={() => setActiveTab("primary")}
                className={`flex-1 py-1 rounded-md text-center transition-all ${
                  activeTab === "primary"
                    ? "bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 font-bold border border-orange-500/30"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Primary
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("unread")}
                className={`flex-1 py-1 rounded-md text-center transition-all relative ${
                  activeTab === "unread"
                    ? "bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 font-bold border border-orange-500/30"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Unread
                {unreadCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-orange-500 text-white font-mono font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`flex-1 py-1 rounded-md text-center transition-all ${
                  activeTab === "general"
                    ? "bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 font-bold border border-orange-500/30"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                General
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("requests")}
                className={`flex-1 py-1 rounded-md text-center transition-all ${
                  activeTab === "requests"
                    ? "bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 font-bold border border-orange-500/30"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Requests
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto divide-y divide-white/[0.04]">
            {convLoading ? (
              <p className="px-4 py-6 text-xs text-zinc-500">Loading conversations…</p>
            ) : convError ? (
              <p className="px-4 py-6 text-xs text-rose-400">{convError}</p>
            ) : filteredConversations.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-zinc-500">
                No conversations in <span className="capitalize font-semibold text-zinc-400">{activeTab}</span>.
              </div>
            ) : (
              filteredConversations.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => openConversation(c.id)}
                  className={`block w-full px-4 py-3 text-left transition-all ${
                    c.id === activeId ? "bg-white/[0.08] border-l-2 border-orange-500" : "hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {c.unread && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"></span>}
                      <span className={`truncate text-xs font-bold ${c.unread ? "text-white" : "text-zinc-300"}`}>
                        @{c.contact.username ?? "unknown"}
                      </span>
                    </div>
                    <span className="shrink-0 text-[10px] text-zinc-500 font-mono">{formatTime(c.updatedTime)}</span>
                  </div>
                  {c.lastMessage && (
                    <p className={`mt-1 truncate text-xs ${c.unread ? "text-zinc-200 font-medium" : "text-zinc-400"}`}>
                      {c.lastMessage.fromMe ? <span className="text-orange-400/90 font-medium">You: </span> : ""}
                      {c.lastMessage.text || "(no text)"}
                    </p>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Chat Stream & Composer */}
        <div className={`min-h-0 flex-col ${active ? "flex" : "hidden sm:flex"}`}>
          {!active ? (
            <div className="flex flex-1 items-center justify-center p-6 text-xs text-zinc-500">
              Select a conversation to read message history and reply.
            </div>
          ) : (
            <div className="flex flex-1 flex-col min-h-0">
              {/* Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 bg-zinc-950/80 backdrop-blur">
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setActiveId(null)} className="rounded px-2 py-1 text-xs font-semibold text-zinc-400 hover:text-white sm:hidden">
                    ← Back
                  </button>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-xs font-extrabold text-white shadow-sm">
                    {(active.contact.username || "U")[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">@{active.contact.username ?? "unknown"}</span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span> Instagram Direct
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 bg-black/30">
                {threadLoading && messages.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-xs text-zinc-500">Loading conversation…</div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-xs text-zinc-500">No messages in this thread.</div>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                          m.fromMe
                            ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium"
                            : "bg-zinc-850 bg-zinc-900 border border-white/10 text-zinc-100"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.text}</p>
                        <p className={`mt-1 text-[9px] font-mono ${m.fromMe ? "text-white/80 text-right" : "text-zinc-500"}`}>
                          {formatTime(m.createdTime)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Reply Composer */}
              <div className="shrink-0 border-t border-white/10 p-3.5 bg-zinc-950/90">
                {queuedRequestId && (
                  <p className="mb-2 text-[11px] text-amber-400">Reply queued for delivery. The Inbox will refresh automatically.</p>
                )}
                {sendError && <p className="mb-2 text-[11px] text-rose-400">{sendError}</p>}
                <div className="flex items-end gap-2.5">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder="Write a reply… (Enter to send, Shift+Enter for a new line)"
                    className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:border-orange-500/60 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => void handleSend()}
                    disabled={sending || !draft.trim()}
                    className="h-[44px] px-5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-xs font-bold text-white hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 transition-all shadow-md shrink-0 flex items-center justify-center"
                  >
                    {sending ? "Sending…" : "Send"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Column 3: Fan Context Sidebar (Desktop Only) */}
        {active && (
          <div className="hidden lg:flex min-h-0 flex-col border-l border-white/10 bg-zinc-950/60 overflow-y-auto">
            <InboxFanContext data={fanContext} loading={fanLoading} />
          </div>
        )}
      </div>
    </div>
  );
}
