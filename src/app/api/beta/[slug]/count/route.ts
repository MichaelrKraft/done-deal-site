import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;

  const { data: brokerage } = await supabaseAdmin
    .from('beta_brokerages')
    .select('free_deal_limit')
    .eq('slug', slug)
    .eq('active', true)
    .single();

  if (!brokerage) {
    return NextResponse.json({ claimed: 0, remaining: 0, limit: 0 }, { status: 404 });
  }

  const limit = brokerage.free_deal_limit;

  const { count, error } = await supabaseAdmin
    .from('beta_signups')
    .select('*', { count: 'exact', head: true })
    .eq('brokerage_slug', slug);

  if (error) {
    return NextResponse.json({ claimed: 0, remaining: limit, limit });
  }

  const claimed = count ?? 0;
  const remaining = Math.max(0, limit - claimed);

  return NextResponse.json({ claimed, remaining, limit });
}
