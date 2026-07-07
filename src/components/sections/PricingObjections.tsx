'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedSection from '@/components/AnimatedSection';

/**
 * Objections specific to real estate agents evaluating a variable-volume,
 * subscription-style tool (as opposed to the general product FAQ). Addresses
 * purchase hesitation directly tied to pricing — deal volume, cancellation,
 * and switching plans — to support the monetization funnel on the pricing page.
 */
const objections = [
  {
    question: "What if I don't close a deal this month?",
    answer:
      "That's exactly why the Pay-Per-Transaction plan exists — you only pay $197 when you actually close a deal, with zero monthly commitment. If your volume picks up, switching to an annual plan later takes one conversation, no penalty for switching mid-year.",
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      'Yes. Every plan — including both annual tiers — can be cancelled at any time with no cancellation fee. You keep access through the end of your current billing period.',
  },
  {
    question: 'What happens if I go over my included transactions on Annual Standard?',
    answer:
      "Annual Standard includes up to 10 transactions per year. If you close more, additional transactions are billed at the Pay-Per-Transaction rate ($197 each) — or you can upgrade to Annual Unlimited at any time and we'll prorate the difference.",
  },
  {
    question: 'Is there a contract or long-term commitment?',
    answer:
      'No multi-year contracts. Annual plans are billed yearly but cancel anytime; Pay-Per-Transaction has no commitment at all. You choose the plan that matches how many deals you actually close.',
  },
  {
    question: 'Can I switch plans later if my deal volume changes?',
    answer:
      "Absolutely — agents change plans as their pipeline changes all the time. Reach out through your dashboard or to support and we'll move you to the plan that fits, with prorated billing for annual tiers.",
  },
];

export default function PricingObjections() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-16">
            <span className="text-[#00BEFF] font-semibold uppercase tracking-wider">
              BEFORE YOU DECIDE
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4">
              Common Questions About
            </h2>
            <h3 className="text-4xl md:text-5xl font-bold text-[#00BEFF]">
              Pricing &amp; Commitment
            </h3>
          </div>
        </AnimatedSection>

        <div className="space-y-4">
          {objections.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="border border-white/10 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
                aria-expanded={openIndex === index}
              >
                <span className="font-semibold text-white pr-4">{item.question}</span>
                <motion.span
                  animate={{ rotate: openIndex === index ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-[#00BEFF] text-2xl flex-shrink-0"
                >
                  +
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 py-4 text-gray-400 bg-black/50">{item.answer}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
