import type { EmailTemplateRow } from '@/types/database'

export interface TemplateContext {
  buyer_name?: string
  seller_name?: string
  property_address?: string
  closing_date?: string
  mec_date?: string
  agent_name?: string
  title_company?: string
  lender_name?: string
  earnest_money?: string
  sale_price?: string
}

/** Replace {{variable_name}} tags. Unknown vars → empty string (clean email, no raw tags). */
export function renderTemplate(
  template: Pick<EmailTemplateRow, 'subject' | 'body'>,
  context: TemplateContext
): { subject: string; body: string } {
  const replace = (text: string): string =>
    text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      const val = context[key as keyof TemplateContext]
      return val !== undefined && val !== null ? val : ''
    })
  return { subject: replace(template.subject), body: replace(template.body) }
}

/** Build a TemplateContext from raw transaction + party data. All fields optional. */
export function buildTemplateContext(params: {
  transaction: {
    property_address?: string | null
    closing_date?: string | null
    mec_date?: string | null
    sale_price?: number | null
    earnest_money?: number | null
  }
  parties: Array<{ role: string; name: string | null; company?: string | null }>
  agentName: string
}): TemplateContext {
  const { transaction, parties, agentName } = params
  const getParty = (role: string) => parties.find(p => p.role === role)

  const formatDate = (d?: string | null): string => {
    if (!d) return ''
    try {
      return new Date(d).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    } catch { return d }
  }
  const formatCurrency = (n?: number | null): string => {
    if (!n) return ''
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
  }

  const buyer  = getParty('buyer')
  const seller = getParty('seller')
  const lender = getParty('lender')
  const title  = getParty('title')

  return {
    buyer_name:       buyer?.name  ?? '',
    seller_name:      seller?.name ?? '',
    property_address: transaction.property_address ?? '',
    closing_date:     formatDate(transaction.closing_date),
    mec_date:         formatDate(transaction.mec_date),
    agent_name:       agentName,
    title_company:    title?.company  ?? title?.name  ?? '',
    lender_name:      lender?.company ?? lender?.name ?? '',
    earnest_money:    formatCurrency(transaction.earnest_money),
    sale_price:       formatCurrency(transaction.sale_price),
  }
}
