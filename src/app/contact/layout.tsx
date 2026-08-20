import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book a Free Demo — Done Deal AI Transaction Coordination',
  description:
    'Book a free demo of Done Deal, the AI transaction coordination platform that saves real estate agents up to 21 hours per deal at half the cost of a human TC.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Book a Free Demo — Done Deal',
    description:
      'Book a free demo of Done Deal, the AI transaction coordination platform for real estate professionals.',
    url: '/contact',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book a Free Demo — Done Deal',
    description:
      'Book a free demo of Done Deal, the AI transaction coordination platform for real estate professionals.',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
