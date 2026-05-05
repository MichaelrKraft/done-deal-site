'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export default function YourCastleSignup() {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [gotFreeDeal, setGotFreeDeal] = useState(false);
  const [spotNumber, setSpotNumber] = useState(0);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();

  useEffect(() => {
    fetch('/api/yourcastle/count')
      .then((r) => r.json())
      .then((d) => setRemaining(d.remaining));

    const interval = setInterval(() => {
      fetch('/api/yourcastle/count')
        .then((r) => r.json())
        .then((d) => setRemaining(d.remaining));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const onSubmit = async (data: FormData) => {
    setServerError('');
    const res = await fetch('/api/yourcastle/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      setServerError(result.error || 'Something went wrong. Please try again.');
      return;
    }

    setGotFreeDeal(result.gotFreeDeal);
    setSpotNumber(result.spotNumber);
    setSubmitted(true);
    setRemaining(result.remaining);
  };

  return (
    <section id="claim" className="py-20 bg-gradient-to-r from-[#00BEFF]/20 via-[#8b5cf6]/20 to-[#00BEFF]/20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">

        {!submitted ? (
          <>
            <div className="text-center mb-10">
              <span className="text-[#00BEFF] font-semibold uppercase tracking-wider text-sm">
                Your Castle Real Estate — Exclusive Offer
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-4">
                Claim Your Free Deal
              </h2>

              {remaining !== null && (
                <div className="inline-flex items-center gap-3 rounded-xl border border-[#00BEFF]/30 bg-[#00BEFF]/10 px-6 py-3 mt-2">
                  <span className="text-3xl font-black text-[#00BEFF]">{remaining}</span>
                  <span className="text-gray-300">free deals remaining — today only</span>
                </div>
              )}

              <p className="text-gray-400 mt-6">
                Sign up below to claim your spot. Done-Deal will coordinate your first transaction completely free. You have 60 days to use it.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    {...register('firstName', { required: 'Required' })}
                    placeholder="First name"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-[#00BEFF]/50 focus:outline-none focus:ring-1 focus:ring-[#00BEFF]/50"
                  />
                  {errors.firstName && <p className="mt-1 text-xs text-red-400">{errors.firstName.message}</p>}
                </div>
                <div>
                  <input
                    {...register('lastName', { required: 'Required' })}
                    placeholder="Last name"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-[#00BEFF]/50 focus:outline-none focus:ring-1 focus:ring-[#00BEFF]/50"
                  />
                  {errors.lastName && <p className="mt-1 text-xs text-red-400">{errors.lastName.message}</p>}
                </div>
              </div>

              <div>
                <input
                  {...register('email', {
                    required: 'Required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                  })}
                  type="email"
                  placeholder="Email address"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-[#00BEFF]/50 focus:outline-none focus:ring-1 focus:ring-[#00BEFF]/50"
                />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
              </div>

              <div>
                <input
                  {...register('phone', { required: 'Required' })}
                  type="tel"
                  placeholder="Phone number"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-[#00BEFF]/50 focus:outline-none focus:ring-1 focus:ring-[#00BEFF]/50"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>}
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-gray-400 text-sm">
                Brokerage: <span className="text-white font-medium">Your Castle Real Estate</span>
              </div>

              {serverError && (
                <p className="text-red-400 text-sm text-center">{serverError}</p>
              )}

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-xl bg-[#00BEFF] py-4 text-black font-bold text-lg hover:bg-[#00a8d9] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Claiming your spot...' : 'Claim My Free Deal →'}
              </motion.button>

              <p className="text-center text-xs text-gray-500">
                60 days to use it · No credit card · Your Castle Real Estate agents only
              </p>
            </form>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="text-6xl">{gotFreeDeal ? '🎉' : '✅'}</div>

            {gotFreeDeal ? (
              <>
                <h2 className="text-4xl font-bold">You&apos;re in! Spot #{spotNumber} claimed.</h2>
                <p className="text-xl text-gray-300">
                  Your first transaction is on us. You have <span className="text-[#00BEFF] font-semibold">60 days</span> to use it.
                </p>
                <p className="text-gray-400">
                  Next: click below to create your Done Deal account. You&apos;ll be asked to connect your Microsoft account — this lets Done Deal read your contracts and send transaction emails on your behalf. It&apos;s safe to approve.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-4xl font-bold">You&apos;re on the list!</h2>
                <p className="text-xl text-gray-300">
                  The 20 free deals went fast — but you&apos;re signed up. We&apos;ll be in touch with a special offer just for Your Castle agents.
                </p>
              </>
            )}

            <a
              href="https://app.done-deal.info/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#00BEFF] text-black font-semibold text-lg hover:bg-[#00a8d9] transition-colors"
            >
              Set Up My Account Now →
            </a>
          </motion.div>
        )}
      </div>
    </section>
  );
}
