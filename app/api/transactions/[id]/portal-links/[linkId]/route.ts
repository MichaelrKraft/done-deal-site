import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; linkId: string }> }
) {
  const { id: transactionId, linkId } = await params
  const supabase = await createClient()

  // Auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  // IDOR: verify agent owns transaction
  const { data: transaction } = await supabase
    .from('transactions')
    .select('id')
    .eq('id', transactionId)
    .eq('agent_id', agent.id)
    .single()

  if (!transaction) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })

  // Revoke link (soft delete — set is_active = false)
  const { error } = await supabase
    .from('portal_links')
    .update({ is_active: false })
    .eq('id', linkId)
    .eq('transaction_id', transactionId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
