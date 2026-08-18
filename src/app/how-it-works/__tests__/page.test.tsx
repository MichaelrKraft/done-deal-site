import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HowItWorksPage from '../page';

describe('HowItWorksPage', () => {
  it('renders without crashing', () => {
    render(<HowItWorksPage />);
  });

  it('shows the automation steps', () => {
    render(<HowItWorksPage />);

    expect(screen.getByText('Connect a transaction')).toBeInTheDocument();
    expect(screen.getByText('AI tracks every deadline')).toBeInTheDocument();
    expect(screen.getByText('One dashboard, every deal')).toBeInTheDocument();
  });

  it('links the CTA to the app signup page (with UTM attribution) and to /pricing', () => {
    render(<HowItWorksPage />);

    // Navbar renders its own "Start Free Trial" CTA (desktop + mobile) in
    // addition to the page's own bottom CTA, so assert at least one link
    // with that accessible name points at the signup page.
    const trialLinks = screen.getAllByRole('link', { name: /start free trial/i });
    expect(trialLinks.length).toBeGreaterThan(0);
    expect(
      trialLinks.some((link) =>
        (link.getAttribute('href') ?? '').startsWith('https://app.done-deal.info/signup?')
      )
    ).toBe(true);

    expect(screen.getByRole('link', { name: /view pricing/i })).toHaveAttribute(
      'href',
      '/pricing'
    );
  });
});
