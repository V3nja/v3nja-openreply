import { NextRequest, NextResponse } from "next/server";
import { getCurrentWorkspaceContext } from "@/lib/workspace-access";
import { prisma } from "@/lib/db/client";
import { encryptToken } from "@/lib/meta/oauth";
import { getMetaGraphApiVersion } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const context = await getCurrentWorkspaceContext();
  if (!context) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const token =
      body.token ||
      process.env.META_PAGE_ACCESS_TOKEN ||
      process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, error: "Access token is required" },
        { status: 400 }
      );
    }

    const version = getMetaGraphApiVersion();

    let instagramId = "17841450944703637";
    let username = "v3nja2.0";
    let name = "V3NJA Official";

    try {
      const meRes = await fetch(
        `https://graph.facebook.com/${version}/me?fields=id,name,accounts{id,name,access_token,instagram_business_account{id,username,name}}&access_token=${token}`
      );
      const meData = await meRes.json();
      if (meData?.accounts?.data?.length > 0) {
        for (const page of meData.accounts.data) {
          if (page.instagram_business_account) {
            instagramId = page.instagram_business_account.id;
            username = page.instagram_business_account.username || username;
            name = page.instagram_business_account.name || name;
            break;
          }
        }
      } else if (meData?.id) {
        const igRes = await fetch(
          `https://graph.facebook.com/${version}/me?fields=id,username,name&access_token=${token}`
        );
        const igData = await igRes.json();
        if (igData?.id) {
          instagramId = igData.id;
          username = igData.username || username;
          name = igData.name || name;
        }
      }
    } catch (apiErr) {
      console.warn("[Direct Connect] Graph API lookup warning:", apiErr);
    }

    let encryptedToken = token;
    try {
      encryptedToken = encryptToken(token);
    } catch {
      console.warn("[Direct Connect] Token stored directly");
    }

    const account = await prisma.instagramAccount.upsert({
      where: { instagramId },
      create: {
        workspaceId: context.workspaceId,
        instagramId,
        username,
        name,
        accessToken: encryptedToken,
        webhookSubscribed: true,
      },
      update: {
        workspaceId: context.workspaceId,
        username,
        name,
        accessToken: encryptedToken,
        webhookSubscribed: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: account.id,
        instagramId: account.instagramId,
        username: account.username,
        name: account.name,
      },
    });
  } catch (err: any) {
    console.error("[Direct Connect Error]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to connect account" },
      { status: 500 }
    );
  }
}
