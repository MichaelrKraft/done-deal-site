import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const FREE_DEAL_LIMIT = parseInt(process.env.YOURCASTLE_FREE_DEAL_LIMIT || '20');

export async function GET() {
  const { count, error } = await supabaseAdmin
    .from('yourcastle_signups')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('[count] Supabase query failed:', error.code);
    return NextResponse.json({ error: 'Count unavailable' }, { status: 500 });
  }

  const claimed = count ?? 0;
  const remaining = Math.max(0, FREE_DEAL_LIMIT - claimed);

  return NextResponse.json({ claimed, remaining, limit: FREE_DEAL_LIMIT });
}
