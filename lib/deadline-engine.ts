// Colorado CBS deadline calculator
// All dates are YYYY-MM-DD ISO strings
// Business days: skip Saturday and Sunday only (Colorado does not skip federal holidays)

export interface DeadlineInput {
  mecDate: string
  closingDate: string
  options?: {
    hasHoa?: boolean
    yearBuilt?: number
    isBackup?: boolean
    tfcDate?: string // Time From Contract date for backup offers
  }
}

export interface CalculatedDeadline {
  name: string
  due_date: string       // YYYY-MM-DD
  calculated_from: 'mec' | 'closing' | 'tfc'
  days_offset: number    // positive = after anchor, negative = before anchor
  is_business_days: boolean
  risk_level: 'low' | 'medium' | 'high'
  notes?: string
}

// Parse a YYYY-MM-DD string into a local Date object (no timezone shift)
function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// Format a Date back to YYYY-MM-DD
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Add N calendar days to a date
function addCalendarDays(dateStr: string, days: number): string {
  const date = parseDate(dateStr)
  date.setDate(date.getDate() + days)
  return formatDate(date)
}

// Add N business days (skip Saturday=6, Sunday=0) to a date
function addBusinessDays(dateStr: string, days: number): string {
  const date = parseDate(dateStr)
  let remaining = Math.abs(days)
  const direction = days >= 0 ? 1 : -1

  while (remaining > 0) {
    date.setDate(date.getDate() + direction)
    const dow = date.getDay()
    // 0 = Sunday, 6 = Saturday
    if (dow !== 0 && dow !== 6) {
      remaining--
    }
  }

  return formatDate(date)
}

