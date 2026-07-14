import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactPage from '../page';

vi.mock('@vercel/analytics', () => ({
  track: vi.fn(),
}));

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Jane Agent' } });
  fireEvent.change(screen.getByLabelText(/email address/i), {
    target: { value: 'jane@example.com' },
  });
  fireEvent.change(screen.getByLabelText(/message/i), {
    target: { value: 'Tell me more about Done Deal.' },
  });
}

describe('ContactPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders without crashing', () => {
    render(<ContactPage />);
    expect(screen.getByRole('heading', { name: /book your free demo/i })).toBeInTheDocument();
  });

  it('shows validation errors when required fields are left empty', async () => {
    render(<ContactPage />);

    fireEvent.click(screen.getByRole('button', { name: /book my demo/i }));

    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Message is required')).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('shows a validation error for an invalid email address', async () => {
    render(<ContactPage />);

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Jane Agent' } });
    // Must satisfy the native `type="email"` constraint (local@domain) so
    // jsdom's built-in HTML5 validation doesn't block the submit event
    // before react-hook-form's stricter pattern check ever runs.
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'not@valid' },
    });
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Hello there' } });
    fireEvent.click(screen.getByRole('button', { name: /book my demo/i }));

    expect(await screen.findByText('Invalid email address')).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('submits successfully and shows the success state', async () => {
    render(<ContactPage />);

    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /book my demo/i }));

    expect(await screen.findByText(/thanks for reaching out!/i)).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/contact',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('lets the user send another message after a successful submission', async () => {
    render(<ContactPage />);

    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /book my demo/i }));

    await screen.findByText(/thanks for reaching out!/i);
    fireEvent.click(screen.getByRole('button', { name: /send another message/i }));

    expect(screen.getByRole('button', { name: /book my demo/i })).toBeInTheDocument();
  });

  it('shows an error toast and does not crash when the submission response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }));

    render(<ContactPage />);

    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /book my demo/i }));

    expect(
      await screen.findByText(/something went wrong\. please try again\./i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /book my demo/i })).toBeInTheDocument();
  });

  it('shows an error toast when the fetch call itself rejects (network failure)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    render(<ContactPage />);

    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /book my demo/i }));

    expect(
      await screen.findByText(/something went wrong\. please try again\./i)
    ).toBeInTheDocument();
  });

  it('re-enables the submit button after a failed submission', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }));

    render(<ContactPage />);

    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /book my demo/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /book my demo/i })).not.toBeDisabled();
    });
  });
});
