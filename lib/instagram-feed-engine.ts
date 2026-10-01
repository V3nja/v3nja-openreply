/**
 * V3NJA Universal Instagram Algorithmic Feed, Discovery & Social Engine
 * Exact authentic Meta Instagram dataset replicating live Feed, Explore, Reels, Stories,
 * and Notifications matching real Instagram web client fidelity.
 */

export interface FeedAuthor {
  id: string;
  username: string;
  name: string;
  avatarUrl: string;
  isVerified: boolean;
  category: string;
  location?: string;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
}

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  albumArtUrl: string;
  audioUrl?: string;
  durationSec?: number;
  isOriginalAudio?: boolean;
  usesCount?: number;
}

export interface StorySticker {
  type: "link" | "poll" | "question" | "mention" | "location" | "music";
  text?: string;
  url?: string;
  question?: string;
  options?: string[];
  username?: string;
  locationName?: string;
  audioTrack?: AudioTrack;
  xPercent: number;
  yPercent: number;
}

export interface DetailedStoryItem {
  id: string;
  author: FeedAuthor;
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  timestamp: string;
  caption?: string;
  audioTrack?: AudioTrack;
  stickers?: StorySticker[];
  hasSeen?: boolean;
}

export interface DetailedFeedPost {
  id: string;
  author: FeedAuthor;
  caption: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL";
  mediaUrl: string;
  thumbnailUrl?: string;
  slides?: Array<{ id: string; mediaUrl: string; mediaType: "IMAGE" | "VIDEO"; textOverlay?: string }>;
  audioTrack?: AudioTrack;
  taggedUsers?: Array<{ username: string; xPercent: number; yPercent: number }>;
  location?: string;
  likeCount: number;
  commentsCount: number;
  sharesCount?: number;
  timestamp: string;
  isLikedByMe?: boolean;
  isSaved?: boolean;
  likedByPreview?: string;
  comments?: Array<{ id: string; username: string; text: string; time: string; avatarUrl?: string }>;
}

export interface ExploreTileItem {
  id: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL";
  mediaUrl: string;
  thumbnailUrl: string;
  author: FeedAuthor;
  caption: string;
  likeCount: string;
  commentsCount: string;
  isFeaturedSpan?: boolean;
  badge?: "reel" | "carousel" | "photo";
  topic?: string;
}

export interface NotificationItem {
  id: string;
  type: "reply" | "comment" | "like" | "follow";
  timeGroup: "New" | "Today" | "This week" | "This month";
  actorUsername: string;
  actorAvatarUrl: string;
  text: string;
  timestamp: string;
  targetThumbnailUrl?: string;
  isUnread?: boolean;
}

// =========================================================================
// HIGH RESOLUTION AVATAR UTILITIES
// =========================================================================
export function getAvatarSvg(initials: string, bg1 = "#833ab4", bg2 = "#fd1d1d", bg3 = "#fcb045"): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg1}"/>
        <stop offset="50%" stop-color="${bg2}"/>
        <stop offset="100%" stop-color="${bg3}"/>
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="50" fill="url(#grad)"/>
    <text x="50" y="58" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="34" font-weight="800" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// ----------------------------------------------------
