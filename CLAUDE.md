# Done Deal — Project Context

## What This Is
Done Deal is an AI-powered transaction coordination (TC) application for residential real estate agents. The primary customer is Your Castle Real Estate (800 agents in Colorado).

## Project Structure
- **Framework**: Next.js 15, TypeScript strict mode, App Router
- **Database**: Supabase (Postgres) — multi-tenant: brokerage → agent → transaction
- **AI Engine**: Anthropic Claude (claude-sonnet-4-6) with tool-use loop
- **Job Queue**: BullMQ + Redis for 24/7 background TC agent workers
- **Email**: Microsoft Graph API (Outlook OAuth) — Your Castle uses Outlook
- **Messaging**: Telegraf (Telegram) + Baileys (WhatsApp)
- **UI**: Tailwind CSS + shadcn/ui + dnd-kit (Kanban)
- **Real-time**: Socket.io

## Key Directories
- `app/` — Next.js App Router pages
- `components/` — React components (ui/, feed/, board/, transactions/, onboarding/, layout/)
- `lib/` — Core business logic (supabase client, tc-agent loop, deadline engine, etc.)
- `tools/` — AI TC tools (email-drafter, document-tracker, risk-classifier, etc.)
- `integrations/` — External service clients (telegram, whatsapp, microsoft-graph, docusign)
- `worker/` — BullMQ worker + job definitions
- `db/` — Postgres schema SQL
- `types/` — Shared TypeScript types

## Architecture Decisions
- One BullMQ worker pool handles all agents (not one process per agent)
- Each agent's TC work is a recurring BullMQ job with unique ID per (agent_id + job_type + date)
- Two autonomy modes: Supervised (default) + Autonomous (per-transaction opt-in)
- Risk classification: LOW (auto-execute in Autonomous) / MEDIUM (always approval) / HIGH (always approval)
- Socket.io for real-time feed updates and Kanban board movements

## Colorado-Specific Rules
- All deadlines calculated from MEC (Mutual Execution of Contract) date
- Colorado deadline calculator handles both calendar days and business days
- Compliance engine detects property characteristics (pre-1978, solar, septic, well, HOA) → injects required tasks
- Your Castle specific: CDA 5 days before closing, Wire Fraud Warning 5 days before closing, docs to documents@yourcastle.org within 5 BD of MEC

## Port
This app runs on port 3000 (dev).

## Source Documents
Your Castle TC workflow PDFs are in: `/Users/michaelkraft/Desktop/New Castle File/`
