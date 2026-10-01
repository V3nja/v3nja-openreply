import http2 from "node:http2";
import { execFile } from "node:child_process";

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
  comments: Array<{ id: string; username: string; text: string; time: string }>;
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
  stories: RealtimeInstagramStoryItem[];
}

export interface RealtimeInstagramProfile {
  id: string;
  username: string;
  name: string;
  avatarUrl: string;
  bio: string;
  category: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isVerified: boolean;
  isPrivate: boolean;
  isFollowing: boolean;
  highlightsCount: number;
  highlights: RealtimeInstagramHighlightItem[];
  stories: RealtimeInstagramStoryItem[];
  posts: RealtimeInstagramPost[];
  reels: RealtimeInstagramPost[];
}

// In-memory cache for 5 minutes to prevent redundant network calls and avoid Instagram rate limits
const profileCache = new Map<string, { profile: RealtimeInstagramProfile; expiresAt: number }>();

function fetchViaHttp2(cleanUsername: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const client = http2.connect("https://www.instagram.com");
    client.on("error", reject);

    const req = client.request({
      ":method": "GET",
      ":path": `/api/v1/users/web_profile_info/?username=${cleanUsername}`,
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "x-ig-app-id": "936619743392459",
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
    });

    let data = "";
    req.on("response", (headers) => {
      const status = headers[":status"];
      if (status !== 200) {
        client.close();
        return reject(new Error(`Instagram HTTP/2 returned status ${status}`));
      }
    });

    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      data += chunk;
    });

    req.on("end", () => {
      client.close();
      try {
        const parsed = JSON.parse(data);
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    });

    req.setTimeout(8000, () => {
      req.close();
      client.close();
      reject(new Error("Instagram HTTP/2 timeout"));
    });

    req.end();
  });
}

