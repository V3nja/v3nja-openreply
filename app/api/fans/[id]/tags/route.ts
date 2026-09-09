import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getCurrentWorkspaceContext } from "@/lib/workspace-access";

export const dynamic = "force-dynamic";

function cleanTag(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const tag = value.trim().replace(/[^a-zA-Z0-9 _-]/g, "").slice(0, 40);
  return tag || null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = await getCurrentWorkspaceContext();
  if (!context) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = (await request.json()) as { action?: unknown; tag?: unknown };
    const tag = cleanTag(body.tag);
    const action = body.action === "remove" ? "remove" : "add";
    if (!tag) return NextResponse.json({ success: false, error: "A valid tag is required" }, { status: 400 });

    const result = await prisma.$queryRaw<{ id: string; tags: string[] }[]>`
      SELECT "id", "tags"
      FROM "Fan"
      WHERE "id" = ${id} AND "workspaceId" = ${context.workspaceId}
      LIMIT 1;
    `;
    if (!result[0]) return NextResponse.json({ success: false, error: "Fan not found" }, { status: 404 });

    const current = result[0].tags ?? [];
    const next = action === "remove"
      ? current.filter((item) => item !== tag)
      : current.includes(tag) ? current : [...current, tag];

    await prisma.$executeRaw`
      UPDATE "Fan"
      SET "tags" = ${next}, "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = ${id} AND "workspaceId" = ${context.workspaceId};
    `;

    return NextResponse.json({ success: true, data: { id, tags: next } });
  } catch (error) {
    console.error("[Fan Tags API Error]", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ success: false, error: "Failed to update fan tags" }, { status: 500 });
  }
}
