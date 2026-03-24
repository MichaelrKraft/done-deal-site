import type { RiskLevel } from '@/types/database'

// ============================================================
// INPUT / OUTPUT TYPES
// ============================================================

export interface ComplianceInput {
  year_built?: number
  has_hoa?: boolean
  has_solar?: boolean
  solar_type?: 'owned' | 'leased' | 'ppa'
  has_septic?: boolean
  has_well?: boolean
  has_spd?: boolean           // Seller's Property Disclosure provided?
  side: 'buyer' | 'seller'
  is_backup_offer?: boolean
  is_conservatorship?: boolean
  is_co_listing?: boolean
}

export interface ComplianceRequirementDef {
  requirement_type: string
  triggered_by: string
  description: string
  risk_level: RiskLevel
  notes?: string
}

export interface ComplianceTaskDef {
  title: string
  stage: string
  risk_level: RiskLevel
  triggered_by: string
}

export interface ComplianceResult {
  requirements: ComplianceRequirementDef[]
  tasks: ComplianceTaskDef[]
  flags: string[]
}

// ============================================================
// STANDARD TASKS (always generated for all transactions)
// ============================================================

const STANDARD_TASKS: ComplianceTaskDef[] = [
  // Under Contract
  { title: 'Verify earnest money delivered to title', stage: 'under_contract', risk_level: 'medium', triggered_by: 'standard' },
  { title: 'Order title commitment', stage: 'under_contract', risk_level: 'low', triggered_by: 'standard' },
  { title: 'Schedule inspection', stage: 'under_contract', risk_level: 'medium', triggered_by: 'standard' },
  { title: 'Send disclosure package to buyer agent', stage: 'under_contract', risk_level: 'medium', triggered_by: 'standard' },
  { title: 'Submit executed contract to documents@yourcastle.org within 5 BD', stage: 'under_contract', risk_level: 'high', triggered_by: 'standard' },
  { title: 'Submit YC Transaction Contact Sheet within 5 BD', stage: 'under_contract', risk_level: 'medium', triggered_by: 'standard' },
  // Pre-Closing
  { title: 'Coordinate final walkthrough', stage: 'pre_closing', risk_level: 'low', triggered_by: 'standard' },
  { title: 'Draft CDA for agent approval', stage: 'pre_closing', risk_level: 'high', triggered_by: 'standard' },
  { title: 'Draft Wire Fraud Warning email to buyer', stage: 'pre_closing', risk_level: 'high', triggered_by: 'standard' },
  { title: 'Confirm closing time/location with all parties', stage: 'pre_closing', risk_level: 'low', triggered_by: 'standard' },
  { title: 'Verify all docs signed and uploaded', stage: 'pre_closing', risk_level: 'medium', triggered_by: 'standard' },
  { title: 'Alert title: mail-out closing notice', stage: 'pre_closing', risk_level: 'low', triggered_by: 'standard' },
  // Post-Close
  { title: 'Update MLS/CTM to Sold', stage: 'closed', risk_level: 'low', triggered_by: 'standard' },
  { title: 'Email closing docs to documents@yourcastle.org', stage: 'closed', risk_level: 'high', triggered_by: 'standard' },
  { title: 'Schedule 1-week follow-up call', stage: 'closed', risk_level: 'low', triggered_by: 'standard' },
  { title: 'Schedule 1-month follow-up call', stage: 'closed', risk_level: 'low', triggered_by: 'standard' },
]

// ============================================================
// COMPLIANCE ENGINE
// ============================================================

