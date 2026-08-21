import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import FAQ from '@/components/sections/FAQ';
import ExternalCtaLink from '@/components/ui/ExternalCtaLink';

export const metadata: Metadata = {
  title: 'How It Works — Done Deal AI Transaction Coordination',
  description:
    'What a transaction coordinator does, how Done Deal automates the job with AI, and answers to common questions about getting started.',
  alternates: {
    canonical: '/how-it-works',
  },
  openGraph: {
    title: 'How It Works — Done Deal AI Transaction Coordination',
    description:
      'What a transaction coordinator does, how Done Deal automates the job with AI, and answers to common questions about getting started.',
    url: '/how-it-works',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How It Works — Done Deal AI Transaction Coordination',
    description:
      'What a transaction coordinator does, how Done Deal automates the job with AI.',
  },
};

/**
 * FAQPage JSON-LD sourced from the same question/answer copy rendered by the
 * shared FAQ component on this page (src/components/sections/FAQ.tsx).
 * Keep this list in sync if that copy changes.
 */
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Done Deal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Done Deal is an AI-powered transaction coordination platform for real estate professionals. It automates task tracking, deadline management, document collection, and vendor communication so you can close more deals with less stress.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does the AI transaction coordinator work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our AI TC monitors your active transactions 24/7, automatically tracks deadlines, sends follow-up emails, schedules appointments, and flags compliance issues — all while keeping you in control with an approval-based workflow.',
      },
    },
    {
      '@type': 'Question',
      name: 'What types of transactions does Done Deal support?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Done Deal supports buyer-side, seller-side, and dual-agency transactions. Whether it's a residential listing, a purchase, or a commercial deal, our system adapts to your workflow.",
      },
    },
    {
      '@type': 'Question',
      name: 'How long does it take to set up?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most agents are up and running within 24 hours. We provide a live onboarding session where we configure your transaction templates, vendor contacts, and notification preferences.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I manage multiple transactions at once?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely. Done Deal is built for scale — manage dozens of concurrent transactions from a single dashboard with real-time status updates and priority-based task sorting.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my data secure?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. We use bank-level encryption, secure cloud infrastructure, and strict access controls. Your client data and transaction documents are never shared or used for training.',
      },
    },
    {
      '@type': 'Question',
      name: 'What integrations are available?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Done Deal integrates with popular real estate tools including DocuSign, Google Calendar, and email providers. We're continuously adding new integrations based on user feedback.",
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
    {
      '@type': 'Question',
      name: 'What happens if something goes wrong or a deadline is missed?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Done Deal sends escalating alerts before any deadline becomes critical — you'll know days in advance, not hours. If a deadline is breached, the system flags it as high-risk and surfaces it at the top of your dashboard immediately. You're never left in the dark.",
      },
    },
  ],
};

/** Core responsibilities a human transaction coordinator (TC) typically owns on a deal. */
const tcResponsibilities: string[] = [
  'Tracking every contract deadline and contingency date',
  'Collecting and organizing disclosures, addenda, and signed documents',
  'Following up with lenders, title/escrow, inspectors, and other vendors',
  'Sending status updates to agents and clients',
  'Flagging compliance issues before they become liabilities',
  'Scheduling inspections, appraisals, and closing appointments',
];

/**
 * A concrete example transaction timeline (30-day residential purchase,
 * California-style contingency periods) showing exactly what Done Deal
 * tracks and when it acts — not abstract feature bullets. Day numbers are
 * relative to contract acceptance (Day 0). This is illustrative; actual
 * deadlines are pulled from each contract's real dates and state/local
 * requirements.
 */
const sampleTimeline: Array<{
  day: string;
  label: string;
  detail: string;
  actor: 'reme' | 'agent';
}> = [
  {
    day: 'Day 0',
    label: 'Contract accepted',
    detail:
      'Reme reads the executed contract and builds the full deadline checklist automatically — inspection period, loan contingency, appraisal, disclosures.',
    actor: 'reme',
  },
  {
    day: 'Day 1',
    label: 'Disclosures requested',
    detail:
      'Reme drafts and sends the disclosure request to the seller’s agent and title company. You approve before it goes out.',
    actor: 'reme',
  },
  {
    day: 'Day 3',
    label: 'Inspection scheduled',
    detail:
      'Reme follows up with the buyer’s inspector to confirm a date inside the contingency window and adds it to the shared timeline.',
    actor: 'reme',
  },
  {
    day: 'Day 10',
    label: 'Inspection contingency deadline',
    detail:
      'Escalating alerts start 3 days out. If nothing is logged by Day 9, Reme flags it high-risk at the top of your dashboard.',
    actor: 'reme',
  },
  {
    day: 'Day 17',
    label: 'Loan contingency deadline',
    detail:
      'Reme pings the lender for a status update if the appraisal or underwriting hasn’t cleared with a week left on the clock.',
    actor: 'reme',
  },
  {
    day: 'Day 25',
    label: 'Final walkthrough',
    detail:
      'Reme confirms the walkthrough is booked and reminds both agents 48 hours ahead — you just show up.',
    actor: 'agent',
  },
  {
    day: 'Day 30',
    label: 'Closing',
    detail:
      'Reme verifies all signed docs are in and confirms funding/recording with title before marking the file closed.',
    actor: 'reme',
  },
];

