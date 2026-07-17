import { describe, it, expect, vi } from 'vitest';
import { runSchemaSmokeTest } from '../smoke-test-schema.mjs';

/**
 * Builds a fake Supabase client whose `.from(table).select().limit()` and
 * `.rpc()` calls resolve according to the given error maps, keyed by table
 * name / rpc name. A `null` entry (or missing key) means "no error".
 */
function createFakeClient({
  tableErrors = {},
  rpcErrors = {},
}: {
  tableErrors?: Record<string, { message: string } | undefined>;
  rpcErrors?: Record<string, { message: string } | undefined>;
}) {
  return {
    from: vi.fn((table: string) => ({
      select: vi.fn(() => ({
        limit: vi.fn(async () => ({ data: [], error: tableErrors[table] ?? null })),
      })),
    })),
    rpc: vi.fn(async (fn: string) => ({ data: false, error: rpcErrors[fn] ?? null })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

describe('runSchemaSmokeTest', () => {
  it('reports all checks passing when schema and RPC are present', async () => {
    const client = createFakeClient({});

    const results = await runSchemaSmokeTest(client);

    expect(results).toHaveLength(3);
    expect(results.every((r) => r.ok)).toBe(true);
  });

  it('flags contact_submissions missing the source column', async () => {
    const client = createFakeClient({
      tableErrors: {
        contact_submissions: { message: "Could not find the 'source' column" },
      },
    });

    const results = await runSchemaSmokeTest(client);
    const failure = results.find((r) => r.name.includes('contact_submissions'));

    expect(failure?.ok).toBe(false);
    expect(failure?.error).toMatch(/source/i);
  });

  it('flags a missing voice_demo_usage table', async () => {
    const client = createFakeClient({
      tableErrors: {
        voice_demo_usage: { message: 'relation "voice_demo_usage" does not exist' },
      },
    });

    const results = await runSchemaSmokeTest(client);
    const failure = results.find((r) => r.name.includes('voice_demo_usage table'));

    expect(failure?.ok).toBe(false);
    expect(failure?.error).toMatch(/does not exist/i);
  });

  it('flags a missing increment_voice_demo_usage RPC', async () => {
    const client = createFakeClient({
      rpcErrors: {
        increment_voice_demo_usage: { message: 'function increment_voice_demo_usage does not exist' },
      },
    });

    const results = await runSchemaSmokeTest(client);
    const failure = results.find((r) => r.name.includes('RPC'));

    expect(failure?.ok).toBe(false);
    expect(failure?.error).toMatch(/does not exist/i);
  });

  it('reports multiple simultaneous failures independently', async () => {
    const client = createFakeClient({
      tableErrors: {
        contact_submissions: { message: 'no source column' },
        voice_demo_usage: { message: 'no such table' },
      },
      rpcErrors: {
        increment_voice_demo_usage: { message: 'no such function' },
      },
    });

    const results = await runSchemaSmokeTest(client);

    expect(results.filter((r) => !r.ok)).toHaveLength(3);
  });
});
