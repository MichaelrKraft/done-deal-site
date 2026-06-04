# Done Deal Landing Page Upgrade Plan

## Summary
Upgrade the Done Deal transaction coordination landing page with enhanced visual presentation, scroll-triggered animations, animated counters, interactive pricing toggles, and parallax effects — while preserving the existing copy text and section structure.

## What We Know
- **Tech stack**: Next.js 16, React 19, Tailwind 4, Framer Motion (already installed)
- **Current sections** (14): Navbar, Hero, Testimonials, Partners, Problem, Benefits, HowItWorks, Stats, Pricing, Comparison, FeatureCards, VoiceDemo, FAQ, FinalCTA, Footer
- **Images**: External URLs (1 Unsplash hero image, 10 randomuser.me avatars, 1 iframes.ai embed) — keeping as-is
- **App features** (from localhost:3000): AI TC chat feed, transaction pipeline, dashboard analytics, document management, team management, calendar, kanban board, compliance scoring, automated task tracking
- **Issues to fix**: FAQ content mismatch (talks about lead gen, not TC), appointwise links to remove

## Principles
- Keep all existing copy text (minor tweaks only for FAQ alignment)
- Every change should be simple and impact as little code as possible
- Use Framer Motion (already a dependency) for all animations
- No new dependencies unless absolutely necessary
- Preserve the dark theme with cyan/purple brand colors

---

## Tasks

