'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { saveAgentInfo, saveTelegramUsername, createFirstTransaction } from '@/lib/actions/onboarding'
import { StepYourInfo, type YourInfoValues } from './StepYourInfo'
import { StepConnectOutlook } from './StepConnectOutlook'
import { StepConnectTelegram } from './StepConnectTelegram'
import { StepFirstTransaction, type FirstTransactionValues } from './StepFirstTransaction'
import { StepDone } from './StepDone'

const TOTAL_STEPS = 5

const STEP_LABELS = [
  'Your info',
  'Connect Outlook',
  'Connect Telegram',
  'First transaction',
  'Done',
]

interface OnboardingWizardProps {
  defaultName: string
}

export function OnboardingWizard({ defaultName }: OnboardingWizardProps) {
  const [step, setStep] = useState(1)
  const [stepError, setStepError] = useState<string | null>(null)
  const router = useRouter()

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100

  async function handleYourInfo(values: YourInfoValues) {
    setStepError(null)
    const result = await saveAgentInfo(values.name, values.brokerageCode)
    if (result.error) {
      setStepError(result.error)
      return
    }
    setStep(2)
  }

  async function handleTelegram(telegramUsername: string | null) {
    if (telegramUsername) {
      await saveTelegramUsername(telegramUsername)
    }
    setStep(4)
  }

  async function handleFirstTransaction(values: FirstTransactionValues) {
    await createFirstTransaction(values.propertyAddress, values.side)
    setStep(5)
  }

  function handleSkipTransaction() {
    setStep(5)
    router.prefetch('/feed')
  }

  return (
    <div className="w-full max-w-lg space-y-6">
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-[#7a6e63]">
          <span>Step {step} of {TOTAL_STEPS}</span>
          <span>{STEP_LABELS[step - 1]}</span>
        </div>
        <Progress value={progress} />
      </div>

      {stepError && (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2">
          <p className="text-sm text-red-600">{stepError}</p>
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          {step === 1 && (
            <StepYourInfo defaultName={defaultName} onNext={handleYourInfo} />
          )}
          {step === 2 && (
            <StepConnectOutlook onNext={() => setStep(3)} onSkip={() => setStep(3)} />
          )}
          {step === 3 && (
            <StepConnectTelegram onNext={handleTelegram} onSkip={() => setStep(4)} />
          )}
          {step === 4 && (
            <StepFirstTransaction onNext={handleFirstTransaction} onSkip={handleSkipTransaction} />
          )}
          {step === 5 && <StepDone />}
        </CardContent>
      </Card>
    </div>
  )
}
