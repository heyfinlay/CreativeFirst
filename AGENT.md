# AGENT.MD — Creative First (Working Name)

A comprehensive, consistent execution plan for building **Creative First** using agentic coding tools (Cursor, Codex CLI, Claude Code, etc.).

> **Goal:** Convert the PRD into an MVP web app (web-first) with a clean architecture, predictable milestones, and repeatable agent prompts.

---

## 0) Prime Directive

### Non‑negotiables

- **Web-first** (mobile later as parity).
- **Australia-only** for V1.
- **Creator-first UX** inspired by “dating app discovery” (Hinge), not job boards.
- **Flow is fixed:** Contract → Apply → Approve → Bid → Escrow → Deliver → Approval → Payout.
- **Defaults are strict:**
  - Revisions: **0 unless explicitly included**
  - Posting: **never assumed**
  - Address visibility: **only after escrow funded**
  - Disputes: **admin reviewed**
- **Minimum deal value:** enforce \$50 or \$100 (configurable).

### Definition of Done (MVP)

A brand can post a paid contract, creators can apply/bid, brand funds escrow, creator submits deliverable, brand approves (or auto-release), creator receives payout, disputes go to an admin queue, AI Pro generates briefs/pitches under usage caps.

---

## 1) Tech Stack (MVP)

### Recommended

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind
- **Backend:** Supabase (Postgres + Auth + Storage + RLS)
- **Payments:** Stripe + Stripe Connect (Express accounts for creators)
- **Server logic:** Supabase Edge Functions (Stripe webhooks, escrow transitions, scheduled checks)
- **AI:** OpenAI API (or pluggable provider) for brief/pitch generation

### Repo Layout

```
creative-first/
  apps/
    web/                 # Next.js app
  packages/
    ui/                  # Shared UI components
    lib/                 # Shared utilities (date, money, schema)
    db/                  # SQL migrations, schema docs
  supabase/
    migrations/
    seed.sql
  functions/             # Supabase Edge Functions
  docs/
    PRD.md
    AGENT.MD
    ARCHITECTURE.md
```

---

## 2) Operating Model for Agentic Coding

### Golden Rules for Agents

1. **One task per prompt**. Keep scope small and verifiable.
2. **Always add tests or verifiable checks** for backend logic.
3. **Never break RLS**; security is a feature.
4. **Prefer migrations** over manual DB edits.
5. **Ship thin vertical slices** (end-to-end) instead of horizontal layers.

### Required Output for Every Agent Task

- What files changed
- Why
- How to verify (commands, manual steps)
- Any new env vars

### Prompt Template

Use this format when instructing an agent:

**Context**

- Repo: creative-first
- Goal:&#x20;

**Constraints**

- Do not change existing public APIs without updating callers
- Keep TypeScript strict
- Follow existing patterns

**Deliverables**

-

**Acceptance Tests**

-

---

## 3) Milestone Plan (Vertical Slices)

### Milestone 0 — Project Bootstrap (Day 0)

**Outcome:** app runs locally; Supabase project connected; CI baseline.

Tasks

- Initialize Next.js app (TS, Tailwind, ESLint)
- Create Supabase project + local dev setup
- Configure env handling
- Add lint/typecheck scripts

Verification

- `pnpm dev` loads homepage
- `supabase start` works locally

---

### Milestone 1 — Auth + Role Onboarding (Creators vs Brands)

**Outcome:** users can sign up/login, select role, and see role-based nav.

Key Decisions

- Users table stores `role` (creator|brand|admin)
- Profiles are separate tables

Tasks

- Supabase Auth setup
- `profiles` table
- Role onboarding flow
- RLS policies: users can only read/write their own profile

Acceptance

- Creator sees Creator dashboard
- Brand sees Brand dashboard

---

### Milestone 2 — Contract Posting (Brand)

**Outcome:** brands can create and publish paid contracts.

Tasks

- `brands` table
- `contracts` table
- Contract create wizard UI
- Paid posting fee (Stripe Checkout or PaymentIntent)
- Contract status: draft → live

Acceptance

- Brand can publish a contract only after payment success

---

### Milestone 3 — Creator Contract Feed + Save + Apply

**Outcome:** creators browse live contracts, save, apply.

Tasks

- Contracts feed (filters basic)
- Save contract (`saved_contracts`)
- Apply (`applications`)
- Brand can view applications on contract detail

Acceptance

- Creator saves and later sees saved list
- Creator applies; brand sees applicant list