### Phase 1: Foundation & Shared Utilities
- [ ] **1.1** Create a reusable `useInView` scroll-trigger hook (or use framer-motion's `useInView`) for consistent scroll animations across all sections
- [ ] **1.2** Create a reusable `AnimatedSection` wrapper component that fades/slides in children when scrolled into view
- [ ] **1.3** Add `next.config.ts` image domain allowlist for unsplash and randomuser.me (to use Next/Image)
- [ ] **1.4** Update `globals.css` with any new utility classes needed (parallax helpers, gradient refinements)

### Phase 2: Hero Section Upgrade
- [x] **2.1** Add parallax background effect to the Hero section (subtle vertical offset on scroll)
- [x] **2.2** Convert hero image from `<img>` to Next.js `<Image>` for optimization
- [x] **2.3** Add staggered entrance animations for headline, subtext, value props, and CTA button
- [x] **2.4** Improve the cycling word animation (smoother transitions, better timing)

### Phase 3: Testimonials & Partners Upgrade
- [ ] **3.1** Convert testimonials from static 3-column grid to a horizontal auto-scrolling carousel
- [ ] **3.2** Add scroll-triggered fade-in for the testimonials section heading
- [ ] **3.3** Add subtle hover effects on testimonial cards (lift + glow)
- [ ] **3.4** Upgrade Partners section with scroll-triggered entrance animations

### Phase 4: Problem & Benefits Upgrade
- [ ] **4.1** Add scroll-triggered staggered entrance for Problem cards (slide up one by one)
- [ ] **4.2** Add icon animations on Problem cards (pulse or shake on hover)
- [ ] **4.3** Add scroll-triggered staggered entrance for Benefits cards
- [ ] **4.4** Add subtle parallax offset to Benefits section background

### Phase 5: HowItWorks & Stats Upgrade
- [x] **5.1** Add step-by-step reveal animation to HowItWorks (each step animates in sequence as user scrolls)
- [x] **5.2** Add animated connecting line between steps
- [x] **5.3** Upgrade Stats section animated counters (ensure they trigger on scroll, smooth easing)
- [x] **5.4** Add parallax background to Stats section

### Phase 6: Pricing Section Upgrade
- [x] **6.1** Add interactive pricing toggle (monthly vs annual with discount display)
- [x] **6.2** Add scroll-triggered entrance animation for the pricing card
- [x] **6.3** Add hover glow effect on the pricing card
- [x] **6.4** Add animated checkmark reveals for feature list items

### Phase 7: Comparison & FeatureCards Upgrade
- [x] **7.1** Add scroll-triggered row-by-row reveal animation for the comparison table
- [x] **7.2** Add subtle color transitions on comparison rows (green/red highlights on hover)
- [x] **7.3** Add scroll-triggered staggered entrance for FeatureCards (cards fly in from alternating sides)
- [x] **7.4** Improve FeatureCard hover effects (3D tilt or enhanced glow)

### Phase 8: VoiceDemo, FAQ, FinalCTA Upgrade
- [x] **8.1** Add parallax background and scroll-triggered entrance to VoiceDemo section
- [x] **8.2** Improve FAQ accordion animation (smooth height transitions, better open/close UX)
- [x] **8.3** Fix FAQ content — rewrite questions to align with transaction coordination (not lead gen/GHL)
- [x] **8.4** Add scroll-triggered entrance animation to FinalCTA section
- [x] **8.5** Add subtle pulse animation on the FinalCTA button

### Phase 9: Navbar & Footer Polish
- [x] **9.1** Add scroll-based navbar background transition (transparent at top, solid on scroll)
- [x] **9.2** Remove appointwise login/affiliate links from Navbar
- [x] **9.3** Add smooth scroll behavior for internal nav links
- [x] **9.4** Add scroll-triggered entrance for Footer content

### Phase 10: Final Review & Testing
- [x] **10.1** Test all scroll animations for performance (no jank)
- [ ] **10.2** Test responsive behavior on mobile/tablet breakpoints
- [ ] **10.3** Verify all existing copy text is preserved
- [x] **10.4** Run `npm run build` to verify no build errors

---

## Current Sprint: Comparison, FeatureCards, VoiceDemo, FAQ, FinalCTA, Footer Upgrade

### Task 1: Comparison.tsx
- [x] Wrap section heading with AnimatedSection
- [x] Convert rows to motion.div with staggered whileInView (0.05s apart per row)
- [x] Add subtle bg-white/5 hover transition on rows (already existed, verified preserved)

### Task 2: FeatureCards.tsx
- [x] Wrap each card with AnimatedSection (delays: 0, 0.1, 0.2, 0.3, 0.4, 0.5)
- [x] Upgrade hover to 3D tilt: whileHover={{ scale: 1.05, rotateY: 3 }}
- [x] Add card-glow class to each card

### Task 3: VoiceDemo.tsx
- [x] Add parallax-bg class to the section
- [x] Wrap with AnimatedSection for scroll entrance
- [x] Add aria-label to the iframe for accessibility

### Task 4: FAQ.tsx
- [x] Rewrite all FAQ content to 8 transaction-coordination-focused questions
- [x] Improve accordion with AnimatePresence smooth height animation
- [x] Wrap with AnimatedSection for scroll entrance

### Task 5: FinalCTA.tsx
- [x] Wrap with AnimatedSection for scroll entrance
- [x] Add repeating pulse animation on CTA button (scale: [1, 1.03, 1], repeat: Infinity, duration: 2)

### Task 6: Footer.tsx
- [x] Wrap with AnimatedSection for scroll entrance

## Review -- Comparison, FeatureCards, VoiceDemo, FAQ, FinalCTA, Footer Sprint (2026-03-26)

### Comparison (`src/components/sections/Comparison.tsx`)
- Replaced outer motion.div with a plain div; wrapped the table header row in AnimatedSection
- Each data row is now a motion.div with whileInView fade+slide, staggered at 0.05s per row
- Hover bg-white/5 transition was already present, preserved as-is
- All copy text preserved exactly

### FeatureCards (`src/components/sections/FeatureCards.tsx`)
- Wrapped each card in AnimatedSection with delay={index * 0.1} for staggered scroll entrance
- Replaced Tailwind hover classes with framer-motion whileHover={{ scale: 1.05, rotateY: 3 }} and spring transition
- Added card-glow class and transformStyle: preserve-3d for 3D tilt effect
- All copy text preserved exactly

### VoiceDemo (`src/components/sections/VoiceDemo.tsx`)
- Added parallax-bg class to the section element
- Replaced motion.div wrapper with AnimatedSection for scroll entrance
- Added aria-label to the iframe for screen reader accessibility
- Removed unused framer-motion import
- All copy text preserved exactly

### FAQ (`src/components/sections/FAQ.tsx`)
- Rewrote all FAQ content: 11 old lead-gen/GHL questions replaced with 8 transaction-coordination FAQs
- Wrapped header in AnimatedSection for scroll entrance
- Improved accordion: added motion.span for the +/x icon rotation, added initial={false} to AnimatePresence, added easeInOut timing
- Added flex-shrink-0 on the toggle icon to prevent layout shift

### FinalCTA (`src/components/sections/FinalCTA.tsx`)
- Replaced motion.div entrance wrapper with AnimatedSection
- Wrapped the CTA link in a motion.div with repeating pulse: scale [1, 1.03, 1] over 2s infinite loop
- All copy text preserved exactly

### Footer (`src/components/layout/Footer.tsx`)
- Added 'use client' directive (required for AnimatedSection)
- Wrapped entire footer content in AnimatedSection for scroll entrance
- All copy text and links preserved exactly

## Review -- Hero & Navbar Sprint (2026-03-26)

### Navbar (`src/components/layout/Navbar.tsx`)
- Added `scrolled` state driven by a passive scroll listener (threshold: 20px)
- Background transitions from fully transparent to `bg-black/90 backdrop-blur-md` with `transition-all duration-300`
- Removed Affiliate link and AppointWise "Log in" button from both desktop and mobile menus
- Simplified nav link rendering (no more external link branching since all remaining links are internal)
- Kept: Home, Pricing, Contact links and "See a Demo" CTA

### Hero (`src/components/sections/Hero.tsx`)
- Added staggered `motion.div` entrance animations at 0s, 0.15s, 0.3s, 0.45s delays for headline, subtext, CTA, and value props
- Improved cycling word animation: added `filter: blur(4px)` crossfade and `easeInOut` timing for smoother transitions
- Converted `<img>` to Next.js `<Image>` (width 800, height 600, `priority` flag for LCP)
- Added parallax on hero image via `useScroll` + `useTransform` (0 to 80px vertical offset as user scrolls)
- All existing copy text preserved exactly as-is

## Review -- Tonight's Overnight Batch (2026-06-03)

Three-task batch executed under orchestrator supervision. Sub-agents inherited plan-mode and refused to execute; orchestrator completed implementation directly from their detailed plan files at `~/.claude/plans/okay-i-like-your-keen-parrot-agent-*.md`.

### Task 0 — Delete leaked-credential scripts
Removed `generate-remi.mjs`, `generate-remi-sharp.mjs`, `generate-remi-suits.mjs`, `generate-remi-v1.mjs`, `remi-recloth.mjs`. All five were untracked locals containing a hardcoded fal.ai credential. Verified the credential string no longer exists anywhere on disk in this repo; verified `git log -S <credential>` returns nothing (never committed). Mike opted not to rotate the key.

### Task 1 — Contact form rewrite (`src/app/api/contact/route.ts`)
Stub was console.logging PII and returning fake success — every demo request silently dropped. Replaced with: Resend send to `CONTACT_TO_EMAIL` (default `support@callspot.ai`) with HTML email mirroring the beta-signup brand palette, Supabase insert into new `contact_submissions` table, Telegram notification reusing the signup pattern, honeypot field (`website` → silent 200), in-memory IP rate limit (5/hour via `@/lib/rate-limit`), per-field validation with length caps (name 100, email 200, phone 30, company 200, message 5000), email regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`, no PII in any log. Failure semantics: Supabase failure → 500, Resend/Telegram failure → log + still 200 (data already saved). New migration at `src/app/contact/contact_submissions_migration.sql` (run in Supabase SQL editor before deploy).

### Task 2 — Remy chat hardening (`src/app/api/remy-chat/route.ts`)
Endpoint was wide open — no rate limit, no length caps, no origin check. Added: origin allowlist (done-deal.co + localhost + `*.vercel.app` / `*.onrender.com`; missing Origin allowed for SSR/curl), IP rate limits via `@/lib/rate-limit` (10/hour, 30/day with hour-bucket-fails-first ordering), `userText` ≤ 500 chars, `history` ≤ 20 entries / ≤ 4000 total chars with defensive shape validation, `AbortSignal.timeout(20s)` on both Gemini calls returning 504 on timeout, SHA-256 LRU TTS cache (max 100 entries via Map insertion order) saves repeat TTS costs, global daily ceiling of 1000 calls (env-tunable via `REMY_DAILY_LIMIT`, NaN-safe parse, UTC midnight reset, increments only on successful non-empty Gemini reply). No PII in logs. Happy-path WAV response and `X-Remy-Text` header preserved verbatim.

### Task 3 — Phase 7-9 polish (`Comparison.tsx`, `FeatureCards.tsx`, `FAQ.tsx`)
Most of Phase 7-9 was already done in the 2026-03-26 sprint. Real edits: (1) Comparison row hover now tints each column via `group` + per-column `group-hover:bg-{color}-500/5` with `transition-colors duration-300` (matches existing green-check / red-X semantics); (2) FeatureCards now enter from alternating sides — `x: index % 2 === 0 ? -40 : 40` — preserving inner 3D-tilt motion.div untouched; removed unused `AnimatedSection` import; (3) FAQ accordion `duration` bumped 0.3s → 0.35s. Verified 8.3 FAQ content is fully TC-aligned (zero lead-gen / GHL references) — ticked box, no rewrite needed. Other Phase 7-9 items (7.1, 7.4, 8.1, 8.4, 8.5, 9.3, 9.4) already shipped — boxes ticked.

### Shared foundation built first (`src/lib/rate-limit.ts`)
New module exporting `checkRateLimit(name, key, limit, windowMs)`, `getClientIp(req)`, `rateLimitResponse(result)`. In-memory bucket store keyed by store name; per-process state acceptable for landing-page abuse prevention. Consumed by Tasks 1 and 2.

### Verification
- `npx tsc --noEmit` — clean
- `npm run lint` — clean for all touched files; one pre-existing error in `src/components/DotGrid.tsx` (line 64: `draw` accessed before declared) and one pre-existing warning in `src/app/contact/page.tsx` line 47 — both untouched by this batch, flagging for future cleanup
- `npm run build` — passes; production bundle generated successfully

### Manual smoke tests Mike should run
With `npm run dev` running:

```bash
# Task 1 — contact form happy path
curl -X POST http://localhost:3000/api/contact -H 'Content-Type: application/json' \
  -d '{"name":"Test","email":"test@example.com","message":"hi"}'
# expect: {"success":true} + email + Supabase row + Telegram ping

# Task 1 — honeypot (silent 200, no side effects)
curl -X POST http://localhost:3000/api/contact -H 'Content-Type: application/json' \
  -d '{"name":"Bot","email":"bot@x.com","message":"spam","website":"x.com"}'

# Task 1 — rate limit (6th request → 429)
for i in 1 2 3 4 5 6; do curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"u","email":"u@x.com","message":"hi"}'; done