// DIVERSE CREATOR ROSTER ACROSS MULTIPLE NICHES
// ----------------------------------------------------
export const CREATOR_ROSTER: FeedAuthor[] = [
  {
    id: "v3nja",
    username: "v3nja2.0",
    name: "V3NJA",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    isVerified: true,
    category: "Singer / Producer",
    location: "Blantyre, Malawi",
    followersCount: 2851,
    followingCount: 142,
    isFollowing: true,
  },
  {
    id: "finchbergling",
    username: "finchbergling",
    name: "Finch Bergling",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    isVerified: true,
    category: "Music Marketing",
    location: "Stockholm, Sweden",
    followersCount: 84200,
    followingCount: 512,
    isFollowing: true,
  },
  {
    id: "everythingmelda",
    username: "everythingmelda_",
    name: "Melda ⚡",
    avatarUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&auto=format&fit=crop&q=80",
    isVerified: false,
    category: "Digital Creator",
    location: "London, UK",
    followersCount: 312000,
    followingCount: 420,
    isFollowing: false,
  },
  {
    id: "rewardbeatz",
    username: "rewardbeatz",
    name: "Reward Beatz 🎹",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    isVerified: true,
    category: "Music Producer",
    location: "Lagos, Nigeria",
    followersCount: 198000,
    followingCount: 890,
    isFollowing: true,
  },
  {
    id: "skand_ai",
    username: "skand.ai",
    name: "Skand AI Video",
    avatarUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
    isVerified: true,
    category: "AI & Tech",
    location: "San Francisco, CA",
    followersCount: 425000,
    followingCount: 65,
    isFollowing: true,
  },
  {
    id: "tapewarp_ai",
    username: "tapewarp.ai",
    name: "Tapewarp AI",
    avatarUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=200&auto=format&fit=crop&q=80",
    isVerified: true,
    category: "AI Influencers",
    location: "Berlin, Germany",
    followersCount: 142000,
    followingCount: 110,
    isFollowing: false,
  },
  {
    id: "biancaxher",
    username: "biancaxher",
    name: "Bianca",
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80",
    isVerified: false,
    category: "Lifestyle & Cars",
    location: "Miami, Florida",
    followersCount: 67200,
    followingCount: 340,
    isFollowing: false,
  },
  {
    id: "becgorton",
    username: "becgorton_",
    name: "Bec Gorton",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    isVerified: true,
    category: "Fashion Model",
    location: "Gold Coast, Australia",
    followersCount: 221000,
    followingCount: 610,
    isFollowing: false,
  },
  {
    id: "janemena",
    username: "janemena",
    name: "Jane Mena",
    avatarUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&auto=format&fit=crop&q=80",
    isVerified: true,
    category: "Dancer & Entrepreneur",
    location: "Delta State, Nigeria",
    followersCount: 4300000,
    followingCount: 1200,
    isFollowing: true,
  },
  {
    id: "yo_animations",
    username: "yo_animations",
    name: "Yo Animation Studio",
    avatarUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&auto=format&fit=crop&q=80",
    isVerified: true,
    category: "Animation & Comedy",
    location: "Accra, Ghana",
    followersCount: 890000,
    followingCount: 95,
    isFollowing: false,
  },
];

// ----------------------------------------------------
// TRENDING SOUNDS
// ----------------------------------------------------
export const TRENDING_SOUNDS: AudioTrack[] = [
  {
    id: "snd_wayulomi",
    title: "WAYULOMI (Official)",
    artist: "V3NJA",
    albumArtUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80",
    isOriginalAudio: true,
    durationSec: 184,
    usesCount: 14200,
  },
  {
    id: "snd_valiant",
    title: "summer • Valiant, RK Trap - Bimmer",
    artist: "Valiant",
    albumArtUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=150&auto=format&fit=crop&q=80",
    isOriginalAudio: false,
    durationSec: 156,
    usesCount: 245000,
  },
  {
    id: "snd_banga",
    title: "Banga (Producer Beat)",
    artist: "rewardbeatz",
    albumArtUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&auto=format&fit=crop&q=80",
    isOriginalAudio: true,
    durationSec: 140,
    usesCount: 89400,
  },
  {
    id: "snd_vidaloca",
    title: "Vida Loca (Speed Up)",
    artist: "Ramzuto",
    albumArtUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&auto=format&fit=crop&q=80",
    isOriginalAudio: false,
    durationSec: 120,
    usesCount: 512000,
  },
];

