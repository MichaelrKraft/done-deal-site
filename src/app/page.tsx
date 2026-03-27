import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import Testimonials from '@/components/sections/Testimonials';
import Partners from '@/components/sections/Partners';
import Problem from '@/components/sections/Problem';
import Benefits from '@/components/sections/Benefits';
import HowItWorks from '@/components/sections/HowItWorks';
import Stats from '@/components/sections/Stats';
import ROICalculator from '@/components/sections/ROICalculator';
import Pricing from '@/components/sections/Pricing';
import Comparison from '@/components/sections/Comparison';
import FeatureCards from '@/components/sections/FeatureCards';
import VoiceDemo from '@/components/sections/VoiceDemo';
import FAQ from '@/components/sections/FAQ';
import FinalCTA from '@/components/sections/FinalCTA';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Testimonials />
        <Partners />
        <Problem />
        <Benefits />
        <HowItWorks />
        <Stats />
        <ROICalculator />
        <Pricing />
        <Comparison />
        <FeatureCards />
        <VoiceDemo />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
