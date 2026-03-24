import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { calculateDeadlines } from '@/lib/deadline-engine'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // 2. Resolve agent
  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  // 3. Fetch transaction — verifies agent ownership via .eq('agent_id', agent.id)
  const { data: transaction, error: txError } = await supabase
    .from('transactions')
    .select('id, mec_date, closing_date, property_details')
    .eq('id', id)
    .eq('agent_id', agent.id)
    .single()

  if (txError || !transaction) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
  }

  const { mec_date, closing_date, property_details } = transaction

  if (!mec_date || !closing_date) {
    return NextResponse.json(
      { error: 'Transaction must have mec_date and closing_date to calculate deadlines' },
      { status: 422 }
    )
  }

  // 4. Extract property options from property_details JSONB
  const details = property_details as Record<string, unknown>
  const options = {
    hasHoa: Boolean(details?.has_hoa),
    yearBuilt: typeof details?.year_built === 'number' ? details.year_built : undefined,
    isBackup: Boolean(details?.is_backup),
    tfcDate: typeof details?.tfc_date === 'string' ? details.tfc_date : undefined,
  }

  // 5. Calculate all deadlines
  const calculated = calculateDeadlines(mec_date, closing_date, options)

  // 6. Upsert deadlines — conflict on (transaction_id, name) avoids duplicates on re-run
  const rows = calculated.map((d) => ({
    transaction_id: id,
    name: d.name,
    due_date: d.due_date,
    status: 'pending' as const,
    calculated_from: d.calculated_from === 'tfc' ? 'mec' : d.calculated_from, // DB enum only has 'mec'|'closing'
    days_offset: d.days_offset,
    is_business_days: d.is_business_days,
    risk_level: d.risk_level,
    notes: d.notes ?? null,
  }))

  const { data: deadlines, error: upsertError } = await supabase
    .from('deadlines')
    .upsert(rows, { onConflict: 'transaction_id,name' })
    .select()

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 })
  }

  return NextResponse.json({ deadlines }, { status: 200 })
}
