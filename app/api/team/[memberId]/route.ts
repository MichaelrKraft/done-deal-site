import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { TeamRole, TeamPermissions } from '@/types/database'

const VALID_ROLES: TeamRole[] = ['assistant', 'team_lead', 'tc', 'broker']

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const { memberId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  // Verify the membership belongs to this agent
  const { data: membership } = await supabase
    .from('team_memberships')
    .select('id')
    .eq('id', memberId)
    .eq('agent_id', agent.id)
    .single()

  if (!membership) {
    return NextResponse.json({ error: 'Team membership not found' }, { status: 404 })
  }

  const body = await request.json() as Record<string, unknown>
  const updateData: Record<string, unknown> = {}

  if ('role' in body) {
    if (!VALID_ROLES.includes(body.role as TeamRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }
    updateData.role = body.role
  }

  if ('permissions' in body && typeof body.permissions === 'object' && body.permissions !== null) {
    updateData.permissions = body.permissions as TeamPermissions
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const { data: updated, error } = await supabase
    .from('team_memberships')
    .update(updateData)
    .eq('id', memberId)
    .select('id, role, permissions, created_at, member_id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ membership: updated })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const { memberId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  // Verify ownership before deleting
  const { error } = await supabase
    .from('team_memberships')
    .delete()
    .eq('id', memberId)
    .eq('agent_id', agent.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
