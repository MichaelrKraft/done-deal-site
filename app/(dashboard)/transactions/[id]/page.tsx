import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import TaskList from '@/components/transactions/TaskList'
import type { Transaction, Party, Deadline, Task as TaskType, AIAction, TaskNoteRow } from '@/types/database'

const STAGE_LABELS: Record<string, string> = {
  pre_listing: 'Pre-Listing',
  active_listing: 'Active Listing',
  under_contract: 'Under Contract',
  pre_closing: 'Pre-Closing',
  closed: 'Closed',
}

export default async function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  const { data: rawTransaction } = await supabase
    .from('transactions')
    .select('*, parties(*), deadlines(*), tasks(*)')
    .eq('id', id)
    .eq('agent_id', agent?.id ?? '')
    .single()

  if (!rawTransaction) notFound()

  const transaction = rawTransaction as Transaction & {
    parties: Party[]
    deadlines: Deadline[]
    tasks: TaskType[]
  }

  // Get recent AI actions for this transaction
  const { data: recentActions } = await supabase
    .from('ai_actions')
    .select('*')
    .eq('transaction_id', id)
    .order('created_at', { ascending: false })
    .limit(50)

  const aiActions = (recentActions ?? []) as AIAction[]

  // Get task notes for all tasks in this transaction
  const taskIds = transaction.tasks.map((t: TaskType) => t.id)
  const { data: rawNotes } = taskIds.length > 0
    ? await supabase
        .from('task_notes')
        .select('*')
        .in('task_id', taskIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  const taskNotes = (rawNotes ?? []) as TaskNoteRow[]

  const deadlinesSorted = [...transaction.deadlines].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  )

  const today = new Date()

  function daysUntil(date: string): number {
    return Math.ceil((new Date(date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif text-[#2c2420]">{transaction.property_address}</h1>
        <div className="flex gap-2 mt-2">
          <Badge variant={transaction.side === 'buyer' ? 'default' : 'secondary'}>
            {transaction.side === 'buyer' ? 'Buyer' : 'Seller'}
          </Badge>
          <Badge variant="outline">{STAGE_LABELS[transaction.stage] ?? transaction.stage}</Badge>
          <Badge variant="outline" className="bg-[#c75c2e]/10 text-[#c75c2e] border-[#c75c2e]/20">
            AI Active
          </Badge>
        </div>
      </div>

      {/* AI Activity Feed (top 5 most recent) */}
      {aiActions.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[#b0a698] uppercase tracking-wider mb-3">Recent AI Activity</h2>
          <div className="space-y-2">
            {aiActions.slice(0, 5).map(a => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-[#e8e2d9]">
                <span className={`h-2 w-2 rounded-full flex-shrink-0 ${
                  a.status === 'executed' || a.status === 'auto_executed' ? 'bg-emerald-500' :
                  a.status === 'pending' ? 'bg-amber-400' :
                  'bg-[#e8e2d9]'
                }`} />
                <span className="flex-1 text-sm text-[#2c2420]">
                  {a.context_summary ?? a.action_type.replace(/_/g, ' ')}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  a.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                  a.status === 'executed' || a.status === 'auto_executed' ? 'bg-emerald-50 text-emerald-700' :
                  'bg-[#f5f0ea] text-[#7a6e63]'
                }`}>
                  {a.status === 'auto_executed' ? 'Auto' : a.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tasks */}
      <TaskList
        tasks={transaction.tasks}
        aiActions={aiActions}
        transactionId={id}
        initialNotes={taskNotes}
      />

      {/* Deadlines */}
      {deadlinesSorted.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[#b0a698] uppercase tracking-wider mb-3">Deadlines</h2>
          <div className="space-y-2">
            {deadlinesSorted.map(d => {
              const days = daysUntil(d.due_date)
              return (
                <div key={d.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-[#e8e2d9]">
                  <span className="flex-1 text-sm text-[#2c2420] font-medium">{d.name}</span>
                  <span className="text-xs text-[#b0a698]">{d.due_date}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    days < 0 ? 'bg-red-50 text-red-700' :
                    days <= 3 ? 'bg-amber-50 text-amber-700' :
                    days <= 7 ? 'bg-blue-50 text-blue-700' :
                    'bg-[#f5f0ea] text-[#7a6e63]'
                  }`}>
                    {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Today' : `${days}d`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Parties */}
      {transaction.parties.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[#b0a698] uppercase tracking-wider mb-3">Parties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {transaction.parties.map(p => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-[#e8e2d9]">
                <span className="text-xs bg-[#f5f0ea] text-[#7a6e63] px-2 py-0.5 rounded-full capitalize font-medium">
                  {p.role.replace('_', ' ')}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-[#2c2420] font-medium">{p.name}</span>
                  {p.email && <span className="text-xs text-[#b0a698] ml-2">{p.email}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {transaction.parties.length === 0 && deadlinesSorted.length === 0 && transaction.tasks.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#f5f0ea] mb-4">
            <span className="text-[#c75c2e] text-xl">&#9672;</span>
          </div>
          <p className="text-[#7a6e63]">No data yet. The AI TC agent will populate tasks and deadlines once your MEC date is set.</p>
        </div>
      )}
    </div>
  )
}
