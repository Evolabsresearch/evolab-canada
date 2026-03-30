-- ============================================================
-- EVO Labs Research — Supabase Database Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable pgcrypto for gen_random_uuid()
create extension if not exists "pgcrypto";


-- ─────────────────────────────────────────────────────────────
-- NextAuth.js Required Tables
-- (required by @next-auth/supabase-adapter)
-- ─────────────────────────────────────────────────────────────

create table if not exists public.accounts (
  id                   uuid      default gen_random_uuid() primary key,
  user_id              uuid      not null,
  type                 text      not null,
  provider             text      not null,
  provider_account_id  text      not null,
  refresh_token        text,
  access_token         text,
  expires_at           bigint,
  token_type           text,
  scope                text,
  id_token             text,
  session_state        text,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now(),
  unique (provider, provider_account_id)
);

create table if not exists public.sessions (
  id            uuid        default gen_random_uuid() primary key,
  user_id       uuid        not null,
  expires       timestamptz not null,
  session_token text        unique not null,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table if not exists public.users (
  id             uuid        default gen_random_uuid() primary key,
  name           text,
  email          text        unique,
  email_verified timestamptz,
  image          text,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create table if not exists public.verification_tokens (
  identifier text        not null,
  expires    timestamptz not null,
  token      text        unique not null,
  created_at timestamptz default now(),
  primary key (identifier, token)
);


-- ─────────────────────────────────────────────────────────────
-- Orders (synced from WooCommerce via webhook)
-- ─────────────────────────────────────────────────────────────

create table if not exists public.orders (
  id               uuid        default gen_random_uuid() primary key,
  wc_order_id      bigint      unique not null,
  order_number     text,
  customer_email   text,
  status           text,                        -- pending, processing, shipped, completed, etc.
  total            numeric(10,2),
  currency         text        default 'USD',
  line_items       jsonb,                       -- array of { product_id, name, quantity, price }
  shipping_address jsonb,                       -- { first_name, last_name, address_1, city, state, postcode, country }
  tracking_number  text,
  carrier          text,
  notes            text,                        -- admin notes / customer note from WooCommerce
  created_at       timestamptz,
  updated_at       timestamptz default now()
);

create index if not exists orders_customer_email_idx on public.orders (customer_email);
create index if not exists orders_wc_order_id_idx    on public.orders (wc_order_id);


-- ─────────────────────────────────────────────────────────────
-- Order Tracking Cache (AfterShip data, refreshed on lookup)
-- ─────────────────────────────────────────────────────────────

create table if not exists public.order_tracking (
  id                uuid        default gen_random_uuid() primary key,
  tracking_number   text        unique not null,
  carrier           text,
  status            text,                       -- AfterShip tag: Pending, InTransit, OutForDelivery, Delivered, Exception
  last_checkpoint   text,
  estimated_delivery date,
  raw_data          jsonb,                      -- full AfterShip response including checkpoints[]
  updated_at        timestamptz default now()
);

create index if not exists order_tracking_number_idx on public.order_tracking (tracking_number);


-- ─────────────────────────────────────────────────────────────
-- Partners / Affiliates
-- ─────────────────────────────────────────────────────────────

create table if not exists public.partners (
  id              uuid        default gen_random_uuid() primary key,
  user_id         uuid        unique not null references public.users (id) on delete cascade,
  referral_code   text        unique not null,
  commission_rate numeric(4,3) default 0.10,   -- 0.10 = 10%
  status          text        default 'pending', -- pending | active | suspended
  notes           text,
  website         text,
  bio             text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists partners_referral_code_idx on public.partners (referral_code);
create index if not exists partners_user_id_idx       on public.partners (user_id);


-- ─────────────────────────────────────────────────────────────
-- Affiliate Clicks (logged by edge middleware or JS pixel)
-- ─────────────────────────────────────────────────────────────

create table if not exists public.affiliate_clicks (
  id           uuid        default gen_random_uuid() primary key,
  partner_id   uuid        not null references public.partners (id) on delete cascade,
  ip_hash      text,        -- hashed for privacy
  user_agent   text,
  landing_page text,
  created_at   timestamptz default now()
);

create index if not exists affiliate_clicks_partner_id_idx  on public.affiliate_clicks (partner_id);
create index if not exists affiliate_clicks_created_at_idx  on public.affiliate_clicks (created_at);


-- ─────────────────────────────────────────────────────────────
-- Affiliate Conversions (credited via WooCommerce webhook)
-- ─────────────────────────────────────────────────────────────

create table if not exists public.affiliate_conversions (
  id           uuid        default gen_random_uuid() primary key,
  partner_id   uuid        not null references public.partners (id) on delete cascade,
  wc_order_id  bigint      unique not null,
  order_total  numeric(10,2),
  commission   numeric(10,2),
  status       text        default 'pending',   -- pending | approved | rejected | paid
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index if not exists affiliate_conversions_partner_id_idx on public.affiliate_conversions (partner_id);
create index if not exists affiliate_conversions_status_idx     on public.affiliate_conversions (status);


-- ─────────────────────────────────────────────────────────────
-- Affiliate Payouts
-- ─────────────────────────────────────────────────────────────

create table if not exists public.affiliate_payouts (
  id          uuid        default gen_random_uuid() primary key,
  partner_id  uuid        not null references public.partners (id) on delete cascade,
  amount      numeric(10,2) not null,
  method      text,                             -- bank | crypto | check
  reference   text,                             -- transaction ID or check number
  status      text        default 'pending',    -- pending | paid | failed
  notes       text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index if not exists affiliate_payouts_partner_id_idx on public.affiliate_payouts (partner_id);


-- ─────────────────────────────────────────────────────────────
-- Row Level Security (RLS)
-- ─────────────────────────────────────────────────────────────
-- NOTE: The Next.js API routes use the service role key (bypasses RLS).
-- RLS is configured here as an extra defense layer if you ever
-- allow direct Supabase client queries.

alter table public.orders             enable row level security;
alter table public.order_tracking     enable row level security;
alter table public.partners           enable row level security;
alter table public.affiliate_clicks   enable row level security;
alter table public.affiliate_conversions enable row level security;
alter table public.affiliate_payouts  enable row level security;

-- Service role bypass (your API routes use this — always allowed)
create policy "service_role_all" on public.orders             for all using (auth.role() = 'service_role');
create policy "service_role_all" on public.order_tracking     for all using (auth.role() = 'service_role');
create policy "service_role_all" on public.partners           for all using (auth.role() = 'service_role');
create policy "service_role_all" on public.affiliate_clicks   for all using (auth.role() = 'service_role');
create policy "service_role_all" on public.affiliate_conversions for all using (auth.role() = 'service_role');
create policy "service_role_all" on public.affiliate_payouts  for all using (auth.role() = 'service_role');

-- Customer: read own orders (defense-in-depth; API routes use service role)
-- Requires Supabase Auth (not NextAuth JWT) to use auth.email() — safe to leave as-is
-- since all customer data access goes through API routes using the service role key.

-- Partner: read own partner record
create policy "partner_read_own" on public.partners
  for select using (user_id = auth.uid());

-- Partner: read own conversions
create policy "partner_read_own_conversions" on public.affiliate_conversions
  for select using (
    partner_id in (
      select id from public.partners where user_id = auth.uid()
    )
  );

-- Partner: read own payouts
create policy "partner_read_own_payouts" on public.affiliate_payouts
  for select using (
    partner_id in (
      select id from public.partners where user_id = auth.uid()
    )
  );


-- ─────────────────────────────────────────────────────────────
-- Auto-approve commissions after 30 days (optional cron)
-- Schedule this in Supabase Dashboard → Database → Cron Jobs
-- or pg_cron extension:
--
--   select cron.schedule(
--     'approve-commissions',
--     '0 3 * * *',
--     $$
--       update public.affiliate_conversions
--       set status = 'approved', updated_at = now()
--       where status = 'pending'
--         and created_at <= now() - interval '30 days';
--     $$
--   );
-- ─────────────────────────────────────────────────────────────
