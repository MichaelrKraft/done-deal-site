import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { Transaction } from '@/types/database'

export async function POST(request: NextRequest) {
  // 1. Auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 2. Agent lookup
  const { data: agent } = await supabase
    .from('agents')
    .select('id, name')
    .eq('auth_user_id', user.id)
    .single()
  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  // 3. Parse request body
  const body: unknown = await request.json()
  const message = typeof body === 'object' && body !== null && 'message' in body
    ? String((body as { message: unknown }).message)
    : ''
  if (!message.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  // 4. Check API key
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'AI assistant is not configured. Please set ANTHROPIC_API_KEY.' },
      { status: 503 }
    )
  }

  // 5. Load active transactions + related data
  const { data: rawTransactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('agent_id', agent.id)
    .not('stage', 'in', '("closed","archived")')

  const transactions = (rawTransactions ?? []) as Transaction[]
  const txIds = transactions.map((tx) => tx.id)

  let parties: { transaction_id: string; role: string; name: string; email: string | null }[] = []
  let deadlines: { transaction_id: string; name: string; due_date: string; status: string }[] = []
  let tasks: { transaction_id: string; title: string; status: string; assigned_to: string }[] = []

  if (txIds.length > 0) {
    const [pRes, dRes, tRes] = await Promise.all([
      supabase.from('parties').select('transaction_id, role, name, email').in('transaction_id', txIds),
      supabase.from('deadlines').select('transaction_id, name, due_date, status').in('transaction_id', txIds),
      supabase.from('tasks').select('transaction_id, title, status, assigned_to').in('transaction_id', txIds),
    ])
    parties = pRes.data ?? []
    deadlines = dRes.data ?? []
    tasks = tRes.data ?? []
  }

  // 6. Build context string
  const today = new Date()
  const contextLines: string[] = ['ACTIVE TRANSACTIONS\n']

  for (const tx of transactions) {
    const txParties = parties.filter((p) => p.transaction_id === tx.id)
    const txDeadlines = deadlines
      .filter((d) => d.transaction_id === tx.id)
      .sort((a, b) => a.due_date.localeCompare(b.due_date))
    const txTasks = tasks.filter((t) => t.transaction_id === tx.id && t.status !== 'completed')

    contextLines.push(`--- ${tx.property_address} (${tx.stage}, ${tx.side}) ---`)
    contextLines.push(`  MEC: ${tx.mec_date ?? 'Not set'} | Closing: ${tx.closing_date ?? 'Not set'}`)

    if (txParties.length > 0) {
      contextLines.push('  Parties: ' + txParties.map((p) => `${p.role}: ${p.name}`).join(', '))
    }

    if (txDeadlines.length > 0) {
      contextLines.push('  Deadlines:')
      for (const d of txDeadlines) {
        const daysUntil = Math.ceil(
          (new Date(d.due_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )
        let flag = ''
        if (d.status === 'pending' && daysUntil < 0) flag = ' ** OVERDUE **'
        else if (d.status === 'pending' && daysUntil <= 7) flag = ' * DUE SOON *'
        contextLines.push(`    - ${d.name}: ${d.due_date} [${d.status}]${flag}`)
      }
    }

    if (txTasks.length > 0) {
      contextLines.push('  Tasks: ' + txTasks.map((t) => `${t.title} [${t.status}]`).join(', '))
    }

    contextLines.push('')
  }

  const context = contextLines.join('\n')

  // 7. Call Claude
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: `You are an AI transaction coordinator assistant for ${agent.name} at Your Castle Real Estate. Answer questions about their transactions concisely and helpfully. Use Colorado real estate terminology. Today is ${today.toISOString().split('T')[0]}.

If the agent has no active transactions, let them know and suggest they add one.

Here is the current state of their transactions:
${context}`,
      messages: [{ role: 'user', content: message }],
    })

    const textBlock = response.content.find((b) => b.type === 'text')
    const reply = textBlock ? textBlock.text : 'No response generated.'

    return NextResponse.json({ reply })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Chat API] Claude error:', errorMessage)
    return NextResponse.json(
      { error: 'Failed to get a response from the AI assistant.' },
      { status: 500 }
    )
  }
}
