import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { EmailTemplateCategory } from '@/types/database'

const VALID_CATEGORIES: EmailTemplateCategory[] = [
  'general', 'under_contract', 'pre_closing', 'post_close', 'follow_up', 'compliance',
]

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agent } = await supabase
    .from('agents')
    .select('id, brokerage_id')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  // Return templates owned by this agent OR shared within their brokerage
  const { data: templates, error } = await supabase
    .from('email_templates')
    .select('*')
    .or(`agent_id.eq.${agent.id},and(brokerage_id.eq.${agent.brokerage_id},is_shared.eq.true)`)
    .order('category')
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ templates })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agent } = await supabase
    .from('agents')
    .select('id, brokerage_id')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  const body = await request.json() as Record<string, unknown>
  const { name, subject, body: templateBody, category, variables, is_shared } = body

  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }
  if (!subject || typeof subject !== 'string') {
    return NextResponse.json({ error: 'subject is required' }, { status: 400 })
  }
  if (!templateBody || typeof templateBody !== 'string') {
    return NextResponse.json({ error: 'body is required' }, { status: 400 })
  }
  if (category && !VALID_CATEGORIES.includes(category as EmailTemplateCategory)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
  }

  const { data: created, error } = await supabase
    .from('email_templates')
    .insert({
      agent_id: agent.id,
      brokerage_id: agent.brokerage_id,
      name: name as string,
      subject: subject as string,
      body: templateBody as string,
      category: (category as EmailTemplateCategory) || 'general',
      variables: Array.isArray(variables) ? variables as string[] : [],
      is_shared: typeof is_shared === 'boolean' ? is_shared : false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ template: created }, { status: 201 })
}
