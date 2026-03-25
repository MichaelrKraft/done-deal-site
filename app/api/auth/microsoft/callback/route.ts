import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server-admin'
import { exchangeCode } from '@/integrations/microsoft-graph'

export async function GET(request: NextRequest) {
  const url = request.nextUrl
  const code = url.searchParams.get('code')
  const stateParam = url.searchParams.get('state')
  const errorParam = url.searchParams.get('error')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (errorParam) {
    console.error('[microsoft/callback] OAuth error:', errorParam)
    return NextResponse.redirect(`${appUrl}/settings?outlook=error`)
  }

  if (!code || !stateParam) {
    return NextResponse.redirect(`${appUrl}/settings?outlook=error`)
  }

  // Verify the user is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(`${appUrl}/login`)
  }

  // Decode state to get agent ID
  let agentId: string
  try {
    const parsed = JSON.parse(Buffer.from(stateParam, 'base64url').toString()) as { agentId: string }
    agentId = parsed.agentId
  } catch {
    return NextResponse.redirect(`${appUrl}/settings?outlook=error`)
  }

  // Verify the agent belongs to this user
  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('id', agentId)
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) {
    return NextResponse.redirect(`${appUrl}/settings?outlook=error`)
  }

  // Exchange auth code for tokens
  const tokens = await exchangeCode(code)
  if (!tokens) {
    return NextResponse.redirect(`${appUrl}/settings?outlook=error`)
  }

  // Store tokens using admin client (bypasses RLS)
  const admin = createAdminClient()
  const { error: updateError } = await admin
    .from('agents')
    .update({ outlook_token: tokens as unknown as Record<string, unknown> })
    .eq('id', agentId)

  if (updateError) {
    console.error('[microsoft/callback] Failed to store tokens:', updateError.message)
    return NextResponse.redirect(`${appUrl}/settings?outlook=error`)
  }

  return NextResponse.redirect(`${appUrl}/settings?outlook=connected`)
}
