"use client";

/**
 * V3NJA WRLD Sidebar Navigation
 */

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Overview & Growth", href: "/overview", icon: "📈" },
  { label: "Live Comment Tester", href: "/tester", icon: "🧪" },
  { label: "Instagram Inbox", href: "/inbox", icon: "💬" },
  { label: "Campaigns & Triggers", href: "/campaigns", icon: "⚡" },
  { label: "DM Logs", href: "/logs", icon: "📋" },
  { label: "Settings & Keys", href: "/settings", icon: "⚙️" },
  { label: "System Diagnostics", href: "/diagnostics", icon: "🩺" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceName: string;
}

export default function Sidebar({
  isOpen,
  onClose,
  workspaceName,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-dvh w-64 max-w-[85vw] shrink-0 bg-surface border-r border-border flex flex-col
          transition-transform duration-200 ease-out
          lg:h-full lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div
          className="px-5 py-4 border-b border-border flex items-center gap-3"
          style={{ paddingTop: "calc(1.25rem + env(safe-area-inset-top))" }}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white font-black text-sm flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
            V3
          </div>
          <div className="min-w-0">
            <Link href="/dashboard" className="text-base font-bold text-foreground truncate block leading-tight">
              V3NJA <span className="text-accent font-extrabold">WRLD</span>
            </Link>
            <span className="text-[10px] uppercase tracking-wider text-muted font-semibold">
              OpenReply OS
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
                className={`
                  flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors
                  ${
                    isActive
                      ? "bg-accent/10 text-accent font-semibold"
                      : "text-muted hover:text-foreground hover:bg-surface-hover font-medium"
                  }
                `}
              >
                <span>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Live Instagram Connected Status */}
        <div className="px-4 py-3 mx-3 mb-2 rounded-xl border border-border/80 bg-surface-hover/50">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <a
                href="https://www.instagram.com/v3nja2.0/"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-foreground hover:text-accent truncate"
              >
                @v3nja2.0
              </a>
            </div>
            <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
              LIVE
            </span>
          </div>
          <p className="text-[11px] text-muted">Instagram Graph API Connected</p>
        </div>

        <div className="px-5 py-3 border-t border-border flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{workspaceName}</p>
            <p className="text-[10px] text-muted">V3NJA Official Hub</p>
          </div>
          <a
            href="/login"
            className="text-[11px] text-muted hover:text-accent font-medium"
          >
            Switch
          </a>
        </div>
      </aside>
    </>
  );
}
