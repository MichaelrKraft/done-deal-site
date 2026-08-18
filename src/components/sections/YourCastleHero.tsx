'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { track } from '@vercel/analytics';
import DotGrid from '@/components/DotGrid';
import { withUtm } from '@/lib/externalCta';

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: 'easeOut' as const },
});

export default function YourCastleHero() {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/yourcastle/count')
      .then((r) => r.json())
      .then((d) => setRemaining(d.remaining))
      .catch(() => setRemaining(null));

    // Poll every 30 seconds
    const interval = setInterval(() => {
      fetch('/api/yourcastle/count')
        .then((r) => r.json())
        .then((d) => setRemaining(d.remaining))
        .catch(() => {});
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="min-h-screen flex items-start bg-black relative overflow-hidden">
      <DotGrid color="#29d4ff" dotSize={1.5} spacing={24} glowRadius={90} glowIntensity={0.35} />
      <div className="absolute inset-0 bg-gradient-to-br from-[#00BEFF]/5 via-transparent to-[#8b5cf6]/5" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 relative z-10 w-full">
        <div className="flex justify-center">
          <div className="space-y-8 text-center max-w-3xl">

            {/* Event badge */}
            <motion.div {...fadeUp(-0.1)} className="flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#00BEFF]/40 bg-[#00BEFF]/10 px-5 py-2 text-sm font-semibold text-[#00BEFF]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                Your Castle Real Estate — Exclusive Agent Offer
              </span>
            </motion.div>

            <motion.h1 {...fadeUp(0)} className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Every deadline. Every document.{' '}
              <span className="text-[#00BEFF]">Every time.</span>
            </motion.h1>

            <motion.p {...fadeUp(0.15)} className="text-xl text-gray-300">
              Done-Deal&apos;s AI handles everything from contract to close — and with Reme, you have full visibility into every deal, 24/7. Your human TC goes dark at 5pm. <span className="text-white font-semibold">Reme never does.</span>
            </motion.p>

            {/* Urgency counter */}
            {remaining !== null && (
              <motion.div {...fadeUp(0.2)} className="flex justify-center">
                <div className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-6 py-3">
                  <span className="text-2xl font-black text-[#00BEFF]">{remaining}</span>
                  <span className="text-gray-300 text-sm">
                    of 20 <span className="font-semibold text-white">FREE deals</span> remaining for today&apos;s event
                  </span>
                </div>
              </motion.div>
            )}

            <motion.div {...fadeUp(0.3)} className="flex flex-wrap items-center gap-4 justify-center">
              <a
                href="#claim"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('claim')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#00BEFF] text-black font-semibold text-lg hover:bg-[#00a8d9] transition-colors"
              >
                Claim My Free Deal
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </a>
              <a
                href={withUtm('https://app.done-deal.info/login', 'hero')}
                onClick={() => track('external_cta_click', { campaign: 'hero', ctaLabel: 'Already have an account?' })}
                className="text-lg font-medium text-white hover:text-[#00BEFF] transition-colors"
              >
                Already have an account?
              </a>
            </motion.div>

            <motion.div {...fadeUp(0.45)} className="grid grid-cols-2 gap-4 pt-4 max-w-lg mx-auto">
              {[
                '16–18 hours saved per transaction',
                '100% deadline accuracy',
                'Colorado compliance built in',
                'Talk to Reme 24/7 — always reachable',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 justify-center">
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="#00BEFF" stroke="none">
                    <polygon points="12 2 22 12 12 22 2 12" />
                  </svg>
                  <span className="text-gray-300">{item}</span>
                </div>
              ))}
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
