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

  try {
    const token = decryptToken(account.accessToken);
    const url = new URL(
      `https://graph.facebook.com/${getMetaGraphApiVersion()}/${account.instagramId}/media`
    );
    url.searchParams.set(
      "fields",
      "id,caption,media_type,media_product_type,media_url,thumbnail_url,timestamp,permalink,like_count,comments_count"
    );
    url.searchParams.set("limit", "50");
    url.searchParams.set("access_token", token);

    const response = await fetch(url.toString(), { cache: "no-store" });
    const data = await response.json();

    if (!response.ok || data?.error) {
      const error = data?.error;
      console.error("[Instagram Posts] Meta API error", {
        status: response.status,
        code: error?.code,
        subcode: error?.error_subcode,
        message: error?.message,
        trace: error?.fbtrace_id,
        accountId: account.instagramId,
      });

      return NextResponse.json(
        {
          success: false,
          error: "Instagram posts could not be loaded",
          code: error?.code ?? response.status,
        },
        { status: response.status >= 400 ? response.status : 502 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: Array.isArray(data?.data) ? data.data : [],
        account: {
          id: account.id,
          instagramId: account.instagramId,
          username: account.username,
        },
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("[Instagram Posts] Fetch error", {
      error: error instanceof Error ? error.message : String(error),
      accountId: account.instagramId,
    });

    return NextResponse.json(
      { success: false, error: "Failed to load Instagram posts" },
      { status: 500 }
    );
  }
}
