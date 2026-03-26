# Done Deal — Production Readiness Plan

> **For agentic workers:** Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Fix all blockers preventing a confident beta handoff to Your Castle Real Estate.

**Architecture:** Next.js 15 + Supabase + BullMQ + Claude tool-use loop. Changes are targeted fixes and wiring — no new architecture.

**Tech Stack:** TypeScript strict, Vitest, Supabase (Postgres), Anthropic SDK, Google/Microsoft OAuth

---

## Phase 1: Fix Test Suite + Critical Bug (BLOCKER)

Existing tests: `tests/lib/render-template.test.ts` (14 tests), `tests/api/webhooks/docusign.test.ts` (7 tests).
Must pass clean before anything else ships.

### Task 1: Run existing tests and fix any failures

**Files:**
- Test: `tests/lib/render-template.test.ts`
- Test: `tests/api/webhooks/docusign.test.ts`
- Config: `vitest.config.ts`

- [ ] Run full test suite: `npm run test:run`
- [ ] Fix any failures found
- [ ] Confirm clean run: all 21 tests pass, exit code 0

---

### Task 2: Add risk-classifier tests + fix auto-execute bug

The risk classifier decides what auto-executes vs. what needs agent approval. Zero test coverage currently. **BUG:** `shouldAutoExecute` returns `true` for ALL low-risk actions regardless of autonomy mode (line 88 of `lib/risk-classifier.ts`), contradicting the docstring that says it should only auto-execute in autonomous mode.

**Files:**
- Create: `tests/lib/risk-classifier.test.ts`
- Modify: `lib/risk-classifier.ts:88` — fix bug

Tests to write:

**classifyRisk tests:**
- returns `high` for `requires_signature: true`
- returns `high` for emails to `documents@yourcastle.org`
- returns `high` for action types containing "amendment" or "objection"
- returns `high` for `cda`, `wire_fraud_warning`
- returns `medium` for `earnest_money_reminder`
- returns `medium` for lender email about loans
- returns `low` for `deadline_reminder`, `calendar_event`
- returns `medium` for unrecognized action types (safe default)

**shouldAutoExecute tests:**
- returns `true` for low risk + autonomous mode
- returns `false` for medium/high risk + autonomous mode
- returns `false` for low risk + supervised mode (**this exposes the bug**)
- returns `false` for medium/high risk + supervised mode

**Bug fix:** Change line 88 from `if (riskLevel === 'low') return true` to `if (riskLevel === 'low' && autonomyMode === 'autonomous') return true`

- [x] Write failing tests in `tests/lib/risk-classifier.test.ts`
- [x] Run tests — confirm supervised-mode test FAILS (exposes bug)
- [x] Fix `lib/risk-classifier.ts` line 88
- [x] Run tests — all pass (16/16)
- [x] Run full suite — all pass (46/46)
- [ ] Commit: `fix(risk-classifier): only auto-execute low risk in autonomous mode`

---

### Task 3: Add Stripe webhook tests

The billing webhook handles subscription lifecycle. A bug here silently breaks billing for all agents.

**Files:**
- Create: `tests/api/webhooks/stripe.test.ts`
- Source: `app/api/webhooks/stripe/route.ts`

Tests to write:
- returns 500 when `STRIPE_WEBHOOK_SECRET` not set
- returns 400 when `stripe-signature` header missing
- returns 400 when signature verification fails
- updates agent plan/status on `subscription.updated`
- returns `{ received: true }` for valid events

Mock pattern: same as docusign test — mock `@/lib/stripe` and `@/lib/supabase/server-admin`.

- [ ] Write tests
- [ ] Run and verify all pass
- [ ] Commit: `test(stripe): add webhook route tests for billing lifecycle`

---

### Task 4: Add vendor API tests

The vendor API has IDOR protection (agent can only delete their own vendors). Must be tested.

**Files:**
- Create: `tests/api/vendors.test.ts`
- Source: `app/api/vendors/route.ts`, `app/api/vendors/[id]/route.ts`

Tests to write:
- GET returns vendors filtered by category query param
- POST creates vendor with authenticated agent's ID
- DELETE returns 403 when vendor belongs to different agent
- DELETE succeeds for own vendor

