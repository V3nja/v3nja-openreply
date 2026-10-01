"use client";

/**
 * Universal Instagram & Meta Creation Suite
 * Allows creating and publishing Feed Posts (Single & Carousel), Vertical Reels, and Interactive Stories
 */

import React, { useState } from "react";
import { TRENDING_SOUNDS, type AudioTrack, type StorySticker } from "@/lib/instagram-feed-engine";

interface InstagramCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublishSuccess?: (item: any) => void;
}

type CreateMode = "post" | "reel" | "story";

export default function InstagramCreatorModal({
  isOpen,
  onClose,
  onPublishSuccess,
}: InstagramCreatorModalProps) {
  const [mode, setMode] = useState<CreateMode>("post");
  const [step, setStep] = useState<"media" | "edit" | "details">("media");

  // Selected media files
  const [mediaFiles, setMediaFiles] = useState<Array<{ url: string; type: "image" | "video"; name: string }>>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Aspect ratio & Filters
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "4:5" | "16:9">("1:1");
  const [activeFilter, setActiveFilter] = useState<string>("none");

  // Post / Reel Metadata
  const [caption, setCaption] = useState("");
  const [locationTag, setLocationTag] = useState("");
  const [taggedPeople, setTaggedPeople] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [collabInput, setCollabInput] = useState("");
  const [selectedAudio, setSelectedAudio] = useState<AudioTrack | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(["Music", "Afrobeats"]);

  // Advanced Settings
  const [altText, setAltText] = useState("");
  const [hideLikes, setHideLikes] = useState(false);
  const [disableComments, setDisableComments] = useState(false);
  const [crossPostFb, setCrossPostFb] = useState(true);
  const [crossPostShorts, setCrossPostShorts] = useState(false);
  const [smartLinkSlug, setSmartLinkSlug] = useState("wayulomi");

  // Story Stickers State
  const [storyStickers, setStoryStickers] = useState<StorySticker[]>([]);
  const [showStickerDrawer, setShowStickerDrawer] = useState(false);
  const [linkStickerUrl, setLinkStickerUrl] = useState("https://v3nja-official.web.app/wayulomi");
  const [linkStickerText, setLinkStickerText] = useState("Stream WAYULOMI 🎵");
  const [pollQuestion, setPollQuestion] = useState("Which track do you love most?");
  const [pollOptions, setPollOptions] = useState(["WAYULOMI 🔥", "NJALA ⚡"]);

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  if (!isOpen) return null;

  const FILTERS = [
    { id: "none", name: "Normal", filterClass: "" },
    { id: "clarendon", name: "Clarendon", filterClass: "contrast-125 saturate-125 brightness-105" },
    { id: "gingham", name: "Gingham", filterClass: "sepia-25 brightness-105 contrast-90" },
    { id: "moon", name: "Moon", filterClass: "grayscale contrast-110 brightness-110" },
    { id: "lark", name: "Lark", filterClass: "brightness-108 contrast-95 saturate-120" },
    { id: "juno", name: "Juno", filterClass: "contrast-115 saturate-140 brightness-105" },
    { id: "slumber", name: "Slumber", filterClass: "saturate-85 brightness-105 sepia-30" },
    { id: "lofi", name: "Lo-Fi", filterClass: "contrast-140 saturate-110" },
  ];

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    const newItems = files.map((f) => ({
      url: URL.createObjectURL(f),
      type: f.type.startsWith("video") ? ("video" as const) : ("image" as const),
      name: f.name,
    }));
    setMediaFiles(newItems);
    setStep("edit");
  }

  function handleAddTag() {
    if (!tagInput.trim()) return;
    const clean = tagInput.replace(/^@/, "").trim();
    if (!taggedPeople.includes(clean)) {
      setTaggedPeople([...taggedPeople, clean]);
    }
    setTagInput("");
  }

  function handleAddCollab() {
    if (!collabInput.trim()) return;
    const clean = collabInput.replace(/^@/, "").trim();
    if (!collaborators.includes(clean)) {
      setCollaborators([...collaborators, clean]);
    }
    setCollabInput("");
  }

  function handleAddLinkSticker() {
    const newSticker: StorySticker = {
      type: "link",
      url: linkStickerUrl,
      text: linkStickerText || "Tap Link 🔗",
      xPercent: 50,
      yPercent: 70,
    };
    setStoryStickers([...storyStickers, newSticker]);
    setShowStickerDrawer(false);
  }

  function handleAddPollSticker() {
    const newSticker: StorySticker = {
      type: "poll",
      question: pollQuestion,
      options: pollOptions,
      xPercent: 50,
      yPercent: 45,
    };
    setStoryStickers([...storyStickers, newSticker]);
    setShowStickerDrawer(false);
  }

  async function handlePublish() {
    setIsPublishing(true);
    // Simulate real post packaging
    await new Promise((r) => setTimeout(r, 1200));
    setIsPublishing(false);
    setPublishedSuccess(true);
    setTimeout(() => {
      setPublishedSuccess(false);
      onClose();
      if (onPublishSuccess) {
        onPublishSuccess({
          mode,
          caption,
          mediaFiles,
          audioTrack: selectedAudio,
          timestamp: "Just now",
        });
      }
    }, 1000);
  }

  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center bg-black/85 backdrop-blur-2xl p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-3xl bg-zinc-950 border border-white/15 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2">
            {step !== "media" && (
              <button
                type="button"
                onClick={() => setStep(step === "details" ? "edit" : "media")}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center text-xs mr-1"
              >
                ←
              </button>
            )}
            <span className="text-sm font-black text-white">
              Create New {mode === "post" ? "Feed Post" : mode === "reel" ? "Reel" : "Story"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {step === "edit" && (
              <button
                type="button"
                onClick={() => setStep("details")}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md"
              >
                Next →
              </button>
            )}

            {step === "details" && (
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
              >
                {isPublishing ? "Sharing…" : "Share Now"}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center text-xs"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 3 Creation Mode Pills (Post | Reel | Story) */}
        <div className="flex items-center border-b border-white/10 bg-black/20 p-2 gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode("post"); setStep("media"); setMediaFiles([]); }}
            className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mode === "post" ? "bg-white/15 text-white shadow-sm" : "text-zinc-400 hover:text-white"
            }`}
          >
            <span>▦</span>
            <span>Feed Post</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode("reel"); setStep("media"); setMediaFiles([]); }}
            className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mode === "reel" ? "bg-white/15 text-white shadow-sm" : "text-zinc-400 hover:text-white"
            }`}
          >
            <span>🎬</span>
            <span>Reel</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode("story"); setStep("media"); setMediaFiles([]); }}
            className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mode === "story" ? "bg-white/15 text-white shadow-sm" : "text-zinc-400 hover:text-white"
            }`}
          >
            <span>⭕</span>
            <span>Story</span>
          </button>
        </div>

        {/* Main Content Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {publishedSuccess ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <span className="text-6xl animate-bounce">🎉</span>
              <h3 className="text-lg font-bold text-white">Your {mode} has been shared!</h3>
              <p className="text-xs text-zinc-400">Live on your Instagram profile and feed.</p>
            </div>
          ) : step === "media" ? (
            /* Step 1: Media Picker */
            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-white/15 rounded-3xl p-6 text-center space-y-4 hover:border-purple-500/50 transition-colors">
              <div className="w-16 h-16 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center text-3xl shadow-lg">
                {mode === "post" ? "📷" : mode === "reel" ? "🎬" : "✨"}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Drag photos and videos here
                </h4>
                <p className="text-xs text-zinc-400 max-w-sm">
                  {mode === "post"
                    ? "Upload up to 10 photos or videos to create a carousel or post."
                    : mode === "reel"
                    ? "Upload 9:16 vertical video up to 90 seconds."
                    : "Upload vertical photo or video with interactive link & poll stickers."}
                </p>
              </div>

              <label className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-purple-500/20 cursor-pointer hover:opacity-95 transition-opacity">
                <span>Select from Computer / Device</span>
                <input
                  type="file"
                  multiple={mode === "post"}
                  accept={mode === "reel" ? "video/*" : "image/*,video/*"}
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          ) : step === "edit" ? (
            /* Step 2: Crop, Aspect Ratio & Filters */
            <div className="space-y-4">
              <div className="relative aspect-square max-h-[380px] w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center mx-auto border border-white/10">
                {mediaFiles[activeSlideIndex]?.type === "video" ? (
                  <video
                    src={mediaFiles[activeSlideIndex].url}
                    controls
                    autoPlay
                    loop
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <img
                    src={mediaFiles[activeSlideIndex]?.url}
                    alt="Preview"
                    className={`max-h-full max-w-full object-contain transition-all ${
                      FILTERS.find((f) => f.id === activeFilter)?.filterClass || ""
                    }`}
                  />
                )}

                {/* Story Stickers Overlay */}
                {mode === "story" && storyStickers.length > 0 && (
                  <div className="absolute inset-0 pointer-events-none p-4">
                    {storyStickers.map((stk, idx) => (
                      <div
                        key={idx}
                        style={{ top: `${stk.yPercent}%`, left: `${stk.xPercent}%`, transform: "translate(-50%, -50%)" }}
                        className="absolute bg-black/70 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-1.5"
                      >
                        {stk.type === "link" && <span>🔗 {stk.text}</span>}
                        {stk.type === "poll" && <span>📊 {stk.question}</span>}
                        {stk.type === "mention" && <span>@{stk.username}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Carousel Slide Indicators */}
              {mediaFiles.length > 1 && (
                <div className="flex items-center justify-center gap-2">
                  {mediaFiles.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveSlideIndex(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        activeSlideIndex === i ? "bg-purple-500 scale-125" : "bg-white/30"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Aspect Ratio Switcher (Post mode) */}
              {mode === "post" && (
                <div className="flex items-center justify-center gap-2 text-xs">
                  <span className="text-zinc-400 font-bold mr-2">Aspect:</span>
                  {(["1:1", "4:5", "16:9"] as const).map((asp) => (
                    <button
                      key={asp}
                      type="button"
                      onClick={() => setAspectRatio(asp)}
                      className={`px-3 py-1 rounded-xl font-bold transition-all ${
                        aspectRatio === asp ? "bg-purple-600 text-white" : "bg-white/10 text-zinc-300"
                      }`}
                    >
                      {asp}
                    </button>
                  ))}
                </div>
              )}

              {/* Filter Thumbnails Carousel */}
              <div>
                <span className="text-xs font-bold text-zinc-400 block mb-2">Instagram Filters</span>
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setActiveFilter(f.id)}
                      className={`flex flex-col items-center gap-1 shrink-0 p-1.5 rounded-2xl border transition-all ${
                        activeFilter === f.id ? "border-purple-500 bg-white/10" : "border-transparent opacity-75 hover:opacity-100"
                      }`}
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-800">
                        {mediaFiles[0] && (
                          <img src={mediaFiles[0].url} alt={f.name} className={`w-full h-full object-cover ${f.filterClass}`} />
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-zinc-300">{f.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Story Stickers Drawer Toggle */}
              {mode === "story" && (
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <span>✨</span> Story Stickers & Smart Links
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowStickerDrawer(!showStickerDrawer)}
                      className="px-2.5 py-1 rounded-xl bg-purple-600 text-white text-[11px] font-bold"
                    >
                      {showStickerDrawer ? "Done" : "+ Add Sticker"}
                    </button>
                  </div>

                  {showStickerDrawer && (
                    <div className="space-y-3 pt-2 text-xs">
                      {/* Link Sticker */}
                      <div className="space-y-1.5 p-2.5 rounded-xl bg-black/40 border border-white/5">
                        <span className="font-bold text-purple-300">🔗 Add Official Smart Link Sticker</span>
                        <input
                          type="text"
                          value={linkStickerUrl}
                          onChange={(e) => setLinkStickerUrl(e.target.value)}
                          placeholder="https://v3nja-official.web.app/..."
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={linkStickerText}
                            onChange={(e) => setLinkStickerText(e.target.value)}
                            placeholder="Sticker display text…"
                            className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                          />
                          <button
                            type="button"
                            onClick={handleAddLinkSticker}
                            className="px-3 py-1 bg-purple-600 rounded-xl text-white font-bold text-xs"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {/* Poll Sticker */}
                      <div className="space-y-1.5 p-2.5 rounded-xl bg-black/40 border border-white/5">
                        <span className="font-bold text-amber-300">📊 Add Voting Poll Sticker</span>
                        <input
                          type="text"
                          value={pollQuestion}
                          onChange={(e) => setPollQuestion(e.target.value)}
                          placeholder="Ask a question…"
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={handleAddPollSticker}
                          className="px-3 py-1 bg-amber-600 rounded-xl text-black font-bold text-xs"
                        >
                          Add Poll
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Step 3: Caption, Audio, Tags, Collaborator & Cross-posting */
            <div className="space-y-4 text-xs">
              {/* Caption Box */}
              <div>
                <label className="text-zinc-400 font-bold block mb-1">Write a Caption</label>
                <textarea
                  rows={4}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption, drop official smart links, or add hashtags (#V3NJA #Afrobeats)…"
                  className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
                />
                <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-1">
                  <span>Smart Link: https://v3nja-official.web.app/{smartLinkSlug}</span>
                  <span>{caption.length}/2,200</span>
                </div>
              </div>

              {/* Add Music / Audio Track */}
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span>🎵</span> Add Audio / Music Track
                </span>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {TRENDING_SOUNDS.map((snd) => (
                    <button
                      key={snd.id}
                      type="button"
                      onClick={() => setSelectedAudio(selectedAudio?.id === snd.id ? null : snd)}
                      className={`flex items-center gap-2 p-2 rounded-xl border shrink-0 transition-all ${
                        selectedAudio?.id === snd.id
                          ? "bg-purple-600/30 border-purple-500 text-white"
                          : "bg-zinc-900 border-white/5 text-zinc-300 hover:bg-zinc-800"
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg overflow-hidden bg-black shrink-0">
                        <img src={snd.albumArtUrl} alt={snd.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold truncate max-w-[120px]">{snd.title}</div>
                        <div className="text-[9px] text-zinc-400 truncate max-w-[120px]">{snd.artist}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag People & Invite Collaborator */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tag People */}
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                  <span className="font-bold text-white flex items-center gap-1">
                    <span>👤</span> Tag People
                  </span>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleAddTag(); }}
                      placeholder="@username…"
                      className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white"
                    />
                    <button type="button" onClick={handleAddTag} className="px-2.5 py-1 bg-white/10 rounded-xl text-white font-bold">
                      Add
                    </button>
                  </div>
                  {taggedPeople.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {taggedPeople.map((u) => (
                        <span key={u} className="px-2 py-0.5 rounded-lg bg-purple-600/30 text-purple-200 text-[10px] font-bold">
                          @{u}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Invite Collaborator (Reels & Posts) */}
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                  <span className="font-bold text-white flex items-center gap-1">
                    <span>🤝</span> Invite Collaborator
                  </span>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={collabInput}
                      onChange={(e) => setCollabInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleAddCollab(); }}
                      placeholder="@username…"
                      className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white"
                    />
                    <button type="button" onClick={handleAddCollab} className="px-2.5 py-1 bg-white/10 rounded-xl text-white font-bold">
                      Add
                    </button>
                  </div>
                  {collaborators.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {collaborators.map((c) => (
                        <span key={c} className="px-2 py-0.5 rounded-lg bg-pink-600/30 text-pink-200 text-[10px] font-bold">
                          @{c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Location Tag */}
              <div>
                <label className="text-zinc-400 font-bold block mb-1">Add Location</label>
                <input
                  type="text"
                  value={locationTag}
                  onChange={(e) => setLocationTag(e.target.value)}
                  placeholder="Blantyre, Malawi or Newcastle, UK…"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>

              {/* Cross-Posting & Multi-Platform Syndication */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20 border border-white/10 space-y-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span>⚡</span> Auto Cross-Posting & Sync
                </span>
                <div className="space-y-1.5">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-zinc-300">Facebook Page (V3NJA)</span>
                    <input
                      type="checkbox"
                      checked={crossPostFb}
                      onChange={(e) => setCrossPostFb(e.target.checked)}
                      className="accent-purple-500 w-4 h-4"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-zinc-300">YouTube Shorts Sync</span>
                    <input
                      type="checkbox"
                      checked={crossPostShorts}
                      onChange={(e) => setCrossPostShorts(e.target.checked)}
                      className="accent-purple-500 w-4 h-4"
                    />
                  </label>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <span className="font-bold text-zinc-400 block uppercase tracking-wider text-[10px]">
                  Advanced Settings
                </span>
                <div className="space-y-2">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-zinc-300">Hide like and view counts</span>
                    <input
                      type="checkbox"
                      checked={hideLikes}
                      onChange={(e) => setHideLikes(e.target.checked)}
                      className="accent-purple-500 w-4 h-4"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-zinc-300">Turn off commenting</span>
                    <input
                      type="checkbox"
                      checked={disableComments}
                      onChange={(e) => setDisableComments(e.target.checked)}
                      className="accent-purple-500 w-4 h-4"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
