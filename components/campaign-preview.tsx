"use client";

/* eslint-disable @next/next/no-img-element */

/**
 * Campaign Preview — Next-Gen Luxury Titanium iPhone 16 Pro Mockup
 *
 * Simulates how a campaign appears on Instagram across Post, Comments, and DM screens
 * with fluid liquid glassmorphism, glowing micro-interactions, audio visualizers,
 * and interactive CTA button states.
 */

import { useState } from "react";

export type PreviewTab = "post" | "comments" | "dm" | "dmTrigger";

interface CampaignPreviewProps {
  tab: PreviewTab;
  onTabChange: (tab: PreviewTab) => void;
  username: string;
  avatarUrl: string | null;
  postThumb: string | null;
  caption: string;
  sampleComment: string;
  dmTriggerEnabled: boolean;
  publicReplyEnabled: boolean;
  publicReplyMessage: string;
  openingDmEnabled: boolean;
  openingDmMessage: string;
  openingDmButtonLabel: string;
  revealMessage: string;
  hasLink: boolean;
  linkButtonLabel: string;
  linkUrl?: string;
  hasSecondLink: boolean;
  secondLinkButtonLabel: string;
  requireFollow: boolean;
  followPromptMessage: string;
  followPromptButtonLabel: string;
  followUpEnabled: boolean;
  followUpMessage: string;
  followUpDelayMinutes?: number;
}

const SAMPLE_USER = "music_fan_265";

