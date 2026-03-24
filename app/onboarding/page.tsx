import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const defaultName = (user.user_metadata?.name as string | undefined) ?? ''

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">Done Deal</h1>
        <p className="mt-1 text-sm text-gray-400">Set up your AI transaction coordinator</p>
      </div>
      <OnboardingWizard defaultName={defaultName} />
    </div>
  )
}
