import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { track } from '@vercel/analytics';
import CompetitionCallout from '../CompetitionCallout';

vi.mock('@vercel/analytics', () => ({
  track: vi.fn(),
}));

// LightRays uses canvas/WebGL APIs jsdom does not implement; stub it out
// since this test only cares about the surrounding text and CTA.
vi.mock('@/components/LightRays/LightRays', () => ({
  default: () => <div data-testid="light-rays-mock" />,
}));

describe('CompetitionCallout', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the headline and supporting copy', () => {
    render(<CompetitionCallout />);
    expect(screen.getByText(/your competition isn.t outworking you/i)).toBeInTheDocument();
    expect(screen.getByText(/but their ai might be/i)).toBeInTheDocument();
  });

  it('renders the CTA link pointing to the signup app with UTM attribution', () => {
    render(<CompetitionCallout />);
    const link = screen.getByRole('link', { name: /start free trial/i });
    expect(link.getAttribute('href')).toMatch(/^https:\/\/app\.done-deal\.info\/signup\?/);
    expect(link.getAttribute('href')).toContain('utm_campaign=competition_callout');
  });

  it('tracks external_cta_click with the competition_callout campaign when the CTA is clicked', () => {
    render(<CompetitionCallout />);
    const link = screen.getByRole('link', { name: /start free trial/i });
    fireEvent.click(link);
    expect(track).toHaveBeenCalledWith('external_cta_click', {
      campaign: 'competition_callout',
      ctaLabel: 'Start Free Trial',
    });
  });

  it('calls track exactly once per click', () => {
    render(<CompetitionCallout />);
    const link = screen.getByRole('link', { name: /start free trial/i });
    fireEvent.click(link);
    expect(track).toHaveBeenCalledTimes(1);
  });
});
