import { NextRequest, NextResponse } from "next/server";
import { getCurrentWorkspaceId } from "@/lib/auth";
import { getWorkspaceInstagramAccount } from "@/lib/instagram-accounts";
import { prisma } from "@/lib/db/client";
import { decryptToken } from "@/lib/meta/oauth";
import { getUserInfo, getUserMedia } from "@/lib/meta/client";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const account = await getWorkspaceInstagramAccount(
      workspaceId,
      request.nextUrl.searchParams.get("instagramAccountId")
    );

    if (!account) {
      return NextResponse.json(
        { success: false, error: "Instagram account not connected" },
        { status: 400 }
      );
    }

    const token = decryptToken(account.accessToken);
    const [profile, media, snapshots] = await Promise.all([
      getUserInfo(token),
      getUserMedia(token, 50),
      prisma.followerSnapshot.findMany({
        where: { instagramAccountId: account.id },
        orderBy: { date: "asc" },
        take: 90,
        select: { date: true, followersCount: true },
      }),
    ]);

    const posts = media.map((item) => ({
      id: item.id,
      caption: item.caption ?? "",
      permalink: item.permalink ?? null,
      thumbnailUrl: item.thumbnail_url ?? item.media_url ?? null,
      mediaType: item.media_type,
      timestamp: item.timestamp,
      views: 0,
      reach: 0,
      likes: item.like_count ?? 0,
      comments: item.comments_count ?? 0,
      saved: 0,
      shares: 0,
    }));

    const totals = posts.reduce(
      (sum, post) => ({
        posts: sum.posts + 1,
        views: sum.views + post.views,
        reach: sum.reach + post.reach,
        likes: sum.likes + post.likes,
        comments: sum.comments + post.comments,
        saved: sum.saved + post.saved,
        shares: sum.shares + post.shares,
        interactions:
          sum.interactions + post.likes + post.comments + post.saved + post.shares,
      }),
      {
        posts: 0,
        views: 0,
        reach: 0,
        likes: 0,
        comments: 0,
        saved: 0,
        shares: 0,
        interactions: 0,
      }
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          account: {
            id: account.instagramId,
            username: profile.username ?? account.username,
          },
          accounts: [
            {
              id: account.instagramId,
              username: profile.username ?? account.username,
            },
          ],
          requestedCount: 50,
          truncated: media.length >= 50,
          insightsAvailable: false,
          followers: profile.followers_count ?? 0,
          followerHistory: snapshots.map((point) => ({
            date: point.date.toISOString().slice(0, 10),
            followersCount: point.followersCount,
          })),
          totals,
          posts,
        },
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (err) {
    console.error("[Instagram Overview] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load Instagram overview" },
      { status: 500 }
    );
  }
}
