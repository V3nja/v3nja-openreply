import { randomUUID } from "node:crypto";
import { getRedisConnection } from "./client";
import { prisma } from "@/lib/db/client";

const LOCK_TTL_SECONDS = 180;
const LOCK_RENEW_INTERVAL_MS = 60_000;
const LOCK_RENEW_MAX_MS = (LOCK_TTL_SECONDS - 5) * 1000;
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

export type DeliveryLease = {
  release: () => Promise<void>;
};

function lockKey(key: string): string {
  return `dm:idempotency:${key}`;
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
 * Claims an owner-safe Redis delivery lease before any quota/rate reservation.
 * Competing workers fail here and therefore consume no outbound budget.
 *
 * Renewal is deliberately bounded to slightly less than the lock TTL. A
 * successful caller can keep the key through the database transition window,
 * but the lease can never renew indefinitely if a worker forgets to release it.
 */
export async function acquireDeliveryLease(
  key: string
): Promise<DeliveryLease | null> {
  const token = randomUUID();
  const redis = getRedisConnection();
  const result = await redis.set(
    lockKey(key),
    token,
    "EX",
    LOCK_TTL_SECONDS,
    "NX"
  );
  if (result !== "OK") return null;

  let released = false;
  const renewal = setInterval(() => {
    if (released) return;
    void renewDeliveryLock(key, token).catch(() => {});
  }, LOCK_RENEW_INTERVAL_MS);
  const renewalStop = setTimeout(() => clearInterval(renewal), LOCK_RENEW_MAX_MS);

  return {
    release: async () => {
      if (released) return;
      released = true;
      clearInterval(renewal);
      clearTimeout(renewalStop);
      await redis.eval(RELEASE_SCRIPT, 1, lockKey(key), token);
    },
  };
}

/**
 * Legacy boolean acquisition helper. It creates a normal 180-second NX lock
 * without a renewal loop because callers only receive a boolean and therefore
 * have no owner token to safely renew or release it.
 */
export async function acquireDeliveryLock(key: string): Promise<boolean> {
  const redis = getRedisConnection();
  const result = await redis.set(
    lockKey(key),
    randomUUID(),
    "EX",
    LOCK_TTL_SECONDS,
    "NX"
  );
  return result === "OK";
}

/**
 * Legacy explicit release helper. New worker code should prefer the lease's
 * owner-safe release method so an expired lease can never delete a newer one.
 */
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

/**
 * Runs one automated outbound delivery behind an owner-safe Redis lease.
 * A successful send keeps the lock for the bounded lease lifetime so the
 * database transition can complete without reopening the duplicate window.
 */
export async function withDeliveryLock<T>(
  key: string,
  send: () => Promise<T>
): Promise<{ acquired: true; value: T } | { acquired: false }> {
  const lease = await acquireDeliveryLease(key);
  if (!lease) return { acquired: false };

  try {
    const value = await send();
    return { acquired: true, value };
  } catch (error) {
    await lease.release().catch(() => {});
    throw error;
  }
}

/**
 * Atomically records a successful automated DM delivery.
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
 * Records a failed automated DM without regressing an already successful
 * delivery back to FAILED.
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
