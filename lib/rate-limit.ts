import Redis from 'ioredis'
import { NextResponse } from 'next/server'

let _redis: Redis | null = null

function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null
  try {
    if (!_redis) _redis = new Redis(process.env.REDIS_URL, { lazyConnect: true, enableOfflineQueue: false })
    return _redis
  } catch {
    return null
  }
}

/** Sliding window rate limiter using Redis sorted sets. Returns true if allowed. */
async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const r = getRedis()
  if (!r) return true  // Redis unavailable → fail open

  const now = Date.now()
  const redisKey = `ratelimit:${key}`
  try {
    const pipe = r.pipeline()
    pipe.zremrangebyscore(redisKey, '-inf', now - windowMs)
    pipe.zadd(redisKey, now, `${now}-${Math.random()}`)
    pipe.zcard(redisKey)
    pipe.pexpire(redisKey, windowMs)
    const results = await pipe.exec()
    const count = (results?.[2]?.[1] as number) ?? 0
    return count <= limit
  } catch {
    return true  // Redis error → fail open
  }
}

/** Returns 429 NextResponse if rate limited, null if allowed. */
export async function rateLimit(
  userId: string,
  endpoint: string,
  limit: number,
  windowMs: number
): Promise<NextResponse | null> {
  const allowed = await checkRateLimit(`${userId}:${endpoint}`, limit, windowMs)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before trying again.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(windowMs / 1000)) },
      }
    )
  }
  return null
}
