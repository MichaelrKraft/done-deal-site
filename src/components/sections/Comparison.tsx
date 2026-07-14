'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { track } from '@vercel/analytics';
import AnimatedSection from '@/components/AnimatedSection';

const comparisonData = [
  { feature: 'Availability', ai: '24/7', human: 'Business Hours' },
  { feature: 'Cost', ai: 'Starting at $197/deal', human: '$400+ Per Transaction' },
  { feature: 'Response Time', ai: 'Instant', human: 'Varies' },
  { feature: 'Error Rate', ai: 'Consistent AI Logic', human: 'Human Error Risk' },
  { feature: 'Scalability', ai: 'Unlimited Tasks', human: 'Limited Capacity' },
  { feature: 'Setup & Optimization', ai: 'Automated', human: 'Manual Process' },
  { feature: 'Support', ai: '24/7 AI + Resources', human: 'Office Hours' },
  { feature: 'Onboarding Time', ai: 'Instant Activation', human: 'Days to Weeks' },
  { feature: 'Task Tracking', ai: 'Real-Time Dashboard', human: 'Manual Updates' },
  { feature: 'Multi-Client Management', ai: 'Unlimited', human: 'Limited' },
  { feature: 'Data Security', ai: 'Encrypted & Secure', human: 'Depends on Person' },
  { feature: 'Integration with Tools', ai: 'Seamless API Access', human: 'Manual Sync' },
  { feature: 'Follow-up Automation', ai: 'Built-In', human: 'Requires Reminders' },
  { feature: 'Consistency', ai: '100% Process Accuracy', human: 'Varies per TC' },
  { feature: 'Availability During Holidays', ai: 'Always Available', human: 'Unavailable' },
];

export default function Comparison() {
  return (
    <section className="py-20 bg-gradient-to-br from-black via-[#00BEFF]/5 to-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Table */}
        <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10">
          {/* Header */}
          <AnimatedSection>
            <div className="grid grid-cols-3 bg-white/10">
              <div className="p-4 font-semibold text-white">Features</div>
              <div className="p-4 font-semibold text-[#00BEFF] text-center">
                Done Deal (AI TC)
              </div>
              <div className="p-4 font-semibold text-gray-400 text-center">Human TC</div>
            </div>
          </AnimatedSection>

          {/* Rows */}
          {comparisonData.map((row, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.4, ease: 'easeOut' }}
              className="grid grid-cols-3 border-t border-white/5 hover:bg-white/5 transition-colors"
            >
              <div className="p-4 text-gray-300">{row.feature}</div>
              <div className="p-4 text-[#00BEFF] text-center flex items-center justify-center gap-2">
                <span className="text-green-500">✓</span> {row.ai}
              </div>
              <div className="p-4 text-gray-500 text-center flex items-center justify-center gap-2">
                <span className="text-red-500">✗</span> {row.human}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-400 mb-6">Start your free trial now:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="https://app.done-deal.info/signup"
              onClick={() => track('comparison_cta_click_start_trial')}
              className="cyan-button px-8 py-4 rounded-full font-semibold"
            >
              Start 14-day Free Trial →
            </Link>
            <Link
              href="https://app.done-deal.info/signup"
              onClick={() => track('comparison_cta_click_get_started')}
              className="px-8 py-4 rounded-full font-semibold border border-white/20 hover:border-[#00BEFF] transition-colors"
            >
              Get Started →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
