export type TCJobType =
  | 'morning_sweep'
  | 'midday_check'
  | 'eod_wrap'
  | 'nextday_prep'
  | 'deadline_watch'
  | 'token_refresh'
  | 'email_sync'
  | 'weekly_health'

export type TCEventType =
  | 'mec_entered'        // MEC date was set → run deadline calculator
  | 'document_uploaded'  // document added → check compliance
  | 'stage_changed'      // transaction moved → adjust tasks
  | 'email_received'     // incoming email detected → associate with transaction
  | 'action_approved'    // agent approved an action → execute it

export interface TCAgentJobData {
  agent_id: string
  job_type: TCJobType
  run_at?: string // ISO timestamp for scheduled run
}

export interface TCEventJobData {
  agent_id: string
  transaction_id: string
  event_type: TCEventType
  payload?: Record<string, unknown>
}

// Unique job ID to prevent duplicate runs
export function makeJobId(agentId: string, jobType: string, dateKey: string): string {
  return `${agentId}:${jobType}:${dateKey}`
}
