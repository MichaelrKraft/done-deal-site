import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';

const FROM_EMAIL = process.env.FROM_EMAIL ?? 'Reme at Done Deal <reme@mail.leadspot.ai>';

async function sendWelcomeEmail(firstName: string, email: string, brokerageName: string, gotFreeDeal: boolean) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://done-deal.co';
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f5f0ea;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0ea;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <tr>
          <td style="background:#2c2420;padding:32px 40px;text-align:center;">
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#84c9d1;">YOUR AI ASSISTANT</p>
            <p style="margin:6px 0 0;font-size:28px;font-weight:700;color:#ffffff;">Meet Reme.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 16px;font-size:16px;color:#2c2420;">Hi ${firstName},</p>
            ${gotFreeDeal ? `
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#5a4e45;">
              You're in — and you claimed a <strong>free deal</strong> as part of the ${brokerageName} beta. I'll coordinate your first transaction at no cost so you can see exactly what I do.
            </p>` : `
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#5a4e45;">
              You're on the list for the ${brokerageName} beta. I'll reach out as soon as your spot opens up.
            </p>`}
            <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#5a4e45;">
              I'm Reme — your AI transaction coordinator. I handle paperwork, track deadlines, and make sure nothing falls through the cracks so you can focus on closing.
            </p>
            <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:32px;">
              <tr>
                <td style="padding:12px 16px;background:#faf8f5;border-radius:8px;border-left:3px solid #84c9d1;">
                  <p style="margin:0;font-size:14px;font-weight:600;color:#2c2420;">Track every deadline</p>
                  <p style="margin:4px 0 0;font-size:13px;color:#7a6e63;">Colorado deadlines calculated from your MEC date automatically.</p>
                </td>
              </tr>
              <tr><td style="height:8px;"></td></tr>
              <tr>
                <td style="padding:12px 16px;background:#faf8f5;border-radius:8px;border-left:3px solid #84c9d1;">
                  <p style="margin:0;font-size:14px;font-weight:600;color:#2c2420;">Draft emails and documents</p>
                  <p style="margin:4px 0 0;font-size:13px;color:#7a6e63;">I queue actions for your approval — you stay in control.</p>
                </td>
              </tr>
              <tr><td style="height:8px;"></td></tr>
              <tr>
                <td style="padding:12px 16px;background:#faf8f5;border-radius:8px;border-left:3px solid #84c9d1;">
                  <p style="margin:0;font-size:14px;font-weight:600;color:#2c2420;">Flag compliance risks</p>
                  <p style="margin:4px 0 0;font-size:13px;color:#7a6e63;">HOA, solar, pre-1978 — I catch issues before they become problems.</p>
                </td>
              </tr>
            </table>
            <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:32px;">
              <tr>
                <td align="center">
                  <a href="${appUrl}" style="display:inline-block;padding:14px 32px;background:#84c9d1;color:#ffffff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">
                    Get Started with Done Deal →
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 4px;font-size:14px;color:#7a6e63;">Talk soon,</p>
            <p style="margin:0;font-size:14px;font-weight:600;color:#2c2420;">Reme</p>
            <p style="margin:2px 0 0;font-size:12px;color:#b0a698;">Your AI Transaction Coordinator · Done Deal</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;background:#faf8f5;border-top:1px solid #e8e2d9;text-align:center;">
            <p style="margin:0;font-size:11px;color:#b0a698;">Done Deal · Colorado's AI Transaction Coordination Platform</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: gotFreeDeal
        ? `You claimed a free deal, ${firstName} — welcome to Done Deal`
        : `You're on the list, ${firstName} — Done Deal beta`,
      html,
    });
  } catch (err) {
    console.error('[WelcomeEmail] Failed to send:', err);
  }
}

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegramNotification(text: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' }),
  });
}

type Params = { params: Promise<{ slug: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { firstName, lastName, email, phone } = body;

    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Verify brokerage exists and is active
    const { data: brokerage } = await supabaseAdmin
      .from('beta_brokerages')
      .select('name, free_deal_limit, source_tag')
      .eq('slug', slug)
      .eq('active', true)
      .single();

    if (!brokerage) {
      return NextResponse.json({ error: 'Invalid brokerage' }, { status: 404 });
    }

    const { free_deal_limit: limit, name: brokerageName, source_tag: source } = brokerage;

    // Check for duplicate email within this brokerage
    const { data: existing } = await supabaseAdmin
      .from('beta_signups')
      .select('id')
      .eq('brokerage_slug', slug)
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json({ error: 'This email has already claimed a spot.' }, { status: 409 });
    }

    // Count current signups for this brokerage
    const { count } = await supabaseAdmin
      .from('beta_signups')
      .select('*', { count: 'exact', head: true })
      .eq('brokerage_slug', slug);

    const currentCount = count ?? 0;
    const gotFreeDeal = currentCount < limit;
    const spotNumber = currentCount + 1;

    const { error: insertError } = await supabaseAdmin
      .from('beta_signups')
      .insert({
        brokerage_slug: slug,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        free_deal: gotFreeDeal,
        spot_number: spotNumber,
        source,
      });

    if (insertError) throw insertError;

    // Send welcome email and Telegram notification in parallel
    void sendWelcomeEmail(firstName.trim(), email.toLowerCase().trim(), brokerageName, gotFreeDeal);

    const dealStatus = gotFreeDeal ? `✅ FREE DEAL — Spot #${spotNumber}` : `📋 Waitlisted (no free deal)`;
    await sendTelegramNotification(
      `🎯 <b>New Beta Signup — ${brokerageName}!</b>\n\n` +
      `${dealStatus}\n\n` +
      `👤 ${firstName} ${lastName}\n` +
      `📧 ${email}\n` +
      `📱 ${phone}\n\n` +
      `${gotFreeDeal ? `${limit - spotNumber} free deals remaining` : 'All free deals claimed'}`
    );

    return NextResponse.json({
      success: true,
      gotFreeDeal,
      spotNumber,
      remaining: Math.max(0, limit - spotNumber),
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
