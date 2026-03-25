import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login')

  const { data: agent } = await supabase
    .from('agents')
    .select('name, email, autonomy_default, telegram_id, outlook_token')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) redirect('/onboarding')

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-serif text-[#2c2420] mb-6">Settings</h1>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#b0a698]">Name</span>
            <span className="text-[#2c2420]">{agent.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#b0a698]">Email</span>
            <span className="text-[#2c2420]">{agent.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#b0a698]">Telegram</span>
            <span className="text-[#2c2420]">{agent.telegram_id ?? 'Not connected'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#b0a698]">Default Mode</span>
            <span className="text-gray-100 capitalize">{agent.autonomy_default}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Integrations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[#b0a698]">Telegram</span>
              {agent.telegram_id ? (
                <span className="inline-flex items-center gap-1.5 text-[#0F7B0F] text-xs font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0F7B0F]" />
                  Connected
                </span>
              ) : (
                <span className="text-[#b0a698] text-xs">Not connected</span>
              )}
            </div>
            {agent.telegram_id ? (
              <p className="text-xs text-[#b0a698]">
                Chat ID: {agent.telegram_id} — You will receive push notifications for pending actions.
              </p>
            ) : (
              <div className="rounded-md bg-[#faf8f5] border border-[#e8e2d9] p-3 text-xs text-[#7a6e63] space-y-1">
                <p>To connect Telegram notifications:</p>
                <p>1. Open Telegram and search for your Done Deal bot</p>
                <p>2. Send /start to the bot</p>
                <p>3. The bot will reply with your Chat ID</p>
                <p>4. Ask your admin to add the Chat ID to your agent profile</p>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#b0a698]">Outlook email</span>
            {agent.outlook_token ? (
              <span className="inline-flex items-center gap-1.5 text-[#0F7B0F] text-xs font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0F7B0F]" />
                Connected
              </span>
            ) : (
              <a
                href="/api/auth/microsoft"
                className="inline-flex items-center gap-1.5 rounded-md bg-[#c75c2e] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#b5512a] transition-colors"
              >
                Connect Outlook
              </a>
            )}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#b0a698]">WhatsApp</span>
            <span className="text-[#b0a698] text-xs">Coming soon</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
