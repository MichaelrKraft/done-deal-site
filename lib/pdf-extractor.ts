// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PDFParse } = require('pdf-parse') as {
  PDFParse: new (data: Uint8Array) => {
    load(): Promise<void>
    getText(): Promise<{ pages: { text: string }[] }>
    destroy(): void
  }
}

export interface ExtractedContractData {
  property_address?: string
  mec_date?: string
  closing_date?: string
  earnest_money?: number
  sale_price?: number
  buyer_name?: string
  buyer_email?: string
  seller_name?: string
  seller_agent_name?: string
  seller_agent_email?: string
  buyer_agent_name?: string
  buyer_agent_email?: string
  lender_name?: string
  lender_email?: string
  title_company?: string
  title_email?: string
  year_built?: number
  has_hoa?: boolean
  has_solar?: boolean
  solar_type?: 'owned' | 'leased' | 'ppa'
  has_septic?: boolean
  has_well?: boolean
  inspection_deadline?: string
}

const MONTH_MAP: Record<string, string> = {
  january: '01', february: '02', march: '03', april: '04',
  may: '05', june: '06', july: '07', august: '08',
  september: '09', october: '10', november: '11', december: '12',
}

export async function extractContractData(pdfBuffer: Buffer): Promise<ExtractedContractData> {
  const parser = new PDFParse(new Uint8Array(pdfBuffer))
  await parser.load()
  const data = await parser.getText()
  parser.destroy()
  const text = data.pages.map((p) => p.text).join('\n')
  const result: ExtractedContractData = {}

  // Address — CBS uses "Property Address:"
  const addrMatch = text.match(/(?:Property Address|Street Address|Property:)\s*:?\s*([^\n]{10,80})/i)
  if (addrMatch) result.property_address = addrMatch[1].trim()

  // Buyer names — CBS uses "Buyer(s):" with possible middle names and "and" for couples
  const buyerMatch = text.match(/Buyer\(?s?\)?[:\s]+([A-Z][a-zA-Z ]+?)(?:\s+Seller|\s+Property|\n)/m)
  if (buyerMatch) {
    const raw = buyerMatch[1].trim().replace(/\s+and\s+/g, ' & ')
    result.buyer_name = raw
  }

  // Seller names — CBS uses "Seller(s):" — capture names, stop before section keywords
  const sellerMatch = text.match(/Seller\(?s?\)?[:\s]+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*(?:\s+and\s+[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)*)/m)
  if (sellerMatch) {
    let raw = sellerMatch[1].trim()
    // Remove trailing section keywords that may have been captured
    raw = raw.replace(/\s+(?:Property|Address|Buyer|Seller|Contract).*$/i, '')
    result.seller_name = raw.replace(/\s+and\s+/g, ' & ')
  }

  // Dates — support both "MM/DD/YYYY" and "Month DD, YYYY" formats
  const allNumericDates = [...text.matchAll(/(\d{1,2})\/(\d{1,2})\/(\d{4})/g)]
  const allWrittenDates = [...text.matchAll(/(\w+)\s+(\d{1,2}),?\s+(\d{4})/g)]

  // MEC date — CBS uses "Approved Form Date:" or "Date:" near top
  const mecNumeric = text.match(/(?:MEC|Mutual Execution|Contract Date|Date of Contract|Approved Form Date|Date)[:\s]+(\d{1,2})\/(\d{1,2})\/(\d{4})/i)
  const mecWritten = text.match(/(?:MEC|Mutual Execution|Contract Date|Date of Contract|Approved Form Date|Date)[:\s]+(\w+)\s+(\d{1,2}),?\s+(\d{4})/i)
  if (mecNumeric) {
    result.mec_date = `${mecNumeric[3]}-${mecNumeric[1].padStart(2, '0')}-${mecNumeric[2].padStart(2, '0')}`
  } else if (mecWritten && MONTH_MAP[mecWritten[1].toLowerCase()]) {
    result.mec_date = `${mecWritten[3]}-${MONTH_MAP[mecWritten[1].toLowerCase()]}-${mecWritten[2].padStart(2, '0')}`
  }

  // Closing date
  const closeNumeric = text.match(/(?:Closing|Close of Escrow|Closing Date|Settlement Date)[:\s]+(\d{1,2})\/(\d{1,2})\/(\d{4})/i)
  const closeWritten = text.match(/(?:Closing|Close of Escrow|Closing Date|Settlement Date)[:\s]+(\w+)\s+(\d{1,2}),?\s+(\d{4})/i)
  if (closeNumeric) {
    result.closing_date = `${closeNumeric[3]}-${closeNumeric[1].padStart(2, '0')}-${closeNumeric[2].padStart(2, '0')}`
  } else if (closeWritten && MONTH_MAP[closeWritten[1].toLowerCase()]) {
    result.closing_date = `${closeWritten[3]}-${MONTH_MAP[closeWritten[1].toLowerCase()]}-${closeWritten[2].padStart(2, '0')}`
  }

  // If no labeled dates found, try to find dates in the text and use heuristics
  if (!result.mec_date && !result.closing_date) {
    const foundDates: string[] = []
    for (const m of allNumericDates) {
      foundDates.push(`${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`)
    }
    for (const m of allWrittenDates) {
      const monthNum = MONTH_MAP[m[1].toLowerCase()]
      if (monthNum) {
        foundDates.push(`${m[3]}-${monthNum}-${m[2].padStart(2, '0')}`)
      }
    }
    if (foundDates.length >= 2) {
      const sorted = [...new Set(foundDates)].sort()
      result.mec_date = sorted[0]
      result.closing_date = sorted[sorted.length - 1]
    } else if (foundDates.length === 1) {
      result.mec_date = foundDates[0]
    }
  }

  // Inspection deadline
  const inspNumeric = text.match(/(?:Inspection Objection|Inspection Deadline|Inspection Resolution)[:\s]+(\d{1,2})\/(\d{1,2})\/(\d{4})/i)
  const inspWritten = text.match(/(?:Inspection Objection|Inspection Deadline|Inspection Resolution)[:\s]+(\w+)\s+(\d{1,2}),?\s+(\d{4})/i)
  if (inspNumeric) {
    result.inspection_deadline = `${inspNumeric[3]}-${inspNumeric[1].padStart(2, '0')}-${inspNumeric[2].padStart(2, '0')}`
  } else if (inspWritten && MONTH_MAP[inspWritten[1].toLowerCase()]) {
    result.inspection_deadline = `${inspWritten[3]}-${MONTH_MAP[inspWritten[1].toLowerCase()]}-${inspWritten[2].padStart(2, '0')}`
  }

  // Dollar amounts — handle "$589,500" and "589,500" and "589500"
  const priceMatch = text.match(/(?:Purchase Price|Sale Price)[:\s]*\$?\s*([0-9,]+)/i)
  if (priceMatch) result.sale_price = parseInt(priceMatch[1].replace(/,/g, ''))

  const earnestMatch = text.match(/(?:Earnest Money)[:\s]*\$?\s*([0-9,]+)/i)
  if (earnestMatch) result.earnest_money = parseInt(earnestMatch[1].replace(/,/g, ''))

  // Emails
  const emails = [...text.matchAll(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g)].map(m => m[1])
  if (emails.length > 0) result.buyer_agent_email = emails[0]
  if (emails.length > 1) result.seller_agent_email = emails[1]

  // Title company — stop at common delimiters
  const titleMatch = text.match(/(?:Title Company|Title Insurance|Closing Company)[:\s]+([A-Za-z0-9 &'.,-]{5,50})/i)
  if (titleMatch) result.title_company = titleMatch[1].trim().replace(/\s+Closing.*$/, '')

  // Lender — require "Lender:" label specifically (avoid matching "Lender" in generic contract text)
  const lenderMatch = text.match(/(?:^|\n)\s*(?:Lender|Mortgage Company|Loan Company)\s*:\s*([A-Za-z0-9 &'.,-]{5,50})/im)
  if (lenderMatch) result.lender_name = lenderMatch[1].trim()

  // Property characteristics
  result.has_hoa = /\b(?:HOA|home.?owner.?association|CIC|common interest)\b/i.test(text)
  result.has_solar = /\b(?:solar|photovoltaic|PV system)\b/i.test(text)
  result.has_septic = /\b(?:septic|ISDS|individual sewage)\b/i.test(text)
  result.has_well = /\b(?:well water|private well|water well)\b/i.test(text)

  if (result.has_solar) {
    if (/\b(?:leased solar|solar lease)\b/i.test(text)) result.solar_type = 'leased'
    else if (/\b(?:PPA|power purchase agreement)\b/i.test(text)) result.solar_type = 'ppa'
    else result.solar_type = 'owned'
  }

  // Year built
  const yearMatch = text.match(/(?:Year Built|Built in)[:\s]+((?:19|20)\d{2})/i)
  if (yearMatch) result.year_built = parseInt(yearMatch[1])

  return result
}
