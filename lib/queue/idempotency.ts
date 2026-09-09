import { getRedisConnection } from "./client";

const LOCK_TTL_SECONDS = 180;

/**
 * Acquires a short-lived lock for one outbound automated delivery.
 * The lock is deliberately Redis-backed so concurrent workers cannot both
 * reach Meta for the same automation delivery.
 */
export async function acquireDeliveryLock(key: string): Promise<boolean> {
  const redis = getRedisConnection();
  const result = await redis.set(`dm:idempotency:${key}`, "1", "EX", LOCK_TTL_SECONDS, "NX");
  return result === "OK";
}

export async function releaseDeliveryLock(key: string): Promise<void> {
  await getRedisConnection().del(`dm:idempotency:${key}`);
}

/**
 * Runs one automated outbound delivery behind the Redis lock.
 *
 * A successful send intentionally keeps the lock until TTL expiry. This gives
 * the database update/retry path a safety window against duplicate Meta sends.
 * If Meta rejects the send, the lock is released so BullMQ can retry normally.
 */
export async function withDeliveryLock<T>(
  key: string,
  send: () => Promise<T>
): Promise<{ acquired: true; value: T } | { acquired: false }> {
  const acquired = await acquireDeliveryLock(key);
  if (!acquired) return { acquired: false };

  try {
    const value = await send();
    return { acquired: true, value };
  } catch (error) {
    await releaseDeliveryLock(key).catch(() => {});
    throw error;
  }
}
