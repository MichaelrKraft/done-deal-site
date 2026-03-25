'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server-admin'
import type { TransactionSide } from '@/types/database'

const agentInfoSchema = z.object({
  name: z.string().min(2).max(100),
  brokerageCode: z.string().min(1).max(50),
})

const telegramSchema = z.object({
  username: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_]+$/, 'Invalid Telegram username'),
})

const transactionSchema = z.object({
  propertyAddress: z.string().min(5).max(200),
  side: z.enum(['buyer', 'seller']),
})

interface SaveAgentInfoResult {
  error: string | null
}

export async function saveAgentInfo(
  name: string,
  brokerageCode: string
): Promise<SaveAgentInfoResult> {
  const parsed = agentInfoSchema.safeParse({ name, brokerageCode })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Use admin client to bypass RLS for brokerage lookup + agent creation.
  // New users have no agent row yet, so RLS blocks anon key queries.
  const adminSupabase = createAdminClient()

  const emailDomain = user.email?.split('@')[1] ?? ''
  let brokerageId: string | null = null

  const { data: byDomain } = await adminSupabase
    .from('brokerages')
    .select('id')
    .eq('email_domain', emailDomain)
    .single()

  if (byDomain?.id) {
    brokerageId = byDomain.id
  } else {
    // Try name match (e.g., "Your Castle" matches "Your Castle Real Estate")
    const { data: byName } = await adminSupabase
      .from('brokerages')
      .select('id')
      .ilike('name', `%${brokerageCode}%`)
      .single()
    if (byName?.id) {
      brokerageId = byName.id
    } else {
      // Try email_domain match (e.g., "yourcastle" matches "yourcastle.com")
      const { data: byCode } = await adminSupabase
        .from('brokerages')
        .select('id')
        .ilike('email_domain', `%${brokerageCode}%`)
        .single()
      brokerageId = byCode?.id ?? null
    }
  }

  if (!brokerageId) {
    return { error: `Brokerage not found for code "${brokerageCode}". Contact your brokerage admin.` }
  }

  const { error } = await adminSupabase.from('agents').upsert(
    {
      auth_user_id: user.id,
      name,
      email: user.email ?? '',
      brokerage_id: brokerageId,
    },
    { onConflict: 'auth_user_id' }
  )

  if (error) return { error: error.message }

  // Mark agent record as created in user metadata so middleware can verify
  // without a DB query on every request
  await supabase.auth.updateUser({ data: { agent_created: true } })

  return { error: null }
}

interface SaveTelegramResult {
  error: string | null
}

export async function saveTelegramUsername(
  telegramUsername: string
): Promise<SaveTelegramResult> {
  const parsed = telegramSchema.safeParse({ username: telegramUsername })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid Telegram username' }
  }

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
  const parsed = transactionSchema.safeParse({ propertyAddress, side })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input', transactionId: null }
  }

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
