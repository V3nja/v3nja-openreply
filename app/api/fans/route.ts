import { NextRequest, NextResponse } from "next/server";
import { getCurrentWorkspaceId } from "@/lib/auth";
import { listFans } from "@/lib/fans/engine";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const rawLimit = Number.parseInt(
      request.nextUrl.searchParams.get("limit") ?? "50",
      10
    );
    const limit = Number.isFinite(rawLimit) ? rawLimit : 50;
    const fans = await listFans(workspaceId, limit);

    return NextResponse.json(
      {
        success: true,
        data: fans.map((fan) => ({
          ...fan,
          lastInteractionAt: fan.lastInteractionAt.toISOString(),
        })),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error(
      "[Fans API Error]",
      error instanceof Error ? error.message : "unknown error"
    );
    return NextResponse.json(
      { success: false, error: "Failed to load fans" },
      { status: 500 }
    );
  }
}
