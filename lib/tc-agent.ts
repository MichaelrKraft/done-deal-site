import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import type { Database, Agent, Transaction, Party, Deadline, Task, ComplianceRequirement } from '@/types/database'
import { classifyRisk, shouldAutoExecute } from '@/lib/risk-classifier'
import { allToolDefinitions, executeToolCall } from '@/tools'
import type { TCJobType } from '@/worker/job-types'
import { sendTelegramMessage, sendTelegramApprovalRequest } from '@/integrations/telegram'

// ============================================================
// SERVICE CLIENT (worker context — no cookies)
// ============================================================

function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ============================================================
// JOB TYPE DESCRIPTIONS
// ============================================================

const JOB_DESCRIPTIONS: Record<TCJobType, string> = {
  morning_sweep: 'Full review of all active transactions. Check deadlines, draft emails, flag compliance gaps.',
  midday_check: 'Quick check for urgent items — overdue deadlines, unanswered emails, stalled tasks.',
  eod_wrap: 'End-of-day wrap-up. Summarize progress, flag anything that needs attention tomorrow.',
  nextday_prep: 'Prepare for tomorrow — pre-draft emails, check next-day deadlines.',
  deadline_watch: 'Focused deadline scan. Flag any deadlines due within 48 hours or already overdue.',
  token_refresh: 'Internal maintenance — refresh OAuth tokens. No transaction actions needed.',
  email_sync: 'Sync and categorize new emails. Associate with transactions.',
  weekly_health: 'Weekly health check across all transactions. Identify stalled deals and compliance risks.',
}

// ============================================================
// MAIN AGENT ENTRY POINT
// ============================================================

const MAX_ITERATIONS = 10

export async function runTCAgent(agentId: string, jobType: TCJobType): Promise<void> {
  const supabase = createServiceClient()
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  // 1. Load agent
  const { data: rawAgent, error: agentError } = await supabase
    .from('agents')
    .select('*')
    .eq('id', agentId)
    .single()

  if (agentError || !rawAgent) {
    console.error(`[TC Agent] Agent ${agentId} not found:`, agentError?.message)
    return
  }
  const agent = rawAgent as Agent

  // 2. Load active transactions (exclude closed/archived)
  const { data: rawTransactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('agent_id', agentId)
    .not('stage', 'in', '("closed","archived")')

  const transactions = (rawTransactions ?? []) as Transaction[]
  if (transactions.length === 0) {
    console.log(`[TC Agent] No active transactions for ${agent.name}`)
    return
  }

  // 3. Load related data for all transactions
  const txIds = transactions.map((tx) => tx.id)

  const [partiesResult, deadlinesResult, tasksResult, complianceResult] = await Promise.all([
    supabase.from('parties').select('*').in('transaction_id', txIds),
    supabase.from('deadlines').select('*').in('transaction_id', txIds),
    supabase.from('tasks').select('*').in('transaction_id', txIds),
    supabase.from('compliance_requirements').select('*').in('transaction_id', txIds),
  ])

  // 4. Build Claude messages
  const systemPrompt = buildSystemPrompt(agent, jobType)
  const contextMessage = buildContextMessage(
    transactions,
    (partiesResult.data ?? []) as Party[],
    (deadlinesResult.data ?? []) as Deadline[],
    (tasksResult.data ?? []) as Task[],
    (complianceResult.data ?? []) as ComplianceRequirement[]
  )

  // 5. Tool-use loop (max iterations to prevent runaway)
  let messages: Anthropic.MessageParam[] = [
    { role: 'user', content: contextMessage },
  ]

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: systemPrompt,
      messages,
      tools: allToolDefinitions as Anthropic.Tool[],
    })

    const toolUseBlocks = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
    )

    if (toolUseBlocks.length === 0) {
      console.log(`[TC Agent] Completed for ${agent.name} after ${i + 1} iteration(s)`)
      break
    }

    // Process each tool call
    const toolResults: Anthropic.ToolResultBlockParam[] = []

    for (const toolUse of toolUseBlocks) {
      const result = await executeToolCall(toolUse.name, toolUse.input)

      // Determine which transaction this action targets
      const input = toolUse.input as Record<string, unknown>
      const transactionId = (typeof input.transaction_id === 'string'
        ? input.transaction_id
        : transactions[0].id)
      const transaction = transactions.find((tx) => tx.id === transactionId)

      // Risk classification + auto-execute gate
      const riskLevel = classifyRisk(result.actionType, result.draftContent)
      const autonomyMode = transaction?.autonomy_mode ?? 'supervised'
      const autoExecute = shouldAutoExecute(riskLevel, autonomyMode)

      // Persist action record
      const { error: insertError } = await supabase.from('ai_actions').insert({
        transaction_id: transactionId,
        agent_id: agentId,
        action_type: result.actionType,
        risk_level: riskLevel,
        status: autoExecute ? 'auto_executed' : 'pending',
        draft_content: result.draftContent,
        context_summary: result.summary,
        executed_at: autoExecute ? new Date().toISOString() : null,
      })

      if (insertError) {
        console.error('[TC Agent] Failed to insert ai_action:', insertError.message)
      }

      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: result.summary,
      })
    }

    // Append assistant turn + tool results for next iteration
    messages = [
      ...messages,
      { role: 'assistant', content: response.content },
      { role: 'user', content: toolResults },
    ]
  }

  // 6. Telegram notifications (after tool-use loop)
  await notifyViaTelegram(agent, agentId, supabase, transactions)
}

