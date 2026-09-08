import { NextRequest, NextResponse } from "next/server";
import { LiveDataStore } from "@/lib/db/live-store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, Number.parseInt(searchParams.get("limit") ?? "20", 10))
    );
    const status = searchParams.get("status");
    const accountId = searchParams.get("instagramAccountId");

    let allLogs = LiveDataStore.getLogs();

    if (status && status !== "ALL") {
      allLogs = allLogs.filter((l) => l.status === status);
    }

    if (accountId && accountId !== "all") {
      allLogs = allLogs.filter((l) => l.instagramAccountId === accountId);
    }

    const total = allLogs.length;
    const skip = (page - 1) * limit;
    const paginatedLogs = allLogs.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      data: {
        logs: paginatedLogs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      },
    });
  } catch (err: any) {
    console.error("[Logs API Error]:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
