# NightAgent Report — done-deal-site (2026-11-27)

## Summary
Hardened the public API routes, which was the top of the plan's priority list. Added rate limits, input validation and HTML escaping to the signups, a rate limit and length cap on voice-demo, and honest errors on the count routes. Lint, `tsc --noEmit` and tests all pass. No `next build` was run, as instructed.

## Features Completed
None. This was a security and reliability pass only.

## Bugs Fixed
- `/api/voice-demo`: no rate limit, so anyone could spend the Gemini key. It now allows 20 requests/hour and 60/day per IP, caps text at 600 characters (413 above that), and returns 400 on bad JSON or a non-string `text`.
- `/api/beta/[slug]/signup` and `/api/yourcastle/signup`: no validation, and user text went unescaped into the welcome email and Telegram HTML. Now:
  - A shared `src/lib/signup-validation.ts` checks types, name length, email and phone format, and normalizes the input.
  - `escapeHtml` is applied to every user value in the email and Telegram messages.
  - Signups are limited to 5/hour per IP.
  - Bad JSON returns 400 instead of 500.
- Both count routes returned `claimed: 0` when Supabase failed, which looked like "all spots free". They now return 500, and the 4 components that show the remaining count treat a non-numeric value as unknown (null).
- `DotGrid.tsx`: fixed the lint error (`draw` referenced itself before its declaration finished) with a named function expression. Behavior is unchanged.

## Needs Owner Decision (deliberately not changed)
- Pricing conflict: $99/deal (Pricing), $50/deal (Stats) and $59/mo / $797 (`tasks/todo.md`). Billing is hands-off, so I did not change it.
- Fake testimonials naming real brokerages (Compass, KW, eXp, Sotheby's): remove or replace. This is a content and legal call.
- `/api/remy-chat` still trusts client-supplied `history`, so a client can forge assistant turns. The real fix is server-held or signed history, which is a design change. The existing rate limits and size caps remain.
- Privacy and Terms pages: footer links still point to `#`. Legal text is yours to supply.
- sitemap, robots and OG image: skipped because I could not verify the production domain from the repo (`layout.tsx` has no `metadataBase`).
- `/docs` page and the Reme knowledge layer are queued in `tasks/todo.md` as separate sprints and were not started.
- The in-memory rate limiter resets on cold start and is per instance; it is fine for abuse prevention but not strict accounting.
- The duplicate-email check then insert in the signup routes can race. A unique index on `(brokerage_slug, email)` would close it; I did not check the schema.

## Tests Added
4 (`src/lib/signup-validation.test.ts`), run with `npm test` (new script using Node's built-in `node --test`; no new dependency). Route handlers have no tests: they need Supabase and Resend mocks, which the repo has no framework for.

## Quality Gates (run at the end)
- `npm run lint`: 0 errors, 2 pre-existing warnings.
- `NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit`: exit 0.
- `npm test`: 4 pass, 0 fail.
- Not verified: the routes were not exercised against a running server, Supabase or Gemini. The `/api/voice-demo` and signup changes are checked only by type and lint.

## Launchability Score
60/100. The plan scored 58; the abuse holes are closed, but trust and legal gaps remain (fake testimonials, no Privacy or Terms, no docs, no SEO basics).

## Tomorrow's Top 3
1. Decide on the testimonials and pricing numbers, then add Privacy and Terms pages.
2. Add a sitemap, robots and OG metadata once the production domain is confirmed; fix the navbar `#pricing` to `/#pricing` and the dead footer links.
3. Build the `/docs` page, then decide how `remy-chat` history should be protected.

## Blockers
None blocking. The items above are owner decisions.
