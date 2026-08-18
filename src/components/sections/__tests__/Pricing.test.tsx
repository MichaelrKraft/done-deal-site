import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { track } from '@vercel/analytics';
import Pricing from '../Pricing';

vi.mock('@vercel/analytics', () => ({
  track: vi.fn(),
}));

describe('Pricing', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('tracks external_cta_click with the pricing_pay_per_transaction campaign when the Pay-Per-Transaction CTA is clicked', () => {
    render(<Pricing />);

    const link = screen.getAllByRole('link', { name: /get started/i })[0];
    fireEvent.click(link);

    expect(track).toHaveBeenCalledWith('external_cta_click', {
      campaign: 'pricing_pay_per_transaction',
      ctaLabel: 'Get Started',
    });
  });

  it('tracks external_cta_click with the pricing_annual_standard campaign when the Annual Standard CTA is clicked', () => {
    render(<Pricing />);

    const link = screen.getByRole('link', { name: /start your free trial/i });
    fireEvent.click(link);

    expect(track).toHaveBeenCalledWith('external_cta_click', {
      campaign: 'pricing_annual_standard',
      ctaLabel: 'Start Your Free Trial',
    });
  });

  it('tracks external_cta_click with the pricing_annual_unlimited campaign when the Annual Unlimited CTA is clicked', () => {
    render(<Pricing />);

    const links = screen.getAllByRole('link', { name: /get started/i });
    fireEvent.click(links[links.length - 1]);

    expect(track).toHaveBeenCalledWith('external_cta_click', {
      campaign: 'pricing_annual_unlimited',
      ctaLabel: 'Get Started',
    });
  });

  it('calls track exactly once per CTA click', () => {
    render(<Pricing />);

    const link = screen.getByRole('link', { name: /start your free trial/i });
    fireEvent.click(link);

    expect(track).toHaveBeenCalledTimes(1);
  });
});
