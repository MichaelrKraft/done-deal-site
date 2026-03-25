'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server-admin'
import { generateInitialSoul } from '@/lib/soul'

interface SavePreferencesResult {
  error: string | null
}

export async function savePreferences(
  preferences: Record<string, string>
): Promise<SavePreferencesResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const adminSupabase = createAdminClient()

  // Look up the agent's name to generate the soul document
  const { data: agent } = await adminSupabase
    .from('agents')
    .select('name')
    .eq('auth_user_id', user.id)
    .single()

  const agentName = agent?.name ?? 'Agent'
  const soulDocument = generateInitialSoul(agentName, preferences)

  const { error } = await adminSupabase
    .from('agents')
    .update({ preferences, soul_document: soulDocument })
    .eq('auth_user_id', user.id)

  return { error: error?.message ?? null }
}
