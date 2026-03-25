import { defineTool } from './types'
import type { TCToolResult } from './types'

export const stageUpdaterDefinition = defineTool(
  'update_transaction_stage',
  'Move a transaction to a new stage in the pipeline. Use when conditions are met for stage progression: MEC confirmed → Under Contract, all pre-close tasks done → Pre-Closing, closing confirmed → Closed.',
  {
    type: 'object',
    properties: {
      transaction_id: {
        type: 'string',
        description: 'The UUID of the transaction to update',
      },
      new_stage: {
        type: 'string',
        enum: ['pre_listing', 'active_listing', 'under_contract', 'pre_closing', 'closed'],
        description: 'The stage to move the transaction to',
      },
      reason: {
        type: 'string',
        description: 'Why the transaction should move to this stage (e.g., "MEC date confirmed", "All pre-close tasks complete")',
      },
    },
    required: ['transaction_id', 'new_stage', 'reason'],
  }
)

interface StageUpdateInput {
  transaction_id: string
  new_stage: string
  reason: string
}

export function executeStageUpdate(input: unknown): TCToolResult {
  const { transaction_id, new_stage, reason } = input as StageUpdateInput

  const stageLabels: Record<string, string> = {
    pre_listing: 'Pre-Listing',
    active_listing: 'Active Listing',
    under_contract: 'Under Contract',
    pre_closing: 'Pre-Closing',
    closed: 'Closed',
  }

  return {
    success: true,
    summary: `Stage update requested: move to ${stageLabels[new_stage] ?? new_stage}. Reason: ${reason}`,
    actionType: 'stage_update',
    draftContent: {
      transaction_id,
      new_stage,
      reason,
      stage_label: stageLabels[new_stage] ?? new_stage,
    },
  }
}
