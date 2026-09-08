"use client";

import { useState } from "react";

export default function TesterPage() {
  const [username, setUsername] = useState("music_fan_265");
  const [commentText, setCommentText] = useState("NJALA 🔥");
  const [postTitle, setPostTitle] = useState("V3NJA — NJALA Official Reel (Out Now)");
  const [triggerType, setTriggerType] = useState<"COMMENT" | "STORY_REPLY" | "STORY_MENTION">("COMMENT");
  const [isFollowing, setIsFollowing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const quickKeywords = [
    { label: "🔥 NJALA (Song)", text: "Drop NJALA now bro 🔥", post: "V3NJA — NJALA Official Reel (Out Now)" },
    { label: "🎶 WAYULOMI (Video)", text: "WAYULOMI is a hit! Send link ❤️", post: "WAYULOMI Visuals & Music Video" },
    { label: "⚡ ZANGA (Single)", text: "ZANGA ⚡⚡", post: "ZANGA Viral Reel Clip" },
    { label: "💥 MOTO (Snippet)", text: "MOTO 🔥🔥", post: "MOTO Single Release Reel" },
    { label: "👕 MERCH (Store)", text: "Need the MERCH discount code!", post: "V3NJA Exclusive Merch Drop 2026" },
    { label: "🌍 WRLD VIP (Pass)", text: "JOIN the VIP squad", post: "V3NJA WRLD Fan Club Announcement" },
  ];

  async function handleSimulate(overrideFollowing?: boolean) {
    setLoading(true);
    setResult(null);
    setIsUnlocked(false);

    const followingStatus = overrideFollowing !== undefined ? overrideFollowing : isFollowing;

    try {
      const res = await fetch("/api/tester/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentText,
          commenterName: username,
          mediaTitle: postTitle,
          triggerType,
          isFollowing: followingStatus,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  }

  function handleUnlockFollowGate() {
    setIsFollowing(true);
    setIsUnlocked(true);
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <span className="text-3xl">🧪</span>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              @v3nja2.0 Comment &amp; Story → DM Live Simulator
            </h1>
            <p className="text-sm text-muted">
              Test your V3NJA keyword triggers, Story reply automations, and Follow-to-Unlock gating in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Simulator Controls & Live Instagram Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form */}
        <div className="lg:col-span-7 space-y-5">
          <div className="panel rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">
                Inbound Instagram Trigger
              </h2>
              <a
                href="https://www.instagram.com/v3nja2.0/"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-orange-500 font-bold bg-orange-500/10 px-2 py-0.5 rounded hover:bg-orange-500/20"
              >
                Target: @v3nja2.0 ↗
              </a>
            </div>

            {/* Quick Trigger Chips */}
            <div>
              <label className="block text-xs font-medium text-muted mb-2">
                Quick Music &amp; Merch Triggers:
              </label>
              <div className="flex flex-wrap gap-2">
                {quickKeywords.map((k) => (
                  <button
                    key={k.label}
                    type="button"
                    onClick={() => {
                      setCommentText(k.text);
                      setPostTitle(k.post);
                    }}
                    className="px-2.5 py-1 text-xs rounded-lg border border-border bg-surface-hover hover:border-orange-500 hover:text-orange-500 transition-colors font-medium"
                  >
                    {k.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Trigger Type Tabs */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setTriggerType("COMMENT")}
                className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all ${
                  triggerType === "COMMENT"
                    ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                    : "bg-surface border-border text-muted hover:text-foreground"
                }`}
              >
                🎬 Reel Comment
              </button>
              <button
                type="button"
                onClick={() => setTriggerType("STORY_REPLY")}
                className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all ${
                  triggerType === "STORY_REPLY"
                    ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                    : "bg-surface border-border text-muted hover:text-foreground"
                }`}
              >
                📱 IG Story Reply
              </button>
              <button
                type="button"
                onClick={() => setTriggerType("STORY_MENTION")}
                className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all ${
                  triggerType === "STORY_MENTION"
                    ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                    : "bg-surface border-border text-muted hover:text-foreground"
                }`}
              >
                🏷️ Story Mention
              </button>
            </div>

            {/* Follower Gate Toggle */}
            <div className="p-3 rounded-lg bg-surface-hover/70 border border-border flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-foreground">Fan Follower Status</div>
                <div className="text-[11px] text-muted">Test Follow-to-Unlock Gate</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFollowing(true)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    isFollowing
                      ? "bg-emerald-500 text-white font-bold"
                      : "bg-surface text-muted hover:text-foreground border border-border"
                  }`}
                >
                  ✓ Follows @v3nja2.0
                </button>
                <button
                  type="button"
                  onClick={() => setIsFollowing(false)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    !isFollowing
                      ? "bg-amber-500 text-white font-bold"
                      : "bg-surface text-muted hover:text-foreground border border-border"
                  }`}
                >
                  ✕ Not Following (Gate)
                </button>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSimulate();
              }}
              className="space-y-4 pt-1"
            >
              {triggerType === "COMMENT" && (
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    Target Reel on @v3nja2.0:
                  </label>
                  <select
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-surface border border-border text-foreground focus:outline-none focus:border-orange-500"
                  >
                    <option>V3NJA — NJALA Official Reel (Out Now)</option>
                    <option>WAYULOMI Visuals &amp; Music Video</option>
                    <option>ZANGA Viral Reel Clip</option>
                    <option>MOTO Single Release Reel</option>
                    <option>V3NJA Exclusive Merch Drop 2026</option>
                    <option>V3NJA WRLD Fan Club Announcement</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-muted mb-1">
                  Fan Username:
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm text-muted">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full pl-8 pr-3 py-2 text-sm rounded-lg bg-surface border border-border text-foreground focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">
                  {triggerType === "COMMENT"
                    ? "Comment Text:"
                    : triggerType === "STORY_REPLY"
                    ? "Story Reply Message:"
                    : "Story Mention Caption:"}
                </label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  required
                  rows={2}
                  placeholder="e.g. NJALA is crazy! 🔥"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-surface border border-border text-foreground focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Processing Trigger...</span>
                ) : (
                  <>
                    <span>
                      ⚡ Trigger Automation &amp; Dispatch DM to @{username}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Mock Instagram Feed & DM Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="panel rounded-xl p-5 space-y-4 border-zinc-700/60 shadow-lg">
            <h3 className="text-xs uppercase font-bold tracking-wider text-muted flex items-center justify-between">
              <span>Instagram Live Output</span>
              {result?.matched && (
                <span className="text-emerald-500 font-semibold text-[11px] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  DM Sent to @{username}
                </span>
              )}
            </h3>

            {/* Simulated Post Comment Item */}
            <div className="p-3.5 rounded-lg bg-surface-hover/80 border border-border space-y-2">
              <div className="text-[11px] text-muted font-medium flex items-center justify-between">
                <span>
                  {triggerType === "COMMENT"
                    ? `REEL: ${postTitle.slice(0, 22)}...`
                    : triggerType === "STORY_REPLY"
                    ? "IG STORY REACTION"
                    : "IG STORY MENTION"}
                </span>
                <span>Just now</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="font-semibold text-foreground">@{username}</span>
                <span className="text-foreground">{commentText}</span>
              </div>

              {/* Public Reply (Only for Reel comments) */}
              {result?.publicReply && triggerType === "COMMENT" && (
                <div className="ml-4 pl-3 border-l-2 border-orange-500/80 pt-1 text-xs">
                  <span className="font-bold text-orange-500">@v3nja2.0 </span>
                  <span className="text-foreground font-medium">{result.publicReply}</span>
                </div>
              )}
            </div>

            {/* Simulated DM Message Bubble */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-white space-y-3">
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-bold text-[10px] text-white">
                  V3
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-tight">V3NJA Official (@v3nja2.0)</div>
                  <div className="text-[10px] text-zinc-400">Direct Message · Official Graph API</div>
                </div>
              </div>

              {result?.matched ? (
                <div className="space-y-3">
                  {/* Gate prompt or unlocked message */}
                  {!isUnlocked && result.isFollowGatedPrompt ? (
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 whitespace-pre-wrap leading-relaxed">
                        🔒 <strong>Follow-Gate Active:</strong>
                        <br />
                        {result.dmMessage}
                      </div>
                      <button
                        type="button"
                        onClick={handleUnlockFollowGate}
                        className="block text-center w-full py-2 px-3 rounded-lg bg-amber-500 font-semibold text-xs text-zinc-950 hover:bg-amber-400 transition-colors animate-bounce"
                      >
                        {result.linkButtonLabel}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {isUnlocked && (
                        <div className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                          ✓ Follow verified on @v3nja2.0! Smart link unlocked:
                        </div>
                      )}
                      <div className="p-3 rounded-lg bg-orange-600/20 border border-orange-500/30 text-xs text-orange-100 whitespace-pre-wrap leading-relaxed">
                        {isUnlocked ? result.fullDmMessageUnlocked : result.dmMessage}
                      </div>
                      <a
                        href="https://v3njamusic.web.app/njala"
                        target="_blank"
                        rel="noreferrer"
                        className="block text-center w-full py-2 px-3 rounded-lg bg-orange-500 font-semibold text-xs text-white hover:bg-orange-600 transition-colors"
                      >
                        🔗 {isUnlocked ? result.fullLinkButtonLabelUnlocked : result.linkButtonLabel}
                      </a>
                    </div>
                  )}

                  <div className="text-[10px] text-zinc-400 flex items-center justify-between pt-1">
                    <span>Campaign: <strong>{result.campaign.name}</strong></span>
                    <span>Keyword: <strong>{result.campaign.matchedKeyword}</strong></span>
                  </div>
                </div>
              ) : result && !result.matched ? (
                <div className="p-3 rounded-lg bg-zinc-800/80 text-xs text-zinc-400 text-center">
                  ⚠️ No campaign keyword matched &ldquo;{commentText}&rdquo;. Try commenting <strong>NJALA</strong>, <strong>WAYULOMI</strong>, or <strong>MERCH</strong>.
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-zinc-500">
                  Hit <strong>Trigger Automation &amp; Dispatch DM</strong> on the left to test the flow!
                </div>
              )}
            </div>

            {/* Database & Log confirmation */}
            {result?.logId && (
              <div className="text-xs text-muted flex items-center justify-between px-1">
                <span>PostgreSQL Log ID: <code className="text-foreground">{result.logId.slice(0, 10)}...</code></span>
                <a href="/logs" className="text-orange-500 hover:underline font-medium">
                  View in DM Logs →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
