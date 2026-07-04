// Simple in-memory IP-based rate limiter for public POST endpoints.
// Suitable for a low-traffic marketing site running as a single Node process.
// Note: this resets on server restart/redeploy and does not share state across
// multiple instances. If the site ever scales to multiple instances behind a
// load balancer, replace with a shared store (e.g. Supabase table or Upstash).

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const WINDOW_MS = 60_000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 5;

const buckets = new Map<string, RateLimitEntry>();

// Periodically clear stale entries so the map doesn't grow unbounded.
const CLEANUP_INTERVAL_MS = 10 * 60_000;
let lastCleanup = Date.now();

function cleanupIfNeeded() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, entry] of buckets) {
    if (now - entry.windowStart > WINDOW_MS) {
      buckets.delete(key);
    }
  }
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

export function checkRateLimit(
  request: Request,
  routeKey: string
): { allowed: boolean; remaining: number } {
  cleanupIfNeeded();

  const ip = getClientIp(request);
  const key = `${routeKey}:${ip}`;
  const now = Date.now();

  const existing = buckets.get(key);

  if (!existing || now - existing.windowStart > WINDOW_MS) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (existing.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }

  existing.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - existing.count };
}
