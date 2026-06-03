// In-memory IP rate limiter. Per-process state (resets on cold start on serverless).
// Good enough for landing page abuse prevention; not for distributed accounting.

type Bucket = { count: number; resetAt: number };

const stores = new Map<string, Map<string, Bucket>>();

function getStore(name: string): Map<string, Bucket> {
  let store = stores.get(name);
  if (!store) {
    store = new Map();
    stores.set(name, store);
  }
  return store;
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export function checkRateLimit(
  name: string,
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const store = getStore(name);
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || now >= bucket.resetAt) {
    const fresh = { count: 1, resetAt: now + windowMs };
    store.set(key, fresh);
    pruneIfNeeded(store, now);
    return { allowed: true, remaining: limit - 1, resetAt: fresh.resetAt };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}

function pruneIfNeeded(store: Map<string, Bucket>, now: number) {
  if (store.size <= 5000) return;
  for (const [k, v] of store) {
    if (now >= v.resetAt) store.delete(k);
  }
}

export function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]?.trim() || 'unknown';
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

export function rateLimitResponse(result: RateLimitResult): Response {
  const retryAfter = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please try again later.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
      },
    },
  );
}
