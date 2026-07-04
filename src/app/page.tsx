import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';
import Hero from '@/components/sections/Hero';
import Testimonials from '@/components/sections/Testimonials';
import Partners from '@/components/sections/Partners';
import Problem from '@/components/sections/Problem';
import Benefits from '@/components/sections/Benefits';
import TCNotepad from '@/components/sections/TCNotepad';
import HowItWorks from '@/components/sections/HowItWorks';
import Stats from '@/components/sections/Stats';
import ROICalculator from '@/components/sections/ROICalculator';
import Pricing from '@/components/sections/Pricing';
import Comparison from '@/components/sections/Comparison';
import FeatureCards from '@/components/sections/FeatureCards';
import VoiceDemo from '@/components/sections/VoiceDemo';
import FAQ from '@/components/sections/FAQ';
import FinalCTA from '@/components/sections/FinalCTA';
import CompetitionCallout from '@/components/sections/CompetitionCallout';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <ErrorBoundary>
          <Hero />
        </ErrorBoundary>
        <Testimonials />
        <Partners />
        <Problem />
        <ErrorBoundary>
          <CompetitionCallout />
        </ErrorBoundary>
        <Benefits />
        <TCNotepad />
        <HowItWorks />
        <Stats />
        <ROICalculator />
        <Pricing />
        <Comparison />
        <FeatureCards />
        <ErrorBoundary>
          <VoiceDemo />
        </ErrorBoundary>
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
