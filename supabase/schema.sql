-- CoachOS marketing site — lead capture table
--
-- Run this once in the Supabase SQL Editor, on a fresh project
-- (https://supabase.com -> New project -> SQL Editor -> paste -> Run).
--
-- This is deliberately just a lead-capture table for the marketing site
-- (waitlist signups + quiz-result requests), not the real product's user
-- accounts. Same project the real CoachOS app will eventually run on
-- (per docs/07-architecture.md), so leads captured here need no migration
-- later -- they'll already be sitting in the right database.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null,
  source text not null,          -- 'waitlist' or 'quiz:<slug>', e.g. 'quiz:lead-leakage'
  quiz_score int,                -- null for waitlist signups
  quiz_max int,
  quiz_band text
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_email_idx on public.leads (email);

-- Row Level Security: the public "anon" key (safe to embed in client-side
-- JS -- that's what it's for) may INSERT a lead and nothing else. No
-- select/update/delete policy exists for anon, so those stay denied by
-- default once RLS is enabled below. Only you, via the Supabase dashboard
-- (which authenticates as you, not as "anon"), can read the leads table.
alter table public.leads enable row level security;

create policy "Public can insert leads"
  on public.leads
  for insert
  to anon
  with check (true);

-- After running this file:
-- 1. Project Settings -> API -> copy the "Project URL" and the "anon / public" key.
-- 2. Paste both into assets/main.js, replacing the SUPABASE_URL and
--    SUPABASE_ANON_KEY placeholders near the top of the "Lead capture" section.
-- 3. That's it -- the waitlist form and the quiz result-email form both call
--    window.coachosSubmitLead(...) already; they'll start writing to this
--    table the moment real credentials are in place, and fall back to the
--    existing mailto: behavior until then.
