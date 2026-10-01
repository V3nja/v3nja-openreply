/**
 * V3NJA Instagram Algorithmic Feed & Discovery Engine
 * Powers rich dynamic feeds, stories, reels, audio tracks, and explore recommendations
 */

import { getProxiedImageUrl, type RealtimeInstagramPost, type SuggestedProfileItem } from "./image-proxy-helper";

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
  durationSec: number;
  isOriginalAudio?: boolean;
  usesCount?: number;
}

export interface StorySticker {
  type: "link" | "poll" | "question" | "mention" | "location" | "music" | "countdown";
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

export interface DetailedFeedPost extends RealtimeInstagramPost {
  author: FeedAuthor;
  slides?: Array<{ id: string; mediaUrl: string; mediaType: "IMAGE" | "VIDEO" }>;
  audioTrack?: AudioTrack;
  taggedUsers?: Array<{ username: string; xPercent: number; yPercent: number }>;
  location?: string;
  isLikedByMe?: boolean;
  isSaved?: boolean;
  isSponsored?: boolean;
  sponsorLabel?: string;
  topics?: string[];
}

// ----------------------------------------------------
// DIVERSE CREATOR ROSTER ACROSS MULTIPLE NICHES
// ----------------------------------------------------
export const CREATOR_ROSTER: FeedAuthor[] = [
  {
    id: "v3nja",
    username: "v3nja2.0",
    name: "V3NJA",
    avatarUrl: getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.82787-19/799754867_18082733579698157_1761305583527068474_n.jpg"),
    isVerified: true,
    category: "Singer / Producer",
    location: "Blantyre, Malawi",
    followersCount: 2851,
    followingCount: 142,
    isFollowing: true,
  },
  {
    id: "bilion",
    username: "bilion_vibez",
    name: "BIL!ON VIBEZ",
    avatarUrl: getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.2885-19/471725408_3906345189623833_416055767123729958_n.jpg"),
    isVerified: false,
    category: "Record Label",
    location: "Lilongwe, Malawi",
    followersCount: 65,
    followingCount: 17,
    isFollowing: true,
  },
  {
    id: "hyped",
    username: "thee_hyped_teens",
    name: "DAILY HYPES",
    avatarUrl: getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.2885-19/471725408_3906345189623833_416055767123729958_n.jpg"),
    isVerified: false,
    category: "Musician/band",
    location: "Blantyre, Malawi",
    followersCount: 33,
    followingCount: 99,
    isFollowing: true,
  },
  {
    id: "zaluude",
    username: "zaluude",
    name: "ZALU̶U̶DE⚡️⚡️Newcastle DJ",
    avatarUrl: getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.82787-19/773725399_18622810783020039_7056424547350975810_n.jpg"),
    isVerified: false,
    category: "DJ & Producer",
    location: "Newcastle upon Tyne, UK",
    followersCount: 6612,
    followingCount: 420,
    isFollowing: false,
  },
  {
    id: "takondwa",
    username: "takondwa_noniwa",
    name: "Tee🦋🖤",
    avatarUrl: getProxiedImageUrl("https://scontent-lax3-1.cdninstagram.com/v/t51.2885-19/573323465_1219825463302212_7278921664109726296_n.png"),
    isVerified: false,
    category: "Visual Creator",
    location: "Lilongwe, Malawi",
    followersCount: 1125,
    followingCount: 230,
    isFollowing: true,
  },
  {
    id: "afrobeats",
    username: "afrobeatsworldwide",
    name: "Afrobeats Global",
    avatarUrl: getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.82787-19/799754867_18082733579698157_1761305583527068474_n.jpg"),
    isVerified: true,
    category: "Music Chart / Media",
    location: "Lagos, Nigeria",
    followersCount: 450200,
    followingCount: 380,
    isFollowing: false,
  },
  {
    id: "malawihits",
    username: "malawimusicdotcom",
    name: "Malawi Music Official",
    avatarUrl: getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.2885-19/471725408_3906345189623833_416055767123729958_n.jpg"),
    isVerified: true,
    category: "Music News & Charts",
    location: "Mzuzu, Malawi",
    followersCount: 189400,
    followingCount: 120,
    isFollowing: false,
  },
  {
    id: "vawlyne",
    username: "vaw_lyne",
    name: "Vawlyne",
    avatarUrl: getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.82787-19/799754867_18082733579698157_1761305583527068474_n.jpg"),
    isVerified: false,
    category: "Model & Fashion",
    location: "Blantyre, Malawi",
    followersCount: 8940,
    followingCount: 512,
    isFollowing: false,
  },
  {
    id: "creators",
    username: "creators",
    name: "Instagram for Creators",
    avatarUrl: getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.82787-19/773725399_18622810783020039_7056424547350975810_n.jpg"),
    isVerified: true,
    category: "Community",
    location: "Meta HQ, California",
    followersCount: 12400000,
    followingCount: 89,
    isFollowing: true,
  },
];

// ----------------------------------------------------
// TRENDING AUDIO LIBRARY
// ----------------------------------------------------
export const TRENDING_SOUNDS: AudioTrack[] = [
  {
    id: "snd_wayulomi",
    title: "WAYULOMI",
    artist: "V3NJA",
    albumArtUrl: getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.82787-19/799754867_18082733579698157_1761305583527068474_n.jpg"),
    durationSec: 184,
    isOriginalAudio: true,
    usesCount: 4210,
  },
  {
    id: "snd_njala",
    title: "NJALA (Official Single)",
    artist: "V3NJA",
    albumArtUrl: getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.82787-19/799754867_18082733579698157_1761305583527068474_n.jpg"),
    durationSec: 210,
    isOriginalAudio: true,
    usesCount: 1890,
  },
  {
    id: "snd_zanga",
    title: "ZANGA",
    artist: "V3NJA",
    albumArtUrl: getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.82787-19/799754867_18082733579698157_1761305583527068474_n.jpg"),
    durationSec: 195,
    isOriginalAudio: true,
    usesCount: 3100,
  },
  {
    id: "snd_cityboys",
    title: "City Boys",
    artist: "Burna Boy",
    albumArtUrl: getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.82787-19/773725399_18622810783020039_7056424547350975810_n.jpg"),
    durationSec: 153,
    usesCount: 890000,
  },
  {
    id: "snd_water",
    title: "Water",
    artist: "Tyla",
    albumArtUrl: getProxiedImageUrl("https://scontent-lax3-1.cdninstagram.com/v/t51.2885-19/573323465_1219825463302212_7278921664109726296_n.png"),
    durationSec: 190,
    usesCount: 1450000,
  },
  {
    id: "snd_composure",
    title: "Composure (DJ Remix)",
    artist: "ZALUUDE",
    albumArtUrl: getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.82787-19/773725399_18622810783020039_7056424547350975810_n.jpg"),
    durationSec: 172,
    isOriginalAudio: true,
    usesCount: 12400,
  },
];

// ----------------------------------------------------
// DYNAMIC STORY GENERATOR WITH STICKERS & AUDIO
// ----------------------------------------------------
export function getLiveStoriesTray(): DetailedStoryItem[] {
  return [
    {
      id: "st_v3nja",
      author: CREATOR_ROSTER[0],
      mediaUrl: getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.82787-19/799754867_18082733579698157_1761305583527068474_n.jpg"),
      mediaType: "IMAGE",
      timestamp: "15m",
      caption: "Studio night session 🎹 New drops coming! Stream WAYULOMI on https://v3nja-official.web.app/wayulomi",
      audioTrack: TRENDING_SOUNDS[0],
      stickers: [
        {
          type: "link",
          text: "Stream WAYULOMI 🎵",
          url: "https://v3nja-official.web.app/wayulomi",
          xPercent: 50,
          yPercent: 75,
        },
        {
          type: "poll",
          question: "Which track next?",
          options: ["NJALA", "ZANGA", "MIRAKO"],
          xPercent: 50,
          yPercent: 40,
        },
      ],
      hasSeen: false,
    },
    {
      id: "st_bilion",
      author: CREATOR_ROSTER[1],
      mediaUrl: getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.2885-19/471725408_3906345189623833_416055767123729958_n.jpg"),
      mediaType: "IMAGE",
      timestamp: "1h",
      caption: "BIL!ON VIBEZ roster showcase 🔥 Big shoutout to @v3nja2.0 and the whole team!",
      stickers: [
        {
          type: "mention",
          username: "v3nja2.0",
          xPercent: 50,
          yPercent: 50,
        },
      ],
      hasSeen: false,
    },
    {
      id: "st_hyped",
      author: CREATOR_ROSTER[2],
      mediaUrl: getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.2885-19/471725408_3906345189623833_416055767123729958_n.jpg"),
      mediaType: "IMAGE",
      timestamp: "2h",
      caption: "DAILY HYPES dance contest entries are OPEN 🚀 Send clips in DMs!",
      hasSeen: false,
    },
    {
      id: "st_zaluude",
      author: CREATOR_ROSTER[3],
      mediaUrl: getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.82787-19/773725399_18622810783020039_7056424547350975810_n.jpg"),
      mediaType: "IMAGE",
      timestamp: "4h",
      caption: "Live set from Newcastle club scene 🎧 Mixing Afrobeats with UK Garage!",
      audioTrack: TRENDING_SOUNDS[5],
      hasSeen: false,
    },
    {
      id: "st_takondwa",
      author: CREATOR_ROSTER[4],
      mediaUrl: getProxiedImageUrl("https://scontent-lax3-1.cdninstagram.com/v/t51.2885-19/573323465_1219825463302212_7278921664109726296_n.png"),
      mediaType: "IMAGE",
      timestamp: "6h",
      caption: "Golden hour shoot in Lilongwe ✨ Behind the scenes vibes",
      hasSeen: true,
    },
  ];
}

// ----------------------------------------------------
// DYNAMIC MULTI-CATEGORY FEED POSTS & REELS STREAM
// ----------------------------------------------------
export function getAlgorithmicFeedPosts(): DetailedFeedPost[] {
  return [
    {
      id: "post_v3nja_wayulomi",
      author: CREATOR_ROSTER[0],
      caption: `WAYULOMI is officially OUT NOW worldwide! 🌍🔥\nThank you to every single fan streaming and sharing the sound. Grab official merch and stream links at https://v3nja-official.web.app/wayulomi 🚀\n\n#V3NJA #WAYULOMI #Afrobeats #MalawiMusic #NewMusicFriday`,
      mediaType: "CAROUSEL",
      mediaUrl: getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.82787-19/799754867_18082733579698157_1761305583527068474_n.jpg"),
      thumbnailUrl: getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.82787-19/799754867_18082733579698157_1761305583527068474_n.jpg"),
      slides: [
        {
          id: "slide_1",
          mediaUrl: getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.82787-19/799754867_18082733579698157_1761305583527068474_n.jpg"),
          mediaType: "IMAGE",
        },
        {
          id: "slide_2",
          mediaUrl: getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.2885-19/471725408_3906345189623833_416055767123729958_n.jpg"),
          mediaType: "IMAGE",
        },
      ],
      audioTrack: TRENDING_SOUNDS[0],
      taggedUsers: [
        { username: "bilion_vibez", xPercent: 35, yPercent: 45 },
        { username: "thee_hyped_teens", xPercent: 65, yPercent: 60 },
      ],
      location: "Blantyre, Malawi",
      likeCount: 428,
      commentsCount: 64,
      timestamp: "2 hours ago",
      isLikedByMe: true,
      topics: ["Music", "Afrobeats", "Releases"],
      comments: [
        { id: "c1", username: "bilion_vibez", text: "Proud of this release brother! Massive energy 🔥", time: "1h ago" },
        { id: "c2", username: "thee_hyped_teens", text: "Playing this on repeat all week! 🚀", time: "45m ago" },
        { id: "c3", username: "zaluude", text: "Adding to my weekend club setlist! 🎧", time: "30m ago" },
      ],
    },
    {
      id: "reel_zaluude_live",
      author: CREATOR_ROSTER[3],
      caption: `When the crowd knows every drop 🔊 Mixing Afro-house with UK vibes live in Newcastle! Drop a 🔥 if you want the full mixtape!`,
      mediaType: "VIDEO",
      mediaUrl: getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.82787-19/773725399_18622810783020039_7056424547350975810_n.jpg"),
      thumbnailUrl: getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.82787-19/773725399_18622810783020039_7056424547350975810_n.jpg"),
      audioTrack: TRENDING_SOUNDS[5],
      location: "Newcastle Upon Tyne, UK",
      likeCount: 1840,
      commentsCount: 142,
      viewsCount: 38200,
      timestamp: "5 hours ago",
      isLikedByMe: false,
      topics: ["Reels", "DJ", "Electronic"],
      comments: [
        { id: "c4", username: "v3nja2.0", text: "Insane transition bro! 🔥", time: "4h ago" },
      ],
    },
    {
      id: "post_bilion_vibez",
      author: CREATOR_ROSTER[1],
      caption: `BIL!ON VIBEZ Studio Sessions 🎙️ Working on future anthems with the squad. Independent & Unstoppable.\n\nFor collabs: v3nja.official@gmail.com\n\n#RecordLabel #MusicProduction #IndependentArtist`,
      mediaType: "IMAGE",
      mediaUrl: getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.2885-19/471725408_3906345189623833_416055767123729958_n.jpg"),
      thumbnailUrl: getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.2885-19/471725408_3906345189623833_416055767123729958_n.jpg"),
      taggedUsers: [
        { username: "v3nja2.0", xPercent: 50, yPercent: 50 },
      ],
      location: "Lilongwe, Malawi",
      likeCount: 92,
      commentsCount: 18,
      timestamp: "8 hours ago",
      isLikedByMe: true,
      topics: ["Studio", "Label", "Collab"],
      comments: [
        { id: "c5", username: "takondwa_noniwa", text: "Love the energy here ✨", time: "6h ago" },
      ],
    },
    {
      id: "post_afrobeats_chart",
      author: CREATOR_ROSTER[5],
      caption: `TOP 10 SONGS ON AFROBEATS GLOBAL THIS WEEK 📊🔥\nWho has the hottest record right now? Drop your picks in the comments!\n\n#Afrobeats #GlobalMusic #Charts`,
      mediaType: "CAROUSEL",
      mediaUrl: getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.82787-19/799754867_18082733579698157_1761305583527068474_n.jpg"),
      thumbnailUrl: getProxiedImageUrl("https://scontent-sea5-1.cdninstagram.com/v/t51.82787-19/799754867_18082733579698157_1761305583527068474_n.jpg"),
      audioTrack: TRENDING_SOUNDS[3],
      location: "Lagos, Nigeria",
      likeCount: 14200,
      commentsCount: 890,
      timestamp: "12 hours ago",
      isLikedByMe: false,
      topics: ["Charts", "Afrobeats", "Trends"],
      comments: [],
    },
    {
      id: "reel_takondwa_visuals",
      author: CREATOR_ROSTER[4],
      caption: `Capturing the golden moments in Malawi ✨ Color grading breakdown using natural sunlight.\n\n#Cinematography #Visuals #MalawiCreatives`,
      mediaType: "VIDEO",
      mediaUrl: getProxiedImageUrl("https://scontent-lax3-1.cdninstagram.com/v/t51.2885-19/573323465_1219825463302212_7278921664109726296_n.png"),
      thumbnailUrl: getProxiedImageUrl("https://scontent-lax3-1.cdninstagram.com/v/t51.2885-19/573323465_1219825463302212_7278921664109726296_n.png"),
      audioTrack: TRENDING_SOUNDS[4],
      location: "Lake Malawi, Malawi",
      likeCount: 780,
      commentsCount: 52,
      viewsCount: 14200,
      timestamp: "1 day ago",
      isLikedByMe: true,
      topics: ["Visuals", "Reels", "Lifestyle"],
      comments: [],
    },
  ];
}
