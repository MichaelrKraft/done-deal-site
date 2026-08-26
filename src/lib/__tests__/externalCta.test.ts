import { describe, it, expect } from 'vitest';
import { withUtm } from '../externalCta';

describe('withUtm', () => {
  it('adds utm_source, utm_medium, and utm_campaign to a plain URL', () => {
    const result = withUtm('https://app.done-deal.info/signup', 'hero');
    const url = new URL(result);

    expect(url.searchParams.get('utm_source')).toBe('done-deal-site');
    expect(url.searchParams.get('utm_medium')).toBe('cta');
    expect(url.searchParams.get('utm_campaign')).toBe('hero');
    expect(url.origin + url.pathname).toBe('https://app.done-deal.info/signup');
  });

  it('preserves existing non-UTM query params', () => {
    const result = withUtm('https://app.done-deal.info/signup?ref=partner123', 'navbar_desktop');
    const url = new URL(result);

    expect(url.searchParams.get('ref')).toBe('partner123');
    expect(url.searchParams.get('utm_source')).toBe('done-deal-site');
    expect(url.searchParams.get('utm_medium')).toBe('cta');
    expect(url.searchParams.get('utm_campaign')).toBe('navbar_desktop');
  });

  it('overrides pre-existing UTM params with the canonical values', () => {
    const result = withUtm(
      'https://app.done-deal.info/signup?utm_source=old&utm_medium=email&utm_campaign=old_campaign',
      'final_cta'
    );
    const url = new URL(result);

    expect(url.searchParams.get('utm_source')).toBe('done-deal-site');
    expect(url.searchParams.get('utm_medium')).toBe('cta');
    expect(url.searchParams.get('utm_campaign')).toBe('final_cta');
    // Only one value per param, no duplicates from the override.
    expect(url.searchParams.getAll('utm_source')).toHaveLength(1);
  });

  it('handles a partial pre-existing UTM set (only utm_source present)', () => {
    const result = withUtm(
      'https://app.done-deal.info/signup?utm_source=old',
      'pricing_annual_standard'
    );
    const url = new URL(result);

    expect(url.searchParams.get('utm_source')).toBe('done-deal-site');
    expect(url.searchParams.get('utm_medium')).toBe('cta');
    expect(url.searchParams.get('utm_campaign')).toBe('pricing_annual_standard');
  });

  it('supports every documented CtaCampaign value', () => {
    const campaigns = [
      'navbar_desktop',
      'navbar_mobile',
      'hero',
      'final_cta',
      'competition_callout',
      'comparison_start_trial',
      'comparison_get_started',
      'benefits',
      'how_it_works_page',
      'how_it_works_section',
      'yourcastle_signup',
      'pricing_pay_per_transaction',
      'pricing_annual_standard',
      'pricing_annual_unlimited',
    ] as const;

    for (const campaign of campaigns) {
      const url = new URL(withUtm('https://app.done-deal.info/', campaign));
      expect(url.searchParams.get('utm_campaign')).toBe(campaign);
    }
  });

  it('returns a relative URL unchanged (no base to resolve against)', () => {
    const result = withUtm('/dashboard', 'hero');
    expect(result).toBe('/dashboard');
  });

  it('returns an empty string unchanged', () => {
    const result = withUtm('', 'hero');
    expect(result).toBe('');
  });

  it('returns a malformed URL unchanged rather than throwing', () => {
    const malformed = 'not a valid url ::';
    const result = withUtm(malformed, 'hero');
    expect(result).toBe(malformed);
  });
});