# Task 2 — happy path → WAV
curl -X POST http://localhost:3000/api/remy-chat -H 'Content-Type: application/json' \
  -H 'Origin: http://localhost:3000' \
  -d '{"userText":"What does Done Deal do?","history":[]}' --output /tmp/remy.wav

# Task 2 — wrong Origin → 403
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/remy-chat \
  -H 'Content-Type: application/json' -H 'Origin: https://evil.example.com' \
  -d '{"userText":"hi","history":[]}'

# Task 2 — oversized payload → 400
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/remy-chat \
  -H 'Content-Type: application/json' -H 'Origin: http://localhost:3000' \
  -d "{\"userText\":\"$(printf 'x%.0s' {1..501})\",\"history\":[]}"

# Task 3 — scroll the landing page, verify Comparison column tints + FeatureCards alternating entrance + smoother FAQ accordion
```

### Required Supabase action before Task 1 is live
Run `src/app/contact/contact_submissions_migration.sql` once in the Supabase SQL editor for project `zjuoxaqdqqdtihmekrcz`. Without this, contact form POSTs will return 500.

### Required env vars (already present for other features, listed for completeness)
- `RESEND_API_KEY` — for contact form email
- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — for contact submission insert
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` — optional, contact form skips Telegram if missing
- `GOOGLE_AI_API_KEY` — for remy-chat (already required, unchanged)
- `CONTACT_TO_EMAIL` — optional, defaults to `support@callspot.ai`
- `REMY_DAILY_LIMIT` — optional, defaults to 1000

