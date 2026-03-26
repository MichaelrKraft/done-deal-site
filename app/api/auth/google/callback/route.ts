import { NextRequest, NextResponse } from 'next/server'
import { exchangeGoogleCode } from '@/integrations/google-workspace'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const error = req.nextUrl.searchParams.get('error')

  if (error || !code) {
    console.error('[Google OAuth] Error or missing code:', error)
    return NextResponse.redirect(new URL('/settings?google=error', req.url))
  }

  const tokens = await exchangeGoogleCode(code)
  if (!tokens) {
    console.error('[Google OAuth] Token exchange failed')
    return NextResponse.redirect(new URL('/settings?google=error', req.url))
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Store tokens on agent record
  const { error: updateError } = await supabase
    .from('agents')
    .update({ google_token: tokens as unknown as Record<string, unknown> })
    .eq('auth_user_id', user.id)

  if (updateError) {
    console.error('[Google OAuth] Failed to store tokens:', updateError.message)
    return NextResponse.redirect(new URL('/settings?google=error', req.url))
  }

  return NextResponse.redirect(new URL('/settings?google=connected', req.url))
}
