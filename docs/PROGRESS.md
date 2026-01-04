# PROGRESS.md — Creative First Build Tracker

This document is the **single source of truth for build progress**. It exists to:

* Track exactly where the project is in relation to milestones
* Remove ambiguity when resuming work with agentic coding tools
* Allow any agent (or human) to instantly understand current state

> **Rule:** This file MUST be updated whenever a milestone item is completed.

---

## Status Legend

* ⬜ Not started
* 🟡 In progress
* ✅ Completed
* ⛔ Blocked

---

## Milestone 0 — Project Bootstrap

**Goal:** App runs locally with Supabase connected and basic tooling in place.

* ✅ Next.js App Router initialized (TS + Tailwind)
* ✅ Linting / typecheck scripts configured
* ✅ Environment variable strategy defined
* ✅ Supabase local dev setup verified
* ✅ Repo structure aligned with AGENT.MD

**Milestone 0 Status:** ✅ Completed

---

## Milestone 1 — Auth + Role Onboarding

**Goal:** Users can sign up/login, select a role, and land in the correct dashboard.

* ✅ Supabase Auth configured
* ✅ `profiles` table created with RLS
* ✅ Role enum (`creator | brand | admin`) enforced
* ✅ Role onboarding flow (`/onboarding/role`)
* ⛔ Auth helper bug discovered (`createBrowserClient` import)
* 🟡 Auth helper fix applied / pending verification
* 🟡 End-to-end signup + login verification

**Milestone 1 Status:** 🟡 In progress (blocked until auth verification passes)

---

## Milestone 2 — Brand Contract Posting

**Goal:** Brands can create, publish, and manage contracts.

* ✅ `brands` table created with RLS
* ✅ `contracts` table created with status enum
* ✅ Contract create wizard (`/brand/contracts/new`)
* ✅ Contract list (`/brand/contracts`)
* ✅ Contract detail page (`/brand/contracts/[id]`)
* ✅ `live_requires_payment` placeholder status implemented
* ⬜ Stripe posting fee enforcement (deferred)

**Milestone 2 Status:** ✅ Completed (payment gating deferred intentionally)

---

## Milestone 3 — Creator Discovery, Save & Apply

**Goal:** Creators can browse contracts, save them, apply, and brands can review applicants.

### 3.1 Contract Discovery

* ✅ Creator live contracts feed (`/creator/contracts`)
* ✅ Excludes `draft` and `live_requires_payment`

### 3.2 Save Contracts

* ✅ `saved_contracts` table + RLS
* ✅ Save / unsave toggle in creator feed
* ✅ Saved contracts page (`/creator/saved`)

### 3.3 Apply to Contracts

* ✅ `applications` table + RLS
* ✅ Application status enum (`submitted | approved_to_bid | rejected`)
* ✅ Apply UI (creator)
* ✅ `/creator/applications` page

### 3.4 Brand Applicant Review

* ✅ Applicants list on `/brand/contracts/[id]`
* ✅ Approve-to-bid action
* ✅ Reject action

### 3.5 Documentation

* ✅ `docs/ARCHITECTURE.md` created and aligned with milestones 0–3

**Milestone 3 Status:** ✅ Completed

---

## Milestone 4 — Approve-to-Bid + Bid Submission

**Goal:** Brands approve applicants to bid; creators submit bids with expiry.

* ⬜ `bids` table + status enum
* ⬜ Bid expiry enforcement (72h)
* ⬜ Bid submission UI (creator)
* ⬜ Bid review + accept UI (brand)

**Milestone 4 Status:** ⬜ Not started

---

## Milestone 5 — Deals + Escrow Funding

**Goal:** Accepted bids convert into funded deals.

* ⬜ `deals` table
* ⬜ Stripe Connect onboarding (creators)
* ⬜ Escrow PaymentIntent creation
* ⬜ Webhook: escrow funded → deal state update

**Milestone 5 Status:** ⬜ Not started

---

## Milestone 6 — Deliverables + Approval + Auto-Release

**Goal:** Creators submit deliverables; brands approve or auto-release triggers.

* ⬜ `deliverables` table
* ⬜ Deliverable submission UI (file/link/post URL)
* ⬜ Approval timers (72h / 96h)
* ⬜ Auto-release scheduler
* ⬜ Dispute grace period (24h)

**Milestone 6 Status:** ⬜ Not started

---

## Milestone 7 — Revisions

**Goal:** Controlled revision flow with creator-defined fees.

* ⬜ Creator `revision_fee` stored (default $50)
* ⬜ Contract includes revision count
* ⬜ Revision request flow
* ⬜ Paid add-on revision handling

**Milestone 7 Status:** ⬜ Not started

---

## Milestone 8 — Reviews

**Goal:** Lightweight trust system.

* ⬜ `reviews` table
* ⬜ 5-star rating UI
* ⬜ Rating aggregation on profiles

**Milestone 8 Status:** ⬜ Not started

---

## Milestone 9 — AI Pro (Deprioritised)

**Goal:** Creator productivity tools under paid plan.

* ⬜ Creator Pro subscription
* ⬜ AI usage caps
* ⬜ Brief / pitch generation

**Milestone 9 Status:** ⬜ Not started (intentionally deferred)

---

## Operating Rules

1. **Before starting a new milestone**, confirm the previous milestone status here.
2. **After completing a task**, update the relevant checkbox immediately.
3. Agents must reference this document at the start of each work session.
4. If a task is blocked, mark it ⛔ and explain why in commit notes.

---

## Maintenance Log

* 2025-01-04: Cleaned tracked `.next` build artifacts and refreshed `npm install` to address Vercel install failures.

---

*Last updated: manually*