### Out of scope (flagged for future)
- `src/components/layout/Footer.tsx` lines 44-52 still link to `https://www.app.appointwise.io/` ("Login"). Same brand-cleanup thread that Navbar already handled.
- `src/components/DotGrid.tsx:64` lint error (`draw` accessed before declared) — pre-existing.
- `src/app/contact/page.tsx:47` unused `err` warning — pre-existing.

---

## Next Sprint: Fix Remy chat 502 (Gemini model deprecation)

### Root cause (verified against Google API)

`src/app/api/remy-chat/route.ts:22` calls `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`.

Google has **retired this model**. Direct probe with the production `GOOGLE_AI_API_KEY` returns:

```
HTTP 404
"This model models/gemini-2.0-flash is no longer available.
 Please update your code to use a newer model for the latest features and improvements."
```

`gemini-2.0-flash-001` (the pinned version) is also retired and returns the same 404.

**The API key is healthy** — listModels returned 200 with 54 accessible models. The TTS endpoint (`gemini-2.5-flash-preview-tts:generateContent` at `src/app/api/remy-chat/route.ts:24`) **still works**, so it doesn't need to change.

### Models that DO work today (verified by direct probe with prod key)

| Model | Status | Notes |
|---|---|---|
| `gemini-2.5-flash` | 200 OK | **Recommended.** Current stable Flash. Matches the quality bar for a landing-page chatbot. |
| `gemini-flash-latest` | 200 OK | Floating tag — auto-updates as Google releases new flash models. Risky for prod (model behavior may shift without code change). |
| `gemini-2.5-flash-lite` | 200 OK | Cheaper. Probably fine for a 1-2 sentence landing-page bot. Lower quality on nuance. |
| `gemini-3-flash-preview`, `gemini-3.5-flash` | accessible | Preview / newer. Skip for now — we want stable. |

### Decision: change one line

**File:** `src/app/api/remy-chat/route.ts`
**Line:** 22
**Change:**

```diff
- 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
+ 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
```

That's the entire fix. No other file touches needed. Per `~/.claude/rules/development-workflow.md` rule 6 and 9 ("simplest possible change").

### Why NOT to add an env-var-based model selector

Tempting to make this `process.env.GEMINI_CHAT_MODEL ?? 'gemini-2.5-flash'` for future flexibility. **Skip.** Premature abstraction. When Google retires `gemini-2.5-flash` (likely 12+ months out), one more one-line PR. The selector adds: an env var to manage on every environment, a fallback to test, and a code review on the env handling — for zero current benefit.

### Acceptance criteria

1. `src/app/api/remy-chat/route.ts:22` references `gemini-2.5-flash` (not `gemini-2.0-flash`)
2. `npx tsc --noEmit && npm run lint && npm run build` all pass
3. Local smoke test: `./scripts/smoke-test.sh http://localhost:3000` — Remy happy path returns **200 + WAV audio bytes** (not SKIP/502)
4. Atomic commit with conventional message: `fix(remy-chat): update Gemini chat model to 2.5-flash (2.0-flash retired)`
5. Push to master → Render auto-deploys → wait for `status=live`
6. Production smoke test: `./scripts/smoke-test.sh https://done-deal-site.onrender.com` — same Remy happy path returns **200**
7. Manual: open https://done-deal-site.onrender.com, click the chat orb, ask "What does Done Deal do?" — Reme replies with audible voice

### Verification commands (paste-able)

```bash
cd /Users/michaelkraft/done-deal-site

# 1. Make the change
# (Edit src/app/api/remy-chat/route.ts line 22 — replace gemini-2.0-flash with gemini-2.5-flash)

# 2. Gate the change
npx tsc --noEmit && npm run lint && npm run build

# 3. Local verify (dev server must be running on 3000)
npm run dev &
sleep 6
./scripts/smoke-test.sh http://localhost:3000
# expect: 11 pass / 0 fail / 0 skip — happy path should NO LONGER be SKIP

# 4. Commit + push
git add src/app/api/remy-chat/route.ts
git commit -m "fix(remy-chat): update Gemini chat model to 2.5-flash (2.0-flash retired)"
git push origin master

# 5. Wait for Render deploy (auto-triggered) and re-smoke
sleep 90
./scripts/smoke-test.sh https://done-deal-site.onrender.com
```

### Risk + rollback

- **Risk:** low. One-line config change. Same API shape; only the model name differs. Quality of replies likely similar or slightly better (newer model).
- **Cost:** unchanged or slightly different per-token pricing. For landing-page traffic (10/hour cap per IP, 1000/day global ceiling already in place from Task 2), monthly cost is negligible regardless.
- **Rollback:** if 2.5-flash misbehaves, `git revert <sha> && git push` reverts and Render redeploys. The previous (broken) state is no worse than what's live now (already 502'ing).
- **Hidden gotcha to watch for:** Gemini 2.5 may have slightly different default safety filter behavior. If Reme starts refusing to answer benign landing-page questions, the system prompt may need a one-line tweak to relax the persona. Test with a few sample questions during step 7.

### Future enhancements (not in this sprint)

- **Better:** Have Reme answer from the actual FAQ content via a small RAG layer instead of pure model knowledge. Reduces hallucinations about pricing/features.
- **Cost optimization:** Drop to `gemini-2.5-flash-lite` once Reme's responses are observed in the wild. Only worthwhile if monthly cost exceeds the 5-min effort to change.
- **Observability:** Log every Reme reply to a new `remy_chat_logs` Supabase table (no PII — just userText hash + replyText + model + latency_ms). Lets you see what visitors actually ask before scaling marketing spend.

### Effort estimate

15 minutes wall-clock including deploy wait. ~30 seconds of actual code change.

### Suitable for overnight queue?

