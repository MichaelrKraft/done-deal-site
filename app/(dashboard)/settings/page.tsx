import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MemoriesSection from '@/components/settings/MemoriesSection'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login')

  const { data: agent } = await supabase
    .from('agents')
    .select('id, name, email, autonomy_default, telegram_id, outlook_token, brokerage_id')
    .eq('auth_user_id', user.id)
    .single()

  if (!agent) redirect('/onboarding')

  const { data: memories } = await supabase
    .from('agent_memories')
    .select('id, memory_type, content, source, created_at')
    .eq('agent_id', agent.id)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(100)

  const { data: brokerage } = await supabase
    .from('brokerages')
    .select('name')
    .eq('id', agent.brokerage_id)
    .single()

  const { count: txCount } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('agent_id', agent.brokerage_id)

  return (
    <div className="p-8 max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-serif text-[#2c2420]">Settings</h1>
        <p className="text-sm text-[#7a6e63] mt-1">Configure your Done Deal instance</p>
      </div>

      {/* Profile */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-[#7a6e63]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" /></svg>
          <h2 className="text-sm font-semibold text-[#2c2420]">Profile</h2>
        </div>
        <div className="rounded-2xl border border-[#e8e2d9] bg-white divide-y divide-[#f0ebe4]">
          <div className="flex justify-between items-center px-4 py-3">
            <span className="text-sm text-[#2c2420] font-medium">{agent.name}</span>
            <span className="text-xs text-[#b0a698]">Agent</span>
          </div>
          <div className="flex justify-between items-center px-4 py-3">
            <span className="text-sm text-[#7a6e63]">{agent.email}</span>
            <span className="text-xs text-[#b0a698]">Email</span>
          </div>
          <div className="flex justify-between items-center px-4 py-3">
            <span className="text-sm text-[#7a6e63]">{brokerage?.name ?? 'Unknown'}</span>
            <span className="text-xs text-[#b0a698]">Brokerage</span>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-[#7a6e63]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.06a4.5 4.5 0 00-6.364-6.364L4.5 8.257" /></svg>
          <h2 className="text-sm font-semibold text-[#2c2420]">Integrations</h2>
        </div>
        <div className="rounded-2xl border border-[#e8e2d9] bg-white divide-y divide-[#f0ebe4]">
          <div className="px-4 py-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm text-[#2c2420] font-medium">Outlook Email</span>
                <p className="text-xs text-[#b0a698] mt-0.5">Send emails from your Outlook account</p>
              </div>
              {agent.outlook_token ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Configured
                </span>
              ) : (
                <a
                  href="/api/auth/microsoft"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#c75c2e] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#b5512a] transition-colors"
                >
                  Connect
                </a>
              )}
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm text-[#2c2420] font-medium">Telegram</span>
                <p className="text-xs text-[#b0a698] mt-0.5">Push notifications &amp; approve by reply</p>
              </div>
              {agent.telegram_id ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Configured
                </span>
              ) : (
                <span className="text-xs text-[#b0a698]">Not connected</span>
              )}
            </div>
            {!agent.telegram_id && (
              <div className="mt-2 rounded-lg bg-[#faf8f5] border border-[#f0ebe4] p-3 text-xs text-[#7a6e63] space-y-1">
                <p>1. Search for your Done Deal bot on Telegram</p>
                <p>2. Send <span className="font-mono bg-[#f0ebe4] px-1 rounded">/start</span></p>
                <p>3. Copy the Chat ID and ask your admin to add it</p>
              </div>
            )}
          </div>
          <div className="px-4 py-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm text-[#2c2420] font-medium">WhatsApp</span>
                <p className="text-xs text-[#b0a698] mt-0.5">Alternative messaging channel</p>
              </div>
              <span className="text-xs text-[#b0a698] italic">Coming soon</span>
            </div>
          </div>
        </div>
      </section>

      {/* AI Configuration */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-[#7a6e63]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
          <h2 className="text-sm font-semibold text-[#2c2420]">AI Configuration</h2>
        </div>
        <div className="rounded-2xl border border-[#e8e2d9] bg-white divide-y divide-[#f0ebe4]">
          <div className="px-4 py-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm text-[#2c2420] font-medium">Default Autonomy Mode</span>
                <p className="text-xs text-[#b0a698] mt-0.5">Controls how your AI TC handles new transactions</p>
              </div>
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                agent.autonomy_default === 'autonomous'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-blue-50 text-blue-700'
              }`}>
                {agent.autonomy_default === 'autonomous' ? 'Autonomous' : 'Supervised'}
              </span>
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm text-[#2c2420] font-medium">AI Model</span>
                <p className="text-xs text-[#b0a698] mt-0.5">Powers your transaction coordinator</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-[#f5f0ea] px-2.5 py-1 text-xs font-medium text-[#7a6e63]">
                Claude Sonnet 4.6
              </span>
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm text-[#2c2420] font-medium">Schedule</span>
                <p className="text-xs text-[#b0a698] mt-0.5">When your AI TC runs daily checks</p>
              </div>
              <span className="text-xs text-[#7a6e63]">7am, 12pm, 5pm, 9pm</span>
            </div>
          </div>
        </div>
      </section>

      {/* Memories */}
      <MemoriesSection initial={memories ?? []} />

      {/* Privacy & Data */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-[#7a6e63]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
          <h2 className="text-sm font-semibold text-[#2c2420]">Privacy</h2>
        </div>
        <div className="rounded-2xl border border-[#e8e2d9] bg-white px-4 py-4">
          <p className="text-sm text-[#7a6e63] leading-relaxed">
            Your transaction data is stored securely in Supabase with row-level security.
            All AI processing happens via your own API keys — no data is shared with third parties
            beyond the AI providers you configure. Email content is never stored permanently.
          </p>
        </div>
      </section>

      {/* Colorado Compliance */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-[#7a6e63]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
          <h2 className="text-sm font-semibold text-[#2c2420]">Colorado Compliance</h2>
        </div>
        <div className="rounded-2xl border border-[#e8e2d9] bg-white divide-y divide-[#f0ebe4]">
          <div className="px-4 py-3 flex justify-between items-center">
            <span className="text-sm text-[#2c2420]">Deadline Calculator</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Active
            </span>
          </div>
          <div className="px-4 py-3 flex justify-between items-center">
            <span className="text-sm text-[#2c2420]">Compliance Engine</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Active
            </span>
          </div>
          <div className="px-4 py-3 flex justify-between items-center">
            <span className="text-sm text-[#2c2420]">Your Castle Compliance Email</span>
            <span className="text-xs text-[#7a6e63] font-mono">documents@yourcastle.org</span>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" /></svg>
          <h2 className="text-sm font-semibold text-red-600">Danger Zone</h2>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50/50 px-4 py-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-[#2c2420] font-medium">Sign Out</span>
              <p className="text-xs text-[#b0a698] mt-0.5">You will need to log in again</p>
            </div>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="inline-flex items-center rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="text-center text-xs text-[#b0a698] pt-4 pb-8">
        <p>Done Deal v0.1.0 — AI Transaction Coordinator</p>
        <p className="mt-1">Built for Your Castle Real Estate</p>
      </div>
    </div>
  )
}
