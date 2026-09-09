import { getRedisConnection } from "./client";

const LOCK_TTL_SECONDS = 180;

/**
 * Acquires a short-lived lock for one outbound automated delivery.
 * The lock is deliberately Redis-backed so concurrent workers cannot both
 * reach Meta for the same automation/comment pair.
 */
export async function acquireDeliveryLock(key: string): Promise<boolean> {
  const redis = getRedisConnection();
  const result = await redis.set(`dm:idempotency:${key}`, "1", "EX", LOCK_TTL_SECONDS, "NX");
  return result === "OK";
}

export async function releaseDeliveryLock(key: string): Promise<void> {
  await getRedisConnection().del(`dm:idempotency:${key}`);
}