---

### Milestone 4 — Approve-to-Bid + Bid Submission (Core Marketplace)

**Outcome:** brand approves applicants to bid; creators submit bids; bids expire.

Tasks

- Application status transitions
- Bid table + bid create UI
- Enforce bid expiry (72h) (server-side)

Acceptance

- Only approved creators can bid
- Expired bids cannot be accepted

---

### Milestone 5 — Deal Creation + Escrow Funding (Stripe Connect)

**Outcome:** brand accepts bid → deal created → escrow funded.

Tasks

- `deals` table
- Stripe Connect onboarding for creators
- Stripe PaymentIntent for escrow
- Webhook: payment success updates deal state

Acceptance

- Brand can fund escrow
- Deal moves to funded state

---

### Milestone 6 — Deliverables + Approval Window + Auto-Release

**Outcome:** creator submits deliverable; brand approves; auto-release unless disputed.

Rules

- Approval window 72h; hard cap 96h
- 24h grace after submission before auto-release starts

Tasks

- `deliverables` table
- Submission UI: file upload + link + posted URL
- Admin-reviewed disputes
- Scheduled job/cron: check deals for auto-release eligibility

Acceptance

- Deliverable submission triggers timers
- Approval releases funds
- Auto-release triggers after window when no dispute

---

### Milestone 7 — Revisions (Creator-defined fee)

**Outcome:** revisions only if contract specifies; extra revisions add creator fee.

Tasks

- Store creator `revision_fee` (default \$50)
- Contract includes `included_revisions`
- Revision request flow
- Add-on PaymentIntent for revision fee

Acceptance

- Revision request works
- Fee auto-applies for revisions beyond first

---

### Milestone 8 — Reviews (5-star only)

**Outcome:** post-completion rating system.

Tasks

- `reviews` table
- Prompted UI after completion
- Aggregate rating on profiles

Acceptance

- Ratings visible, no written reviews

---

### Milestone 9 — AI Pro (Trial + Caps)

**Outcome:** creators can generate briefs/pitches via AI under paid plan.

Tasks

- Stripe subscription (Creator Pro) + 3-day trial
- Usage caps stored in DB (daily/monthly)
- AI endpoints (Edge Function)
- UI: “Integration Ideas”, “Pitch Builder”, “Brief Builder”

Acceptance

- Free users blocked
- Trial works
- Caps enforced

---

## 4) Database Schema (MVP)

> Use SQL migrations under `supabase/migrations/`.

### Tables (Core)

- `profiles` (user\_id PK, role, display\_name, created\_at)
- `creators` (user\_id PK FK, revision\_fee, bio, niche\_tags, rating\_avg, rating\_count)
- `brands` (user\_id PK FK, business\_name, website, business\_email, verified\_status)
- `contracts` (id, brand\_user\_id, title, description, niche\_tags, platforms, deliverable\_type, requires\_post\_url, usage\_rights\_fields, included\_revisions, shipping\_required, min\_value\_cents, status, expires\_at, created\_at)
- `saved_contracts` (creator\_user\_id, contract\_id, created\_at)
- `applications` (id, contract\_id, creator\_user\_id, pitch, status, created\_at)
- `bids` (id, contract\_id, creator\_user\_id, price\_cents, timeline\_days, expires\_at, status, created\_at)
- `deals` (id, contract\_id, bid\_id, brand\_user\_id, creator\_user\_id, status, escrow\_payment\_intent\_id, funded\_at, submitted\_at, approval\_deadline\_at, hard\_deadline\_at, dispute\_grace\_ends\_at)
- `deliverables` (id, deal\_id, type, file\_path, url, posted\_url, notes, created\_at)
- `disputes` (id, deal\_id, opened\_by, reason, evidence\_json, status, created\_at)
- `reviews` (id, deal\_id, from\_user\_id, to\_user\_id, rating\_int, created\_at)

### Status Enums (Suggested)

- contract\_status: `draft | live | expired | closed`
- application\_status: `submitted | approved_to_bid | rejected`
- bid\_status: `submitted | accepted | declined | expired`
- deal\_status: `created | escrow_pending | funded | in_progress | submitted | approved | paid | disputed | cancelled`
- dispute\_status: `open | under_review | resolved_creator | resolved_brand | resolved_split`

---

## 5) Row-Level Security (RLS) Principles

### Key Rules

- Creators can read **live contracts**.
- Brands can read contracts they own.
- Applications visible to:
  - creator who applied
  - brand who owns contract
