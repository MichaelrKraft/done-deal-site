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

  it('tracks pricing_cta_click_pay_per_transaction when the Pay-Per-Transaction CTA is clicked', () => {
    render(<Pricing />);

    const link = screen.getAllByRole('link', { name: /get started/i })[0];
    fireEvent.click(link);

    expect(track).toHaveBeenCalledWith('pricing_cta_click_pay_per_transaction');
  });

  it('tracks pricing_cta_click_annual_standard when the Annual Standard CTA is clicked', () => {
    render(<Pricing />);

    const link = screen.getByRole('link', { name: /start your free trial/i });
    fireEvent.click(link);

    expect(track).toHaveBeenCalledWith('pricing_cta_click_annual_standard');
  });

  it('tracks pricing_cta_click_annual_unlimited when the Annual Unlimited CTA is clicked', () => {
    render(<Pricing />);

    const links = screen.getAllByRole('link', { name: /get started/i });
    fireEvent.click(links[links.length - 1]);

    expect(track).toHaveBeenCalledWith('pricing_cta_click_annual_unlimited');
  });

  it('calls track exactly once per CTA click', () => {
    render(<Pricing />);

    const link = screen.getByRole('link', { name: /start your free trial/i });
    fireEvent.click(link);

    expect(track).toHaveBeenCalledTimes(1);
  });
});
