import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { tcAgentQueue } from '@/worker/queues'
import { rateLimit } from '@/lib/rate-limit'

export async function POST() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  const limited = await rateLimit(agent.id, 'agent-trigger', 1, 60_000)
  if (limited) return limited

  await tcAgentQueue.add(
    'morning_sweep',
    { agent_id: agent.id, job_type: 'morning_sweep' },
    { jobId: `manual-sweep-${agent.id}-${Date.now()}` }
  )

  return NextResponse.json({ queued: true })
}
