import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  BarChart3,
  CalendarCheck,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Bot,
  FileCheck,
  AlertTriangle,
} from 'lucide-react'
import { MetricCard } from '@/components/analytics/MetricCard'
import { StageFunnel } from '@/components/analytics/StageFunnel'
import type { TransactionStage } from '@/types/database'

interface StageCount {
  stage: TransactionStage
  count: number
}

interface AnalyticsData {
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

async function getAnalytics(): Promise<AnalyticsData | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) return null

  // Fetch all transactions for this agent
  const { data: transactions } = await supabase
    .from('transactions')
    .select('id, stage, mec_date, closing_date')
    .eq('agent_id', agent.id)

  const txns = transactions ?? []
  const txnIds = txns.map(t => t.id)
  const totalTransactions = txns.length

  // Stage breakdown
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

  // Closed this month
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const closedThisMonth = txns.filter(
    t => t.stage === 'closed' && t.closing_date && t.closing_date >= monthStart
  ).length

  // Average days MEC to closing
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

  // Tasks
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
      t.status === 'completed' && t.completed_at && t.due_date && t.completed_at <= t.due_date
    ).length
  }

  // AI actions
  const { data: actions } = await supabase
    .from('ai_actions')
    .select('id, status')
    .eq('agent_id', agent.id)

  const acts = actions ?? []

  // Documents
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
    docsComplete = allDocs.filter(d => d.status === 'uploaded' || d.status === 'signed').length
  }

  // Deadline breaches
  let deadlineBreaches = 0
  if (txnIds.length > 0) {
    const { count } = await supabase
      .from('deadlines')
      .select('id', { count: 'exact', head: true })
      .in('transaction_id', txnIds)
      .eq('status', 'breached')

    deadlineBreaches = count ?? 0
  }

  return {
    totalTransactions,
    closedThisMonth,
    avgDaysToClose,
    stageBreakdown,
    tasksTotal,
    tasksCompleted,
    tasksOnTime,
    aiActionsTotal: acts.length,
    aiActionsExecuted: acts.filter(a => a.status === 'executed').length,
    aiActionsAutoExecuted: acts.filter(a => a.status === 'auto_executed').length,
    aiActionsPending: acts.filter(a => a.status === 'pending').length,
    aiActionsRejected: acts.filter(a => a.status === 'rejected').length,
    docsRequired,
    docsComplete,
    deadlineBreaches,
  }
}

