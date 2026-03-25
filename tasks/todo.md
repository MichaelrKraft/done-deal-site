# Phase 3A: Inbound Email Inbox

## Plan
- [x] Step 1: Create SQL migration `db/migrations/phase2-inbound-email.sql`
- [x] Step 2: Add InboundEmailRow, InboundAttachmentRow types to `types/database.ts`
- [x] Step 3: Create `lib/inbox-address-generator.ts`
- [x] Step 4: Create `lib/address-matcher.ts`
- [x] Step 5: Create `lib/inbound-processor.ts`
- [x] Step 6: Create webhook route `app/api/inbound/webhook/route.ts`
- [x] Step 7: Add inbox address UI to settings + API route `app/api/agents/inbox-address/route.ts`
- [x] Step 8: Type check with `npx tsc --noEmit` -- PASS (0 errors)

## Review
- Created SQL migration adding `inbox_address` column to agents, plus `inbound_emails` and `inbound_attachments` tables with indexes
- Added `InboundEmailProcessingStatus`, `InboundAttachmentExtractionStatus` union types, `InboundEmailRow`/`InboundAttachmentRow` convenience types, updated Agent Row/Insert/Update with `inbox_address` in database.ts
- Created `lib/inbox-address-generator.ts`: generates `tc-{slug}-{4hex}@inbox.donedeal.ai` addresses using crypto.randomBytes
- Created `lib/address-matcher.ts`: normalizes addresses (strips unit/apt/suite, punctuation) and uses Levenshtein distance for fuzzy matching with 0.8 confidence threshold
- Created `lib/inbound-processor.ts`: full SendGrid webhook processor that finds agent by inbox_address, deduplicates by message_id, extracts PDF contract data, fuzzy-matches addresses to existing transactions, creates new transactions + ai_actions for unmatched contracts
- Created `app/api/inbound/webhook/route.ts`: POST endpoint that parses SendGrid multipart form-data, extracts attachments, and delegates to processInboundEmail
- Created `app/api/agents/inbox-address/route.ts`: POST endpoint that generates and stores inbox address for authenticated agent
- Created `components/settings/InboxAddressSection.tsx`: client component with copy button, auto-generates address on first load
- Added InboxAddressSection to settings page profile section
- TypeScript type check passes with zero errors
