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
