import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

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
