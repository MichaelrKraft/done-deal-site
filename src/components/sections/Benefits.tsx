'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const benefits = [
  {
    title: 'AI-Powered Efficiency',
    description: 'Our AI agents handle your transactions seamlessly, eliminating human error and delays.',
  },
  {
    title: 'Cost Savings',
    description: 'Enjoy professional transaction coordination at 50% less than traditional services.',
  },
  {
    title: '24/7 Availability',
    description: 'AI agents never sleep—your transactions move forward around the clock.',
  },
  {
    title: 'Scalable Solutions',
    description: 'Easily scale your business without hiring additional staff.',
  },
];

export default function Benefits() {
  return (
    <section className="py-20 bg-gradient-to-br from-black via-[#00BEFF]/5 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[#00BEFF] font-semibold uppercase tracking-wider">
            AI IS BETTER
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            Why Choose Done Deal?
          </h2>
          <p className="text-gray-400 mt-4 max-w-3xl mx-auto">
            Never schedule another inspection or appraisal again. Our AI agents handle
            everything from congratulating the buyer when an offer is accepted, to booking
            important dates, to reminding all parties about dates, to coordinating client
            closing gifts.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 rounded-2xl p-8 border border-white/10"
            >
              <h3 className="text-xl font-bold text-[#00BEFF] mb-3">
                {benefit.title}:
              </h3>
              <p className="text-gray-300">&quot;{benefit.description}&quot;</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/contact"
            className="cyan-button inline-block px-8 py-4 rounded-full font-semibold text-lg"
          >
            Book my Free Demo
          </Link>
        </div>
      </div>
    </section>
  );
}
