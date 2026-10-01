/**
 * Client-safe helper and types for Instagram and Meta CDN media
 * Bypasses CORS and referer blocking without bundling Node server modules.
 */

export interface RealtimeInstagramPost {
  id: string;
  caption: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL";
  mediaUrl: string;
  thumbnailUrl: string;
  videoUrl?: string;
  likeCount: number;
  commentsCount: number;
  viewsCount?: number;
  timestamp: string;
  permalink?: string;
  comments?: Array<{
    id: string;
    username: string;
    text: string;
    time: string;
  }>;
}

export interface RealtimeInstagramStoryItem {
  id: string;
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  timestamp: string;
  caption?: string;
}

export interface RealtimeInstagramHighlightItem {
  id: string;
  title: string;
  coverUrl: string;
  stories?: RealtimeInstagramStoryItem[];
}

export interface SuggestedProfileItem {
  username: string;
  name: string;
  avatarUrl: string;
  isVerified?: boolean;
  category?: string;
  mutualFollowers?: string[];
  followersCount?: number;
}

export interface RealtimeInstagramProfile {
  id: string;
  username: string;
  name: string;
  bio: string;
  avatarUrl: string;
  isVerified: boolean;
  isPrivate: boolean;
  isFollowing?: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  category?: string;
  externalUrl?: string;
  stories?: RealtimeInstagramStoryItem[];
  highlights?: RealtimeInstagramHighlightItem[];
  posts?: RealtimeInstagramPost[];
  reels?: RealtimeInstagramPost[];
  suggestedProfiles?: SuggestedProfileItem[];
}

export function getProxiedImageUrl(rawUrl?: string | null): string {
  if (!rawUrl || typeof rawUrl !== "string") return "";
  if (
    rawUrl.startsWith("/api/image-proxy") ||
    rawUrl.startsWith("data:") ||
    rawUrl.startsWith("blob:")
  ) {
    return rawUrl;
  }
  if (
    rawUrl.includes("cdninstagram.com") ||
    rawUrl.includes("fbcdn.net") ||
    rawUrl.includes("fbsbx.com") ||
    rawUrl.includes("instagram.") ||
    rawUrl.includes("lookaside.fbsbx.com")
  ) {
    return `/api/image-proxy?url=${encodeURIComponent(rawUrl)}`;
  }
  return rawUrl;
}
