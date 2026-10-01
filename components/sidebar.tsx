"use client";

/**
 * V3NJA WRLD Sidebar Navigation & Universal Meta Action Controls
 */

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import InstagramNotificationsDrawer from "@/components/instagram-notifications-drawer";
import InstagramCreatorModal from "@/components/instagram-creator-modal";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceName?: string;
}

export default function Sidebar({
  isOpen,
  onClose,
  workspaceName = "V3NJA WRLD",
}: SidebarProps) {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreatorModal, setShowCreatorModal] = useState(false);

  const mainNavItems = [
    { label: "Home Feed", href: "/feed", icon: "🏠" },
    { label: "Explore & Search", href: "/explore", icon: "🧭" },
    { label: "Reels Stream", href: "/reels", icon: "🎬" },
    { label: "Direct Messages", href: "/inbox", icon: "💬", badge: "6" },
  ];

  const managementNavItems = [
    { label: "Automation Dashboard", href: "/dashboard", icon: "📊" },
    { label: "Overview & Growth", href: "/overview", icon: "📈" },
    { label: "Analytics", href: "/analytics", icon: "📉" },
    { label: "Fans & Audience CRM", href: "/fans", icon: "👥" },
    { label: "Live Comment Tester", href: "/tester", icon: "🧪" },
    { label: "Campaigns & Triggers", href: "/campaigns", icon: "⚡" },
    { label: "DM Webhook Logs", href: "/logs", icon: "📋" },
    { label: "Settings & API Keys", href: "/settings", icon: "⚙️" },
    { label: "System Diagnostics", href: "/diagnostics", icon: "🩺" },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-dvh w-64 max-w-[85vw] shrink-0 bg-black border-r border-white/10 flex flex-col
          transition-transform duration-200 ease-out
          lg:h-full lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Top Logo / App Title Header */}
        <div
          className="px-5 py-4 border-b border-white/10 flex items-center justify-between"
          style={{ paddingTop: "calc(1.25rem + env(safe-area-inset-top))" }}
        >
          <Link href="/feed" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white font-black text-sm flex items-center justify-center shadow-md shadow-pink-500/20 shrink-0 group-hover:scale-105 transition-transform">
              📷
            </div>
            <div className="min-w-0">
              <span className="text-sm font-black text-white tracking-tight truncate block leading-tight">
                Instagram <span className="text-pink-400">OS</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                V3NJA WRLD
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Stream */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto no-scrollbar text-xs">
          
          {/* Main Social Client Navigation */}
          <div className="space-y-0.5 mb-3">
            <span className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider block py-1">
              Social Experience
            </span>
            {mainNavItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center justify-between px-3 py-2 rounded-xl transition-all font-bold
                    ${
                      isActive
                        ? "bg-white/15 text-white shadow-sm"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white font-extrabold text-[10px]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Notification Drawer Action Button */}
            <button
              type="button"
              onClick={() => setShowNotifications(true)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all font-bold text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="text-base">❤️</span>
                <span>Notifications</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white font-extrabold text-[10px]">
                1
              </span>
            </button>

            {/* Create Post / Reel / Story Action Button */}
            <button
              type="button"
              onClick={() => setShowCreatorModal(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all font-bold text-xs"
            >
              <span className="text-base">➕</span>
              <span>Create Post & Reel</span>
            </button>
          </div>

          {/* Automation & Management Navigation */}
          <div className="pt-2 border-t border-white/10 space-y-0.5">
            <span className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider block py-1">
              Automation Suite
            </span>
            {managementNavItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-xl transition-all font-semibold
                    ${
                      isActive
                        ? "bg-purple-600/20 text-purple-300 font-bold border border-purple-500/30"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Live Instagram Account Card */}
        <div className="px-4 py-3 mx-3 mb-3 rounded-2xl border border-white/10 bg-zinc-900/50">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Link
                href="/inbox?user=v3nja2.0"
                className="text-xs font-bold text-white hover:text-purple-300 truncate"
              >
                @v3nja2.0
              </Link>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
              2,851 FANS
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">Meta Graph API & DM Router Live</p>
        </div>
      </aside>

      {/* Notifications Drawer Component */}
      <InstagramNotificationsDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Universal Creator Modal Component */}
      <InstagramCreatorModal
        isOpen={showCreatorModal}
        onClose={() => setShowCreatorModal(false)}
      />
    </>
  );
}
