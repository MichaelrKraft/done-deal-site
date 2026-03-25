import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { AutonomyMode } from '@/types/database'

const VALID_MODES: AutonomyMode[] = ['supervised', 'autonomous']

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  const body = await request.json() as Record<string, unknown>
  const mode = body.autonomy_mode

  if (typeof mode !== 'string' || !VALID_MODES.includes(mode as AutonomyMode)) {
    return NextResponse.json(
      { error: 'Invalid autonomy_mode. Must be "supervised" or "autonomous".' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('transactions')
    .update({ autonomy_mode: mode as AutonomyMode })
    .eq('id', id)
    .eq('agent_id', agent.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })

  return NextResponse.json({ transaction: data })
}