// ----------------------------------------------------
// STORIES TRAY (Matching screenshot 4)
// ----------------------------------------------------
export function getLiveStoriesTray(): DetailedStoryItem[] {
  return [
    {
      id: "st_kabeer",
      author: {
        id: "kabeer_2pac",
        username: "kabeer_2pac",
        name: "Kabeer",
        avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
        isVerified: false,
        category: "Creator",
        followersCount: 1420,
        followingCount: 300,
      },
      mediaUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
      mediaType: "IMAGE",
      timestamp: "2h",
      caption: "Vibes in the city today 🏙️✨",
      hasSeen: false,
    },
    {
      id: "st_gamahfila",
      author: {
        id: "gamahfila",
        username: "gamahfila",
        name: "Gamah Fila",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        isVerified: false,
        category: "Artist",
        followersCount: 3400,
        followingCount: 520,
      },
      mediaUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=80",
      mediaType: "IMAGE",
      timestamp: "4h",
      caption: "Studio night session 🎹🔊",
      hasSeen: false,
    },
    {
      id: "st_katinkache",
      author: {
        id: "katinkache",
        username: "katinkache01",
        name: "Katinkache",
        avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80",
        isVerified: false,
        category: "Fashion",
        followersCount: 2890,
        followingCount: 410,
      },
      mediaUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80",
      mediaType: "IMAGE",
      timestamp: "5h",
      caption: "Fresh fit check 🔥",
      hasSeen: false,
    },
    {
      id: "st_slaksum",
      author: {
        id: "slaksum",
        username: "slaksum",
        name: "Slaksum",
        avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
        isVerified: false,
        category: "Music Producer",
        followersCount: 5100,
        followingCount: 600,
      },
      mediaUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80",
      mediaType: "IMAGE",
      timestamp: "7h",
      caption: "New sound dropping this Friday! ⚡",
      stickers: [
        {
          type: "link",
          text: "Stream on Web App 🎵",
          url: "https://v3nja-official.web.app/wayulomi",
          xPercent: 50,
          yPercent: 70,
        },
      ],
      hasSeen: false,
    },
    {
      id: "st_cristo",
      author: {
        id: "cristo_linga",
        username: "cristo_linga",
        name: "Cristo Linga",
        avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80",
        isVerified: false,
        category: "Visual Creator",
        followersCount: 1800,
        followingCount: 240,
      },
      mediaUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
      mediaType: "IMAGE",
      timestamp: "9h",
      caption: "Visuals cooked in the lab 🔬",
      hasSeen: true,
    },
    {
      id: "st_sheikamee",
      author: {
        id: "sheikameed",
        username: "sheikamee...",
        name: "Sheikameed",
        avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
        isVerified: false,
        category: "Tech",
        followersCount: 4200,
        followingCount: 390,
      },
      mediaUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
      mediaType: "IMAGE",
      timestamp: "12h",
      caption: "Code & sound syncing 🚀",
      hasSeen: true,
    },
  ];
}

// ----------------------------------------------------
// SUGGESTED CREATORS FOR YOU (Matching screenshot 4)
// ----------------------------------------------------
export interface SuggestedSidebarProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  reason: string;
  isFollowing?: boolean;
}

export const SUGGESTED_SIDEBAR_PROFILES: SuggestedSidebarProfile[] = [
  {
    id: "sug_1",
    username: "miss_cheery_mw",
    displayName: "Miss~Cheery♡!!",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    reason: "Followed by takondwa_noniwa",
  },
  {
    id: "sug_2",
    username: "mimiii_265",
    displayName: "Mimiii 📌",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    reason: "Suggested for you",
  },
  {
    id: "sug_3",
    username: "mezero_official",
    displayName: "Mezero",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
    reason: "Followed by sirencigaro + 1 more",
  },
  {
    id: "sug_4",
    username: "wongie_designs",
    displayName: "wongie",
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80",
    reason: "Followed by takondwa_noniwa",
  },
  {
    id: "sug_5",
    username: "prisca_bande",
    displayName: "Prisca Bande",
    avatarUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&auto=format&fit=crop&q=80",
    reason: "Suggested for you",
  },
];

