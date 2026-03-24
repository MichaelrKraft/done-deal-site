import { Worker, type Job } from 'bullmq'
import { getBullMQConnection } from '@/lib/redis'
import type { TCAgentJobData, TCEventJobData } from './job-types'
import { processTCAgentJob } from './jobs/tc-agent-job'
import { processTCEventJob } from './jobs/tc-event-job'

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
  console.error(`[TC Worker] Job ${job?.id} failed:`, err.message)
})

eventWorker.on('failed', (job, err) => {
  console.error(`[Event Worker] Job ${job?.id} failed:`, err.message)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  await tcAgentWorker.close()
  await eventWorker.close()
  process.exit(0)
})

console.log('[Done Deal Worker] Started — listening for TC agent jobs')
