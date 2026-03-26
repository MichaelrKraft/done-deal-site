import { NextResponse } from 'next/server'
import { getGoogleAuthUrl } from '@/integrations/google-workspace'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const url = getGoogleAuthUrl(user.id)
  return NextResponse.redirect(url)
}