export default async function AnalyticsPage() {
  const data = await getAnalytics()
  if (!data) redirect('/login')

  const taskCompletionPct = data.tasksTotal > 0
    ? Math.round((data.tasksCompleted / data.tasksTotal) * 100)
    : 0

  const onTimePct = data.tasksCompleted > 0
    ? Math.round((data.tasksOnTime / data.tasksCompleted) * 100)
    : 0

  const docsPct = data.docsRequired > 0
    ? Math.round((data.docsComplete / data.docsRequired) * 100)
    : 0

  const aiExecutedTotal = data.aiActionsExecuted + data.aiActionsAutoExecuted

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-[#2c2420]">Analytics</h1>
        <p className="text-sm text-[#7a6e63] mt-1">
          Transaction performance and AI activity overview
        </p>
      </div>

      {/* Row 1: Key stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Transactions"
          value={data.totalTransactions}
          icon={BarChart3}
        />
        <MetricCard
          title="Closed This Month"
          value={data.closedThisMonth}
          icon={CalendarCheck}
        />
        <MetricCard
          title="Avg Days to Close"
          value={data.avgDaysToClose ?? '--'}
          subtitle={data.avgDaysToClose ? 'from MEC to closing' : 'No closed transactions'}
          icon={Clock}
        />
        <MetricCard
          title="Compliance Score"
          value={data.deadlineBreaches === 0 ? '100%' : `${Math.max(0, 100 - data.deadlineBreaches * 5)}%`}
          subtitle={data.deadlineBreaches === 0 ? 'No breaches' : `${data.deadlineBreaches} deadline breach${data.deadlineBreaches === 1 ? '' : 'es'}`}
          icon={ShieldCheck}
        />
      </div>

      {/* Row 2: Task completion + AI actions */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Task Completion */}
        <div className="rounded-xl border border-sd-border bg-[#faf8f5] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium uppercase tracking-wide text-sd-text-muted">
              Task Completion
            </h3>
            <CheckCircle2 size={18} className="text-[#84c9d1]" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-[#2c2420]">{taskCompletionPct}%</p>
          <p className="mt-1 text-sm text-sd-text-secondary">
            {data.tasksCompleted} of {data.tasksTotal} tasks completed
          </p>
          {/* Progress bar */}
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-sd-border-subtle">
            <div
              className="h-full rounded-full bg-[#84c9d1] transition-all duration-500"
              style={{ width: `${taskCompletionPct}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-sd-text-muted">
            <span>On-time rate: {onTimePct}%</span>
            <span>{data.tasksOnTime} on time</span>
          </div>
        </div>

        {/* AI Action Stats */}
        <div className="rounded-xl border border-sd-border bg-[#faf8f5] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium uppercase tracking-wide text-sd-text-muted">
              AI Actions
            </h3>
            <Bot size={18} className="text-[#84c9d1]" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-[#2c2420]">{data.aiActionsTotal}</p>
          <p className="mt-1 text-sm text-sd-text-secondary">total actions generated</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-white px-3 py-2 border border-sd-border-subtle">
              <p className="text-lg font-semibold text-[#2c2420]">{aiExecutedTotal}</p>
              <p className="text-xs text-sd-text-muted">Executed</p>
            </div>
            <div className="rounded-lg bg-white px-3 py-2 border border-sd-border-subtle">
              <p className="text-lg font-semibold text-[#2c2420]">{data.aiActionsAutoExecuted}</p>
              <p className="text-xs text-sd-text-muted">Auto-executed</p>
            </div>
            <div className="rounded-lg bg-white px-3 py-2 border border-sd-border-subtle">
              <p className="text-lg font-semibold text-[#2c2420]">{data.aiActionsPending}</p>
              <p className="text-xs text-sd-text-muted">Pending</p>
            </div>
            <div className="rounded-lg bg-white px-3 py-2 border border-sd-border-subtle">
              <p className="text-lg font-semibold text-[#2c2420]">{data.aiActionsRejected}</p>
              <p className="text-xs text-sd-text-muted">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Stage Funnel */}
      <div className="mt-4">
        <StageFunnel
          stages={data.stageBreakdown.map(s => ({ name: s.stage, count: s.count }))}
        />
      </div>

      {/* Row 4: Document Completeness + Deadline Health */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Document Completeness */}
        <div className="rounded-xl border border-sd-border bg-[#faf8f5] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium uppercase tracking-wide text-sd-text-muted">
              Document Completeness
            </h3>
            <FileCheck size={18} className="text-[#84c9d1]" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-[#2c2420]">{docsPct}%</p>
          <p className="mt-1 text-sm text-sd-text-secondary">
            {data.docsComplete} of {data.docsRequired} required docs complete
          </p>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-sd-border-subtle">
            <div
              className="h-full rounded-full bg-[#84c9d1] transition-all duration-500"
              style={{ width: `${docsPct}%` }}
            />
          </div>
        </div>

        {/* Deadline Health */}
        <div className="rounded-xl border border-sd-border bg-[#faf8f5] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium uppercase tracking-wide text-sd-text-muted">
              Deadline Health
            </h3>
            <AlertTriangle size={18} className={data.deadlineBreaches > 0 ? 'text-red-500' : 'text-[#84c9d1]'} />
          </div>
          <p className={`mt-2 text-3xl font-semibold ${data.deadlineBreaches > 0 ? 'text-red-600' : 'text-[#2c2420]'}`}>
            {data.deadlineBreaches}
          </p>
          <p className="mt-1 text-sm text-sd-text-secondary">
            {data.deadlineBreaches === 0
              ? 'All deadlines are on track'
              : `deadline${data.deadlineBreaches === 1 ? '' : 's'} breached across all transactions`
            }
          </p>
          {data.deadlineBreaches === 0 && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 border border-emerald-100">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">Perfect compliance record</span>
            </div>
          )}
          {data.deadlineBreaches > 0 && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 border border-red-100">
              <AlertTriangle size={16} className="text-red-500" />
              <span className="text-xs font-medium text-red-700">Action required on breached deadlines</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
