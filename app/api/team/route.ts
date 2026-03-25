import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { TeamRole, TeamMembershipRow } from '@/types/database'

const VALID_ROLES: TeamRole[] = ['assistant', 'team_lead', 'tc', 'broker']

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  // Get all team memberships for this agent
  const { data: rawMemberships, error } = await supabase
    .from('team_memberships')
    .select('id, role, permissions, created_at, member_id')
    .eq('agent_id', agent.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const memberships = rawMemberships ?? []
  if (memberships.length === 0) {
    return NextResponse.json({ members: [] })
  }

  // Batch-fetch member agent details
  const memberIds = memberships.map((m) => m.member_id)
  const { data: memberAgents } = await supabase
    .from('agents')
    .select('id, name, email')
    .in('id', memberIds)

  const agentMap = new Map(
    (memberAgents ?? []).map((a) => [a.id, a])
  )

  const members = memberships.map((m) => {
    const a = agentMap.get(m.member_id)
    return {
      id: m.id,
      member_id: m.member_id,
      role: m.role,
      permissions: m.permissions,
      created_at: m.created_at,
      name: a?.name ?? 'Unknown',
      email: a?.email ?? '',
    }
  })

  return NextResponse.json({ members })
}

export async function POST(request: NextRequest) {
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
  const { email, role } = body

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'email is required' }, { status: 400 })
  }
  if (!role || !VALID_ROLES.includes(role as TeamRole)) {
    return NextResponse.json({ error: 'role must be one of: assistant, team_lead, tc, broker' }, { status: 400 })
  }

  // Find the member agent by email
  const { data: memberAgent } = await supabase
    .from('agents')
    .select('id')
    .eq('email', email.trim().toLowerCase())
    .single()

  if (!memberAgent) {
    return NextResponse.json({ error: 'No agent found with that email. They must have a Done Deal account first.' }, { status: 404 })
  }

  if (memberAgent.id === agent.id) {
    return NextResponse.json({ error: 'You cannot add yourself as a team member' }, { status: 400 })
  }

  const { data: created, error } = await supabase
    .from('team_memberships')
    .insert({
      agent_id: agent.id,
      member_id: memberAgent.id,
      role: role as TeamRole,
    })
    .select('id, role, permissions, created_at, member_id')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'This person is already on your team' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ membership: created }, { status: 201 })
}
