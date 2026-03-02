'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const cyclingWords = ['Smart', 'Reliable', 'Fast', 'Efficient', 'Affordable'];

export default function Hero() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % cyclingWords.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="min-h-screen flex items-center pt-20 bg-black relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00BEFF]/5 via-transparent to-[#8b5cf6]/5" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Stop over paying for transaction coordination when you can use Ai that&apos;s{' '}
              <span className="block h-[1.2em] mt-2">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentWordIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="text-[#00BEFF] inline-block"
                  >
                    {cyclingWords[currentWordIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>

            <p className="text-xl text-gray-300">
              What&apos;s your hourly rate? Save up to 21 hours per transaction.
              AI TC&apos;s are half the cost of a human TC
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="cyan-button px-8 py-4 rounded-full font-semibold text-lg"
              >
                Book my Demo
              </Link>
            </div>

            {/* Value Props */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-2">
                <span className="text-[#00BEFF]">💎</span>
                <span className="text-gray-300">Up to 14 day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#00BEFF]">💎</span>
                <span className="text-gray-300">No hidden fees</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#00BEFF]">💎</span>
                <span className="text-gray-300">Eliminate busy work</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#00BEFF]">💎</span>
                <span className="text-gray-300">Scale Your Brokerage Faster</span>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden glow-border">
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Real estate professionals working"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
