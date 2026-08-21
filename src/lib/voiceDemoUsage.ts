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
// It also enforces a global (all-IPs) daily cap in the same atomic RPC call
// (see migration 20260821000000_add_voice_demo_global_daily_cap.sql). The
// per-IP cap alone is cost-safe per IP (see CLAUDE.md's Gemini TTS pricing
// audit) but has no ceiling across IPs — a distributed spike (many IPs at
// once) could still run up unbounded aggregate cost. The global cap closes
// that gap with a single shared counter row.
//
// Fail-closed: if Supabase is unreachable or misconfigured, requests are
// blocked rather than silently allowed through unbounded.

import { supabaseAdmin } from '@/lib/supabase';

const DAILY_CAP_PER_IP = 30;

// Aggregate ceiling across all IPs per day. Sized well above the realistic
// per-IP-cap-driven ceiling (see CLAUDE.md: ~$0.02-0.06/day/IP realistic,
// ~$0.45/day/IP worst case) so it only bites during an actual distributed
// spike, not normal multi-visitor traffic. 500 requests/day at worst-case
// per-request cost (~60s of audio, $0.015) is ~$7.50/day aggregate spend cap.
const GLOBAL_DAILY_CAP = 500;

export interface UsageCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Checks and increments the daily per-IP usage counter for the voice demo,
 * plus the daily global (all-IPs) usage counter. Uses the
 * `increment_voice_demo_usage` Postgres function (see migrations
 * 20260716000000_create_voice_demo_usage.sql and
 * 20260821000000_add_voice_demo_global_daily_cap.sql) so the read-check-write
 * for both counters happens in a single atomic operation and cannot be raced
 * by concurrent requests.
 */
export async function checkVoiceDemoDailyCap(ip: string): Promise<UsageCheckResult> {
  const { data, error } = await supabaseAdmin.rpc('increment_voice_demo_usage', {
    p_ip: ip,
    p_daily_cap: DAILY_CAP_PER_IP,
    p_global_daily_cap: GLOBAL_DAILY_CAP,
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
