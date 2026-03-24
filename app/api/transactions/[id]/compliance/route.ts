import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { checkCompliance } from '@/lib/compliance-engine'
import type { ComplianceInput } from '@/lib/compliance-engine'
import type { RiskLevel, TaskAssignedTo } from '@/types/database'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

  // Fetch transaction — verifies agent ownership via eq('agent_id', agent.id)
  const { data: transaction, error: txError } = await supabase
    .from('transactions')
    .select('id, side, property_details, mec_date')
    .eq('id', id)
    .eq('agent_id', agent.id)
    .single()

  if (txError || !transaction) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
  }

  // Build compliance input from property_details
  const pd = transaction.property_details as Record<string, unknown>

  const input: ComplianceInput = {
    side: transaction.side,
    year_built: typeof pd.year_built === 'number' ? pd.year_built : undefined,
    has_hoa: typeof pd.has_hoa === 'boolean' ? pd.has_hoa : undefined,
    has_solar: typeof pd.has_solar === 'boolean' ? pd.has_solar : undefined,
    solar_type: (pd.solar_type === 'owned' || pd.solar_type === 'leased' || pd.solar_type === 'ppa')
      ? pd.solar_type
      : undefined,
    has_septic: typeof pd.has_septic === 'boolean' ? pd.has_septic : undefined,
    has_well: typeof pd.has_well === 'boolean' ? pd.has_well : undefined,
    has_spd: typeof pd.has_spd === 'boolean' ? pd.has_spd : undefined,
    is_backup_offer: typeof pd.is_backup_offer === 'boolean' ? pd.is_backup_offer : undefined,
    is_conservatorship: typeof pd.is_conservatorship === 'boolean' ? pd.is_conservatorship : undefined,
    is_co_listing: typeof pd.is_co_listing === 'boolean' ? pd.is_co_listing : undefined,
  }

  const result = checkCompliance(input)

  // Upsert compliance requirements (idempotent on requirement_type + transaction_id)
  const requirementInserts = result.requirements.map(r => ({
    transaction_id: transaction.id,
    requirement_type: r.requirement_type,
    triggered_by: r.triggered_by,
    notes: r.description,
    status: 'pending' as const,
  }))

  let requirementsCreated = 0
  if (requirementInserts.length > 0) {
    const { error: reqError } = await supabase
      .from('compliance_requirements')
      .upsert(requirementInserts, {
        onConflict: 'transaction_id,requirement_type',
        ignoreDuplicates: true,
      })

    if (reqError) {
      return NextResponse.json({ error: reqError.message }, { status: 500 })
    }
    requirementsCreated = requirementInserts.length
  }

  // Upsert tasks (idempotent on transaction_id + title)
  const taskInserts = result.tasks.map((t, index) => ({
    transaction_id: transaction.id,
    stage: t.stage,
    title: t.title,
    risk_level: t.risk_level as RiskLevel,
    assigned_to: 'ai' as TaskAssignedTo,
    status: 'pending' as const,
    sort_order: index,
  }))

  let tasksCreated = 0
  if (taskInserts.length > 0) {
    const { error: taskError } = await supabase
      .from('tasks')
      .upsert(taskInserts, {
        onConflict: 'transaction_id,title',
        ignoreDuplicates: true,
      })

    if (taskError) {
      return NextResponse.json({ error: taskError.message }, { status: 500 })
    }
    tasksCreated = taskInserts.length
  }

  return NextResponse.json({
    requirements_created: requirementsCreated,
    tasks_created: tasksCreated,
    flags: result.flags,
  })
}
