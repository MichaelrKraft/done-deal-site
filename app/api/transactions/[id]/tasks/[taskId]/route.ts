import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const { id: transactionId, taskId } = await params
  const supabase = await createClient()

  // Auth: get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get agent for this user
  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  // IDOR: verify task exists and belongs to a transaction owned by this agent
  const { data: task } = await supabase
    .from('tasks')
    .select('id, status, transaction_id')
    .eq('id', taskId)
    .eq('transaction_id', transactionId)
    .single()

  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

  const { data: txn } = await supabase
    .from('transactions')
    .select('agent_id')
    .eq('id', transactionId)
    .single()

  if (!txn || txn.agent_id !== agent.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Parse body
  const body = await request.json()
  const { status } = body as { status?: string }

  if (!status || !['completed', 'pending'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status. Must be "completed" or "pending".' }, { status: 400 })
  }

  // Build update payload
  const updatePayload =
    status === 'completed'
      ? {
          status: 'completed' as const,
          completed_by: agent.id,
          completed_at: new Date().toISOString(),
          completion_method: 'manual' as const,
        }
      : {
          status: 'pending' as const,
          completed_by: null,
          completed_at: null,
          completion_method: null,
        }

  const { data: updated, error } = await supabase
    .from('tasks')
    .update(updatePayload)
    .eq('id', taskId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(updated)
}
