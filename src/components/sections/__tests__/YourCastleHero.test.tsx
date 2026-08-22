import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { track } from '@vercel/analytics';
import YourCastleHero from '../YourCastleHero';

vi.mock('@vercel/analytics', () => ({
  track: vi.fn(),
}));

describe('YourCastleHero', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('renders the headline and offer badge', () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ remaining: 12 }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<YourCastleHero />);

    expect(screen.getByText(/every deadline\. every document\./i)).toBeInTheDocument();
    expect(
      screen.getByText(/your castle real estate — exclusive agent offer/i)
    ).toBeInTheDocument();
  });

  it('fetches and displays the remaining-deals counter on mount', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ remaining: 7 }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<YourCastleHero />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/yourcastle/count');
    });
    expect(await screen.findByText('7')).toBeInTheDocument();
    expect(screen.getByText(/of 20/i)).toBeInTheDocument();
  });

  it('does not render the counter when the fetch fails', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network down'));
    vi.stubGlobal('fetch', fetchMock);

    render(<YourCastleHero />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/yourcastle/count');
    });
    expect(screen.queryByText(/of 20/i)).not.toBeInTheDocument();
  });

  // Regression test: the interval count-poll .catch(() => {}) previously
  // discarded fetch failures with zero trace. Before the fix, this assertion
  // would fail (nothing logged); after the fix, the failure must be logged
  // via console.error on the 30s poll so a persistent network/API problem is
  // debuggable in production instead of silently invisible. (The initial
  // mount fetch uses a separate .catch(() => setRemaining(null)) that was
  // not part of this fix and is intentionally not asserted here.)
  it('regression: logs (does not silently swallow) a failed count-poll fetch on the 30s interval', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ json: async () => ({ remaining: 10 }) }) // initial mount succeeds
      .mockRejectedValue(new Error('network down')); // interval poll fails
    vi.stubGlobal('fetch', fetchMock);

    render(<YourCastleHero />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        '[yourcastle-hero] count poll failed:',
        'network down'
      );
    });

    consoleSpy.mockRestore();
  });

  // Regression test for da666e4: the count API now returns
  // `unavailable: true` (with remaining: 0) instead of a bare 0 when its own
  // query failed open. Trusting `remaining` at face value in that case would
  // show agents a false "0 of 20 remaining" (looks fully claimed). The
  // component must treat `unavailable` the same as a fetch failure and hide
  // the counter entirely rather than render a possibly-wrong number.
  it('hides the counter (does not trust remaining: 0) when the count API responds with unavailable: true', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ claimed: 0, remaining: 0, limit: 20, unavailable: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<YourCastleHero />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/yourcastle/count');
    });
    expect(screen.queryByText(/of 20/i)).not.toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('polls the count endpoint again after 30 seconds', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ remaining: 5 }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<YourCastleHero />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  it('tracks yourcastle_hero_cta_click_login when the login link is clicked', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ remaining: 3 }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<YourCastleHero />);

    const link = screen.getByRole('link', { name: /already have an account/i });
    fireEvent.click(link);

    expect(track).toHaveBeenCalledWith('external_cta_click', {
      campaign: 'hero',
      ctaLabel: 'Already have an account?',
    });
  });

  it('renders the "Claim My Free Deal" anchor pointing at #claim', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ remaining: 3 }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<YourCastleHero />);

    const link = screen.getByRole('link', { name: /claim my free deal/i });
    expect(link).toHaveAttribute('href', '#claim');
  });
});
