import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Transaction } from '@/types/database'

const STAGE_LABELS: Record<string, string> = {
  pre_listing: 'Pre-Listing',
  active_listing: 'Active Listing',
  under_contract: 'Under Contract',
  pre_closing: 'Pre-Closing',
  closed: 'Closed',
  archived: 'Archived',
}

const STAGE_VARIANTS: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  pre_listing: 'secondary',
  active_listing: 'default',
  under_contract: 'warning',
  pre_closing: 'warning',
  closed: 'success',
  archived: 'outline',
}

function daysSince(date: string): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
}

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) {
    return (
      <div className="p-6 text-red-400">
        Account setup incomplete. Please complete onboarding.
      </div>
    )
  }

  const { data: rawTransactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('agent_id', agent.id)
    .neq('stage', 'archived')
    .order('created_at', { ascending: false })

  const transactions = rawTransactions as Transaction[] | null

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Transactions</h1>
        <Link href="/transactions/new">
          <Button>+ New Transaction</Button>
        </Link>
      </div>

      {!transactions || transactions.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">No transactions yet</p>
          <p className="text-sm mb-6">Upload a contract PDF to get started in under 60 seconds</p>
          <Link href="/transactions/new">
            <Button>Create your first transaction</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx: Transaction) => (
            <Link key={tx.id} href={`/transactions/${tx.id}`}>
              <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-800 bg-gray-900 hover:bg-gray-850 transition-colors cursor-pointer">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-100 truncate">{tx.property_address}</p>
                  {tx.mec_date && (
                    <p className="text-xs text-gray-500 mt-0.5">MEC: {tx.mec_date}</p>
                  )}
                </div>
                <Badge variant={tx.side === 'buyer' ? 'default' : 'secondary'}>
                  {tx.side === 'buyer' ? 'Buyer' : 'Seller'}
                </Badge>
                <Badge variant={STAGE_VARIANTS[tx.stage] ?? 'secondary'}>
                  {STAGE_LABELS[tx.stage] ?? tx.stage}
                </Badge>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  Day {daysSince(tx.created_at)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
