import { NextRequest, NextResponse } from "next/server";
import { getCurrentWorkspaceId } from "@/lib/auth";
import { fetchRealtimeInstagramProfile } from "@/lib/instagram-realtime";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username");
  if (!username) {
    return NextResponse.json({ success: false, error: "Username parameter is required" }, { status: 400 });
  }

  const cleanUsername = username.replace(/^@/, "").trim().toLowerCase();

  try {
    const realProfile = await fetchRealtimeInstagramProfile(cleanUsername);

    if (!realProfile) {
      return NextResponse.json({
        success: false,
        error: `Could not retrieve live Instagram profile for @${cleanUsername}. Profile may be restricted or private.`,
      }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        data: realProfile,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
        },
      }
    );
  } catch (err: any) {
    console.error("[Contact Profile API Error]", err);
    return NextResponse.json({
      success: false,
      error: err?.message || "Failed to fetch real-time profile data",
    }, { status: 500 });
  }
}
