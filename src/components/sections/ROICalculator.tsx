'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedSection from '@/components/AnimatedSection';

const DONE_DEAL_ANNUAL = 397;
const DONE_DEAL_PER_DEAL = 15;
const HUMAN_TC_PER_DEAL = 400;

export default function ROICalculator() {
  const [deals, setDeals] = useState(10);

  const annualDoneDeal = DONE_DEAL_ANNUAL + (deals * DONE_DEAL_PER_DEAL);
  const annualHumanTC = deals * HUMAN_TC_PER_DEAL;
  const costPerDeal = deals > 0 ? Math.round(annualDoneDeal / deals) : 0;
  const savings = annualHumanTC - annualDoneDeal;
  const savingsPercent = annualHumanTC > 0 ? Math.round((savings / annualHumanTC) * 100) : 0;

  return (
    <section className="py-20 bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-12">
          <span className="text-[#00BEFF] font-semibold uppercase tracking-wider">
            ROI CALCULATOR
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            See How Much You&apos;ll Save
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            Drag the slider to see your cost per transaction with Done Deal vs. a human transaction coordinator.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="bg-white/5 rounded-2xl p-8 md:p-12 border border-white/10">
            {/* Slider */}
            <div className="mb-10">
              <label className="block text-gray-300 text-lg mb-4 text-center">
                How many transactions do you close per year?
              </label>
              <div className="flex items-center gap-6">
                <span className="text-gray-500 text-sm w-8">1</span>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={deals}
                  onChange={(e) => setDeals(Number(e.target.value))}
                  className="flex-1 h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#00BEFF]"
                  style={{
                    background: `linear-gradient(to right, #00BEFF 0%, #00BEFF ${(deals / 50) * 100}%, rgba(255,255,255,0.1) ${(deals / 50) * 100}%, rgba(255,255,255,0.1) 100%)`,
                  }}
                />
                <span className="text-gray-500 text-sm w-8">50</span>
              </div>
              <div className="text-center mt-4">
                <span className="text-5xl font-bold text-[#00BEFF]">{deals}</span>
                <span className="text-gray-400 text-lg ml-2">transactions/year</span>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Done Deal Cost Per Deal */}
              <motion.div
                key={`cost-${deals}`}
                initial={{ scale: 0.95, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-br from-[#00BEFF]/10 to-transparent rounded-xl p-6 border border-[#00BEFF]/30 text-center"
              >
                <p className="text-gray-400 text-sm mb-2">Your Cost Per Transaction</p>
                <p className="text-4xl font-bold text-[#00BEFF]">${costPerDeal}</p>
                <p className="text-gray-500 text-xs mt-1">with Done Deal</p>
              </motion.div>

              {/* Human TC Cost Per Deal */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
                <p className="text-gray-400 text-sm mb-2">Human TC Cost Per Transaction</p>
                <p className="text-4xl font-bold text-red-400">${HUMAN_TC_PER_DEAL}</p>
                <p className="text-gray-500 text-xs mt-1">industry average</p>
              </div>

              {/* Annual Savings */}
              <motion.div
                key={`savings-${deals}`}
                initial={{ scale: 0.95, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-br from-green-500/10 to-transparent rounded-xl p-6 border border-green-500/30 text-center"
              >
                <p className="text-gray-400 text-sm mb-2">Your Annual Savings</p>
                <p className="text-4xl font-bold text-green-400">
                  {savings > 0 ? `$${savings.toLocaleString()}` : '$0'}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {savingsPercent > 0 ? `${savingsPercent}% less than a human TC` : 'Do more deals to save more'}
                </p>
              </motion.div>
            </div>

            {/* Bottom comparison bar */}
            <div className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-gray-500 text-xs">Done Deal Annual</p>
                <p className="text-white font-bold">${annualDoneDeal.toLocaleString()}/yr</p>
              </div>
              <div className="text-gray-600 px-4">vs</div>
              <div className="text-center flex-1">
                <p className="text-gray-500 text-xs">Human TC Annual</p>
                <p className="text-red-400 font-bold">${annualHumanTC.toLocaleString()}/yr</p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
