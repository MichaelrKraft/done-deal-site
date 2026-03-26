export type ChecklistSection = 'seller_agency' | 'buyer_agency' | 'under_contract' | 'closing' | 'terminated'

export interface ChecklistItem {
  name: string
  required: boolean // true = Required column, false = If Applicable column
  section: ChecklistSection
  note?: string
}

export const YOUR_CASTLE_DOCUMENT_CHECKLIST: ChecklistItem[] = [
  // ===== SELLER AGENCY DOCUMENTS =====
  // Required
  { name: 'Exclusive Right to Sell Listing Contract', required: true, section: 'seller_agency' },
  { name: 'Consent Addendum ERTSell', required: true, section: 'seller_agency' },
  { name: 'MLS Print-Out Full Agent Report', required: true, section: 'seller_agency' },
  { name: 'Wire Fraud Disclosure', required: true, section: 'seller_agency' },
  { name: 'Comparable Market Analysis', required: true, section: 'seller_agency' },
  { name: 'Property Brochure/Flyer', required: true, section: 'seller_agency', note: 'IF used in Marketing' },
  { name: 'Affiliated Business Arrangement Disclosure - Elevated Risk Advisors', required: true, section: 'seller_agency' },
  // If Applicable
  { name: 'Brokerage Duties Disclosure to Seller (BDD-56)', required: false, section: 'seller_agency', note: 'IF RELO Listing' },
  { name: 'Brokerage Disclosure to Seller Regarding iBuyer Purchase Contracts', required: false, section: 'seller_agency' },
  { name: 'Change of Status Form', required: false, section: 'seller_agency' },
  { name: 'Coming Soon Addendum', required: false, section: 'seller_agency' },
  { name: 'Lead-Based Paint Obligations of Seller', required: false, section: 'seller_agency' },
  { name: 'Letter of Authority (LLC)/Power of Attorney', required: false, section: 'seller_agency' },
  { name: 'Listing Amend/Extend', required: false, section: 'seller_agency' },
  { name: 'RELO Listing Agreement', required: false, section: 'seller_agency' },
  { name: 'Single Buyer Listing Addendum', required: false, section: 'seller_agency' },
  { name: 'Seller Authorization (Short Sale Document)', required: false, section: 'seller_agency' },
  { name: 'Short Sale Addendum to Listing Contract', required: false, section: 'seller_agency' },
  { name: 'Team Members (All Team Members listed in addtl provisions)', required: false, section: 'seller_agency' },
  { name: 'Transaction Coordinator Disclosure', required: false, section: 'seller_agency' },
  { name: 'Trust/Probate - Proof of Authorization to Sign', required: false, section: 'seller_agency' },
  { name: 'PDC (Realist) OR Owner and Encumbrance Report', required: false, section: 'seller_agency', note: 'if off-market property' },

  // ===== BUYER AGENCY DOCUMENTS =====
  // Required
  { name: 'Exclusive Right to Buy Listing Contract', required: true, section: 'buyer_agency' },
  { name: 'Brokerage Relationship Disclosure to Buyer (BD-24)', required: true, section: 'buyer_agency' },
  { name: 'Buyer Risk Disclosure', required: true, section: 'buyer_agency' },
  { name: 'Affiliated Business Arrangement Disclosure - Elevated Risk Advisors', required: true, section: 'buyer_agency' },
  { name: 'Consent Addendum ERTBuy', required: true, section: 'buyer_agency' },
  // If Applicable
  { name: 'Broker Rebate to Buyer', required: false, section: 'buyer_agency' },
  { name: 'Brokerage Disclosure to Seller (FSBO)', required: false, section: 'buyer_agency' },
  { name: 'Brokerage Disclosure Regarding Bridge Solution Providers', required: false, section: 'buyer_agency' },
  { name: 'Change of Status Form', required: false, section: 'buyer_agency' },
  { name: 'Letter of Authority (LLC)/Power of Attorney', required: false, section: 'buyer_agency' },
  { name: 'Listing Amend/Extend', required: false, section: 'buyer_agency' },
  { name: 'Team Members (All Team Members listed in addtl provisions)', required: false, section: 'buyer_agency' },
  { name: 'Transaction Coordinator Disclosure', required: false, section: 'buyer_agency' },
  { name: 'Trust/Probate - Proof of Authorization to Sign', required: false, section: 'buyer_agency' },

  // ===== UNDER CONTRACT DOCUMENTS =====
  // Required
  { name: 'Contract to Buy & Sell OR Builder Purchase Agreement', required: true, section: 'under_contract' },
  { name: 'CREC Receipt for Earnest Money', required: true, section: 'under_contract' },
  { name: 'Inspection Objection OR Buyer Waiver', required: true, section: 'under_contract', note: 'Note stating buyer waived the right to object' },
  { name: 'Inspection Resolution', required: true, section: 'under_contract' },
  { name: 'MLS Print-Out Showing U/C or Pending', required: true, section: 'under_contract' },
  { name: 'Seller Property Disclosure (SOW cannot be HOA)', required: true, section: 'under_contract' },
  { name: 'Square Footage Disclosure', required: true, section: 'under_contract' },
  { name: 'Affiliated Business Arrangement Disclosure - Elevated Risk Advisors countersigned', required: true, section: 'under_contract' },
  { name: 'Transaction Contact Sheet', required: true, section: 'under_contract' },
  // If Applicable
  { name: 'Counter Proposal', required: false, section: 'under_contract' },
  { name: 'Amend/Extend to Contract', required: false, section: 'under_contract' },
  { name: 'Agreement to Revive Contract', required: false, section: 'under_contract' },
  { name: 'Broker Compensation Agreement', required: false, section: 'under_contract', note: 'if 29.3 in the CBS is checked' },
  { name: 'All New Build Addendums, Disclosures and Change Orders', required: false, section: 'under_contract' },
  { name: 'All Relo Disclosures and Addendums', required: false, section: 'under_contract' },
  { name: 'County Health Department Septic Transfer Form', required: false, section: 'under_contract' },
  { name: 'CREC Exchange Addendum (1031 Exchange)', required: false, section: 'under_contract' },
  { name: 'Lead-Based Paint Disclosure (from Seller)', required: false, section: 'under_contract' },
  { name: 'Lender Letter', required: false, section: 'under_contract' },
  { name: 'Licensee Buy-Out Addendum', required: false, section: 'under_contract' },
  { name: 'Letter of Intent (Commercial)', required: false, section: 'under_contract' },
  { name: 'Personal Property Agreement', required: false, section: 'under_contract' },
  { name: 'Post-Closing Occupancy Agreement', required: false, section: 'under_contract' },
  { name: 'Referral Agreement & Referring Company W9', required: false, section: 'under_contract' },
  { name: 'Rental/Occupancy Agreement', required: false, section: 'under_contract', note: 'if Buyer takes possession before closing' },
  { name: 'Seller Warning - Foreclosure Contract', required: false, section: 'under_contract' },
  { name: 'Septic Permit', required: false, section: 'under_contract' },
  { name: 'Short Sale Addendum to Contract to Buy & Sell', required: false, section: 'under_contract' },
  { name: 'Short Sale - Lien Holder Letter', required: false, section: 'under_contract' },
  { name: 'Source of Water Addendum', required: false, section: 'under_contract', note: 'if not complete in SPD' },
  { name: 'Well Permit', required: false, section: 'under_contract', note: 'indicating "how" water can be used' },
  { name: 'Radon Disclosure', required: false, section: 'under_contract', note: 'when SPD is not provided' },

  // ===== CLOSING DOCUMENTS =====
  // Required
  { name: 'Title Company Closing Package (Fully Executed)', required: true, section: 'closing' },
  { name: 'Bill of Sale', required: true, section: 'closing' },
  { name: 'Closing Instructions (signed by Buyer, Seller, Title Representative)', required: true, section: 'closing' },
  { name: 'Settlement Statement Buyer (signed by Broker)', required: true, section: 'closing' },
  { name: 'Settlement Statement Seller (signed by Broker)', required: true, section: 'closing' },
  { name: 'Commission Disbursement Authorization', required: true, section: 'closing' },
  { name: 'MLS Listing History', required: true, section: 'closing', note: 'If you are the Listing Broker' },
  // If Applicable
  { name: 'CREC Bill of Sale for Personal Property Agreement', required: false, section: 'closing' },

  // ===== IF TERMINATED =====
  { name: 'Earnest Money Release', required: true, section: 'terminated' },
  { name: 'Notice to Terminate', required: true, section: 'terminated' },
]

