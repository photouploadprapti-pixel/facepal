alter table public.checkins
  add column if not exists blemishes smallint not null default 0
    check (blemishes between 0 and 100),
  add column if not exists quality smallint not null default 0
    check (quality between 0 and 100);

update public.checkins
set quality = greatest(
  0,
  least(
    100,
    round(100 - ((redness + under_eye + texture + uneven_tone + blemishes) / 5.0))
  )
)
where quality = 0;
