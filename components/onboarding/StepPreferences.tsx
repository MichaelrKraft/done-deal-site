'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Question {
  key: string
  label: string
  options?: string[]
  type: 'pills' | 'text'
}

const QUESTIONS: Question[] = [
  {
    key: 'communication_style',
    label: 'How would you like me to communicate?',
    options: ['Keep it brief', 'Give me the full picture', 'Just tell me what to do'],
    type: 'pills',
  },
  {
    key: 'detail_level',
    label: 'How much detail in my updates?',
    options: ['Just the highlights', 'Full breakdown', 'Only when I need to act'],
    type: 'pills',
  },
  {
    key: 'priority_focus',
    label: "What's your biggest TC headache?",
    options: ['Tracking deadlines', 'Drafting emails', 'Chasing documents', 'Staying compliant'],
    type: 'pills',
  },
  {
    key: 'urgent_handling',
    label: 'When something urgent comes up, how should I handle it?',
    options: ['Message me right away', 'Batch in my morning brief', 'Just show it in the app'],
    type: 'pills',
  },
  {
    key: 'preferred_name',
    label: 'What should I call you?',
    type: 'text',
  },
]

interface StepPreferencesProps {
  defaultName: string
  onNext: (preferences: Record<string, string>) => void
}

export function StepPreferences({ defaultName, onNext }: StepPreferencesProps) {
  const firstName = defaultName.split(' ')[0] || defaultName
  const [answers, setAnswers] = useState<Record<string, string>>({
    preferred_name: firstName,
  })

  function selectOption(key: string, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  function handleContinue() {
    onNext(answers)
  }

  const pillQuestions = QUESTIONS.filter((q) => q.type === 'pills')
  const allPillsAnswered = pillQuestions.every((q) => answers[q.key])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif text-[#2c2420]">
          Personalize your AI TC
        </h2>
        <p className="mt-1 text-sm text-[#7a6e63]">
          Quick preferences so I can work the way you like.
        </p>
      </div>

      <div className="space-y-5">
        {QUESTIONS.map((q) => (
          <div key={q.key} className="space-y-2">
            <p className="text-sm font-medium text-[#2c2420]">{q.label}</p>

            {q.type === 'pills' && q.options && (
              <div className="flex flex-wrap gap-2">
                {q.options.map((option) => {
                  const isSelected = answers[q.key] === option
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => selectOption(q.key, option)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-[#c75c2e] text-white'
                          : 'bg-[#f5f0ea] text-[#7a6e63] hover:bg-[#ece6dd]'
                      }`}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            )}

            {q.type === 'text' && (
              <Input
                value={answers[q.key] ?? ''}
                onChange={(e) => selectOption(q.key, e.target.value)}
                placeholder={firstName}
                className="max-w-xs"
              />
            )}
          </div>
        ))}
      </div>

      <Button
        type="button"
        className="w-full"
        onClick={handleContinue}
        disabled={!allPillsAnswered || !answers.preferred_name?.trim()}
      >
        Continue
      </Button>
    </div>
  )
}
