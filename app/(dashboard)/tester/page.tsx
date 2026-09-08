"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

export default function TesterPage() {
  const [username, setUsername] = useState("music_fan_265");
  const [commentText, setCommentText] = useState("WAYULOMI is fire! Send link 🔥");
  const [postTitle, setPostTitle] = useState("WAYULOMI Visuals & Music Video");
  const [triggerType, setTriggerType] = useState<"COMMENT" | "STORY_REPLY" | "STORY_MENTION">("COMMENT");
  const [isFollowing, setIsFollowing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activeKeywordLabel, setActiveKeywordLabel] = useState("🎶 WAYULOMI (Video)");

  const quickKeywords = [
    { label: "🎶 WAYULOMI (Video)", text: "WAYULOMI is fire! Send link 🔥", post: "WAYULOMI Visuals & Music Video" },
    { label: "🔥 NJALA (Single)", text: "Drop NJALA now bro 🔥", post: "V3NJA — NJALA Official Reel (Out Now)" },
    { label: "⚡ MIRAKO (Pre-Save)", text: "MIRAKO Pre-Save link please!", post: "MIRAKO Drops Soon" },
    { label: "💥 ZANGA (Reel)", text: "ZANGA ⚡⚡", post: "ZANGA Viral Reel Clip" },
    { label: "👕 MERCH (Store)", text: "Need the MERCH discount code!", post: "V3NJA Exclusive Merch Drop 2026" },
    { label: "👑 VIP (Inner Circle)", text: "JOIN the VIP squad", post: "V3NJA WRLD Fan Club Announcement" },
  ];

  const handleSimulate = useCallback(
    async (
      overrideComment?: string,
      overrideUser?: string,
      overrideFollowing?: boolean,
      overrideType?: "COMMENT" | "STORY_REPLY" | "STORY_MENTION"
    ) => {
      setLoading(true);

      const targetText = overrideComment || commentText;
      const targetUser = overrideUser || username;
      const targetFollowing = overrideFollowing !== undefined ? overrideFollowing : isFollowing;
      const targetType = overrideType || triggerType;

      try {
        const res = await fetch("/api/tester/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            commentText: targetText,
            commenterName: targetUser,
            mediaTitle: postTitle,
            triggerType: targetType,
            isFollowing: targetFollowing,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setResult(data);
          setIsUnlocked(false);
        } else {
          setResult({ success: false, error: data.error || "Simulation failed" });
        }
      } catch (err: any) {
        setResult({ success: false, error: err.message });
      } finally {
        setLoading(false);
      }
    },
    [commentText, username, isFollowing, triggerType, postTitle]
  );

  // Auto-run on first load so the live flow is always active immediately!
  useEffect(() => {
    void handleSimulate("WAYULOMI is fire! Send link 🔥", "music_fan_265", true, "COMMENT");
  }, []);

  function handleSelectQuick(item: { label: string; text: string; post: string }) {
    setActiveKeywordLabel(item.label);
    setCommentText(item.text);
    setPostTitle(item.post);
    void handleSimulate(item.text, username, isFollowing, triggerType);
  }

  function handleUnlockFollowGate() {
    setIsFollowing(true);
    setIsUnlocked(true);
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-2xl shadow-lg shadow-orange-500/20 shrink-0">
            🧪
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Live Automation &amp; Interactive DM Engine
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Simulate real-time comment triggers, anti-spam public replies, and interactive DM cards for{" "}
              <span className="text-orange-400 font-bold">@v3nja2.0</span>
            </p>
          </div>
        </div>

        <Link
          href="/logs"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white font-semibold text-xs transition-all self-start"
        >
          <span>View Live Activity Logs</span>
          <span>→</span>
        </Link>
      </div>

      {/* Grid: Simulator Controls & Live Instagram Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Input Form */}
        <div className="lg:col-span-7 space-y-5">
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <span>Inbound Trigger Configuration</span>
              </h2>
              <a
                href="https://www.instagram.com/v3nja2.0/"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-orange-400 font-bold bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full hover:bg-orange-500/20 transition-colors"
              >
                Target: @v3nja2.0 ↗
              </a>
            </div>

            {/* Quick Trigger Chips */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-2">
                Select Track / Preset (Instant Trigger):
              </label>
              <div className="flex flex-wrap gap-2">
                {quickKeywords.map((k) => {
                  const isSelected = activeKeywordLabel === k.label;
                  return (
                    <button
                      key={k.label}
                      type="button"
                      onClick={() => handleSelectQuick(k)}
                      className={`px-3 py-1.5 text-xs rounded-xl border transition-all font-semibold active:scale-95 ${
                        isSelected
                          ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-500 shadow-md shadow-orange-500/25 scale-[1.03]"
                          : "border-white/10 bg-white/[0.03] hover:border-orange-500/40 text-zinc-300 hover:text-white"
                      }`}
                    >
                      {k.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trigger Type Tabs */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setTriggerType("COMMENT");
                  void handleSimulate(commentText, username, isFollowing, "COMMENT");
                }}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                  triggerType === "COMMENT"
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-500 shadow-md shadow-orange-500/20 scale-[1.02]"
                    : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white"
                }`}
              >
                🎬 Reel Comment
              </button>
              <button
                type="button"
                onClick={() => {
                  setTriggerType("STORY_REPLY");
                  void handleSimulate(commentText, username, isFollowing, "STORY_REPLY");
                }}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                  triggerType === "STORY_REPLY"
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-500 shadow-md shadow-orange-500/20 scale-[1.02]"
                    : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white"
                }`}
              >
                📱 Story Reply
              </button>
              <button
                type="button"
                onClick={() => {
                  setTriggerType("STORY_MENTION");
                  void handleSimulate(commentText, username, isFollowing, "STORY_MENTION");
                }}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                  triggerType === "STORY_MENTION"
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-500 shadow-md shadow-orange-500/20 scale-[1.02]"
                    : "bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white"
                }`}
              >
                🏷️ Story Mention
              </button>
            </div>

            {/* Follower Gate Toggle */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>🔒</span>
                  <span>Follow-to-Unlock Gate Status</span>
                </div>
                <div className="text-[11px] text-zinc-400">Test follow gate lock/unlock response</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsFollowing(true);
                    void handleSimulate(commentText, username, true, triggerType);
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    isFollowing
                      ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                      : "bg-white/[0.05] text-zinc-400 hover:text-white border border-white/10"
                  }`}
                >
                  ✓ Follows @v3nja2.0
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsFollowing(false);
                    void handleSimulate(commentText, username, false, triggerType);
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    !isFollowing
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                      : "bg-white/[0.05] text-zinc-400 hover:text-white border border-white/10"
                  }`}
                >
                  ✕ Locked (Gate Active)
                </button>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSimulate();
              }}
              className="space-y-4 pt-1"
            >
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Fan Instagram Handle:
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-bold text-orange-400">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  {triggerType === "COMMENT"
                    ? "Inbound Comment Text:"
                    : triggerType === "STORY_REPLY"
                    ? "Story Reply Message:"
                    : "Story Mention Caption:"}
                </label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  required
                  rows={2}
                  placeholder="e.g. WAYULOMI is crazy! Send the link 🔥"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 resize-none"
                />
              </div>

              <button
                type="submit"
                onClick={() => void handleSimulate()}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 hover:opacity-95 text-white font-extrabold text-sm transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Executing Real-Time Automation...
                  </span>
                ) : (
                  <>
                    <span>⚡ Run Automation &amp; Generate Interactive DM</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Simulated Output */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-card rounded-2xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-zinc-400 flex items-center justify-between">
              <span>Instagram Live Output</span>
              {result?.matched && (
                <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  DM Sent to @{username}
                </span>
              )}
            </h3>

            {/* Inbound Comment Block */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
              <div className="text-[11px] text-zinc-400 font-medium flex items-center justify-between">
                <span>REEL: {postTitle}</span>
                <span className="text-[10px] text-zinc-500">Just now</span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <span className="font-bold text-white">@{username}</span>
                <span className="text-zinc-200">{commentText}</span>
              </div>

              {/* Anti-Spam Public Reply */}
              {result?.publicReply && triggerType === "COMMENT" && (
                <div className="ml-3 pl-3 border-l-2 border-orange-500 pt-1 text-xs space-y-0.5">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-orange-400">@v3nja2.0</span>
                    <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/15 px-1 rounded">
                      ANTI-SPAM ROTATED
                    </span>
                  </div>
                  <span className="text-zinc-300 font-medium">{result.publicReply}</span>
                </div>
              )}
            </div>

            {/* Interactive DM Card */}
            <div className="rounded-2xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border border-white/15 overflow-hidden shadow-2xl">
              {/* Card Header */}
              <div className="p-3 bg-white/[0.04] border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-bold text-[10px] text-white shadow-md">
                    V3
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-tight">V3NJA Official (@v3nja2.0)</div>
                    <div className="text-[10px] text-zinc-400">Direct Message · Verified Meta API</div>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="w-0.5 h-3 bg-orange-500 wave-animation-1 rounded-full" />
                  <span className="w-0.5 h-4 bg-amber-400 wave-animation-2 rounded-full" />
                  <span className="w-0.5 h-2.5 bg-orange-500 wave-animation-3 rounded-full" />
                </div>
              </div>

              {result?.matched ? (
                <div className="p-3.5 space-y-3">
                  {!isUnlocked && result.isFollowGatedPrompt ? (
                    <div className="space-y-2.5">
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 whitespace-pre-wrap leading-relaxed">
                        🔒 <strong>Follow-Gate Active:</strong>
                        <br />
                        {result.dmMessage}
                      </div>
                      <button
                        type="button"
                        onClick={handleUnlockFollowGate}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 font-bold text-xs text-black shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                      >
                        {result.linkButtonLabel}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {isUnlocked && (
                        <div className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                          ✓ Follow verified on @v3nja2.0! Smart link unlocked:
                        </div>
                      )}

                      <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed">
                        {isUnlocked ? result.fullDmMessageUnlocked : result.dmMessage}
                      </div>

                      <a
                        href="https://v3njamusic.web.app/wayulomi"
                        target="_blank"
                        rel="noreferrer"
                        className="block text-center w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 font-bold text-xs text-white hover:opacity-95 shadow-lg shadow-orange-500/25 active:scale-95 transition-all"
                      >
                        🎧 {isUnlocked ? result.fullLinkButtonLabelUnlocked : result.linkButtonLabel}
                      </a>
                    </div>
                  )}

                  <div className="text-[10px] text-zinc-400 flex items-center justify-between pt-1 border-t border-white/[0.06]">
                    <span>Campaign: <strong className="text-white">{result.campaign.name}</strong></span>
                    <span>Matched: <strong className="text-orange-400">{result.campaign.matchedKeyword}</strong></span>
                  </div>
                </div>
              ) : result && !result.matched ? (
                <div className="p-4 text-xs text-zinc-400 text-center">
                  ⚠️ No campaign keyword matched &ldquo;{commentText}&rdquo;.
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-zinc-500">
                  Loading automation flow...
                </div>
              )}
            </div>

            {result?.logId && (
              <div className="text-xs text-zinc-400 flex items-center justify-between px-1">
                <span>Log ID: <code className="text-orange-400">{result.logId}</code></span>
                <Link href="/logs" className="text-orange-400 hover:underline font-bold">
                  View in Logs →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
