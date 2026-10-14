-- FacePal: profiles, private selfies, face yoga, and tips.

create schema if not exists private;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  consent_accepted_at timestamptz,
  reminder_hour smallint not null default 8 check (reminder_hour between 0 and 23),
  created_at timestamptz not null default now()
);

create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  captured_at timestamptz not null default now(),
  storage_path text not null,
  redness smallint not null check (redness between 0 and 100),
  under_eye smallint not null check (under_eye between 0 and 100),
  texture smallint not null check (texture between 0 and 100),
  uneven_tone smallint not null check (uneven_tone between 0 and 100),
  findings text[] not null default '{}',
  summary text not null,
  created_at timestamptz not null default now()
);

create table public.yoga_routines (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  zone text not null,
  minutes integer not null check (minutes > 0),
  summary text not null,
  level text not null,
  video_url text,
  sort_order integer not null default 0,
  published boolean not null default true
);

create table public.yoga_steps (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.yoga_routines (id) on delete cascade,
  step_order integer not null,
  title text not null,
  instruction text not null,
  seconds integer not null check (seconds > 0),
  animation_key text not null check (
    animation_key in ('blink', 'smile', 'puff', 'brow', 'jaw', 'kiss', 'neck')
  ),
  unique (routine_id, step_order)
);

create table public.yoga_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  routine_id uuid not null references public.yoga_routines (id) on delete cascade,
  completed_at timestamptz not null default now()
);

create table public.tips (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  body text not null,
  sort_order integer not null default 0
);

create index checkins_user_captured_idx
  on public.checkins (user_id, captured_at desc);

alter table public.profiles enable row level security;
alter table public.checkins enable row level security;
alter table public.yoga_routines enable row level security;
alter table public.yoga_steps enable row level security;
alter table public.yoga_sessions enable row level security;
alter table public.tips enable row level security;

create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check (id = (select auth.uid()));

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy profiles_delete_own on public.profiles
  for delete to authenticated
  using (id = (select auth.uid()));

create policy checkins_select_own on public.checkins
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy checkins_insert_own on public.checkins
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy checkins_delete_own on public.checkins
  for delete to authenticated
  using (user_id = (select auth.uid()));

create policy yoga_routines_read on public.yoga_routines
  for select to anon, authenticated
  using (published = true);

create policy yoga_steps_read on public.yoga_steps
  for select to anon, authenticated
  using (
    exists (
      select 1
      from public.yoga_routines
      where yoga_routines.id = yoga_steps.routine_id
        and yoga_routines.published = true
    )
  );

create policy yoga_sessions_select_own on public.yoga_sessions
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy yoga_sessions_insert_own on public.yoga_sessions
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy yoga_sessions_delete_own on public.yoga_sessions
  for delete to authenticated
  using (user_id = (select auth.uid()));

create policy tips_read on public.tips
  for select to anon, authenticated
  using (true);

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, delete on public.checkins to authenticated;
grant select on public.yoga_routines to anon, authenticated;
grant select on public.yoga_steps to anon, authenticated;
grant select, insert, delete on public.yoga_sessions to authenticated;
grant select on public.tips to anon, authenticated;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', '')
  );
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

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

