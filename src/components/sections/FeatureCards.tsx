'use client';

import { motion } from 'framer-motion';

const features = [
  {
    icon: '📊',
    title: 'Smart Transaction Tracking',
    description: 'Track every step of the deal automatically with built-in milestone monitoring and alerts.',
  },
  {
    icon: '📈',
    title: 'Real-Time Reporting & Insights',
    description: 'Stay on top of your pipeline with visual dashboards, automated summaries, and performance metrics.',
  },
  {
    icon: '📅',
    title: 'AI-Powered Appointment Booking',
    description: 'Schedule showings, inspections, and client calls through conversational AI with no links or friction.',
  },
  {
    icon: '🔔',
    title: 'Automated Follow-Up & Reminders',
    description: 'Keep deals moving forward with 24/7 smart follow-ups for agents, buyers, and lenders.',
  },
  {
    icon: '📁',
    title: 'Multiple Transactions, One Dashboard',
    description: 'Manage all your deals, clients, and agents from one centralized workspace with ease.',
  },
  {
    icon: '🌟',
    title: 'Exclusive Inner Circle for Agents',
    description: "Join Done Deal's private real estate mastermind to collaborate, scale, and grow with elite peers.",
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
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-[#00BEFF]/50 transition-all hover:transform hover:scale-105"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
