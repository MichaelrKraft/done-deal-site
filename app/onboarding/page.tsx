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
    <div className="min-h-screen bg-sd-bg flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="font-serif text-2xl text-sd-text">Done Deal</h1>
        <p className="mt-1 text-sm text-sd-text-secondary">Set up your AI transaction coordinator</p>
      </div>
      <OnboardingWizard defaultName={defaultName} />
    </div>
  )
}