export function checkCompliance(input: ComplianceInput): ComplianceResult {
  const requirements: ComplianceRequirementDef[] = []
  const tasks: ComplianceTaskDef[] = [...STANDARD_TASKS]
  const flags: string[] = []

  // Lead-Based Paint Disclosure — pre-1978
  if (input.year_built !== undefined && input.year_built < 1978) {
    requirements.push({
      requirement_type: 'lead_paint_disclosure',
      triggered_by: 'year_built_pre_1978',
      description: 'Federal law requires Lead-Based Paint Disclosure for homes built before 1978.',
      risk_level: 'medium',
    })
    tasks.push({
      title: 'Obtain signed Lead-Based Paint Disclosure from all parties',
      stage: 'under_contract',
      risk_level: 'medium',
      triggered_by: 'year_built_pre_1978',
    })
  }

  // Radon advisory — no SPD provided (2026 Colorado law)
  if (input.has_spd === false) {
    requirements.push({
      requirement_type: 'radon_advisory',
      triggered_by: 'no_spd_provided',
      description: 'Colorado 2026 law: Radon advisory required in CBS when Seller\'s Property Disclosure is not provided.',
      risk_level: 'high',
    })
    flags.push('No Seller\'s Property Disclosure on file — radon advisory required in CBS per 2026 Colorado law.')
  }

  // Septic system
  if (input.has_septic) {
    requirements.push({
      requirement_type: 'septic_inspection',
      triggered_by: 'has_septic',
      description: 'County-approved septic inspection, pump-out, and county approval required.',
      risk_level: 'medium',
    })
    tasks.push({
      title: 'Order county-approved septic inspection and pump-out',
      stage: 'under_contract',
      risk_level: 'medium',
      triggered_by: 'has_septic',
    })
    tasks.push({
      title: 'Obtain county septic approval documentation',
      stage: 'pre_closing',
      risk_level: 'medium',
      triggered_by: 'has_septic',
    })
  }

  // Well
  if (input.has_well) {
    requirements.push({
      requirement_type: 'well_inspection',
      triggered_by: 'has_well',
      description: 'Bacteriological test and mechanical well inspection required.',
      risk_level: 'medium',
    })
    tasks.push({
      title: 'Order bacteriological water test for well',
      stage: 'under_contract',
      risk_level: 'medium',
      triggered_by: 'has_well',
    })
    tasks.push({
      title: 'Order mechanical well inspection',
      stage: 'under_contract',
      risk_level: 'medium',
      triggered_by: 'has_well',
    })
  }

  // Solar — owned
  if (input.has_solar && input.solar_type === 'owned') {
    requirements.push({
      requirement_type: 'solar_owned_cbs_compliance',
      triggered_by: 'solar_owned',
      description: 'CBS §2.5.1/2.5.5 compliance check required for owned solar system.',
      risk_level: 'medium',
    })
    tasks.push({
      title: 'Verify solar system CBS §2.5.1/2.5.5 compliance (owned)',
      stage: 'under_contract',
      risk_level: 'medium',
      triggered_by: 'solar_owned',
    })
  }

  // Solar — leased
  if (input.has_solar && input.solar_type === 'leased') {
    requirements.push({
      requirement_type: 'solar_lease_assumption',
      triggered_by: 'solar_leased',
      description: 'CBS §2.5.8: Buyer must assume or terminate solar lease. Disclosure and task required.',
      risk_level: 'high',
    })
    tasks.push({
      title: 'Confirm buyer solar lease assumption or termination per CBS §2.5.8',
      stage: 'under_contract',
      risk_level: 'high',
      triggered_by: 'solar_leased',
    })
    flags.push('Property has leased solar — buyer must assume or terminate lease per CBS §2.5.8. High risk.')
  }

  // Solar — PPA
  if (input.has_solar && input.solar_type === 'ppa') {
    requirements.push({
      requirement_type: 'solar_ppa_disclosure',
      triggered_by: 'solar_ppa',
      description: 'CBS §2.5.9: Solar PPA disclosure required and buyer acknowledgment needed.',
      risk_level: 'high',
    })
    tasks.push({
      title: 'Obtain signed Solar PPA disclosure per CBS §2.5.9',
      stage: 'under_contract',
      risk_level: 'high',
      triggered_by: 'solar_ppa',
    })
    flags.push('Property has solar PPA — disclosure and buyer acknowledgment required per CBS §2.5.9. High risk.')
  }

  // HOA / CIC
  if (input.has_hoa) {
    requirements.push({
      requirement_type: 'hoa_cic_documents',
      triggered_by: 'has_hoa',
      description: 'CIC (Common Interest Community) document request required.',
      risk_level: 'medium',
    })
    tasks.push({
      title: 'Request CIC documents from HOA',
      stage: 'under_contract',
      risk_level: 'medium',
      triggered_by: 'has_hoa',
    })
  }

  // Backup offer
  if (input.is_backup_offer) {
    requirements.push({
      requirement_type: 'backup_offer_tfc_dating',
      triggered_by: 'is_backup_offer',
      description: 'TFC dating rules apply — 24-hour notification window to buyer upon primary offer failure.',
      risk_level: 'high',
    })
    flags.push('Backup offer — TFC dating rules apply. 24-hour notification window required. Verify MEC date is not filled in until primary contract fails. High risk.')
  }

  // Conservatorship
  if (input.is_conservatorship) {
    requirements.push({
      requirement_type: 'conservatorship_probate',
      triggered_by: 'is_conservatorship',
      description: 'Conservatorship transaction — Amend/Extend may be needed; probate/Personal Representative approval required.',
      risk_level: 'high',
    })
    flags.push('Conservatorship transaction — court/Personal Representative approval required. Amend/Extend may be needed for timeline delays. High risk.')
  }

  // Co-listing
  if (input.is_co_listing) {
    requirements.push({
      requirement_type: 'co_listing_broker_approval',
      triggered_by: 'is_co_listing',
      description: 'Co-listing requires broker approval and E&O policy coverage verification.',
      risk_level: 'high',
    })
    flags.push('Co-listing transaction — broker approval required and E&O policy must be verified. High risk.')
  }

  return { requirements, tasks, flags }
}
