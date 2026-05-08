'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import AnimatedSection from '@/components/AnimatedSection';

const SAMPLE_QA = [
  { q: 'What deadlines do you track?',  src: '/remi/remi-qa-deadlines.wav' },
  { q: 'How do you draft emails?',      src: '/remi/remi-qa-emails.wav' },
  { q: 'What about HOA documents?',     src: '/remi/remi-qa-hoa.wav' },
];

type State = 'idle' | 'speaking' | 'done';

export default function VoiceDemo() {
  const [state, setState] = useState<State>('idle');
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = (src: string, questionIdx: number | null = null) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const audio = new Audio(src);
    audioRef.current = audio;
    setState('speaking');
    setActiveIdx(questionIdx);
    audio.play();
    audio.onended = () => setState('done');
    audio.onerror = () => setState('done');
  };

  const handleOrbClick = () => {
    if (state === 'speaking') {
      audioRef.current?.pause();
      audioRef.current = null;
      setState('idle');
      setActiveIdx(null);
    } else {
      play('/remi/remi-intro.wav', null);
    }
  };

  const isSpeaking = state === 'speaking';

  return (
    <section className="parallax-bg py-6 bg-gradient-to-br from-[#00BEFF]/10 via-black to-[#8b5cf6]/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          {/* Section header */}
          <div className="text-center mb-8">
            <span className="text-[#00BEFF] font-semibold uppercase tracking-wider text-sm">
              HEAR IT IN ACTION
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-3">
              Meet Reme.
            </h2>
            <p className="text-xl text-gray-400">
              Your AI transaction coordinator. Click the orb to hear her introduce herself.
            </p>
          </div>

          {/* Side-by-side: photo left, orb right */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-12">

            {/* Reme headshot — left */}
            <div
              className="relative rounded-2xl overflow-hidden shrink-0"
              style={{
                width: 220,
                height: 280,
                boxShadow: '0 0 40px rgba(0,190,255,0.25), 0 0 80px rgba(0,190,255,0.08)',
                border: '1px solid rgba(0,190,255,0.3)',
              }}
            >
              <Image
                src="/remi/remi-final.png"
                alt="Reme — Done Deal AI Transaction Coordinator"
                fill
                className="object-cover object-top"
                priority
              />
            </div>

            {/* Orb — right */}
            <div className="flex flex-col items-center gap-6">
              <div className="relative flex items-center justify-center" style={{ width: 176, height: 176 }}>
                {/* Pulse rings */}
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: 176,
                      height: 176,
                      border: '1px solid rgba(0,190,255,0.35)',
                    }}
                    animate={{
                      scale: isSpeaking ? [1, 1.5 + i * 0.12, 1] : [1, 1.35 + i * 0.1, 1],
                      opacity: [0.45, 0, 0.45],
                    }}
                    transition={{
                      duration: isSpeaking ? 1.2 : 2.5,
                      repeat: Infinity,
                      delay: i * (isSpeaking ? 0.3 : 0.55),
                      ease: 'easeOut',
                    }}
                  />
                ))}

                {/* Glow halo */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: 136,
                    height: 136,
                    background: isSpeaking
                      ? 'radial-gradient(circle, rgba(0,190,255,0.35) 0%, transparent 70%)'
                      : 'radial-gradient(circle, rgba(0,190,255,0.2) 0%, transparent 70%)',
                  }}
                  animate={{ scale: [0.95, 1.06, 0.95] }}
                  transition={{
                    duration: isSpeaking ? 0.9 : 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                {/* Core */}
                <motion.button
                  onClick={handleOrbClick}
                  className="relative rounded-full flex items-center justify-center focus:outline-none cursor-pointer"
                  style={{
                    width: 104,
                    height: 104,
                    background: isSpeaking
                      ? 'radial-gradient(circle at 35% 35%, rgba(0,230,255,1), rgba(0,160,230,0.9))'
                      : 'radial-gradient(circle at 35% 35%, rgba(0,210,255,0.95), rgba(0,140,210,0.85))',
                    boxShadow: isSpeaking
                      ? '0 0 60px rgba(0,190,255,0.85), 0 0 120px rgba(0,190,255,0.35), inset 0 1px 1px rgba(255,255,255,0.5)'
                      : '0 0 40px rgba(0,190,255,0.55), 0 0 80px rgba(0,190,255,0.2), inset 0 1px 1px rgba(255,255,255,0.4)',
                  }}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  aria-label={isSpeaking ? 'Stop Reme' : 'Hear Reme'}
                >
                  {isSpeaking ? (
                    <div className="flex items-center gap-1">
                      {[0, 1, 2, 3, 4].map((bar) => (
                        <motion.div
                          key={bar}
                          className="w-1 rounded-full bg-black/70"
                          animate={{ height: [6, 22, 6] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: bar * 0.1,
                            ease: 'easeInOut',
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                      <rect x="9" y="2" width="6" height="11" rx="3" fill="rgba(0,0,0,0.75)" />
                      <path d="M5 10a7 7 0 0014 0" stroke="rgba(0,0,0,0.75)" strokeWidth="2" strokeLinecap="round" />
                      <line x1="12" y1="17" x2="12" y2="21" stroke="rgba(0,0,0,0.75)" strokeWidth="2" strokeLinecap="round" />
                      <line x1="9" y1="21" x2="15" y2="21" stroke="rgba(0,0,0,0.75)" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Sample questions — shown after intro finishes */}
          <AnimatePresence>
            {state === 'done' && (
              <motion.div
                className="mt-6 flex flex-col sm:flex-row gap-3 justify-center"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                {SAMPLE_QA.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => play(item.src, i)}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-left transition-all"
                    style={{
                      background: activeIdx === i ? 'rgba(0,190,255,0.15)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${activeIdx === i ? 'rgba(0,190,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
                      color: activeIdx === i ? '#00BEFF' : '#9ca3af',
                    }}
                  >
                    {item.q}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </AnimatedSection>
      </div>
    </section>
  );
}
