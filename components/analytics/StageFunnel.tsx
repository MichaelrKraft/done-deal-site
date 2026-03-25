'use client'

interface StageData {
  name: string
  count: number
}

interface StageFunnelProps {
  stages: StageData[]
}

const STAGE_LABELS: Record<string, string> = {
  pre_listing: 'Pre-Listing',
  active_listing: 'Active Listing',
  under_contract: 'Under Contract',
  pre_closing: 'Pre-Closing',
  closed: 'Closed',
  archived: 'Archived',
}

const STAGE_COLORS = [
  'bg-[#c5e8ec]',
  'bg-[#a3dbe2]',
  'bg-[#84c9d1]',
  'bg-[#6ab8c1]',
  'bg-[#52a5af]',
  'bg-[#3d8a93]',
]

export function StageFunnel({ stages }: StageFunnelProps) {
  const maxCount = Math.max(...stages.map(s => s.count), 1)

  return (
    <div className="rounded-xl border border-sd-border bg-[#faf8f5] p-5 shadow-sm">
      <h3 className="text-xs font-medium uppercase tracking-wide text-sd-text-muted">
        Transaction Pipeline
      </h3>
      <div className="mt-4 space-y-3">
        {stages.map((stage, i) => {
          const pct = (stage.count / maxCount) * 100
          const label = STAGE_LABELS[stage.name] ?? stage.name
          return (
            <div key={stage.name} className="flex items-center gap-3">
              <span className="w-28 flex-shrink-0 text-right text-sm text-sd-text-secondary">
                {label}
              </span>
              <div className="relative h-7 flex-1 overflow-hidden rounded-md bg-sd-border-subtle">
                <div
                  className={`absolute inset-y-0 left-0 rounded-md transition-all duration-500 ${STAGE_COLORS[i] ?? STAGE_COLORS[0]}`}
                  style={{ width: `${Math.max(pct, stage.count > 0 ? 4 : 0)}%` }}
                />
              </div>
              <span className="w-8 flex-shrink-0 text-right text-sm font-semibold text-[#2c2420]">
                {stage.count}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
