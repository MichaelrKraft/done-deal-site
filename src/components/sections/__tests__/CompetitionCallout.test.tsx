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

  it('renders the CTA link pointing to the signup app', () => {
    render(<CompetitionCallout />);
    const link = screen.getByRole('link', { name: /start free trial/i });
    expect(link).toHaveAttribute('href', 'https://app.done-deal.info/signup');
  });

  it('tracks competition_callout_cta_click_signup when the CTA is clicked', () => {
    render(<CompetitionCallout />);
    const link = screen.getByRole('link', { name: /start free trial/i });
    fireEvent.click(link);
    expect(track).toHaveBeenCalledWith('competition_callout_cta_click_signup');
  });

  it('calls track exactly once per click', () => {
    render(<CompetitionCallout />);
    const link = screen.getByRole('link', { name: /start free trial/i });
    fireEvent.click(link);
    expect(track).toHaveBeenCalledTimes(1);
  });
});
