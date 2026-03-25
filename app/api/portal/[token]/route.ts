import { createAdminClient } from '@/lib/supabase/server-admin'
import { NextResponse } from 'next/server'
import type { PortalLinkRow } from '@/types/database'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const supabase = createAdminClient()

  // Look up portal link by token
  const { data: rawLink, error: linkError } = await supabase
    .from('portal_links')
    .select('*')
    .eq('token', token)
    .eq('is_active', true)
    .single()

  const link = rawLink as PortalLinkRow | null

  if (linkError || !link) {
    return NextResponse.json({ error: 'Link not found or inactive' }, { status: 404 })
  }

  // Check expiration
  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Link has expired' }, { status: 410 })
  }

  // Increment access count and update last_accessed_at
  await supabase
    .from('portal_links')
    .update({
      access_count: link.access_count + 1,
      last_accessed_at: new Date().toISOString(),
    } as Record<string, unknown>)
    .eq('id', link.id)

  // Fetch transaction (sanitized fields only)
  const { data: transaction } = await supabase
    .from('transactions')
    .select('property_address, stage, mec_date, closing_date, sale_price, side')
    .eq('id', link.transaction_id)
    .single()

  if (!transaction) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
  }

  // Fetch deadlines (name, due_date, status only)
  const { data: deadlines } = await supabase
    .from('deadlines')
    .select('name, due_date, status')
    .eq('transaction_id', link.transaction_id)
    .order('due_date', { ascending: true })

  // Fetch documents where visibility = 'client_visible' (display_name, doc_type, status only)
  const { data: documents } = await supabase
    .from('documents')
    .select('display_name, doc_type, status')
    .eq('transaction_id', link.transaction_id)
    .eq('visibility', 'client_visible')
    .neq('status', 'superseded')
    .order('doc_type', { ascending: true })

  return NextResponse.json({
    party_role: link.party_role,
    transaction: {
      property_address: transaction.property_address,
      stage: transaction.stage,
      side: transaction.side,
      mec_date: transaction.mec_date,
      closing_date: transaction.closing_date,
      sale_price: transaction.sale_price,
    },
    deadlines: deadlines ?? [],
    documents: documents ?? [],
  })
}
