import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server-admin'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get agent for this user
  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  if (!agent) return NextResponse.json({ error: 'No agent' }, { status: 404 })

  const admin = createAdminClient()

  // Verify action belongs to this agent (IDOR protection)
  const { data: action, error } = await admin
    .from('ai_actions')
    .select('id, agent_id, status')
    .eq('id', id)
    .single()

  if (error || !action) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (action.agent_id !== agent.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (action.status !== 'pending') return NextResponse.json({ error: 'Already processed' }, { status: 409 })

  // Mark as rejected
  await admin
    .from('ai_actions')
    .update({ status: 'rejected' })
    .eq('id', id)

  return NextResponse.json({ ok: true, actionId: id })
}
