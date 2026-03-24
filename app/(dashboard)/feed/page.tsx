import { createClient } from '@/lib/supabase/server'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Feed</h1>
        <p className="mt-1 text-sm text-gray-400">
          Welcome{user?.email ? `, ${user.email}` : ''}
        </p>
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-900 p-12 text-center">
        <p className="text-gray-500 text-sm">Your AI TC inbox will appear here</p>
        <p className="mt-2 text-xs text-gray-600">
          Add a transaction to get started — your TC will surface pending actions, deadlines, and draft emails here.
        </p>
      </div>
    </div>
  )
}
