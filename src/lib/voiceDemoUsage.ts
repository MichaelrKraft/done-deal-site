// Persistent circuit breaker for the Reme voice demo (Gemini TTS is a paid,
// per-call API). The in-memory rate limiter in `rateLimit.ts` resets on every
// redeploy/restart, so it offers no protection against a burst of requests
// hitting the endpoint right after a deploy before it has rebuilt any state.
//
// This module enforces a conservative per-IP daily cap backed by Supabase,
// which survives restarts. It is intentionally simple: one row per
// (ip, day) with a running count, checked and incremented atomically via a
// Postgres function so concurrent requests can't race past the cap.
//
// Fail-closed: if Supabase is unreachable or misconfigured, requests are
// blocked rather than silently allowed through unbounded.

import { supabaseAdmin } from '@/lib/supabase';

const DAILY_CAP_PER_IP = 30;

export interface UsageCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Checks and increments the daily per-IP usage counter for the voice demo.
 * Uses the `increment_voice_demo_usage` Postgres function (see migration
 * 20260716000000_create_voice_demo_usage.sql) so the read-check-write is a
 * single atomic operation and cannot be raced by concurrent requests.
 */
export async function checkVoiceDemoDailyCap(ip: string): Promise<UsageCheckResult> {
  const { data, error } = await supabaseAdmin.rpc('increment_voice_demo_usage', {
    p_ip: ip,
    p_daily_cap: DAILY_CAP_PER_IP,
  });

  if (error) {
    console.error('[voice-demo] usage cap check failed:', error.message);
    // Fail closed: if we can't verify usage against the persistent store,
    // don't let the request through to the paid TTS API.
    return { allowed: false, reason: 'usage verification unavailable' };
  }

  const allowed = data === true;
  return {
    allowed,
    reason: allowed ? undefined : 'daily limit reached',
  };
}
