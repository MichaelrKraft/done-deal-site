import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { track } from '@vercel/analytics';
import HowItWorks from '../HowItWorks';

vi.mock('@vercel/analytics', () => ({
  track: vi.fn(),
}));

describe('HowItWorks', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the section heading', () => {
    render(<HowItWorks />);
    expect(screen.getByText('How it Works')).toBeInTheDocument();
  });

  it('renders all four steps', () => {
    render(<HowItWorks />);
    expect(
      screen.getByText(/the ai reviews and tracks all transaction milestones/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/instantly updates clients and team members/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/communicates in real time using natural/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/works in the background so you can focus/i)
    ).toBeInTheDocument();
  });

  it('renders the CTA link pointing to the signup app with UTM attribution', () => {
    render(<HowItWorks />);
    const link = screen.getByRole('link', { name: /build my free ai bot/i });
    expect(link.getAttribute('href')).toMatch(/^https:\/\/app\.done-deal\.info\/signup\?/);
    expect(link.getAttribute('href')).toContain('utm_campaign=how_it_works_section');
  });

  it('tracks external_cta_click with the how_it_works_section campaign when the CTA is clicked', () => {
    render(<HowItWorks />);
    const link = screen.getByRole('link', { name: /build my free ai bot/i });
    fireEvent.click(link);
    expect(track).toHaveBeenCalledWith('external_cta_click', {
      campaign: 'how_it_works_section',
      ctaLabel: 'Build my FREE Ai Bot',
    });
  });

  it('calls track exactly once per click', () => {
    render(<HowItWorks />);
    const link = screen.getByRole('link', { name: /build my free ai bot/i });
    fireEvent.click(link);
    expect(track).toHaveBeenCalledTimes(1);
  });
});
