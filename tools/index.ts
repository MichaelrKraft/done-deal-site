import type { TCToolDefinition, TCToolResult } from './types'
import { emailDrafterDef, executeEmailDrafter } from './email-drafter'
import { deadlineReminderDef, executeDeadlineReminder } from './deadline-reminder'
import { transactionSummarizerDef, executeTransactionSummarizer } from './transaction-summarizer'
import { complianceFlaggerDef, executeComplianceFlagger } from './compliance-flagger'
import { stageUpdaterDefinition, executeStageUpdate } from './stage-updater'
import { calendarEventDefinition, executeCalendarEvent } from './calendar-event'

// Re-export shared types
export type { TCToolDefinition, TCToolResult } from './types'
export { defineTool } from './types'

// ============================================================
// ALL TOOL DEFINITIONS (pass to Claude API)
// ============================================================

export const allToolDefinitions: TCToolDefinition[] = [
  emailDrafterDef,
  deadlineReminderDef,
  transactionSummarizerDef,
  complianceFlaggerDef,
  stageUpdaterDefinition,
  calendarEventDefinition,
]

// ============================================================
// DISPATCHER
// ============================================================

type ToolExecutor = (input: never) => TCToolResult

const EXECUTORS: Record<string, ToolExecutor> = {
  draft_email: executeEmailDrafter as ToolExecutor,
  send_deadline_reminder: executeDeadlineReminder as ToolExecutor,
  generate_daily_digest: executeTransactionSummarizer as ToolExecutor,
  flag_compliance_issue: executeComplianceFlagger as ToolExecutor,
  update_transaction_stage: executeStageUpdate as ToolExecutor,
  create_calendar_event: executeCalendarEvent as ToolExecutor,
}

export async function executeToolCall(
  toolName: string,
  input: unknown
): Promise<TCToolResult> {
  const executor = EXECUTORS[toolName]

  if (!executor) {
    return {
      success: false,
      summary: `Unknown tool: "${toolName}". Available tools: ${Object.keys(EXECUTORS).join(', ')}`,
      actionType: 'error',
      draftContent: { error: `Unknown tool: ${toolName}` },
    }
  }

  return executor(input as never)
}
