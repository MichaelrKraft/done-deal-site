import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ContactLoading from '../loading';

describe('ContactLoading (route-level skeleton for /contact)', () => {
  it('renders without crashing', () => {
    render(<ContactLoading />);
  });

  it('renders a pulse-animated skeleton container', () => {
    const { container } = render(<ContactLoading />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders skeleton placeholders for the form fields and submit button', () => {
    const { container } = render(<ContactLoading />);
    // 4 grid field placeholders + 1 message textarea placeholder + 1 submit button placeholder
    const fieldPlaceholders = container.querySelectorAll('.grid > div');
    expect(fieldPlaceholders.length).toBe(4);
  });

  it('does not render any real form controls (pure skeleton, no interactive elements)', () => {
    const { container } = render(<ContactLoading />);
    expect(container.querySelectorAll('input, textarea, button, form').length).toBe(0);
  });
});
