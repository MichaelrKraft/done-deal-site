import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { EmailTemplateCategory } from '@/types/database'

const VALID_CATEGORIES: EmailTemplateCategory[] = [
  'general', 'under_contract', 'pre_closing', 'post_close', 'follow_up', 'compliance',
]

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

  // Verify ownership
  const { data: existing } = await supabase
    .from('email_templates')
    .select('id, agent_id')
    .eq('id', id)
    .single()

  if (!existing) return NextResponse.json({ error: 'Template not found' }, { status: 404 })
  if (existing.agent_id !== agent.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json() as Record<string, unknown>
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if (typeof body.name === 'string') updates.name = body.name
  if (typeof body.subject === 'string') updates.subject = body.subject
  if (typeof body.body === 'string') updates.body = body.body
  if (typeof body.is_shared === 'boolean') updates.is_shared = body.is_shared
  if (Array.isArray(body.variables)) updates.variables = body.variables
  if (body.category && VALID_CATEGORIES.includes(body.category as EmailTemplateCategory)) {
    updates.category = body.category
  }

  const { data: updated, error } = await supabase
    .from('email_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ template: updated })
}

export async function DELETE(
  _request: NextRequest,
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

  // Verify ownership
  const { data: existing } = await supabase
    .from('email_templates')
    .select('id, agent_id')
    .eq('id', id)
    .single()

  if (!existing) return NextResponse.json({ error: 'Template not found' }, { status: 404 })
  if (existing.agent_id !== agent.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await supabase
    .from('email_templates')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
