type Bucket = {
  count: number;
  resetAt: number;
};

const memoryBuckets = new Map<string, Bucket>();

export function consumeRateLimit(key: string, maxHits = 20, windowMs = 5 * 60_000): boolean {
  const now = Date.now();
  const current = memoryBuckets.get(key);

  if (!current || current.resetAt <= now) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (current.count >= maxHits) {
    return false;
  }

  current.count += 1;
  memoryBuckets.set(key, current);
  return true;
}
