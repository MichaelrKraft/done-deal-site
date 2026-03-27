'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import AnimatedSection from '@/components/AnimatedSection';

export default function FinalCTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-[#00BEFF]/20 via-[#8b5cf6]/20 to-[#00BEFF]/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <AnimatedSection>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Book My Free Demo
          </h2>
          <p className="text-xl text-gray-300 mb-4">
            Start exploring Done-Deal and experience
          </p>
          <p className="text-xl text-gray-300 mb-8">
            seamless transaction coordination first-hand.
          </p>

          <motion.div
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="inline-block"
          >
            <Link
              href="/contact"
              className="cyan-button inline-block px-12 py-5 rounded-full font-semibold text-xl"
            >
              Book My Demo
            </Link>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}
