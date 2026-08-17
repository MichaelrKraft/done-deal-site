import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ExternalCtaLink from '../ExternalCtaLink';

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
  });

  it('renders the link with its href and label', () => {
    render(
      <ExternalCtaLink href="https://app.done-deal.info" className="btn">
        Start free trial
      </ExternalCtaLink>
    );

    const link = screen.getByRole('link', { name: 'Start free trial' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://app.done-deal.info');
  });

  it('shows the "Opening…" pending state on click', () => {
    render(
      <ExternalCtaLink href="https://app.done-deal.info" className="btn">
        Start free trial
      </ExternalCtaLink>
    );

    fireEvent.click(screen.getByRole('link', { name: 'Start free trial' }));

    const link = screen.getByRole('link', { name: 'Opening…' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('aria-busy', 'true');
  });

  it('calls onClickTrack when clicked', () => {
    const onClickTrack = vi.fn();
    render(
      <ExternalCtaLink href="https://app.done-deal.info" className="btn" onClickTrack={onClickTrack}>
        Start free trial
      </ExternalCtaLink>
    );

    fireEvent.click(screen.getByRole('link', { name: 'Start free trial' }));

    expect(onClickTrack).toHaveBeenCalledTimes(1);
  });

  it('shows the recoverable error toast with a retry link after the 4s stall timeout if the page is still visible', async () => {
    render(
      <ExternalCtaLink href="https://app.done-deal.info" className="btn">
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
      <ExternalCtaLink href="https://app.done-deal.info" className="btn">
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
      <ExternalCtaLink href="https://app.done-deal.info" className="btn">
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
