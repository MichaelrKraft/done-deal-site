# Phase 3: Settings Polish + Seed Templates + Document Checklist

## Plan
- [x] Step 1: SQL migration — Add `preferred_model` column to agents table
- [x] Step 2: Update `types/database.ts` — Add preferred_model to Row/Insert/Update
- [x] Step 3: Expand `/api/agents/me` PATCH — Accept autonomy_default + preferred_model
- [x] Step 4: Create `AIConfigSection.tsx` — Interactive autonomy toggle + model dropdown
- [x] Step 5: Update settings page — Replace static AI Config with AIConfigSection
- [x] Step 6: Update `tc-agent.ts` — Use agent.preferred_model instead of hardcoded model
- [x] Step 7A: Create `/api/templates/seed` — Seed 5 starter email templates
- [x] Step 7B: Update `TemplatesSection.tsx` — Add "Load Starter Templates" button
- [x] Step 8A: Create `your-castle-document-checklist.ts` — Official checklist data
- [x] Step 8B: Update `DocumentChecklist.tsx` — Use official Your Castle checklist
- [x] Step 8C: Update `your-castle-rules.ts` — Add document submission compliance rules
- [x] Fix PDF extraction — Improved regex for seller names, title company, lender, MEC date
- [x] Fix API route — Changed .select() to use '*' to avoid missing column crash
- [x] TypeScript type check — Zero errors
- [x] Browser test — Autonomy toggle works (200), model dropdown renders, templates seed button present

## Review

### Changes Made (13 files)

**New files (4):**
- `db/migrations/phase3-preferred-model.sql` — Adds preferred_model column with CHECK constraint
- `components/settings/AIConfigSection.tsx` — Interactive autonomy toggle + model dropdown component
- `app/api/templates/seed/route.ts` — Seeds 5 Colorado TC email templates for the agent
- `lib/your-castle-document-checklist.ts` — Official Your Castle Internal Document Checklist (70+ items)

**Modified files (9):**
- `types/database.ts` — Added preferred_model to agents Row/Insert/Update
- `app/api/agents/me/route.ts` — Expanded PATCH to accept autonomy_default + preferred_model, uses select('*')
- `app/(dashboard)/settings/page.tsx` — Replaced static AI Config HTML with AIConfigSection component
- `lib/tc-agent.ts` — Uses agent.preferred_model instead of hardcoded 'claude-sonnet-4-6'
- `components/settings/TemplatesSection.tsx` — Added "Load Starter Templates" button when empty
- `components/documents/DocumentChecklist.tsx` — Updated with official Your Castle checklist
- `lib/your-castle-rules.ts` — Added document submission compliance rules (5BD deadline, $50 fee)
- `lib/pdf-extractor.ts` — Fixed regex for seller names, title company, lender, MEC date

### Browser Test Results
- Autonomy toggle: Supervised -> Autonomous -> Supervised — all PATCH 200
- AI Model dropdown: Renders with Haiku/Sonnet/Opus options
- Load Starter Templates: Button present, API call made (needs email_templates table migration)
- PDF extraction: Tested via tsx — all fields extracted correctly from demo contract
- New Transaction page: Drop zone renders correctly

### Remaining: Run SQL Migrations
The `preferred_model` column migration and the `email_templates` table migration need to be run in Supabase SQL Editor before model switching and templates fully work.

---

# Fix: Feed shows "all caught up" after transaction creation

## Root Cause
The TC agent only runs on BullMQ scheduled jobs (7am, noon, 5pm, 9pm Denver time + every 2h deadline_watch). No job fires immediately when a transaction is created. The repeatable jobs also don't fire until after their first full interval elapses. Result: a freshly created transaction has zero `ai_actions` rows → empty feed.

## Todo
- [x] 1. Create `app/api/agent/trigger/route.ts` — POST endpoint to enqueue an immediate morning_sweep
- [x] 2. Modify `app/api/transactions/route.ts` — enqueue immediate job after transaction insert
- [x] 3. Add "Run Agent Now" button to the feed page

## Review
- `app/api/agent/trigger/route.ts` — NEW: POST endpoint, enqueues immediate morning_sweep for authenticated agent
- `app/api/transactions/route.ts` — Added import + fire-and-forget enqueue after transaction creation
- `components/feed/RunAgentButton.tsx` — NEW: client button with idle/loading/done states
- `app/(dashboard)/feed/page.tsx` — Added RunAgentButton to page header
