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

  it('renders the CTA link pointing to the signup app', () => {
    render(<Benefits />);
    const link = screen.getByRole('link', { name: /start free trial/i });
    expect(link).toHaveAttribute('href', 'https://app.done-deal.info/signup');
  });

  it('tracks benefits_cta_click_signup when the CTA is clicked', () => {
    render(<Benefits />);
    const link = screen.getByRole('link', { name: /start free trial/i });
    fireEvent.click(link);
    expect(track).toHaveBeenCalledWith('benefits_cta_click_signup');
  });

  it('calls track exactly once per click', () => {
    render(<Benefits />);
    const link = screen.getByRole('link', { name: /start free trial/i });
    fireEvent.click(link);
    expect(track).toHaveBeenCalledTimes(1);
  });
});
