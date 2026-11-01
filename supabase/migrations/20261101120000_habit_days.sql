-- Daily skin habits that sit beside selfie scores (sleep, water, SPF, stress, routine).

alter table public.profiles
  add column if not exists birth_year integer
    check (birth_year is null or (birth_year >= 1900 and birth_year <= 2100));

create table if not exists public.habit_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  day date not null,
  sleep_hours numeric(3,1)
    check (sleep_hours is null or (sleep_hours >= 0 and sleep_hours <= 24)),
  water_glasses smallint not null default 0
    check (water_glasses between 0 and 20),
  spf_worn boolean not null default false,
  stress_level smallint
    check (stress_level is null or (stress_level between 1 and 5)),
  cleansed_am boolean not null default false,
  moisturized boolean not null default false,
  cleansed_pm boolean not null default false,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, day)
);

alter table public.habit_days enable row level security;

drop policy if exists habit_days_select_own on public.habit_days;
create policy habit_days_select_own on public.habit_days
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists habit_days_insert_own on public.habit_days;
create policy habit_days_insert_own on public.habit_days
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists habit_days_update_own on public.habit_days;
create policy habit_days_update_own on public.habit_days
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists habit_days_delete_own on public.habit_days;
create policy habit_days_delete_own on public.habit_days
  for delete to authenticated using (auth.uid() = user_id);

grant select, insert, update, delete on public.habit_days to authenticated;

create or replace function public.delete_my_facepal_data()
returns void
language plpgsql
security invoker
set search_path = public, storage
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  delete from public.habit_days where user_id = auth.uid();
  delete from public.yoga_sessions where user_id = auth.uid();
  delete from public.checkins where user_id = auth.uid();
  delete from storage.objects
  where bucket_id = 'selfies'
    and (storage.foldername(name))[1] = auth.uid()::text;
  update public.profiles
  set consent_accepted_at = null
  where id = auth.uid();
end;
$$;
