import Image from 'next/image'

const RESOURCE_CATEGORIES = [
  {
    title: 'Contract Advisors',
    description: 'Official guides for Colorado real estate contracts',
    docs: [
      { name: 'CBS 2026 Contract Advisor', file: 'CBS 2026 Contract Advisor Contract to Buy and Sell.pdf', tag: 'Essential' },
      { name: 'ERTB Contract Advisor 2026', file: 'ERTB Contract Advisor 2026Jan.pdf', tag: 'Buyers' },
      { name: 'ERTS Contract Advisor 2026', file: 'ERTS Contract Advisor 2026Jan.pdf', tag: 'Sellers' },
      { name: 'CBS Contract Form (Residential)', file: '-ca2026-contract-to-buy-and-sell-real-estate-residential-.pdf' },
    ],
  },
  {
    title: 'Checklists',
    description: 'Step-by-step transaction checklists',
    docs: [
      { name: '2026 Updated Document Checklist', file: '26-0304 2026 Updated Document Checklist.pdf', tag: 'Essential' },
      { name: 'Document Checklist 2026', file: 'Document Checklist 2026.pdf' },
      { name: 'Steps in Buying Checklist', file: 'Steps in Buying Checklist 2024.pdf', tag: 'Buyers' },
      { name: 'Steps in Selling Checklist', file: 'Steps in Selling Checklist 2024.pdf', tag: 'Sellers' },
    ],
  },
  {
    title: 'Property Advisories',
    description: 'Agent advisories for property-specific issues',
    docs: [
      { name: 'Solar Agent Advisory', file: 'Solar Agent Advisory 2026Feb.pdf', tag: 'Solar' },
      { name: 'SPD Agent Advisory', file: 'SPD Agent Advisory 2026Feb.pdf', tag: 'Disclosure' },
      { name: 'Radon Agent Advisory', file: 'Radon Agent Advisory 2026Feb .pdf', tag: 'Radon' },
      { name: 'Well & Septic Broker Tip', file: 'Broker Tip - Well & Septic  (1) (3) (2).pdf', tag: 'Septic' },
      { name: 'Beginners Guide to Septic Systems', file: 'beginners-guide-to-septic-systems.pdf' },
    ],
  },
  {
    title: 'Special Situations',
    description: 'Guides for short sales, assignments, and compliance',
    docs: [
      { name: 'Short Sale Guide', file: 'Short Sale Guide 12-2024 (2).pdf', tag: 'Short Sale' },
      { name: 'Short Sale Broker Advisory', file: '02-23-2025-short-sale-ba-broker-advisory-guide-to-short-sales (1).pdf' },
      { name: 'Payment to Contractor at Closing', file: '03-18-2025 Broker Advisory-Payment to Contractor at Closing for Work to be Completed After Closing.pdf' },
      { name: 'Assignment & Assumption of Listing', file: 'Assignment & Assumption of Listing Contract with Client Consent _Transfer in.pdf' },
      { name: 'FinCEN OneTrust Title', file: 'finCEN OneTrust Title.pdf', tag: 'Compliance' },
    ],
  },
  {
    title: 'Brokerage Forms',
    description: 'Your Castle Real Estate internal forms',
    docs: [
      { name: 'YCRE W-9 (Locust)', file: '2026 YCRE W-9 - Locust.pdf' },
    ],
  },
]

const TAG_COLORS: Record<string, string> = {
  Essential: 'bg-[#c75c2e] text-white',
  Buyers: 'bg-blue-100 text-blue-700',
  Sellers: 'bg-purple-100 text-purple-700',
  Solar: 'bg-amber-100 text-amber-700',
  Disclosure: 'bg-teal-100 text-teal-700',
  Radon: 'bg-red-100 text-red-700',
  Septic: 'bg-green-100 text-green-700',
  'Short Sale': 'bg-orange-100 text-orange-700',
  Compliance: 'bg-indigo-100 text-indigo-700',
}

export default function ResourcesPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Image src="/done-deal-logo.png" alt="Done Deal" width={48} height={48} />
        <div>
          <h1 className="text-2xl font-serif text-[#2c2420]">Resources</h1>
          <p className="text-sm text-[#7a6e63] mt-1">
            Official Your Castle Real Estate documents, advisories, and checklists
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {RESOURCE_CATEGORIES.map((category) => (
          <section key={category.title}>
            <div className="mb-3">
              <h2 className="text-sm font-semibold text-[#2c2420]">{category.title}</h2>
              <p className="text-xs text-[#b0a698]">{category.description}</p>
            </div>
            <div className="grid gap-2">
              {category.docs.map((doc) => (
                <a
                  key={doc.file}
                  href={`/resources/${encodeURIComponent(doc.file)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border border-[#e8e2d9] bg-white px-4 py-3 transition-colors hover:border-[#c75c2e] hover:bg-[#faf8f5] group"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#c75c2e] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <span className="text-sm text-[#2c2420] group-hover:text-[#c75c2e] transition-colors">
                      {doc.name}
                    </span>
                    {doc.tag && (
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TAG_COLORS[doc.tag] ?? 'bg-[#f5f0ea] text-[#7a6e63]'}`}>
                        {doc.tag}
                      </span>
                    )}
                  </div>
                  <svg className="w-4 h-4 text-[#b0a698] group-hover:text-[#c75c2e] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 rounded-lg bg-[#f5f0ea] border border-[#e8e2d9] px-4 py-3">
        <p className="text-xs text-[#7a6e63]">
          These documents are provided by Your Castle Real Estate and contain official brokerage policies, Colorado-specific contract rules, and compliance requirements. Your AI TC agent has been trained on these documents and follows their guidelines automatically.
        </p>
      </div>
    </div>
  )
}
