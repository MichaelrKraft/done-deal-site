import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUrl } from '@/integrations/microsoft-graph'

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

  if (!process.env.MICROSOFT_CLIENT_ID) {
    return NextResponse.json(
      { error: 'Microsoft OAuth not configured' },
      { status: 503 }
    )
  }

  const state = Buffer.from(JSON.stringify({ agentId: agent.id })).toString('base64url')
  const url = getAuthUrl(state)

  return NextResponse.redirect(url)
}
