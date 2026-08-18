import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PricingPage from '../page';

describe('PricingPage', () => {
  it('renders without crashing', () => {
    render(<PricingPage />);
  });

  it('shows all three pricing tiers', () => {
    render(<PricingPage />);

    expect(screen.getAllByText('Pay-Per-Transaction').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Annual Standard').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Annual Unlimited').length).toBeGreaterThan(0);
  });

  it('links each tier CTA to the app signup page with UTM attribution', () => {
    render(<PricingPage />);

    const ctaLinks = [
      screen.getByRole('link', { name: /start pay-per-transaction/i }),
      screen.getByRole('link', { name: /start annual standard/i }),
      screen.getByRole('link', { name: /start annual unlimited/i }),
    ];

    for (const link of ctaLinks) {
      const href = link.getAttribute('href');
      expect(href).toMatch(/^https:\/\/app\.done-deal\.info\/signup\?/);
      const url = new URL(href!);
      expect(url.searchParams.get('utm_source')).toBe('done-deal-site');
      expect(url.searchParams.get('utm_medium')).toBe('cta');
    }
  });

  it('renders the pricing objections FAQ section', () => {
    render(<PricingPage />);

    expect(
      screen.getByText(/common questions about/i)
    ).toBeInTheDocument();
  });
});
