import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { KanbanBoard } from '@/components/board/KanbanBoard'
import type { Transaction } from '@/types/database'

export default async function BoardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) redirect('/onboarding')

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('agent_id', agent.id)
    .neq('stage', 'archived')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Mission Control</h1>
        <p className="mt-1 text-sm text-gray-400">
          Drag transactions between stages to update their status.
        </p>
      </div>

      <KanbanBoard initialTransactions={(transactions ?? []) as Transaction[]} />
    </div>
  )
}
