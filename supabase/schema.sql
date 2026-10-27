-- framebyframe — early access schema
-- Run this in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

create table if not exists public.early_access (
  id              uuid primary key references auth.users on delete cascade,
  email           text,
  full_name       text,
  avatar_url      text,
  member_number   bigint generated always as identity,
  founding_member boolean not null default true,
  created_at      timestamptz not null default now()
);

comment on table public.early_access is
  'One row per person who signed up before launch. member_number is their queue position.';

alter table public.early_access enable row level security;

-- Everyone may read their own row; nobody can write directly (the trigger below does it).
drop policy if exists "read own early access row" on public.early_access;
create policy "read own early access row"
  on public.early_access for select
  using (auth.uid() = id);

-- Anonymous visitors are allowed to see how many people signed up (for the counter).
create or replace function public.early_access_count()
returns bigint
language sql
security definer
set search_path = public
as $$
  select count(*) from public.early_access;
$$;

grant execute on function public.early_access_count() to anon, authenticated;

-- Copy every new auth user into early_access, pulling name/avatar out of the Google profile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.early_access (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Diary: one row per viewing. Logging the same film twice is two rows, which
-- is what a rewatch is.
-- ---------------------------------------------------------------------------

create table if not exists public.diary_entries (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users on delete cascade default auth.uid(),
  film_id      integer not null,
  -- A snapshot of the TMDB fields the diary list shows, so reading the diary
  -- costs no TMDB calls.
  title        text not null,
  release_year smallint,
  poster_path  text,
  watched_on   date not null default current_date,
  -- Half stars stored as whole numbers: 1 = half a star, 10 = five stars.
  rating       smallint check (rating between 1 and 10),
  rewatch      boolean not null default false,
  created_at   timestamptz not null default now()
);

comment on table public.diary_entries is
  'One row per film watched. rating is in half stars (1-10), null when unrated.';

create index if not exists diary_entries_user_watched
  on public.diary_entries (user_id, watched_on desc, created_at desc);

alter table public.diary_entries enable row level security;

drop policy if exists "read own diary" on public.diary_entries;
create policy "read own diary"
  on public.diary_entries for select
  using (auth.uid() = user_id);

drop policy if exists "write own diary" on public.diary_entries;
create policy "write own diary"
  on public.diary_entries for insert
  with check (auth.uid() = user_id);

drop policy if exists "delete own diary" on public.diary_entries;
create policy "delete own diary"
  on public.diary_entries for delete
  using (auth.uid() = user_id);
