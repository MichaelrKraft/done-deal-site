import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Toast from '../Toast';

describe('Toast', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing when message is null', () => {
    const { container } = render(
      <Toast message={null} variant="error" onDismiss={() => {}} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the success variant with role="status"', () => {
    render(<Toast message="You're in!" variant="success" onDismiss={() => {}} />);

    const toast = screen.getByRole('status');
    expect(toast).toBeInTheDocument();
    expect(screen.getByText("You're in!")).toBeInTheDocument();
  });

  it('renders the error variant with role="alert"', () => {
    render(<Toast message="Something went wrong" variant="error" onDismiss={() => {}} />);

    const toast = screen.getByRole('alert');
    expect(toast).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('calls onDismiss when the close button is clicked', () => {
    const onDismiss = vi.fn();
    render(<Toast message="Error text" variant="error" onDismiss={onDismiss} />);

    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not call onDismiss until the close button is clicked', () => {
    const onDismiss = vi.fn();
    render(<Toast message="Error text" variant="error" onDismiss={onDismiss} />);

    expect(onDismiss).not.toHaveBeenCalled();
  });
});
