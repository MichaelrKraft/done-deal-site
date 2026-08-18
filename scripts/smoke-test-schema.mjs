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
// All checks are read-only / non-mutating. Nothing real is inserted,
// updated, or deleted (the RPC check probes function existence via an
// intentionally-invalid call, never a real invocation).

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
 * Checks that the `increment_voice_demo_usage` RPC exists, without calling
 * it (the RPC always writes — it's an atomic upsert-and-check with no
 * read-only mode — so calling it would mutate production data on every
 * smoke test run). Instead this queries Postgres's function catalog via
 * PostgREST's `rpc` introspection: calling with a deliberately wrong
 * argument shape (`p_nonexistent_arg`) fails fast with PGRST202 (function
 * not found in schema cache) if the RPC doesn't exist, vs. a Postgres-level
 * "no function matches" style error if it does exist but the signature
 * doesn't match what we passed — both distinguishable from a real call.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 * @returns {Promise<{ name: string, ok: boolean, error?: string }>}
 */
async function checkIncrementVoiceDemoUsageRpc(client) {
  const name = 'increment_voice_demo_usage RPC exists';

  const { error } = await client.rpc('increment_voice_demo_usage', {
    p_nonexistent_arg: true,
  });

  // PGRST202 = PostgREST couldn't find any function by this name at all.
  // Any other error (e.g. a Postgres "function ... does not exist" for this
  // specific argument signature) means the function name IS registered,
  // just not with these bogus args — which is what we're checking for.
  if (error?.code === 'PGRST202') {
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

/**
 * Runs the smoke test and prints results.
 *
 * `--non-blocking` (used by the `postbuild` hook so a known/unresolved
 * production migration gap never fails a Render deploy): missing env vars
 * or check failures are still printed loudly to stderr, but the process
 * exits 0 either way. This exists so the drift is impossible to miss in
 * build logs without holding unrelated deploys hostage to a problem only a
 * human with Supabase SQL Editor access can actually fix (see
 * NIGHTAGENT_MIGRATION_STATUS.md).
 *
 * Without the flag (the `smoke:schema` script, for manual/CI-with-DB-access
 * use), missing env vars or failures exit 1 as before.
 */
async function main() {
  const nonBlocking = process.argv.includes('--non-blocking');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error(
      'smoke-test-schema: missing required env vars NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY — skipping schema drift check'
    );
    process.exit(nonBlocking ? 0 : 1);
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
    if (nonBlocking) {
      console.error(
        '\nsmoke-test-schema: running in --non-blocking mode (postbuild), NOT failing the build.'
      );
      console.error('See NIGHTAGENT_MIGRATION_STATUS.md for the fix (human action required).');
    }
    process.exit(nonBlocking ? 0 : 1);
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
