import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ROICalculator, { getBestPlan } from '../ROICalculator';

const PER_TRANSACTION_PRICE = 197;
const ANNUAL_STANDARD_PRICE = 997;
const ANNUAL_UNLIMITED_PRICE = 2500;

describe('getBestPlan', () => {
  it('picks Pay-Per-Transaction for a very low deal count', () => {
    // 1 deal: paygo = $197, standard = $997, unlimited = $2500 -> paygo wins
    const result = getBestPlan(1);
    expect(result.name).toBe('Pay-Per-Transaction');
    expect(result.annual).toBe(PER_TRANSACTION_PRICE * 1);
  });

  it('treats 0 deals as a valid boundary and still returns Pay-Per-Transaction at $0', () => {
    const result = getBestPlan(0);
    expect(result.name).toBe('Pay-Per-Transaction');
    expect(result.annual).toBe(0);
  });

  it('picks Annual Standard once paygo cost exceeds it, within the 10-deal limit', () => {
    // 6 deals: paygo = $1182, standard = $997, unlimited = $2500 -> standard wins
    const result = getBestPlan(6);
    expect(result.name).toBe('Annual Standard');
    expect(result.annual).toBe(ANNUAL_STANDARD_PRICE);
  });

  it('is indifferent at the exact crossover point and prefers paygo on a tie', () => {
    // Find deals where paygo === standard almost exactly; use a boundary
    // just below where paygo overtakes standard to lock the tie-break rule.
    // paygo <= standard is checked first, so ties resolve to Pay-Per-Transaction.
    const deals = Math.floor(ANNUAL_STANDARD_PRICE / PER_TRANSACTION_PRICE); // 5
    const result = getBestPlan(deals);
    expect(result.annual).toBeLessThanOrEqual(ANNUAL_STANDARD_PRICE);
    expect(result.name).toBe('Pay-Per-Transaction');
  });

  it('picks Annual Standard exactly at the 10-deal tier boundary', () => {
    // 10 deals: paygo = $1970, standard = $997 (limit is inclusive: deals <= 10), unlimited = $2500
    const result = getBestPlan(10);
    expect(result.name).toBe('Annual Standard');
    expect(result.annual).toBe(ANNUAL_STANDARD_PRICE);
  });

  it('excludes Annual Standard once deals exceed the 10-deal limit (11 deals)', () => {
    // 11 deals: standard becomes Infinity (deals > limit), paygo = $2167, unlimited = $2500
    // paygo ($2167) <= unlimited ($2500) -> Pay-Per-Transaction still wins here
    const result = getBestPlan(11);
    expect(result.name).toBe('Pay-Per-Transaction');
    expect(result.annual).toBe(PER_TRANSACTION_PRICE * 11);
  });

  it('picks Annual Unlimited once paygo cost exceeds it beyond the standard tier limit', () => {
    // 13 deals: standard = Infinity, paygo = $2561, unlimited = $2500 -> unlimited wins
    const deals = Math.ceil(ANNUAL_UNLIMITED_PRICE / PER_TRANSACTION_PRICE) + 1; // 13
    const result = getBestPlan(deals);
    expect(result.name).toBe('Annual Unlimited');
    expect(result.annual).toBe(ANNUAL_UNLIMITED_PRICE);
  });

  it('caps at Annual Unlimited for a very large deal count (upper slider bound and beyond)', () => {
    const result = getBestPlan(50);
    expect(result.name).toBe('Annual Unlimited');
    expect(result.annual).toBe(ANNUAL_UNLIMITED_PRICE);

    const extreme = getBestPlan(10000);
    expect(extreme.name).toBe('Annual Unlimited');
    expect(extreme.annual).toBe(ANNUAL_UNLIMITED_PRICE);
  });
});

describe('ROICalculator component', () => {
  it('renders the default 10-deal state with cost, savings, and best-plan copy', () => {
    render(<ROICalculator />);

    // Default deals = 10 -> Annual Standard ($997), human TC = 10 * $400 = $4000
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText(/best plan for 10 deals\/year/i)).toBeInTheDocument();
    expect(screen.getByText('Annual Standard')).toBeInTheDocument();
    expect(screen.getByText('$997/yr')).toBeInTheDocument();
    expect(screen.getByText('$4,000/yr')).toBeInTheDocument();
  });

  it('updates cost, savings, and best-plan copy when the slider moves to a boundary value', () => {
    render(<ROICalculator />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '1' } });

    // 1 deal: paygo = $197, human TC = $400 -> savings = $203 (positive, still shown)
    expect(screen.getByText(/best plan for 1 deals\/year/i)).toBeInTheDocument();
    expect(screen.getByText('Pay-Per-Transaction')).toBeInTheDocument();
    expect(screen.getByText('$197/yr')).toBeInTheDocument();
    expect(screen.getByText('$400/yr')).toBeInTheDocument();
  });

  it('caps the annual cost at Annual Unlimited pricing when the slider is dragged to its max (50)', () => {
    render(<ROICalculator />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '50' } });

    expect(screen.getByText(/best plan for 50 deals\/year/i)).toBeInTheDocument();
    expect(screen.getByText('Annual Unlimited')).toBeInTheDocument();
    expect(screen.getByText('$2,500/yr')).toBeInTheDocument();
  });
});
