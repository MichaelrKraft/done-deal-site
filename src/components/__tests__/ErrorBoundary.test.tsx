import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

function ThrowingChild(): never {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children normally when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>safe content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('safe content')).toBeInTheDocument();
  });

  it('renders the fallback instead of crashing when a child throws', () => {
    // React logs the error to console.error during the act() cycle; suppress
    // that expected noise so the test output stays clean.
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={<div>something went wrong</div>}>
        <ThrowingChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('something went wrong')).toBeInTheDocument();
    expect(screen.queryByText('boom')).not.toBeInTheDocument();
  });

  it('renders nothing (not a crash) when a child throws and no fallback is provided', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { container } = render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('logs only the error message, not the full error object or stack (no-PII logging rule)', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={<div>fallback</div>}>
        <ThrowingChild />
      </ErrorBoundary>
    );

    const loggedCall = consoleSpy.mock.calls.find((call) =>
      String(call[0]).includes('ErrorBoundary caught an error')
    );
    expect(loggedCall).toBeDefined();
    expect(loggedCall?.[1]).toBe('boom');
  });
});
