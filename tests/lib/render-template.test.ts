import { describe, it, expect } from 'vitest'
import { renderTemplate, buildTemplateContext } from '@/lib/render-template'

describe('renderTemplate', () => {
  it('replaces known variables in subject and body', () => {
    const result = renderTemplate(
      { subject: 'Hello {{buyer_name}}', body: 'Property: {{property_address}}' },
      { buyer_name: 'John Smith', property_address: '123 Main St' }
    )
    expect(result.subject).toBe('Hello John Smith')
    expect(result.body).toBe('Property: 123 Main St')
  })

  it('replaces unknown variables with empty string, not raw tags', () => {
    const result = renderTemplate(
      { subject: 'Test {{unknown_var}}', body: 'Body' },
      {}
    )
    expect(result.subject).toBe('Test ')
    expect(result.subject).not.toContain('{{')
  })

  it('handles multiple variables in both subject and body', () => {
    const result = renderTemplate(
      {
        subject: '{{buyer_name}} — {{property_address}}',
        body: 'Closing on {{closing_date}} with {{agent_name}}',
      },
      {
        buyer_name: 'Jane Doe',
        property_address: '456 Oak Ave',
        closing_date: '06/15/2024',
        agent_name: 'Bob Agent',
      }
    )
    expect(result.subject).toBe('Jane Doe — 456 Oak Ave')
    expect(result.body).toBe('Closing on 06/15/2024 with Bob Agent')
  })

  it('returns text unchanged when there are no template variables', () => {
    const result = renderTemplate(
      { subject: 'No variables here', body: 'Plain text body.' },
      {}
    )
    expect(result.subject).toBe('No variables here')
    expect(result.body).toBe('Plain text body.')
  })

  it('replaces partially known context — known vars filled, unknown vars empty', () => {
    const result = renderTemplate(
      { subject: 'Hi {{buyer_name}}, re: {{unknown_field}}', body: '{{agent_name}}' },
      { buyer_name: 'Alice', agent_name: 'Carol' }
    )
    expect(result.subject).toBe('Hi Alice, re: ')
    expect(result.body).toBe('Carol')
  })
})

describe('buildTemplateContext', () => {
  // Use datetime strings with explicit noon UTC to avoid off-by-one from timezone parsing
  const baseTransaction = {
    property_address: '789 Pine Rd, Denver, CO',
    closing_date: '2024-06-15T12:00:00',
    mec_date: '2024-05-01T12:00:00',
    sale_price: 350000,
    earnest_money: 5000,
  }

  const baseParties = [
    { role: 'buyer', name: 'John Buyer', company: null },
    { role: 'seller', name: 'Jane Seller', company: null },
    { role: 'lender', name: 'Loan Officer', company: 'First Bank' },
    { role: 'title', name: 'Title Agent', company: 'Denver Title Co' },
  ]

  it('formats currency correctly for sale_price', () => {
    const ctx = buildTemplateContext({
      transaction: baseTransaction,
      parties: baseParties,
      agentName: 'Test Agent',
    })
    expect(ctx.sale_price).toBe('$350,000')
  })

  it('formats currency correctly for earnest_money', () => {
    const ctx = buildTemplateContext({
      transaction: baseTransaction,
      parties: baseParties,
      agentName: 'Test Agent',
    })
    expect(ctx.earnest_money).toBe('$5,000')
  })

  it('formats closing_date as MM/DD/YYYY', () => {
    const ctx = buildTemplateContext({
      transaction: baseTransaction,
      parties: baseParties,
      agentName: 'Test Agent',
    })
    expect(ctx.closing_date).toBe('06/15/2024')
  })

  it('formats mec_date as MM/DD/YYYY', () => {
    const ctx = buildTemplateContext({
      transaction: baseTransaction,
      parties: baseParties,
      agentName: 'Test Agent',
    })
    expect(ctx.mec_date).toBe('05/01/2024')
  })

  it('returns empty string for buyer_name when buyer party is missing', () => {
    const partiesWithoutBuyer = baseParties.filter(p => p.role !== 'buyer')
    const ctx = buildTemplateContext({
      transaction: baseTransaction,
      parties: partiesWithoutBuyer,
      agentName: 'Test Agent',
    })
    expect(ctx.buyer_name).toBe('')
  })

  it('returns empty string for seller_name when seller party is missing', () => {
    const partiesWithoutSeller = baseParties.filter(p => p.role !== 'seller')
    const ctx = buildTemplateContext({
      transaction: baseTransaction,
      parties: partiesWithoutSeller,
      agentName: 'Test Agent',
    })
    expect(ctx.seller_name).toBe('')
  })

  it('uses company name for title_company when available', () => {
    const ctx = buildTemplateContext({
      transaction: baseTransaction,
      parties: baseParties,
      agentName: 'Test Agent',
    })
    expect(ctx.title_company).toBe('Denver Title Co')
  })

  it('falls back to party name for title_company when company is null', () => {
    const partiesNoTitleCompany = baseParties.map(p =>
      p.role === 'title' ? { ...p, company: null } : p
    )
    const ctx = buildTemplateContext({
      transaction: baseTransaction,
      parties: partiesNoTitleCompany,
      agentName: 'Test Agent',
    })
    expect(ctx.title_company).toBe('Title Agent')
  })

  it('uses company name for lender_name when available', () => {
    const ctx = buildTemplateContext({
      transaction: baseTransaction,
      parties: baseParties,
      agentName: 'Test Agent',
    })
    expect(ctx.lender_name).toBe('First Bank')
  })

  it('passes through agent_name unchanged', () => {
    const ctx = buildTemplateContext({
      transaction: baseTransaction,
      parties: baseParties,
      agentName: 'My Agent Name',
    })
    expect(ctx.agent_name).toBe('My Agent Name')
  })

  it('returns empty string for currency when value is null', () => {
    const ctx = buildTemplateContext({
      transaction: { ...baseTransaction, sale_price: null, earnest_money: null },
      parties: baseParties,
      agentName: 'Test Agent',
    })
    expect(ctx.sale_price).toBe('')
    expect(ctx.earnest_money).toBe('')
  })

  it('returns empty string for dates when value is null', () => {
    const ctx = buildTemplateContext({
      transaction: { ...baseTransaction, closing_date: null as unknown as string, mec_date: null as unknown as string },
      parties: baseParties,
      agentName: 'Test Agent',
    })
    expect(ctx.closing_date).toBe('')
    expect(ctx.mec_date).toBe('')
  })
})
