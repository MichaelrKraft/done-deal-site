import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import YourCastleHero from '@/components/sections/YourCastleHero';
import Testimonials from '@/components/sections/Testimonials';
import Partners from '@/components/sections/Partners';
import Problem from '@/components/sections/Problem';
import CompetitionCallout from '@/components/sections/CompetitionCallout';
import Benefits from '@/components/sections/Benefits';
import TCNotepad from '@/components/sections/TCNotepad';
import HowItWorks from '@/components/sections/HowItWorks';
import Stats from '@/components/sections/Stats';
import Pricing from '@/components/sections/Pricing';
import Comparison from '@/components/sections/Comparison';
import FeatureCards from '@/components/sections/FeatureCards';
import VoiceDemo from '@/components/sections/VoiceDemo';
import FAQ from '@/components/sections/FAQ';
import YourCastleSignup from '@/components/sections/YourCastleSignup';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Done Deal — Exclusive Offer for Your Castle Real Estate Agents',
  description: 'Your Castle Real Estate agents: claim your free first transaction. Done-Deal AI handles every deadline, document, and email from contract to close.',
};

export default function YourCastle() {
  return (
    <>
      <Navbar />
      <main>
        <YourCastleHero />
        <Testimonials />
        <Partners />
        <Problem />
        <CompetitionCallout />
        <Benefits />
        <TCNotepad />
        <HowItWorks />
        <Stats />
        <Pricing />
        <Comparison />
        <FeatureCards />
        <VoiceDemo />
        <FAQ />
        <YourCastleSignup />
      </main>
      <Footer />
    </>
  );
}
