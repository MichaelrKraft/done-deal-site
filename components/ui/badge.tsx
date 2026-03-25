import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[#c75c2e] text-white',
        secondary: 'border-transparent bg-sd-bg-warm text-sd-text-secondary',
        destructive: 'border-transparent bg-red-100 text-red-700',
        outline: 'border-sd-border text-sd-text-secondary',
        success: 'border-transparent bg-green-100 text-green-700',
        warning: 'border-transparent bg-amber-100 text-amber-700',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
