import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { track } from '@vercel/analytics';
import FinalCTA from '../FinalCTA';

vi.mock('@vercel/analytics', () => ({
  track: vi.fn(),
}));

describe('FinalCTA', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the heading and supporting copy', () => {
    render(<FinalCTA />);
    expect(screen.getByText('Start Your Free Trial')).toBeInTheDocument();
    expect(screen.getByText(/start exploring done-deal and experience/i)).toBeInTheDocument();
  });

  it('renders the CTA link pointing to the signup app with UTM attribution', () => {
    render(<FinalCTA />);
    const link = screen.getByRole('link', { name: /start free trial/i });
    expect(link.getAttribute('href')).toMatch(/^https:\/\/app\.done-deal\.info\/signup\?/);
    expect(link.getAttribute('href')).toContain('utm_campaign=final_cta');
  });

  it('tracks external_cta_click with the final_cta campaign when the CTA is clicked', () => {
    render(<FinalCTA />);
    const link = screen.getByRole('link', { name: /start free trial/i });
    fireEvent.click(link);
    expect(track).toHaveBeenCalledWith('external_cta_click', {
      campaign: 'final_cta',
      ctaLabel: 'Start Free Trial',
    });
  });

  it('calls track exactly once per click', () => {
    render(<FinalCTA />);
    const link = screen.getByRole('link', { name: /start free trial/i });
    fireEvent.click(link);
    expect(track).toHaveBeenCalledTimes(1);
  });
});
