import { createClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: transactionId } = await params
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

  // Fetch portal links for this transaction
  const { data: links, error } = await supabase
    .from('portal_links')
    .select('*')
    .eq('transaction_id', transactionId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ links: links ?? [] })
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: transactionId } = await params
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

  // Parse body
  const body = await req.json() as { party_role?: string }
  const partyRole = body.party_role

  if (partyRole !== 'buyer' && partyRole !== 'seller') {
    return NextResponse.json({ error: 'party_role must be "buyer" or "seller"' }, { status: 400 })
  }

  // Generate 32-char crypto token
  const token = randomBytes(16).toString('hex')

  const { data: link, error } = await supabase
    .from('portal_links')
    .insert({
      transaction_id: transactionId,
      token,
      party_role: partyRole as 'buyer' | 'seller',
      created_by: agent.id,
      is_active: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ link }, { status: 201 })
}
