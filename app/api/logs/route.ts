import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getCurrentWorkspaceId } from "@/lib/auth";

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

    const searchParams = request.nextUrl.searchParams;
    const requestedPage = Number.parseInt(searchParams.get("page") ?? "0", 10);
    const requestedOffset = Number.parseInt(searchParams.get("offset") ?? "-1", 10);
    const limit = Math.min(
      50,
      Math.max(1, Number.parseInt(searchParams.get("limit") ?? "20", 10))
    );
    const status = searchParams.get("status");
    const accountId = searchParams.get("instagramAccountId");
    const page = requestedOffset >= 0 ? Math.floor(requestedOffset / limit) + 1 : Math.max(1, requestedPage || 1);
    const skip = requestedOffset >= 0 ? requestedOffset : (page - 1) * limit;

    const where = {
      workspaceId,
      ...(status && status !== "ALL" ? { status: status as any } : {}),
      ...(accountId && accountId !== "all" ? { instagramAccountId: accountId } : {}),
    };

    const [total, logs] = await Promise.all([
      prisma.dmLog.count({ where }),
      prisma.dmLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          automation: { select: { id: true, name: true } },
          instagramAccount: { select: { id: true, username: true, instagramId: true } },
        },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          logs,
          total,
          pagination: {
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(total / limit)),
          },
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[Logs API Error]", err instanceof Error ? err.message : "unknown error");
    return NextResponse.json(
      { success: false, error: "Failed to load logs" },
      { status: 500 }
    );
  }
}
