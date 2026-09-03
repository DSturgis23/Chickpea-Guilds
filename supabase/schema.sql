-- ============================================================================
-- Chickpea Guilds — Supabase schema (DRAFT)
-- ============================================================================
-- Not yet applied. This is the planned shape of the database so that swapping
-- src/data/seed.ts for real queries is mechanical. Review before running.
--
-- Conventions:
--   * every table has RLS enabled
--   * "member" = a row in public.profiles, keyed to auth.users.id
--   * roles: member < manager < p_and_c < director < super_admin
-- ============================================================================

-- ---------- enums -----------------------------------------------------------
create type guild_role as enum ('member', 'manager', 'p_and_c', 'director', 'super_admin');
create type pillar_key as enum ('people', 'content', 'environment', 'engagement');
create type award_status as enum ('pending', 'approved', 'rejected');
create type event_visibility as enum ('all', 'role', 'guild');

-- ---------- reference data ------------------------------------------------------
create table guilds (
  id         text primary key,           -- 'stokers'
  name       text not null,              -- 'The Guild of Stokers'
  nickname   text not null,              -- 'The Stoked'
  colour     text not null,
  motto      text,
  sort       int  not null default 0
);

create table pillars (
  key        pillar_key primary key,
  name       text not null,
  colour     text not null,
  cup_award  text not null,
  blurb      text
);

create table behaviours (
  id          uuid primary key default gen_random_uuid(),
  pillar      pillar_key not null references pillars(key),
  title       text not null,
  detail      text,
  points      int  not null check (points > 0),
  auto_award  boolean not null default false,
  active      boolean not null default true,
  sort        int  not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------- people --------------------------------------------------------------
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  first_name  text not null,
  last_name   text not null,
  email       text not null unique,
  guild_id    text references guilds(id),
  site        text,
  job_role    text,
  role        guild_role not null default 'member',
  start_date  date,
  active      boolean not null default true,
  must_reset_password boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------- the spark ledger --------------------------------------------------
-- One row is both the nomination and, once approved, the ledger entry.
create table spark_awards (
  id             uuid primary key default gen_random_uuid(),
  member_id      uuid not null references profiles(id) on delete cascade,
  guild_id       text not null references guilds(id),
  behaviour_id   uuid not null references behaviours(id),
  pillar         pillar_key not null,
  points         int  not null,
  note           text not null default '',
  evidence_url   text,
  status         award_status not null default 'pending',
  nominated_by   uuid references profiles(id),   -- null = automatic award
  decided_by     uuid references profiles(id),
  decided_at     timestamptz,
  occurred_on    date not null default current_date,
  created_at     timestamptz not null default now()
);
create index on spark_awards (status);
create index on spark_awards (occurred_on);
create index on spark_awards (guild_id, occurred_on);
create index on spark_awards (member_id, occurred_on);

-- ---------- events & documents ------------------------------------------------
create table events (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  description    text not null default '',
  starts_at      timestamptz not null,
  ends_at        timestamptz not null,
  location       text,
  created_by     uuid references profiles(id),
  visibility     event_visibility not null default 'all',
  visible_role   guild_role,
  visible_guild  text references guilds(id),
  created_at     timestamptz not null default now()
);

create table documents (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  category    text not null default 'General',
  storage_path text not null,          -- object in the 'documents' bucket
  size_label  text,
  uploaded_by uuid references profiles(id),
  updated_at  timestamptz not null default now()
);

-- ---------- helper: current user's role -------------------------------------
create or replace function auth_role() returns guild_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function is_admin() returns boolean
language sql stable as $$
  select auth_role() in ('p_and_c', 'super_admin')
$$;

-- ---------- RLS -------------------------------------------------------------
alter table guilds        enable row level security;
alter table pillars       enable row level security;
alter table behaviours    enable row level security;
alter table profiles      enable row level security;
alter table spark_awards  enable row level security;
alter table events        enable row level security;
alter table documents     enable row level security;

-- Reference data: readable by any signed-in user, writable by admins.
create policy read_all_guilds     on guilds       for select to authenticated using (true);
create policy read_all_pillars    on pillars      for select to authenticated using (true);
create policy read_all_behaviours on behaviours   for select to authenticated using (true);
create policy admin_write_guilds     on guilds     for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_write_behaviours on behaviours for all to authenticated using (is_admin()) with check (is_admin());

-- Profiles: everyone can read the directory; you can edit yourself; admins edit anyone.
create policy read_profiles   on profiles for select to authenticated using (true);
create policy update_own      on profiles for update to authenticated using (id = auth.uid());
create policy admin_profiles  on profiles for all    to authenticated using (is_admin()) with check (is_admin());

-- Spark awards: read all (leaderboards are public within the company);
-- any member can create a pending nomination for someone else;
-- only admins can move a row out of 'pending'.
create policy read_awards     on spark_awards for select to authenticated using (true);
create policy nominate        on spark_awards for insert to authenticated
  with check (nominated_by = auth.uid() and status = 'pending' and member_id <> auth.uid());
create policy admin_decide    on spark_awards for update to authenticated
  using (is_admin()) with check (is_admin());

-- Events: visibility filter enforced in SQL; managers+ can post.
create policy read_events on events for select to authenticated using (
  visibility = 'all'
  or (visibility = 'guild' and visible_guild = (select guild_id from profiles where id = auth.uid()))
  or (visibility = 'role'  and (auth_role() = visible_role or auth_role() in ('p_and_c','director','super_admin')))
);
create policy write_events on events for all to authenticated
  using (auth_role() in ('manager','p_and_c','director','super_admin'))
  with check (auth_role() in ('manager','p_and_c','director','super_admin'));

-- Documents: everyone reads, admins manage.
create policy read_documents  on documents for select to authenticated using (true);
create policy admin_documents on documents for all    to authenticated using (is_admin()) with check (is_admin());

-- ---------- seed the two super admins (after they first sign in) ------------
-- update profiles set role = 'super_admin'
--   where email in ('delsturg@gmail.com', 'jordan@chickpea.group');
