import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server-admin'
import { exchangeGoogleCode } from '@/integrations/google-workspace'

export async function GET(request: NextRequest) {
  const url = request.nextUrl
  const code = url.searchParams.get('code')
  const stateParam = url.searchParams.get('state')
  const errorParam = url.searchParams.get('error')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (errorParam) {
    console.error('[google/callback] OAuth error:', errorParam)
    return NextResponse.redirect(`${appUrl}/settings?google=error`)
  }

  if (!code || !stateParam) {
    return NextResponse.redirect(`${appUrl}/settings?google=error`)
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
    return NextResponse.redirect(`${appUrl}/settings?google=error`)
  }

  // Verify the agent belongs to this user
  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('id', agentId)
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) {
    return NextResponse.redirect(`${appUrl}/settings?google=error`)
  }

  // Exchange auth code for tokens
  const tokens = await exchangeGoogleCode(code)
  if (!tokens) {
    return NextResponse.redirect(`${appUrl}/settings?google=error`)
  }

  // Store tokens and set providers using admin client (bypasses RLS)
  const admin = createAdminClient()
  const { error: updateError } = await admin
    .from('agents')
    .update({
      google_token: tokens as unknown as Record<string, unknown>,
      email_provider: 'google',
      calendar_provider: 'google',
    })
    .eq('id', agentId)

  if (updateError) {
    console.error('[google/callback] Failed to store tokens:', updateError.message)
    return NextResponse.redirect(`${appUrl}/settings?google=error`)
  }

  return NextResponse.redirect(`${appUrl}/settings?google=connected`)
}
