'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { TransactionSide } from '@/types/database'

const transactionSchema = z.object({
  propertyAddress: z.string().min(5, 'Enter a full property address'),
})

type TransactionFormValues = z.infer<typeof transactionSchema>

export interface FirstTransactionValues {
  propertyAddress: string
  side: TransactionSide
}

interface StepFirstTransactionProps {
  onNext: (values: FirstTransactionValues) => void
  onSkip: () => void
}

export function StepFirstTransaction({ onNext, onSkip }: StepFirstTransactionProps) {
  const [side, setSide] = useState<TransactionSide>('buyer')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
  })

  function onSubmit(values: TransactionFormValues) {
    onNext({ propertyAddress: values.propertyAddress, side })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Create your first transaction</h2>
        <p className="mt-1 text-sm text-gray-400">
          Add a property to get started. You can always add more from your dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="propertyAddress">Property address</Label>
          <Input
            id="propertyAddress"
            type="text"
            placeholder="123 Main St, Denver, CO 80202"
            {...register('propertyAddress')}
          />
          {errors.propertyAddress && (
            <p className="text-xs text-red-400">{errors.propertyAddress.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Transaction side</Label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSide('buyer')}
              className={cn(
                'flex-1 rounded-md border py-2 text-sm font-medium transition-colors',
                side === 'buyer'
                  ? 'border-blue-600 bg-blue-600/20 text-blue-300'
                  : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
              )}
            >
              Buyer
            </button>
            <button
              type="button"
              onClick={() => setSide('seller')}
              className={cn(
                'flex-1 rounded-md border py-2 text-sm font-medium transition-colors',
                side === 'seller'
                  ? 'border-blue-600 bg-blue-600/20 text-blue-300'
                  : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
              )}
            >
              Seller
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          Create transaction
        </Button>
      </form>

      <Button type="button" variant="ghost" className="w-full" onClick={onSkip}>
        I&apos;ll add my first transaction later
      </Button>
    </div>
  )
}
