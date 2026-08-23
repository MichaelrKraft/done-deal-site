'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { track } from '@vercel/analytics';
import AnimatedSection from '@/components/AnimatedSection';
import Toast from '@/components/ui/Toast';

const SAMPLE_QA = [
  { q: 'What deadlines do you track?',  src: '/remi/remi-qa-deadlines.wav' },
  { q: 'How do you draft emails?',      src: '/remi/remi-qa-emails.wav' },
  { q: 'What about HOA documents?',     src: '/remi/remi-qa-hoa.wav' },
];

type State = 'idle' | 'speaking' | 'done';

// Mirrors MAX_TEXT_LENGTH in src/app/api/voice-demo/route.ts. Duplicated
// rather than imported because that file is a server-only route module.
const MAX_LIVE_TEXT_LENGTH = 500;

/** Marks a failure that already reached the server and was tracked with a status code, so the catch block doesn't double-count it as a network error. */
class VoiceDemoResponseError extends Error {}

/** 429 covers both the per-minute rate limit and the daily/global usage cap (including the cap check failing closed) — all of these mean "at capacity," not a generic server error. */
const CAPACITY_MESSAGE = "Reme is at capacity right now — please try again in a few minutes.";
const GENERIC_ERROR_MESSAGE = "Reme could not read that back just now. Try again in a moment.";

export default function VoiceDemo() {
  const [state, setState] = useState<State>('idle');
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [liveQuestion, setLiveQuestion] = useState('');
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const liveObjectUrlRef = useRef<string | null>(null);

  const play = (src: string, questionIdx: number | null = null) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const audio = new Audio(src);
    audioRef.current = audio;
    setState('speaking');
    setActiveIdx(questionIdx);
    // play() returns a promise that rejects on autoplay-policy blocks or
    // decode errors — without this catch it surfaces as an unhandled
    // promise rejection in the console. Some environments' play()
    // implementations don't return a promise at all, so guard for that too.
    audio.play()?.catch(() => setState('done'));
    audio.onended = () => setState('done');
    audio.onerror = () => setState('done');
  };

  const askLive = async () => {
    const question = liveQuestion.trim();
    if (!question || liveLoading) return;

    setLiveError(null);
    setLiveLoading(true);
    track('demo_attempted');
    try {
      const res = await fetch('/api/voice-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: question }),
      });

      if (!res.ok) {
        const reason = res.status === 429 || res.status === 503 ? 'rate_limited' : 'server_error';
        track('voice_demo_live_qa_failed', { reason, status: res.status });
        // A 429 means the per-minute rate limit, the daily cap, or the
        // cap-check-itself-unavailable fail-closed path (see
        // src/app/api/voice-demo/route.ts) — all read as "temporarily at
        // capacity" to the visitor, not a broken demo.
        throw new VoiceDemoResponseError(
          res.status === 429 ? CAPACITY_MESSAGE : GENERIC_ERROR_MESSAGE
        );
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      // Revoke the previous preview blob URL before creating a new one so
      // repeated "hear it in Reme's voice" usage doesn't leak memory for
      // the session.
      if (liveObjectUrlRef.current) {
        URL.revokeObjectURL(liveObjectUrlRef.current);
      }
      liveObjectUrlRef.current = url;
      play(url, null);
      track('voice_demo_live_qa_submit');
    } catch (err) {
      // Errors with a status code were already tracked above (rate-limited vs
      // server_error). Anything else here is a network/decode failure that
      // never got a response — track it as its own bucket.
      if (!(err instanceof VoiceDemoResponseError)) {
        track('voice_demo_live_qa_failed', { reason: 'network_error' });
      }
      setLiveError(err instanceof VoiceDemoResponseError ? err.message : GENERIC_ERROR_MESSAGE);
    } finally {
      setLiveLoading(false);
    }
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
    <section className="parallax-bg py-12 bg-gradient-to-br from-[#00BEFF]/10 via-black to-[#8b5cf6]/10">
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

          {/* Type your own text, hear it read back in Reme's voice — a live
              Gemini TTS call, not pre-recorded. This is a voice preview, not
              a Q&A chat: Reme reads back whatever text is typed, she does
              not listen, answer, or reason about it. */}
          <AnimatePresence>
            {state === 'done' && (
              <motion.div
                className="mt-4 max-w-xl mx-auto"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={liveQuestion}
                    onChange={(e) => setLiveQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') askLive();
                    }}
                    placeholder="Type anything to hear it in Reme's voice…"
                    disabled={liveLoading}
                    maxLength={MAX_LIVE_TEXT_LENGTH}
                    className="flex-1 rounded-xl px-4 py-3 text-sm bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00BEFF]/50 disabled:opacity-50"
                  />
                  <button
                    onClick={askLive}
                    disabled={liveLoading || !liveQuestion.trim()}
                    className="rounded-xl px-5 py-3 text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: 'rgba(0,190,255,0.15)',
                      border: '1px solid rgba(0,190,255,0.5)',
                      color: '#00BEFF',
                    }}
                  >
                    {liveLoading ? 'Generating…' : "Hear it in Reme's voice"}
                  </button>
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <p className="text-xs text-gray-500 text-center sm:text-left">
                    The sample clips above always work, even if live text-to-speech is briefly unavailable.
                  </p>
                  <span
                    className={`text-xs shrink-0 tabular-nums ${
                      liveQuestion.length >= MAX_LIVE_TEXT_LENGTH ? 'text-red-400' : 'text-gray-500'
                    }`}
                  >
                    {liveQuestion.length}/{MAX_LIVE_TEXT_LENGTH}
                  </span>
                </div>
                <div className="mt-2">
                  <Toast message={liveError} variant="error" onDismiss={() => setLiveError(null)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </AnimatedSection>
      </div>
    </section>
  );
}