export function calculateDeadlines(
  mecDate: string,
  closingDate: string,
  options: DeadlineInput['options'] = {}
): CalculatedDeadline[] {
  const parsedMec = parseDate(mecDate)
  const parsedClosing = parseDate(closingDate)

  if (isNaN(parsedMec.getTime())) {
    throw new Error(`Invalid mecDate: "${mecDate}"`)
  }
  if (isNaN(parsedClosing.getTime())) {
    throw new Error(`Invalid closingDate: "${closingDate}"`)
  }
  if (parsedClosing < parsedMec) {
    throw new Error('closingDate must be on or after mecDate')
  }

  const { hasHoa = false, yearBuilt, isBackup = false, tfcDate } = options

  // Backup offers: use tfcDate as the anchor instead of mecDate when provided
  const anchorDate = isBackup && tfcDate ? tfcDate : mecDate
  const anchorSource: 'mec' | 'tfc' = isBackup && tfcDate ? 'tfc' : 'mec'

  const deadlines: CalculatedDeadline[] = []

  // ----------------------------------------------------------------
  // Calendar day deadlines (from MEC / TFC anchor)
  // ----------------------------------------------------------------

  deadlines.push({
    name: 'Earnest Money Delivery',
    due_date: addCalendarDays(anchorDate, 3),
    calculated_from: anchorSource,
    days_offset: 3,
    is_business_days: false,
    risk_level: 'medium',
  })

  deadlines.push({
    name: 'New Loan Application',
    due_date: addCalendarDays(anchorDate, 3),
    calculated_from: anchorSource,
    days_offset: 3,
    is_business_days: false,
    risk_level: 'low',
  })

  if (hasHoa) {
    deadlines.push({
      name: 'CIC (HOA) Documents',
      due_date: addCalendarDays(anchorDate, 7),
      calculated_from: anchorSource,
      days_offset: 7,
      is_business_days: false,
      risk_level: 'medium',
      notes: 'Required because property has HOA',
    })
  }

  deadlines.push({
    name: 'Inspection Objection',
    due_date: addCalendarDays(anchorDate, 10),
    calculated_from: anchorSource,
    days_offset: 10,
    is_business_days: false,
    risk_level: 'high',
  })

  deadlines.push({
    name: 'Inspection Resolution',
    due_date: addCalendarDays(anchorDate, 13),
    calculated_from: anchorSource,
    days_offset: 13,
    is_business_days: false,
    risk_level: 'low',
    notes: '3 days after Inspection Objection deadline',
  })

  deadlines.push({
    name: 'Appraisal Deadline',
    due_date: addCalendarDays(anchorDate, 21),
    calculated_from: anchorSource,
    days_offset: 21,
    is_business_days: false,
    risk_level: 'medium',
  })

  deadlines.push({
    name: 'Loan Termination',
    due_date: addCalendarDays(anchorDate, 21),
    calculated_from: anchorSource,
    days_offset: 21,
    is_business_days: false,
    risk_level: 'medium',
  })

  // ----------------------------------------------------------------
  // Business day deadlines (from MEC / TFC anchor)
  // ----------------------------------------------------------------

  deadlines.push({
    name: 'SPD (Seller\'s Property Disclosure)',
    due_date: addBusinessDays(anchorDate, 5),
    calculated_from: anchorSource,
    days_offset: 5,
    is_business_days: true,
    risk_level: 'low',
  })

  if (typeof yearBuilt === 'number' && yearBuilt < 1978) {
    deadlines.push({
      name: 'Lead Paint Disclosure',
      due_date: addBusinessDays(anchorDate, 5),
      calculated_from: anchorSource,
      days_offset: 5,
      is_business_days: true,
      risk_level: 'medium',
      notes: `Required because property was built in ${yearBuilt} (pre-1978)`,
    })
  }

  // ----------------------------------------------------------------
  // Pre-close deadlines (back-calculated from closingDate)
  // ----------------------------------------------------------------

  deadlines.push({
    name: 'Mail-out Notice to Title',
    due_date: addCalendarDays(closingDate, -14),
    calculated_from: 'closing',
    days_offset: -14,
    is_business_days: false,
    risk_level: 'low',
  })

  deadlines.push({
    name: 'CDA (Commission Disbursement Auth)',
    due_date: addCalendarDays(closingDate, -5),
    calculated_from: 'closing',
    days_offset: -5,
    is_business_days: false,
    risk_level: 'high',
  })

  deadlines.push({
    name: 'Wire Fraud Warning to Buyer',
    due_date: addCalendarDays(closingDate, -5),
    calculated_from: 'closing',
    days_offset: -5,
    is_business_days: false,
    risk_level: 'high',
  })

  deadlines.push({
    name: 'Final Docs Verified',
    due_date: addCalendarDays(closingDate, -3),
    calculated_from: 'closing',
    days_offset: -3,
    is_business_days: false,
    risk_level: 'low',
  })

  deadlines.push({
    name: 'Final Walkthrough',
    due_date: addCalendarDays(closingDate, -1),
    calculated_from: 'closing',
    days_offset: -1,
    is_business_days: false,
    risk_level: 'low',
  })

  deadlines.push({
    name: 'Confirm Closing Time',
    due_date: addCalendarDays(closingDate, -1),
    calculated_from: 'closing',
    days_offset: -1,
    is_business_days: false,
    risk_level: 'low',
  })

  // ----------------------------------------------------------------
  // Post-close deadlines (from closingDate)
  // ----------------------------------------------------------------

  deadlines.push({
    name: 'Update MLS/CTM to Sold',
    due_date: addCalendarDays(closingDate, 1),
    calculated_from: 'closing',
    days_offset: 1,
    is_business_days: false,
    risk_level: 'low',
  })

  deadlines.push({
    name: 'Docs to documents@yourcastle.org (post-close)',
    due_date: addCalendarDays(closingDate, 1),
    calculated_from: 'closing',
    days_offset: 1,
    is_business_days: false,
    risk_level: 'high',
    notes: 'Send all closing documents to documents@yourcastle.org',
  })

  // ----------------------------------------------------------------
  // YC Compliance — business days from MEC anchor
  // ----------------------------------------------------------------

  deadlines.push({
    name: 'Executed Contracts to documents@yourcastle.org',
    due_date: addBusinessDays(anchorDate, 5),
    calculated_from: anchorSource,
    days_offset: 5,
    is_business_days: true,
    risk_level: 'high',
    notes: 'YC compliance: send to documents@yourcastle.org',
  })

  deadlines.push({
    name: 'YC Transaction Contact Sheet',
    due_date: addBusinessDays(anchorDate, 5),
    calculated_from: anchorSource,
    days_offset: 5,
    is_business_days: true,
    risk_level: 'high',
    notes: 'YC compliance: submit transaction contact sheet',
  })

  return deadlines
}
