import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import YourCastleSignup from '../YourCastleSignup';

vi.mock('@vercel/analytics', () => ({
  track: vi.fn(),
}));

function fillRequiredFields() {
  fireEvent.change(screen.getByPlaceholderText('First name'), { target: { value: 'Jane' } });
  fireEvent.change(screen.getByPlaceholderText('Last name'), { target: { value: 'Doe' } });
  fireEvent.change(screen.getByPlaceholderText('Email address'), {
    target: { value: 'jane@example.com' },
  });
  fireEvent.change(screen.getByPlaceholderText('Phone number'), {
    target: { value: '5551234567' },
  });
}

describe('YourCastleSignup', () => {
  beforeEach(() => {
    // The component polls /api/yourcastle/count on mount and on an interval;
    // stub it so those calls resolve instead of hitting the network.
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ remaining: 5 }),
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('shows an error message instead of crashing when the signup request rejects (network failure)', async () => {
    const fetchMock = vi.fn((url: string) => {
      if (typeof url === 'string' && url.includes('/api/yourcastle/count')) {
        return Promise.resolve({ ok: true, json: async () => ({ remaining: 5 }) });
      }
      return Promise.reject(new Error('network down'));
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<YourCastleSignup />);

    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /claim my free deal/i }));

    expect(
      await screen.findByText(/something went wrong\. please try again\./i)
    ).toBeInTheDocument();

    // The form should still be on the page (not crashed / not shown a success state).
    expect(screen.getByRole('button', { name: /claim my free deal/i })).toBeInTheDocument();
  });

  it('shows the server-provided error message when the signup response is not ok', async () => {
    const fetchMock = vi.fn((url: string) => {
      if (typeof url === 'string' && url.includes('/api/yourcastle/count')) {
        return Promise.resolve({ ok: true, json: async () => ({ remaining: 5 }) });
      }
      return Promise.resolve({
        ok: false,
        json: async () => ({ error: 'Too many requests. Please try again later.' }),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<YourCastleSignup />);

    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /claim my free deal/i }));

    expect(
      await screen.findByText(/too many requests\. please try again later\./i)
    ).toBeInTheDocument();
  });

  it('does not throw when the background count polling fetch rejects on mount', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    expect(() => render(<YourCastleSignup />)).not.toThrow();

    // Component should render its default (no "remaining" count) state without crashing.
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /claim my free deal/i })).toBeInTheDocument();
    });
  });

  // Regression test: the count-fetch .catch(() => {}) on mount previously
  // discarded fetch/parse failures with zero trace. Before the fix, this
  // assertion would fail (nothing logged); after the fix, the failure must
  // be logged via console.error so a persistent network/API problem is
  // debuggable in production instead of silently invisible.
  it('regression: logs (does not silently swallow) a failed count fetch on mount', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    render(<YourCastleSignup />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        '[yourcastle-signup] count fetch failed:',
        'network down'
      );
    });

    consoleSpy.mockRestore();
  });

  it('submits successfully and shows the success state when the API call succeeds', async () => {
    const fetchMock = vi.fn((url: string) => {
      if (typeof url === 'string' && url.includes('/api/yourcastle/count')) {
        return Promise.resolve({ ok: true, json: async () => ({ remaining: 5 }) });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ gotFreeDeal: true, spotNumber: 3, remaining: 4 }),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<YourCastleSignup />);

    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /claim my free deal/i }));

    expect(await screen.findByText(/spot #3 claimed/i)).toBeInTheDocument();
  });
});
