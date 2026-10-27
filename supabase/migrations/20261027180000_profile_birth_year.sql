alter table public.profiles
  add column if not exists birth_year integer
    check (birth_year is null or (birth_year >= 1900 and birth_year <= 2100));
