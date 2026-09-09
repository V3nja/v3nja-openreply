CREATE TABLE "FanInteraction" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "fanId" TEXT NOT NULL,
    "instagramAccountId" TEXT NOT NULL,
    "webhookEventId" TEXT NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "interactionType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FanInteraction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FanInteraction_dedupeKey_key"
  ON "FanInteraction"("dedupeKey");
CREATE INDEX "FanInteraction_fanId_createdAt_idx"
  ON "FanInteraction"("fanId", "createdAt");
CREATE INDEX "FanInteraction_webhookEventId_idx"
  ON "FanInteraction"("webhookEventId");

ALTER TABLE "FanInteraction"
  ADD CONSTRAINT "FanInteraction_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FanInteraction"
  ADD CONSTRAINT "FanInteraction_fanId_fkey"
  FOREIGN KEY ("fanId") REFERENCES "Fan"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FanInteraction"
  ADD CONSTRAINT "FanInteraction_instagramAccountId_fkey"
  FOREIGN KEY ("instagramAccountId") REFERENCES "InstagramAccount"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FanInteraction"
  ADD CONSTRAINT "FanInteraction_webhookEventId_fkey"
  FOREIGN KEY ("webhookEventId") REFERENCES "WebhookEvent"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
