import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BetaHero from '@/components/sections/BetaHero';
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
import BetaSignup from '@/components/sections/BetaSignup';
import type { Metadata } from 'next';

type Props = { params: Promise<{ slug: string }> };

async function getBrokerageConfig(slug: string) {
  const { data } = await supabaseAdmin
    .from('beta_brokerages')
    .select('slug, name, short_name, badge_text, scarcity_label, free_deal_limit, waitlist_message')
    .eq('slug', slug)
    .eq('active', true)
    .single();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const config = await getBrokerageConfig(slug);
  if (!config) return { title: 'Done Deal' };
  return {
    title: `Done Deal — Exclusive Offer for ${config.name} Agents`,
    description: `${config.short_name} agents: claim your free first transaction. Done-Deal AI handles every deadline, document, and email from contract to close.`,
  };
}

export default async function BetaPage({ params }: Props) {
  const { slug } = await params;
  const config = await getBrokerageConfig(slug);
  if (!config) notFound();

  return (
    <>
      <Navbar />
      <main>
        <BetaHero config={config} />
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
        <BetaSignup config={config} />
      </main>
      <Footer />
    </>
  );
}
