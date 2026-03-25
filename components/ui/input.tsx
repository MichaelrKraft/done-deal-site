import * as React from 'react'
import { cn } from '@/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-sd-border bg-white px-3 py-2 text-sm text-sd-text placeholder:text-sd-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c75c2e]/40 focus-visible:border-[#c75c2e] disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
