import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import YourCastleLoading from '../loading';

describe('YourCastleLoading (route-level skeleton for /yourcastle)', () => {
  it('renders without crashing', () => {
    render(<YourCastleLoading />);
  });

  it('renders a pulse-animated skeleton container', () => {
    const { container } = render(<YourCastleLoading />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders only the above-the-fold hero skeleton (no interactive elements)', () => {
    const { container } = render(<YourCastleLoading />);
    expect(container.querySelectorAll('input, textarea, button, form, a').length).toBe(0);
  });

  it('renders a centered skeleton layout', () => {
    const { container } = render(<YourCastleLoading />);
    expect(container.querySelector('.text-center')).toBeInTheDocument();
  });
});
