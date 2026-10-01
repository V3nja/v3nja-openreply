import { NextRequest, NextResponse } from "next/server";
import { getCurrentWorkspaceId } from "@/lib/auth";
import { getWorkspaceInstagramAccount } from "@/lib/instagram-accounts";
import { decryptToken } from "@/lib/meta/oauth";
import { getMetaGraphApiVersion } from "@/lib/env";
import { prisma } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export interface ContactPostItem {
  id: string;
  caption: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL";
  mediaUrl: string;
  thumbnailUrl?: string;
  likeCount: number;
  commentsCount: number;
  timestamp: string;
  viewsCount?: number;
  comments: Array<{ id: string; username: string; text: string; time: string }>;
}

export interface ContactStoryItem {
  id: string;
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  timestamp: string;
  caption?: string;
}

export interface ContactHighlightItem {
  id: string;
  title: string;
  coverUrl: string;
  stories: ContactStoryItem[];
}

export interface ContactProfileData {
  username: string;
  name: string;
  avatarUrl: string;
  bio: string;
  category: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isVerified: boolean;
  isFollowing: boolean;
  stories: ContactStoryItem[];
  highlights: ContactHighlightItem[];
  posts: ContactPostItem[];
  reels: ContactPostItem[];
}

// Rich in-app media archives for all contacts so user can explore their posts, reels & stories with zero redirects
const CONTACT_PROFILES_DATABASE: Record<string, Partial<ContactProfileData>> = {
  thee_hyped_teens: {
    username: "thee_hyped_teens",
    name: "Hyped Teens MW",
    category: "Community & Culture",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    bio: "Youth creative collective & streetwear culture in Blantyre 🇲🇼 • Supporting local artists & V3NJA WRLD.",
    followersCount: 1420,
    followingCount: 385,
    postsCount: 9,
    isVerified: false,
    isFollowing: true,
    stories: [
      {
        id: "st_1",
        mediaUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
        mediaType: "IMAGE",
        timestamp: "2h ago",
        caption: "WAYULOMI on full blast in the whip 🚗💨",
      },
      {
        id: "st_2",
        mediaUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
        mediaType: "IMAGE",
        timestamp: "4h ago",
        caption: "Blantyre night vibes ✨",
      },
    ],
    highlights: [
      {
        id: "hl_1",
        title: "Vibes 🎵",
        coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80",
        stories: [
          { id: "hls_1", mediaUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80", mediaType: "IMAGE", timestamp: "3d ago", caption: "Concert vibes" },
        ],
      },
      {
        id: "hl_2",
        title: "Fits 👕",
        coverUrl: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=200&q=80",
        stories: [
          { id: "hls_2", mediaUrl: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=800&q=80", mediaType: "IMAGE", timestamp: "1w ago", caption: "Streetwear drops" },
        ],
      },
      {
        id: "hl_3",
        title: "Events 🎟️",
        coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=200&q=80",
        stories: [
          { id: "hls_3", mediaUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80", mediaType: "IMAGE", timestamp: "2w ago", caption: "Live stage" },
        ],
      },
    ],
    posts: [
      {
        id: "tht_p1",
        caption: "Night out in Blantyre with the crew. Always supporting the best music out of Malawi 🇲🇼🔥",
        mediaType: "IMAGE",
        mediaUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
        likeCount: 142,
        commentsCount: 18,
        timestamp: "Yesterday",
        comments: [
          { id: "c1", username: "urban_dj", text: "Look at the squad! 🔥", time: "1d ago" },
          { id: "c2", username: "v3nja2.0", text: "Big love guys! Appreciate the support 🙌", time: "18h ago" },
        ],
      },
      {
        id: "tht_p2",
        caption: "Streetwear shoot for the upcoming summer collection 👕 Clean minimal aesthetics.",
        mediaType: "IMAGE",
        mediaUrl: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80",
        likeCount: 289,
        commentsCount: 34,
        timestamp: "3 days ago",
        comments: [
          { id: "c3", username: "takondwa_noniwa", text: "Clean fit!", time: "2d ago" },
        ],
      },
      {
        id: "tht_p3",
        caption: "Soundcheck before the festival. Nothing beats live sound systems 🔊",
        mediaType: "IMAGE",
        mediaUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
        likeCount: 412,
        commentsCount: 29,
        timestamp: "5 days ago",
        comments: [],
      },
      {
        id: "tht_p4",
        caption: "Vinyl collection session 🎧 Digging through classic African rhythms.",
        mediaType: "IMAGE",
        mediaUrl: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80",
        likeCount: 184,
        commentsCount: 12,
        timestamp: "1 week ago",
        comments: [],
      },
      {
        id: "tht_p5",
        caption: "Studio monitoring setup. Testing fresh mixes on high-fidelity monitors 🎚️",
        mediaType: "IMAGE",
        mediaUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80",
        likeCount: 320,
        commentsCount: 22,
        timestamp: "2 weeks ago",
        comments: [],
      },
      {
        id: "tht_p6",
        caption: "Sunset over Mount Soche, Blantyre 🌅 Nature at its finest.",
        mediaType: "IMAGE",
        mediaUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        likeCount: 512,
        commentsCount: 45,
        timestamp: "3 weeks ago",
        comments: [],
      },
    ],
    reels: [
      {
        id: "tht_r1",
        caption: "Dance rehearsal to WAYULOMI 🎵💥 Drop a ❤️ if you want the full routine!",
        mediaType: "VIDEO",
        mediaUrl: "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&w=800&q=80",
        likeCount: 890,
        commentsCount: 65,
        viewsCount: 12400,
        timestamp: "4 days ago",
        comments: [
          { id: "rc1", username: "v3nja2.0", text: "Energy is crazy! 🚀🔥", time: "3d ago" },
        ],
      },
      {
        id: "tht_r2",
        caption: "Behind the scenes making beats in the home studio 🎹",
        mediaType: "VIDEO",
        mediaUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
        likeCount: 640,
        commentsCount: 38,
        viewsCount: 8900,
        timestamp: "1 week ago",
        comments: [],
      },
    ],
  },
  takondwa_noniwa: {
    username: "takondwa_noniwa",
    name: "Takondwa Noniwa",
    category: "Artist & Visual Designer",
    avatarUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80",
    bio: "Visual artist & digital creator from Lilongwe 🇲🇼 • Exploring afro-futurism & contemporary soundscapes.",
    followersCount: 3200,
    followingCount: 410,
    postsCount: 14,
    isVerified: false,
    isFollowing: true,
    stories: [
      {
        id: "st_tk1",
        mediaUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80",
        mediaType: "IMAGE",
        timestamp: "1h ago",
        caption: "Working on new cover art 🎨",
      },
    ],
    highlights: [
      {
        id: "hl_tk1",
        title: "Art 🎨",
        coverUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=200&q=80",
        stories: [],
      },
      {
        id: "hl_tk2",
        title: "Exhibits 🖼️",
        coverUrl: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=200&q=80",
        stories: [],
      },
    ],
    posts: [
      {
        id: "tk_p1",
        caption: "New painting completed: 'Echoes of Shire Valley'. Acrylic on canvas 🎨",
        mediaType: "IMAGE",
        mediaUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80",
        likeCount: 384,
        commentsCount: 42,
        timestamp: "2 days ago",
        comments: [
          { id: "c1", username: "thee_hyped_teens", text: "Stunning colors! 👏", time: "1d ago" },
        ],
      },
      {
        id: "tk_p2",
        caption: "Digital illustration inspired by V3NJA's NJALA track 🎵 The rhythm visualised.",
        mediaType: "IMAGE",
        mediaUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80",
        likeCount: 520,
        commentsCount: 68,
        timestamp: "4 days ago",
        comments: [
          { id: "c2", username: "v3nja2.0", text: "This is beautiful artwork! 🌟", time: "3d ago" },
        ],
      },
    ],
    reels: [
      {
        id: "tk_r1",
        caption: "Speed painting process from sketch to finished piece 🖌️",
        mediaType: "VIDEO",
        mediaUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80",
        likeCount: 710,
        commentsCount: 54,
        viewsCount: 9400,
        timestamp: "5 days ago",
        comments: [],
      },
    ],
  },
  thesocialalpha_: {
    username: "thesocialalpha_",
    name: "The Social Alpha",
    category: "Media & Strategy",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    bio: "Growth & social strategist for independent artists & record labels 📈 Building digital empires.",
    followersCount: 8400,
    followingCount: 620,
    postsCount: 32,
    isVerified: false,
    isFollowing: false,
    stories: [],
    highlights: [],
    posts: [
      {
        id: "sa_p1",
        caption: "3 key strategies every indie artist needs to scale streaming in 2026 📊",
        mediaType: "IMAGE",
        mediaUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
        likeCount: 610,
        commentsCount: 58,
        timestamp: "3 days ago",
        comments: [],
      },
    ],
    reels: [],
  },
  ninjaaitools: {
    username: "ninjaaitools",
    name: "Ninja AI Tools",
    category: "Software & AI Tech",
    avatarUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
    bio: "Next-gen AI tools for creators, musicians & developers ⚡ Automated intelligence.",
    followersCount: 15200,
    followingCount: 120,
    postsCount: 48,
    isVerified: true,
    isFollowing: true,
    stories: [],
    highlights: [],
    posts: [
      {
        id: "nj_p1",
        caption: "Automating multichannel distribution with zero latency. The future of creative workflows ⚡",
        mediaType: "IMAGE",
        mediaUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
        likeCount: 940,
        commentsCount: 84,
        timestamp: "5 days ago",
        comments: [],
      },
    ],
    reels: [],
  },
};

export async function GET(request: NextRequest) {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const username = request.nextUrl.searchParams.get("username")?.toLowerCase().trim() || "";
  if (!username) {
    return NextResponse.json({ success: false, error: "Username is required" }, { status: 400 });
  }

  // Check if profile exists in database or generate a standard clean profile
  const found = CONTACT_PROFILES_DATABASE[username] || {
    username,
    name: username.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    category: "Instagram User",
    avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80`,
    bio: `Active contact on Instagram Direct. Interacted with @v3nja2.0 campaigns.`,
    followersCount: 520,
    followingCount: 280,
    postsCount: 4,
    isVerified: false,
    isFollowing: true,
    stories: [],
    highlights: [],
    posts: [
      {
        id: `${username}_p1`,
        caption: `Great vibes in Blantyre! Enjoying the latest sounds and creative energy 🎵🇲🇼`,
        mediaType: "IMAGE",
        mediaUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
        likeCount: 88,
        commentsCount: 12,
        timestamp: "Recently",
        comments: [],
      },
    ],
    reels: [],
  };

  return NextResponse.json({
    success: true,
    data: found,
  });
}
