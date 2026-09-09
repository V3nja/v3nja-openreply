import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockRedis,
  mockPrisma,
  mockDecryptToken,
  mockGetUserFollowStatus,
  mockSendDirectMessageWithButton,
  mockReserveDMSlot,
  mockReleaseDMSlot,
  mockReserveWorkspaceDMSend,
  mockReleaseWorkspaceDMReservation,
  mockMarkDmLogSent,
  mockMarkDmLogFailed,
  mockQueueAdd,
} = vi.hoisted(() => ({
  mockRedis: { set: vi.fn(), del: vi.fn(), eval: vi.fn() },
  mockPrisma: {
    automation: { findFirst: vi.fn() },
    dmLog: { findFirst: vi.fn(), findUnique: vi.fn(), upsert: vi.fn(), updateMany: vi.fn() },
    instagramAccount: { findUnique: vi.fn() },
    operationalEvent: { create: vi.fn() },
  },
  mockDecryptToken: vi.fn(),
  mockGetUserFollowStatus: vi.fn(),
  mockSendDirectMessageWithButton: vi.fn(),
  mockReserveDMSlot: vi.fn(),
  mockReleaseDMSlot: vi.fn(),
  mockReserveWorkspaceDMSend: vi.fn(),
  mockReleaseWorkspaceDMReservation: vi.fn(),
  mockMarkDmLogSent: vi.fn(),
  mockMarkDmLogFailed: vi.fn(),
  mockQueueAdd: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/queue/client", () => ({
  getDMQueue: () => ({ add: mockQueueAdd }),
  getRedisConnection: () => mockRedis,
  MANUAL_MESSAGE_JOB_NAME: "process-manual-message",
  MESSAGE_JOB_NAME: "process-message",
  POSTBACK_JOB_NAME: "process-postback",
  FOLLOWUP_JOB_NAME: "process-followup",
}));
vi.mock("bullmq", () => ({
  Worker: class {
    constructor(_name: string, processor: unknown) {
      (globalThis as Record<string, unknown>).__dmWorkerProcessor = processor;
    }
    on() { return this; }
    close() { return Promise.resolve(); }
  },
}));
vi.mock("@/lib/meta/client", () => ({
  sendPrivateReply: vi.fn(),
  sendPrivateReplyWithLinkButton: vi.fn(),
  sendPrivateReplyWithButton: vi.fn(),
  sendDirectMessage: vi.fn(),
  sendDirectMessageWithButton: mockSendDirectMessageWithButton,
  sendDirectMessageWithLinkButton: vi.fn(),
  sendCommentReply: vi.fn(),
  getUserFollowStatus: mockGetUserFollowStatus,
  MetaApiError: class MetaApiError extends Error { code = 0; },
  RateLimitError: class RateLimitError extends Error {},
  TokenExpiredError: class TokenExpiredError extends Error {},
}));
vi.mock("@/lib/meta/oauth", () => ({ decryptToken: mockDecryptToken }));
vi.mock("@/lib/utils/rate-limiter", () => ({
  reserveDMSlot: mockReserveDMSlot,
  releaseDMSlot: mockReleaseDMSlot,
}));
vi.mock("@/lib/billing/usage", () => ({
  reserveWorkspaceDMSend: mockReserveWorkspaceDMSend,
  releaseWorkspaceDMReservation: mockReleaseWorkspaceDMReservation,
}));
vi.mock("@/lib/queue/idempotency", () => ({
  acquireDeliveryLease: vi.fn().mockResolvedValue({ release: vi.fn().mockResolvedValue(undefined) }),
  markDmLogSent: mockMarkDmLogSent,
  markDmLogFailed: mockMarkDmLogFailed,
  withDeliveryLock: vi.fn(),
}));
vi.mock("@/lib/ops/worker-health", () => ({ recordWorkerAlert: vi.fn() }));

import { createDMWorker } from "../lib/queue/dm-worker";

const automation = {
  id: "auto_1",
  workspaceId: "workspace_1",
  instagramAccountId: "ig_row_1",
  dmMessage: "Here is your link",
  followPromptMessage: "Follow me first.",
  followPromptButtonLabel: "I'm following",
  requireFollow: true,
  isActive: true,
  instagramAccount: { id: "ig_row_1", instagramId: "ig_1", accessToken: "encrypted" },
  workspace: { id: "workspace_1" },
  trackedLinks: [],
};

function getProcessor() {
  createDMWorker();
  return (globalThis as Record<string, unknown>).__dmWorkerProcessor as (job: any) => Promise<void>;
}

