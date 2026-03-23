-- 001_init_survivor_liga.sql
create extension if not exists "pgcrypto";

create table if not exists public.avatars (
  id bigserial primary key,
  name text not null,
  slug text unique not null,
  image_url text not null,
  active boolean not null default true,
  sort_order int not null default 0
);

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  password_hash text,
  role text not null default 'player' check (role in ('admin', 'player')),
  status text not null default 'active' check (status in ('active', 'inactive', 'eliminated')),
  avatar_id bigint references public.avatars(id),
  created_at timestamptz not null default now()
);

create table if not exists public.invitations (
  id bigserial primary key,
  token uuid not null unique default gen_random_uuid(),
  email text not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.teams (
  id bigserial primary key,
  name text not null unique,
  short_name text not null,
  logo_url text not null
);

create table if not exists public.rounds (
  id bigserial primary key,
  round_number int not null,
  season text not null,
  deadline timestamptz not null,
  timezone text not null default 'Europe/Madrid',
  status text not null default 'open' check (status in ('open', 'closed', 'resolved')),
  created_at timestamptz not null default now(),
  unique (season, round_number)
);

create table if not exists public.picks (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  round_id bigint not null references public.rounds(id) on delete cascade,
  team_id bigint not null references public.teams(id),
  is_repeated_pick boolean not null default false,
  is_invalid boolean not null default false,
  invalid_reason text,
  created_at timestamptz not null default now(),
  unique (user_id, round_id)
);

create table if not exists public.results (
  id bigserial primary key,
  round_id bigint not null references public.rounds(id) on delete cascade,
  team_id bigint not null references public.teams(id),
  result text not null check (result in ('win', 'draw', 'loss')),
  entered_at timestamptz not null default now(),
  source text not null default 'manual' check (source in ('manual', 'api')),
  unique (round_id, team_id)
);

create table if not exists public.notification_logs (
  id bigserial primary key,
  round_id bigint not null references public.rounds(id) on delete cascade,
  type text not null check (type in ('pre_deadline', 'post_deadline')),
  sent_at timestamptz not null default now(),
  recipients_count int not null default 0,
  donors_count int not null default 0,
  unique (round_id, type)
);

create table if not exists public.meta_state (
  key text primary key,
  value text not null
);

insert into public.meta_state(key, value)
values ('current_season', '2026-2027')
on conflict (key) do nothing;

create index if not exists idx_rounds_status_deadline on public.rounds(status, deadline);
create index if not exists idx_picks_round on public.picks(round_id);
create index if not exists idx_picks_user on public.picks(user_id);
create index if not exists idx_results_round on public.results(round_id);
create index if not exists idx_users_status on public.users(status);

alter table public.users enable row level security;
alter table public.invitations enable row level security;
alter table public.teams enable row level security;
alter table public.rounds enable row level security;
alter table public.picks enable row level security;
alter table public.results enable row level security;
alter table public.avatars enable row level security;
alter table public.notification_logs enable row level security;
alter table public.meta_state enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid() and u.role = 'admin'
  );
$$;

create policy "users_select_self_or_admin" on public.users
for select using (id = auth.uid() or public.is_admin());

create policy "users_update_self_or_admin" on public.users
for update using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

create policy "avatars_read_authenticated" on public.avatars
for select using (auth.uid() is not null);

create policy "teams_read_authenticated" on public.teams
for select using (auth.uid() is not null);

create policy "rounds_read_authenticated" on public.rounds
for select using (auth.uid() is not null);

create policy "results_read_authenticated" on public.results
for select using (auth.uid() is not null);

create policy "picks_select_self_or_admin" on public.picks
for select using (user_id = auth.uid() or public.is_admin());

create policy "picks_insert_self_or_admin" on public.picks
for insert with check (user_id = auth.uid() or public.is_admin());

create policy "picks_update_self_or_admin" on public.picks
for update using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "admin_all_invitations" on public.invitations
for all using (public.is_admin()) with check (public.is_admin());

create policy "admin_all_notification_logs" on public.notification_logs
for all using (public.is_admin()) with check (public.is_admin());

create policy "meta_state_admin_only" on public.meta_state
for all using (public.is_admin()) with check (public.is_admin());
