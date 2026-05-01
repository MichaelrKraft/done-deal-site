'use client';

import AnimatedSection from '@/components/AnimatedSection';
import { motion } from 'framer-motion';

const CHECKLIST_ITEMS = [
  'Review full contract for accuracy & completeness',
  'Send congratulations email to client',
  'Create contact info sheet for all parties',
  'Communicate new contract to lender & title',
  'Track all critical Colorado deadlines (MEC-based)',
  'Track earnest money deposit to title',
  'Confirm title is ordered & obtained',
  'Ensure all disclosures reviewed & signed',
  'Collect & verify HOA / CIC documents',
  'Coordinate due diligence documents with all parties',
  'Coordinate inspection scheduling',
  'Follow up with lender on appraisal status',
  'Coordinate signatures for any amendments',
  'Track & remind all parties of upcoming deadlines',
  'Keep all parties updated throughout the transaction',
  'Ensure contract fully executed — all signatures & initials',
  'Pre-closing file compliance audit',
  'Coordinate final walkthrough scheduling',
  'Send closing information email to client',
  'Provide completed file to agent at closing',
];

export default function TCNotepad() {
  return (
    <section className="parallax-bg py-24 bg-gradient-to-b from-black via-[#00BEFF]/5 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <AnimatedSection className="text-center mb-16">
          <span className="text-[#00BEFF] font-semibold uppercase tracking-wider text-sm">
            THE FULL WORKFLOW
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-4">
            Every step. Handled.
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Your AI transaction coordinator runs the complete TC checklist — from
            contract acceptance through closing — without you lifting a finger.
          </p>
        </AnimatedSection>

        {/* Notepad */}
        <AnimatedSection direction="up" delay={0.2}>
          <div className="relative max-w-xl mx-auto">
            {/* Outer glow */}
            <div
              className="absolute inset-0 rounded-b-sm"
              style={{
                boxShadow: '0 0 60px rgba(0, 190, 255, 0.18), 0 24px 64px rgba(0,0,0,0.7)',
              }}
            />

            {/* Spiral binding holes */}
            <div className="relative flex justify-around px-8 z-20 -mb-1">
              {Array.from({ length: 14 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-5 h-5 rounded-full bg-black border-2 border-[#333] relative"
                  initial={{ opacity: 0, y: -8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.03, duration: 0.3 }}
                  style={{
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8), 0 0 4px rgba(0,190,255,0.2)',
                  }}
                />
              ))}
            </div>

            {/* Paper */}
            <div
              className="relative rounded-b-sm overflow-hidden"
              style={{
                background: '#fffef5',
                backgroundImage: `linear-gradient(transparent 35px, #e8e4d0 35px, #e8e4d0 36px, transparent 36px)`,
                backgroundSize: '100% 36px',
                backgroundPositionY: '44px',
                paddingTop: '44px',
              }}
            >
              {/* Red margin line */}
              <div
                className="absolute top-0 bottom-0 left-14"
                style={{ width: '1.5px', background: '#e8a0a0', opacity: 0.7 }}
              />

              {/* Notepad title */}
              <div className="relative px-16 pb-2 pt-1">
                <div
                  style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: '26px',
                    fontWeight: 600,
                    color: '#2c2420',
                    lineHeight: '36px',
                  }}
                >
                  TC Checklist ✓
                </div>
                <div
                  style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: '15px',
                    color: '#b0a698',
                    lineHeight: '36px',
                  }}
                >
                  Done Deal handles all of this
                </div>
              </div>

              {/* Items — stagger in */}
              <ul className="relative pb-6">
                {CHECKLIST_ITEMS.map((item, i) => (
                  <motion.li
                    key={i}
                    className="flex items-center gap-3 px-5"
                    style={{ minHeight: '36px' }}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ delay: 0.4 + i * 0.04, duration: 0.35, ease: 'easeOut' }}
                  >
                    {/* Left margin spacer */}
                    <div className="w-9 shrink-0" />

                    {/* Hand-drawn checkbox with animated checkmark */}
                    <div className="shrink-0" style={{ width: '18px', height: '18px' }}>
                      <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '18px', height: '18px' }}>
                        {/* Slightly imperfect square */}
                        <path
                          d="M1.5 1.8 C1.4 1.4 16.2 1.2 16.5 1.5 C16.8 1.8 16.6 16.3 16.2 16.5 C15.8 16.7 1.6 16.8 1.4 16.4 C1.2 16 1.6 2.2 1.5 1.8Z"
                          stroke="#8a7d6e"
                          strokeWidth="1"
                          fill="none"
                        />
                        {/* Cyan checkmark matching site accent */}
                        <motion.path
                          d="M3.5 9.5 L7 13 L14.5 5"
                          stroke="#00BEFF"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0 }}
                          whileInView={{ pathLength: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5 + i * 0.04, duration: 0.3, ease: 'easeOut' }}
                        />
                      </svg>
                    </div>

                    {/* Item text */}
                    <span
                      style={{
                        fontFamily: "'Caveat', cursive",
                        fontSize: '18px',
                        color: '#3a2e28',
                        lineHeight: '36px',
                        opacity: 0.88 + (i % 3) * 0.04,
                      }}
                    >
                      {item}
                    </span>
                  </motion.li>
                ))}
              </ul>

              {/* Torn bottom edge */}
              <svg
                viewBox="0 0 600 20"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full"
                preserveAspectRatio="none"
                style={{ display: 'block', height: '18px' }}
              >
                <path
                  d="M0,0 L0,12 Q15,20 30,12 Q45,4 60,14 Q75,22 90,12 Q105,2 120,14 Q135,22 150,10 Q165,0 180,14 Q195,24 210,12 Q225,2 240,14 Q255,22 270,10 Q285,0 300,14 Q315,24 330,12 Q345,2 360,14 Q375,22 390,10 Q405,0 420,14 Q435,24 450,12 Q465,2 480,14 Q495,22 510,10 Q525,0 540,14 Q555,24 570,12 Q585,2 600,12 L600,0 Z"
                  fill="#fffef5"
                />
              </svg>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
