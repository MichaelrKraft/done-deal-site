import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

// The route now checks a Supabase-backed daily usage cap in addition to the
// in-memory per-minute rate limiter. Default to "allowed" so existing tests
// that don't care about the cap keep working; individual tests override this.
const rpcMock = vi.fn();
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    rpc: (...args: unknown[]) => rpcMock(...args),
  },
}));

async function loadRoute() {
  vi.resetModules();
  return import('../route');
}

// The route only reads method/headers/json() from the request, so a plain
// Request satisfies its runtime needs; cast to NextRequest to match the
// route's declared parameter type.
function makeRequest(body: unknown, ip = '1.2.3.4'): NextRequest {
  return new Request('http://localhost/api/voice-demo', {
    method: 'POST',
    headers: { 'x-forwarded-for': ip, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as NextRequest;
}

// Minimal valid base64 PCM payload the route can wrap into a WAV buffer.
const samplePcmBase64 = Buffer.from([0, 0, 0, 0]).toString('base64');

function geminiSuccessResponse() {
  return {
    ok: true,
    json: async () => ({
      candidates: [
        {
          content: {
            parts: [
              {
                inlineData: {
                  data: samplePcmBase64,
                  mimeType: 'audio/L16;rate=24000',
                },
              },
            ],
          },
        },
      ],
    }),
  };
}

describe('POST /api/voice-demo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_AI_API_KEY = 'test-key';
    fetchMock.mockResolvedValue(geminiSuccessResponse());
    rpcMock.mockResolvedValue({ data: true, error: null });
  });

  it('accepts valid text and returns a WAV audio response', async () => {
    const { POST } = await loadRoute();
    const res = await POST(makeRequest({ text: 'Hello world' }, '30.0.0.1'));

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('audio/wav');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rejects an empty text field', async () => {
    const { POST } = await loadRoute();
    const res = await POST(makeRequest({ text: '   ' }, '30.0.0.2'));

    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 503 when the TTS API key is not configured', async () => {
    delete process.env.GOOGLE_AI_API_KEY;
    const { POST } = await loadRoute();
    const res = await POST(makeRequest({ text: 'Hello world' }, '30.0.0.3'));

    expect(res.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 502 when Gemini responds with an error', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, text: async () => 'upstream error' });
    const { POST } = await loadRoute();
    const res = await POST(makeRequest({ text: 'Hello world' }, '30.0.0.4'));

    expect(res.status).toBe(502);
  });

  it('returns 502 when Gemini responds without audio data', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ candidates: [] }) });
    const { POST } = await loadRoute();
    const res = await POST(makeRequest({ text: 'Hello world' }, '30.0.0.5'));

    expect(res.status).toBe(502);
  });

  it('returns 429 once the per-IP rate limit is exceeded', async () => {
    const { POST } = await loadRoute();
    const ip = '30.0.0.6';

    for (let i = 0; i < 5; i++) {
      const res = await POST(makeRequest({ text: 'Hello world' }, ip));
      expect(res.status).toBe(200);
    }

    const blocked = await POST(makeRequest({ text: 'Hello world' }, ip));
    expect(blocked.status).toBe(429);
    const json = await blocked.json();
    expect(json.error).toMatch(/too many requests/i);
    // The Gemini API must not be called once the rate limit blocks the request.
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });

  it('does not rate-limit a different IP after one IP is exhausted', async () => {
    const { POST } = await loadRoute();

    for (let i = 0; i < 5; i++) {
      await POST(makeRequest({ text: 'Hello world' }, '30.0.0.7'));
    }
    const blocked = await POST(makeRequest({ text: 'Hello world' }, '30.0.0.7'));
    expect(blocked.status).toBe(429);

    const otherIp = await POST(makeRequest({ text: 'Hello world' }, '30.0.0.8'));
    expect(otherIp.status).toBe(200);
  });

  it('returns 429 when the persistent daily usage cap is reached', async () => {
    rpcMock.mockResolvedValue({ data: false, error: null });
    const { POST } = await loadRoute();

    const res = await POST(makeRequest({ text: 'Hello world' }, '30.0.0.9'));

    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.error).toMatch(/daily usage limit/i);
    // The daily cap is checked before the paid Gemini call is made.
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fails closed (429) when the daily cap check errors, protecting against unbounded spend', async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: 'connection refused' } });
    const { POST } = await loadRoute();

    const res = await POST(makeRequest({ text: 'Hello world' }, '30.0.0.10'));

    expect(res.status).toBe(429);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  // Regression test for the exact unapplied-migration state confirmed live in
  // production tonight (2026-08-18) via `npm run smoke:schema`: the
  // `increment_voice_demo_usage` RPC (migration
  // 20260716000000_create_voice_demo_usage.sql) doesn't exist, so PostgREST
  // returns PGRST202. This has reportedly left the voice demo silently
  // returning 500s or unlimited passthrough in some prior sessions' worry —
  // this test proves definitively, end-to-end through the real route (not
  // just the isolated helper), that the daily-cap RPC being 404 blocks the
  // request with 429 and never reaches the paid Gemini TTS API. See
  // NIGHTAGENT_MIGRATION_STATUS.md for the live verification and the fix.
  it('fails closed end-to-end when Supabase 404s the RPC exactly as it does in production right now (PGRST202)', async () => {
    rpcMock.mockResolvedValue({
      data: null,
      error: {
        message:
          'Could not find the function public.increment_voice_demo_usage(p_daily_cap, p_ip) in the schema cache',
        code: 'PGRST202',
      },
    });
    const { POST } = await loadRoute();

    const res = await POST(makeRequest({ text: 'Hello world' }, '30.0.0.14'));

    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.error).toMatch(/daily usage limit/i);
    // The whole point of fail-closed: an unapplied migration must never let
    // requests fall through to the paid, per-call Gemini TTS API.
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('checks the daily cap using the same client IP the per-minute limiter used', async () => {
    const { POST } = await loadRoute();
    const ip = '30.0.0.11';

    await POST(makeRequest({ text: 'Hello world' }, ip));

    // Confirms the route wires getClientIp -> checkVoiceDemoDailyCap correctly
    // rather than passing a stale/different IP (e.g. 'unknown') to the RPC.
    expect(rpcMock).toHaveBeenCalledWith('increment_voice_demo_usage', {
      p_ip: ip,
      p_daily_cap: expect.any(Number),
      p_global_daily_cap: expect.any(Number),
    });
  });

  it('does not call the daily-cap RPC when the per-minute rate limit already blocked the request', async () => {
    const { POST } = await loadRoute();
    const ip = '30.0.0.12';

    for (let i = 0; i < 5; i++) {
      await POST(makeRequest({ text: 'Hello world' }, ip));
    }
    rpcMock.mockClear();

    const blocked = await POST(makeRequest({ text: 'Hello world' }, ip));

    expect(blocked.status).toBe(429);
    // The daily-cap check (and its Supabase write) should be skipped entirely
    // once the cheaper in-memory limiter has already rejected the request.
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('does not call the daily-cap RPC when the TTS API key is not configured', async () => {
    delete process.env.GOOGLE_AI_API_KEY;
    const { POST } = await loadRoute();

    await POST(makeRequest({ text: 'Hello world' }, '30.0.0.13'));

    expect(rpcMock).not.toHaveBeenCalled();
  });

  // Regression test: CLAUDE.md's 2026-08-18 cost audit flagged that `text`
  // had no server- or client-side max length, so a very long paste could in
  // theory request a longer generated-audio duration (the actual cost
  // driver) with no cap. A malicious/careless caller hitting the route
  // directly (bypassing any client-side limit) must still be rejected.
  it('rejects text over the max allowed length before calling the paid Gemini TTS API', async () => {
    const { POST } = await loadRoute();
    const tooLong = 'a'.repeat(501);

    const res = await POST(makeRequest({ text: tooLong }, '30.0.0.15'));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/too long|length/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('accepts text exactly at the max allowed length', async () => {
    const { POST } = await loadRoute();
    const atLimit = 'a'.repeat(500);

    const res = await POST(makeRequest({ text: atLimit }, '30.0.0.16'));

    expect(res.status).toBe(200);
  });

  // Regression test for cfa52fd: unlike the "resolves with an error field"
  // cases above (which checkVoiceDemoDailyCap already handles internally and
  // turns into { allowed: false }), this covers the case where the
  // supabaseAdmin.rpc(...) call itself *rejects* — e.g. a thrown network
  // exception before any response is received. Before the try/catch was
  // added around checkVoiceDemoDailyCap() in the route, this would propagate
  // as an unhandled rejection and surface as a 500, defeating the fail-closed
  // guarantee. It must now be caught and turned into the same 429.
  it('fails closed (429, not an unhandled 500) when checkVoiceDemoDailyCap rejects outright', async () => {
    rpcMock.mockRejectedValue(new Error('fetch failed: ECONNRESET'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { POST } = await loadRoute();

    const res = await POST(makeRequest({ text: 'Hello world' }, '30.0.0.17'));
    const json = await res.json();

    expect(res.status).toBe(429);
    expect(json.error).toMatch(/daily usage limit/i);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      '[voice-demo] usage cap check threw:',
      'fetch failed: ECONNRESET'
    );
  });

  it('fails closed (429) when checkVoiceDemoDailyCap rejects with a non-Error value', async () => {
    rpcMock.mockRejectedValue('network down');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { POST } = await loadRoute();

    const res = await POST(makeRequest({ text: 'Hello world' }, '30.0.0.18'));

    expect(res.status).toBe(429);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      '[voice-demo] usage cap check threw:',
      'Unknown error'
    );
  });
});
