import { defineTool } from './types'
import type { TCToolDefinition, TCToolResult } from './types'

// ============================================================
// INPUT TYPE
// ============================================================

interface ComplianceFlagInput {
  transaction_id: string
  requirement_type: string
  description: string
  risk_level: 'low' | 'medium' | 'high'
}

// ============================================================
// TOOL DEFINITION
// ============================================================

export const complianceFlaggerDef: TCToolDefinition = defineTool(
  'flag_compliance_issue',
  'Flag a compliance gap or missing requirement found during transaction review. Creates an action item for the agent to address.',
  {
    properties: {
      transaction_id: { type: 'string', description: 'UUID of the transaction' },
      requirement_type: { type: 'string', description: 'Type of compliance requirement (e.g. "lead_paint_disclosure", "septic_inspection")' },
      description: { type: 'string', description: 'Description of the compliance gap or issue' },
      risk_level: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Risk level of the compliance issue' },
    },
    required: ['transaction_id', 'requirement_type', 'description', 'risk_level'],
  }
)

// ============================================================
// EXECUTE
// ============================================================

const RECOMMENDED_ACTIONS: Record<string, string> = {
  lead_paint_disclosure: 'Obtain signed Lead-Based Paint Disclosure from all parties.',
  septic_inspection: 'Order county-approved septic inspection and pump-out.',
  well_inspection: 'Order bacteriological water test and mechanical well inspection.',
  solar_lease_assumption: 'Confirm buyer solar lease assumption or termination per CBS.',
  hoa_cic_documents: 'Request CIC documents from HOA management company.',
}

const DEFAULT_ACTION = 'Review and resolve this compliance requirement before closing.'

export function executeComplianceFlagger(input: ComplianceFlagInput): TCToolResult {
  const { requirement_type, description, risk_level } = input

  const recommendedAction = RECOMMENDED_ACTIONS[requirement_type] ?? DEFAULT_ACTION

  return {
    success: true,
    summary: `Flagged ${risk_level}-risk compliance issue: ${requirement_type}. ${description}`,
    actionType: 'compliance_flag',
    draftContent: {
      requirement_type,
      description,
      recommended_action: recommendedAction,
    },
  }
}
