import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

const FROM_EMAIL = process.env.FROM_EMAIL ?? 'Reme at Done Deal <reme@mail.leadspot.ai>';
const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? 'support@leadspot.ai';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Submission = {
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string;
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function pickString(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const trimmed = v.trim();
  if (trimmed.length === 0 || trimmed.length > max) return null;
  return trimmed;
}

function validateAndNormalize(
  body: Record<string, unknown>,
): { ok: true; data: Submission } | { ok: false; error: string } {
  const name = pickString(body.name, 100);
  if (!name) return { ok: false, error: 'Name is required (max 100 characters)' };

  const emailRaw = pickString(body.email, 200);
  if (!emailRaw) return { ok: false, error: 'Email is required (max 200 characters)' };
  const email = emailRaw.toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'Invalid email format' };

  const message = pickString(body.message, 5000);
  if (!message) return { ok: false, error: 'Message is required (max 5000 characters)' };

  const phone = typeof body.phone === 'string' && body.phone.trim().length > 0
    ? pickString(body.phone, 30) ?? null
    : null;
  if (body.phone && phone === null) return { ok: false, error: 'Phone exceeds 30 characters' };

  const company = typeof body.company === 'string' && body.company.trim().length > 0
    ? pickString(body.company, 200) ?? null
    : null;
  if (body.company && company === null) return { ok: false, error: 'Company exceeds 200 characters' };

  return { ok: true, data: { name, email, phone, company, message } };
}

async function sendContactEmail(s: Submission) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const html = `
<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f5f0ea;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0ea;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <tr><td style="background:#2c2420;padding:24px 40px;">
          <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#84c9d1;">DONE DEAL</p>
          <p style="margin:6px 0 0;font-size:22px;font-weight:700;color:#ffffff;">New Contact Form Submission</p>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <table cellpadding="0" cellspacing="0" style="width:100%;">
            <tr><td style="padding:8px 0;font-size:13px;color:#7a6e63;width:100px;">Name</td><td style="padding:8px 0;font-size:14px;color:#2c2420;font-weight:600;">${escapeHtml(s.name)}</td></tr>
            <tr><td style="padding:8px 0;font-size:13px;color:#7a6e63;">Email</td><td style="padding:8px 0;font-size:14px;color:#2c2420;"><a href="mailto:${escapeHtml(s.email)}" style="color:#84c9d1;text-decoration:none;">${escapeHtml(s.email)}</a></td></tr>
            <tr><td style="padding:8px 0;font-size:13px;color:#7a6e63;">Phone</td><td style="padding:8px 0;font-size:14px;color:#2c2420;">${s.phone ? escapeHtml(s.phone) : '—'}</td></tr>
            <tr><td style="padding:8px 0;font-size:13px;color:#7a6e63;">Company</td><td style="padding:8px 0;font-size:14px;color:#2c2420;">${s.company ? escapeHtml(s.company) : '—'}</td></tr>
          </table>
          <div style="margin-top:24px;padding:16px;background:#faf8f5;border-radius:8px;border-left:3px solid #84c9d1;">
            <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#7a6e63;">Message</p>
            <p style="margin:0;font-size:14px;line-height:1.6;color:#2c2420;white-space:pre-wrap;">${escapeHtml(s.message)}</p>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [CONTACT_TO_EMAIL],
      replyTo: s.email,
      subject: `New Done Deal contact: ${s.name}`,
      html,
    });
  } catch (err) {
    console.error('[contact] Resend send failed:', err);
  }
}

async function sendTelegramNotification(text: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' }),
    });
  } catch (err) {
    console.error('[contact] Telegram notification failed:', err);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    if (typeof body.website === 'string' && body.website.trim().length > 0) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const ip = getClientIp(request);
    const rl = checkRateLimit('contact', ip, 5, 60 * 60 * 1000);
    if (!rl.allowed) return rateLimitResponse(rl);

    const result = validateAndNormalize(body);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

    const submission = result.data;
    const userAgent = request.headers.get('user-agent');

    const { error: insertError } = await supabaseAdmin
      .from('contact_submissions')
      .insert({
        name: submission.name,
        email: submission.email,
        phone: submission.phone,
        company: submission.company,
        message: submission.message,
        ip: ip === 'unknown' ? null : ip,
        user_agent: userAgent,
      });

    if (insertError) {
      console.error('[contact] Supabase insert failed:', insertError);
      return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 });
    }

    void sendContactEmail(submission);
    void sendTelegramNotification(
      `📨 <b>New Done Deal contact</b>\n\n` +
      `👤 ${escapeHtml(submission.name)}\n` +
      `📧 ${escapeHtml(submission.email)}\n` +
      `📱 ${submission.phone ? escapeHtml(submission.phone) : '—'}\n` +
      `🏢 ${submission.company ? escapeHtml(submission.company) : '—'}\n\n` +
      `💬 ${escapeHtml(submission.message.slice(0, 200))}${submission.message.length > 200 ? '…' : ''}`,
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('[contact] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
