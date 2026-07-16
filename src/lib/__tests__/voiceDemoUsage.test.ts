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
    expect(rpcMock).toHaveBeenCalledWith('increment_voice_demo_usage', {
      p_ip: '1.2.3.4',
      p_daily_cap: expect.any(Number),
    });
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
});
