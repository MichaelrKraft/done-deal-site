import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FeedList } from '@/components/feed/FeedList'

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
        <h1 className="text-2xl font-bold text-white">Feed</h1>
        <p className="mt-1 text-sm text-gray-400">
          Review and approve actions from your AI transaction coordinator.
        </p>
      </div>

      <FeedList agentId={agent.id} />
    </div>
  )
}