function postbackJob(payload: string, attemptsMade = 0) {
  return {
    name: "process-postback",
    id: "postback_job",
    attemptsMade,
    data: {
      instagramAccountId: "ig_1",
      userId: "user_1",
      payload,
      mid: "mid_1",
      fallback: null,
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRedis.set.mockResolvedValue("OK");
  mockRedis.del.mockResolvedValue(1);
  mockRedis.eval.mockResolvedValue(1);
  mockPrisma.automation.findFirst.mockResolvedValue(automation);
  mockPrisma.dmLog.findFirst.mockResolvedValue(null);
  mockPrisma.dmLog.findUnique.mockResolvedValue(null);
  mockPrisma.dmLog.upsert.mockResolvedValue({});
  mockPrisma.dmLog.updateMany.mockResolvedValue({ count: 1 });
  mockPrisma.instagramAccount.findUnique.mockResolvedValue({ workspaceId: "workspace_1" });
  mockPrisma.operationalEvent.create.mockResolvedValue({});
  mockDecryptToken.mockReturnValue("decrypted");
  mockGetUserFollowStatus.mockResolvedValue(false);
  mockSendDirectMessageWithButton.mockResolvedValue({ message_id: "msg_1" });
  mockReserveDMSlot.mockResolvedValue({ allowed: true, shouldRequeue: false, shouldSkip: false });
  mockReleaseDMSlot.mockResolvedValue(undefined);
  mockReserveWorkspaceDMSend.mockResolvedValue({ allowed: true, periodStart: new Date("2026-09-09T00:00:00.000Z") });
  mockReleaseWorkspaceDMReservation.mockResolvedValue({ count: 1 });
  mockMarkDmLogSent.mockResolvedValue(undefined);
  mockMarkDmLogFailed.mockResolvedValue(undefined);
  mockQueueAdd.mockResolvedValue({ id: "retry_1" });
});

describe("DM worker postback delivery wiring", () => {
  it("meters a follow-check prompt through workspace quota and the Instagram DM rate limiter", async () => {
    await getProcessor()(postbackJob("followcheck:auto_1"));

    expect(mockReserveWorkspaceDMSend).toHaveBeenCalledWith("workspace_1");
    expect(mockReserveDMSlot).toHaveBeenCalledWith("ig_1", 0);
    expect(mockSendDirectMessageWithButton).toHaveBeenCalledTimes(1);
    expect(mockMarkDmLogSent).toHaveBeenCalledWith({ automationId: "auto_1", commentId: "followcheck:user_1" });
    expect(mockReleaseWorkspaceDMReservation).not.toHaveBeenCalled();
    expect(mockReleaseDMSlot).not.toHaveBeenCalled();
  });

  it("releases the follow-check quota when the hourly limit requests a retry", async () => {
    mockReserveDMSlot.mockResolvedValueOnce({
      allowed: false,
      shouldRequeue: true,
      shouldSkip: false,
      requeueDelayMs: 30 * 60 * 1000,
    });

    await getProcessor()(postbackJob("followcheck:auto_1"));

    expect(mockReleaseWorkspaceDMReservation).toHaveBeenCalledWith(
      "workspace_1",
      new Date("2026-09-09T00:00:00.000Z")
    );
    expect(mockQueueAdd).toHaveBeenCalledWith(
      "process-postback",
      expect.objectContaining({ payload: "followcheck:auto_1" }),
      expect.objectContaining({
        delay: 30 * 60 * 1000,
        jobId: expect.stringContaining("postback_auto_1_followcheck:user_1_retry_1"),
      })
    );
    expect(mockSendDirectMessageWithButton).not.toHaveBeenCalled();
  });

  it("requeues a reveal postback when the hourly rate limit is exhausted", async () => {
    mockGetUserFollowStatus.mockResolvedValueOnce(true);
    mockReserveDMSlot.mockResolvedValueOnce({
      allowed: false,
      shouldRequeue: true,
      shouldSkip: false,
      requeueDelayMs: 30 * 60 * 1000,
    });

    await getProcessor()(postbackJob("reveal:auto_1"));

    expect(mockQueueAdd).toHaveBeenCalledWith(
      "process-postback",
      expect.objectContaining({ payload: "reveal:auto_1" }),
      expect.objectContaining({
        delay: 30 * 60 * 1000,
        jobId: expect.stringContaining("postback_auto_1_reveal:user_1_retry_1"),
      })
    );
    expect(mockSendDirectMessageWithButton).not.toHaveBeenCalled();
  });
});
