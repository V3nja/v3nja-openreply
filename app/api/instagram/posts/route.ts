import { NextRequest, NextResponse } from "next/server";
import { getCurrentWorkspaceId } from "@/lib/auth";
import { getWorkspaceInstagramAccount } from "@/lib/instagram-accounts";
import { decryptToken } from "@/lib/meta/oauth";
import { getMetaGraphApiVersion } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  let token = process.env.META_PAGE_ACCESS_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN || "";
  let accountId = "17841450944703637";
  let username = "v3nja2.0";

  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (workspaceId) {
      const account = await getWorkspaceInstagramAccount(
        workspaceId,
        request.nextUrl.searchParams.get("instagramAccountId")
      );
      if (account) {
        accountId = account.instagramId;
        username = account.username;
        try {
          token = decryptToken(account.accessToken);
        } catch {
          token = account.accessToken;
        }
      }
    }
  } catch (err) {
    // Non-blocking workspace check
  }

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        error: "Instagram account not connected via Meta Graph API",
        details: "Please connect your Meta account in Settings to sync live posts & reels in real-time.",
      },
      { status: 400 }
    );
  }

  const version = getMetaGraphApiVersion();
  const fields =
    "id,caption,media_type,media_product_type,media_url,permalink,timestamp,thumbnail_url,like_count,comments_count,children{id,media_type,media_url,thumbnail_url}";

  const urlsToTry = [
    `https://graph.facebook.com/${version}/${accountId}/media?fields=${fields}&limit=50&access_token=${token}`,
    `https://graph.instagram.com/${version}/me/media?fields=${fields}&limit=50&access_token=${token}`,
    `https://graph.instagram.com/me/media?fields=${fields}&limit=50&access_token=${token}`,
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
              instagramId: accountId,
              username,
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

  return NextResponse.json(
    {
      success: false,
      error: "Instagram media could not be fetched from Meta Graph API",
      details: lastError?.message || "Ensure the Meta access token has instagram_basic and pages_read_engagement permissions.",
    },
    { status: 502 }
  );
}
