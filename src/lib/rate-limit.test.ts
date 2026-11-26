import { describe, it, expect, vi, afterEach } from 'vitest';
import { checkRateLimit, getClientIp, rateLimitResponse } from './rate-limit';

afterEach(() => vi.useRealTimers());

describe('checkRateLimit', () => {
  it('allows up to the limit then blocks', () => {
    const r = [1, 2, 3].map(() => checkRateLimit('t1', 'ip', 2, 1000));
    expect(r.map((x) => x.allowed)).toEqual([true, true, false]);
    expect(r[2].remaining).toBe(0);
  });

  it('resets after the window', () => {
    vi.useFakeTimers();
    checkRateLimit('t2', 'ip', 1, 1000);
    expect(checkRateLimit('t2', 'ip', 1, 1000).allowed).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(checkRateLimit('t2', 'ip', 1, 1000).allowed).toBe(true);
  });

  it('keeps keys and named stores independent', () => {
    checkRateLimit('t3', 'a', 1, 1000);
    expect(checkRateLimit('t3', 'b', 1, 1000).allowed).toBe(true);
    expect(checkRateLimit('t3-other', 'a', 1, 1000).allowed).toBe(true);
  });
});

describe('getClientIp', () => {
  const req = (h: Record<string, string>) => new Request('http://x', { headers: h });
  it('prefers first x-forwarded-for entry', () => {
    expect(getClientIp(req({ 'x-forwarded-for': '1.1.1.1, 2.2.2.2' }))).toBe('1.1.1.1');
  });
  it('falls back to x-real-ip then unknown', () => {
    expect(getClientIp(req({ 'x-real-ip': '3.3.3.3' }))).toBe('3.3.3.3');
    expect(getClientIp(req({}))).toBe('unknown');
  });
});

describe('rateLimitResponse', () => {
  it('returns 429 with Retry-After', () => {
    const res = rateLimitResponse({ allowed: false, remaining: 0, resetAt: Date.now() + 5000 });
    expect(res.status).toBe(429);
    expect(Number(res.headers.get('Retry-After'))).toBeGreaterThanOrEqual(1);
  });
});
