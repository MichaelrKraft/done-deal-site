import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { PartyRole, RiskLevel, TaskAssignedTo } from '@/types/database'
import { checkCompliance, buildComplianceInput } from '@/lib/compliance-engine'
import { tcAgentQueue } from '@/worker/queues'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*, parties(count), deadlines(count), tasks(count)')
    .eq('agent_id', agent.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ transactions })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agent } = await supabase
    .from('agents')
    .select('id, brokerage_id')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  const body = await request.json() as {
    property_address: string
    side: 'buyer' | 'seller'
    mec_date?: string
    closing_date?: string
    sale_price?: number
    earnest_money?: number
    property_details?: Record<string, unknown>
    parties?: Array<{
      role: string
      name: string
      email?: string
      phone?: string
      company?: string
    }>
  }

  const { data: transaction, error } = await supabase
    .from('transactions')
    .insert({
      agent_id: agent.id,
      brokerage_id: agent.brokerage_id,
      property_address: body.property_address,
      side: body.side,
      mec_date: body.mec_date ?? null,
      closing_date: body.closing_date ?? null,
      list_price: body.sale_price ?? null,
      earnest_money: body.earnest_money ?? null,
      property_details: body.property_details ?? {},
      stage: 'pre_listing' as const,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Auto-create parties from extracted data
  if (body.parties && body.parties.length > 0) {
    const partyInserts = body.parties
      .filter(p => p.name || p.email)
      .map(p => ({
        transaction_id: transaction!.id,
        role: p.role as PartyRole,
        name: p.name,
        email: p.email ?? null,
        phone: p.phone ?? null,
        company: p.company ?? null,
      }))

    if (partyInserts.length > 0) {
      await supabase.from('parties').insert(partyInserts)
    }
  }

  // Auto-generate compliance requirements and standard tasks
  if (transaction) {
    const pd = (body.property_details ?? {}) as Record<string, unknown>

    const complianceInput = buildComplianceInput(pd, body.side)

    const complianceResult = checkCompliance(complianceInput)

    // Insert compliance requirements
    if (complianceResult.requirements.length > 0) {
      const { error: compReqError } = await supabase.from('compliance_requirements').insert(
        complianceResult.requirements.map(r => ({
          transaction_id: transaction.id,
          requirement_type: r.requirement_type,
          triggered_by: r.triggered_by,
          notes: r.description,
          status: 'pending' as const,
        }))
      )
      if (compReqError) {
        console.error('Compliance requirements insert failed:', compReqError.message)
      }
    }

    // Insert tasks
    if (complianceResult.tasks.length > 0) {
      const { error: compTaskError } = await supabase.from('tasks').insert(
        complianceResult.tasks.map((t, index) => ({
          transaction_id: transaction.id,
          stage: t.stage,
          title: t.title,
          risk_level: t.risk_level as RiskLevel,
          assigned_to: 'ai' as TaskAssignedTo,
          status: 'pending' as const,
          sort_order: index,
        }))
      )
      if (compTaskError) {
        console.error('Compliance tasks insert failed:', compTaskError.message)
      }
    }
  }

  // Immediately trigger the TC agent so it picks up the new transaction
  if (transaction) {
    await tcAgentQueue.add(
      'morning_sweep',
      { agent_id: agent.id, job_type: 'morning_sweep' },
      { jobId: `new-txn-sweep-${agent.id}-${Date.now()}` }
    ).catch((err: Error) => {
      console.error('[Transactions] Failed to enqueue TC sweep:', err.message)
    })
  }

  return NextResponse.json({ transactionId: transaction?.id }, { status: 201 })
}
