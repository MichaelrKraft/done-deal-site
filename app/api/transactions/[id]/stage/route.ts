import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { TransactionStage } from '@/types/database'

const ALLOWED_STAGES: TransactionStage[] = [
  'pre_listing',
  'active_listing',
  'under_contract',
  'pre_closing',
  'closed',
]

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }

  const body: unknown = await request.json()
  if (
    typeof body !== 'object' ||
    body === null ||
    !('stage' in body) ||
    !ALLOWED_STAGES.includes((body as { stage: TransactionStage }).stage)
  ) {
    return NextResponse.json({ error: 'Invalid stage' }, { status: 400 })
  }

  const stage = (body as { stage: TransactionStage }).stage

  // IDOR protection: verify this transaction belongs to this agent
  const { data: existing } = await supabase
    .from('transactions')
    .select('id, agent_id')
    .eq('id', id)
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
  }

  if (existing.agent_id !== agent.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: updated, error } = await supabase
    .from('transactions')
    .update({ stage })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(updated)
}
