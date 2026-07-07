import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import FAQ from '@/components/sections/FAQ';

export const metadata: Metadata = {
  title: 'How It Works — Done Deal AI Transaction Coordination',
  description:
    'What a transaction coordinator does, how Done Deal automates the job with AI, and answers to common questions about getting started.',
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

        {/* CTA */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimatedSection>
              <h2 className="text-2xl font-bold mb-4">Ready to see it on your own deals?</h2>
              <p className="text-gray-400 mb-8">
                Start a 14-day free trial — no credit card required.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="https://app.done-deal.info/signup"
                  className="cyan-button px-8 py-4 rounded-full font-semibold"
                >
                  Start Free Trial →
                </Link>
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
