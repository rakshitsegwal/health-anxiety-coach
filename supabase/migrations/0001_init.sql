-- 0001_init.sql — The Symptom Spiral Reset · MVP schema
-- Run in the Supabase SQL editor (or via the Supabase CLI).
-- RLS is enabled on every table. The server uses the service-role key
-- (which bypasses RLS) for all writes that grant access: leads, orders,
-- profile provisioning, and webhook processing.

create extension if not exists pgcrypto;

-- ---------- LEADS (captured at the assessment email gate; pre-purchase) ----------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  assessment_score int not null check (assessment_score between 0 and 100),
  band text not null check (band in ('occasional','active','strong','intense')),
  dominant_driver text not null check (dominant_driver in ('searching','checking','reassurance')),
  answers jsonb,                       -- sensitive; server-write only
  utm jsonb,
  got_free_day1 boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists leads_email_idx on public.leads (email);
create index if not exists leads_created_at_idx on public.leads (created_at);

-- ---------- ORDERS ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  user_id uuid references auth.users(id) on delete set null,
  razorpay_order_id text not null unique,
  razorpay_payment_id text,
  amount int not null,                 -- paise (₹999 = 99900)
  currency text not null default 'INR',
  status text not null default 'created' check (status in ('created','paid','failed','refunded')),
  plan text not null default '14day',
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  refunded_at timestamptz
);
create index if not exists orders_email_idx on public.orders (email);
create index if not exists orders_user_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);

-- ---------- PROFILES (1:1 with auth.users; provisioned post-payment) ----------
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  enrollment_date timestamptz not null default now(),   -- drives drip (off at launch)
  baseline_score int,
  baseline_band text,
  plan text not null default '14day',
  created_at timestamptz not null default now()
);

-- ---------- DAILY PROGRESS (completion-focused; no charts/gamification) ----------
create table if not exists public.daily_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_number int not null check (day_number between 1 and 14),
  completed_at timestamptz,            -- presence => completed
  reflection jsonb,                    -- optional future check-in; no MVP UI
  created_at timestamptz not null default now(),
  unique (user_id, day_number)
);
create index if not exists daily_progress_user_idx on public.daily_progress (user_id);

-- ---------- WEBHOOK IDEMPOTENCY ----------
create table if not exists public.processed_webhooks (
  razorpay_event_id text primary key,
  type text not null,
  processed_at timestamptz not null default now()
);

-- ---------- RLS ----------
alter table public.leads enable row level security;
alter table public.orders enable row level security;
alter table public.profiles enable row level security;
alter table public.daily_progress enable row level security;
alter table public.processed_webhooks enable row level security;

-- leads & processed_webhooks: RLS on with NO policies => deny all to anon/authenticated.
-- (Only the service-role key, used server-side, can read/write them.)

-- orders: owner may read their own
create policy "orders_select_own" on public.orders
  for select to authenticated using (auth.uid() = user_id);

-- profiles: owner read + update
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = user_id);
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- daily_progress: owner full CRUD on their own rows
create policy "dp_select_own" on public.daily_progress
  for select to authenticated using (auth.uid() = user_id);
create policy "dp_insert_own" on public.daily_progress
  for insert to authenticated with check (auth.uid() = user_id);
create policy "dp_update_own" on public.daily_progress
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
