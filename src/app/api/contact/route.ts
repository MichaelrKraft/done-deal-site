import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/rateLimit';

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

// Best-effort notification: the contact submission is already persisted by
// the time this runs, so a Telegram failure (bad token, network blip,
// Telegram API outage) must never bubble up and cause the outer try/catch to
// report a successful submission as a 500 to the user.
async function sendTelegramNotification(text: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' }),
    });
    if (!res.ok) {
      console.error('[contact] Telegram notification failed:', res.status);
    }
  } catch (error) {
    console.error('[contact] Telegram notification error:', error instanceof Error ? error.message : 'Unknown error');
  }
}

export async function POST(request: Request) {
  try {
    const rateLimit = checkRateLimit(request, 'contact');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, phone, company, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid field types' }, { status: 400 });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    if (name.length > 200 || email.length > 200 || message.length > 5000) {
      return NextResponse.json({ error: 'Field length exceeds limit' }, { status: 400 });
    }

    const { error: insertError } = await supabaseAdmin
      .from('contact_submissions')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: typeof phone === 'string' ? phone.trim() : null,
        company: typeof company === 'string' ? company.trim() : null,
        message: message.trim(),
        source: 'contact-page',
      });

    if (insertError) throw insertError;

    await sendTelegramNotification(
      `📩 <b>New Demo Request!</b>\n\n` +
      `👤 ${escapeTelegramHtml(name)}\n` +
      `📧 ${escapeTelegramHtml(email)}\n` +
      `📱 ${escapeTelegramHtml(phone || 'Not provided')}\n` +
      `🏢 ${escapeTelegramHtml(company || 'Not provided')}\n\n` +
      `💬 ${escapeTelegramHtml(message)}`
    );

    return NextResponse.json(
      { success: true, message: 'Form submitted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
