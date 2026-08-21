import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GlobalError from '../global-error';

// global-error.tsx is Next.js's last-resort boundary: it only fires when the
// root layout itself throws, so unlike error.tsx it renders its own
// <html>/<body> and has no Navbar/Footer or Link (those depend on the layout
// that just failed). It's a genuinely separate component from error.tsx —
// different JSX root, a plain <a> instead of next/link, inline styles
// instead of the `cyan-button` class, and its own console.error prefix — so
// it needs its own regression coverage rather than relying on error.tsx's.
describe('GlobalError (root-layout-failure boundary)', () => {
  const testError = Object.assign(new Error('boom'), { digest: 'xyz789' });

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders without crashing', () => {
    render(<GlobalError error={testError} reset={() => {}} />);
  });

  it('shows the error heading and message', () => {
    render(<GlobalError error={testError} reset={() => {}} />);

    expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
    expect(screen.getByText(/something broke on our end/i)).toBeInTheDocument();
  });

  it('never renders the raw error message to the user', () => {
    render(<GlobalError error={testError} reset={() => {}} />);

    expect(screen.queryByText('boom')).not.toBeInTheDocument();
  });

  it('calls reset when "Try Again" is clicked', () => {
    const reset = vi.fn();
    render(<GlobalError error={testError} reset={reset} />);

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('links back home via a plain anchor (no router dependency)', () => {
    render(<GlobalError error={testError} reset={() => {}} />);

    const link = screen.getByRole('link', { name: /back to home/i });
    expect(link).toHaveAttribute('href', '/');
    expect(link.tagName).toBe('A');
  });

  it('logs the error for observability with the global-error-boundary prefix', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<GlobalError error={testError} reset={() => {}} />);

    expect(consoleSpy).toHaveBeenCalledWith('[global-error-boundary]', 'boom', 'xyz789');
  });
});
