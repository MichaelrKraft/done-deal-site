import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Pricing from '@/components/sections/Pricing';
import FAQ from '@/components/sections/FAQ';
import PricingObjections from '@/components/sections/PricingObjections';

export const metadata: Metadata = {
  title: 'Pricing — Done Deal AI Transaction Coordination',
  description:
    'Compare Done Deal pricing plans: pay-per-transaction, Annual Standard, and Annual Unlimited. Half the cost of a human TC, with all of the results.',
};

/**
 * FAQPage JSON-LD sourced from the pricing-specific objections copy rendered by
 * PricingObjections (src/components/sections/PricingObjections.tsx) plus the
 * shared FAQ component also rendered on this page. Keep in sync if that copy changes.
 */
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: "What if I don't close a deal this month?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "That's exactly why the Pay-Per-Transaction plan exists — you only pay $197 when you actually close a deal, with zero monthly commitment. If your volume picks up, switching to an annual plan later takes one conversation, no penalty for switching mid-year.",
      },
    },
    {
      '@type': 'Question',
      name: 'Can I cancel anytime?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Every plan — including both annual tiers — can be cancelled at any time with no cancellation fee. You keep access through the end of your current billing period.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens if I go over my included transactions on Annual Standard?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Annual Standard includes up to 10 transactions per year. If you close more, additional transactions are billed at the Pay-Per-Transaction rate ($197 each) — or you can upgrade to Annual Unlimited at any time and we'll prorate the difference.",
      },
    },
    {
      '@type': 'Question',
      name: 'Is there a contract or long-term commitment?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No multi-year contracts. Annual plans are billed yearly but cancel anytime; Pay-Per-Transaction has no commitment at all. You choose the plan that matches how many deals you actually close.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I switch plans later if my deal volume changes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Absolutely — agents change plans as their pipeline changes all the time. Reach out through your dashboard or to support and we'll move you to the plan that fits, with prorated billing for annual tiers.",
      },
    },
    {
      '@type': 'Question',
      name: 'Is there a free trial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! We offer a 14-day free trial with full access to all features. No credit card required to get started.',
      },
    },
    {
      '@type': 'Question',
      name: 'How is Done Deal different from hiring a human transaction coordinator?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "A human TC costs $300–$500 per transaction, works business hours only, and can only juggle so many files at once. Done Deal's AI works 24/7, never misses a deadline, scales to any volume, and costs a fraction of the price — while still putting you in control of every email and decision that goes out.",
      },
    },
  ],
};

/** Feature comparison rows shown in the plan comparison table on the dedicated pricing page. */
const comparisonRows: Array<{
  feature: string;
  payPerTransaction: boolean | string;
  annualStandard: boolean | string;
  annualUnlimited: boolean | string;
}> = [
  {
    feature: 'AI Transaction Coordination',
    payPerTransaction: true,
    annualStandard: true,
    annualUnlimited: true,
  },
  {
    feature: 'Automated Deadline Tracking & Alerts',
    payPerTransaction: true,
    annualStandard: true,
    annualUnlimited: true,
  },
  {
    feature: 'Email Drafting & Follow-Up Automation',
    payPerTransaction: true,
    annualStandard: true,
    annualUnlimited: true,
  },
  {
    feature: 'Real-Time Compliance Monitoring',
    payPerTransaction: true,
    annualStandard: true,
    annualUnlimited: true,
  },
  {
    feature: 'Document Management & Scanning',
    payPerTransaction: true,
    annualStandard: true,
    annualUnlimited: true,
  },
  {
    feature: 'Transactions Included',
    payPerTransaction: 'Pay per deal',
    annualStandard: 'Up to 10 / year',
    annualUnlimited: 'Unlimited',
  },
  {
    feature: 'Annual Commitment',
    payPerTransaction: false,
    annualStandard: true,
    annualUnlimited: true,
  },
  {
    feature: 'Live Onboarding',
    payPerTransaction: true,
    annualStandard: true,
    annualUnlimited: true,
  },
  {
    feature: '14-Day Free Trial',
    payPerTransaction: true,
    annualStandard: true,
    annualUnlimited: true,
  },
  {
    feature: '24/7 Support',
    payPerTransaction: true,
    annualStandard: true,
    annualUnlimited: true,
  },
];

/**
 * Renders a check or dash mark for a boolean comparison cell, or the raw string value
 * when the row communicates a plan-specific detail (e.g. transaction allowance) instead
 * of a simple yes/no.
 */
function ComparisonCell({ value }: { value: boolean | string }): React.JSX.Element {
  if (typeof value === 'string') {
    return <span className="text-gray-300 text-sm">{value}</span>;
  }
  return value ? (
    <span className="text-[#00BEFF] text-lg" aria-label="Included">
      &#10003;
    </span>
  ) : (
    <span className="text-gray-600 text-lg" aria-label="Not included">
      &#8211;
    </span>
  );
}

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navbar />
      <main className="min-h-screen pt-20 bg-black">
        {/* Reuse the existing Pricing section (tiers, CTAs, plan-includes) */}
        <Pricing />

        {/* Feature comparison table */}
        <section className="py-20 bg-black">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-[#00BEFF] font-semibold uppercase tracking-wider">
                COMPARE PLANS
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mt-4">
                Find the Right Fit
              </h2>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[640px] bg-white/5 rounded-2xl overflow-hidden border border-white/10">
                {/* Header row */}
                <div className="grid grid-cols-4 bg-white/10">
                  <div className="p-4 font-semibold text-white">Feature</div>
                  <div className="p-4 font-semibold text-gray-300 text-center text-sm">
                    Pay-Per-Transaction
                  </div>
                  <div className="p-4 font-semibold text-[#00BEFF] text-center text-sm">
                    Annual Standard
                  </div>
                  <div className="p-4 font-semibold text-[#8b5cf6] text-center text-sm">
                    Annual Unlimited
                  </div>
                </div>

                {/* Rows */}
                {comparisonRows.map((row) => (
                  <div
                    key={row.feature}
                    className="grid grid-cols-4 border-t border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <div className="p-4 text-gray-300 text-sm">{row.feature}</div>
                    <div className="p-4 text-center flex items-center justify-center">
                      <ComparisonCell value={row.payPerTransaction} />
                    </div>
                    <div className="p-4 text-center flex items-center justify-center">
                      <ComparisonCell value={row.annualStandard} />
                    </div>
                    <div className="p-4 text-center flex items-center justify-center">
                      <ComparisonCell value={row.annualUnlimited} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Per-tier CTAs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10 max-w-4xl mx-auto">
              <Link
                href="https://app.done-deal.info/signup"
                className="text-center px-6 py-3 rounded-full font-semibold text-sm border border-white/20 text-gray-300 hover:bg-white/5 transition-colors"
              >
                Start Pay-Per-Transaction
              </Link>
              <Link
                href="https://app.done-deal.info/signup"
                className="text-center cyan-button px-6 py-3 rounded-full font-semibold text-sm"
              >
                Start Annual Standard
              </Link>
              <Link
                href="https://app.done-deal.info/signup"
                className="text-center px-6 py-3 rounded-full font-semibold text-sm border border-[#8b5cf6]/40 text-white hover:bg-[#8b5cf6]/10 transition-colors"
              >
                Start Annual Unlimited
              </Link>
            </div>
          </div>
        </section>

        <PricingObjections />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
