import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agent } = await supabase
    .from('agents')
    .select('soul_document')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  return NextResponse.json({ soul_document: agent.soul_document })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: unknown = await request.json()
  if (typeof body !== 'object' || body === null || !('soul_document' in body)) {
    return NextResponse.json({ error: 'soul_document is required' }, { status: 400 })
  }

  const soulDocument = (body as { soul_document: unknown }).soul_document
  if (typeof soulDocument !== 'string') {
    return NextResponse.json({ error: 'soul_document must be a string' }, { status: 400 })
  }

  const { error } = await supabase
    .from('agents')
    .update({ soul_document: soulDocument })
    .eq('auth_user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
