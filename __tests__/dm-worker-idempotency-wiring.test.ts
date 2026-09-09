import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockRedis, mockPrisma, mockSendPrivateReply, mockDecryptToken, mockReserveWorkspaceDMSend, mockReleaseWorkspaceDMReservation, mockGetUserFollowStatus, mockReleaseDMSlot } = vi.hoisted(() => ({
  mockRedis: { set: vi.fn(), del: vi.fn(), eval: vi.fn() },
  mockPrisma: {
    automation: { findMany: vi.fn(), findFirst: vi.fn() },
    dmLog: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), updateMany: vi.fn(), upsert: vi.fn() },
    instagramAccount: { findUnique: vi.fn() },
    operationalEvent: { create: vi.fn() },
  },
  mockSendPrivateReply: vi.fn(),
  mockDecryptToken: vi.fn(),
  mockReserveWorkspaceDMSend: vi.fn(),
  mockReleaseWorkspaceDMReservation: vi.fn(),
  mockGetUserFollowStatus: vi.fn(),
  mockReleaseDMSlot: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/queue/client", () => ({
  getDMQueue: () => ({ add: vi.fn() }),
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
  sendPrivateReply: mockSendPrivateReply,
  sendPrivateReplyWithLinkButton: vi.fn(),
  sendPrivateReplyWithButton: vi.fn(),
  sendDirectMessage: vi.fn(),
  sendDirectMessageWithButton: vi.fn(),
  sendDirectMessageWithLinkButton: vi.fn(),
  sendCommentReply: vi.fn(),
  getUserFollowStatus: mockGetUserFollowStatus,
  MetaApiError: class MetaApiError extends Error { code = 0; },
  RateLimitError: class RateLimitError extends Error {},
  TokenExpiredError: class TokenExpiredError extends Error {},
}));
vi.mock("@/lib/meta/oauth", () => ({ decryptToken: mockDecryptToken }));
vi.mock("@/lib/utils/rate-limiter", () => ({
  reserveDMSlot: vi.fn().mockResolvedValue({ allowed: true, shouldRequeue: false, shouldSkip: false }),
  releaseDMSlot: mockReleaseDMSlot,
}));
vi.mock("@/lib/billing/usage", () => ({
  reserveWorkspaceDMSend: mockReserveWorkspaceDMSend,
  releaseWorkspaceDMReservation: mockReleaseWorkspaceDMReservation,
}));
vi.mock("@/lib/ops/worker-health", () => ({ recordWorkerAlert: vi.fn() }));

import { createDMWorker } from "../lib/queue/dm-worker";

const automation = {
  id: "auto_1",
  workspaceId: "workspace_1",
  instagramAccountId: "ig_row_1",
  postId: "media_1",
  keywords: ["LINK"],
  dmMessage: "Hey {username}, here is the link",
  isActive: true,
  wholeWordMatch: true,
  matchAnyPost: false,
  matchAnyWord: false,
  pendingNextReel: false,
  openingDmEnabled: false,
  openingDmMessage: null,
  openingDmButtonLabel: null,
  requireFollow: false,
  publicReplyEnabled: false,
  publicReplyMessage: null,
  publicReplyMessages: [],
  linkButtonLabel: null,
  instagramAccount: { id: "ig_row_1", instagramId: "ig_1", accessToken: "encrypted" },
  workspace: { id: "workspace_1" },
  trackedLinks: [],
};

function getProcessor() {
  createDMWorker();
  return (globalThis as Record<string, unknown>).__dmWorkerProcessor as (job: any) => Promise<void>;
}

