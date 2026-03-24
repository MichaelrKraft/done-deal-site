'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const yourInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  brokerageCode: z.string().min(1, 'Brokerage code is required'),
})

export type YourInfoValues = z.infer<typeof yourInfoSchema>

interface StepYourInfoProps {
  defaultName: string
  onNext: (values: YourInfoValues) => void
}

export function StepYourInfo({ defaultName, onNext }: StepYourInfoProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<YourInfoValues>({
    resolver: zodResolver(yourInfoSchema),
    defaultValues: {
      name: defaultName,
      brokerageCode: 'yourcastle',
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Your info</h2>
        <p className="mt-1 text-sm text-gray-400">
          Confirm your name and brokerage. This takes about 30 seconds.
        </p>
      </div>

      <form onSubmit={handleSubmit(onNext)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" type="text" {...register('name')} />
          {errors.name && (
            <p className="text-xs text-red-400">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="brokerageCode">Brokerage code</Label>
          <Input id="brokerageCode" type="text" {...register('brokerageCode')} />
          <p className="text-xs text-gray-500">
            Your Castle Real Estate agents use <span className="text-gray-300">yourcastle</span>
          </p>
          {errors.brokerageCode && (
            <p className="text-xs text-red-400">{errors.brokerageCode.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          Continue
        </Button>
      </form>
    </div>
  )
}
