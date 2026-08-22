import { describe, it, expect, beforeEach, vi } from 'vitest';

// Chainable Supabase mock for the single call shape used by this route:
//   supabaseAdmin.from(...).select(..., { count, head })
// `selectMock` is a plain vi.fn() (not auto-resolving) so individual tests
// can control whether it resolves or rejects.
const selectMock = vi.fn();

const fromMock = vi.fn((_table: string) => ({
  select: selectMock,
}));

vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: (table: string) => fromMock(table),
  },
}));

async function loadRoute() {
  vi.resetModules();
  return import('../route');
}

describe('GET /api/yourcastle/count', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.YOURCASTLE_FREE_DEAL_LIMIT = '20';
  });

  it('returns the claimed/remaining counts on a successful query', async () => {
    selectMock.mockResolvedValueOnce({ count: 5, error: null });
    const { GET } = await loadRoute();

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ claimed: 5, remaining: 15, limit: 20 });
  });

  it('returns a degraded response (not 500) when the query resolves with an error', async () => {
    selectMock.mockResolvedValueOnce({ count: null, error: { message: 'query failed' } });
    const { GET } = await loadRoute();

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ claimed: 0, remaining: 20, limit: 20, unavailable: true });
  });

  // Regression test: the Bug Agent found that supabaseAdmin's query builder
  // can *reject* (not just resolve with an `error` field) on network-level
  // failures such as DNS errors or connection resets. Before the try/catch
  // fix, that rejection propagated out of GET() unhandled and surfaced as a
  // Next.js 500, instead of the same graceful degraded response already used
  // for the resolved-with-error case above.
  it('regression: returns a graceful degraded response (not an unhandled 500) when the Supabase client rejects', async () => {
    selectMock.mockRejectedValueOnce(new Error('fetch failed: ECONNRESET'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { GET } = await loadRoute();

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ claimed: 0, remaining: 20, limit: 20, unavailable: true });
    expect(consoleSpy).toHaveBeenCalledWith(
      '[yourcastle/count] Unexpected error:',
      'fetch failed: ECONNRESET'
    );
  });

  it('regression: does not throw even when the rejection value is not an Error instance', async () => {
    selectMock.mockRejectedValueOnce('network down');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { GET } = await loadRoute();

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ claimed: 0, remaining: 20, limit: 20, unavailable: true });
    expect(consoleSpy).toHaveBeenCalledWith(
      '[yourcastle/count] Unexpected error:',
      'Unknown error'
    );
  });
});
