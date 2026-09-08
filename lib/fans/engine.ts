import { createHash } from "node:crypto";
import { prisma } from "@/lib/db/client";

export interface FanInteractionInput {
  workspaceId: string;
  instagramAccountId: string;
  instagramUserId: string;
  username?: string | null;
  firstName?: string | null;
  tag?: string | null;
}

function fanId(instagramAccountId: string, instagramUserId: string): string {
  const digest = createHash("sha256")
    .update(`${instagramAccountId}:${instagramUserId}`)
    .digest("hex")
    .slice(0, 40);
  return `fan_${digest}`;
}

/**
 * Upsert a fan without requiring the generated Prisma client to know about the
 * feature yet. The migration creates the table and this helper keeps the write
 * path compatible while the generated client catches up on the next build.
 */
export async function recordFanInteraction(input: FanInteractionInput): Promise<void> {
  const id = fanId(input.instagramAccountId, input.instagramUserId);
  const username = input.username?.trim() || null;
  const firstName = input.firstName?.trim() || null;
  const tag = input.tag?.trim() || null;

  await prisma.$executeRaw`
    INSERT INTO "Fan" (
      "id",
      "workspaceId",
      "instagramAccountId",
      "instagramUserId",
      "username",
      "firstName",
      "tags",
      "interactionCount",
      "lastInteractionAt",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      ${id},
      ${input.workspaceId},
      ${input.instagramAccountId},
      ${input.instagramUserId},
      ${username},
      ${firstName},
      ${tag ? [tag] : []},
      1,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
    ON CONFLICT ("instagramAccountId", "instagramUserId")
    DO UPDATE SET
      "username" = COALESCE(EXCLUDED."username", "Fan"."username"),
      "firstName" = COALESCE(EXCLUDED."firstName", "Fan"."firstName"),
      "tags" = CASE
        WHEN ${tag}::text IS NULL THEN "Fan"."tags"
        WHEN ${tag}::text = ANY("Fan"."tags") THEN "Fan"."tags"
        ELSE array_append("Fan"."tags", ${tag})
      END,
      "interactionCount" = "Fan"."interactionCount" + 1,
      "lastInteractionAt" = CURRENT_TIMESTAMP,
      "updatedAt" = CURRENT_TIMESTAMP;
  `;
}

export interface FanSummary {
  id: string;
  instagramUserId: string;
  username: string | null;
  firstName: string | null;
  tags: string[];
  interactionCount: number;
  lastInteractionAt: Date;
}

export async function listFans(
  workspaceId: string,
  limit = 50
): Promise<FanSummary[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  return prisma.$queryRaw<FanSummary[]>`
    SELECT
      "id",
      "instagramUserId",
      "username",
      "firstName",
      "tags",
      "interactionCount",
      "lastInteractionAt"
    FROM "Fan"
    WHERE "workspaceId" = ${workspaceId}
    ORDER BY "lastInteractionAt" DESC
    LIMIT ${safeLimit};
  `;
}
