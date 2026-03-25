import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

type RouteParams = { params: Promise<{ id: string; taskId: string }> }

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  const { id: transactionId, taskId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  // IDOR: verify task belongs to a transaction owned by this agent
  const { data: task } = await supabase
    .from('tasks')
    .select('id, transaction_id')
    .eq('id', taskId)
    .single()

  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

  const { data: transaction } = await supabase
    .from('transactions')
    .select('id, agent_id')
    .eq('id', transactionId)
    .single()

  if (!transaction) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
  if (transaction.agent_id !== agent.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (task.transaction_id !== transactionId) return NextResponse.json({ error: 'Task does not belong to this transaction' }, { status: 400 })

  const { data: notes, error } = await supabase
    .from('task_notes')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(notes ?? [])
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id: transactionId, taskId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  // IDOR: verify task belongs to a transaction owned by this agent
  const { data: task } = await supabase
    .from('tasks')
    .select('id, transaction_id')
    .eq('id', taskId)
    .single()

  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

  const { data: transaction } = await supabase
    .from('transactions')
    .select('id, agent_id')
    .eq('id', transactionId)
    .single()

  if (!transaction) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
  if (transaction.agent_id !== agent.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (task.transaction_id !== transactionId) return NextResponse.json({ error: 'Task does not belong to this transaction' }, { status: 400 })

  // Validate body
  let body: { content?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (typeof body.content !== 'string' || body.content.trim().length === 0) {
    return NextResponse.json({ error: 'content is required and must be a non-empty string' }, { status: 400 })
  }

  if (body.content.length > 2000) {
    return NextResponse.json({ error: 'content must be 2000 characters or fewer' }, { status: 400 })
  }

  const { data: note, error } = await supabase
    .from('task_notes')
    .insert({
      task_id: taskId,
      author_type: 'agent',
      author_id: agent.id,
      content: body.content.trim(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(note, { status: 201 })
}
