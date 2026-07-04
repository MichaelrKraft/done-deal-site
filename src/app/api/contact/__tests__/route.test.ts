import { describe, it, expect, beforeEach, vi } from 'vitest';

const insertMock = vi.fn();
const fromMock = vi.fn((_table: string) => ({ insert: insertMock }));

vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: (table: string) => fromMock(table),
  },
}));

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

async function loadRoute() {
  vi.resetModules();
  return import('../route');
}

function makeRequest(body: unknown, ip = '1.2.3.4') {
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'x-forwarded-for': ip, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const validPayload = {
  name: 'Jane Agent',
  email: 'jane@example.com',
  phone: '555-1234',
  company: 'Acme Realty',
  message: 'Interested in a demo.',
};

describe('POST /api/contact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    insertMock.mockResolvedValue({ error: null });
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) });
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    process.env.TELEGRAM_CHAT_ID = 'test-chat-id';
  });

  it('accepts a valid submission, inserts into Supabase, and returns success', async () => {
    const { POST } = await loadRoute();
    const res = await POST(makeRequest(validPayload, '20.0.0.1'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(fromMock).toHaveBeenCalledWith('contact_submissions');
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Jane Agent',
        email: 'jane@example.com',
        message: 'Interested in a demo.',
      })
    );
  });

  it('rejects a submission missing required fields (name, email, message)', async () => {
    const { POST } = await loadRoute();
    const res = await POST(makeRequest({ name: 'No Email' }, '20.0.0.2'));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/required/i);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('rejects an invalid email address', async () => {
    const { POST } = await loadRoute();
    const res = await POST(
      makeRequest({ ...validPayload, email: 'not-an-email' }, '20.0.0.3')
    );
    expect(res.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('rejects non-string field types', async () => {
    const { POST } = await loadRoute();
    const res = await POST(
      makeRequest({ ...validPayload, name: 12345 }, '20.0.0.4')
    );
    expect(res.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('returns 429 once the per-IP rate limit is exceeded', async () => {
    const { POST } = await loadRoute();
    const ip = '20.0.0.5';

    for (let i = 0; i < 5; i++) {
      const res = await POST(makeRequest(validPayload, ip));
      expect(res.status).toBe(200);
    }

    const blocked = await POST(makeRequest(validPayload, ip));
    expect(blocked.status).toBe(429);
    const json = await blocked.json();
    expect(json.error).toMatch(/too many requests/i);
  });

  it('does not rate-limit a different IP after one IP is exhausted', async () => {
    const { POST } = await loadRoute();

    for (let i = 0; i < 5; i++) {
      await POST(makeRequest(validPayload, '20.0.0.6'));
    }
    const blocked = await POST(makeRequest(validPayload, '20.0.0.6'));
    expect(blocked.status).toBe(429);

    const otherIp = await POST(makeRequest(validPayload, '20.0.0.7'));
    expect(otherIp.status).toBe(200);
  });

  // Regression test: the Bug Agent found that user-controlled fields were
  // interpolated raw into Telegram's parse_mode: 'HTML' message, so a
  // submission containing `<`, `>`, or `&` could break formatting or inject
  // markup. escapeTelegramHtml() must sanitize every interpolated field.
  it('regression: escapes HTML-special characters before sending to Telegram', async () => {
    const { POST } = await loadRoute();
    const maliciousPayload = {
      name: '<b>Evil</b> & Co',
      email: 'evil@example.com',
      phone: '<script>alert(1)</script>',
      company: 'A & B "Realty" <Group>',
      message: 'Hello <img src=x onerror=alert(1)> & goodbye',
    };

    const res = await POST(makeRequest(maliciousPayload, '20.0.0.8'));
    expect(res.status).toBe(200);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, requestInit] = fetchMock.mock.calls[0];
    const body = JSON.parse((requestInit as RequestInit).body as string);

    expect(body.text).not.toContain('<b>Evil</b>');
    expect(body.text).not.toContain('<script>');
    expect(body.text).not.toContain('<img');
    expect(body.text).toContain('&lt;b&gt;Evil&lt;/b&gt; &amp; Co');
    expect(body.text).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(body.text).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('returns 500 without crashing when the Supabase insert fails', async () => {
    insertMock.mockResolvedValueOnce({ error: new Error('db down') });
    const { POST } = await loadRoute();

    const res = await POST(makeRequest(validPayload, '20.0.0.9'));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toMatch(/internal server error/i);
  });

  it('skips the Telegram call when bot credentials are not configured', async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;
    const { POST } = await loadRoute();

    const res = await POST(makeRequest(validPayload, '20.0.0.10'));
    expect(res.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
