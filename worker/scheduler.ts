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
        attempts: 3,
        backoff: { type: 'exponential', delay: 10_000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      }
    )
  }
}

// Repeatable jobs (BullMQ repeat)
// NOTE: jobId must NOT be used with repeat — BullMQ ignores/breaks it for repeatable jobs
export async function scheduleRepeatableJobs(agentId: string): Promise<void> {
  // Deadline watch: every 2 hours
  await tcAgentQueue.add(
    'deadline_watch',
    { agent_id: agentId, job_type: 'deadline_watch' },
    {
      repeat: { every: 2 * 60 * 60 * 1000 }, // 2 hours in ms
    }
  )

  // Token refresh: every 60 minutes
  await tcAgentQueue.add(
    'token_refresh',
    { agent_id: agentId, job_type: 'token_refresh' },
    {
      repeat: { every: 60 * 60 * 1000 },
    }
  )

  // Email sync: every 6 hours
  await tcAgentQueue.add(
    'email_sync',
    { agent_id: agentId, job_type: 'email_sync' },
    {
      repeat: { every: 6 * 60 * 60 * 1000 },
    }
  )
}

function getDenverOffsetHours(): number {
  // Denver is UTC-7 during MDT (March-October) or UTC-6 during MST
  const month = new Date().getMonth() + 1 // 1-based
  return month >= 3 && month <= 10 ? 7 : 6
}

function getDelayUntilHour(hour: number): number {
  // Use America/Denver timezone (UTC-7 in summer, UTC-6 in winter)
  const now = new Date()
  const denverOffset = getDenverOffsetHours()
  const target = new Date()
  target.setUTCHours(hour - denverOffset, 0, 0, 0)
  if (target <= now) target.setUTCDate(target.getUTCDate() + 1)
  return Math.max(0, target.getTime() - now.getTime())
}
