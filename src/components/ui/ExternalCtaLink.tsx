'use client';

import { useEffect, useRef, useState } from 'react';
import { track } from '@vercel/analytics';
import Toast from '@/components/ui/Toast';
import { withUtm, type CtaCampaign } from '@/lib/externalCta';

interface ExternalCtaLinkProps {
  href: string;
  children: React.ReactNode;
  className: string;
  onClickTrack?: () => void;
  /** utm_campaign tag identifying this CTA's page/placement, e.g. "pricing_annual_standard". */
  campaign: CtaCampaign;
  /** Human-readable label for the analytics event, e.g. "Start Annual Standard". */
  ctaLabel: string;
}

/** How long to wait before assuming a click didn't navigate away (slow/unreachable app). */
const NAVIGATION_TIMEOUT_MS = 4000;

/**
 * CTA link to the external app.done-deal.info product. A plain <a> gives
 * zero feedback if that app is slow or unreachable — the tab just sits
 * there with no indication anything happened. This wraps the link with a
 * pending state on click and, if the page is still visible after a timeout
 * (navigation never happened), shows a specific, recoverable error with a
 * retry button and a plain-link fallback instead of leaving the user
 * staring at an unresponsive button.
 */
export default function ExternalCtaLink({
  href,
  children,
  className,
  onClickTrack,
  campaign,
  ctaLabel,
}: ExternalCtaLinkProps) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'timedOut'>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trackedHref = withUtm(href, campaign);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleClick = () => {
    track('external_cta_click', { campaign, ctaLabel });
    // Dedicated pricing-funnel event, tagged per tier, so pricing-page
    // conversion can be analyzed without filtering the general CTA stream.
    if (campaign.startsWith('pricing_')) {
      track('pricing_cta_click', { tier: campaign, ctaLabel });
    }
    onClickTrack?.();
    setStatus('pending');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    // If the browser is still on this page after the timeout, the
    // navigation to app.done-deal.info likely stalled or failed — surface
    // that instead of leaving the button silently "pending" forever.
    timeoutRef.current = setTimeout(() => {
      if (document.visibilityState === 'visible') {
        setStatus('timedOut');
      }
    }, NAVIGATION_TIMEOUT_MS);
  };

  return (
    <div>
      <a
        href={trackedHref}
        onClick={handleClick}
        aria-busy={status === 'pending'}
        className={`${className} ${status === 'pending' ? 'opacity-70 cursor-wait' : ''}`}
      >
        {status === 'pending' ? 'Opening…' : children}
      </a>
      {status === 'timedOut' && (
        <div className="mt-2">
          <Toast
            message="Done Deal is taking longer than expected to load. You can retry, or open it directly."
            variant="error"
            onDismiss={() => setStatus('idle')}
          />
          <a
            href={trackedHref}
            onClick={handleClick}
            className="mt-1 inline-block text-xs text-[#00BEFF] underline underline-offset-2 hover:text-white"
          >
            Try opening app.done-deal.info again
          </a>
        </div>
      )}
    </div>
  );
}
