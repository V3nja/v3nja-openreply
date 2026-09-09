import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  executeRaw: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({
  prisma: {
    $executeRaw: mocks.executeRaw,
    $transaction: mocks.transaction,
    $queryRaw: vi.fn(),
  },
}));

import { recordFanInteraction } from "../lib/fans/engine";

describe("fan interaction idempotency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("increments the fan counter only when a webhook interaction dedupe key is newly inserted", async () => {
    const tx = { $executeRaw: vi.fn() };
    mocks.transaction.mockImplementation(async (callback: (tx: typeof tx) => Promise<unknown>) => callback(tx));

    tx.$executeRaw
      .mockResolvedValueOnce(1) // Fan upsert
      .mockResolvedValueOnce(1) // FanInteraction insert
      .mockResolvedValueOnce(1); // Fan counter increment

    await recordFanInteraction({
      workspaceId: "workspace_1",
      instagramAccountId: "ig_1",
      instagramUserId: "user_1",
      tag: "comment",
      webhookEventId: "event_1",
      dedupeKey: "webhook:event_1:comment:comment_1",
      interactionType: "comment",
    });

    expect(tx.$executeRaw).toHaveBeenCalledTimes(3);
  });

  it("does not increment the fan counter again when the webhook interaction already exists", async () => {
    const tx = { $executeRaw: vi.fn() };
    mocks.transaction.mockImplementation(async (callback: (tx: typeof tx) => Promise<unknown>) => callback(tx));

    tx.$executeRaw
      .mockResolvedValueOnce(1) // Fan upsert
      .mockResolvedValueOnce(0); // FanInteraction duplicate: ON CONFLICT DO NOTHING

    await recordFanInteraction({
      workspaceId: "workspace_1",
      instagramAccountId: "ig_1",
      instagramUserId: "user_1",
      tag: "comment",
      webhookEventId: "event_1",
      dedupeKey: "webhook:event_1:comment:comment_1",
      interactionType: "comment",
    });

    expect(tx.$executeRaw).toHaveBeenCalledTimes(2);
  });

  it("keeps the legacy direct upsert path when no webhook dedupe context is provided", async () => {
    mocks.executeRaw.mockResolvedValue(1);

    await recordFanInteraction({
      workspaceId: "workspace_1",
      instagramAccountId: "ig_1",
      instagramUserId: "user_1",
      tag: "comment",
    });

    expect(mocks.executeRaw).toHaveBeenCalledTimes(1);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});
