import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const FREE_DEAL_LIMIT = parseInt(process.env.YOURCASTLE_FREE_DEAL_LIMIT || '20');

export async function GET() {
  try {
    const { count, error } = await supabaseAdmin
      .from('yourcastle_signups')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json({ claimed: 0, remaining: FREE_DEAL_LIMIT, limit: FREE_DEAL_LIMIT });
    }

    const claimed = count ?? 0;
    const remaining = Math.max(0, FREE_DEAL_LIMIT - claimed);

    return NextResponse.json({ claimed, remaining, limit: FREE_DEAL_LIMIT });
  } catch (error) {
    // supabaseAdmin's query builder can reject (not just resolve with
    // `error`) on network-level failures (DNS, connection reset, etc.).
    // Without this catch, that rejection would surface as an unhandled
    // Next.js 500 instead of the same graceful degraded response already
    // used for the `{ error }` case above.
    console.error('[yourcastle/count] Unexpected error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ claimed: 0, remaining: FREE_DEAL_LIMIT, limit: FREE_DEAL_LIMIT });
  }
}
