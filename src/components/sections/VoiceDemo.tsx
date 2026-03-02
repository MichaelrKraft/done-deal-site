'use client';

import { motion } from 'framer-motion';

export default function VoiceDemo() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#00BEFF]/10 via-black to-[#8b5cf6]/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Listen to how our AI Transaction Coordinator sounds.
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            Click the button below and ask your TC Reme what she can do for you.
          </p>

          {/* Voice Demo Widget */}
          <div className="flex justify-center">
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10 inline-block">
              <iframe
                src="https://iframes.ai/o/1745420384435x583264430243184600?color=21a6de&icon=smartphone"
                width="300"
                height="400"
                className="rounded-xl"
                title="AI Voice Demo"
                allow="microphone"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
