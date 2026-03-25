import { createAdminClient } from '@/lib/supabase/server-admin'
import { notFound } from 'next/navigation'
import type { TransactionStage, DeadlineStatus, DocumentStatus, PortalLinkRow } from '@/types/database'

const STAGE_ORDER: TransactionStage[] = [
  'pre_listing',
  'active_listing',
  'under_contract',
  'pre_closing',
  'closed',
]

const STAGE_LABELS: Record<string, string> = {
  pre_listing: 'Pre-Listing',
  active_listing: 'Active Listing',
  under_contract: 'Under Contract',
  pre_closing: 'Pre-Closing',
  closed: 'Closed',
}

function daysUntil(date: string): number {
  const now = new Date()
  return Math.ceil((new Date(date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDate(date: string | null): string {
  if (!date) return 'TBD'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatCurrency(amount: number | null): string {
  if (!amount) return 'TBD'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

function deadlineStatusIcon(status: DeadlineStatus): string {
  switch (status) {
    case 'completed': return 'check'
    case 'waived': return 'minus'
    case 'breached': return 'alert'
    default: return 'clock'
  }
}

function docStatusLabel(status: DocumentStatus): string {
  switch (status) {
    case 'uploaded':
    case 'sent':
    case 'signed':
      return 'Received'
    case 'missing':
      return 'Missing'
    default:
      return status.replace('_', ' ')
  }
}

export default async function PortalPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = createAdminClient()

  // Look up portal link
  const { data: rawLink } = await supabase
    .from('portal_links')
    .select('*')
    .eq('token', token)
    .eq('is_active', true)
    .single()

  const link = rawLink as PortalLinkRow | null
  if (!link) notFound()

  // Check expiration
  if (link.expires_at && new Date(link.expires_at) < new Date()) notFound()

  // Increment access count
  await supabase
    .from('portal_links')
    .update({
      access_count: link.access_count + 1,
      last_accessed_at: new Date().toISOString(),
    } as Record<string, unknown>)
    .eq('id', link.id)

  // Fetch transaction
  const { data: transaction } = await supabase
    .from('transactions')
    .select('property_address, stage, mec_date, closing_date, sale_price, side')
    .eq('id', link.transaction_id)
    .single()

  if (!transaction) notFound()

  // Fetch deadlines
  const { data: deadlines } = await supabase
    .from('deadlines')
    .select('name, due_date, status')
    .eq('transaction_id', link.transaction_id)
    .order('due_date', { ascending: true })

  // Fetch client-visible documents
  const { data: documents } = await supabase
    .from('documents')
    .select('display_name, doc_type, status')
    .eq('transaction_id', link.transaction_id)
    .eq('visibility', 'client_visible')
    .neq('status', 'superseded')
    .order('doc_type', { ascending: true })

  const currentStageIndex = STAGE_ORDER.indexOf(transaction.stage as TransactionStage)
  const upcomingDeadlines = (deadlines ?? []).filter(
    (d) => d.status === 'pending' || d.status === 'extended'
  )
  const completedDeadlines = (deadlines ?? []).filter(
    (d) => d.status === 'completed' || d.status === 'waived'
  )

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Header */}
      <header className="bg-white border-b border-[#e8e2d9]">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <p className="text-xs uppercase tracking-wider text-[#b0a698] font-medium mb-1">
            Transaction Portal
          </p>
          <h1 className="text-xl md:text-2xl font-serif text-[#2c2420]">
            {transaction.property_address}
          </h1>
          <div className="flex flex-wrap gap-3 mt-3 text-sm text-[#7a6e63]">
            {transaction.closing_date && (
              <span>Closing: <strong className="text-[#2c2420]">{formatDate(transaction.closing_date)}</strong></span>
            )}
            {transaction.sale_price && (
              <span>Price: <strong className="text-[#2c2420]">{formatCurrency(transaction.sale_price)}</strong></span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Progress Bar */}
        <section>
          <h2 className="text-xs uppercase tracking-wider text-[#b0a698] font-semibold mb-4">
            Transaction Progress
          </h2>
          <div className="flex items-center gap-0">
            {STAGE_ORDER.map((stage, i) => {
              const isCompleted = i <= currentStageIndex
              const isCurrent = i === currentStageIndex
              return (
                <div key={stage} className="flex-1 flex flex-col items-center">
                  {/* Bar segment */}
                  <div className="w-full flex items-center">
                    <div
                      className={`h-2 w-full rounded-full ${
                        isCompleted
                          ? 'bg-[#84c9d1]'
                          : 'bg-[#e8e2d9]'
                      }`}
                    />
                  </div>
                  {/* Label */}
                  <span
                    className={`text-[10px] md:text-xs mt-2 text-center leading-tight ${
                      isCurrent
                        ? 'text-[#84c9d1] font-semibold'
                        : isCompleted
                        ? 'text-[#2c2420]'
                        : 'text-[#b0a698]'
                    }`}
                  >
                    {STAGE_LABELS[stage]}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        {/* Key Dates */}
        <section>
          <h2 className="text-xs uppercase tracking-wider text-[#b0a698] font-semibold mb-3">
            Key Dates
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-[#e8e2d9] px-4 py-3">
              <p className="text-xs text-[#b0a698]">Contract Date (MEC)</p>
              <p className="text-sm font-medium text-[#2c2420] mt-0.5">
                {formatDate(transaction.mec_date)}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-[#e8e2d9] px-4 py-3">
              <p className="text-xs text-[#b0a698]">Closing Date</p>
              <p className="text-sm font-medium text-[#2c2420] mt-0.5">
                {formatDate(transaction.closing_date)}
              </p>
            </div>
          </div>
        </section>

        {/* Upcoming Deadlines */}
        {upcomingDeadlines.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-wider text-[#b0a698] font-semibold mb-3">
              Upcoming Deadlines
            </h2>
            <div className="space-y-2">
              {upcomingDeadlines.map((d, i) => {
                const days = daysUntil(d.due_date)
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-white rounded-xl border border-[#e8e2d9] px-4 py-3"
                  >
                    <div className="flex-shrink-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          days < 0
                            ? 'bg-red-50 text-red-600'
                            : days <= 3
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-[#f5f0ea] text-[#84c9d1]'
                        }`}
                      >
                        {days < 0 ? `${Math.abs(days)}` : days === 0 ? '!' : days}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#2c2420]">{d.name}</p>
                      <p className="text-xs text-[#b0a698]">{formatDate(d.due_date)}</p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        days < 0
                          ? 'bg-red-50 text-red-700'
                          : days <= 3
                          ? 'bg-amber-50 text-amber-700'
                          : days <= 7
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-[#f5f0ea] text-[#7a6e63]'
                      }`}
                    >
                      {days < 0
                        ? `${Math.abs(days)}d overdue`
                        : days === 0
                        ? 'Today'
                        : `${days} days`}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Completed Deadlines */}
        {completedDeadlines.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-wider text-[#b0a698] font-semibold mb-3">
              Completed
            </h2>
            <div className="space-y-1.5">
              {completedDeadlines.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-white/60 rounded-xl border border-[#e8e2d9]/60 px-4 py-2.5"
                >
                  <svg
                    className="w-4 h-4 text-emerald-500 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm text-[#7a6e63] line-through flex-1">
                    {d.name}
                  </span>
                  <span className="text-xs text-[#b0a698]">
                    {d.status === 'waived' ? 'Waived' : formatDate(d.due_date)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Documents */}
        {(documents ?? []).length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-wider text-[#b0a698] font-semibold mb-3">
              Documents
            </h2>
            <div className="space-y-2">
              {(documents ?? []).map((doc, i) => {
                const isReceived =
                  doc.status === 'uploaded' ||
                  doc.status === 'sent' ||
                  doc.status === 'signed'
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-white rounded-xl border border-[#e8e2d9] px-4 py-3"
                  >
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        isReceived ? 'bg-emerald-500' : 'bg-amber-400'
                      }`}
                    />
                    <span className="text-sm text-[#2c2420] flex-1">
                      {doc.display_name}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        isReceived
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {docStatusLabel(doc.status as DocumentStatus)}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Empty state */}
        {(deadlines ?? []).length === 0 && (documents ?? []).length === 0 && (
          <div className="text-center py-16">
            <p className="text-[#7a6e63]">
              No details available yet. Your agent will update this portal as the transaction progresses.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e8e2d9] bg-white mt-12">
        <div className="max-w-2xl mx-auto px-4 py-6 text-center">
          <p className="text-xs text-[#b0a698]">
            Powered by <span className="font-semibold text-[#84c9d1]">Done Deal</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
