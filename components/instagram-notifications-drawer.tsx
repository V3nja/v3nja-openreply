"use client";

/**
 * Authentic Instagram Notifications Drawer
 * Matches screenshot 9 layout with Filter Pills [All, People you follow, Comments, Follows]
 * and timeline sections [New, Today, This week, This month].
 */

import React, { useState } from "react";
import Link from "next/link";
import { LIVE_NOTIFICATIONS, type NotificationItem } from "@/lib/instagram-feed-engine";

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstagramNotificationsDrawer({
  isOpen,
  onClose,
}: NotificationsDrawerProps) {
  const [activeFilter, setActiveFilter] = useState<"All" | "People you follow" | "Comments" | "Follows">("All");

  if (!isOpen) return null;

  const filteredNotifications = LIVE_NOTIFICATIONS.filter((n) => {
    if (activeFilter === "Comments") return n.type === "comment" || n.type === "reply";
    if (activeFilter === "Follows") return n.type === "follow";
    return true;
  });

  const timeGroups: Array<"New" | "Today" | "This week" | "This month"> = [
    "New",
    "Today",
    "This week",
    "This month",
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-80 bg-black/40 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <div className="fixed top-0 left-0 bottom-0 z-90 w-full max-w-sm sm:max-w-md bg-black border-r border-white/10 text-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Notifications</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-5 py-3 border-b border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {(["All", "People you follow", "Comments", "Follows"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeFilter === filter
                  ? "bg-white text-black shadow-md"
                  : "bg-white/10 hover:bg-white/20 text-zinc-300"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Notifications Timeline List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {timeGroups.map((group) => {
            const itemsInGroup = filteredNotifications.filter((n) => n.timeGroup === group);
            if (itemsInGroup.length === 0) return null;

            return (
              <div key={group} className="space-y-3">
                <span className="text-sm font-bold text-white block">{group}</span>
                <div className="space-y-3">
                  {itemsInGroup.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-white/[0.04] transition-colors"
                    >
                      {/* Actor Avatar */}
                      <div className="flex items-start gap-3 min-w-0">
                        <Link
                          href={`/inbox?user=${item.actorUsername}`}
                          className="w-11 h-11 rounded-full p-[1.5px] bg-gradient-to-tr from-pink-500 to-purple-600 shrink-0 block"
                        >
                          <img
                            src={item.actorAvatarUrl}
                            alt=""
                            className="w-full h-full rounded-full object-cover border border-black"
                          />
                        </Link>

                        {/* Notification Text */}
                        <div className="text-xs leading-snug">
                          <span className="text-zinc-200">
                            {item.text}
                          </span>
                          <span className="text-zinc-500 text-[11px] block mt-0.5">
                            {item.timestamp}
                          </span>
                        </div>
                      </div>

                      {/* Post Thumbnail Preview */}
                      {item.targetThumbnailUrl && (
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-900 border border-white/10 shrink-0">
                          <img
                            src={item.targetThumbnailUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
