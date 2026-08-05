import { describe, it, expect, beforeEach, vi } from 'vitest';

// Chainable Supabase mock supporting the two call shapes used by this route:
//   supabaseAdmin.from(...).select(...).eq(...).single()   -> duplicate check
//   supabaseAdmin.from(...).select(..., { count, head })   -> count query
//   supabaseAdmin.from(...).insert(...)                    -> insert
const singleMock = vi.fn();
const eqMock = vi.fn(() => ({ single: singleMock }));
const insertMock = vi.fn();

let countResponse: { count: number | null } = { count: 0 };

const selectMock = vi.fn((..._args: unknown[]) => {
  // The count query passes a second arg `{ count: 'exact', head: true }` and
  // is awaited directly (no .eq()/.single() chaining) in the route code.
  return Object.assign(Promise.resolve(countResponse), { eq: eqMock });
});

const fromMock = vi.fn((_table: string) => ({
  select: selectMock,
  insert: insertMock,
}));

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
  return new Request('http://localhost/api/yourcastle/signup', {
    method: 'POST',
    headers: { 'x-forwarded-for': ip, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const validPayload = {
  firstName: 'Jane',
  lastName: 'Agent',
  email: 'jane@example.com',
  phone: '555-1234',
};

describe('POST /api/yourcastle/signup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    singleMock.mockResolvedValue({ data: null }); // no existing signup by default
    countResponse = { count: 0 };
    insertMock.mockResolvedValue({ error: null });
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) });
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    process.env.TELEGRAM_CHAT_ID = 'test-chat-id';
    process.env.YOURCASTLE_FREE_DEAL_LIMIT = '20';
  });

  it('accepts a valid signup and returns success with free-deal eligibility', async () => {
    const { POST } = await loadRoute();
    const res = await POST(makeRequest(validPayload, '30.0.0.1'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.gotFreeDeal).toBe(true);
    expect(json.spotNumber).toBe(1);
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        first_name: 'Jane',
        last_name: 'Agent',
        email: 'jane@example.com',
      })
    );
  });

  it('rejects a submission missing required fields', async () => {
    const { POST } = await loadRoute();
    const res = await POST(makeRequest({ firstName: 'Jane' }, '30.0.0.2'));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/required/i);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('rejects an invalid email address', async () => {
    const { POST } = await loadRoute();
    const res = await POST(
      makeRequest({ ...validPayload, email: 'bad-email' }, '30.0.0.3')
    );
    expect(res.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('returns 409 when the email has already signed up', async () => {
    singleMock.mockResolvedValueOnce({ data: { id: 'existing-id' } });
    const { POST } = await loadRoute();

    const res = await POST(makeRequest(validPayload, '30.0.0.4'));
    expect(res.status).toBe(409);
    expect(insertMock).not.toHaveBeenCalled();
  });

  // Regression test: the Bug Agent found that a concurrent duplicate-email
  // submission which raced past the select-then-insert pre-check (both
  // requests see no existing row, then both attempt an insert) hit the DB's
  // unique constraint and fell through to the generic 500 handler instead of
  // the friendly 409 "already claimed" response the pre-check path returns.
  // insertError.code === '23505' (Postgres unique_violation) must short-circuit
  // to the same 409 response.
  it('regression: returns friendly 409 (not 500) when insert hits a 23505 unique-violation race', async () => {
    insertMock.mockResolvedValueOnce({
      error: { code: '23505', message: 'duplicate key value violates unique constraint' },
    });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { POST } = await loadRoute();

    const res = await POST(makeRequest(validPayload, '30.0.0.9'));
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.error).toBe('This email has already claimed a spot.');
    expect(consoleSpy).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('waitlists signups once the free-deal limit is reached', async () => {
    countResponse = { count: 20 }; // FREE_DEAL_LIMIT default is 20
    const { POST } = await loadRoute();

    const res = await POST(makeRequest(validPayload, '30.0.0.5'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.gotFreeDeal).toBe(false);
    expect(json.spotNumber).toBe(21);
    expect(json.remaining).toBe(0);
  });

  it('returns 429 once the per-IP rate limit is exceeded', async () => {
    const { POST } = await loadRoute();
    const ip = '30.0.0.6';

    for (let i = 0; i < 5; i++) {
      const uniquePayload = { ...validPayload, email: `jane${i}@example.com` };
      const res = await POST(makeRequest(uniquePayload, ip));
      expect(res.status).toBe(200);
    }

    const blocked = await POST(
      makeRequest({ ...validPayload, email: 'jane-blocked@example.com' }, ip)
    );
    expect(blocked.status).toBe(429);
  });

  // Regression test: the Bug Agent found that user-controlled fields were
  // interpolated raw into Telegram's parse_mode: 'HTML' message, so a
  // submission containing `<`, `>`, or `&` could break formatting or inject
  // markup. escapeTelegramHtml() must sanitize every interpolated field.
  it('regression: escapes HTML-special characters before sending to Telegram', async () => {
    const { POST } = await loadRoute();
    const maliciousPayload = {
      firstName: '<b>Jane</b>',
      lastName: 'A & B',
      email: 'evil@example.com',
      phone: '<script>alert(1)</script>',
    };

    const res = await POST(makeRequest(maliciousPayload, '30.0.0.7'));
    expect(res.status).toBe(200);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, requestInit] = fetchMock.mock.calls[0];
    const body = JSON.parse((requestInit as RequestInit).body as string);

    expect(body.text).not.toContain('<b>Jane</b>');
    expect(body.text).not.toContain('<script>');
    expect(body.text).toContain('&lt;b&gt;Jane&lt;/b&gt;');
    expect(body.text).toContain('A &amp; B');
    expect(body.text).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('returns 500 without logging the raw error object when the insert fails', async () => {
    insertMock.mockResolvedValueOnce({ error: new Error('db down') });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { POST } = await loadRoute();

    const res = await POST(makeRequest(validPayload, '30.0.0.8'));
    expect(res.status).toBe(500);

    // Regression: previously logged the raw error object (risk of leaking
    // stack traces/internals); now must log only error.message as a string.
    expect(consoleSpy).toHaveBeenCalledWith('Signup error:', 'db down');
    const loggedArgs = consoleSpy.mock.calls[0];
    expect(loggedArgs[1]).toBe('db down');
    expect(loggedArgs[1]).not.toBeInstanceOf(Error);
  });
});
