import type { Anthropic } from '@anthropic-ai/sdk'

// ============================================================
// SHARED TC TOOL TYPES
// ============================================================

export interface TCToolResult {
  success: boolean
  summary: string // <=500 chars, fed back to Claude as tool result
  actionType: string // maps to ai_actions.action_type
  draftContent: Record<string, unknown> // stored in ai_actions.draft_content
}

export type TCToolDefinition = Anthropic.Tool

// ============================================================
// HELPER
// ============================================================

export function defineTool(
  name: string,
  description: string,
  inputSchema: Record<string, unknown>
): TCToolDefinition {
  return {
    name,
    description,
    input_schema: {
      type: 'object' as const,
      ...inputSchema,
    },
  }
}
