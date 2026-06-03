'use client';

import { motion } from 'framer-motion';
import { IconBarChart, IconTrendingUp, IconCalendar, IconBell, IconLayout, IconCheckCircle } from '@/components/ShimmerIcon';
import { ReactNode } from 'react';

const features: { icon: ReactNode; title: string; description: string }[] = [
  {
    icon: <IconBarChart />,
    title: 'Smart Transaction Tracking',
    description: 'Track every step of the deal automatically with built-in milestone monitoring and alerts.',
  },
  {
    icon: <IconTrendingUp />,
    title: 'Real-Time Reporting & Insights',
    description: 'Stay on top of your pipeline with visual dashboards, automated summaries, and performance metrics.',
  },
  {
    icon: <IconCalendar />,
    title: 'AI-Powered Scheduling',
    description: 'AI schedules inspections, appraisals, and vendor appointments automatically — no back-and-forth emails required.',
  },
  {
    icon: <IconBell />,
    title: 'Automated Follow-Up & Reminders',
    description: 'Keep deals moving forward with 24/7 smart follow-ups for agents, buyers, and lenders.',
  },
  {
    icon: <IconLayout />,
    title: 'Multiple Transactions, One Dashboard',
    description: 'Manage all your deals, clients, and agents from one centralized workspace with ease.',
  },
  {
    icon: <IconCheckCircle />,
    title: 'Automated Compliance Monitoring',
    description: "Compliance checks flag missing documents and regulatory issues automatically — before they become problems.",
  },
];

export default function FeatureCards() {
  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold">
            Why Done-Deal Is the Go-To Solution
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold text-[#00BEFF]">
            for Brokerages and Agents
          </h3>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            Streamline your transaction coordination from contract to close so you can
            focus on selling homes, not managing paperwork.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: index * 0.1, duration: 0.6, ease: 'easeOut' }}
            >
              <motion.div
                whileHover={{ scale: 1.05, rotateY: 3 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="card-glow bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-[#00BEFF]/50 transition-colors"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
