import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  webhookFindUnique: vi.fn(),
  webhookCreate: vi.fn(),
  webhookUpdate: vi.fn(),
  accountFindMany: vi.fn(),
  automationFindMany: vi.fn(),
  automationUpdateMany: vi.fn(),
  queueAdd: vi.fn(),
  recordFanInteraction: vi.fn(),
  parseCommentEvents: vi.fn(),
  parseMessageEvents: vi.fn(),
  parsePostbackEvents: vi.fn(),
  evaluateAutomationRule: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({
  prisma: {
    webhookEvent: {
      findUnique: mocks.webhookFindUnique,
      create: mocks.webhookCreate,
      update: mocks.webhookUpdate,
    },
    instagramAccount: {
      findMany: mocks.accountFindMany,
    },
    automation: {
      findMany: mocks.automationFindMany,
      updateMany: mocks.automationUpdateMany,
    },
  },
}));

vi.mock("@/lib/queue/client", () => ({
  getDMQueue: () => ({ add: mocks.queueAdd }),
}));

vi.mock("@/lib/fans/engine", () => ({
  recordFanInteraction: mocks.recordFanInteraction,
}));

vi.mock("@/lib/automation/rules", () => ({
  evaluateAutomationRule: mocks.evaluateAutomationRule,
}));

vi.mock("@/lib/meta/webhook", () => ({
  parseCommentEvents: mocks.parseCommentEvents,
  parseMessageEvents: mocks.parseMessageEvents,
  parsePostbackEvents: mocks.parsePostbackEvents,
}));

import { enqueueVerifiedWebhook } from "../lib/queue/webhook-enqueue";

const commentEvent = {
  instagramAccountId: "ig-account",
  commentId: "comment-1",
  commentText: "LINK",
  commenterId: "user-1",
  commenterName: "user1",
  mediaId: "media-1",
};

const account = {
  id: "db-account",
  instagramId: "ig-account",
  workspaceId: "workspace-1",
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.parseCommentEvents.mockReturnValue([commentEvent]);
  mocks.parseMessageEvents.mockReturnValue([]);
  mocks.parsePostbackEvents.mockReturnValue([]);
  mocks.accountFindMany.mockResolvedValue([account]);
  mocks.automationFindMany.mockResolvedValue([]);
  mocks.automationUpdateMany.mockResolvedValue({ count: 0 });
  mocks.recordFanInteraction.mockResolvedValue(undefined);
  mocks.queueAdd.mockResolvedValue({ id: "comment-job" });
  mocks.webhookCreate.mockResolvedValue(undefined);
  mocks.webhookUpdate.mockResolvedValue(undefined);
  mocks.evaluateAutomationRule.mockReturnValue({ matched: false, matchedKeyword: null });
});

describe("enqueueVerifiedWebhook recovery", () => {
  it("re-enqueues a PENDING webhook instead of treating it as permanently processed", async () => {
    mocks.webhookFindUnique.mockResolvedValue({ id: "existing", status: "PENDING" });

    const result = await enqueueVerifiedWebhook("raw-webhook", {
      object: "instagram",
      entry: [],
    } as never);

    expect(result.duplicate).toBe(false);
    expect(mocks.queueAdd).toHaveBeenCalledTimes(1);
    expect(mocks.queueAdd).toHaveBeenCalledWith(
      "process-comment",
      expect.objectContaining({ commentId: "comment-1" }),
      { jobId: "comment_ig-account_comment-1" }
    );
    expect(mocks.webhookUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: expect.any(String) }),
        data: expect.objectContaining({ status: "PROCESSED" }),
      })
    );
  });

  it("keeps a PROCESSED webhook terminal and does not enqueue again", async () => {
    mocks.webhookFindUnique.mockResolvedValue({ id: "existing", status: "PROCESSED" });

    const result = await enqueueVerifiedWebhook("raw-webhook", {
      object: "instagram",
      entry: [],
    } as never);

    expect(result).toEqual({
      eventId: expect.any(String),
      queued: 0,
      duplicate: true,
    });
    expect(mocks.queueAdd).not.toHaveBeenCalled();
    expect(mocks.webhookUpdate).not.toHaveBeenCalled();
  });
});
