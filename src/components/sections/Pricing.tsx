'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const features = [
  'Manage 1 Active Deal with AI Coordination',
  'Talk, Text & Email Features Included in Platform',
  'Automated Task Management',
  'Real-Time Compliance Checks',
  'Client Communication Automation',
  'Proactive Problem Detection',
  'Transaction Insights Dashboard',
];

const planIncludes = [
  'Live Onboarding',
  'Ai Conversational Booking',
  'No Close, No Pay Guarantee',
  '24/7 Support',
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[#00BEFF] font-semibold uppercase tracking-wider">
            PRICING
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            One Simple Plan to Scale
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold text-[#00BEFF]">
            your Business
          </h3>
          <p className="text-gray-400 mt-4">Unlock Your Full Potential</p>
        </div>

        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-md mx-auto"
        >
          <div className="bg-gradient-to-br from-[#00BEFF]/20 to-[#8b5cf6]/20 rounded-2xl p-1">
            <div className="bg-black rounded-2xl p-8">
              <p className="text-[#00BEFF] font-semibold uppercase tracking-wider mb-4">
                AI Transaction Coordination
              </p>

              {/* Price */}
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">$197</span>
                <span className="text-gray-400"> / month</span>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-[#00BEFF] mt-1">✓</span>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="/contact"
                className="w-full cyan-button block text-center px-8 py-4 rounded-full font-semibold text-lg"
              >
                Book a Demo
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Plan Includes */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-8">Plan Includes</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {planIncludes.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 rounded-xl p-4 text-center border border-white/10"
              >
                <div className="text-[#00BEFF] text-2xl mb-2">✓</div>
                <p className="text-gray-300">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