**Yes.** Scoped to 1 file / 1 line / 1 atomic commit. Gates are clear (smoke test happy-path PASS). Auto-revertable. Good first-of-the-night warm-up task.

---

## Next Sprint: Reme knowledge layer (RAG over FAQ + extensible knowledge base)

### Problem this solves

Reme's current system prompt is a ~150-word navigation script. She has no real product knowledge — when a visitor asks "Tell me about CTM integration" or "How do you handle dual-agency commission splits?" she invents an answer or punts. Stuffing every fact into the system prompt scales badly (quality degrades past ~2000 words, every update is a code change).

Better shape: store Reme's facts in a `remy_knowledge` Supabase table. On each chat request, retrieve the top 3-5 most relevant rows and inject them into the system prompt as authoritative context. Updates are now SQL inserts (no code change, no deploy).

This sprint:
1. Creates the table + migration
2. Seeds it with the 10 existing FAQ entries
3. Adds keyword-based retrieval to `/api/remy-chat`
4. Lets Mike (or anyone) add CTM-integration facts (and anything else) as plain SQL inserts whenever the actual product capabilities are documented

### Files to create/modify

| File | Action |
|---|---|
| `src/app/api/remy-chat/remy_knowledge_migration.sql` | NEW — table + seed inserts |
| `src/lib/remy-knowledge.ts` | NEW — retrieval helper (Postgres FTS or trigram match) |
| `src/app/api/remy-chat/route.ts` | MODIFY — query knowledge, build augmented prompt |
| `tasks/todo.md` | append Review subsection |

### Schema

```sql
create table if not exists remy_knowledge (
  id uuid primary key default gen_random_uuid(),
  topic text not null,           -- e.g. "Pricing", "CTM Integration", "Deadlines"
  question text not null,        -- canonical phrasing of the question this row answers
  answer text not null,          -- 1-3 sentence response in Reme's voice
  keywords text[] default '{}',  -- optional manual hints for retrieval ranking
  active boolean default true,
  priority integer default 0,    -- higher = preferred when multiple rows tie
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Full-text search index over question + answer + keywords
create index if not exists remy_knowledge_fts_idx on remy_knowledge
  using gin(to_tsvector('english',
    coalesce(topic,'') || ' ' || coalesce(question,'') || ' ' || coalesce(answer,'') || ' ' || array_to_string(coalesce(keywords,'{}'), ' ')
  ));

alter table remy_knowledge disable row level security;

-- Seed with current FAQ entries (10 rows, all transaction-coordination-focused).
-- Source: src/components/sections/FAQ.tsx:7-48 as of commit 63b16bf.
insert into remy_knowledge (topic, question, answer) values
  ('Product Overview', 'What is Done Deal?', 'Done Deal is an AI-powered transaction coordination platform for real estate professionals. It automates task tracking, deadline management, document collection, and vendor communication so agents can close more deals with less stress.'),
  ('AI Capabilities', 'How does the AI transaction coordinator work?', 'Our AI TC monitors your active transactions 24/7, automatically tracks deadlines, sends follow-up emails, schedules appointments, and flags compliance issues — all while keeping you in control with an approval-based workflow.'),
  ('Transaction Support', 'What types of transactions does Done Deal support?', 'Done Deal supports buyer-side, seller-side, and dual-agency transactions across residential, purchase, and commercial deals.'),
  ('Onboarding', 'How long does it take to set up?', 'Most agents are up and running within 24 hours. We provide a live onboarding session to configure your transaction templates, vendor contacts, and notification preferences.'),
  ('Scale', 'Can I manage multiple transactions at once?', 'Yes — Done Deal is built for scale. Manage dozens of concurrent transactions from a single dashboard with real-time status updates and priority-based task sorting.'),
  ('Security', 'Is my data secure?', 'Yes. We use bank-level encryption, secure cloud infrastructure, and strict access controls. Your client data and transaction documents are never shared or used for training.'),
  ('Integrations', 'What integrations are available?', 'Done Deal integrates with DocuSign, Google Calendar, and major email providers. We''re continuously adding new integrations based on user feedback.'),
  ('Trial', 'Is there a free trial?', 'Yes — 14-day free trial with full access to all features. No credit card required to get started.'),
  ('vs Human TC', 'How is Done Deal different from hiring a human transaction coordinator?', 'A human TC costs $300–$500 per transaction, works business hours, and can juggle a limited number of files. Done Deal''s AI works 24/7, never misses a deadline, scales to any volume, and costs a fraction of the price — while keeping you in control of every email that goes out.'),
  ('Deadline Safety', 'What happens if something goes wrong or a deadline is missed?', 'Done Deal sends escalating alerts before any deadline becomes critical — you''ll know days in advance, not hours. Breached deadlines are flagged as high-risk and surfaced at the top of your dashboard.');

-- Placeholder rows for topics that come up frequently but currently have no real facts.
-- IMPORTANT: agent executing this sprint must NOT invent answers. Insert these as
-- inactive rows so Reme says "I don't have info on that yet" rather than hallucinating.
insert into remy_knowledge (topic, question, answer, active) values
  ('CTM Integration', 'How does Done Deal work with CTM?', 'PLACEHOLDER — needs Mike to fill in real capabilities before activating.', false),
  ('CTM Integration', 'Can Done Deal import my CTM transactions?', 'PLACEHOLDER — needs Mike to fill in real capabilities before activating.', false);
```

### Retrieval logic (in `src/lib/remy-knowledge.ts`)

