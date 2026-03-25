import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FeedList } from '@/components/feed/FeedList'
import { AskTC } from '@/components/feed/AskTC'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) redirect('/login')

  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) redirect('/onboarding')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif text-[#2c2420]">Feed</h1>
        <p className="mt-1 text-sm text-[#7a6e63]">
          Review and approve actions from your AI transaction coordinator.
        </p>
      </div>

      <AskTC agentId={agent.id} />

      <FeedList agentId={agent.id} />
    </div>
  )
}
