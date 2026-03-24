import type { TCAgentJobData } from '../job-types'
import { runTCAgent } from '@/lib/tc-agent'

export async function processTCAgentJob(data: TCAgentJobData): Promise<void> {
  const { agent_id, job_type } = data

  console.log(`[TC Agent] ${job_type} for agent ${agent_id}`)

  switch (job_type) {
    case 'morning_sweep':
    case 'deadline_watch':
    case 'midday_check':
    case 'eod_wrap':
    case 'nextday_prep':
    case 'weekly_health':
      await runTCAgent(agent_id, job_type)
      break
    case 'token_refresh':
      await refreshOutlookTokens(agent_id)
      break
    case 'email_sync':
      await syncIncomingEmails(agent_id)
      break
  }
}

async function refreshOutlookTokens(agentId: string): Promise<void> {
  console.log(`[Token Refresh] Agent ${agentId} — Phase 4 will implement OAuth refresh`)
}

async function syncIncomingEmails(agentId: string): Promise<void> {
  console.log(`[Email Sync] Agent ${agentId} — Phase 4 will implement Graph API sync`)
}
