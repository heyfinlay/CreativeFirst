# Architecture (Milestones 0–3)

## Routing Map (current)

- `/` landing
- `/login` login
- `/signup` signup
- `/onboarding/role` role selection
- `/creator` creator dashboard
- `/creator/contracts` live contracts feed
- `/creator/saved` saved contracts
- `/creator/applications` applications list
- `/brand` brand dashboard
- `/brand/contracts` brand contracts list
- `/brand/contracts/new` create contract
- `/brand/contracts/[id]` contract detail + applicants

## Supabase Access Pattern

- Server components use `src/lib/supabase/server.ts`.
- Client components use `src/lib/supabase/browser.ts`.
- Route handlers (future) should use `src/lib/supabase/route.ts`.

RLS is enforced for all core tables. Server actions still rely on auth
checks + RLS as the final guardrail.

## Migrations

- Stored in `supabase/migrations` and applied via `supabase db reset`.
- Seed guidance lives in `supabase/seed.sql`.

## Adding New Features (next: bids)

1. Add enum/table + RLS in a new migration.
2. Add creator/brand UI surfaces in `/src/app`.
3. Keep mutations in server actions or route handlers, backed by RLS.
4. Update `docs/ARCHITECTURE.md` routing map as new routes are added.