export const SECTION_LABELS: Record<ChecklistSection, string> = {
  seller_agency: 'Seller Agency Documents',
  buyer_agency: 'Buyer Agency Documents',
  under_contract: 'Under Contract Documents',
  closing: 'Closing Documents',
  terminated: 'If Terminated',
}

export const SECTION_COLORS: Record<ChecklistSection, string> = {
  seller_agency: 'bg-purple-100 text-purple-800',
  buyer_agency: 'bg-purple-100 text-purple-800',
  under_contract: 'bg-purple-100 text-purple-800',
  closing: 'bg-purple-100 text-purple-800',
  terminated: 'bg-red-100 text-red-800',
}

/** Compliance rules for document submission */
export const DOCUMENT_COMPLIANCE_RULES = {
  submission_deadline_business_days: 5,
  late_fee_initial: 50,
  late_fee_daily: 10,
  submission_email: 'documents@yourcastle.org',
  note: 'All executed contracts must be turned in within 5 business days of execution. $50 Late Fee and Additional $10/day until contract is received.',
}

/** Get checklist items relevant to a transaction based on side (buyer/seller) */
export function getChecklistForTransaction(side: 'buyer' | 'seller'): ChecklistItem[] {
  const agencySection = side === 'seller' ? 'seller_agency' : 'buyer_agency'
  return YOUR_CASTLE_DOCUMENT_CHECKLIST.filter(
    (item) => item.section === agencySection || item.section === 'under_contract' || item.section === 'closing'
  )
}
