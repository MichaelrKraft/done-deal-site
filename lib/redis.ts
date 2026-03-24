import { Redis } from 'ioredis'

let redis: Redis | null = null

// For use with ioredis directly (non-BullMQ consumers)
export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: null, // required by BullMQ
      lazyConnect: true,
    })
  }
  return redis
}

// BullMQ bundles its own ioredis internally, so we pass connection options
// (not a Redis instance) to avoid type conflicts between the two ioredis copies.
export function getBullMQConnection(): { url: string } {
  return { url: process.env.REDIS_URL || 'redis://localhost:6379' }
}
