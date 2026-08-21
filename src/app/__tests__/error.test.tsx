import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundaryPage from '../error';

describe('Error (branded App Router error boundary)', () => {
  const testError = Object.assign(new Error('boom'), { digest: 'abc123' });

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders without crashing', () => {
    render(<ErrorBoundaryPage error={testError} reset={() => {}} />);
  });

  it('shows the error heading and message', () => {
    render(<ErrorBoundaryPage error={testError} reset={() => {}} />);

    expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
    expect(screen.getByText(/something broke on our end/i)).toBeInTheDocument();
  });

  it('never renders the raw error message to the user', () => {
    render(<ErrorBoundaryPage error={testError} reset={() => {}} />);

    expect(screen.queryByText('boom')).not.toBeInTheDocument();
  });

  it('calls reset when "Try Again" is clicked', () => {
    const reset = vi.fn();
    render(<ErrorBoundaryPage error={testError} reset={reset} />);

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('links back home', () => {
    render(<ErrorBoundaryPage error={testError} reset={() => {}} />);

    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/');
  });

  it('logs the error for observability', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<ErrorBoundaryPage error={testError} reset={() => {}} />);

    expect(consoleSpy).toHaveBeenCalledWith('[app-error-boundary]', 'boom', 'abc123');
  });
});
