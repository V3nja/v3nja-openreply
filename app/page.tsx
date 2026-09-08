import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "V3NJA WRLD - Instagram DM Automation Hub",
  description:
    "Official Instagram Comment-to-DM automation engine for @v3nja2.0 and v3njamusic.web.app smart links.",
};

export default function Home() {
  const campaigns = [
    {
      keyword: "NJALA",
      title: "NJALA Streaming Campaign",
      link: "https://v3njamusic.web.app/njala",
      badge: "Lead Single",
      color: "from-amber-500 to-orange-500",
    },
    {
      keyword: "WAYULOMI",
      title: "WAYULOMI Visuals & Audio",
      link: "https://v3njamusic.web.app/wayulomi",
      badge: "Music Video",
      color: "from-orange-500 to-red-500",
    },
    {
      keyword: "ZANGA",
      title: "ZANGA Viral Reel Drop",
      link: "https://v3njamusic.web.app/zanga",
      badge: "Viral Drop",
      color: "from-red-500 to-pink-500",
    },
    {
      keyword: "MOTO",
      title: "MOTO Single Release",
      link: "https://v3njamusic.web.app/moto",
      badge: "Single",
      color: "from-amber-600 to-red-600",
    },
    {
      keyword: "MERCH",
      title: "Exclusive Merch & Tees",
      link: "https://v3njamusic.web.app/merch",
      badge: "Store / 10% Off",
      color: "from-purple-500 to-indigo-500",
    },
    {
      keyword: "VIP / WRLD",
      title: "V3NJA WRLD Fan Club",
      link: "https://v3njamusic.web.app",
      badge: "Inner Circle",
      color: "from-emerald-500 to-teal-500",
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-orange-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-red-500 text-sm font-black text-white shadow-md shadow-orange-500/20">
              V3
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-white">
                V3NJA <span className="text-orange-500">WRLD</span>
              </span>
              <span className="ml-2 hidden rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-bold uppercase text-orange-400 sm:inline-block">
                OpenReply Engine
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://www.instagram.com/v3nja2.0/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              @v3nja2.0
            </a>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-orange-500/20 transition hover:bg-orange-600"
            >
              🔥 Launch Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto w-full max-w-6xl px-5 pb-12 pt-10 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-b from-orange-950/30 via-zinc-900/60 to-zinc-900/90 p-6 sm:p-10 shadow-2xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/10 px-3.5 py-1 text-xs font-semibold text-orange-400 mb-4">
              <span className="h-2 w-2 rounded-full bg-orange-400 animate-ping" />
              Official Instagram Comment &amp; Story Reply Automation
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight">
              Turn @v3nja2.0 comments into instant streams &amp; sales
            </h1>

            <p className="mt-4 text-base text-zinc-300 sm:text-lg leading-relaxed max-w-2xl">
              When fans comment <strong className="text-orange-400">NJALA</strong>, <strong className="text-orange-400">WAYULOMI</strong>, or <strong className="text-orange-400">MERCH</strong> on your Instagram reels, they instantly receive your official smart link from <strong className="text-white">v3njamusic.web.app</strong> directly in their DMs.
            </p>

            {/* Main Action CTAs */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition hover:from-orange-600 hover:to-amber-600"
              >
                🚀 Enter Artist Dashboard →
              </Link>
              <Link
                href="/tester"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-6 py-3.5 text-sm font-bold text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
              >
                🧪 Open Live Comment Simulator
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Grid */}
      <section className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Active Music &amp; Merch Triggers</h2>
            <p className="text-xs text-zinc-400">Connected to your official website release smart links</p>
          </div>
          <Link
            href="/campaigns"
            className="text-xs font-semibold text-orange-400 hover:text-orange-300"
          >
            Manage All Campaigns →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((c) => (
            <div
              key={c.keyword}
              className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 hover:border-orange-500/50 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="rounded-md bg-orange-500/10 px-2.5 py-1 font-mono text-xs font-bold text-orange-400 border border-orange-500/20">
                  KEYWORD: {c.keyword}
                </span>
                <span className="text-[11px] font-semibold text-zinc-400">{c.badge}</span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors">
                {c.title}
              </h3>

              <div className="mt-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80 p-3 text-xs text-zinc-400">
                <div className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Delivers Smart Link:</div>
                <a
                  href={c.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-orange-400 hover:underline truncate block font-mono"
                >
                  {c.link} ↗
                </a>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-800/80 pt-3">
                <span className="text-emerald-400 font-medium">● 24/7 Active</span>
                <Link
                  href="/campaigns"
                  className="font-semibold text-zinc-300 hover:text-white"
                >
                  Edit Trigger →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works Step Bar */}
      <section className="border-t border-zinc-900 bg-zinc-950 py-12">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-5">
              <div className="text-2xl font-black text-orange-500 mb-2">01</div>
              <h3 className="font-bold text-white mb-1">Fan Comments on Reel</h3>
              <p className="text-xs text-zinc-400">A listener comments &ldquo;NJALA&rdquo; or &ldquo;WAYULOMI&rdquo; on @v3nja2.0.</p>
            </div>
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-5">
              <div className="text-2xl font-black text-orange-500 mb-2">02</div>
              <h3 className="font-bold text-white mb-1">Instant Webhook &amp; Public Reply</h3>
              <p className="text-xs text-zinc-400">Meta API receives event and posts a reply: &ldquo;Check your DMs 🔥❤️&rdquo;.</p>
            </div>
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-5">
              <div className="text-2xl font-black text-orange-500 mb-2">03</div>
              <h3 className="font-bold text-white mb-1">Official DM Delivered</h3>
              <p className="text-xs text-zinc-400">BullMQ worker dispatches DM with the smart link button directly to the fan&rsquo;s inbox.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-8 bg-zinc-950 text-center text-xs text-zinc-500">
        <p>V3NJA WRLD × OpenReply · Official Meta Graph API Integration for @v3nja2.0</p>
      </footer>
    </main>
  );
}
