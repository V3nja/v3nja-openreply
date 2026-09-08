import { Metadata } from "next";
import Link from "next/link";

interface TrackMetadata {
  title: string;
  artist: string;
  subtitle: string;
  price?: string;
  coverImage: string;
  streamUrl: string;
  youtubeUrl: string;
  spotifyUrl: string;
  appleMusicUrl: string;
  audiomackUrl: string;
}

const TRACKS: Record<string, TrackMetadata> = {
  wayulomi: {
    title: "WAYULOMI",
    artist: "V3NJA",
    subtitle: "Official Audio & Visuals · BIL!ON VIBEZ",
    coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80",
    streamUrl: "https://v3nja-official.web.app/wayulomi",
    youtubeUrl: "https://www.youtube.com/@v3nja",
    spotifyUrl: "https://open.spotify.com/artist/v3nja",
    appleMusicUrl: "https://music.apple.com/artist/v3nja",
    audiomackUrl: "https://audiomack.com/v3nja",
  },
  njala: {
    title: "NJALA",
    artist: "V3NJA",
    subtitle: "Hit Single · Apple Music, Spotify, Audiomack & YouTube",
    coverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80",
    streamUrl: "https://v3nja-official.web.app/njala",
    youtubeUrl: "https://www.youtube.com/@v3nja",
    spotifyUrl: "https://open.spotify.com/artist/v3nja",
    appleMusicUrl: "https://music.apple.com/artist/v3nja",
    audiomackUrl: "https://audiomack.com/v3nja",
  },
  mirako: {
    title: "MIRAKO",
    artist: "V3NJA",
    subtitle: "Upcoming Single Pre-Save · Exclusive VIP Pass",
    coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80",
    streamUrl: "https://v3nja-official.web.app/mirako",
    youtubeUrl: "https://www.youtube.com/@v3nja",
    spotifyUrl: "https://open.spotify.com/artist/v3nja",
    appleMusicUrl: "https://music.apple.com/artist/v3nja",
    audiomackUrl: "https://audiomack.com/v3nja",
  },
  merch: {
    title: "V3NJA OFFICIAL MERCH",
    artist: "V3NJA WRLD",
    subtitle: "Limited Edition Tees & Caps · Worldwide Delivery",
    price: "$15",
    coverImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200&auto=format&fit=crop&q=80",
    streamUrl: "https://v3nja-official.web.app/merch",
    youtubeUrl: "https://www.youtube.com/@v3nja",
    spotifyUrl: "https://open.spotify.com/artist/v3nja",
    appleMusicUrl: "https://music.apple.com/artist/v3nja",
    audiomackUrl: "https://audiomack.com/v3nja",
  },
  vip: {
    title: "V3NJA WRLD VIP PASS",
    artist: "INNER CIRCLE",
    subtitle: "Secret Drops, Backstage Access & Early Tickets",
    price: "$5",
    coverImage: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&auto=format&fit=crop&q=80",
    streamUrl: "https://v3nja-official.web.app",
    youtubeUrl: "https://www.youtube.com/@v3nja",
    spotifyUrl: "https://open.spotify.com/artist/v3nja",
    appleMusicUrl: "https://music.apple.com/artist/v3nja",
    audiomackUrl: "https://audiomack.com/v3nja",
  },
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const track = TRACKS[slug.toLowerCase()] || {
    title: "V3NJA — " + slug.toUpperCase(),
    artist: "V3NJA",
    subtitle: "Official Music Drop · BIL!ON VIBEZ",
    coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80",
  };

  return {
    title: `${track.title} — ${track.artist} | Official VIP Hub`,
    description: track.subtitle,
    openGraph: {
      title: `${track.title} — ${track.artist}`,
      description: track.subtitle,
      images: [
        {
          url: track.coverImage,
          width: 1200,
          height: 630,
          alt: `${track.title} Widescreen Cover`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${track.title} — ${track.artist}`,
      description: track.subtitle,
      images: [track.coverImage],
    },
  };
}

export default async function TrackSmartLinkPage({ params }: PageProps) {
  const { slug } = await params;
  const track = TRACKS[slug.toLowerCase()] || {
    title: slug.toUpperCase(),
    artist: "V3NJA",
    subtitle: "Official Audio & Visuals · BIL!ON VIBEZ",
    coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80",
    streamUrl: `https://v3nja-official.web.app/${slug}`,
    youtubeUrl: "https://www.youtube.com/@v3nja",
    spotifyUrl: "https://open.spotify.com/artist/v3nja",
    appleMusicUrl: "https://music.apple.com/artist/v3nja",
    audiomackUrl: "https://audiomack.com/v3nja",
  };

  const platforms = [
    {
      name: "Apple Music",
      action: "Play",
      color: "from-rose-500 to-pink-600",
      icon: "🍎",
      url: track.appleMusicUrl,
      badge: "Lossless Audio",
    },
    {
      name: "Spotify",
      action: "Stream",
      color: "from-emerald-500 to-green-600",
      icon: "🟢",
      url: track.spotifyUrl,
      badge: "Popular",
    },
    {
      name: "YouTube Music",
      action: "Watch Video",
      color: "from-red-500 to-rose-600",
      icon: "🎬",
      url: track.youtubeUrl,
      badge: "Official Visuals",
    },
    {
      name: "Audiomack",
      action: "Stream Free",
      color: "from-amber-500 to-orange-600",
      icon: "🟠",
      url: track.audiomackUrl,
      badge: "Trending",
    },
  ];

  return (
    <div className="min-h-screen bg-[#07070a] text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Liquid Ambient Lighting Aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/15 via-orange-600/15 to-rose-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Luxury Glass Card */}
      <div className="w-full max-w-md bg-[#0e0e12]/80 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 relative z-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
        {/* Top Header with Region & Currency Badge */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              V3NJA WRLD VIP DROP
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-bold text-zinc-300">
            MW / GLOBAL 🌍
          </span>
        </div>

        {/* Cinematic Cover Art with Holographic Glow */}
        <div className="relative group mx-auto w-52 h-52 sm:w-60 sm:h-60">
          <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-85 transition duration-700" />
          <img
            src={track.coverImage}
            alt={track.title}
            className="relative w-full h-full object-cover rounded-2xl border border-white/15 shadow-2xl"
          />
          {/* Live Audio Equalizer Pill */}
          <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex items-center gap-1 shadow-lg">
            <span className="w-0.5 h-3 bg-orange-400 wave-animation-1 rounded-full" />
            <span className="w-0.5 h-4 bg-amber-400 wave-animation-2 rounded-full" />
            <span className="w-0.5 h-2.5 bg-orange-400 wave-animation-3 rounded-full" />
            <span className="text-[10px] font-bold text-white ml-1">AUDIO HD</span>
          </div>
        </div>

        {/* Track Title & Artist */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {track.title}
          </h1>
          <p className="text-sm font-extrabold text-orange-400 tracking-wide uppercase">
            {track.artist}
          </p>
          <p className="text-xs text-zinc-400 pt-1">
            {track.subtitle}
          </p>
        </div>

        {/* Primary Streaming Action Button with Warm Liquid Amber Glow */}
        <div>
          <a
            href={track.streamUrl}
            target="_blank"
            rel="noreferrer"
            className="relative block w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 font-black text-sm text-black uppercase tracking-wider text-center shadow-[0_0_30px_rgba(245,158,11,0.45)] hover:shadow-[0_0_40px_rgba(245,158,11,0.65)] hover:scale-[1.02] active:scale-98 transition-all duration-300"
          >
            🔥 Stream {track.title} Now
          </a>
        </div>

        {/* Streaming & Payment Pill Tags */}
        <div className="space-y-3 pt-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 text-center">
            One-Tap Streaming Platforms
          </p>

          <div className="grid grid-cols-2 gap-2">
            {platforms.map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-orange-500/40 transition-all group"
              >
                <span className="text-lg">{p.icon}</span>
                <div className="min-w-0 text-left">
                  <p className="text-xs font-bold text-white group-hover:text-orange-300 truncate">
                    {p.name}
                  </p>
                  <span className="text-[9px] text-zinc-400 block">{p.badge}</span>
                </div>
              </a>
            ))}
          </div>

          {/* Payment Pill Badges */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-extrabold">
              TNM Mpamba
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] font-extrabold">
              Airtel Money
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 text-[10px] font-extrabold">
              VISA
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 text-[10px] font-extrabold">
              Mastercard
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold">
              Wise
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 text-center border-t border-white/[0.08]">
          <a
            href="https://www.instagram.com/v3nja2.0/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-orange-400 transition-colors"
          >
            <span>Official Instagram: @v3nja2.0</span>
            <span>↗</span>
          </a>
        </div>
      </div>
    </div>
  );
}