function commentJob() {
  return {
    name: "process-comment",
    id: "job_1",
    attemptsMade: 0,
    data: {
      instagramAccountId: "ig_1",
      commentId: "comment_1",
      commentText: "I want the LINK",
      commenterId: "user_1",
      commenterName: "user",
      mediaId: "media_1",
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRedis.set.mockResolvedValue("OK");
  mockRedis.del.mockResolvedValue(1);
  mockRedis.eval.mockResolvedValue(1);
  mockPrisma.automation.findMany.mockResolvedValue([automation]);
  mockPrisma.dmLog.findUnique.mockResolvedValue(null);
  mockPrisma.dmLog.findFirst.mockResolvedValue(null);
  mockPrisma.dmLog.create.mockResolvedValue({});
  mockPrisma.dmLog.update.mockResolvedValue({});
  mockPrisma.dmLog.updateMany.mockResolvedValue({ count: 1 });
  mockPrisma.dmLog.upsert.mockResolvedValue({});
  mockPrisma.instagramAccount.findUnique.mockResolvedValue({ workspaceId: "workspace_1" });
  mockPrisma.operationalEvent.create.mockResolvedValue({});
  mockDecryptToken.mockReturnValue("decrypted");
  mockGetUserFollowStatus.mockResolvedValue(true);
  mockReserveWorkspaceDMSend.mockResolvedValue({ allowed: true, periodStart: new Date("2026-09-09T00:00:00.000Z") });
  mockReleaseWorkspaceDMReservation.mockResolvedValue({ count: 1 });
  mockReleaseDMSlot.mockResolvedValue(undefined);
  mockSendPrivateReply.mockResolvedValue({ message_id: "msg_1" });
});

describe("DM worker hardened delivery wiring", () => {
  it("records PENDING before send and atomically promotes the same log to SENT", async () => {
    await getProcessor()(commentJob());

    expect(mockPrisma.dmLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ automationId: "auto_1", commentId: "comment_1", status: "PENDING" }),
    });

    const lockCalls = mockRedis.set.mock.calls;
    expect(lockCalls).toHaveLength(1);
    expect(lockCalls[0][0]).toContain("dm:idempotency:workspace_1:automation:auto_1:comment:comment_1:dm");
    expect(lockCalls[0][1]).toEqual(expect.any(String));
    expect(lockCalls[0].slice(2)).toEqual(["EX", 180, "NX"]);

    expect(mockSendPrivateReply).toHaveBeenCalledTimes(1);
    expect(mockPrisma.dmLog.updateMany).toHaveBeenCalledWith({
      where: { automationId: "auto_1", commentId: "comment_1", status: { not: "SENT" } },
      data: expect.objectContaining({ status: "SENT" }),
    });
  });

  it("records FAILED and atomically releases only the owned Redis delivery lock when Meta send fails", async () => {
    mockSendPrivateReply.mockRejectedValue(new Error("Meta send failed"));

    await expect(getProcessor()(commentJob())).rejects.toThrow("Meta send failed");

    expect(mockPrisma.dmLog.updateMany).toHaveBeenCalledWith({
      where: { automationId: "auto_1", commentId: "comment_1", status: { not: "SENT" } },
      data: expect.objectContaining({ status: "FAILED", errorMessage: "Meta send failed" }),
    });

    expect(mockReleaseDMSlot).not.toHaveBeenCalled();
    expect(mockRedis.eval).toHaveBeenCalledTimes(1);
    const [, , key, token] = mockRedis.eval.mock.calls[0];
    expect(typeof key).toBe("string");
    expect(key).toContain("dm:idempotency:workspace_1:automation:auto_1:comment:comment_1:dm");
    expect(typeof token).toBe("string");
    expect(token).not.toBe("");
  });

  it("releases the quota, reserved rate slot, and delivery lease when follower-status lookup fails after reservation", async () => {
    const failure = new Error("Meta follow-status failed");
    mockGetUserFollowStatus.mockRejectedValueOnce(failure);
    const job = commentJob();
    job.data.commentId = "comment_follow_status_failure";
    automation.requireFollow = true;

    try {
      await expect(getProcessor()(job)).rejects.toThrow("Meta follow-status failed");
    } finally {
      automation.requireFollow = false;
    }

    expect(mockReleaseWorkspaceDMReservation).toHaveBeenCalledWith(
      "workspace_1",
      new Date("2026-09-09T00:00:00.000Z")
    );
    expect(mockReleaseDMSlot).toHaveBeenCalledWith("ig_1");
    expect(mockRedis.eval).toHaveBeenCalledTimes(1);
  });
});
