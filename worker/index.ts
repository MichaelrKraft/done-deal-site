import { Worker, type Job } from 'bullmq'
import { createClient } from '@supabase/supabase-js'
import { getBullMQConnection } from '@/lib/redis'
import type { TCAgentJobData, TCEventJobData } from './job-types'
import { processTCAgentJob } from './jobs/tc-agent-job'
import { processTCEventJob } from './jobs/tc-event-job'
import { scheduleAllAgents, scheduleRepeatableJobs } from './scheduler'

const tcAgentWorker = new Worker<TCAgentJobData>(
  'tc-agent',
  async (job: Job<TCAgentJobData>) => {
    console.log(`[TC Worker] Processing ${job.data.job_type} for agent ${job.data.agent_id}`)
    await processTCAgentJob(job.data)
  },
  {
    connection: getBullMQConnection(),
    concurrency: 10, // process 10 agent jobs simultaneously
  }
)

const eventWorker = new Worker<TCEventJobData>(
  'tc-events',
  async (job: Job<TCEventJobData>) => {
    console.log(
      `[Event Worker] Processing ${job.data.event_type} for transaction ${job.data.transaction_id}`
    )
    await processTCEventJob(job.data)
  },
  {
    connection: getBullMQConnection(),
    concurrency: 20,
  }
)

tcAgentWorker.on('failed', (job, err) => {
  console.error(`[TC Worker] Job ${job?.id} FAILED after ${job?.attemptsMade} attempts`, {
    jobName: job?.name,
    agentId: (job?.data as unknown as Record<string, unknown>)?.agentId,
    error: err.message,
  })
})

eventWorker.on('failed', (job, err) => {
  console.error(`[Event Worker] Job ${job?.id} FAILED after ${job?.attemptsMade} attempts`, {
    jobName: job?.name,
    transactionId: (job?.data as unknown as Record<string, unknown>)?.transactionId,
    error: err.message,
  })
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  await tcAgentWorker.close()
  await eventWorker.close()
  process.exit(0)
})

console.log('[Done Deal Worker] Started — listening for TC agent jobs')

async function initializeScheduler(): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: agents } = await supabase
    .from('agents')
    .select('id')

  if (!agents || agents.length === 0) {
    console.log('[Scheduler] No active agents found, scheduler idle')
    return
  }

  const agentIds = agents.map((a: { id: string }) => a.id)
  await scheduleAllAgents(agentIds)

  // Also schedule repeatable jobs for each agent
  for (const agentId of agentIds) {
    await scheduleRepeatableJobs(agentId)
  }

  console.log(`[Scheduler] Initialized for ${agentIds.length} agents`)
}

// Call on startup with error handling
initializeScheduler().catch((err: Error) => {
  console.error('[Scheduler] Failed to initialize:', err.message)
})
