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

    // Get current count to determine free deal eligibility
    const { count } = await supabaseAdmin
      .from('yourcastle_signups')
      .select('*', { count: 'exact', head: true });

    const currentCount = count ?? 0;
    const gotFreeDeal = currentCount < FREE_DEAL_LIMIT;
    const spotNumber = currentCount + 1;

    // Insert signup
    const { error: insertError } = await supabaseAdmin
      .from('yourcastle_signups')
      .insert({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        brokerage: 'Your Castle Real Estate',
        free_deal: gotFreeDeal,
        spot_number: spotNumber,
        source: 'yourcastle-event-2026',
      });

    if (insertError) throw insertError;

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