- Bids visible to:
  - creator who placed bid
  - brand who owns contract
- Deals visible to both parties.
- Deliverables visible to both parties.
- Disputes visible to both parties + admin.

### Address Security

- Do **not** store plain addresses in open tables.
- Store creator delivery address in a dedicated table (e.g., `creator_addresses`) with strict RLS.
- Only reveal address to brand via RPC/Edge Function **after deal funded** and only for that deal.

---

## 6) Payments & Webhooks

### Stripe Objects

- Contract posting fee: Checkout Session or PaymentIntent
- Escrow: PaymentIntent linked to deal
- Creator payouts: Stripe Connect transfer on approval/auto-release
- Creator Pro subscription: Stripe Subscriptions w/ 3-day trial
- Revision fee: separate PaymentIntent add-on

### Webhooks (Edge Functions)

- `checkout.session.completed`
- `payment_intent.succeeded`
- `invoice.paid`
- `customer.subscription.updated`

### Webhook Processing Rules

- Idempotent handlers (store processed event ids)
- Validate signatures
- Update DB state transitions atomically

---

## 7) Auto-Release Scheduler

### Rule

- After deliverable submission:
  - `dispute_grace_ends_at = submitted_at + 24h`
  - `approval_deadline_at = submitted_at + 72h`
  - `hard_deadline_at = submitted_at + 96h`
- Auto-release triggers when:
  - now > approval\_deadline\_at AND
  - no dispute open AND
  - now > dispute\_grace\_ends\_at

Implementation Options

- Supabase scheduled Edge Function (preferred)
- External cron calling an authenticated endpoint

---

## 8) UI/UX Guidelines

### Creator Experience

- Scrollable feed, swipe-like save/apply interactions (where sensible)
- Clear, concise contract cards
- Emphasis on clarity of deliverables + pay

### Brand Experience

- Creator discovery feed (phase 2)
- Contract wizard (phase 1)
- Simple applicant review pipeline

### Design Principles

- Clean, modern, human
- Minimal “enterprise” vibe
- High-trust microcopy

---

## 9) Testing & QA (Minimum Standard)

### Required

- Typecheck + lint on CI
- Basic DB tests (migration applies cleanly)
- Webhook idempotency test path
- Manual test scripts for each milestone (stored in `/docs/QA.md`)

---

## 10) Agent Task Queue (Copy/Paste)

### A) Create DB schema migrations

- Create migrations for tables/enums
- Add RLS policies
- Add seed data for local dev

### B) Implement auth + onboarding

- Role selection flow
- Role-based nav guards

### C) Implement contract posting fee

- Stripe integration
- Webhook updates

### D) Implement escrow flow

- Accept bid → create deal → pay escrow
- Webhook marks funded

### E) Implement deliverables + timers

- Submission UI
- Scheduler function

---

## 11) Agent Prompt Examples

### Example 1 — Create `contracts` schema + RLS

**Prompt** You are implementing the Supabase schema for Creative First. Add SQL migrations to create tables: `brands`, `contracts`, `applications`, `saved_contracts`. Include enums for statuses, and RLS policies so that: (1) anyone logged-in can read live contracts, (2) only brand owners can insert/update their contracts, (3) creators can insert saved\_contracts and applications for themselves, and read their own saved/applications, (4) brand owners can read applications for their contracts. Provide a `seed.sql` with one brand, 5 contracts, and 2 creators.

### Example 2 — Escrow webhook handler

**Prompt** Implement a Supabase Edge Function `stripe-webhook` that verifies Stripe signatures and handles `payment_intent.succeeded` for escrow PaymentIntents. Update `deals` state to `funded`, set `funded_at`, and ensure idempotency using a `stripe_events` table. Provide local test instructions.

---

## 12) Environment Variables

### Web app

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY` (server only)
- `STRIPE_WEBHOOK_SECRET` (server only)
- `OPENAI_API_KEY` (server only)

---

## 13) Delivery Checklist

Before calling MVP “done”:

- End-to-end deal lifecycle verified in prod-like env
- RLS verified with real users
- Webhooks idempotent
- Auto-release scheduler tested
- Dispute admin UI functional
- AI Pro caps enforced

---

## 14) Next Document

Create `/docs/ARCHITECTURE.md` after Milestone 2 to lock:

- domain modules
- API routes conventions
- state management
- component strategy

---

**Owner:** Finlay Sturzaker **Timezone:** Australia/Melbourne

