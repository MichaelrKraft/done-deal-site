import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login')

  const { data: agent } = await supabase
    .from('agents')
    .select('name, email, autonomy_default, telegram_id')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) redirect('/onboarding')

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-100 mb-6">Settings</h1>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Name</span>
            <span className="text-gray-100">{agent.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Email</span>
            <span className="text-gray-100">{agent.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Telegram</span>
            <span className="text-gray-100">{agent.telegram_id ?? 'Not connected'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Default Mode</span>
            <span className="text-gray-100 capitalize">{agent.autonomy_default}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Integrations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-400">
          <p>Outlook email — coming in Phase 4</p>
          <p>Telegram bot — coming in Phase 5</p>
          <p>WhatsApp — coming in Phase 5</p>
        </CardContent>
      </Card>
    </div>
  )
}
