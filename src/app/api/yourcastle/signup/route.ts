import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/rateLimit';

const FREE_DEAL_LIMIT = parseInt(process.env.YOURCASTLE_FREE_DEAL_LIMIT || '20');
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Escape user-controlled text before interpolating into a Telegram HTML-mode
// message, otherwise a submission containing `<`, `>`, or `&` can break the
// message formatting or inject markup.
function escapeTelegramHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function sendTelegramNotification(text: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' }),
  });
}

export async function POST(request: Request) {
  try {
    const rateLimit = checkRateLimit(request, 'yourcastle-signup');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, email, phone } = body;

    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (
      typeof firstName !== 'string' ||
      typeof lastName !== 'string' ||
      typeof email !== 'string' ||
      typeof phone !== 'string'
    ) {
      return NextResponse.json({ error: 'Invalid field types' }, { status: 400 });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    if (firstName.length > 100 || lastName.length > 100 || email.length > 200 || phone.length > 30) {
      return NextResponse.json({ error: 'Field length exceeds limit' }, { status: 400 });
    }

    // Check for duplicate email
    const { data: existing } = await supabaseAdmin
      .from('yourcastle_signups')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json({ error: 'This email has already claimed a spot.' }, { status: 409 });
    }

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const normalizedEmail = email.toLowerCase().trim();
    const trimmedPhone = phone.trim();

    let gotFreeDeal: boolean;
    let spotNumber: number;

    // Atomically check the free-deal count and insert the signup in one
    // Postgres function call (see
    // supabase/migrations/20260816000000_atomic_yourcastle_free_deal_allocation.sql),
    // so concurrent signups can't both read the same count before either
    // insert lands. TRANSITIONAL FALLBACK: as of 2026-08-19 this migration
    // has not yet been applied to production (see
    // NIGHTAGENT_MIGRATION_STATUS.md — no supabase/psql CLI or DB URL is
    // available to any agent in this sandbox, so it requires a human to run
    // it in the Supabase SQL Editor). Until it's applied, the RPC 404s with
    // PGRST202 and we fall back to the old select-then-insert logic instead
    // of 500ing every signup. Once the migration is confirmed applied,
    // delete the fallback branch below and always use the RPC result.
    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc(
      'allocate_yourcastle_signup',
      {
        p_first_name: trimmedFirstName,
        p_last_name: trimmedLastName,
        p_email: normalizedEmail,
        p_phone: trimmedPhone,
        p_brokerage: 'Your Castle Real Estate',
        p_source: 'yourcastle-event-2026',
        p_free_deal_limit: FREE_DEAL_LIMIT,
      }
    );

    if (!rpcError && rpcData && rpcData.length > 0) {
      gotFreeDeal = rpcData[0].got_free_deal;
      spotNumber = rpcData[0].spot_number;
    } else if (rpcError && rpcError.code === '23505') {
      // Unique violation from inside the RPC's insert — same duplicate-email
      // race the fallback branch's insert handles below, just surfaced via
      // the RPC instead. Not a "function missing" case, so don't fall back.
      return NextResponse.json(
        { error: 'This email has already claimed a spot.' },
        { status: 409 }
      );
    } else {
      if (rpcError) {
        console.error(
          '[yourcastle-signup] atomic allocation RPC unavailable, using fallback:',
          rpcError.message
        );
      }

      // Fallback: read-then-write (narrower pre-existing race, not fixed
      // here — see migration file header for details).
      const { count } = await supabaseAdmin
        .from('yourcastle_signups')
        .select('*', { count: 'exact', head: true });

      const currentCount = count ?? 0;
      gotFreeDeal = currentCount < FREE_DEAL_LIMIT;
      spotNumber = currentCount + 1;

      const { error: insertError } = await supabaseAdmin
        .from('yourcastle_signups')
        .insert({
          first_name: trimmedFirstName,
          last_name: trimmedLastName,
          email: normalizedEmail,
          phone: trimmedPhone,
          brokerage: 'Your Castle Real Estate',
          free_deal: gotFreeDeal,
          spot_number: spotNumber,
          source: 'yourcastle-event-2026',
        });

      if (insertError) {
        // 23505 = unique_violation. The pre-check above is a select-then-insert
        // and is race-prone under concurrent submissions for the same email;
        // the DB-level unique constraint (see
        // supabase/migrations/20260716010000_ensure_yourcastle_signups_email_unique.sql)
        // is the real backstop. Surface the same friendly message here instead
        // of falling through to the generic 500 handler below.
        if (insertError.code === '23505') {
          return NextResponse.json(
            { error: 'This email has already claimed a spot.' },
            { status: 409 }
          );
        }
        throw insertError;
      }
    }

    // Send Telegram notification
    const dealStatus = gotFreeDeal ? `✅ FREE DEAL — Spot #${spotNumber}` : `📋 Waitlisted (no free deal)`;
    await sendTelegramNotification(
      `🎯 <b>New Your Castle Signup!</b>\n\n` +
      `${dealStatus}\n\n` +
      `👤 ${escapeTelegramHtml(firstName)} ${escapeTelegramHtml(lastName)}\n` +
      `📧 ${escapeTelegramHtml(email)}\n` +
      `📱 ${escapeTelegramHtml(phone)}\n\n` +
      `${gotFreeDeal ? `${FREE_DEAL_LIMIT - spotNumber} free deals remaining` : 'All free deals claimed'}`
    );

    return NextResponse.json({
      success: true,
      gotFreeDeal,
      spotNumber,
      remaining: Math.max(0, FREE_DEAL_LIMIT - spotNumber),
    });
  } catch (error) {
    console.error('Signup error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
