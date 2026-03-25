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

export async function extractContractData(pdfBuffer: Buffer): Promise<ExtractedContractData> {
  const parser = new PDFParse(new Uint8Array(pdfBuffer))
  await parser.load()
  const data = await parser.getText()
  parser.destroy()
  const text = data.pages.map((p) => p.text).join('\n')
  const result: ExtractedContractData = {}

  // Address patterns
  const addrMatch = text.match(/(?:Property Address|Street Address|Property:)\s*([^\n]{10,80})/i)
  if (addrMatch) result.property_address = addrMatch[1].trim()

  // Date patterns MM/DD/YYYY
  const dates = [...text.matchAll(/(\d{2}\/\d{2}\/\d{4})/g)].map(m => m[1])
  void dates // available for future use

  // MEC date
  const mecMatch = text.match(/(?:MEC|Mutual Execution|Contract Date)[:\s]+(\d{2}\/\d{2}\/\d{4})/i)
  if (mecMatch) result.mec_date = parseDate(mecMatch[1])

  // Closing date
  const closeMatch = text.match(/(?:Closing Date|Close of Escrow)[:\s]+(\d{2}\/\d{2}\/\d{4})/i)
  if (closeMatch) result.closing_date = parseDate(closeMatch[1])

  // Inspection deadline
  const inspMatch = text.match(/(?:Inspection Objection|Inspection Deadline)[:\s]+(\d{2}\/\d{2}\/\d{4})/i)
  if (inspMatch) result.inspection_deadline = parseDate(inspMatch[1])

  // Dollar amounts
  const priceMatch = text.match(/(?:Purchase Price|Sale Price)[:\s$]+([0-9,]+)/i)
  if (priceMatch) result.sale_price = parseInt(priceMatch[1].replace(/,/g, ''))

  const earnestMatch = text.match(/(?:Earnest Money)[:\s$]+([0-9,]+)/i)
  if (earnestMatch) result.earnest_money = parseInt(earnestMatch[1].replace(/,/g, ''))

  // Emails
  const emails = [...text.matchAll(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g)].map(m => m[1])
  if (emails.length > 0) result.buyer_agent_email = emails[0]
  if (emails.length > 1) result.seller_agent_email = emails[1]

  // Names
  const buyerMatch = text.match(/(?:Buyer(?:s)?)[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/m)
  if (buyerMatch) result.buyer_name = buyerMatch[1].trim()

  const sellerMatch = text.match(/(?:Seller(?:s)?)[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/m)
  if (sellerMatch) result.seller_name = sellerMatch[1].trim()

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

function parseDate(mmddyyyy: string): string {
  const [mm, dd, yyyy] = mmddyyyy.split('/')
  return `${yyyy}-${mm}-${dd}`
}