/** Steps in Done Deal's automated workflow, shown as a simple numbered process. */
const automationSteps: Array<{ title: string; description: string }> = [
  {
    title: 'Connect a transaction',
    description:
      'Add a new deal in minutes — Done Deal builds a task and deadline checklist automatically based on the contract type and your state/local requirements.',
  },
  {
    title: 'AI tracks every deadline',
    description:
      'Done Deal monitors contingency dates, inspection windows, and closing deadlines around the clock, sending escalating alerts before anything becomes urgent.',
  },
  {
    title: 'Automated outreach & follow-up',
    description:
      'Draft emails to lenders, title, and vendors go out automatically. You review and approve — nothing is sent without your sign-off.',
  },
  {
    title: 'Real-time compliance monitoring',
    description:
      'Missing signatures, incomplete disclosures, or unusual terms get flagged immediately so issues surface days in advance, not at closing.',
  },
  {
    title: 'One dashboard, every deal',
    description:
      'Track all active transactions — buyer, seller, or dual-agency — from a single view, with priority sorting so you always know what needs attention first.',
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navbar />
      <main className="min-h-screen pt-20 bg-black">
        {/* Header */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimatedSection>
              <span className="text-[#00BEFF] font-semibold uppercase tracking-wider">
                HOW IT WORKS
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mt-4">
                From Contract to Close,
              </h1>
              <h2 className="text-4xl md:text-5xl font-bold text-[#00BEFF]">
                Fully Coordinated.
              </h2>
              <p className="text-xl text-gray-400 mt-6 max-w-2xl mx-auto">
                A look at what a transaction coordinator actually does, and how Done Deal
                automates that work with AI — while keeping you in control of every decision.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* What a TC does */}
        <section className="py-16 bg-white/[0.02]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <h2 className="text-3xl font-bold mb-8 text-center">
                What Does a Transaction Coordinator Do?
              </h2>
              <p className="text-gray-400 mb-8 max-w-2xl mx-auto text-center">
                A transaction coordinator (TC) manages the paperwork, deadlines, and
                communication behind every real estate deal — so agents can focus on
                clients instead of admin work.
              </p>
            </AnimatedSection>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {tcResponsibilities.map((item, index) => (
                <AnimatedSection key={item} delay={index * 0.05}>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 h-full flex items-start gap-3">
                    <span className="text-[#00BEFF] mt-1">&#10003;</span>
                    <span className="text-gray-300 text-sm">{item}</span>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* How Done Deal automates it */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <h2 className="text-3xl font-bold mb-12 text-center">
                How Done Deal Automates the Job
              </h2>
            </AnimatedSection>
            <div className="space-y-6">
              {automationSteps.map((step, index) => (
                <AnimatedSection key={step.title} delay={index * 0.08}>
                  <div className="flex gap-5 bg-white/5 rounded-2xl p-6 border border-white/10">
                    <div
                      className="flex items-center justify-center rounded-full bg-[#00BEFF]/15 text-[#00BEFF] font-bold shrink-0"
                      style={{ width: 40, height: 40 }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                      <p className="text-gray-400 text-sm">{step.description}</p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Concrete example: a real deal timeline, not abstract feature bullets */}
        <section className="py-16 bg-white/[0.02]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="text-center mb-4">
                <span className="text-[#00BEFF] font-semibold uppercase tracking-wider text-sm">
                  A REAL EXAMPLE
                </span>
                <h2 className="text-3xl font-bold mt-3 mb-3">
                  What a 30-Day Deal Looks Like
                </h2>
                <p className="text-gray-400 max-w-xl mx-auto">
                  A typical residential purchase, from accepted contract to closing — this is
                  illustrative; Done Deal builds the real checklist from your contract&apos;s
                  actual dates and your state/local requirements.
                </p>
              </div>
            </AnimatedSection>

            <ol className="relative mt-12 space-y-8 border-l border-white/10 pl-8" aria-label="Sample 30-day transaction timeline">
              {sampleTimeline.map((event, index) => (
                <AnimatedSection key={event.day} delay={index * 0.05}>
                  <li className="relative">
                    <span
                      className="absolute -left-[38px] top-0 flex items-center justify-center rounded-full text-xs font-bold"
                      style={{
                        width: 24,
                        height: 24,
                        background: event.actor === 'reme' ? 'rgba(0,190,255,0.2)' : 'rgba(139,92,246,0.2)',
                        border: `1px solid ${event.actor === 'reme' ? 'rgba(0,190,255,0.5)' : 'rgba(139,92,246,0.5)'}`,
                        color: event.actor === 'reme' ? '#00BEFF' : '#8b5cf6',
                      }}
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="text-xs font-mono uppercase tracking-wider text-gray-500">
                        {event.day}
                      </span>
                      <h3 className="font-semibold text-white">{event.label}</h3>
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{
                          background: event.actor === 'reme' ? 'rgba(0,190,255,0.1)' : 'rgba(139,92,246,0.1)',
                          color: event.actor === 'reme' ? '#00BEFF' : '#8b5cf6',
                        }}
                      >
                        {event.actor === 'reme' ? 'Reme handles it' : 'You show up'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">{event.detail}</p>
                  </li>
                </AnimatedSection>
              ))}
            </ol>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimatedSection>
              <h2 className="text-2xl font-bold mb-4">Ready to see it on your own deals?</h2>
              <p className="text-gray-400 mb-8">
                Start a 14-day free trial — no credit card required.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <ExternalCtaLink
                  href="https://app.done-deal.info/signup"
                  campaign="how_it_works_page"
                  ctaLabel="Start Free Trial"
                  className="cyan-button px-8 py-4 rounded-full font-semibold"
                >
                  Start Free Trial →
                </ExternalCtaLink>
                <Link
                  href="/pricing"
                  className="px-8 py-4 rounded-full font-semibold border border-white/20 hover:border-[#00BEFF] transition-colors"
                >
                  View Pricing
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Reuse existing FAQ content */}
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
