import { tcAgentQueue } from './queues'
import { makeJobId, type TCJobType } from './job-types'

// Load all active agents and schedule their daily jobs.
// Called on worker startup and refreshed every 24 hours.
export async function scheduleAllAgents(agentIds: string[]): Promise<void> {
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  for (const agentId of agentIds) {
    await scheduleDailyJobs(agentId, today)
    await scheduleRepeatableJobs(agentId)
  }
}

async function scheduleDailyJobs(agentId: string, dateKey: string): Promise<void> {
  const jobs: Array<{ type: TCJobType; delay: number }> = [
    { type: 'morning_sweep', delay: getDelayUntilHour(7) },
    { type: 'midday_check', delay: getDelayUntilHour(12) },
    { type: 'eod_wrap', delay: getDelayUntilHour(17) },
    { type: 'nextday_prep', delay: getDelayUntilHour(21) },
  ]

  for (const job of jobs) {
    if (job.delay <= 0) continue // already past this time today

    await tcAgentQueue.add(
      job.type,
      { agent_id: agentId, job_type: job.type },
      {
        jobId: makeJobId(agentId, job.type, dateKey), // dedup: one job per agent per day
        delay: job.delay,
      }
    )
  }
}

// Repeatable jobs (BullMQ repeat)
export async function scheduleRepeatableJobs(agentId: string): Promise<void> {
  // Deadline watch: every 2 hours
  await tcAgentQueue.add(
    'deadline_watch',
    { agent_id: agentId, job_type: 'deadline_watch' },
    {
      repeat: { every: 2 * 60 * 60 * 1000 }, // 2 hours in ms
      jobId: `${agentId}:deadline_watch:repeat`,
    }
  )

  // Token refresh: every 60 minutes
  await tcAgentQueue.add(
    'token_refresh',
    { agent_id: agentId, job_type: 'token_refresh' },
    {
      repeat: { every: 60 * 60 * 1000 },
      jobId: `${agentId}:token_refresh:repeat`,
    }
  )

  // Email sync: every 6 hours
  await tcAgentQueue.add(
    'email_sync',
    { agent_id: agentId, job_type: 'email_sync' },
    {
      repeat: { every: 6 * 60 * 60 * 1000 },
      jobId: `${agentId}:email_sync:repeat`,
    }
  )
}

function getDelayUntilHour(hour: number): number {
  const now = new Date()
  const target = new Date()
  target.setHours(hour, 0, 0, 0)
  return Math.max(0, target.getTime() - now.getTime())
}
