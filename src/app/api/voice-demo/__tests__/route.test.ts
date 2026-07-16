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

  it('checks the daily cap using the same client IP the per-minute limiter used', async () => {
    const { POST } = await loadRoute();
    const ip = '30.0.0.11';

    await POST(makeRequest({ text: 'Hello world' }, ip));

    // Confirms the route wires getClientIp -> checkVoiceDemoDailyCap correctly
    // rather than passing a stale/different IP (e.g. 'unknown') to the RPC.
    expect(rpcMock).toHaveBeenCalledWith('increment_voice_demo_usage', {
      p_ip: ip,
      p_daily_cap: expect.any(Number),
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
});
