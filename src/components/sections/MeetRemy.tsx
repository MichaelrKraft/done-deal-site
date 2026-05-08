'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import AnimatedSection from '@/components/AnimatedSection';

type ConvState = 'idle' | 'loading' | 'speaking' | 'listening' | 'processing';
interface Message { role: 'user' | 'assistant'; content: string; }

const GREETING =
  "Hi, I'm Remy — Done Deal's AI transaction coordinator. How can I help you navigate the site?";

const STATUS: Record<ConvState, string> = {
  idle:       'Click the orb to start a conversation',
  loading:    'Connecting to Remy...',
  speaking:   'Remy is speaking...',
  listening:  'Listening — ask anything',
  processing: 'Remy is thinking...',
};

function MicIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="2" width="6" height="11" rx="3" fill="rgba(0,0,0,0.75)" />
      <path d="M5 10a7 7 0 0014 0" stroke="rgba(0,0,0,0.75)" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="17" x2="12" y2="21" stroke="rgba(0,0,0,0.75)" strokeWidth="2" strokeLinecap="round" />
      <line x1="9"  y1="21" x2="15" y2="21" stroke="rgba(0,0,0,0.75)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function MeetRemy() {
  const [convState, setConvState]       = useState<ConvState>('idle');
  const [remyText,  setRemyText]        = useState('');
  const [userTranscript, setUserTranscript] = useState('');

  const activeRef      = useRef(false);
  const historyRef     = useRef<Message[]>([]);
  const transcriptRef  = useRef('');
  const audioRef       = useRef<HTMLAudioElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  function stopAll() {
    activeRef.current = false;
    audioRef.current?.pause();
    audioRef.current = null;
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setConvState('idle');
    setUserTranscript('');
  }

  function playWav(blob: Blob, onEnd: () => void) {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audioRef.current = audio;
    setConvState('speaking');
    audio.play().catch(() => {});
    audio.onended = () => { URL.revokeObjectURL(url); onEnd(); };
    audio.onerror = () => { URL.revokeObjectURL(url); onEnd(); };
  }

  function startListening() {
    if (!activeRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SR) { stopAll(); return; }

    const rec = new SR();
    recognitionRef.current = rec;
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-US';
    transcriptRef.current = '';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const text = Array.from(e.results as ArrayLike<{ [0]: { transcript: string } }>)
        .map((r) => r[0].transcript)
        .join('');
      transcriptRef.current = text;
      setUserTranscript(text);
    };

    rec.onend = () => {
      if (!activeRef.current) return;
      const text = transcriptRef.current.trim();
      if (!text) { setTimeout(startListening, 400); return; }
      sendToRemy(text);
    };

    rec.onerror = () => {
      if (activeRef.current) setTimeout(startListening, 400);
    };

    setConvState('listening');
    setUserTranscript('');
    rec.start();
  }

  async function sendToRemy(userText: string) {
    if (!activeRef.current) return;
    setConvState('processing');
    setUserTranscript('');

    try {
      const res = await fetch('/api/remy-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userText, history: historyRef.current }),
      });

      if (!res.ok || !activeRef.current) { stopAll(); return; }

      const replyText = decodeURIComponent(res.headers.get('X-Remy-Text') ?? '');
      setRemyText(replyText);

      historyRef.current = [
        ...historyRef.current,
        { role: 'user',      content: userText   },
        { role: 'assistant', content: replyText  },
      ];

      const blob = await res.blob();
      playWav(blob, () => { if (activeRef.current) startListening(); });
    } catch {
      if (activeRef.current) startListening();
    }
  }

  async function handleOrbClick() {
    if (convState !== 'idle') { stopAll(); return; }

    activeRef.current = true;
    historyRef.current = [];
    setConvState('loading');
    setRemyText(GREETING);

    try {
      const res = await fetch('/api/voice-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: GREETING }),
      });

      if (!res.ok || !activeRef.current) { setConvState('idle'); return; }

      historyRef.current = [{ role: 'assistant', content: GREETING }];
      const blob = await res.blob();
      playWav(blob, () => { if (activeRef.current) startListening(); });
    } catch {
      setConvState('idle');
    }
  }

  const isSpeaking   = convState === 'speaking';
  const isListening  = convState === 'listening';
  const isProcessing = convState === 'processing';
  const isActive     = convState !== 'idle';

  return (
    <section className="py-16 bg-gradient-to-br from-[#00BEFF]/10 via-black to-[#8b5cf6]/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          {/* Header */}
          <div className="text-center mb-10">
            <span className="text-[#00BEFF] font-semibold uppercase tracking-wider text-sm">
              YOUR AI GUIDE
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-3">
              Meet Remy.
            </h2>
            <p className="text-xl text-gray-400">
              Your AI transaction coordinator. Click the orb to start a conversation.
            </p>
          </div>

          {/* Photo + Orb side-by-side */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-12">

            {/* Remy headshot */}
            <div
              className="relative rounded-2xl overflow-hidden shrink-0"
              style={{
                width: 220,
                height: 280,
                boxShadow: `0 0 ${isActive ? 60 : 40}px rgba(0,190,255,${isActive ? 0.45 : 0.25}), 0 0 80px rgba(0,190,255,0.08)`,
                border: '1px solid rgba(0,190,255,0.3)',
                transition: 'box-shadow 0.5s ease',
              }}
            >
              <Image
                src="/remi/remi-final.png"
                alt="Remy — Done Deal AI Transaction Coordinator"
                fill
                className="object-cover object-top"
                priority
              />
            </div>

            {/* Orb */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative flex items-center justify-center" style={{ width: 176, height: 176 }}>

                {/* Pulse rings */}
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{ width: 176, height: 176, border: '1px solid rgba(0,190,255,0.35)' }}
                    animate={{
                      scale:   isSpeaking ? [1, 1.5 + i * 0.12, 1] : [1, 1.35 + i * 0.1, 1],
                      opacity: [0.45, 0, 0.45],
                    }}
                    transition={{
                      duration: isSpeaking ? 1.2 : 2.5,
                      repeat:   Infinity,
                      delay:    i * (isSpeaking ? 0.3 : 0.55),
                      ease:     'easeOut',
                    }}
                  />
                ))}

                {/* Glow halo */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: 136, height: 136,
                    background: isListening
                      ? 'radial-gradient(circle, rgba(0,255,180,0.3) 0%, transparent 70%)'
                      : isSpeaking
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

                {/* Core button */}
                <motion.button
                  onClick={handleOrbClick}
                  className="relative rounded-full flex items-center justify-center focus:outline-none cursor-pointer"
                  style={{
                    width: 104, height: 104,
                    background: isListening
                      ? 'radial-gradient(circle at 35% 35%, rgba(0,255,180,0.95), rgba(0,200,140,0.85))'
                      : isSpeaking
                        ? 'radial-gradient(circle at 35% 35%, rgba(0,230,255,1), rgba(0,160,230,0.9))'
                        : 'radial-gradient(circle at 35% 35%, rgba(0,210,255,0.95), rgba(0,140,210,0.85))',
                    boxShadow: isActive
                      ? '0 0 60px rgba(0,190,255,0.85), 0 0 120px rgba(0,190,255,0.35), inset 0 1px 1px rgba(255,255,255,0.5)'
                      : '0 0 40px rgba(0,190,255,0.55), 0 0 80px rgba(0,190,255,0.2), inset 0 1px 1px rgba(255,255,255,0.4)',
                  }}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  aria-label={isActive ? 'End conversation' : 'Talk to Remy'}
                >
                  {isSpeaking ? (
                    /* Audio bars while Remy speaks */
                    <div className="flex items-center gap-1">
                      {[0, 1, 2, 3, 4].map((bar) => (
                        <motion.div
                          key={bar}
                          className="w-1 rounded-full bg-black/70"
                          animate={{ height: [6, 22, 6] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: bar * 0.1, ease: 'easeInOut' }}
                        />
                      ))}
                    </div>
                  ) : isListening ? (
                    /* Pulsing mic while listening */
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <MicIcon />
                    </motion.div>
                  ) : isProcessing ? (
                    /* Thinking dots */
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-black/70"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  ) : (
                    /* Idle mic */
                    <MicIcon />
                  )}
                </motion.button>
              </div>

              {/* Status label */}
              <p className="text-sm text-gray-400 text-center">{STATUS[convState]}</p>
            </div>
          </div>

          {/* Conversation transcript */}
          <AnimatePresence>
            {isActive && (remyText || userTranscript) && (
              <motion.div
                className="mt-8 max-w-2xl mx-auto space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {remyText && (
                  <div className="bg-white/5 rounded-2xl p-4 border border-[#00BEFF]/20">
                    <p className="text-xs text-[#00BEFF] font-semibold mb-1 uppercase tracking-wider">Remy</p>
                    <p className="text-white text-sm leading-relaxed">{remyText}</p>
                  </div>
                )}
                {isListening && userTranscript && (
                  <div className="bg-white/3 rounded-2xl p-4 border border-white/5 text-right">
                    <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">You</p>
                    <p className="text-gray-400 text-sm italic">{userTranscript}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </AnimatedSection>
      </div>
    </section>
  );
}
