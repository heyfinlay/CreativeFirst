create table if not exists public.creator_public_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  handle text not null unique,
  display_name text not null,
  headline text,
  bio text,
  avatar_url text,
  tags text[] not null default '{}',
  stats jsonb not null default '{}',
  platforms jsonb not null default '[]'::jsonb,
  prerequisites jsonb not null default '{}',
  content_style text[] not null default '{}',
  audience jsonb not null default '{}',
  portfolio jsonb not null default '[]'::jsonb,
  is_pro boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index if not exists creator_public_profiles_handle_lower_unique
  on public.creator_public_profiles (lower(handle));

create index if not exists creator_public_profiles_user_id_idx
  on public.creator_public_profiles (user_id);

alter table public.creator_public_profiles enable row level security;

create policy "creator_public_profiles_select_public"
  on public.creator_public_profiles for select
  using (true);

create policy "creator_public_profiles_insert_owner"
  on public.creator_public_profiles for insert
  with check (auth.uid() = user_id);

create policy "creator_public_profiles_update_owner"
  on public.creator_public_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "creator_public_profiles_delete_owner"
  on public.creator_public_profiles for delete
  using (auth.uid() = user_id);

drop trigger if exists set_creator_public_profiles_updated_at on public.creator_public_profiles;
create trigger set_creator_public_profiles_updated_at
  before update on public.creator_public_profiles
  for each row execute function public.set_updated_at();

create table if not exists public.collaboration_requests (
  id uuid primary key default gen_random_uuid(),
  creator_user_id uuid not null references auth.users(id) on delete cascade,
  brand_user_id uuid references auth.users(id),
  brand_email text,
  brand_name text,
  budget_aud integer,
  deliverables text,
  message text,
  status text not null default 'submitted',
  created_at timestamptz default now()
);

create index if not exists collaboration_requests_creator_user_id_idx
  on public.collaboration_requests (creator_user_id);

create index if not exists collaboration_requests_brand_user_id_idx
  on public.collaboration_requests (brand_user_id);

alter table public.collaboration_requests enable row level security;

create policy "collaboration_requests_insert_brand"
  on public.collaboration_requests for insert
  with check (auth.uid() = brand_user_id);

create policy "collaboration_requests_select_creator"
  on public.collaboration_requests for select
  using (
    auth.uid() = creator_user_id
    or auth.uid() = brand_user_id
  );

create policy "collaboration_requests_update_creator"
  on public.collaboration_requests for update
  using (auth.uid() = creator_user_id)
  with check (auth.uid() = creator_user_id);
