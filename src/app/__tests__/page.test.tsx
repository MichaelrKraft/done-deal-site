import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '../page';

vi.mock('@vercel/analytics', () => ({
  track: vi.fn(),
}));

describe('Home', () => {
  beforeEach(() => {
    // YourCastleSignup-style sections aren't on the homepage, but VoiceDemo
    // and other client sections may still hit the network on mount
    // (defensively stub fetch so no section throws on an unmocked call).
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
  });

  // Home renders a large tree (13+ sections, including animation/canvas-heavy
  // ones like Stats and VoiceDemo). The default 5000ms test timeout is fine in
  // isolation (~2s) but can be exceeded when this file runs alongside the full
  // suite and jsdom/module setup contends with other test files for CPU —
  // observed flaking only under full `vitest run`, never in isolation. Give
  // this specific first-render test more headroom rather than raising the
  // global timeout for every test.
  it('renders without crashing', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: /meet reme\./i })).toBeInTheDocument();
  }, 15000);

  it('renders the Organization and Service JSON-LD structured data script tags', () => {
    const { container } = render(<Home />);
    const scripts = container.querySelectorAll('script[type="application/ld+json"]');

    expect(scripts).toHaveLength(2);

    const payloads = Array.from(scripts).map((el) => JSON.parse(el.innerHTML));
    const orgLd = payloads.find((p) => p['@type'] === 'Organization');
    const serviceLd = payloads.find((p) => p['@type'] === 'Service');

    expect(orgLd).toMatchObject({
      '@context': 'https://schema.org',
      name: 'Done Deal',
      url: 'https://done-deal.co',
    });
    expect(serviceLd).toMatchObject({
      '@context': 'https://schema.org',
      serviceType: 'AI Transaction Coordination',
      name: 'Done Deal',
      provider: { '@type': 'Organization', name: 'Done Deal' },
    });
  });

  it('links the hero CTA to the app signup page', () => {
    render(<Home />);

    const signupLinks = screen.getAllByRole('link', { name: /start free trial/i });
    expect(signupLinks.length).toBeGreaterThan(0);
    expect(
      signupLinks.some((link) => link.getAttribute('href') === 'https://app.done-deal.info/signup')
    ).toBe(true);
  });

  it('renders the Voice Demo orb as an interactive element', () => {
    render(<Home />);
    expect(screen.getByRole('button', { name: /hear reme/i })).toBeInTheDocument();
  });
});
