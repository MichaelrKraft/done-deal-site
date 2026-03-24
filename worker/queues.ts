import { Queue } from 'bullmq'
import { getBullMQConnection } from '@/lib/redis'
import type { TCAgentJobData, TCEventJobData } from './job-types'

// One queue for all TC agent jobs
export const tcAgentQueue = new Queue<TCAgentJobData>('tc-agent', {
  connection: getBullMQConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 30000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
})

// Event-triggered jobs (immediate processing)
export const eventQueue = new Queue<TCEventJobData>('tc-events', {
  connection: getBullMQConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 50,
    removeOnFail: 200,
  },
})
