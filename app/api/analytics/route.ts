import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { TransactionStage } from '@/types/database'

interface StageCount {
  stage: TransactionStage
  count: number
}

interface AnalyticsResponse {
  totalTransactions: number
  closedThisMonth: number
  avgDaysToClose: number | null
  stageBreakdown: StageCount[]
  tasksTotal: number
  tasksCompleted: number
  tasksOnTime: number
  aiActionsTotal: number
  aiActionsExecuted: number
  aiActionsAutoExecuted: number
  aiActionsPending: number
  aiActionsRejected: number
  docsRequired: number
  docsComplete: number
  deadlineBreaches: number
}

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

  // 1. All transactions for this agent
  const { data: transactions } = await supabase
    .from('transactions')
    .select('id, stage, mec_date, closing_date, created_at')
    .eq('agent_id', agent.id)

  const txns = transactions ?? []
  const txnIds = txns.map(t => t.id)
  const totalTransactions = txns.length

  // 2. Stage breakdown
  const stageCounts: Record<string, number> = {}
  for (const t of txns) {
    stageCounts[t.stage] = (stageCounts[t.stage] ?? 0) + 1
  }
  const stageOrder: TransactionStage[] = [
    'pre_listing', 'active_listing', 'under_contract', 'pre_closing', 'closed', 'archived',
  ]
  const stageBreakdown: StageCount[] = stageOrder.map(stage => ({
    stage,
    count: stageCounts[stage] ?? 0,
  }))

  // 3. Closed this month
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const closedThisMonth = txns.filter(
    t => t.stage === 'closed' && t.closing_date && t.closing_date >= monthStart
  ).length

  // 4. Average days from MEC to closing (for closed transactions)
  const closedWithDates = txns.filter(t => t.stage === 'closed' && t.mec_date && t.closing_date)
  let avgDaysToClose: number | null = null
  if (closedWithDates.length > 0) {
    const totalDays = closedWithDates.reduce((sum, t) => {
      const mec = new Date(t.mec_date!).getTime()
      const close = new Date(t.closing_date!).getTime()
      return sum + Math.max(0, (close - mec) / (1000 * 60 * 60 * 24))
    }, 0)
    avgDaysToClose = Math.round(totalDays / closedWithDates.length)
  }

  // 5. Tasks: total, completed, on-time
  let tasksTotal = 0
  let tasksCompleted = 0
  let tasksOnTime = 0

  if (txnIds.length > 0) {
    const { data: allTasks } = await supabase
      .from('tasks')
      .select('id, status, completed_at, due_date')
      .in('transaction_id', txnIds)

    const tasks = allTasks ?? []
    tasksTotal = tasks.length
    tasksCompleted = tasks.filter(t => t.status === 'completed').length
    tasksOnTime = tasks.filter(t =>
      t.status === 'completed' &&
      t.completed_at &&
      t.due_date &&
      t.completed_at <= t.due_date
    ).length
  }

  // 6. AI actions breakdown
  let aiActionsTotal = 0
  let aiActionsExecuted = 0
  let aiActionsAutoExecuted = 0
  let aiActionsPending = 0
  let aiActionsRejected = 0

  {
    const { data: actions } = await supabase
      .from('ai_actions')
      .select('id, status')
      .eq('agent_id', agent.id)

    const acts = actions ?? []
    aiActionsTotal = acts.length
    aiActionsExecuted = acts.filter(a => a.status === 'executed').length
    aiActionsAutoExecuted = acts.filter(a => a.status === 'auto_executed').length
    aiActionsPending = acts.filter(a => a.status === 'pending').length
    aiActionsRejected = acts.filter(a => a.status === 'rejected').length
  }

  // 7. Document completeness
  let docsRequired = 0
  let docsComplete = 0

  if (txnIds.length > 0) {
    const { data: docs } = await supabase
      .from('documents')
      .select('id, status, required')
      .in('transaction_id', txnIds)
      .eq('required', true)

    const allDocs = docs ?? []
    docsRequired = allDocs.length
    docsComplete = allDocs.filter(d =>
      d.status === 'uploaded' || d.status === 'signed'
    ).length
  }

  // 8. Deadline breaches
  let deadlineBreaches = 0

  if (txnIds.length > 0) {
    const { count } = await supabase
      .from('deadlines')
      .select('id', { count: 'exact', head: true })
      .in('transaction_id', txnIds)
      .eq('status', 'breached')

    deadlineBreaches = count ?? 0
  }

  const response: AnalyticsResponse = {
    totalTransactions,
    closedThisMonth,
    avgDaysToClose,
    stageBreakdown,
    tasksTotal,
    tasksCompleted,
    tasksOnTime,
    aiActionsTotal,
    aiActionsExecuted,
    aiActionsAutoExecuted,
    aiActionsPending,
    aiActionsRejected,
    docsRequired,
    docsComplete,
    deadlineBreaches,
  }

  return NextResponse.json(response)
}
