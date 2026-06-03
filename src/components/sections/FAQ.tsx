'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedSection from '@/components/AnimatedSection';

const faqs = [
  {
    question: 'What is Done Deal?',
    answer: 'Done Deal is an AI-powered transaction coordination platform for real estate professionals. It automates task tracking, deadline management, document collection, and vendor communication so you can close more deals with less stress.',
  },
  {
    question: 'How does the AI transaction coordinator work?',
    answer: 'Our AI TC monitors your active transactions 24/7, automatically tracks deadlines, sends follow-up emails, schedules appointments, and flags compliance issues — all while keeping you in control with an approval-based workflow.',
  },
  {
    question: 'What types of transactions does Done Deal support?',
    answer: 'Done Deal supports buyer-side, seller-side, and dual-agency transactions. Whether it\'s a residential listing, a purchase, or a commercial deal, our system adapts to your workflow.',
  },
  {
    question: 'How long does it take to set up?',
    answer: 'Most agents are up and running within 24 hours. We provide a live onboarding session where we configure your transaction templates, vendor contacts, and notification preferences.',
  },
  {
    question: 'Can I manage multiple transactions at once?',
    answer: 'Absolutely. Done Deal is built for scale — manage dozens of concurrent transactions from a single dashboard with real-time status updates and priority-based task sorting.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes. We use bank-level encryption, secure cloud infrastructure, and strict access controls. Your client data and transaction documents are never shared or used for training.',
  },
  {
    question: 'What integrations are available?',
    answer: 'Done Deal integrates with popular real estate tools including DocuSign, Google Calendar, and email providers. We\'re continuously adding new integrations based on user feedback.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! We offer a 14-day free trial with full access to all features. No credit card required to get started.',
  },
  {
    question: 'How is Done Deal different from hiring a human transaction coordinator?',
    answer: 'A human TC costs $300–$500 per transaction, works business hours only, and can only juggle so many files at once. Done Deal\'s AI works 24/7, never misses a deadline, scales to any volume, and costs a fraction of the price — while still putting you in control of every email and decision that goes out.',
  },
  {
    question: 'What happens if something goes wrong or a deadline is missed?',
    answer: 'Done Deal sends escalating alerts before any deadline becomes critical — you\'ll know days in advance, not hours. If a deadline is breached, the system flags it as high-risk and surfaces it at the top of your dashboard immediately. You\'re never left in the dark.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection>
          <div className="text-center mb-16">
            <span className="text-[#00BEFF] font-semibold uppercase tracking-wider">
              QUERIES
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4">
              Got Questions? We&apos;ve
            </h2>
            <h3 className="text-4xl md:text-5xl font-bold text-[#00BEFF]">
              Got Answers
            </h3>
          </div>
        </AnimatedSection>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
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
              >
                <span className="font-semibold text-white pr-4">{faq.question}</span>
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
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 py-4 text-gray-400 bg-black/50">
                      {faq.answer}
                    </div>
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
