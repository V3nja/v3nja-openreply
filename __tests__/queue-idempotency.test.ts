import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockRedis, mockPrisma } = vi.hoisted(() => ({
  mockRedis: { set: vi.fn(), del: vi.fn(), eval: vi.fn() },
  mockPrisma: { dmLog: { updateMany: vi.fn() } },
}));

vi.mock("../lib/queue/client", () => ({
  getRedisConnection: () => mockRedis,
}));

vi.mock("@/lib/db/client", () => ({
  prisma: mockPrisma,
}));

import {
  acquireDeliveryLease,
  acquireDeliveryLock,
  markDmLogFailed,
  markDmLogSent,
  releaseDeliveryLock,
  withDeliveryLock,
} from "../lib/queue/idempotency";

describe("queue delivery idempotency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedis.set.mockResolvedValue("OK");
    mockRedis.del.mockResolvedValue(1);
    mockRedis.eval.mockResolvedValue(1);
    mockPrisma.dmLog.updateMany.mockResolvedValue({ count: 1 });
  });

  it("acquires a 180-second NX Redis lock with a unique token", async () => {
    await expect(acquireDeliveryLock("workspace:auto:comment:dm")).resolves.toBe(true);
    expect(mockRedis.set).toHaveBeenCalledWith(
      "dm:idempotency:workspace:auto:comment:dm",
      expect.any(String),
      "EX",
      180,
      "NX"
    );
  });

  it("acquires an owner-safe renewable delivery lease", async () => {
    const lease = await acquireDeliveryLease("same-key");

    expect(lease).not.toBeNull();
    expect(mockRedis.set).toHaveBeenCalledWith(
      "dm:idempotency:same-key",
      expect.any(String),
      "EX",
      180,
      "NX"
    );
    await lease!.release();
    expect(mockRedis.eval).toHaveBeenCalledWith(
      expect.stringContaining('redis.call("get", KEYS[1]) == ARGV[1]'),
      1,
      "dm:idempotency:same-key",
      expect.any(String)
    );
  });

  it("uses owner-safe release when a token is supplied", async () => {
    await releaseDeliveryLock("workspace:auto:comment:dm", "owner-token");
    expect(mockRedis.eval).toHaveBeenCalledWith(
      expect.stringContaining('redis.call("get", KEYS[1]) == ARGV[1]'),
      1,
      "dm:idempotency:workspace:auto:comment:dm",
      "owner-token"
    );
  });

  it("keeps the legacy unconditional release helper available", async () => {
    await releaseDeliveryLock("workspace:auto:comment:dm");
    expect(mockRedis.del).toHaveBeenCalledWith(
      "dm:idempotency:workspace:auto:comment:dm"
    );
  });

  it("does not send when another worker owns the lock", async () => {
    mockRedis.set.mockResolvedValue("EXISTS");
    const send = vi.fn();

    await expect(withDeliveryLock("same-key", send)).resolves.toEqual({ acquired: false });
    expect(send).not.toHaveBeenCalled();
  });

  it("keeps the lock after a successful send", async () => {
    const send = vi.fn().mockResolvedValue("meta-ok");

    await expect(withDeliveryLock("same-key", send)).resolves.toEqual({
      acquired: true,
      value: "meta-ok",
    });
    expect(mockRedis.del).not.toHaveBeenCalled();
    expect(mockRedis.eval).not.toHaveBeenCalled();
  });

  it("releases only its own lock when Meta send fails", async () => {
    const send = vi.fn().mockRejectedValue(new Error("Meta failed"));

    await expect(withDeliveryLock("same-key", send)).rejects.toThrow("Meta failed");
    expect(mockRedis.eval).toHaveBeenCalledWith(
      expect.stringContaining('redis.call("get", KEYS[1]) == ARGV[1]'),
      1,
      "dm:idempotency:same-key",
      expect.any(String)
    );
    expect(mockRedis.del).not.toHaveBeenCalled();
  });

  it("marks only a non-SENT DM log as SENT", async () => {
    const sentAt = new Date("2026-09-09T15:00:00.000Z");

    await expect(
      markDmLogSent({ automationId: "auto_1", commentId: "comment_1" }, sentAt)
    ).resolves.toBe(true);

    expect(mockPrisma.dmLog.updateMany).toHaveBeenCalledWith({
      where: {
        automationId: "auto_1",
        commentId: "comment_1",
        status: { not: "SENT" },
      },
      data: {
        status: "SENT",
        dmSentAt: sentAt,
        errorMessage: null,
      },
    });
  });

  it("reports a lost conditional SENT transition without regressing state", async () => {
    mockPrisma.dmLog.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      markDmLogSent({ automationId: "auto_1", commentId: "comment_1" })
    ).resolves.toBe(false);
  });

  it("marks failures only while the delivery is not already SENT", async () => {
    await expect(
      markDmLogFailed({ automationId: "auto_1", commentId: "comment_1" }, "API Error", 3)
    ).resolves.toBe(true);

    expect(mockPrisma.dmLog.updateMany).toHaveBeenCalledWith({
      where: {
        automationId: "auto_1",
        commentId: "comment_1",
        status: { not: "SENT" },
      },
      data: {
        status: "FAILED",
        attempts: 3,
        errorMessage: "API Error",
      },
    });
  });
});