// ============================================================
// TELEGRAM NOTIFICATIONS
// ============================================================

async function notifyViaTelegram(
  agent: Agent,
  agentId: string,
  supabase: ReturnType<typeof createServiceClient>,
  transactions: Transaction[]
): Promise<void> {
  if (!agent.telegram_id || !process.env.TELEGRAM_BOT_TOKEN) return

  // Query actions created in the last 5 minutes (this run's actions)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

  const { data: recentActions } = await supabase
    .from('ai_actions')
    .select('id, action_type, risk_level, status, context_summary, transaction_id')
    .eq('agent_id', agentId)
    .gte('created_at', fiveMinutesAgo)

  const actions = recentActions ?? []
  const pendingActions = actions.filter((a) => a.status === 'pending')
  const highRiskPending = pendingActions.filter((a) => a.risk_level === 'high')

  if (pendingActions.length === 0) return

  // Summary message
  await sendTelegramMessage(
    agent.telegram_id,
    `You have *${pendingActions.length}* new item${pendingActions.length === 1 ? '' : 's'} to review.`
  )

  // Individual alerts for HIGH risk items
  for (const action of highRiskPending) {
    const tx = transactions.find((t) => t.id === action.transaction_id)
    await sendTelegramApprovalRequest(agent.telegram_id, {
      id: action.id,
      type: action.action_type,
      summary: action.context_summary ?? 'No summary available',
      property: tx?.property_address ?? 'Unknown property',
    })
  }
}

// ============================================================
// SYSTEM PROMPT BUILDER
// ============================================================

