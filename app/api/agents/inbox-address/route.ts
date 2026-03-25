import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateInboxAddress } from '@/lib/inbox-address-generator'

/**
 * POST /api/agents/inbox-address
 *
 * Generates and stores an inbox address for the current agent
 * if one doesn't already exist. Returns the inbox address.
 */
export async function POST(): Promise<NextResponse> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch agent
  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .select('id, name, inbox_address')
    .eq('auth_user_id', user.id)
    .single()

  if (agentError || !agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }

  // If already has an inbox address, return it
  if (agent.inbox_address) {
    return NextResponse.json({ inbox_address: agent.inbox_address })
  }

  // Generate a new inbox address
  const inboxAddress = generateInboxAddress(agent.name)

  const { error: updateError } = await supabase
    .from('agents')
    .update({ inbox_address: inboxAddress })
    .eq('id', agent.id)

  if (updateError) {
    console.error('[inbox-address] Failed to store address:', updateError)
    return NextResponse.json({ error: 'Failed to generate address' }, { status: 500 })
  }

  return NextResponse.json({ inbox_address: inboxAddress })
}
