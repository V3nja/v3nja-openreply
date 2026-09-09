import { randomUUID } from "node:crypto";
import { getRedisConnection } from "./client";
import { prisma } from "@/lib/db/client";

const LOCK_TTL_SECONDS = 180;
const LOCK_RENEW_INTERVAL_MS = 60_000;
const RELEASE_SCRIPT = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
end
return 0
`;
const RENEW_SCRIPT = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("expire", KEYS[1], ARGV[2])
end
return 0
`;

type DmLogDeliveryKey = {
  automationId: string;
  commentId: string;
};

function lockKey(key: string): string {
  return `dm:idempotency:${key}`;
}

async function acquireDeliveryLease(key: string): Promise<string | null> {
  const token = randomUUID();
  const redis = getRedisConnection();
  const result = await redis.set(
    lockKey(key),
    token,
    "EX",
    LOCK_TTL_SECONDS,
    "NX"
  );
  return result === "OK" ? token : null;
}

export async function acquireDeliveryLock(key: string): Promise<boolean> {
  return (await acquireDeliveryLease(key)) !== null;
}

export async function releaseDeliveryLock(
  key: string,
  token?: string
): Promise<void> {
  const redis = getRedisConnection();
  if (!token) {
    await redis.del(lockKey(key));
    return;
  }

  await redis.eval(RELEASE_SCRIPT, 1, lockKey(key), token);
}

async function renewDeliveryLock(key: string, token: string): Promise<boolean> {
  const redis = getRedisConnection();
  const result = await redis.eval(
    RENEW_SCRIPT,
    1,
    lockKey(key),
    token,
    LOCK_TTL_SECONDS
  );
  return Number(result) === 1;
}

/**
 * Runs one automated outbound delivery behind an owner-safe Redis lock.
 *
 * A unique token prevents an older worker from deleting a lock that has since
 * expired and been acquired by another worker. The lock is renewed while Meta
 * is in flight, so a slow external call does not reopen the duplicate-send
 * window at the fixed TTL boundary.
 *
 * A successful send intentionally keeps the lock until TTL expiry. This gives
 * the database update/retry path a safety window against duplicate Meta sends.
 * If Meta rejects the send, the lock is released so BullMQ can retry normally.
 */
export async function withDeliveryLock<T>(
  key: string,
  send: () => Promise<T>
): Promise<{ acquired: true; value: T } | { acquired: false }> {
  const token = await acquireDeliveryLease(key);
  if (!token) return { acquired: false };

  let renewal: NodeJS.Timeout | undefined;
  renewal = setInterval(() => {
    void renewDeliveryLock(key, token).catch(() => {});
  }, LOCK_RENEW_INTERVAL_MS);

  try {
    const value = await send();
    return { acquired: true, value };
  } catch (error) {
    await releaseDeliveryLock(key, token).catch(() => {});
    throw error;
  } finally {
    if (renewal) clearInterval(renewal);
  }
}

/**
 * Atomically records a successful automated DM delivery.
 *
 * updateMany + a status guard makes the database the final arbiter for the
 * delivery state. A concurrent retry can never move an already-SENT log back
 * through another state or overwrite its sent timestamp.
 */
export async function markDmLogSent(
  key: DmLogDeliveryKey,
  dmSentAt: Date = new Date()
): Promise<boolean> {
  const result = await prisma.dmLog.updateMany({
    where: {
      automationId: key.automationId,
      commentId: key.commentId,
      status: { not: "SENT" },
    },
    data: {
      status: "SENT",
      dmSentAt,
      errorMessage: null,
    },
  });

  return result.count === 1;
}

/**
 * Records a failed automated DM without ever regressing an already-successful
 * delivery back to FAILED. This is intentionally conditional for retry races.
 */
export async function markDmLogFailed(
  key: DmLogDeliveryKey,
  errorMessage: string,
  attempts: number
): Promise<boolean> {
  const result = await prisma.dmLog.updateMany({
    where: {
      automationId: key.automationId,
      commentId: key.commentId,
      status: { not: "SENT" },
    },
    data: {
      status: "FAILED",
      attempts,
      errorMessage,
    },
  });

  return result.count === 1;
}
