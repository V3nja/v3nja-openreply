import { NextRequest, NextResponse } from "next/server";
import { getCurrentWorkspaceId } from "@/lib/auth";
import { getWorkspaceInstagramAccount } from "@/lib/instagram-accounts";
import { decryptToken } from "@/lib/meta/oauth";
import { getMetaGraphApiVersion } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
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

  let token = account.accessToken;
  try {
    token = decryptToken(account.accessToken);
  } catch {
    token = account.accessToken;
  }

  const version = getMetaGraphApiVersion();
  const fields = "id,caption,media_type,media_url,permalink,timestamp,thumbnail_url,like_count,comments_count";

  // Try Graph Instagram endpoint first, then fallback to Graph Facebook endpoint
  const urlsToTry = [
    `https://graph.instagram.com/${version}/me/media?fields=${fields}&limit=50&access_token=${token}`,
    `https://graph.instagram.com/me/media?fields=${fields}&limit=50&access_token=${token}`,
    `https://graph.facebook.com/${version}/${account.instagramId}/media?fields=${fields}&limit=50&access_token=${token}`,
    `https://graph.facebook.com/${version}/me/media?fields=${fields}&limit=50&access_token=${token}`,
  ];

  let lastError: any = null;

  for (const mediaUrl of urlsToTry) {
    try {
      const response = await fetch(mediaUrl, { cache: "no-store" });
      const data = await response.json();

      if (response.ok && Array.isArray(data?.data)) {
        return NextResponse.json(
          {
            success: true,
            data: data.data,
            account: {
              id: account.id,
              instagramId: account.instagramId,
              username: account.username,
            },
          },
          { headers: { "Cache-Control": "private, no-store" } }
        );
      }

      lastError = data?.error;
    } catch (err) {
      lastError = err;
    }
  }

  console.error("[Instagram Posts] All media endpoints failed:", lastError);

  return NextResponse.json(
    {
      success: false,
      error: "Instagram posts could not be loaded",
      details: lastError?.message || "Check permissions for @v3nja2.0",
    },
    { status: 502 }
  );
}
