'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import AnimatedSection from '@/components/AnimatedSection';

const annualFeatures = [
  'Unlimited AI Transaction Coordination',
  'Automated Deadline Tracking & Alerts',
  'Email Drafting & Follow-Up Automation',
  'Real-Time Compliance Monitoring',
  'Multi-Transaction Dashboard',
  'Vendor Scheduling & Calendar Sync',
  'Document Management & Scanning',
];

const paygoFeatures = [
  'Full AI Transaction Coordination',
  'All Platform Features Included',
  'No Commitment Required',
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
              Break Even After One Deal.
            </h2>
            <h3 className="text-4xl md:text-5xl font-bold text-[#00BEFF]">
              The Rest Are Nearly Free.
            </h3>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
              Human TCs can charge $400+ per transaction. With Done Deal, your first deal covers the annual cost — every deal after that is just $15.
            </p>
          </div>
        </AnimatedSection>

        {/* Pricing Cards */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 items-start">

          {/* Pay-As-You-Go (smaller, muted) */}
          <AnimatedSection delay={0.3} className="md:col-span-2">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 h-full">
              <p className="text-gray-400 font-semibold uppercase tracking-wider text-sm mb-4">
                Pay-As-You-Go
              </p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$200</span>
                <span className="text-gray-400"> / deal</span>
              </div>

              <p className="text-gray-500 text-sm mb-6">
                No annual commitment. Pay only when you close.
              </p>

              <ul className="space-y-3 mb-8">
                {paygoFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-gray-500 mt-1">&#10003;</span>
                    <span className="text-gray-400 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/contact"
                className="w-full block text-center px-6 py-3 rounded-full font-semibold text-sm border border-white/20 text-gray-300 hover:bg-white/5 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </AnimatedSection>

          {/* Annual Plan (hero, highlighted) */}
          <AnimatedSection delay={0.1} className="md:col-span-3">
            <div className="relative">
              {/* Best Value Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-[#00BEFF] text-black text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full"
                >
                  Best Value
                </motion.span>
              </div>

              <div className="bg-gradient-to-br from-[#00BEFF]/20 to-[#8b5cf6]/20 rounded-2xl p-1 card-glow">
                <div className="bg-black rounded-2xl p-8">
                  <p className="text-[#00BEFF] font-semibold uppercase tracking-wider mb-4">
                    Annual Plan
                  </p>

                  {/* Price */}
                  <div className="mb-2">
                    <span className="text-5xl font-bold text-white">$397</span>
                    <span className="text-gray-400"> / year</span>
                  </div>
                  <div className="mb-6">
                    <span className="text-2xl font-bold text-[#00BEFF]">+ $15</span>
                    <span className="text-gray-400"> per transaction</span>
                  </div>

                  {/* Break-even callout */}
                  <div className="bg-[#00BEFF]/10 border border-[#00BEFF]/30 rounded-lg p-3 mb-6 text-center">
                    <p className="text-[#00BEFF] text-sm font-semibold">
                      10 deals/year = just $55/deal vs $400+ for a human TC
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {annualFeatures.map((feature, index) => (
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
                    href="/contact"
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
        </div>

        {/* Plan Includes */}
        <div className="mt-16">
          <AnimatedSection>
            <h3 className="text-2xl font-bold text-center mb-8">Both Plans Include</h3>
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
