import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { track } from '@vercel/analytics';
import ExternalCtaLink from '../ExternalCtaLink';

vi.mock('@vercel/analytics', () => ({
  track: vi.fn(),
}));

describe('ExternalCtaLink', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Default: page stays visible after click, i.e. navigation did not
    // happen. Individual tests override this to simulate the happy path.
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.mocked(track).mockClear();
  });

  it('renders the link with its href and label', () => {
    render(
      <ExternalCtaLink href="https://app.done-deal.info" className="btn" campaign="hero" ctaLabel="Start free trial">
        Start free trial
      </ExternalCtaLink>
    );

    const link = screen.getByRole('link', { name: 'Start free trial' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      'href',
      'https://app.done-deal.info/?utm_source=done-deal-site&utm_medium=cta&utm_campaign=hero'
    );
  });

  it('appends UTM params identifying the source campaign to the href', () => {
    render(
      <ExternalCtaLink
        href="https://app.done-deal.info/signup"
        className="btn"
        campaign="pricing_annual_standard"
        ctaLabel="Start Annual Standard"
      >
        Start Annual Standard
      </ExternalCtaLink>
    );

    const link = screen.getByRole('link', { name: 'Start Annual Standard' });
    const url = new URL(link.getAttribute('href')!);
    expect(url.pathname).toBe('/signup');
    expect(url.searchParams.get('utm_source')).toBe('done-deal-site');
    expect(url.searchParams.get('utm_medium')).toBe('cta');
    expect(url.searchParams.get('utm_campaign')).toBe('pricing_annual_standard');
  });

  it('fires a track() analytics event with the campaign and CTA label on click', async () => {
    const { track } = await import('@vercel/analytics');
    render(
      <ExternalCtaLink
        href="https://app.done-deal.info/signup"
        className="btn"
        campaign="pricing_annual_standard"
        ctaLabel="Start Annual Standard"
      >
        Start Annual Standard
      </ExternalCtaLink>
    );

    fireEvent.click(screen.getByRole('link', { name: 'Start Annual Standard' }));

    expect(track).toHaveBeenCalledWith('external_cta_click', {
      campaign: 'pricing_annual_standard',
      ctaLabel: 'Start Annual Standard',
    });
  });

  it('shows the "Opening…" pending state on click', () => {
    render(
      <ExternalCtaLink href="https://app.done-deal.info" className="btn" campaign="hero" ctaLabel="Start free trial">
        Start free trial
      </ExternalCtaLink>
    );

    fireEvent.click(screen.getByRole('link', { name: 'Start free trial' }));

    const link = screen.getByRole('link', { name: 'Opening…' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('aria-busy', 'true');
  });

  it('also fires a pricing_cta_click event tagged with the tier when the campaign is a pricing_ campaign', async () => {
    const { track } = await import('@vercel/analytics');
    render(
      <ExternalCtaLink
        href="https://app.done-deal.info/signup"
        className="btn"
        campaign="pricing_annual_unlimited"
        ctaLabel="Start Annual Unlimited"
      >
        Start Annual Unlimited
      </ExternalCtaLink>
    );

    fireEvent.click(screen.getByRole('link', { name: 'Start Annual Unlimited' }));

    expect(track).toHaveBeenCalledWith('pricing_cta_click', {
      tier: 'pricing_annual_unlimited',
      ctaLabel: 'Start Annual Unlimited',
    });
    expect(track).toHaveBeenCalledTimes(2);
  });

  it('does not fire pricing_cta_click for a non-pricing campaign', async () => {
    const { track } = await import('@vercel/analytics');
    render(
      <ExternalCtaLink href="https://app.done-deal.info" className="btn" campaign="hero" ctaLabel="Start free trial">
        Start free trial
      </ExternalCtaLink>
    );

    fireEvent.click(screen.getByRole('link', { name: 'Start free trial' }));

    expect(track).not.toHaveBeenCalledWith('pricing_cta_click', expect.anything());
    expect(track).toHaveBeenCalledTimes(1);
  });

  it('calls onClickTrack when clicked', () => {
    const onClickTrack = vi.fn();
    render(
      <ExternalCtaLink href="https://app.done-deal.info" className="btn" campaign="hero" ctaLabel="Start free trial" onClickTrack={onClickTrack}>
        Start free trial
      </ExternalCtaLink>
    );

    fireEvent.click(screen.getByRole('link', { name: 'Start free trial' }));

    expect(onClickTrack).toHaveBeenCalledTimes(1);
  });

  it('shows the recoverable error toast with a retry link after the 4s stall timeout if the page is still visible', async () => {
    render(
      <ExternalCtaLink href="https://app.done-deal.info" className="btn" campaign="hero" ctaLabel="Start free trial">
        Start free trial
      </ExternalCtaLink>
    );

    fireEvent.click(screen.getByRole('link', { name: 'Start free trial' }));

    // Not shown before the timeout elapses.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(4000);
    });

    const toast = screen.getByRole('alert');
    expect(toast).toBeInTheDocument();
    expect(
      screen.getByText(/done deal is taking longer than expected to load/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /try opening app\.done-deal\.info again/i })
    ).toBeInTheDocument();
  });

  it('does not show the error toast after the timeout if the page already navigated away (hidden)', async () => {
    render(
      <ExternalCtaLink href="https://app.done-deal.info" className="btn" campaign="hero" ctaLabel="Start free trial">
        Start free trial
      </ExternalCtaLink>
    );

    fireEvent.click(screen.getByRole('link', { name: 'Start free trial' }));

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden',
    });

    await act(async () => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('dismisses the error toast and returns to idle when the toast is dismissed', async () => {
    render(
      <ExternalCtaLink href="https://app.done-deal.info" className="btn" campaign="hero" ctaLabel="Start free trial">
        Start free trial
      </ExternalCtaLink>
    );

    fireEvent.click(screen.getByRole('link', { name: 'Start free trial' }));
    await act(async () => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.getByRole('alert')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Start free trial' })).toBeInTheDocument();
  });
});
