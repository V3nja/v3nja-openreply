import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockPrisma,
  mockSendDirectMessage,
  mockDecryptToken,
  mockReserveDMSlot,
  mockReleaseWorkspaceDMReservation,
  mockReserveWorkspaceDMSend,
} = vi.hoisted(() => ({
  mockPrisma: {
    instagramAccount: { findFirst: vi.fn() },
    operationalEvent: { create: vi.fn() },
  },
  mockSendDirectMessage: vi.fn(),
  mockDecryptToken: vi.fn(),
  mockReserveDMSlot: vi.fn(),
  mockReleaseWorkspaceDMReservation: vi.fn(),
  mockReserveWorkspaceDMSend: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/queue/client", () => ({
  getDMQueue: () => ({ add: vi.fn() }),
  getRedisConnection: () => ({ set: vi.fn(), eval: vi.fn(), del: vi.fn() }),
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
  sendDirectMessage: mockSendDirectMessage,
  sendPrivateReply: vi.fn(),
  sendPrivateReplyWithLinkButton: vi.fn(),
  sendPrivateReplyWithButton: vi.fn(),
  sendDirectMessageWithButton: vi.fn(),
  sendDirectMessageWithLinkButton: vi.fn(),
  sendCommentReply: vi.fn(),
  getUserFollowStatus: vi.fn(),
  MetaApiError: class MetaApiError extends Error { code = 0; },
  RateLimitError: class RateLimitError extends Error {},
  TokenExpiredError: class TokenExpiredError extends Error {},
}));
vi.mock("@/lib/meta/oauth", () => ({ decryptToken: mockDecryptToken }));
vi.mock("@/lib/utils/rate-limiter", () => ({ reserveDMSlot: mockReserveDMSlot, releaseDMSlot: vi.fn() }));
vi.mock("@/lib/billing/usage", () => ({
  reserveWorkspaceDMSend: mockReserveWorkspaceDMSend,
  releaseWorkspaceDMReservation: mockReleaseWorkspaceDMReservation,
}));
vi.mock("@/lib/ops/worker-health", () => ({ recordWorkerAlert: vi.fn() }));
vi.mock("@/lib/queue/idempotency", () => ({
  acquireDeliveryLease: vi.fn(),
  markDmLogFailed: vi.fn(),
  markDmLogSent: vi.fn(),
  withDeliveryLock: vi.fn(),
}));

import { createDMWorker } from "../lib/queue/dm-worker";

function getProcessor() {
  createDMWorker();
  return (globalThis as Record<string, unknown>).__dmWorkerProcessor as (job: any) => Promise<void>;
}

function manualJob() {
  return {
    name: "process-manual-message",
    id: "manual_job_1",
    attemptsMade: 0,
    data: {
      workspaceId: "workspace_1",
      instagramAccountId: "ig_row_1",
      recipientId: "user_1",
      text: "hello",
      requestId: "request_1",
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockPrisma.instagramAccount.findFirst.mockResolvedValue({
    id: "ig_row_1",
    instagramId: "ig_1",
    accessToken: "encrypted",
  });
  mockPrisma.operationalEvent.create.mockResolvedValue({});
  mockDecryptToken.mockReturnValue("decrypted");
  mockReserveWorkspaceDMSend.mockResolvedValue({
    allowed: true,
    periodStart: new Date("2026-09-09T00:00:00.000Z"),
  });
  mockReserveDMSlot.mockResolvedValue({
    allowed: true,
    shouldRequeue: false,
    shouldSkip: false,
  });
  mockReleaseWorkspaceDMReservation.mockResolvedValue({ count: 1 });
  mockSendDirectMessage.mockResolvedValue({ message_id: "msg_1" });
});

describe("DM worker manual delivery wiring", () => {
  it("does not fail or release committed usage when only the post-send audit event fails", async () => {
    mockPrisma.operationalEvent.create.mockRejectedValueOnce(new Error("audit database unavailable"));

    await expect(getProcessor()(manualJob())).resolves.toBeUndefined();

    expect(mockSendDirectMessage).toHaveBeenCalledTimes(1);
    expect(mockReleaseWorkspaceDMReservation).not.toHaveBeenCalled();
  });

  it("releases workspace usage when Meta send itself fails", async () => {
    mockSendDirectMessage.mockRejectedValueOnce(new Error("Meta send failed"));

    await expect(getProcessor()(manualJob())).rejects.toThrow("Meta send failed");

    expect(mockReleaseWorkspaceDMReservation).toHaveBeenCalledWith(
      "workspace_1",
      new Date("2026-09-09T00:00:00.000Z")
    );
  });
});