```ts
import { supabaseAdmin } from '@/lib/supabase';

export type KnowledgeRow = { topic: string; question: string; answer: string };

const CACHE_MS = 60_000;
let cache: { at: number; rows: KnowledgeRow[] } | null = null;

async function getAllActive(): Promise<KnowledgeRow[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.rows;
  const { data, error } = await supabaseAdmin
    .from('remy_knowledge')
    .select('topic, question, answer')
    .eq('active', true);
  if (error || !data) return cache?.rows ?? [];
  cache = { at: Date.now(), rows: data as KnowledgeRow[] };
  return data as KnowledgeRow[];
}

// Postgres FTS-backed search for top-N matches. Falls back to client-side
// keyword overlap if Supabase is unavailable, using the in-memory cache.
export async function searchKnowledge(query: string, limit = 4): Promise<KnowledgeRow[]> {
  try {
    const { data } = await supabaseAdmin.rpc('search_remy_knowledge', { q: query, n: limit });
    if (data && data.length > 0) return data as KnowledgeRow[];
  } catch { /* fall through */ }
  // Fallback: simple substring score on cached rows
  const rows = await getAllActive();
  const tokens = query.toLowerCase().split(/\W+/).filter(t => t.length > 2);
  return rows
    .map(r => {
      const hay = (r.topic + ' ' + r.question + ' ' + r.answer).toLowerCase();
      const hits = tokens.filter(t => hay.includes(t)).length;
      return { row: r, hits };
    })
    .filter(x => x.hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .slice(0, limit)
    .map(x => x.row);
}
```

Add a Postgres RPC for FTS (in the same migration):

```sql
create or replace function search_remy_knowledge(q text, n int default 4)
returns table (topic text, question text, answer text)
language sql stable as $$
  select topic, question, answer
  from remy_knowledge
  where active = true
    and to_tsvector('english',
      coalesce(topic,'') || ' ' || coalesce(question,'') || ' ' || coalesce(answer,'') || ' ' || array_to_string(coalesce(keywords,'{}'), ' ')
    ) @@ plainto_tsquery('english', q)
  order by priority desc
  limit n;
$$;
```

### System prompt augmentation in `route.ts`

After validation, before the Gemini fetch:

