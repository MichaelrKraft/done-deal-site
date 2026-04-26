'use client';

import { motion } from 'framer-motion';
import AnimatedSection from '@/components/AnimatedSection';
import { IconDollarCross, IconAlertTriangle, IconClock } from '@/components/ShimmerIcon';
import { ReactNode } from 'react';

const problems: { title: string; description: string; icon: ReactNode }[] = [
  {
    title: 'Too Expensive',
    description: "Most live TC's charge over $400 per transaction",
    icon: <IconDollarCross />,
  },
  {
    title: 'Human Error',
    description: 'Managing Transactions can be a nightmare as you scale. The busier you get the more chance for errors..',
    icon: <IconAlertTriangle />,
  },
  {
    title: 'Wasted Time',
    description: 'Taking care of busy paperwork is not your best use of time.',
    icon: <IconClock />,
  },
];

export default function Problem() {
  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection className="text-center mb-16">
          <span className="text-red-500 font-semibold uppercase tracking-wider">
            THE PROBLEM
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            The old way of processing
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold text-red-500">
            a deal is dying...
          </h3>
          <p className="text-gray-400 mt-4">Here&apos;s why:</p>
        </AnimatedSection>

        {/* Problem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <AnimatedSection key={index} delay={index * 0.15}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="bg-gradient-to-br from-red-500/10 to-transparent rounded-2xl p-8 border border-red-500/20 text-center"
              >
                <div className="flex justify-center mb-4">{problem.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-4">{problem.title}</h3>
                <p className="text-gray-400">{problem.description}</p>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
