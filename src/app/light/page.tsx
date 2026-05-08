import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
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
import FinalCTA from '@/components/sections/FinalCTA';

export default function LightPage() {
  return (
    <div className="theme-light min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <VoiceDemo />
        <Problem />
        <Benefits />
        <TCNotepad />
        <HowItWorks />
        <Stats />
        <ROICalculator />
        <Pricing />
        <Comparison />
        <FeatureCards />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
