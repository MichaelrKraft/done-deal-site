import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { track } from '@vercel/analytics';
import Comparison from '../Comparison';

vi.mock('@vercel/analytics', () => ({
  track: vi.fn(),
}));

describe('Comparison', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the table header columns', () => {
    render(<Comparison />);
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Done Deal (AI TC)')).toBeInTheDocument();
    expect(screen.getByText('Human TC')).toBeInTheDocument();
  });

  it('renders all comparison rows', () => {
    render(<Comparison />);
    expect(screen.getByText('Availability')).toBeInTheDocument();
    expect(screen.getByText('Cost')).toBeInTheDocument();
    expect(screen.getByText('Data Security')).toBeInTheDocument();
    expect(screen.getByText('Availability During Holidays')).toBeInTheDocument();
  });

  it('tracks comparison_cta_click_start_trial when the trial CTA is clicked', () => {
    render(<Comparison />);
    const link = screen.getByRole('link', { name: /start 14-day free trial/i });
    fireEvent.click(link);
    expect(track).toHaveBeenCalledWith('comparison_cta_click_start_trial');
  });

  it('tracks comparison_cta_click_get_started when the get-started CTA is clicked', () => {
    render(<Comparison />);
    const link = screen.getByRole('link', { name: /^get started/i });
    fireEvent.click(link);
    expect(track).toHaveBeenCalledWith('comparison_cta_click_get_started');
  });

  it('both CTAs point to the signup app', () => {
    render(<Comparison />);
    const trialLink = screen.getByRole('link', { name: /start 14-day free trial/i });
    const getStartedLink = screen.getByRole('link', { name: /^get started/i });
    expect(trialLink).toHaveAttribute('href', 'https://app.done-deal.info/signup');
    expect(getStartedLink).toHaveAttribute('href', 'https://app.done-deal.info/signup');
  });
});