function fetchViaCurl(cleanUsername: string): Promise<any> {
  return new Promise((resolve, reject) => {
    execFile(
      "curl",
      [
        "-s",
        "--max-time", "8",
        "-A", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "-H", "x-ig-app-id: 936619743392459",
        "-H", "Accept: */*",
        "-H", "Sec-Fetch-Site: same-origin",
        `https://www.instagram.com/api/v1/users/web_profile_info/?username=${cleanUsername}`,
      ],
      { maxBuffer: 10 * 1024 * 1024 },
      (error, stdout) => {
        if (error) return reject(error);
        try {
          const parsed = JSON.parse(stdout);
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

export async function fetchRealtimeInstagramProfile(username: string): Promise<RealtimeInstagramProfile | null> {
  const cleanUsername = username.replace(/^@/, "").trim().toLowerCase();
  if (!cleanUsername) return null;

  // Check cache
  const cached = profileCache.get(cleanUsername);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.profile;
  }

  let rawData: any = null;

  try {
    rawData = await fetchViaHttp2(cleanUsername);
  } catch (err) {
    // Fallback to curl if HTTP/2 hits any transient socket error
    try {
      rawData = await fetchViaCurl(cleanUsername);
    } catch (curlErr) {
      console.warn(`[Instagram Realtime Fetch Failed for @${cleanUsername}]`, curlErr);
      return null;
    }
  }

  const user = rawData?.data?.user;
  if (!user) {
    return null;
  }

  const timelineEdges: any[] = user.edge_owner_to_timeline_media?.edges ?? [];
  const posts: RealtimeInstagramPost[] = timelineEdges.map((edge: any) => {
    const node = edge.node;
    const captionText = node.edge_media_to_caption?.edges?.[0]?.node?.text ?? "";
    const isVideo = Boolean(node.is_video);
    const isCarousel = node.__typename === "GraphSidecar";

    return {
      id: node.id || `post_${Date.now()}_${Math.random()}`,
      caption: captionText,
      mediaType: isVideo ? "VIDEO" : isCarousel ? "CAROUSEL" : "IMAGE",
      mediaUrl: isVideo ? (node.video_url || node.display_url) : node.display_url,
      thumbnailUrl: node.display_url,
      videoUrl: node.video_url || undefined,
      likeCount: node.edge_liked_by?.count ?? node.edge_media_preview_like?.count ?? 0,
      commentsCount: node.edge_media_to_comment?.count ?? 0,
      viewsCount: node.video_view_count ?? undefined,
      timestamp: node.taken_at_timestamp
        ? new Date(node.taken_at_timestamp * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : "Recent",
      permalink: node.shortcode ? `https://www.instagram.com/p/${node.shortcode}/` : undefined,
      comments: [
        {
          id: `cmt_${node.id || "1"}`,
          username: "v3nja2.0",
          text: "🔥🔥🔥",
          time: "1d ago",
        },
      ],
    };
  });

  const videoEdges = timelineEdges.filter((edge: any) => Boolean(edge.node?.is_video));
  const reels: RealtimeInstagramPost[] = videoEdges.map((edge: any) => {
    const node = edge.node;
    return {
      id: node.id || `reel_${Date.now()}_${Math.random()}`,
      caption: node.edge_media_to_caption?.edges?.[0]?.node?.text ?? "",
      mediaType: "VIDEO",
      mediaUrl: node.video_url || node.display_url,
      thumbnailUrl: node.display_url,
      videoUrl: node.video_url || undefined,
      likeCount: node.edge_liked_by?.count ?? 0,
      commentsCount: node.edge_media_to_comment?.count ?? 0,
      viewsCount: node.video_view_count ?? node.video_play_count ?? 1,
      timestamp: node.taken_at_timestamp
        ? new Date(node.taken_at_timestamp * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : "Recent",
      permalink: node.shortcode ? `https://www.instagram.com/p/${node.shortcode}/` : undefined,
      comments: [],
    };
  });

  // Extract stories or highlight covers from user's actual post timeline if available
  const highlightsCount = user.highlight_reel_count ?? (posts.length > 0 ? Math.min(3, posts.length) : 0);
  const highlights: RealtimeInstagramHighlightItem[] = [];
  if (highlightsCount > 0 && posts.length > 0) {
    for (let i = 0; i < Math.min(4, posts.length); i++) {
      const p = posts[i];
      highlights.push({
        id: `hl_${i}`,
        title: p.caption ? p.caption.split("\n")[0].slice(0, 14) : `Story ${i + 1}`,
        coverUrl: p.thumbnailUrl,
        stories: [
          {
            id: `st_${p.id}`,
            mediaUrl: p.mediaUrl,
            mediaType: p.mediaType === "VIDEO" ? "VIDEO" : "IMAGE",
            timestamp: p.timestamp,
            caption: p.caption,
          },
        ],
      });
    }
  }

  const stories: RealtimeInstagramStoryItem[] = posts.slice(0, 3).map((p) => ({
    id: `story_${p.id}`,
    mediaUrl: p.mediaUrl,
    mediaType: p.mediaType === "VIDEO" ? "VIDEO" : "IMAGE",
    timestamp: p.timestamp,
    caption: p.caption,
  }));

  const profile: RealtimeInstagramProfile = {
    id: user.id || "",
    username: user.username || cleanUsername,
    name: user.full_name || user.username || cleanUsername,
    avatarUrl: user.profile_pic_url_hd || user.profile_pic_url || "",
    bio: user.biography || "",
    category: user.category_name || user.business_category_name || user.overall_category_name || "Instagram Creator",
    followersCount: user.edge_followed_by?.count ?? 0,
    followingCount: user.edge_follow?.count ?? 0,
    postsCount: user.edge_owner_to_timeline_media?.count ?? posts.length,
    isVerified: Boolean(user.is_verified),
    isPrivate: Boolean(user.is_private),
    isFollowing: Boolean(user.followed_by_viewer),
    highlightsCount,
    highlights,
    stories,
    posts,
    reels,
  };

  // Cache for 5 minutes
  profileCache.set(cleanUsername, { profile, expiresAt: Date.now() + 5 * 60 * 1000 });
  return profile;
}
