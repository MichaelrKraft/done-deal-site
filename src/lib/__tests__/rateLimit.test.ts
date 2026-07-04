import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { checkRateLimit as CheckRateLimitFn } from '../rateLimit';

// rateLimit.ts keeps its bucket Map as module-level state, so each test gets
// a fresh module instance (via resetModules + dynamic import) to avoid
// cross-test pollution and keep tests order-independent.
async function freshRateLimiter(): Promise<{ checkRateLimit: typeof CheckRateLimitFn }> {
  vi.resetModules();
  return import('../rateLimit');
}

function makeRequest(ip = '1.2.3.4'): Request {
  return new Request('http://localhost/api/test', {
    method: 'POST',
    headers: { 'x-forwarded-for': ip },
  });
}

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows requests under the limit within the sliding window', async () => {
    const { checkRateLimit } = await freshRateLimiter();
    const req = makeRequest('10.0.0.1');

    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit(req, 'contact');
      expect(result.allowed).toBe(true);
    }
  });

  it('blocks the 6th request within the same window (429 threshold)', async () => {
    const { checkRateLimit } = await freshRateLimiter();
    const req = makeRequest('10.0.0.2');

    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(req, 'contact').allowed).toBe(true);
    }

    const sixth = checkRateLimit(req, 'contact');
    expect(sixth.allowed).toBe(false);
    expect(sixth.remaining).toBe(0);
  });

  it('decrements the remaining count as requests are used', async () => {
    const { checkRateLimit } = await freshRateLimiter();
    const req = makeRequest('10.0.0.3');

    expect(checkRateLimit(req, 'contact').remaining).toBe(4);
    expect(checkRateLimit(req, 'contact').remaining).toBe(3);
    expect(checkRateLimit(req, 'contact').remaining).toBe(2);
  });

  it('isolates rate limits per IP address', async () => {
    const { checkRateLimit } = await freshRateLimiter();
    const reqA = makeRequest('10.0.0.4');
    const reqB = makeRequest('10.0.0.5');

    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(reqA, 'contact').allowed).toBe(true);
    }
    // IP A is now exhausted, but IP B should be unaffected.
    expect(checkRateLimit(reqA, 'contact').allowed).toBe(false);
    expect(checkRateLimit(reqB, 'contact').allowed).toBe(true);
  });

  it('isolates rate limits per route key for the same IP', async () => {
    const { checkRateLimit } = await freshRateLimiter();
    const req = makeRequest('10.0.0.6');

    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(req, 'contact').allowed).toBe(true);
    }
    expect(checkRateLimit(req, 'contact').allowed).toBe(false);
    // A different route key for the same IP has its own independent bucket.
    expect(checkRateLimit(req, 'yourcastle-signup').allowed).toBe(true);
  });

  it('resets the window and allows requests again after WINDOW_MS elapses', async () => {
    const { checkRateLimit } = await freshRateLimiter();
    const req = makeRequest('10.0.0.7');

    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(req, 'contact').allowed).toBe(true);
    }
    expect(checkRateLimit(req, 'contact').allowed).toBe(false);

    // Advance time past the 60s sliding window.
    vi.setSystemTime(new Date('2026-01-01T00:01:01.000Z'));

    const afterWindow = checkRateLimit(req, 'contact');
    expect(afterWindow.allowed).toBe(true);
    expect(afterWindow.remaining).toBe(4);
  });

  it('falls back to x-real-ip when x-forwarded-for is absent', async () => {
    const { checkRateLimit } = await freshRateLimiter();
    const req = new Request('http://localhost/api/test', {
      method: 'POST',
      headers: { 'x-real-ip': '9.9.9.9' },
    });

    const result = checkRateLimit(req, 'contact');
    expect(result.allowed).toBe(true);
  });

  it('treats requests with no IP headers as a shared "unknown" bucket', async () => {
    const { checkRateLimit } = await freshRateLimiter();
    const req = new Request('http://localhost/api/test', { method: 'POST' });

    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(req, 'contact').allowed).toBe(true);
    }
    expect(checkRateLimit(req, 'contact').allowed).toBe(false);
  });

  it('uses only the first IP in a multi-hop x-forwarded-for header', async () => {
    const { checkRateLimit } = await freshRateLimiter();
    const req = new Request('http://localhost/api/test', {
      method: 'POST',
      headers: { 'x-forwarded-for': '5.5.5.5, 10.0.0.1, 10.0.0.2' },
    });

    const req2 = makeRequest('5.5.5.5');

    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(req, 'contact').allowed).toBe(true);
    }
    // Same client IP (first hop) should share the bucket and now be blocked.
    expect(checkRateLimit(req2, 'contact').allowed).toBe(false);
  });
});
