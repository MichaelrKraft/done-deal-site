'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import DotGrid from '@/components/DotGrid';

const cyclingWords = ['No Missed Deadlines.', 'No Burnout.', 'No Mistakes.', 'No Excuses.', 'No Sick Days.'];

const stagger = {
  headline: 0,
  subtext: 0.15,
  cta: 0.3,
  valueProps: 0.45,
};

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: 'easeOut' as const },
});

export default function Hero() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % cyclingWords.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="min-h-screen flex items-center pt-20 bg-black relative overflow-hidden"
    >
      {/* Interactive dot grid background */}
      <DotGrid color="#29d4ff" dotSize={1.5} spacing={24} glowRadius={150} />
      {/* Gradient overlay on top of dots */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00BEFF]/5 via-transparent to-[#8b5cf6]/5" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="flex justify-center">
          {/* Centered Content */}
          <div className="space-y-8 text-center max-w-3xl">
            <motion.h1
              {...fadeUp(stagger.headline)}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
            >
              Half the Cost of a Human Transaction Coordinator.{' '}
              <span className="block h-[1.2em] mt-2">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentWordIndex}
                    initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -16, filter: 'blur(4px)' }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="text-[#00BEFF] inline-block"
                  >
                    {cyclingWords[currentWordIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.h1>

            <motion.p
              {...fadeUp(stagger.subtext)}
              className="text-xl text-gray-300"
            >
              What&apos;s your hourly rate? Save up to 21 hours per transaction.
              AI TC&apos;s are half the cost of a human TC
            </motion.p>

            <motion.div
              {...fadeUp(stagger.cta)}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Link
                href="/contact"
                className="cyan-button px-8 py-4 rounded-full font-semibold text-lg"
              >
                Book my Demo
              </Link>
            </motion.div>

            {/* Value Props */}
            <motion.div
              {...fadeUp(stagger.valueProps)}
              className="grid grid-cols-2 gap-4 pt-4 max-w-lg mx-auto"
            >
              <div className="flex items-center gap-2 justify-center">
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="#00BEFF" stroke="none"><polygon points="12 2 22 12 12 22 2 12" /></svg>
                <span className="text-gray-300">Up to 14 day free trial</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="#00BEFF" stroke="none"><polygon points="12 2 22 12 12 22 2 12" /></svg>
                <span className="text-gray-300">No hidden fees</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="#00BEFF" stroke="none"><polygon points="12 2 22 12 12 22 2 12" /></svg>
                <span className="text-gray-300">Eliminate busy work</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="#00BEFF" stroke="none"><polygon points="12 2 22 12 12 22 2 12" /></svg>
                <span className="text-gray-300">Scale Your Brokerage Faster</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
