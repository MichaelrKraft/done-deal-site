'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import AnimatedSection from '@/components/AnimatedSection';

const steps = [
  'The AI reviews and tracks all transaction milestones from contract to close',
  'Instantly updates clients and team members with key deadlines and document requests',
  'Communicates in real time using natural, conversational messaging',
  'Works in the background so you can focus on relationships, not admin',
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-black parallax-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <AnimatedSection>
              <span className="text-[#00BEFF] font-semibold uppercase tracking-wider">
                CONVERT AND SCHEDULE
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
                How it Works
              </h2>
              <p className="text-gray-400 mb-8">
                Say goodbye to manual task management. Done Deal automates the entire
                transaction journey with smart, conversational AI.
              </p>
            </AnimatedSection>

            <ul className="space-y-6 mb-8 relative">
              {/* Animated connecting line */}
              <motion.div
                className="absolute left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#00BEFF] to-[#8b5cf6] origin-top"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />

              {steps.map((step, index) => (
                <AnimatedSection key={index} delay={index * 0.2}>
                  <li className="flex items-start gap-4 relative z-10">
                    <span className="flex-shrink-0 w-8 h-8 bg-[#00BEFF] rounded-full flex items-center justify-center text-black font-bold">
                      {index + 1}
                    </span>
                    <p className="text-gray-300 pt-1">{step}</p>
                  </li>
                </AnimatedSection>
              ))}
            </ul>

            <AnimatedSection delay={0.8}>
              <Link
                href="/contact"
                className="cyan-button inline-block px-8 py-4 rounded-full font-semibold"
              >
                Build my FREE Ai Bot
              </Link>
            </AnimatedSection>
          </div>

          {/* Right Visual */}
          <AnimatedSection direction="right" delay={0.3}>
            <div className="relative">
              <div className="bg-gradient-to-br from-[#00BEFF]/20 to-[#8b5cf6]/20 rounded-2xl p-8">
                <div className="bg-black/50 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-[#00BEFF] text-sm mb-1">Done Deal AI</p>
                      <p className="text-gray-300">
                        Contract received! I&apos;ve scheduled the home inspection for
                        Thursday at 2pm. Should I notify all parties?
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">You</p>
                      <p className="text-gray-300">Yes, please notify everyone.</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-[#00BEFF] text-sm mb-1">Done Deal AI</p>
                      <p className="text-gray-300">
                        Done! I&apos;ve sent notifications to the buyer, seller, and lender.
                        I&apos;ll follow up 24 hours before the inspection.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
