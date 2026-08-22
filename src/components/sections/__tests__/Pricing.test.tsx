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

  // Each pricing CTA intentionally fires two track() calls now: the
  // general external_cta_click funnel event, plus a dedicated
  // pricing_cta_click event tagged per tier (see pricing_cta_click tests
  // below). Updated from the old "exactly once" assertion, which predated
  // that second event.
  it('calls track exactly twice per CTA click (external_cta_click + pricing_cta_click)', () => {
    render(<Pricing />);

    const link = screen.getByRole('link', { name: /start your free trial/i });
    fireEvent.click(link);

    expect(track).toHaveBeenCalledTimes(2);
  });

  it('tracks pricing_cta_click with the tier and ctaLabel for the Pay-Per-Transaction CTA', () => {
    render(<Pricing />);

    const link = screen.getAllByRole('link', { name: /get started/i })[0];
    fireEvent.click(link);

    expect(track).toHaveBeenCalledWith('pricing_cta_click', {
      tier: 'pricing_pay_per_transaction',
      ctaLabel: 'Get Started',
    });
  });

  it('tracks pricing_cta_click with the tier and ctaLabel for the Annual Standard CTA', () => {
    render(<Pricing />);

    const link = screen.getByRole('link', { name: /start your free trial/i });
    fireEvent.click(link);

    expect(track).toHaveBeenCalledWith('pricing_cta_click', {
      tier: 'pricing_annual_standard',
      ctaLabel: 'Start Your Free Trial',
    });
  });

  it('tracks pricing_cta_click with the tier and ctaLabel for the Annual Unlimited CTA', () => {
    render(<Pricing />);

    const links = screen.getAllByRole('link', { name: /get started/i });
    fireEvent.click(links[links.length - 1]);

    expect(track).toHaveBeenCalledWith('pricing_cta_click', {
      tier: 'pricing_annual_unlimited',
      ctaLabel: 'Get Started',
    });
  });
});
