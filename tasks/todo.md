# Task: Interactive Task Cards with AI Activity Logs

## Plan

- [x] Read current transaction detail page, types, and list page
- [x] Create `components/transactions/TaskCard.tsx` — interactive expandable task card
- [x] Update `app/(dashboard)/transactions/[id]/page.tsx` — use TaskCard, increase AI actions limit, filter actions per task
- [x] Update `app/(dashboard)/transactions/page.tsx` — add task progress indicators to list
- [x] Run `npx tsc --noEmit` and fix any errors

## Changes

### 1. TaskCard.tsx (new file)
- Client component with expand/collapse state
- Status circle (empty/pulse/checkmark/dashed) based on task status
- Status pill label on the right
- Assigned-to badge
- Expandable AI activity log timeline
- Relative time formatting helper

### 2. Transaction Detail Page
- Import and use TaskCard instead of inline task rendering
- Increase ai_actions limit from 5 to 50
- Filter AI actions per task by matching task title keywords in context_summary
- Pass filtered actions to each TaskCard

### 3. Transactions List Page
- Modify query to include tasks: `select('*, tasks(id, status)')`
- Show "X/Y tasks done" with color-coded progress bar

## Review

All 5 tasks complete. Zero type errors.

### Files Created
- `components/transactions/TaskCard.tsx` (156 lines) -- Client component with interactive expand/collapse

### Files Modified
- `app/(dashboard)/transactions/[id]/page.tsx` (205 lines) -- Uses TaskCard, fetches 50 AI actions, filters per task
- `app/(dashboard)/transactions/page.tsx` (123 lines) -- Loads tasks with transactions, shows progress bar

### What Changed
- **TaskCard**: status circles (empty red border for pending, amber pulse for in_progress, green checkmark for completed, dashed for skipped/n_a), status pill labels, assigned-to badge, click-to-expand with CSS max-height transition, AI activity timeline with relative timestamps
- **Detail page**: removed inline task rendering and old STATUS_CONFIG/ASSIGNED_LABELS constants, imports TaskCard, increased AI actions query from 5 to 50, added `actionsForTask()` that matches task title keywords against context_summary, top-level feed still shows only 5 most recent
- **List page**: query changed from `select('*')` to `select('*, tasks(id, status)')`, each transaction card shows a color-coded progress bar (green >=75%, amber 25-75%, red <25%) with "X/Y" fraction
