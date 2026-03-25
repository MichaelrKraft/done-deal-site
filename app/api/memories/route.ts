import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server-admin'
import { NextRequest, NextResponse } from 'next/server'
import type { MemoryType } from '@/types/database'

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

  const { data: memories, error } = await supabase
    .from('agent_memories')
    .select('id, memory_type, content, source, created_at')
    .eq('agent_id', agent.id)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ memories: memories ?? [] })
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

  const body: unknown = await request.json()
  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { content, memory_type } = body as { content?: string; memory_type?: string }
  if (!content?.trim()) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  }

  const validTypes: MemoryType[] = ['rule', 'preference', 'context', 'correction']
  const resolvedType: MemoryType = validTypes.includes(memory_type as MemoryType)
    ? (memory_type as MemoryType)
    : 'rule'

  const admin = createAdminClient()
  const { data: memory, error } = await admin
    .from('agent_memories')
    .insert({
      agent_id: agent.id,
      memory_type: resolvedType,
      content: content.trim(),
      source: 'manual',
    })
    .select('id, memory_type, content, source, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ memory })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  const { searchParams } = new URL(request.url)
  const memoryId = searchParams.get('id')
  if (!memoryId) return NextResponse.json({ error: 'Memory id is required' }, { status: 400 })

  // Verify ownership via RLS (select through agent's own client)
  const { data: existing } = await supabase
    .from('agent_memories')
    .select('id')
    .eq('id', memoryId)
    .eq('agent_id', agent.id)
    .single()

  if (!existing) return NextResponse.json({ error: 'Memory not found' }, { status: 404 })

  // Soft-delete via admin client
  const admin = createAdminClient()
  const { error } = await admin
    .from('agent_memories')
    .update({ active: false })
    .eq('id', memoryId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  const body: unknown = await request.json()
  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { id, content } = body as { id?: string; content?: string }
  if (!id || !content?.trim()) {
    return NextResponse.json({ error: 'id and content are required' }, { status: 400 })
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from('agent_memories')
    .select('id')
    .eq('id', id)
    .eq('agent_id', agent.id)
    .single()

  if (!existing) return NextResponse.json({ error: 'Memory not found' }, { status: 404 })

  const admin = createAdminClient()
  const { data: updated, error } = await admin
    .from('agent_memories')
    .update({ content: content.trim() })
    .eq('id', id)
    .select('id, memory_type, content, source, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ memory: updated })
}