- [ ] Write tests
- [ ] Run and verify all pass
- [ ] Commit: `test(vendors): add API route tests with IDOR protection coverage`

---

## Phase 2: Wire Calendar Events to Real APIs (WEEK 1 GAP)

Currently `tools/calendar-event.ts` returns a draft object but **never calls** Google Calendar or Outlook APIs. The integration functions exist in `integrations/google-workspace.ts` (`createGoogleCalendarEvent`) and `integrations/microsoft-graph.ts` (`createCalendarEvent`) but are never invoked from the agent loop.

### Task 5: Wire calendar event execution in tc-agent.ts

When an auto-executed `calendar_event` action is created, the agent should also call the real calendar API.

**Files:**
- Modify: `lib/tc-agent.ts:172-185` (the auto-execute calendar block)

After the existing `supabase.from('deadlines').insert(...)` block, add code that:
1. Loads agent's `google_tokens` / `outlook_tokens` from the agents table
2. If Google tokens exist → call `createGoogleCalendarEvent(tokens, event)`
3. Else if Outlook tokens exist → call `createCalendarEvent(tokens, event)`
4. If tokens were refreshed, update the agent record

- [ ] Add calendar API calls after deadline insert in tc-agent.ts
- [ ] Verify TypeScript compiles: `npx tsc --noEmit`
- [ ] Commit: `feat(calendar): wire auto-executed calendar events to Google/Outlook APIs`

---

### Task 6: Add Google OAuth callback route

Google OAuth tokens needed for Calendar sync. `integrations/google-workspace.ts` has `exchangeGoogleCode()` but no route handles the OAuth redirect.

**Files:**
- Create: `app/api/auth/google/route.ts` — initiates OAuth flow (redirects to Google)
- Create: `app/api/auth/google/callback/route.ts` — handles callback, stores tokens on agent

The callback route should:
1. Get `code` param from URL
2. Call `exchangeGoogleCode(code)`
3. Store tokens on agent record via `supabase.from('agents').update({ google_tokens })`
4. Redirect to `/settings?google=connected`

The initiate route should:
1. Verify user is authenticated
2. Call `getGoogleAuthUrl(user.id)`
3. Redirect to Google OAuth URL

- [ ] Create both routes
- [ ] Verify TypeScript compiles
- [ ] Commit: `feat(auth): add Google OAuth callback route for Calendar/Gmail integration`

---

## Phase 3: Wire Action Approval Execution (CORE WORKFLOW GAP)

When an agent approves a pending AI action (via feed or Telegram), the `action_approved` event fires but `tc-event-job.ts` has a **stub**: `console.log('[Action Approved] — Phase 3 stub')`. Approved actions are never executed — emails never sent, calendar events never created.

### Task 7: Implement action approval executor

**Files:**
- Modify: `worker/jobs/tc-event-job.ts:39-44` (replace `action_approved` stub)

The handler should:
1. Read the `ai_actions` row by `action_id` from payload
2. Load agent's OAuth tokens
3. Based on `action_type`:
   - `draft_email` / `deadline_reminder` → send via Gmail or Outlook
   - `calendar_event` → create via Google Calendar or Outlook Calendar
   - Other types → mark as executed (the draft was the action)
4. Update `ai_actions.status` to `'executed'` with `executed_at` timestamp

- [ ] Implement action_approved handler
- [ ] Verify TypeScript compiles
- [ ] Commit: `feat(worker): implement action_approved executor — sends emails and creates calendar events`

---

### Task 8: Create action approve/reject API endpoints

Agents need a way to approve/reject pending actions from the UI.

**Files:**
- Create: `app/api/actions/[id]/approve/route.ts`
- Create: `app/api/actions/[id]/reject/route.ts`

Both routes must:
1. Authenticate user, look up their agent
2. Verify action belongs to this agent (IDOR protection)
3. Verify action is still `'pending'` (no double-processing)
4. Update status to `'approved'` or `'rejected'`

- [ ] Create approve route
- [ ] Create reject route
- [ ] Verify TypeScript compiles
- [ ] Commit: `feat(api): add action approve/reject endpoints with IDOR protection`