// ----------------------------------------------------
// MAIN FEED POSTS (Matching screenshots 1, 2, 3, 4)
// ----------------------------------------------------
export function getAlgorithmicFeedPosts(): DetailedFeedPost[] {
  return [
    {
      id: "post_finch",
      author: CREATOR_ROSTER[1], // Finch Bergling
      caption: `Comment "TOOLS" and I will DM you a link to access the full list of free tools ✨`,
      mediaType: "CAROUSEL",
      mediaUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=900&auto=format&fit=crop&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=900&auto=format&fit=crop&q=80",
      slides: [
        {
          id: "sl1",
          mediaUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=900&auto=format&fit=crop&q=80",
          mediaType: "IMAGE",
          textOverlay: "Here are 6 free music marketing tools that can save you hours of work every month",
        },
        {
          id: "sl2",
          mediaUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=900&auto=format&fit=crop&q=80",
          mediaType: "IMAGE",
          textOverlay: "Tool #1: V3NJA OpenReply DM Automation for Instagram & Meta",
        },
        {
          id: "sl3",
          mediaUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=900&auto=format&fit=crop&q=80",
          mediaType: "IMAGE",
          textOverlay: "Tool #2: Smart Link Routing Engine for Spotify & Apple Music",
        },
      ],
      audioTrack: {
        id: "snd_finch",
        title: "Original Audio",
        artist: "finchbergling",
        albumArtUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      },
      likeCount: 212,
      commentsCount: 232,
      sharesCount: 7,
      timestamp: "1d",
      likedByPreview: "thee_hyped_teens and others",
      comments: [
        { id: "c1", username: "takondwa_noniwa", text: "TOOLS please 🔥", time: "22h" },
        { id: "c2", username: "bilion_vibez", text: "TOOLS", time: "18h" },
        { id: "c3", username: "v3nja2.0", text: "Sent the official link straight to your DMs!", time: "15h" },
      ],
    },
    {
      id: "post_melda",
      author: CREATOR_ROSTER[2], // Melda
      caption: `The full list of free tools ✨ Save this before it gets taken down!`,
      mediaType: "CAROUSEL",
      mediaUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=80",
      slides: [
        {
          id: "sl_m1",
          mediaUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=80",
          mediaType: "IMAGE",
          textOverlay: "IF YOU STILL CAN'T MAKE MONEY AFTER THIS, YOU'VE GOT BIGGER PROBLEMS.",
        },
        {
          id: "sl_m2",
          mediaUrl: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=900&auto=format&fit=crop&q=80",
          mediaType: "IMAGE",
          textOverlay: "Automate your funnel and deliver smart links directly inside Instagram Direct.",
        },
      ],
      likeCount: 105900,
      commentsCount: 5800,
      sharesCount: 11800,
      timestamp: "6d",
      likedByPreview: "v3nja2.0 and 105,899 others",
      comments: [
        { id: "cm1", username: "adamtriestech", text: "Super accurate! The automation workflow works wonders.", time: "4d" },
        { id: "cm2", username: "thee_hyped_teens", text: "🔥🔥🔥", time: "2d" },
      ],
    },
    {
      id: "post_reward",
      author: CREATOR_ROSTER[3], // rewardbeatz
      caption: `Who's the Producer?? 🕹️ Drop your thoughts in the comments!`,
      mediaType: "IMAGE",
      mediaUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=900&auto=format&fit=crop&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=900&auto=format&fit=crop&q=80",
      audioTrack: TRENDING_SOUNDS[2], // Banga
      location: "Banga Studio, Lagos",
      likeCount: 16,
      commentsCount: 16,
      sharesCount: 1,
      timestamp: "6d",
      likedByPreview: "iamdjgmoney and others",
      comments: [
        { id: "cr1", username: "iamdjgmoney", text: "Crazy bounce on this one bro! 🚀", time: "5d" },
        { id: "cr2", username: "v3nja2.0", text: "Need this stem pack!", time: "3d" },
      ],
    },
    {
      id: "post_skand",
      author: CREATOR_ROSTER[4], // Skand AI
      caption: `Unlimited AI Video Generation with SEEDANCE 2.0, VEO, and KLING! Comment "AI" to get instant free access 😱`,
      mediaType: "VIDEO",
      mediaUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&auto=format&fit=crop&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&auto=format&fit=crop&q=80",
      audioTrack: TRENDING_SOUNDS[3], // Vida Loca
      likeCount: 4600,
      commentsCount: 50,
      sharesCount: 820,
      timestamp: "5w",
      likedByPreview: "v3nja2.0 and 4,599 others",
      comments: [
        { id: "cs1", username: "ninjaaitools", text: "AI", time: "4w" },
        { id: "cs2", username: "kennethchiba", text: "Does it support text to video 60fps?", time: "3w" },
      ],
    },
    {
      id: "post_tapewarp",
      author: CREATOR_ROSTER[5], // Tapewarp AI
      caption: `This AI influencer can film basically anything I ask her to... full breakdown on my profile link!`,
      mediaType: "VIDEO",
      mediaUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=900&auto=format&fit=crop&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=900&auto=format&fit=crop&q=80",
      likeCount: 46,
      commentsCount: 36,
      sharesCount: 1,
      timestamp: "1w",
      comments: [
        { id: "ct1", username: "theartistjeremiahjackson", text: "Prompt please?", time: "5d" },
      ],
    },
  ];
}

