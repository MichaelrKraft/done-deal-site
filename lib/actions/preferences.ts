'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server-admin'

interface SavePreferencesResult {
  error: string | null
}

export async function savePreferences(
  preferences: Record<string, string>
): Promise<SavePreferencesResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Use admin client to update the preferences jsonb field
  const adminSupabase = createAdminClient()

  const { error } = await adminSupabase
    .from('agents')
    .update({ preferences })
    .eq('auth_user_id', user.id)

  return { error: error?.message ?? null }
}
