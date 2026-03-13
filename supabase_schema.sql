-- Enable UUID generation
create extension if not exists "pgcrypto";

-- USERS
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  phone_number text not null unique,
  balance numeric not null default 0,
  spent numeric not null default 0,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- ADS
create table if not exists public.ads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  category text not null,
  ad_type text not null,
  title text not null,
  description text not null,
  price numeric not null default 0,
  image_url text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists ads_user_id_idx on public.ads(user_id);
create index if not exists ads_status_idx on public.ads(status);
create index if not exists ads_expires_at_idx on public.ads(expires_at);

-- REPORTS
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  ad_id uuid not null references public.ads(id) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now()
);

create index if not exists reports_ad_id_idx on public.reports(ad_id);

-- TRANSACTIONS
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  amount numeric not null,
  type text not null check (type in ('topup', 'spent')),
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_id_idx on public.transactions(user_id);

-- OTP CODES
create table if not exists public.otp_codes (
  id uuid primary key default gen_random_uuid(),
  phone_number text not null,
  otp_code text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists otp_codes_phone_idx on public.otp_codes(phone_number);
create index if not exists otp_codes_expires_idx on public.otp_codes(expires_at);

-- TELEGRAM LINKS (phone -> Telegram chat)
create table if not exists public.telegram_links (
  id uuid primary key default gen_random_uuid(),
  phone_number text not null unique,
  chat_id bigint not null,
  created_at timestamptz not null default now()
);

create index if not exists telegram_links_phone_idx on public.telegram_links(phone_number);

-- Seed admin user (same phone as UI expects)
insert into public.users (phone_number, is_admin, balance, spent)
values ('+94771234567', true, 0, 0)
on conflict (phone_number) do update set is_admin = excluded.is_admin;

-- OPTIONAL: create the storage bucket (may require running in SQL editor with sufficient privileges)
-- insert into storage.buckets (id, name, public)
-- values ('ads-images', 'ads-images', true)
-- on conflict (id) do nothing;