---

## Phase 4: Production Smoke Test

### Task 9: Create smoke test script

A script that validates deployment readiness against real Supabase.

**Files:**
- Create: `scripts/smoke-test.ts`
- Modify: `package.json` — add `"smoke-test"` script

Checks:
1. Supabase connection (select from agents)
2. All required DB tables exist (agents, transactions, deadlines, tasks, parties, ai_actions, documents, compliance_requirements, preferred_vendors)
3. Required env vars set (ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
4. Stripe client initializes (if STRIPE_SECRET_KEY set)
5. Sentry DSN configured
6. Print summary: PASS/FAIL per check

- [ ] Write smoke test script
- [ ] Add to package.json scripts
- [ ] Run it and verify all checks pass
- [ ] Commit: `feat(scripts): add production smoke test for deployment verification`

---

## Phase 5: Final Verification

### Task 10: Run full test suite and TypeScript check

- [ ] Run: `npm run test:run` — all tests pass
- [ ] Run: `npx tsc --noEmit` — no errors
- [ ] Run: `npm run smoke-test` — all checks pass
- [ ] Bump version to `0.2.0` in package.json
- [ ] Commit: `chore: bump version to 0.2.0 — production ready for beta handoff`

---

## Summary

| Phase | What | Why | Effort |
|-------|------|-----|--------|
| 1 | Fix tests + risk-classifier bug + add Stripe/vendor tests | Can't ship without passing tests; supervised mode bug is a liability | M |
| 2 | Wire calendar events to real Google/Outlook APIs + Google OAuth | Agents can't sync deadlines to their calendar | S |
| 3 | Implement action approval execution + API routes | Approved actions (emails, calendar) are never sent | M |
| 4 | Production smoke test script | Deployment verification before going live | S |
| 5 | Final verification | Clean test run + TypeScript check | XS |

**Total: 10 tasks, ~8 commits.**

## Not in Scope (Future Sprint)

- Vendor autocomplete in party creation form (no AddPartyForm exists yet)
- WhatsApp integration (Baileys referenced but not implemented)
- Multi-state deadline support (Colorado only for now)
- Per-transaction pricing tier
- Brokerage admin dashboard
- Advanced analytics dashboard

---

## Review

### Execution Summary

All 10 tasks completed. 3 test-writing tasks dispatched as parallel agents.

### Files Created (8)
- `tests/lib/risk-classifier.test.ts` — 16 tests covering classifyRisk + shouldAutoExecute
- `tests/api/webhooks/stripe.test.ts` — 5 tests covering Stripe billing webhook
- `tests/api/vendors.test.ts` — 5 tests covering vendor CRUD + IDOR protection
- `app/api/auth/google/route.ts` — Google OAuth initiate (redirects to Google)
- `app/api/auth/google/callback/route.ts` — Google OAuth callback (stores tokens)
- `app/api/actions/[id]/approve/route.ts` — Action approval endpoint with IDOR check
- `app/api/actions/[id]/reject/route.ts` — Action rejection endpoint with IDOR check
- `scripts/smoke-test.ts` — Production deployment verification script

### Files Modified (4)
- `lib/risk-classifier.ts` — **BUG FIX**: `shouldAutoExecute` now gates on `autonomyMode === 'autonomous'` (was auto-executing low-risk in supervised mode)
- `lib/tc-agent.ts` — Calendar events now call real Google Calendar / Outlook APIs on auto-execute
- `worker/jobs/tc-event-job.ts` — `action_approved` handler implemented: sends emails via Gmail/Outlook, creates calendar events
- `package.json` — Added `smoke-test` script, bumped version to 0.2.0

### Test Results
- **51 tests passing** across 5 test files (was 25 across 2 files)
- **0 TypeScript errors** (`npx tsc --noEmit` clean)

### Critical Bug Fixed
`shouldAutoExecute('low', 'supervised')` was returning `true` — meaning deadline reminders, status check-ins, and calendar events were auto-executing even when the transaction was in supervised mode. Now correctly returns `false` in supervised mode.
