/**
 * Shared helpers for outbound CTA links to the external product at
 * app.done-deal.info. Centralizes UTM tagging so every signup/login link
 * across the marketing site is attributable back to the page and CTA that
 * drove the click, and gives analytics events a consistent payload shape.
 */

/** utm_campaign values, one per distinct CTA placement on this site. */
export type CtaCampaign =
  | 'navbar_desktop'
  | 'navbar_mobile'
  | 'hero'
  | 'final_cta'
  | 'competition_callout'
  | 'comparison_start_trial'
  | 'comparison_get_started'
  | 'benefits'
  | 'how_it_works_page'
  | 'how_it_works_section'
  | 'yourcastle_signup'
  | 'pricing_pay_per_transaction'
  | 'pricing_annual_standard'
  | 'pricing_annual_unlimited';

/**
 * Appends utm_source/utm_medium/utm_campaign query params to an
 * app.done-deal.info URL so the external app can attribute signups back to
 * the referring page/CTA. Leaves non-matching URLs untouched.
 */
export function withUtm(href: string, campaign: CtaCampaign): string {
  try {
    const url = new URL(href);
    url.searchParams.set('utm_source', 'done-deal-site');
    url.searchParams.set('utm_medium', 'cta');
    url.searchParams.set('utm_campaign', campaign);
    return url.toString();
  } catch {
    // Not a valid absolute URL — return unchanged rather than throw.
    return href;
  }
}
