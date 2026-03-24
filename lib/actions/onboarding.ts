'use server'

import { createClient } from '@/lib/supabase/server'
import type { TransactionSide } from '@/types/database'

interface SaveAgentInfoResult {
  error: string | null
}

export async function saveAgentInfo(
  name: string,
  brokerageCode: string
): Promise<SaveAgentInfoResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Look up brokerage UUID by email domain first, then fall back to name match
  const emailDomain = user.email?.split('@')[1] ?? ''
  let brokerageId: string | null = null

  const { data: byDomain } = await supabase
    .from('brokerages')
    .select('id')
    .eq('email_domain', emailDomain)
    .single()

  if (byDomain?.id) {
    brokerageId = byDomain.id
  } else {
    const { data: byName } = await supabase
      .from('brokerages')
      .select('id')
      .ilike('name', `%${brokerageCode}%`)
      .single()
    brokerageId = byName?.id ?? null
  }

  if (!brokerageId) {
    return { error: `Brokerage not found for code "${brokerageCode}". Contact your brokerage admin.` }
  }

  const { error } = await supabase.from('agents').upsert(
    {
      auth_user_id: user.id,
      name,
      email: user.email ?? '',
      brokerage_id: brokerageId,
    },
    { onConflict: 'auth_user_id' }
  )

  return { error: error?.message ?? null }
}

interface SaveTelegramResult {
  error: string | null
}

export async function saveTelegramUsername(
  telegramUsername: string
): Promise<SaveTelegramResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('agents')
    .update({ telegram_id: telegramUsername })
    .eq('auth_user_id', user.id)

  return { error: error?.message ?? null }
}

interface CreateTransactionResult {
  error: string | null
  transactionId: string | null
}

export async function createFirstTransaction(
  propertyAddress: string,
  side: TransactionSide
): Promise<CreateTransactionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated', transactionId: null }

  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .select('id, brokerage_id')
    .eq('auth_user_id', user.id)
    .single()

  if (agentError || !agent) {
    return { error: agentError?.message ?? 'Agent not found', transactionId: null }
  }

  const { data: tx, error: txError } = await supabase
    .from('transactions')
    .insert({
      agent_id: agent.id,
      brokerage_id: agent.brokerage_id,
      property_address: propertyAddress,
      side,
      stage: 'under_contract',
    })
    .select('id')
    .single()

  return {
    error: txError?.message ?? null,
    transactionId: tx?.id ?? null,
  }
}
