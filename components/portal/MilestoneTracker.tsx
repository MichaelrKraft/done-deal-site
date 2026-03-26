interface MilestoneTrackerProps {
  currentStage: string
  closingDate?: string | null
}

interface Milestone {
  label: string
  sublabel?: string
}

const MILESTONES: Milestone[] = [
  { label: 'Under Contract' },
  { label: 'Inspection Period' },
  { label: 'Appraisal' },
  { label: 'Clear to Close' },
  { label: 'Closing Day' },
]

// Returns the index of the active (current) step, or -1 if not applicable
function getActiveStep(stage: string): number {
  switch (stage) {
    case 'under_contract':
      return 1 // step 1 complete, step 2 active
    case 'pre_closing':
      return 3 // steps 1-3 complete, step 4 active
    case 'closed':
      return 5 // all complete (past last index)
    default:
      return -1 // not applicable
  }
}

function formatClosingDate(dateStr: string): string {
  const date = new Date(dateStr)
  const month = date.getUTCMonth() + 1
  const day = date.getUTCDate()
  const year = date.getUTCFullYear()
  return `${month}/${day}/${year}`
}

export default function MilestoneTracker({ currentStage, closingDate }: MilestoneTrackerProps) {
  const activeStep = getActiveStep(currentStage)

  // Don't render for pre-contract stages or unknown stages
  if (activeStep === -1) return null

  const isClosed = currentStage === 'closed'

  return (
    <section className="mb-6">
      {isClosed && (
        <p className="text-center text-sm font-medium text-[#84c9d1] mb-4">
          Congratulations! Your transaction has closed.
        </p>
      )}

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-0">
        {MILESTONES.map((milestone, index) => {
          const stepNumber = index // 0-based
          const isCompleted = stepNumber < activeStep
          const isCurrent = stepNumber === activeStep && !isClosed
          const isLast = index === MILESTONES.length - 1

          return (
            <div key={milestone.label} className="flex flex-col sm:flex-row items-center flex-1">
              {/* Step + connector row */}
              <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto flex-1">
                {/* Circle */}
                <div className="flex flex-col items-center">
                  <div className="relative flex items-center justify-center">
                    {/* Pulse ring for current step */}
                    {isCurrent && (
                      <span className="absolute inline-flex h-9 w-9 rounded-full bg-[#84c9d1] opacity-30 animate-pulse" />
                    )}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                        isCompleted || isClosed
                          ? 'bg-[#84c9d1] border-[#84c9d1]'
                          : isCurrent
                          ? 'bg-[#84c9d1] border-[#84c9d1]'
                          : 'bg-white border-[#d4cdc6]'
                      }`}
                    >
                      {isCompleted || isClosed ? (
                        // White checkmark SVG
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : isCurrent ? (
                        // White dot for current
                        <span className="w-2.5 h-2.5 rounded-full bg-white" />
                      ) : null}
                    </div>
                  </div>

                  {/* Label below circle */}
                  <span
                    className={`mt-1.5 text-[10px] text-center leading-tight max-w-[64px] ${
                      isCurrent
                        ? 'text-[#2c2420] font-bold'
                        : isCompleted || isClosed
                        ? 'text-[#7a6e63] font-medium'
                        : 'text-[#b0a698]'
                    }`}
                  >
                    {milestone.label}
                  </span>

                  {/* Closing date under last step */}
                  {isLast && closingDate && (
                    <span className="mt-0.5 text-[9px] text-[#b0a698] text-center">
                      {formatClosingDate(closingDate)}
                    </span>
                  )}
                </div>

                {/* Connector line (not after last step) */}
                {!isLast && (
                  <div
                    className={`hidden sm:block h-0.5 flex-1 mx-1 ${
                      isCompleted || isClosed ? 'bg-[#84c9d1]' : 'bg-[#e8e2d9]'
                    }`}
                  />
                )}
              </div>

              {/* Mobile vertical connector */}
              {!isLast && (
                <div
                  className={`sm:hidden w-0.5 h-4 ${
                    isCompleted || isClosed ? 'bg-[#84c9d1]' : 'bg-[#e8e2d9]'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