revoke all on function public.delete_my_facepal_data() from public, anon;
grant execute on function public.delete_my_facepal_data() to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('selfies', 'selfies', false, 5242880, array['image/jpeg'])
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'yoga-media',
  'yoga-media',
  true,
  104857600,
  array['video/mp4', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

create policy selfies_select_own on storage.objects
  for select to authenticated
  using (
    bucket_id = 'selfies'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy selfies_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'selfies'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy selfies_delete_own on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'selfies'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy yoga_media_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'yoga-media');

insert into public.yoga_routines (slug, title, zone, minutes, summary, level, sort_order)
values
  (
    'jawline-release',
    'Jawline release',
    'Jaw',
    6,
    'Loosen a clenched jaw and wake up the muscles under the chin.',
    'Easy',
    1
  ),
  (
    'eye-decompression',
    'Eye decompression',
    'Eyes',
    5,
    'Rest the ring of muscle around the eyes after screens.',
    'Easy',
    2
  ),
  (
    'forehead-smooth',
    'Forehead smooth',
    'Forehead',
    5,
    'Practice lifting and releasing the brow without crunching the forehead.',
    'Easy',
    3
  ),
  (
    'cheek-lift',
    'Cheek lift',
    'Cheeks',
    6,
    'A slow smile sequence for the cheeks and the corners of the mouth.',
    'Medium',
    4
  ),
  (
    'glow-flow',
    'Full glow flow',
    'Full face',
    8,
    'A short sequence that visits the forehead, eyes, cheeks, and jaw.',
    'Medium',
    5
  );

insert into public.yoga_steps (routine_id, step_order, title, instruction, seconds, animation_key)
select id, 1, 'Unclench', 'Let the teeth part. Rest the tongue on the roof of the mouth.', 30, 'jaw'
from public.yoga_routines where slug = 'jawline-release';
insert into public.yoga_steps (routine_id, step_order, title, instruction, seconds, animation_key)
select id, 2, 'Slide the jaw', 'Slide the lower jaw slowly to the left, then the right. Keep the neck still.', 40, 'jaw'
from public.yoga_routines where slug = 'jawline-release';
insert into public.yoga_steps (routine_id, step_order, title, instruction, seconds, animation_key)
select id, 3, 'Kiss the ceiling', 'Tilt the chin up slightly and purse the lips forward. Stop if the neck pinches.', 30, 'kiss'
from public.yoga_routines where slug = 'jawline-release';
insert into public.yoga_steps (routine_id, step_order, title, instruction, seconds, animation_key)
select id, 4, 'Soft close', 'Close the lips gently and breathe out for a long count.', 30, 'neck'
from public.yoga_routines where slug = 'jawline-release';

insert into public.yoga_steps (routine_id, step_order, title, instruction, seconds, animation_key)
select id, 1, 'Palm rest', 'Close the eyes and cover them with warm palms. Do not press.', 30, 'blink'
from public.yoga_routines where slug = 'eye-decompression';
insert into public.yoga_steps (routine_id, step_order, title, instruction, seconds, animation_key)
select id, 2, 'Slow blink', 'Blink slowly ten times. Let the lids meet fully.', 30, 'blink'
from public.yoga_routines where slug = 'eye-decompression';
insert into public.yoga_steps (routine_id, step_order, title, instruction, seconds, animation_key)
select id, 3, 'Look around', 'Look up, down, left, and right without moving the head.', 30, 'blink'
from public.yoga_routines where slug = 'eye-decompression';

insert into public.yoga_steps (routine_id, step_order, title, instruction, seconds, animation_key)
select id, 1, 'Lift the brows', 'Lift the brows while the rest of the face stays soft. Lower them slowly.', 30, 'brow'
from public.yoga_routines where slug = 'forehead-smooth';
insert into public.yoga_steps (routine_id, step_order, title, instruction, seconds, animation_key)
select id, 2, 'Smooth across', 'Place fingers above the brows and stroke toward the temples.', 40, 'brow'
from public.yoga_routines where slug = 'forehead-smooth';
insert into public.yoga_steps (routine_id, step_order, title, instruction, seconds, animation_key)
select id, 3, 'Hold and release', 'Raise the brows, hold for a breath, then release completely.', 30, 'brow'
from public.yoga_routines where slug = 'forehead-smooth';

insert into public.yoga_steps (routine_id, step_order, title, instruction, seconds, animation_key)
select id, 1, 'Small smile', 'Smile just enough to feel the cheeks. Keep the eyes relaxed.', 30, 'smile'
from public.yoga_routines where slug = 'cheek-lift';
insert into public.yoga_steps (routine_id, step_order, title, instruction, seconds, animation_key)
select id, 2, 'Puff and hold', 'Fill the cheeks with air, hold, then let the air out slowly.', 30, 'puff'
from public.yoga_routines where slug = 'cheek-lift';
insert into public.yoga_steps (routine_id, step_order, title, instruction, seconds, animation_key)
select id, 3, 'Corner lift', 'Lift one mouth corner, then the other. Alternate.', 40, 'smile'
from public.yoga_routines where slug = 'cheek-lift';

insert into public.yoga_steps (routine_id, step_order, title, instruction, seconds, animation_key)
select id, 1, 'Brow lift', 'Lift and lower the brows three times.', 25, 'brow'
from public.yoga_routines where slug = 'glow-flow';
insert into public.yoga_steps (routine_id, step_order, title, instruction, seconds, animation_key)
select id, 2, 'Slow blink', 'Close the eyes fully, then open them without squinting.', 25, 'blink'
from public.yoga_routines where slug = 'glow-flow';
insert into public.yoga_steps (routine_id, step_order, title, instruction, seconds, animation_key)
select id, 3, 'Cheek smile', 'Smile slowly and release.', 25, 'smile'
from public.yoga_routines where slug = 'glow-flow';
insert into public.yoga_steps (routine_id, step_order, title, instruction, seconds, animation_key)
select id, 4, 'Jaw slide', 'Slide the jaw left and right once each.', 25, 'jaw'
from public.yoga_routines where slug = 'glow-flow';
insert into public.yoga_steps (routine_id, step_order, title, instruction, seconds, animation_key)
select id, 5, 'Neck ease', 'Turn the head a little left, then right. Stay in a pain-free range.', 30, 'neck'
from public.yoga_routines where slug = 'glow-flow';

insert into public.tips (category, title, body, sort_order) values
  (
    'Sun',
    'Sunscreen is the youth habit',
    'A broad-spectrum SPF 30 in the morning does more for tone than most serums. Reapply if you are outside for hours.',
    1
  ),
  (
    'Sleep',
    'Protect the hours before midnight',
    'Under-eye darkness often tracks short sleep. Aim for a steady bedtime more than a new eye cream.',
    2
  ),
  (
    'Skin',
    'Moisturize on damp skin',
    'Apply moisturizer while the face is still slightly damp so texture looks smoother without heavy layers.',
    3
  ),
  (
    'Skin',
    'Skip the harsh scrub',
    'Gritty scrubs can leave cheeks flushed. If you exfoliate, use a gentle product a few nights a week and stop if skin stings.',
    4
  ),
  (
    'Habits',
    'Do not pick',
    'Picking a spot inflames it and can leave a mark that lasts longer than the spot itself.',
    5
  ),
  (
    'Habits',
    'Notice the clench',
    'A tight jaw during work shows up as fatigue in the lower face. The jawline release routine is a good midday reset.',
    6
  ),
  (
    'Food',
    'Water and less late salt',
    'A salty late meal can puff the face by morning. Drink water through the day and keep heavy salt earlier.',
    7
  ),
  (
    'Photos',
    'Same window, same time',
    'FacePal compares more fairly when the selfie is in the same spot and light. Side light can look like uneven tone.',
    8
  );