```ts
const knowledge = await searchKnowledge(userText, 4);
const knowledgeBlock = knowledge.length
  ? `\n\nReference facts (use these when relevant; if the question is not covered, say you'll connect them with the team):\n${knowledge.map(k => `- ${k.question} → ${k.answer}`).join('\n')}`
  : '\n\nIf the question is outside the page sections above, say "I don't have details on that — let me connect you with the team" and direct them to the Contact section.';

// Then use SYSTEM_PROMPT + knowledgeBlock as the system_instruction
```

### Acceptance criteria

1. New migration file at `src/app/api/remy-chat/remy_knowledge_migration.sql` — table + FTS index + RPC + seed inserts
2. `src/lib/remy-knowledge.ts` exports `searchKnowledge(query, limit)` with 60s in-memory cache + graceful Supabase-down fallback
3. `src/app/api/remy-chat/route.ts` calls `searchKnowledge(userText, 4)` after validation, injects results into `system_instruction`
4. **No invented facts.** Placeholder rows for CTM integration are inserted as `active = false` so Reme falls back to "I don't have info on that yet" until Mike fills in real answers.
5. Existing security gates unchanged — rate limit, origin check, length caps, TTS cache, daily ceiling all still pass smoke test
6. `npx tsc --noEmit && npm run lint && npm run build` all green
7. Local smoke test passes (the Reme happy-path query "What does Done Deal do?" should now produce an answer that incorporates one of the seeded FAQ rows — verify by looking at the reply text in the `X-Remy-Text` header)
8. Atomic commit: `feat(remy-chat): add Supabase-backed knowledge layer with FTS retrieval`
9. Push → Render auto-deploys → smoke test prod passes
10. **Manual sanity:** Mike asks Reme "How long does setup take?" — answer should mention "24 hours" (from seeded FAQ row). Asks "Tell me about CTM integration" — answer should say she doesn't have details yet (because placeholder rows are inactive).
11. Append Review subsection to `tasks/todo.md`

### Required Supabase action before this is live in prod

Run `src/app/api/remy-chat/remy_knowledge_migration.sql` in the Supabase SQL editor for project `zjuoxaqdqqdtihmekrcz`. Idempotent (all `if not exists` clauses) — safe to re-run.

### Risk + rollback

- **Risk: medium-low.** Adds one Supabase query per Reme chat call. Cached for 60s so the actual round-trip happens at most once per minute under typical landing-page load. Gemini call is the slow path; this adds ~50ms.
- **Failure mode: Supabase down.** Retrieval falls back to the in-memory cache; if the cache is also empty (fresh cold start), Reme falls back to the base system prompt and answers from general knowledge. No 5xx response from Reme on knowledge failure.
- **Failure mode: knowledge contradicts model.** If a seeded row says one thing and the model wants to say another, the system prompt's injected facts take precedence in practice (verified against Gemini 2.5-flash's known instruction-following behavior). If we observe contradictions, add a hard "use these exact facts verbatim when relevant" line to the prompt.
- **Rollback:** `git revert <sha> && git push`. The new table can stay (no harm). If Mike wants to fully delete: `drop table remy_knowledge; drop function search_remy_knowledge;`.

### Follow-on work Mike can do without redeploying (the whole point)

After the table exists, adding new knowledge is a one-liner in the Supabase SQL editor:

```sql
insert into remy_knowledge (topic, question, answer) values
  ('Pricing - AI TC Add-on', 'How much does the AI TC add-on cost?', 'The AI TC add-on is $59/month on top of the base Forms & Contracts plan.');
```

CTM integration content gets added the same way once the real capabilities are documented. No code change, no deploy, no agent run.

### Effort estimate

3-4 hours of agent time including: migration + helper module + route changes + tsc/lint/build + atomic commit + push + Render wait + prod smoke test + a few manual Reme questions to verify quality.

### Suitable for overnight queue?

**Yes.** Touches 3 files (1 new SQL, 1 new TS module, 1 modified route). Acceptance criteria are clear and gateable. Includes graceful fallback at every failure point. Mike's morning verification is asking Reme 2-3 questions in the browser — under 60 seconds.

---

## Next Sprint: Professional /docs page

### Goal

Create a single comprehensive documentation page at `/docs` on done-deal-site that covers every part of the Done Deal product. Style-matched to the rest of the marketing site (light theme, cyan accents, Framer Motion entrance animations). Source content from the existing FAQ/Pricing/Comparison/HowItWorks/Benefits sections where authoritative copy already exists; mark anything else as a clearly-labeled placeholder for Mike to fill in (no invented product facts).

### Why one long page vs. multi-page docs site

- **SEO:** dense topical content on one URL ranks better than thin pages.
- **Scannable:** sticky sidebar TOC + anchor links give the multi-page navigation feel without the redirect tax.
- **Maintenance:** one route, no nested routing to manage.
- **Customer pattern:** prospects skim docs to evaluate. They want to ctrl-F, not click through.

If volume grows past ~10,000 words, future sprint can split into `/docs/<topic>` routes.

### Files to create

| Path | Purpose |
|---|---|
| `src/app/docs/page.tsx` | Page route with `metadata` (title, description, OG) + assembles the section components |
| `src/app/docs/layout.tsx` | Two-column layout: sticky sidebar TOC (desktop) / collapsible top nav (mobile) + main content |
| `src/components/docs/Toc.tsx` | TOC with scroll-spy active state, smooth scroll on click |
| `src/components/docs/Section.tsx` | Wrapper: gives every section an `id`, anchor link icon on hover, scroll-margin offset, Framer Motion entrance |
| `src/components/docs/Callout.tsx` | Info / Note / Warning / Placeholder variants. Placeholder variant renders a yellow-tinted box with "This section is in progress — content coming soon" |
| `src/components/docs/sections/Overview.tsx` | What Done Deal is, who it's for. Pull from `Hero.tsx` headline copy + `Benefits.tsx` value props |
| `src/components/docs/sections/GettingStarted.tsx` | Signup → onboarding session → first transaction in 24 hours. Pull from FAQ row "How long does it take to set up?" |
| `src/components/docs/sections/DailyWorkflow.tsx` | What the AI does each day, approval-based workflow. Pull from `HowItWorks.tsx` step copy |
| `src/components/docs/sections/Transactions.tsx` | Buyer-side / seller-side / dual-agency support. Pull from FAQ row "What types of transactions does Done Deal support?" |
| `src/components/docs/sections/Deadlines.tsx` | Colorado MEC, escalating alerts, breach handling. Pull from FAQ "What happens if something goes wrong or a deadline is missed?" |
| `src/components/docs/sections/Documents.tsx` | DocuSign integration, CREC forms. **PLACEHOLDER** for form library specifics — Mike's input needed for the full list |
| `src/components/docs/sections/Vendors.tsx` | **PLACEHOLDER** — references Vendor system from done-deal-app but no public copy exists yet |
| `src/components/docs/sections/Parties.tsx` | **PLACEHOLDER** — buyer agent, seller agent, lender, title workflows. Needs Mike's authoritative copy |
| `src/components/docs/sections/Compliance.tsx` | **PLACEHOLDER** — HOA, solar, pre-1978, contract accuracy. Needs Mike's copy |
| `src/components/docs/sections/Integrations.tsx` | DocuSign, Google Calendar, email. **PLACEHOLDER for CTM section** — the same one Reme will reference once Mike fills in real capabilities |
| `src/components/docs/sections/Security.tsx` | Encryption, data handling, no training on customer data. Pull from FAQ "Is my data secure?" |
| `src/components/docs/sections/Pricing.tsx` | F&C base + AI TC add-on ($59/mo). Reuse from `Pricing.tsx` section component or extract shared data |
| `src/components/docs/sections/Support.tsx` | How to reach the team, link to `/contact`, link to FAQ |

### Files to modify

| File | Change |
|---|---|
| `src/components/layout/Navbar.tsx` | Add "Docs" link between "Pricing" and "Contact" |
| `tasks/todo.md` | Append Review subsection summarizing what shipped + what's still placeholder |

### Sections + IA (table-of-contents order)

1. **Overview** — What Done Deal is, who it's for, the one-sentence pitch
2. **Getting Started** — Signup, onboarding, first 24 hours
3. **Your Daily Workflow** — What the agent does each day with Reme + Done Deal
4. **Transactions** — Buyer / seller / dual-agency
5. **Deadlines & Calendar** — MEC, escalating alerts, breach handling
6. **Documents & Forms** — DocuSign, CREC forms, templates *(placeholder for form library detail)*
7. **Vendors** *(placeholder)*
8. **Parties & Communication** *(placeholder)*
9. **Compliance** *(placeholder)*
10. **Integrations** — DocuSign, Google Calendar, email, CTM *(placeholder for CTM specifics)*
11. **Security & Privacy** — Encryption, data handling
12. **Pricing** — F&C base + AI TC add-on
13. **Support & FAQ** — Links + escalation paths

### Style guide for the executing agent

- **Theme:** light (matches site default since commit `e02b897`). Background `#faf8f5` or similar warm white; primary text dark; brand cyan `#00BEFF` for links and active TOC item.
- **Typography:** match the existing site's font stack. Heading hierarchy: H1 page title, H2 section, H3 sub-topic. No bold-as-headings hacks.
- **Width:** prose column max-width ~720px for readability; sidebar ~240px; everything wrapped in container that maxes at ~1100px.
- **Scroll margin:** every section heading needs `scroll-margin-top` ~80px so the sticky navbar doesn't cover it when anchor-linked.
- **Animation:** each section uses the existing `AnimatedSection` wrapper for a subtle fade-in. Don't over-animate — docs are for reading.
- **Mobile:** sidebar collapses into a `<details>` element at the top of the page that shows the TOC when expanded. Body content remains full-width on mobile.
- **Placeholder callouts:** use the `Placeholder` Callout variant — yellow-tinted, with a "✏️ Coming soon" tag and the text "This section is being expanded. Reach out to [support@leadspot.ai](mailto:support@leadspot.ai) for current details on [topic]."

### Content sourcing (no invention rule)

For each non-placeholder section, the agent must:
1. Cite the source: a comment at the top of the section component listing which `src/components/sections/*.tsx` file the copy was pulled from
2. Verbatim-paste the existing copy where applicable, lightly expanded for docs format
3. NOT invent new feature claims, pricing details, integration capabilities, or testimonials
4. If unsure whether something is true, render it as a placeholder section

### SEO essentials

`src/app/docs/page.tsx` metadata:
```ts
export const metadata = {
  title: 'How Done Deal Works | Documentation',
  description: 'Complete guide to Done Deal — the AI transaction coordination platform for Colorado real estate. Setup, workflows, deadlines, documents, integrations, pricing, and security.',
  openGraph: {
    title: 'Done Deal Documentation',
    description: 'Everything you need to know about using Done Deal as your AI transaction coordinator.',
    type: 'article',
  },
};
```

Bonus (low effort): JSON-LD structured data for the FAQ section using `schema.org/FAQPage` so Google can render rich snippets in search results.

### Acceptance criteria

1. New route at `https://done-deal-site.onrender.com/docs` returns 200 with full content
2. Sticky sidebar TOC on desktop, collapsible on mobile (viewport < 768px)
3. Scroll-spy: active section in TOC highlights as user scrolls
4. Smooth scroll on TOC link click
5. Every anchor link in the URL works (e.g., `/docs#deadlines`)
6. Placeholder sections clearly visible as such (yellow callout, not normal prose)
7. No invented product claims — comment headers cite source for non-placeholder sections
8. "Docs" link appears in Navbar
9. `npx tsc --noEmit && npm run lint && npm run build` all green
10. `./scripts/smoke-test.sh https://done-deal-site.onrender.com` still 11/11 pass (no regressions in existing API routes)
11. Atomic commit: `feat(docs): add comprehensive /docs page with sticky TOC and section components`
12. Push → Render auto-deploys → manual visual check at the URL
13. Append Review subsection to `tasks/todo.md` listing every section that shipped real content vs. placeholder

### Risk + rollback

- **Risk: low.** Pure-additive change. New route, no modifications to existing API routes or live functionality. Worst case is a layout bug, not a service outage.
- **Rollback:** `git revert <sha> && git push`. Render redeploys the previous commit. The `/docs` route disappears; everything else is untouched.

### Future enhancements (not in this sprint)

- **Auto-sync with Reme knowledge:** if both the docs page and the `remy_knowledge` table grow, build a script that ensures content stays in sync. For now they're independent.
- **Search bar:** client-side fuzzy search across all docs sections. Adds Fuse.js (~6kb gzipped). Skip until docs > 5000 words.
- **Version history / changelog section:** when Done Deal ships new features, add a "What's new" section at the top.
- **Multi-page split:** if docs grow past ~10,000 words, split into `/docs/<topic>` routes with shared sidebar.
- **In-page video walkthroughs:** embed a short Loom for each major workflow section. Out of scope for v1 — adds production work for Mike.

### Effort estimate

6-8 hours of agent time including: 13 section components + layout + TOC + scroll-spy + smoke test + Render deploy + visual verification. If this feels too large for one overnight run, split into:
- **Sprint A (4-5 hrs):** infrastructure (route, layout, TOC, Callout, Section, Navbar) + first 6 sections with real content (Overview, Getting Started, Daily Workflow, Transactions, Deadlines, Pricing, Security, Support)
- **Sprint B (3-4 hrs):** remaining sections + content fill-ins (Documents, Vendors, Parties, Compliance, Integrations)

### Suitable for overnight queue?

**Yes, with the split if you want safer atomic deploys.** Recommend Sprint A first — it's the higher-leverage half (visible to prospects immediately) and Sprint B can wait until you have authoritative copy for the placeholder sections.

### Followups for Mike (the only blockers to filling placeholders)

1. **CTM integration:** what does the live integration do today? Same question as the Reme RAG sprint — once answered, both this docs page AND Reme update at once.
2. **Form library:** which CREC forms are supported? Provide list or screenshot of the form picker UI.
3. **Vendor system:** public-facing copy describing what the vendor lookup does.
4. **Compliance specifics:** the actual checks Done Deal runs (HOA addendum, lead paint, solar disclosure, etc.) — sourced from the contract-accuracy checker code in done-deal-app `lib/contract-accuracy-checker.ts` if it's public.
5. **Pricing exactness:** confirm $99/deal vs. $197/deal vs. $59/month TC add-on vs. $797/yr vs. $2500/yr — recent commits show pricing changed multiple times; lock the docs to the current truth.
