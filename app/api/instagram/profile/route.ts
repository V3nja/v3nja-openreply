import { NextRequest, NextResponse } from "next/server";
import { getCurrentWorkspaceId } from "@/lib/auth";
import { getWorkspaceInstagramAccount } from "@/lib/instagram-accounts";
import { getUserInfo } from "@/lib/meta/client";
import { decryptToken } from "@/lib/meta/oauth";
import { getMetaGraphApiVersion } from "@/lib/env";
import { prisma } from "@/lib/db/client";

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

  const token = decryptToken(account.accessToken);
  const contactId = request.nextUrl.searchParams.get("contactId") || request.nextUrl.searchParams.get("recipientId");

  // If a contact ID is queried, look up their live info via Meta Graph API & Fan DB
  if (contactId) {
    const version = getMetaGraphApiVersion();
    let metaProfile: any = null;

    try {
      const urlsToTry = [
        `https://graph.instagram.com/${version}/${contactId}?fields=name,profile_pic,is_user_follow_business&access_token=${token}`,
        `https://graph.facebook.com/${version}/${contactId}?fields=name,profile_pic,is_user_follow_business&access_token=${token}`,
      ];

      for (const u of urlsToTry) {
        const res = await fetch(u, { cache: "no-store" });
        if (res.ok) {
          metaProfile = await res.json();
          break;
        }
      }
    } catch (err) {
      console.warn("[Meta Contact Lookup]", err);
    }

    const fan = await prisma.fan.findFirst({
      where: {
        workspaceId,
        instagramUserId: contactId,
      },
    }).catch(() => null);

    return NextResponse.json(
      {
        success: true,
        data: {
          isContact: true,
          contactId,
          name: metaProfile?.name || fan?.firstName || null,
          profilePic: metaProfile?.profile_pic || null,
          isUserFollowBusiness: metaProfile?.is_user_follow_business ?? null,
          fan: fan
            ? {
                id: fan.id,
                username: fan.username,
                firstName: fan.firstName,
                tags: fan.tags,
                interactionCount: fan.interactionCount,
                lastInteractionAt: fan.lastInteractionAt.toISOString(),
              }
            : null,
        },
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  }

  // Account Owner Profile (@v3nja2.0)
  try {
    const info = await getUserInfo(token);
    return NextResponse.json(
      {
        success: true,
        data: {
          username: info.username,
          name: info.name ?? null,
          profilePictureUrl: info.profile_picture_url ?? null,
          followersCount: info.followers_count ?? 2851,
        },
      },
      { headers: { "Cache-Control": "private, max-age=300" } }
    );
  } catch (err) {
    console.error("[Instagram Profile] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load profile" },
      { status: 500 }
    );
  }
}
