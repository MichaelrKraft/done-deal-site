import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { AIAction, AIActionStatus } from '@/types/database'

const VALID_STATUSES: AIActionStatus[] = [
  'pending', 'approved', 'rejected', 'executed', 'auto_executed', 'expired',
]

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  const params = request.nextUrl.searchParams
  const status = (params.get('status') ?? 'pending') as AIActionStatus
  const limit = Math.min(Number(params.get('limit') ?? 50), 100)
  const today = params.get('today') === 'true'

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 })
  }

  let query = supabase
    .from('ai_actions')
    .select('*', { count: 'exact' })
    .eq('agent_id', agent.id)
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (today && status === 'executed') {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    query = query.gte('executed_at', startOfDay.toISOString())
  }

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const RISK_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 }
  const actions = (data ?? []) as AIAction[]
  actions.sort((a, b) => (RISK_ORDER[a.risk_level] ?? 1) - (RISK_ORDER[b.risk_level] ?? 1))

  // Fetch transaction details for each action's transaction_id
  const txnIds = [...new Set(actions.map(a => a.transaction_id))]
  const txnMap: Record<string, { property_address: string; stage: string }> = {}

  if (txnIds.length > 0) {
    const { data: txns } = await supabase
      .from('transactions')
      .select('id, property_address, stage')
      .in('id', txnIds)

    for (const t of txns ?? []) {
      txnMap[t.id] = { property_address: t.property_address, stage: t.stage }
    }
  }

  const enriched = actions.map(a => ({
    ...a,
    transaction: txnMap[a.transaction_id] ?? null,
  }))

  return NextResponse.json({ actions: enriched, total: count ?? 0 })
}
