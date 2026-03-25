import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CalendarView } from '@/components/calendar/CalendarView'
import type { Deadline } from '@/types/database'

/** Deadline enriched with the transaction's property address */
export interface CalendarDeadline extends Deadline {
  property_address: string
}

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) redirect('/login')

  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) redirect('/onboarding')

  // Load all transactions for this agent (non-archived)
  const { data: transactions } = await supabase
    .from('transactions')
    .select('id, property_address')
    .eq('agent_id', agent.id)
    .neq('stage', 'archived')

  const txList = transactions ?? []
  const txIds = txList.map((t) => t.id)
  const addressMap = new Map(txList.map((t) => [t.id, t.property_address]))

  // Load all deadlines for those transactions
  let calendarDeadlines: CalendarDeadline[] = []

  if (txIds.length > 0) {
    const { data: deadlines, error: dlError } = await supabase
      .from('deadlines')
      .select('*')
      .in('transaction_id', txIds)
      .order('due_date', { ascending: true })

    if (dlError) {
      console.error('[Calendar] Failed to load deadlines:', dlError.message)
    }

    const typedDeadlines = (deadlines ?? []) as Deadline[]
    calendarDeadlines = typedDeadlines.map((d) => ({
      ...d,
      property_address: addressMap.get(d.transaction_id) ?? 'Unknown',
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif text-[#2c2420]">Calendar</h1>
        <p className="mt-1 text-sm text-[#7a6e63]">
          All deadlines across your transactions
        </p>
      </div>

      <CalendarView deadlines={calendarDeadlines} />
    </div>
  )
}
