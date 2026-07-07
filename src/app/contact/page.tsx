'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { track } from '@vercel/analytics';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Toast from '@/components/ui/Toast';

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setIsSubmitted(true);
      reset();
      track('contact_form_submit');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Book Your <span className="text-[#00BEFF]">Free Demo</span>
            </h1>
            <p className="text-xl text-gray-400">
              Ready to transform your transaction coordination? Let&apos;s talk.
            </p>
          </div>

          {/* Form */}
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
            {isSubmitted ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4"><svg className="w-16 h-16 shimmer-icon" viewBox="0 0 24 24" fill="none" stroke="#00BEFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg></div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Thanks for reaching out!
                </h2>
                <p className="text-gray-400 mb-6">
                  We&apos;ll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="cyan-button px-6 py-3 rounded-full font-semibold"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-white mb-2" htmlFor="name">
                      Full Name *
                    </label>
                    <input
                      {...register('name', { required: 'Name is required' })}
                      type="text"
                      id="name"
                      className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white focus:border-[#00BEFF] focus:outline-none transition-colors"
                      placeholder="John Doe"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-white mb-2" htmlFor="email">
                      Email Address *
                    </label>
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white focus:border-[#00BEFF] focus:outline-none transition-colors"
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-white mb-2" htmlFor="phone">
                      Phone Number
                    </label>
                    <input
                      {...register('phone')}
                      type="tel"
                      id="phone"
                      className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white focus:border-[#00BEFF] focus:outline-none transition-colors"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-white mb-2" htmlFor="company">
                      Company / Brokerage
                    </label>
                    <input
                      {...register('company')}
                      type="text"
                      id="company"
                      className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white focus:border-[#00BEFF] focus:outline-none transition-colors"
                      placeholder="Your Company Name"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-white mb-2" htmlFor="message">
                    Message *
                  </label>
                  <textarea
                    {...register('message', { required: 'Message is required' })}
                    id="message"
                    rows={5}
                    className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white focus:border-[#00BEFF] focus:outline-none transition-colors resize-none"
                    placeholder="Tell us about your needs..."
                  />
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                  )}
                </div>

                {/* Error */}
                <Toast message={error} variant="error" onDismiss={() => setError(null)} />

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full cyan-button py-4 rounded-full font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Book My Demo'}
                </button>
              </form>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <p className="text-gray-400 mb-4">Or reach out directly:</p>
            <div className="flex flex-wrap justify-center gap-8">
              <div>
                <p className="text-[#00BEFF] font-semibold">Email</p>
                <p className="text-gray-300">support@done-deal.ai</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
