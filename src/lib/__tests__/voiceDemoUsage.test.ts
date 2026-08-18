import { describe, it, expect, beforeEach, vi } from 'vitest';

const rpcMock = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    rpc: (...args: unknown[]) => rpcMock(...args),
  },
}));

async function loadModule() {
  vi.resetModules();
  return import('../voiceDemoUsage');
}

describe('checkVoiceDemoDailyCap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows the request when under the daily cap', async () => {
    rpcMock.mockResolvedValue({ data: true, error: null });
    const { checkVoiceDemoDailyCap } = await loadModule();

    const result = await checkVoiceDemoDailyCap('1.2.3.4');

    expect(result.allowed).toBe(true);
    // Assert the exact cap value (30), not just "some number" — this is the
    // documented daily limit and a silent change to it should fail a test.
    expect(rpcMock).toHaveBeenCalledWith('increment_voice_demo_usage', {
      p_ip: '1.2.3.4',
      p_daily_cap: 30,
    });
  });

  it('blocks when the RPC resolves with no error but a non-boolean-true value', async () => {
    // The function does a strict `data === true` check; anything else
    // (undefined, null, non-boolean) must be treated as "not allowed" rather
    // than coerced truthy, since a malformed/unexpected RPC response should
    // never silently let a paid API call through.
    rpcMock.mockResolvedValue({ data: undefined, error: null });
    const { checkVoiceDemoDailyCap } = await loadModule();

    const result = await checkVoiceDemoDailyCap('1.2.3.4');

    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/daily limit/i);
  });

  it('blocks the request when the daily cap is reached', async () => {
    rpcMock.mockResolvedValue({ data: false, error: null });
    const { checkVoiceDemoDailyCap } = await loadModule();

    const result = await checkVoiceDemoDailyCap('1.2.3.4');

    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/daily limit/i);
  });

  it('fails closed (blocks) when the Supabase call errors', async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: 'connection refused' } });
    const { checkVoiceDemoDailyCap } = await loadModule();

    const result = await checkVoiceDemoDailyCap('1.2.3.4');

    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/verification unavailable/i);
  });

  // Regression test for the exact production state confirmed live tonight
  // (2026-08-18) via `npm run smoke:schema`: the `increment_voice_demo_usage`
  // RPC does not exist because migration 20260716000000_create_voice_demo_usage.sql
  // has never been applied. PostgREST returns error code PGRST202 with this
  // exact message shape — not a generic network error — when a function is
  // missing from the schema cache. This asserts the fail-closed path is
  // actually exercised by that specific error, not just "some error object."
  // See NIGHTAGENT_MIGRATION_STATUS.md for the live verification.
  it('fails closed when the RPC is missing (PGRST202 — unapplied migration state)', async () => {
    rpcMock.mockResolvedValue({
      data: null,
      error: {
        message:
          'Could not find the function public.increment_voice_demo_usage(p_daily_cap, p_ip) in the schema cache',
        code: 'PGRST202',
      },
    });
    const { checkVoiceDemoDailyCap } = await loadModule();

    const result = await checkVoiceDemoDailyCap('1.2.3.4');

    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/verification unavailable/i);
  });
});
