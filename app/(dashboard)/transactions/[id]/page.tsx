import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import type { Transaction, Party, Deadline, Task } from '@/types/database'

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
    tasks: Task[]
  }

  const deadlinesSorted = [...transaction.deadlines].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  )

  const today = new Date()

  function daysUntil(date: string): number {
    return Math.ceil((new Date(date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">{transaction.property_address}</h1>
          <div className="flex gap-2 mt-2">
            <Badge variant={transaction.side === 'buyer' ? 'default' : 'secondary'}>
              {transaction.side === 'buyer' ? 'Buyer' : 'Seller'}
            </Badge>
            <Badge variant="outline">{STAGE_LABELS[transaction.stage] ?? transaction.stage}</Badge>
          </div>
        </div>
      </div>

      {/* Parties */}
      {transaction.parties.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-200 mb-3">Parties</h2>
          <div className="space-y-2">
            {transaction.parties.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-900 border border-gray-800">
                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full capitalize">{p.role.replace('_', ' ')}</span>
                <span className="text-gray-200 font-medium">{p.name}</span>
                {p.email && <span className="text-gray-500 text-sm">{p.email}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deadlines */}
      {deadlinesSorted.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-200 mb-3">Deadlines</h2>
          <div className="space-y-2">
            {deadlinesSorted.map(d => {
              const days = daysUntil(d.due_date)
              return (
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-900 border border-gray-800">
                  <span className="flex-1 text-gray-200">{d.name}</span>
                  <span className="text-sm text-gray-400">{d.due_date}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    days < 0 ? 'bg-red-900 text-red-300' :
                    days <= 3 ? 'bg-yellow-900 text-yellow-300' :
                    'bg-gray-800 text-gray-400'
                  }`}>
                    {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Today' : `${days}d`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tasks */}
      {transaction.tasks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-200 mb-3">Tasks</h2>
          <div className="space-y-1">
            {transaction.tasks.map(t => (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-900 border border-gray-800">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  t.status === 'completed' ? 'bg-green-500' :
                  t.status === 'in_progress' ? 'bg-blue-500' :
                  'bg-gray-600'
                }`} />
                <span className={`flex-1 text-sm ${t.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                  {t.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {transaction.parties.length === 0 && deadlinesSorted.length === 0 && transaction.tasks.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No data yet. The AI TC agent will populate tasks and deadlines once your MEC date is set.</p>
        </div>
      )}
    </div>
  )
}