// ----------------------------------------------------
// EXPLORE TILES DATA (Matching screenshots 7 & 8)
// ----------------------------------------------------
export function getExploreGridItems(): ExploreTileItem[] {
  return [
    {
      id: "exp_1",
      mediaType: "VIDEO",
      badge: "reel",
      mediaUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
      author: CREATOR_ROSTER[4],
      caption: "GPT-6 Astra vs Claude Opus 5.5: Benchmarks Revealed",
      likeCount: "42.8K",
      commentsCount: "1.2K",
      topic: "Tech",
    },
    {
      id: "exp_2",
      mediaType: "VIDEO",
      badge: "reel",
      mediaUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
      author: CREATOR_ROSTER[1],
      caption: "A 40-year-old Kenyan man claims to be Elon Musk's eldest son 😂",
      likeCount: "128K",
      commentsCount: "4.5K",
      topic: "Humor",
    },
    {
      id: "exp_3",
      mediaType: "VIDEO",
      badge: "reel",
      mediaUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
      author: CREATOR_ROSTER[3],
      caption: "Kendrick Lamar car studio freestyle session",
      likeCount: "340K",
      commentsCount: "12.1K",
      topic: "Music",
    },
    {
      id: "exp_4",
      mediaType: "VIDEO",
      badge: "reel",
      mediaUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800&auto=format&fit=crop&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800&auto=format&fit=crop&q=80",
      author: CREATOR_ROSTER[0],
      caption: "15-second creative video workflow from bedroom to Spotify charts",
      likeCount: "89.2K",
      commentsCount: "840",
      topic: "Creative",
    },
    {
      id: "exp_5",
      mediaType: "VIDEO",
      badge: "reel",
      mediaUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80",
      author: CREATOR_ROSTER[5],
      caption: "When psycho meets psycho 💀",
      likeCount: "215K",
      commentsCount: "3.2K",
      topic: "Humor",
    },
    {
      id: "exp_6",
      mediaType: "VIDEO",
      badge: "reel",
      mediaUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
      author: CREATOR_ROSTER[9],
      caption: "3D Doberman & Pitbull singers in vocal booth recording vocals",
      likeCount: "410K",
      commentsCount: "9.8K",
      topic: "3D Art",
    },
    {
      id: "exp_7",
      mediaType: "VIDEO",
      badge: "reel",
      mediaUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
      author: CREATOR_ROSTER[6],
      caption: "Anok Yai high-fashion model moment in yellow jersey",
      likeCount: "580K",
      commentsCount: "14.3K",
      topic: "Fashion",
    },
    {
      id: "exp_8",
      mediaType: "VIDEO",
      badge: "reel",
      mediaUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
      author: CREATOR_ROSTER[3],
      caption: "Wizkid live performance in sold-out arena",
      likeCount: "920K",
      commentsCount: "25.6K",
      topic: "Music",
    },
    {
      id: "exp_9",
      mediaType: "VIDEO",
      badge: "reel",
      mediaUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
      author: CREATOR_ROSTER[8],
      caption: "African village palm kernel pomade heritage ritual",
      likeCount: "132K",
      commentsCount: "346",
      topic: "Culture",
    },
    {
      id: "exp_10",
      mediaType: "VIDEO",
      badge: "reel",
      mediaUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=80",
      author: CREATOR_ROSTER[9],
      caption: "POV: trying to pray when you are sleepy 😂",
      likeCount: "152K",
      commentsCount: "4,007",
      topic: "Animation",
    },
    {
      id: "exp_11",
      mediaType: "IMAGE",
      badge: "photo",
      mediaUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80",
      author: CREATOR_ROSTER[7],
      caption: "Gold Coast sunset street aesthetic 🤎",
      likeCount: "22.1K",
      commentsCount: "641",
      topic: "Lifestyle",
    },
    {
      id: "exp_12",
      mediaType: "VIDEO",
      badge: "reel",
      mediaUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80",
      author: CREATOR_ROSTER[6],
      caption: "She love a bimmer with speed ❤️🔥",
      likeCount: "18.8K",
      commentsCount: "501",
      topic: "Cars",
    },
  ];
}

