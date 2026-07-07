import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFound from '../not-found';

describe('NotFound (branded 404 page)', () => {
  it('renders without crashing', () => {
    render(<NotFound />);
  });

  it('shows the 404 heading and message', () => {
    render(<NotFound />);

    expect(screen.getByText('404 Error')).toBeInTheDocument();
    expect(screen.getByText(/page you're looking for doesn't exist/i)).toBeInTheDocument();
  });

  it('links back home and to contact', () => {
    render(<NotFound />);

    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /contact us/i })).toHaveAttribute(
      'href',
      '/contact'
    );
  });
});
