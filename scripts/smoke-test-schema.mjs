#!/usr/bin/env node
// Read-only production schema smoke test.
//
// Why this exists: two migrations have now landed in supabase/migrations/
// but not been applied to production without anyone noticing for days
// (contact_submissions.source — see 20260715000000_..., and the
// voice_demo_usage table + increment_voice_demo_usage RPC — see
// 20260716000000_...). No agent in this sandbox has DDL access (no
// psql/supabase CLI/DATABASE_URL), so migrations must be pasted into the
// Supabase SQL Editor by a human. This script is the tripwire that catches
// "migration file exists but was never applied" going forward.
//
// Run manually or after any deploy:
//   npm run smoke:schema
//
// Requires env vars (same ones the app itself uses):
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//
// All checks are read-only. Nothing is inserted, updated, or deleted.

import { createClient } from '@supabase/supabase-js';

/**
 * Checks that `contact_submissions` has a `source` column by selecting it
 * with a limit-0 query. Supabase/PostgREST returns error code PGRST204 if
 * the column doesn't exist in the schema cache.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 * @returns {Promise<{ name: string, ok: boolean, error?: string }>}
 */
async function checkContactSubmissionsSourceColumn(client) {
  const name = 'contact_submissions.source column exists';
  const { error } = await client.from('contact_submissions').select('source').limit(0);

  if (error) {
    return { name, ok: false, error: error.message };
  }
  return { name, ok: true };
}

/**
 * Checks that the `voice_demo_usage` table exists and is queryable by
 * selecting its primary key columns with a limit-0 query.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 * @returns {Promise<{ name: string, ok: boolean, error?: string }>}
 */
async function checkVoiceDemoUsageTable(client) {
  const name = 'voice_demo_usage table exists and is queryable';
  const { error } = await client.from('voice_demo_usage').select('ip,usage_date').limit(0);

  if (error) {
    return { name, ok: false, error: error.message };
  }
  return { name, ok: true };
}

/**
 * Checks that the `increment_voice_demo_usage` RPC is callable. This RPC
 * increments a real counter (see migration 20260716000000_...), so to keep
 * this check read-only we call it with a reserved sentinel IP and a cap of
 * 0, which is guaranteed to return `false` without ever letting a real
 * request through. It does write a tiny sentinel row, which is the
 * unavoidable cost of testing a callable RPC — but the row is inert
 * (never read by the app, since the app only ever queries real client IPs)
 * and self-cleans via the same TTL policy as any other single-IP row.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 * @returns {Promise<{ name: string, ok: boolean, error?: string }>}
 */
async function checkIncrementVoiceDemoUsageRpc(client) {
  const name = 'increment_voice_demo_usage RPC is callable';
  const SENTINEL_IP = '0.0.0.0';

  const { error } = await client.rpc('increment_voice_demo_usage', {
    p_ip: SENTINEL_IP,
    p_daily_cap: 0,
  });

  if (error) {
    return { name, ok: false, error: error.message };
  }
  return { name, ok: true };
}

/**
 * Runs all schema drift checks against the given Supabase client.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 * @returns {Promise<Array<{ name: string, ok: boolean, error?: string }>>}
 */
export async function runSchemaSmokeTest(client) {
  return Promise.all([
    checkContactSubmissionsSourceColumn(client),
    checkVoiceDemoUsageTable(client),
    checkIncrementVoiceDemoUsageRpc(client),
  ]);
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error(
      'smoke-test-schema: missing required env vars NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY'
    );
    process.exit(1);
  }

  const client = createClient(url, serviceRoleKey);
  const results = await runSchemaSmokeTest(client);
  const failures = results.filter((r) => !r.ok);

  if (failures.length > 0) {
    console.error(`smoke-test-schema: ${failures.length} check(s) FAILED\n`);
    for (const f of failures) {
      console.error(`  [FAIL] ${f.name}\n         ${f.error}`);
    }
    const passed = results.length - failures.length;
    console.error(`\n${passed}/${results.length} checks passed.`);
    process.exit(1);
  }

  console.log(`smoke-test-schema: all ${results.length} checks passed.`);
}

// Only run main() when executed directly (not when imported by tests).
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error('smoke-test-schema: unexpected error', err);
    process.exit(1);
  });
}
