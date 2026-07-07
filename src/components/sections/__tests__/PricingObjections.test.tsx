import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PricingObjections from '../PricingObjections';

describe('PricingObjections', () => {
  it('renders all objection questions collapsed by default', () => {
    render(<PricingObjections />);

    const questionButton = screen.getByRole('button', {
      name: /what if i don't close a deal this month/i,
    });
    expect(questionButton).toBeInTheDocument();
    expect(questionButton).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByText(/pay-per-transaction plan exists/i)
    ).not.toBeInTheDocument();
  });

  it('opens an item to reveal its answer when clicked', () => {
    render(<PricingObjections />);

    const questionButton = screen.getByRole('button', { name: /can i cancel anytime/i });
    fireEvent.click(questionButton);

    expect(questionButton).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByText(/can be cancelled at any time with no cancellation fee/i)
    ).toBeInTheDocument();
  });

  it('closes the open item when clicked again (single-open-at-a-time accordion)', () => {
    render(<PricingObjections />);

    const questionButton = screen.getByRole('button', {
      name: /is there a contract or long-term commitment/i,
    });

    fireEvent.click(questionButton);
    expect(questionButton).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(questionButton);
    expect(questionButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('only shows one answer open at a time', () => {
    render(<PricingObjections />);

    const firstButton = screen.getByRole('button', {
      name: /what if i don't close a deal this month/i,
    });
    const secondButton = screen.getByRole('button', { name: /can i cancel anytime/i });

    fireEvent.click(firstButton);
    expect(firstButton).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(secondButton);
    expect(secondButton).toHaveAttribute('aria-expanded', 'true');
    expect(firstButton).toHaveAttribute('aria-expanded', 'false');
  });
});
