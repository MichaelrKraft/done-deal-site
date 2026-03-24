import type { TCAgentJobData } from '../job-types'

export async function processTCAgentJob(data: TCAgentJobData): Promise<void> {
  const { agent_id, job_type } = data

  console.log(`[TC Agent] ${job_type} for agent ${agent_id}`)

  switch (job_type) {
    case 'morning_sweep':
      await runMorningSweep(agent_id)
      break
    case 'deadline_watch':
      await runDeadlineWatch(agent_id)
      break
    case 'midday_check':
      await runMiddayCheck(agent_id)
      break
    case 'eod_wrap':
      await runEODWrap(agent_id)
      break
    case 'nextday_prep':
      await runNextDayPrep(agent_id)
      break
    case 'token_refresh':
      await refreshOutlookTokens(agent_id)
      break
    case 'email_sync':
      await syncIncomingEmails(agent_id)
      break
    case 'weekly_health':
      await runWeeklyHealthCheck(agent_id)
      break
  }
}

async function runMorningSweep(agentId: string): Promise<void> {
  // TODO Phase 3: Load all active transactions, run Claude TC loop, push morning brief
  console.log(`[Morning Sweep] Agent ${agentId} — Phase 3 will implement Claude loop`)
}

async function runDeadlineWatch(agentId: string): Promise<void> {
  // TODO Phase 3: Check deadlines approaching in 7/3/1 days, auto-draft reminders
  console.log(`[Deadline Watch] Agent ${agentId} — Phase 3 will implement deadline scanning`)
}

async function runMiddayCheck(agentId: string): Promise<void> {
  console.log(`[Midday Check] Agent ${agentId} — Phase 3 stub`)
}

async function runEODWrap(agentId: string): Promise<void> {
  console.log(`[EOD Wrap] Agent ${agentId} — Phase 3 stub`)
}

async function runNextDayPrep(agentId: string): Promise<void> {
  console.log(`[Next Day Prep] Agent ${agentId} — Phase 3 stub`)
}

async function refreshOutlookTokens(agentId: string): Promise<void> {
  console.log(`[Token Refresh] Agent ${agentId} — Phase 4 will implement OAuth refresh`)
}

async function syncIncomingEmails(agentId: string): Promise<void> {
  console.log(`[Email Sync] Agent ${agentId} — Phase 4 will implement Graph API sync`)
}

async function runWeeklyHealthCheck(agentId: string): Promise<void> {
  console.log(`[Weekly Health] Agent ${agentId} — Phase 3 stub`)
}
