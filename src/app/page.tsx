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

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Done Deal',
  url: 'https://done-deal.co',
  description:
    'AI-powered transaction coordination platform for real estate professionals.',
  sameAs: [],
};

const productJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'AI Transaction Coordination',
  name: 'Done Deal',
  provider: {
    '@type': 'Organization',
    name: 'Done Deal',
    url: 'https://done-deal.co',
  },
  description:
    'Stop overpaying for transaction coordination. AI TCs are half the cost of a human TC. Save up to 21 hours per transaction with Done Deal.',
  areaServed: 'US',
  audience: {
    '@type': 'Audience',
    audienceType: 'Real estate agents',
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
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