// ----------------------------------------------------
// NOTIFICATIONS STREAM (Matching screenshot 9)
// ----------------------------------------------------
export const LIVE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_1",
    type: "reply",
    timeGroup: "New",
    actorUsername: "kennethchiba",
    actorAvatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    text: "kennethchibakennethchiba replied to your comment on kennethchiba's post: Ty, check ur dm requests",
    timestamp: "6m",
    targetThumbnailUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80",
    isUnread: true,
  },
  {
    id: "notif_2",
    type: "reply",
    timeGroup: "New",
    actorUsername: "adamtriestech",
    actorAvatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80",
    text: "adamtriestechadamtriestech replied to your comment on adamtriestech's post: Sent you a message! Check it out!",
    timestamp: "15m",
    targetThumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
    isUnread: true,
  },
  {
    id: "notif_3",
    type: "comment",
    timeGroup: "New",
    actorUsername: "thee_hyped_teens",
    actorAvatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    text: "thee_hyped_teens commented: 😍❤️",
    timestamp: "5h",
    targetThumbnailUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&auto=format&fit=crop&q=80",
    isUnread: false,
  },
  {
    id: "notif_4",
    type: "comment",
    timeGroup: "Today",
    actorUsername: "thee_hyped_teens",
    actorAvatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    text: "thee_hyped_teens commented: 🔥🔥🔥",
    timestamp: "8h",
    targetThumbnailUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&auto=format&fit=crop&q=80",
    isUnread: false,
  },
  {
    id: "notif_5",
    type: "like",
    timeGroup: "Today",
    actorUsername: "theartistjeremiahjackson",
    actorAvatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    text: "theartistjeremiahjackson and official_ebelin liked your comment: Your automation has stopped working",
    timestamp: "11h",
    targetThumbnailUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=100&auto=format&fit=crop&q=80",
    isUnread: false,
  },
  {
    id: "notif_6",
    type: "like",
    timeGroup: "This week",
    actorUsername: "ashy_chawaz01",
    actorAvatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&auto=format&fit=crop&q=80",
    text: "ashy_chawaz01, they_luvvmaya1 and others liked your reel",
    timestamp: "2d",
    targetThumbnailUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=100&auto=format&fit=crop&q=80",
    isUnread: false,
  },
  {
    id: "notif_7",
    type: "like",
    timeGroup: "This week",
    actorUsername: "whatsonjupit.a",
    actorAvatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80",
    text: "whatsonjupit.a and gawotede liked your comment: Let's go 🔥🔥🔥",
    timestamp: "6d",
    targetThumbnailUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=100&auto=format&fit=crop&q=80",
    isUnread: false,
  },
  {
    id: "notif_8",
    type: "reply",
    timeGroup: "This month",
    actorUsername: "ninjaaitools",
    actorAvatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80",
    text: "ninjaaitoolsninjaaitools replied to your comment on ninjaaitools's post: Hope you find it helpful.",
    timestamp: "Sep 24",
    targetThumbnailUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=100&auto=format&fit=crop&q=80",
    isUnread: false,
  },
];