function buildSystemPrompt(agent: Agent, jobType: TCJobType): string {
  const today = new Date().toISOString().split('T')[0]
  const jobDesc = JOB_DESCRIPTIONS[jobType]

  return `You are an AI transaction coordinator for ${agent.name} at Your Castle Real Estate in Colorado.
Today is ${today}. Job type: ${jobType} — ${jobDesc}

COLORADO DEADLINE RULES:
- All contract deadlines are calculated from the MEC (Mutual Execution of Contract) date.
- Key deadlines: Title Commitment (within 14 calendar days of MEC), Inspection Objection (10 calendar days from MEC), Loan Objection (varies), Appraisal Objection, Closing Date.
- "Calendar days" includes weekends; "business days" excludes weekends and federal holidays.
- If a deadline falls on a weekend/holiday, it extends to the next business day.

YOUR CASTLE COMPLIANCE:
- CDA (Commission Disbursement Authorization) must be submitted 5 calendar days before closing.
- Wire Fraud Warning email must be sent 5 calendar days before closing.
- All executed documents must be sent to documents@yourcastle.org within 5 business days of MEC.
- Pre-1978 properties require Lead-Based Paint Disclosure. Properties with well/septic/solar/HOA have additional requirements.

TOOL USAGE:
- Use draft_email to compose emails to parties (lender, title, buyer, seller, etc.).
- Use send_deadline_reminder for upcoming or overdue deadline notifications.
- Use generate_daily_digest to summarize transaction status.
- Use flag_compliance_issue when you detect a missing or overdue compliance requirement.

RISK GUIDANCE:
- LOW: routine check-ins, status updates, thank-you emails — safe for auto-execution in autonomous mode.
- MEDIUM: earnest money reminders, lender follow-ups, disclosure packages — always require agent approval.
- HIGH: inspection objections, contract amendments, CDA submissions, wire fraud warnings — always require agent approval.

Always include the transaction_id in every tool call. Be concise and action-oriented.`
}

// ============================================================
// CONTEXT MESSAGE BUILDER
// ============================================================

function buildContextMessage(
  transactions: Transaction[],
  parties: Party[],
  deadlines: Deadline[],
  tasks: Task[],
  compliance: ComplianceRequirement[]
): string {
  const today = new Date()
  const sections: string[] = ['ACTIVE TRANSACTIONS\n']

  for (const tx of transactions) {
    const txParties = parties.filter((p) => p.transaction_id === tx.id)
    const txDeadlines = deadlines
      .filter((d) => d.transaction_id === tx.id)
      .sort((a, b) => a.due_date.localeCompare(b.due_date))
    const txTasks = tasks.filter((t) => t.transaction_id === tx.id)
    const txCompliance = compliance.filter((c) => c.transaction_id === tx.id)

    const daysInStage = Math.floor(
      (today.getTime() - new Date(tx.updated_at).getTime()) / (1000 * 60 * 60 * 24)
    )

    sections.push(`--- Transaction: ${tx.property_address} (${tx.id}) ---`)
    sections.push(`  Stage: ${tx.stage} | Side: ${tx.side} | Days in stage: ${daysInStage}`)
    sections.push(`  MEC: ${tx.mec_date ?? 'Not set'} | Closing: ${tx.closing_date ?? 'Not set'}`)
    sections.push(`  Autonomy: ${tx.autonomy_mode}`)

    // Parties
    if (txParties.length > 0) {
      sections.push('  Parties:')
      for (const p of txParties) {
        sections.push(`    - ${p.role}: ${p.name}${p.email ? ` (${p.email})` : ''}${p.company ? ` @ ${p.company}` : ''}`)
      }
    }

    // Deadlines — highlight overdue and upcoming
    if (txDeadlines.length > 0) {
      sections.push('  Deadlines:')
      for (const d of txDeadlines) {
        const dueDate = new Date(d.due_date)
        const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        let flag = ''
        if (d.status === 'pending' && daysUntil < 0) flag = ' ** OVERDUE **'
        else if (d.status === 'pending' && daysUntil <= 7) flag = ' * DUE SOON *'
        sections.push(`    - ${d.name}: ${d.due_date} [${d.status}]${flag}`)
      }
    }

    // Compliance
    if (txCompliance.length > 0) {
      sections.push('  Compliance:')
      for (const c of txCompliance) {
        sections.push(`    - ${c.requirement_type}: ${c.status}${c.notes ? ` (${c.notes})` : ''}`)
      }
    }

    // Tasks (only non-completed)
    const activeTasks = txTasks.filter((t) => t.status !== 'completed' && t.status !== 'skipped')
    if (activeTasks.length > 0) {
      sections.push('  Active tasks:')
      for (const t of activeTasks) {
        sections.push(`    - [${t.status}] ${t.title} (assigned: ${t.assigned_to}, risk: ${t.risk_level})`)
      }
    }

    sections.push('') // blank line between transactions
  }

  return sections.join('\n')
}
