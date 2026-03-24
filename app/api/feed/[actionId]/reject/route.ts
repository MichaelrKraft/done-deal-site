import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ actionId: string }> }
) {
  const { actionId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  // IDOR: verify action belongs to this agent
  const { data: action } = await supabase
    .from('ai_actions')
    .select('id, agent_id, status')
    .eq('id', actionId)
    .single()

  if (!action) return NextResponse.json({ error: 'Action not found' }, { status: 404 })
  if (action.agent_id !== agent.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (action.status !== 'pending') {
    return NextResponse.json({ error: 'Action is not pending' }, { status: 400 })
  }

  const { data: updated, error } = await supabase
    .from('ai_actions')
    .update({ status: 'rejected' })
    .eq('id', actionId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(updated)
}
