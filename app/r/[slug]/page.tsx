import { Metadata } from "next";
import Link from "next/link";

interface TrackMetadata {
  title: string;
  artist: string;
  subtitle: string;
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
    streamUrl: "https://v3njamusic.web.app/wayulomi",
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
    streamUrl: "https://v3njamusic.web.app/njala",
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
    streamUrl: "https://v3njamusic.web.app/mirako",
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
    title: "V3NJA Official Music",
    artist: "V3NJA",
    subtitle: "Stream on Apple Music, Spotify, Audiomack & YouTube",
    coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80",
  };

  return {
    title: `${track.title} — ${track.artist} | Official Stream Hub`,
    description: track.subtitle,
    openGraph: {
      title: `${track.title} — ${track.artist}`,
      description: track.subtitle,
      images: [
        {
          url: track.coverImage,
          width: 1200,
          height: 630,
          alt: `${track.title} Cover Art`,
        },
      ],
    },
  };
}

export default async function TrackSmartLinkPage({ params }: PageProps) {
  const { slug } = await params;
  const track = TRACKS[slug.toLowerCase()] || {
    title: slug.toUpperCase(),
    artist: "V3NJA",
    subtitle: "Official Release · BIL!ON VIBEZ",
    coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80",
    streamUrl: `https://v3njamusic.web.app/${slug}`,
    youtubeUrl: "https://www.youtube.com/@v3nja",
    spotifyUrl: "https://open.spotify.com/artist/v3nja",
    appleMusicUrl: "https://music.apple.com/artist/v3nja",
    audiomackUrl: "https://audiomack.com/v3nja",
  };

  const platforms = [
    {
      name: "Apple Music",
      action: "Play",
      icon: "🍎",
      url: track.appleMusicUrl,
      badge: "Lossless Audio",
    },
    {
      name: "Spotify",
      action: "Stream",
      icon: "🟢",
      url: track.spotifyUrl,
      badge: "Popular",
    },
    {
      name: "YouTube Music",
      action: "Watch Video",
      icon: "🎬",
      url: track.youtubeUrl,
      badge: "Official Visuals",
    },
    {
      name: "Audiomack",
      action: "Stream Free",
      icon: "🟠",
      url: track.audiomackUrl,
      badge: "Trending",
    },
    {
      name: "V3NJA Official Hub",
      action: "Explore",
      icon: "👑",
      url: "https://v3njamusic.web.app",
      badge: "BIL!ON VIBEZ",
    },
  ];

  return (
    <div className="min-h-screen bg-[#07070a] text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Liquid Ambient Background Aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-orange-600/20 via-amber-500/15 to-rose-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glass Portal Card */}
      <div className="w-full max-w-md glass-card rounded-3xl p-6 sm:p-8 space-y-6 relative z-10 border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
        {/* Holographic Cover Art */}
        <div className="relative group mx-auto w-48 h-48 sm:w-56 sm:h-56">
          <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-75 transition duration-700" />
          <img
            src={track.coverImage}
            alt={track.title}
            className="relative w-full h-full object-cover rounded-2xl border border-white/15 shadow-2xl"
          />
          {/* Pulsing Audio Waveform Indicator */}
          <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 flex items-center gap-1 shadow-lg">
            <span className="w-0.5 bg-orange-400 wave-animation-1 rounded-full" />
            <span className="w-0.5 bg-amber-400 wave-animation-2 rounded-full" />
            <span className="w-0.5 bg-orange-400 wave-animation-3 rounded-full" />
          </div>
        </div>

        {/* Track Title & Artist */}
        <div className="text-center space-y-1.5">
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

        {/* Platform Streaming Buttons */}
        <div className="space-y-2.5 pt-2">
          {platforms.map((p) => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-orange-500/40 transition-all group active:scale-98 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{p.icon}</span>
                <div className="text-left">
                  <p className="text-sm font-bold text-white group-hover:text-orange-300 transition-colors">
                    {p.name}
                  </p>
                  <span className="text-[10px] text-zinc-400">{p.badge}</span>
                </div>
              </div>

              <span className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-black font-extrabold text-xs shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                {p.action}
              </span>
            </a>
          ))}
        </div>

        {/* Follow on Instagram Footer */}
        <div className="pt-2 text-center border-t border-white/[0.08]">
          <a
            href="https://www.instagram.com/v3nja2.0/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-orange-400 transition-colors"
          >
            <span>Follow @v3nja2.0 on Instagram</span>
            <span>↗</span>
          </a>
        </div>
      </div>
    </div>
  );
}
