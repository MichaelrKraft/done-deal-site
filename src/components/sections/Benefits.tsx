'use client';

import Link from 'next/link';
import AnimatedSection from '@/components/AnimatedSection';

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
    description: 'Easily scale your business without hiring additional staff. Done Deal grows with you as you take on more deals.',
  },
];

export default function Benefits() {
  return (
    <section className="parallax-bg py-20 bg-gradient-to-br from-black via-[#00BEFF]/5 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection className="text-center mb-16">
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
        </AnimatedSection>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {benefits.map((benefit, index) => (
            <AnimatedSection
              key={index}
              delay={index * 0.12}
              direction={index % 2 === 0 ? 'left' : 'right'}
            >
              <div className="card-glow bg-white/5 rounded-2xl p-8 border border-white/10">
                <h3 className="text-xl font-bold text-[#00BEFF] mb-3">
                  {benefit.title}:
                </h3>
                <p className="text-gray-300">&quot;{benefit.description}&quot;</p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* CTA */}
        <AnimatedSection delay={0.5}>
          <div className="text-center">
            <Link
              href="https://app.done-deal.info/signup"
              className="cyan-button inline-block px-8 py-4 rounded-full font-semibold text-lg"
            >
              Start Free Trial
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
