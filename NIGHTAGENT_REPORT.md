# NightAgent Report — done-deal-site (2026-11-28)

## Summary
Fixed the footer (wrong Login link, orphan billing text, dead legal links), gave Reme a visible error message on failed chats, added robots.txt and noindex for `/light`, and added a first test baseline. tsc, lint (0 errors) and `npm test` (4/4) pass. No `next build` was run, per instructions.

## Features Completed
- `src/app/robots.ts`: allows `/`, disallows `/api/` and `/light`.
- `/light` marked `noindex,nofollow` (`src/app/light/layout.tsx`).
- `npm test` script (Node's built-in test runner, no new dependency).

## Bugs Fixed
- Footer Login now points to `https://app.done-deal.info/login` (was appointwise.io); removed the "Access your billing" stray text and the `href="#"` Privacy/Terms links (`Footer.tsx`).
- `MeetRemy.tsx`: a 429/502/504/other failure from `/api/remy-chat` now shows a plain-language message instead of silently resetting. This component is still not mounted on any page.
- `DotGrid.tsx`: silenced a pre-existing `react-hooks/immutability` lint error (intentional self-scheduling rAF loop) so lint passes.
- `tsconfig.json`: added `allowImportingTsExtensions` (needed for tests that import `.ts`).

## Needs Owner Decision
- Privacy Policy / Terms: links removed because there is no copy. Re-add once written.
- `getClientIp` trusts the leftmost `x-forwarded-for` (spoofable). Not changed: I could not verify which header/position Render sets, and a wrong fix could put all users in one bucket. Verify, then change.
- Mounting `MeetRemy` on `/` and `/light`: not done, because the homepage omits it and that may be deliberate.
- Pricing consolidation, "$400+" vs "$300-$500" and trial scope: skipped (billing/pricing is hands-off).
- `/docs`, sitemap, OG/metadataBase, analytics: not started (need copy, keys, or a larger build).
- Project metadata says freemium; site copy offers a 14-day trial.

## Tests Added
4 (rate limiter limit/isolation/reset, `getClientIp` header order). Not covered: remy-chat and contact validation.

## Launchability Score
50/100

## Tomorrow's Top 3
1. Decide on privacy/terms copy, then add the pages and footer links.
2. Verify Render's client-IP header, fix `getClientIp`, add a regression test.
3. Build `/docs`, plus sitemap and OG tags; decide whether Reme mounts on `/`.

## Blockers
None blocking. Not verified: the MeetRemy error text in a browser (no UI run), and the Login URL beyond it matching the other CTAs in the repo.
