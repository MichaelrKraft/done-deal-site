# Adding a New Beta Brokerage

The landing page system is fully dynamic. Adding a new brokerage requires **no code changes** — just one SQL insert in Supabase.

## How it works

- Every brokerage gets a URL at `done-deal.co/beta/<slug>`
- The page is driven by a `beta_brokerages` row in the database
- Signups land in the shared `beta_signups` table, tagged by `brokerage_slug`

## Steps

### 1. Insert a row into `beta_brokerages`

Go to **Supabase → SQL Editor** and run:

```sql
insert into beta_brokerages (slug, name, short_name, badge_text, scarcity_label, free_deal_limit, source_tag, waitlist_message)
values (
  'compass',                                          -- URL slug: done-deal.co/beta/compass
  'Compass',                                          -- Full brokerage name
  'Compass',                                          -- Short name (used in metadata)
  'Compass — Exclusive Beta Offer',                   -- Badge shown in the hero
  'of 20 FREE deals remaining for the Compass cohort',-- Scarcity counter label
  20,                                                 -- Number of free deals to give away
  'compass-beta-2026',                                -- Source tag saved on each signup row
  'The free deals went fast — but you''re signed up. We''ll be in touch with a special offer just for Compass agents.'
);
```

Replace every `compass`/`Compass` value with the real brokerage details.

### 2. Share the URL

`done-deal.co/beta/<slug>`

That's it. The page is live immediately — no deploy needed.

## Fields reference

| Field | Purpose |
|---|---|
| `slug` | URL path segment — lowercase, no spaces (e.g. `exprealty`) |
| `name` | Full legal name shown on the page (e.g. `eXp Realty`) |
| `short_name` | Used in page `<title>` metadata |
| `badge_text` | Text inside the pill badge at the top of the hero |
| `scarcity_label` | Text next to the remaining-deals counter in the hero |
| `free_deal_limit` | How many signups get `free_deal = true` |
| `source_tag` | Saved on every signup row for analytics (e.g. `compass-beta-2026`) |
| `waitlist_message` | Shown to people who sign up after all free deals are claimed |

## To deactivate a brokerage

Set `active = false` — the page will return a 404:

```sql
update beta_brokerages set active = false where slug = 'compass';
```

## Existing brokerages

| Slug | URL | Notes |
|---|---|---|
| `yourcastle` | `done-deal.co/beta/yourcastle` | Original beta; `/yourcastle` redirects here |
| `exprealty` | `done-deal.co/beta/exprealty` | Cory Williams (eXp Realty) |

## Where to find the code

- Dynamic page: `src/app/beta/[slug]/page.tsx`
- Hero component: `src/components/sections/BetaHero.tsx`
- Signup form: `src/components/sections/BetaSignup.tsx`
- Count API: `src/app/api/beta/[slug]/count/route.ts`
- Signup API: `src/app/api/beta/[slug]/signup/route.ts`
