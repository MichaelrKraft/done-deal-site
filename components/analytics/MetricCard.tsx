import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: { value: string; positive: boolean }
  icon?: LucideIcon
}

export function MetricCard({ title, value, subtitle, trend, icon: Icon }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-sd-border bg-[#faf8f5] p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-sd-text-muted">
            {title}
          </p>
          <p className="mt-1.5 text-3xl font-semibold text-[#2c2420]">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-sd-text-secondary">{subtitle}</p>
          )}
          {trend && (
            <p
              className={`mt-1 text-sm font-medium ${
                trend.positive ? 'text-emerald-600' : 'text-red-500'
              }`}
            >
              {trend.positive ? '+' : ''}{trend.value}
            </p>
          )}
        </div>
        {Icon && (
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[rgba(132,201,209,0.12)]">
            <Icon size={20} className="text-[#84c9d1]" />
          </div>
        )}
      </div>
    </div>
  )
}
