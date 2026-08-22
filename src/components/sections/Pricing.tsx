'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { track } from '@vercel/analytics';
import AnimatedSection from '@/components/AnimatedSection';
import { withUtm } from '@/lib/externalCta';

const sharedFeatures = [
  'AI Transaction Coordination',
  'Automated Deadline Tracking & Alerts',
  'Email Drafting & Follow-Up Automation',
  'Real-Time Compliance Monitoring',
  'Multi-Transaction Dashboard',
  'Vendor Scheduling & Calendar Sync',
  'Document Management & Scanning',
];

const planIncludes = [
  'Live Onboarding',
  '14-Day Free Trial',
  'Cancel Anytime',
  '24/7 Support',
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection>
          <div className="text-center mb-16">
            <span className="text-[#00BEFF] font-semibold uppercase tracking-wider">
              PRICING
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4">
              Half the Cost of a Human TC.
            </h2>
            <h3 className="text-4xl md:text-5xl font-bold text-[#00BEFF]">
              All of the Results.
            </h3>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
              Human TCs charge $400+ per transaction. With Done Deal&apos;s annual plan, your cost drops to just $99/deal.
            </p>
          </div>
        </AnimatedSection>

        {/* Pricing Cards */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

          {/* Pay-Per-Transaction */}
          <AnimatedSection delay={0.3}>
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 h-full">
              <p className="text-gray-400 font-semibold uppercase tracking-wider text-sm mb-4">
                Pay-Per-Transaction
              </p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$197</span>
                <span className="text-gray-400"> / transaction</span>
              </div>

              <p className="text-gray-500 text-sm mb-6">
                No commitment. Pay only when you close a deal.
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-gray-500 mt-1">&#10003;</span>
                  <span className="text-gray-400 text-sm">Full AI Transaction Coordination</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-500 mt-1">&#10003;</span>
                  <span className="text-gray-400 text-sm">All Platform Features Included</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-500 mt-1">&#10003;</span>
                  <span className="text-gray-400 text-sm">No Annual Commitment</span>
                </li>
              </ul>

              <Link
                href={withUtm('https://app.done-deal.info/signup', 'pricing_pay_per_transaction')}
                onClick={() => {
                  track('external_cta_click', { campaign: 'pricing_pay_per_transaction', ctaLabel: 'Get Started' });
                  track('pricing_cta_click', { tier: 'pricing_pay_per_transaction', ctaLabel: 'Get Started' });
                }}
                className="w-full block text-center px-6 py-3 rounded-full font-semibold text-sm border border-white/20 text-gray-300 hover:bg-white/5 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </AnimatedSection>

          {/* Annual Standard (highlighted) */}
          <AnimatedSection delay={0.1}>
            <div className="relative">
              {/* Most Popular Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-[#00BEFF] text-black text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full"
                >
                  Most Popular
                </motion.span>
              </div>

              <div className="bg-gradient-to-br from-[#00BEFF]/20 to-[#8b5cf6]/20 rounded-2xl p-1 card-glow">
                <div className="bg-black rounded-2xl p-8">
                  <p className="text-[#00BEFF] font-semibold uppercase tracking-wider mb-4">
                    Annual Standard
                  </p>

                  {/* Price */}
                  <div className="mb-2">
                    <span className="text-5xl font-bold text-white">$997</span>
                    <span className="text-gray-400"> / year</span>
                  </div>
                  <div className="mb-6">
                    <span className="text-gray-400 text-sm">Up to 10 transactions</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {sharedFeatures.map((feature, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + index * 0.08, duration: 0.4 }}
                        className="flex items-start gap-3"
                      >
                        <span className="text-[#00BEFF] mt-1">&#10003;</span>
                        <span className="text-gray-300">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    href={withUtm('https://app.done-deal.info/signup', 'pricing_annual_standard')}
                    onClick={() => {
                      track('external_cta_click', { campaign: 'pricing_annual_standard', ctaLabel: 'Start Your Free Trial' });
                      track('pricing_cta_click', { tier: 'pricing_annual_standard', ctaLabel: 'Start Your Free Trial' });
                    }}
                    className="w-full cyan-button block text-center px-8 py-4 rounded-full font-semibold text-lg"
                  >
                    Start Your Free Trial
                  </Link>
                  <p className="text-gray-500 text-xs text-center mt-3">
                    14-day free trial. No credit card required.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Annual Unlimited */}
          <AnimatedSection delay={0.2}>
            <div className="relative">
              {/* Best Value Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-[#8b5cf6] text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full"
                >
                  Best Value
                </motion.span>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-[#8b5cf6]/30 h-full">
                <p className="text-[#8b5cf6] font-semibold uppercase tracking-wider text-sm mb-4">
                  Annual Unlimited
                </p>

                <div className="mb-2">
                  <span className="text-4xl font-bold text-white">$2,500</span>
                  <span className="text-gray-400"> / year</span>
                </div>
                <div className="mb-6">
                  <span className="text-gray-400 text-sm">Unlimited transactions</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {sharedFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-[#8b5cf6] mt-1">&#10003;</span>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={withUtm('https://app.done-deal.info/signup', 'pricing_annual_unlimited')}
                  onClick={() => {
                    track('external_cta_click', { campaign: 'pricing_annual_unlimited', ctaLabel: 'Get Started' });
                    track('pricing_cta_click', { tier: 'pricing_annual_unlimited', ctaLabel: 'Get Started' });
                  }}
                  className="w-full block text-center px-6 py-3 rounded-full font-semibold text-sm border border-[#8b5cf6]/40 text-white hover:bg-[#8b5cf6]/10 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Plan Includes */}
        <div className="mt-16">
          <AnimatedSection>
            <h3 className="text-2xl font-bold text-center mb-8">All Plans Include</h3>
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {planIncludes.map((item, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                  <div className="text-[#00BEFF] text-2xl mb-2">&#10003;</div>
                  <p className="text-gray-300">{item}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
