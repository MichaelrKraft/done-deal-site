'use client';

import Link from 'next/link';
import { track } from '@vercel/analytics';
import LightRays from '@/components/LightRays/LightRays';
import { withUtm } from '@/lib/externalCta';

export default function CompetitionCallout() {
  return (
    <section className="py-0 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Black box with LightRays behind the text */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: '#000',
            border: '1px solid rgba(0,190,255,0.15)',
            minHeight: 320,
          }}
        >
          {/* LightRays — fills the entire box, z-index 0 */}
          <div className="absolute inset-0" style={{ zIndex: 0 }}>
            <LightRays
              raysOrigin="top-center"
              raysColor="#00BEFF"
              raysSpeed={1.2}
              lightSpread={0.9}
              rayLength={1.4}
              followMouse={true}
              mouseInfluence={0.12}
              noiseAmount={0.05}
              distortion={0.03}
              pulsating={true}
              fadeDistance={1.2}
              saturation={0.9}
            />
          </div>

          {/* Text content — sits above rays */}
          <div className="relative flex flex-col items-center justify-center text-center px-8 py-20" style={{ zIndex: 10 }}>
            <p className="text-[#00BEFF] font-semibold uppercase tracking-widest text-sm mb-6">
              THE MARKET IS SHIFTING
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-3xl">
              Your competition isn&apos;t outworking you...
              <span className="block mt-2 text-[#00BEFF]">but their AI might be.</span>
            </h2>
            <p className="mt-8 text-lg text-gray-400 max-w-xl">
              Agents using AI transaction coordinators close faster, make fewer errors,
              and take on more deals. Don&apos;t get left behind.
            </p>
            <Link
              href={withUtm('https://app.done-deal.info/signup', 'competition_callout')}
              onClick={() => track('external_cta_click', { campaign: 'competition_callout', ctaLabel: 'Start Free Trial' })}
              className="mt-10 inline-block px-10 py-4 rounded-full font-semibold text-lg text-black"
              style={{ background: '#00BEFF' }}
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
