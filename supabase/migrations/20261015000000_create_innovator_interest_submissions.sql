create table public.innovator_interest_submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null
    check (char_length(trim(full_name)) between 2 and 120),
  email text not null
    check (
      char_length(trim(email)) between 3 and 254
      and email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+[.][A-Z]{2,}$'
    ),
  phone text not null
    check (phone ~ '^[+0-9() .-]{7,25}$'),
  profile_url text not null
    check (profile_url ~* '^https?://'),
  current_position text not null
    check (char_length(trim(current_position)) between 2 and 120),
  fit_reason text not null
    check (char_length(trim(fit_reason)) between 30 and 2000),
  created_at timestamptz not null default now()
);
create unique index innovator_submissions_email_unique
  on public.innovator_interest_submissions (lower(trim(email)));
alter table public.innovator_interest_submissions enable row level security;
revoke all on table public.innovator_interest_submissions from public, anon, authenticated;
grant usage on schema public to anon;
grant insert (full_name, email, phone, profile_url, current_position, fit_reason)
  on public.innovator_interest_submissions to anon;
create policy "Public can submit candidate interest"
  on public.innovator_interest_submissions for insert to anon with check (true);
