-- Enums
create type role as enum ('creator', 'brand', 'admin');
create type contract_status as enum ('draft', 'live', 'expired', 'closed');

-- Tables
create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role role not null,
  display_name text,
  created_at timestamptz default now()
);

create table brands (
  user_id uuid primary key references profiles(user_id) on delete cascade,
  business_name text not null,
  website text not null,
  business_email text not null,
  verified_status text default 'unverified',
  created_at timestamptz default now()
);

create table contracts (
  id uuid primary key default gen_random_uuid(),
  brand_user_id uuid references brands(user_id) not null,
  title text not null,
  description text not null,
  niche_tags text[] default '{}',
  platforms text[] default '{}',
  deliverable_type text default 'unspecified',
  requires_post_url boolean default false,
  included_revisions int default 0,
  shipping_required boolean default false,
  min_value_cents int default 10000,
  status contract_status default 'draft',
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- RLS
alter table profiles enable row level security;
alter table brands enable row level security;
alter table contracts enable row level security;

-- profiles policies
create policy "profiles_select_own"
  on profiles for select
  using (auth.uid() = user_id);

create policy "profiles_insert_own"
  on profiles for insert
  with check (auth.uid() = user_id);

create policy "profiles_update_own"
  on profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- brands policies
create policy "brands_select_owner_or_admin"
  on brands for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from profiles
      where profiles.user_id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "brands_insert_owner"
  on brands for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from profiles
      where profiles.user_id = auth.uid()
      and profiles.role in ('brand', 'admin')
    )
  );

create policy "brands_update_owner"
  on brands for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "brands_delete_owner"
  on brands for delete
  using (auth.uid() = user_id);

-- contracts policies
create policy "contracts_select_live"
  on contracts for select
  using (status = 'live');

create policy "contracts_select_owner"
  on contracts for select
  using (auth.uid() = brand_user_id);

create policy "contracts_insert_owner"
  on contracts for insert
  with check (auth.uid() = brand_user_id);

create policy "contracts_update_owner"
  on contracts for update
  using (auth.uid() = brand_user_id)
  with check (auth.uid() = brand_user_id);
