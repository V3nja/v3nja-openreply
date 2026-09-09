import { createHash } from "node:crypto";
import { prisma } from "@/lib/db/client";

export interface FanInteractionInput {
  workspaceId: string;
  instagramAccountId: string;
  instagramUserId: string;
  username?: string | null;
  firstName?: string | null;
  tag?: string | null;
  webhookEventId?: string;
  dedupeKey?: string;
  interactionType?: string;
}

function fanId(instagramAccountId: string, instagramUserId: string): string {
  const digest = createHash("sha256")
    .update(`${instagramAccountId}:${instagramUserId}`)
    .digest("hex")
    .slice(0, 40);
  return `fan_${digest}`;
}

export async function recordFanInteraction(input: FanInteractionInput): Promise<void> {
  const id = fanId(input.instagramAccountId, input.instagramUserId);
  const username = input.username?.trim() || null;
  const firstName = input.firstName?.trim() || null;
  const tag = input.tag?.trim() || null;

  if (!input.webhookEventId || !input.dedupeKey) {
    await prisma.$executeRaw`
      INSERT INTO "Fan" (
        "id", "workspaceId", "instagramAccountId", "instagramUserId", "username", "firstName",
        "tags", "interactionCount", "lastInteractionAt", "createdAt", "updatedAt"
      ) VALUES (
        ${id}, ${input.workspaceId}, ${input.instagramAccountId}, ${input.instagramUserId}, ${username}, ${firstName},
        ${tag ? [tag] : []}, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
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
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      INSERT INTO "Fan" (
        "id", "workspaceId", "instagramAccountId", "instagramUserId", "username", "firstName",
        "tags", "interactionCount", "lastInteractionAt", "createdAt", "updatedAt"
      ) VALUES (
        ${id}, ${input.workspaceId}, ${input.instagramAccountId}, ${input.instagramUserId}, ${username}, ${firstName},
        ${tag ? [tag] : []}, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
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
        "lastInteractionAt" = CURRENT_TIMESTAMP,
        "updatedAt" = CURRENT_TIMESTAMP;
    `;

    const inserted = await tx.$executeRaw`
      INSERT INTO "FanInteraction" (
        "workspaceId", "fanId", "instagramAccountId", "webhookEventId", "dedupeKey", "interactionType", "createdAt"
      ) VALUES (
        ${input.workspaceId}, ${id}, ${input.instagramAccountId}, ${input.webhookEventId}, ${input.dedupeKey},
        ${input.interactionType || tag || "interaction"}, CURRENT_TIMESTAMP
      )
      ON CONFLICT ("dedupeKey") DO NOTHING;
    `;

    if (inserted === 1) {
      await tx.$executeRaw`
        UPDATE "Fan"
        SET "interactionCount" = "interactionCount" + 1,
            "lastInteractionAt" = CURRENT_TIMESTAMP,
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE "id" = ${id} AND "workspaceId" = ${input.workspaceId};
      `;
    }
  });
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
  limit = 50,
  search = ""
): Promise<FanSummary[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const query = search.trim();

  if (!query) {
    return prisma.$queryRaw<FanSummary[]>`
      SELECT "id", "instagramUserId", "username", "firstName", "tags", "interactionCount", "lastInteractionAt"
      FROM "Fan"
      WHERE "workspaceId" = ${workspaceId}
      ORDER BY "lastInteractionAt" DESC
      LIMIT ${safeLimit};
    `;
  }

  const pattern = `%${query}%`;
  return prisma.$queryRaw<FanSummary[]>`
    SELECT "id", "instagramUserId", "username", "firstName", "tags", "interactionCount", "lastInteractionAt"
    FROM "Fan"
    WHERE "workspaceId" = ${workspaceId}
      AND (
        COALESCE("username", '') ILIKE ${pattern}
        OR COALESCE("firstName", '') ILIKE ${pattern}
        OR "instagramUserId" ILIKE ${pattern}
        OR EXISTS (
          SELECT 1 FROM unnest("tags") AS tag(value)
          WHERE tag.value ILIKE ${pattern}
        )
      )
    ORDER BY "lastInteractionAt" DESC
    LIMIT ${safeLimit};
  `;
}