const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const Ico = {
  back: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...S}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  ),
  heart: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...S}>
      <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 10-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 000-7.8z" />
    </svg>
  ),
  comment: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...S}>
      <path d="M21 11.5a8.4 8.4 0 01-9 8.4 9.9 9.9 0 01-4-.8L3 21l1.9-4.5A8.4 8.4 0 013 11.5 8.4 8.4 0 0112 3a8.4 8.4 0 019 8.5z" />
    </svg>
  ),
  share: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...S}>
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  ),
  bookmark: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...S}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
  ),
  home: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...S}>
      <path d="M3 10l9-7 9 7v9a2 2 0 01-2 2h-4v-6H9v6H5a2 2 0 01-2-2z" />
    </svg>
  ),
  search: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...S}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  ),
  plus: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...S}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  ),
  reels: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...S}>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M3 8h18M8 3l2.5 5M14 3l2.5 5M10 12l5 3-5 3z" />
    </svg>
  ),
  phone: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...S}>
      <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.6A2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.5 2.1L8.1 9.6a16 16 0 006 6l1.1-1.1a2 2 0 012.1-.5c.9.3 1.8.6 2.7.7a2 2 0 011.7 2z" />
    </svg>
  ),
  video: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} {...S}>
      <rect x="2" y="6" width="14" height="12" rx="2" />
      <path d="M16 10l6-3v10l-6-3z" />
    </svg>
  ),
  sparkle: (c = "") => (
    <svg viewBox="0 0 24 24" className={c} fill="currentColor">
      <path d="M12 2L14.4 8.6L21 11L14.4 13.4L12 20L9.6 13.4L3 11L9.6 8.6L12 2Z" />
    </svg>
  ),
};

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 pt-3 text-[11px] font-semibold text-zinc-300">
      <span>12:13</span>
      <div className="flex items-center gap-1.5">
        <svg viewBox="0 0 20 12" className="h-2.5 w-4 fill-zinc-300">
          <rect x="0" y="7" width="3" height="5" rx="1" />
          <rect x="5" y="4" width="3" height="8" rx="1" />
          <rect x="10" y="1.5" width="3" height="10.5" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg viewBox="0 0 20 14" className="h-3 w-4 fill-zinc-300">
          <path d="M10 3c2.7 0 5.2 1 7 2.7l-1.4 1.5A7.9 7.9 0 0010 5c-2.1 0-4 .8-5.6 2.2L3 5.7A10 10 0 0110 3z" />
        </svg>
        <svg viewBox="0 0 26 13" className="h-3 w-5">
          <rect x="0.5" y="0.5" width="22" height="12" rx="3" className="fill-none stroke-zinc-400" />
          <rect x="2" y="2" width="18" height="9" rx="1.5" className="fill-emerald-400" />
        </svg>
      </div>
    </div>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-[310px] max-w-full">
      {/* Outer Titanium Body with Radiant Ambient Lighting */}
      <div className="relative rounded-[3.2rem] bg-gradient-to-b from-zinc-600 via-zinc-800 to-zinc-950 p-[3.5px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_30px_rgba(249,115,22,0.15)]">
        {/* Inner Precision Bezel */}
        <div className="rounded-[3rem] bg-[#050508] p-[7px]">
          <div className="relative h-[650px] overflow-hidden rounded-[2.5rem] bg-[#0a0a0f]">
            {/* Dynamic Island with Audio Glow */}
            <div className="absolute left-1/2 top-2.5 z-30 flex h-7 w-28 -translate-x-1/2 items-center justify-between rounded-full bg-black px-2.5 shadow-lg border border-white/10">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                <span className="text-[9px] font-bold text-orange-400">V3NJA</span>
              </div>
              <div className="flex items-center gap-0.5">
                <span className="w-0.5 bg-orange-500 wave-animation-1 rounded-full" />
                <span className="w-0.5 bg-amber-400 wave-animation-2 rounded-full" />
                <span className="w-0.5 bg-orange-500 wave-animation-3 rounded-full" />
              </div>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function DmScreen({
  username,
  avatarUrl,
  openingDmEnabled,
  openingDmMessage,
  openingDmButtonLabel,
  revealMessage,
  hasLink,
  linkButtonLabel,
  hasSecondLink,
  secondLinkButtonLabel,
  requireFollow,
  followPromptMessage,
  followPromptButtonLabel,
  followUpEnabled,
  followUpMessage,
  followUpDelayMinutes = 0,
  linkUrl,
  inboundMessage,
}: {
  username: string;
  avatarUrl: string | null;
  openingDmEnabled: boolean;
  openingDmMessage: string;
  openingDmButtonLabel: string;
  revealMessage: string;
  hasLink: boolean;
  linkButtonLabel: string;
  linkUrl?: string;
  hasSecondLink: boolean;
  secondLinkButtonLabel: string;
  requireFollow: boolean;
  followPromptMessage: string;
  followPromptButtonLabel: string;
  followUpEnabled: boolean;
  followUpMessage: string;
  followUpDelayMinutes?: number;
  inboundMessage?: string;
}) {
  const [buttonTapped, setButtonTapped] = useState(false);

  return (
    <div className="flex h-full flex-col text-white bg-gradient-to-b from-[#0e0e14] via-[#09090d] to-[#050508]">
      <StatusBar />

      {/* Header */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-white/[0.06] bg-black/40 backdrop-blur-md">
        <span className="text-zinc-400">{Ico.back("h-5 w-5")}</span>
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-bold text-xs shadow-md shadow-orange-500/30">
            V3
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-black" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-white truncate">@{username}</span>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-sky-400 shrink-0">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
          <p className="text-[10px] text-zinc-400 font-medium">Official Artist Hub</p>
        </div>
        <span className="ml-auto flex items-center gap-3 text-zinc-400">
          {Ico.phone("h-4 w-4")}
          {Ico.video("h-4 w-4")}
        </span>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 space-y-3 px-3 py-4 overflow-y-auto">
        {/* Inbound Comment Trigger Notification */}
        <div className="flex justify-center">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
            Replied to comment on Reel
          </span>
        </div>

        {/* Inbound user message */}
        {inboundMessage !== undefined && (
          <div className="flex justify-end">
            <div className="max-w-[82%] rounded-2xl rounded-br-sm bg-gradient-to-r from-orange-600 to-amber-600 px-3.5 py-2 text-xs font-medium text-white shadow-md shadow-orange-500/20">
              {inboundMessage || "WAYULOMI is fire!! 🔥"}
            </div>
          </div>
        )}

        {/* Follow Gate Prompt */}
        {requireFollow && (
          <div className="flex items-end gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 shrink-0 flex items-center justify-center text-[9px] font-bold">
              V3
            </div>
            <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-zinc-900/90 border border-amber-500/30 p-3 shadow-lg space-y-2.5">
              <div className="flex items-center gap-1.5 text-amber-400 text-[11px] font-bold">
                <span>🔒</span>
                <span>Follow @v3nja2.0 to Unlock</span>
              </div>
              <p className="text-[11px] text-zinc-200 leading-relaxed whitespace-pre-wrap">
                {followPromptMessage ||
                  "Yo fam! Hit follow on @v3nja2.0 to get VIP access to the music stream smart link."}
              </p>
              <button
                type="button"
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 font-bold text-xs text-black shadow-md shadow-amber-500/30 hover:scale-[1.02] transition-transform"
              >
                {followPromptButtonLabel || "✅ I'm Following @v3nja2.0"}
              </button>
            </div>
          </div>
        )}

        {/* High-End Artist DM Card with Direct Interactive Buttons */}
        <div className="flex items-end gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 shrink-0 flex items-center justify-center text-[9px] font-bold shadow-sm">
            V3
          </div>

          <div className="max-w-[86%] rounded-2xl rounded-bl-sm bg-zinc-900/95 border border-white/10 overflow-hidden shadow-xl">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-orange-600/30 via-amber-500/20 to-transparent p-2.5 border-b border-white/10 flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-orange-400 flex items-center gap-1">
                🔥 V3NJA WRLD EXCLUSIVE
              </span>
              <span className="text-[9px] text-zinc-400 font-mono">STREAM LINK</span>
            </div>

            {/* Message Body */}
            <div className="p-3 space-y-2 text-xs text-zinc-100 leading-relaxed whitespace-pre-wrap">
              {revealMessage ||
                "Yo! 🔥 Here is the official smart link you requested.\n\nStream on Spotify, Apple Music, Audiomack & YouTube!"}
            </div>

            {/* Interactive Liquid Glass CTA Buttons */}
            <div className="p-2 pt-0 space-y-1.5">
              <button
                type="button"
                onClick={() => setButtonTapped(true)}
                className={`w-full py-2 px-3 rounded-xl font-bold text-xs text-white shadow-lg flex items-center justify-center gap-2 transition-all ${
                  buttonTapped
                    ? "bg-emerald-600 shadow-emerald-500/30 scale-95"
                    : "bg-gradient-to-r from-orange-500 to-amber-500 shadow-orange-500/30 hover:scale-[1.02] active:scale-95"
                }`}
              >
                <span>{buttonTapped ? "✓ Opening Stream Hub..." : `🎧 ${linkButtonLabel || "Stream Track Now"}`}</span>
              </button>

              {hasSecondLink && (
                <button
                  type="button"
                  className="w-full py-2 px-3 rounded-xl bg-white/10 border border-white/15 font-semibold text-xs text-zinc-200 hover:bg-white/15 active:scale-95 transition-all"
                >
                  {secondLinkButtonLabel || "Watch Music Video 🎬"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Follow-up Message */}
        {followUpEnabled && (
          <div className="flex items-end gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 shrink-0 flex items-center justify-center text-[9px] font-bold">
              V3
            </div>
            <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-zinc-900 border border-white/10 p-3 text-xs text-zinc-200 shadow-md">
              <p className="whitespace-pre-wrap">
                {followUpMessage || "Appreciate the real support fam! Run the numbers up on Spotify 🙌"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Input Composer */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-t border-white/[0.08] bg-black/60 backdrop-blur-md">
        <span className="w-7 h-7 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-xs text-white">
          +
        </span>
        <div className="flex-1 rounded-full bg-zinc-900 border border-white/10 px-3.5 py-1.5 text-xs text-zinc-400">
          Message @{username}…
        </div>
        <span className="text-sm">🎙️</span>
      </div>
    </div>
  );
}

function CommentsScreen({
  username,
  sampleComment,
  publicReplyEnabled,
  publicReplyMessage,
}: {
  username: string;
  sampleComment: string;
  publicReplyEnabled: boolean;
  publicReplyMessage: string;
}) {
  const reactions = ["🔥", "❤️", "🙌", "👑", "🚀", "⚡"];

  return (
    <div className="flex h-full flex-col text-white bg-gradient-to-b from-[#12121a] to-[#09090e]">
      <StatusBar />
      <div className="h-16 bg-black/40 border-b border-white/[0.06]" />

      <div className="flex flex-1 flex-col rounded-t-3xl bg-[#0d0d14] px-4 pt-3.5 border-t border-white/10 shadow-2xl">
        <div className="mx-auto mb-3.5 h-1 w-10 rounded-full bg-zinc-700" />
        <p className="text-center text-xs font-bold uppercase tracking-wider text-zinc-400">
          Comments
        </p>

        {/* Commenter Row */}
        <div className="mt-4 flex gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-700 shrink-0 flex items-center justify-center font-bold text-xs text-zinc-300">
            F
          </div>
          <div className="flex-1">
            <p className="text-xs">
              <span className="font-bold text-white">@{SAMPLE_USER}</span>{" "}
              <span className="text-[10px] text-zinc-500">Just now</span>
            </p>
            <p className="text-xs text-zinc-200 mt-0.5">{sampleComment || "NJALA is crazy!! 🔥🔥"}</p>
            <p className="mt-1 text-[10px] text-zinc-500 font-semibold">Reply</p>
          </div>
          <span className="text-xs text-zinc-500">🤍</span>
        </div>

        {/* Public Auto-Reply with Anti-Spam Badge */}
        {publicReplyEnabled && (
          <div className="mt-3.5 flex gap-2.5 pl-8">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 shrink-0 flex items-center justify-center text-[9px] font-bold text-white shadow-md shadow-orange-500/20">
              V3
            </div>
            <div className="flex-1 p-2.5 rounded-xl bg-zinc-900/90 border border-orange-500/20 shadow-sm">
              <div className="flex items-center gap-1">
                <span className="font-bold text-xs text-orange-400">@{username}</span>
                <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded">
                  AUTO-REPLY
                </span>
              </div>
              <p className="text-xs text-zinc-200 mt-1">
                {publicReplyMessage || "Yo @music_fan_265! Just sent the VIP link to your DMs 📩🔥"}
              </p>
            </div>
          </div>
        )}

        {/* Floating Quick Reactions */}
        <div className="mt-auto pb-4 space-y-2">
          <div className="flex items-center justify-around px-2 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-base">
            {reactions.map((r) => (
              <span key={r} className="hover:scale-125 transition-transform cursor-pointer">
                {r}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-full bg-zinc-900 border border-white/10 px-3 py-2 text-xs text-zinc-400">
            Add a comment for @{username}…
          </div>
        </div>
      </div>
    </div>
  );
}

function PostScreen({
  username,
  postThumb,
  caption,
}: {
  username: string;
  postThumb: string | null;
  caption: string;
}) {
  return (
    <div className="flex h-full flex-col text-white bg-gradient-to-b from-[#0e0e14] to-[#07070a]">
      <StatusBar />
      <div className="flex items-center px-3 py-2 border-b border-white/[0.06]">
        <span className="text-zinc-400">{Ico.back("h-5 w-5")}</span>
        <div className="flex-1 text-center">
          <p className="text-[9px] uppercase tracking-wider text-orange-400 font-bold">REEL · AUDIO</p>
          <p className="text-xs font-bold text-white">@{username}</p>
        </div>
        <span className="w-5" />
      </div>

      <div className="flex items-center gap-2 px-3 py-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-[10px] font-bold">
          V3
        </div>
        <span className="text-xs font-bold text-white">@{username}</span>
        <span className="ml-auto text-xs text-zinc-400 font-bold">···</span>
      </div>

      <div className="relative min-h-0 flex-1 bg-zinc-950 flex items-center justify-center overflow-hidden">
        {postThumb ? (
          <img src={postThumb} alt="Reel" className="h-full w-full object-cover" />
        ) : (
          <div className="text-center p-6 space-y-2">
            <span className="text-4xl">🎬</span>
            <p className="text-xs font-bold text-zinc-300">V3NJA — NJALA / WAYULOMI</p>
            <p className="text-[10px] text-zinc-500">Official Video &amp; Reel</p>
          </div>
        )}
      </div>

      <div className="p-3 space-y-2 bg-black/60 border-t border-white/[0.06]">
        <div className="flex items-center gap-4 text-zinc-300">
          <span className="flex items-center gap-1 text-xs font-bold">{Ico.heart("h-5 w-5 text-rose-500 fill-rose-500")} 1.4K</span>
          <span className="flex items-center gap-1 text-xs font-bold">{Ico.comment("h-5 w-5")} 384</span>
          {Ico.share("h-5 w-5")}
        </div>
        <p className="text-xs leading-relaxed text-zinc-200">
          <span className="font-bold text-white">@{username}</span>{" "}
          {caption || "Comment NJALA or WAYULOMI and I will DM you the exclusive streaming link! 🔥"}
        </p>
      </div>
    </div>
  );
}

export default function CampaignPreview(props: CampaignPreviewProps) {
  const { tab, onTabChange } = props;
  const tabs: { key: PreviewTab; label: string }[] = [
    { key: "post", label: "🎬 Post / Reel" },
    { key: "comments", label: "💬 Comments" },
    { key: "dm", label: "📩 DM Card" },
  ];

  return (
    <div className="flex flex-col items-center gap-5">
      <PhoneFrame>
        {tab === "post" && (
          <PostScreen
            username={props.username}
            postThumb={props.postThumb}
            caption={props.caption}
          />
        )}
        {tab === "comments" && (
          <CommentsScreen
            username={props.username}
            sampleComment={props.sampleComment}
            publicReplyEnabled={props.publicReplyEnabled}
            publicReplyMessage={props.publicReplyMessage}
          />
        )}
        {tab === "dm" && (
          <DmScreen
            username={props.username}
            avatarUrl={props.avatarUrl}
            openingDmEnabled={props.openingDmEnabled}
            openingDmMessage={props.openingDmMessage}
            openingDmButtonLabel={props.openingDmButtonLabel}
            revealMessage={props.revealMessage}
            hasLink={props.hasLink}
            linkButtonLabel={props.linkButtonLabel}
            hasSecondLink={props.hasSecondLink}
            secondLinkButtonLabel={props.secondLinkButtonLabel}
            requireFollow={props.requireFollow}
            followPromptMessage={props.followPromptMessage}
            followPromptButtonLabel={props.followPromptButtonLabel}
            followUpEnabled={props.followUpEnabled}
            followUpMessage={props.followUpMessage}
            followUpDelayMinutes={props.followUpDelayMinutes}
            linkUrl={props.linkUrl}
          />
        )}
      </PhoneFrame>

      <div className="inline-flex rounded-full bg-zinc-900/90 border border-white/10 p-1 shadow-lg backdrop-blur-xl">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => onTabChange(t.key)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              tab === t.key
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
