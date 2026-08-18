import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { track } from '@vercel/analytics';
import Benefits from '../Benefits';

vi.mock('@vercel/analytics', () => ({
  track: vi.fn(),
}));

describe('Benefits', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the section heading', () => {
    render(<Benefits />);
    expect(screen.getByText('Why Choose Done Deal?')).toBeInTheDocument();
  });

  it('renders all four benefit cards', () => {
    render(<Benefits />);
    expect(screen.getByText('AI-Powered Efficiency:')).toBeInTheDocument();
    expect(screen.getByText('Cost Savings:')).toBeInTheDocument();
    expect(screen.getByText('24/7 Availability:')).toBeInTheDocument();
    expect(screen.getByText('Scalable Solutions:')).toBeInTheDocument();
  });

  it('renders the CTA link pointing to the signup app with UTM attribution', () => {
    render(<Benefits />);
    const link = screen.getByRole('link', { name: /start free trial/i });
    expect(link.getAttribute('href')).toMatch(/^https:\/\/app\.done-deal\.info\/signup\?/);
    expect(link.getAttribute('href')).toContain('utm_campaign=benefits');
  });

  it('tracks external_cta_click with the benefits campaign when the CTA is clicked', () => {
    render(<Benefits />);
    const link = screen.getByRole('link', { name: /start free trial/i });
    fireEvent.click(link);
    expect(track).toHaveBeenCalledWith('external_cta_click', {
      campaign: 'benefits',
      ctaLabel: 'Start Free Trial',
    });
  });

  it('calls track exactly once per click', () => {
    render(<Benefits />);
    const link = screen.getByRole('link', { name: /start free trial/i });
    fireEvent.click(link);
    expect(track).toHaveBeenCalledTimes(1);
  });
});
