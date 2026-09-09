-- V3NJA OpenReply Fan Engine
-- A fan is scoped to the connected Instagram account and workspace.
CREATE TABLE "Fan" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "instagramAccountId" TEXT NOT NULL,
    "instagramUserId" TEXT NOT NULL,
    "username" TEXT,
    "firstName" TEXT,
    "tags" TEXT[] NOT NULL DEFAULT '{}',
    "interactionCount" INTEGER NOT NULL DEFAULT 0,
    "lastInteractionAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fan_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Fan_instagramAccountId_instagramUserId_key"
  ON "Fan"("instagramAccountId", "instagramUserId");
CREATE INDEX "Fan_workspaceId_idx" ON "Fan"("workspaceId");
CREATE INDEX "Fan_instagramAccountId_idx" ON "Fan"("instagramAccountId");
CREATE INDEX "Fan_lastInteractionAt_idx" ON "Fan"("lastInteractionAt");

ALTER TABLE "Fan"
  ADD CONSTRAINT "Fan_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Fan"
  ADD CONSTRAINT "Fan_instagramAccountId_fkey"
  FOREIGN KEY ("instagramAccountId") REFERENCES "InstagramAccount"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
