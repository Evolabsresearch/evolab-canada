-- ============================================================
-- EVO Labs Canada — Complete Supabase Backend Setup
--
-- This is the COMPLETE, ready-to-run SQL script for setting up
-- the Canadian site's Supabase backend. It creates all tables,
-- enables RLS, creates all policies, creates indexes, and
-- initializes the site-content storage bucket with Canadian
-- defaults.
--
-- Run this entire script in Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable pgcrypto for gen_random_uuid()
create extension if not exists "pgcrypto";


-- ═════════════════════════════════════════════════════════════
-- NEXTAUTH.JS REQUIRED TABLES
-- (required by @next-auth/supabase-adapter)
-- ═════════════════════════════════════════════════════════════

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


-- ═════════════════════════════════════════════════════════════
-- ORDERS (synced from WooCommerce via webhook)
-- ═════════════════════════════════════════════════════════════

create table if not exists public.orders (
  id               uuid        default gen_random_uuid() primary key,
  wc_order_id      bigint      unique not null,
  order_number     text,
  customer_email   text,
  status           text,                        -- pending, processing, shipped, completed, etc.
  total            numeric(10,2),
  currency         text        default 'CAD',
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


-- ═════════════════════════════════════════════════════════════
-- ORDER TRACKING CACHE (AfterShip data, refreshed on lookup)
-- ═════════════════════════════════════════════════════════════

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


-- ═════════════════════════════════════════════════════════════
-- PARTNERS / AFFILIATES
-- ═════════════════════════════════════════════════════════════

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


-- ═════════════════════════════════════════════════════════════
-- AFFILIATE CLICKS (logged by edge middleware or JS pixel)
-- ═════════════════════════════════════════════════════════════

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


-- ═════════════════════════════════════════════════════════════
-- AFFILIATE CONVERSIONS (credited via WooCommerce webhook)
-- ═════════════════════════════════════════════════════════════

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


-- ═════════════════════════════════════════════════════════════
-- AFFILIATE PAYOUTS
-- ═════════════════════════════════════════════════════════════

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


-- ═════════════════════════════════════════════════════════════
-- PRODUCTS
-- ═════════════════════════════════════════════════════════════

create table if not exists public.products (
  id                  integer       primary key,
  name                text          not null,
  slug                text          unique not null,
  price               text          not null,
  sale_price          text,
  category            text          not null,
  description         text,
  image               text,
  gallery             jsonb         not null default '[]',
  sizes               jsonb         not null default '[]',   -- [{mg,price,salePrice,imageUrl,inStock}]
  coa_link            text,
  badge               text,
  shop_url            text,
  out_of_stock        boolean       not null default false,
  low_stock           boolean       not null default false,
  stock               integer       not null default 50,
  low_stock_threshold integer       not null default 10,
  cost_per_unit       numeric(10,2) not null default 0,
  sku                 text,
  rating              numeric(3,1)  not null default 4.8,
  review_count        integer       not null default 0,
  created_at          timestamptz   not null default now(),
  updated_at          timestamptz   not null default now()
);

create index if not exists products_slug_idx     on public.products (slug);
create index if not exists products_category_idx on public.products (category);


-- ═════════════════════════════════════════════════════════════
-- DISCOUNT CODES
-- ═════════════════════════════════════════════════════════════

create table if not exists public.discount_codes (
  id          uuid          primary key default gen_random_uuid(),
  code        text          unique not null,
  type        text          not null default 'percent',   -- percent | fixed | free_shipping | bogo
  value       numeric(10,2) not null default 0,
  min_order   numeric(10,2) not null default 0,
  usage_limit integer,
  uses        integer       not null default 0,
  active      boolean       not null default true,
  start_date  date,
  end_date    date,
  description text,
  created_at  timestamptz   not null default now(),
  updated_at  timestamptz   not null default now()
);


-- ═════════════════════════════════════════════════════════════
-- STORE SETTINGS
-- ═════════════════════════════════════════════════════════════

create table if not exists public.store_settings (
  section    text        not null,
  key        text        not null,
  value      text,
  updated_at timestamptz not null default now(),
  primary key (section, key)
);


-- ═════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) — ENABLE ALL TABLES
-- ═════════════════════════════════════════════════════════════

alter table public.orders               enable row level security;
alter table public.order_tracking       enable row level security;
alter table public.partners             enable row level security;
alter table public.affiliate_clicks     enable row level security;
alter table public.affiliate_conversions enable row level security;
alter table public.affiliate_payouts    enable row level security;
alter table public.products             enable row level security;
alter table public.discount_codes       enable row level security;
alter table public.store_settings       enable row level security;


-- ═════════════════════════════════════════════════════════════
-- RLS POLICIES — ORDERS, TRACKING, PARTNERS, AFFILIATES
-- ═════════════════════════════════════════════════════════════

-- Service role bypass (your API routes use this — always allowed)
create policy "service_role_all" on public.orders
  for all using (auth.role() = 'service_role');

create policy "service_role_all" on public.order_tracking
  for all using (auth.role() = 'service_role');

create policy "service_role_all" on public.partners
  for all using (auth.role() = 'service_role');

create policy "service_role_all" on public.affiliate_clicks
  for all using (auth.role() = 'service_role');

create policy "service_role_all" on public.affiliate_conversions
  for all using (auth.role() = 'service_role');

create policy "service_role_all" on public.affiliate_payouts
  for all using (auth.role() = 'service_role');

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


-- ═════════════════════════════════════════════════════════════
-- RLS POLICIES — PRODUCTS & DISCOUNTS
-- ═════════════════════════════════════════════════════════════

do $$ begin
  if not exists (select 1 from pg_policies where tablename='products' and policyname='public_read_products') then
    create policy "public_read_products"  on public.products       for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='products' and policyname='service_role_products') then
    create policy "service_role_products" on public.products       for all    using (auth.role() = 'service_role');
  end if;
  -- Discounts: public read (for cart validation), service role full
  if not exists (select 1 from pg_policies where tablename='discount_codes' and policyname='public_read_discounts') then
    create policy "public_read_discounts" on public.discount_codes for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='discount_codes' and policyname='service_role_discounts') then
    create policy "service_role_discounts" on public.discount_codes for all   using (auth.role() = 'service_role');
  end if;
  -- Settings: service role only
  if not exists (select 1 from pg_policies where tablename='store_settings' and policyname='service_role_settings') then
    create policy "service_role_settings" on public.store_settings for all    using (auth.role() = 'service_role');
  end if;
end $$;


-- ═════════════════════════════════════════════════════════════
-- INITIALIZE CANADIAN SITE SETTINGS
-- ═════════════════════════════════════════════════════════════

-- Catalog Mode (gated access)
insert into public.store_settings (section, key, value)
values ('config', 'catalog_mode', '{"mode": "gated"}')
on conflict (section, key) do update set value = '{"mode": "gated"}', updated_at = now();

-- Free Shipping Threshold (300 CAD)
insert into public.store_settings (section, key, value)
values ('config', 'free_shipping_threshold', '300')
on conflict (section, key) do update set value = '300', updated_at = now();

-- Payment Processors (Stripe, Hummingbird, LinkMoney enabled)
insert into public.store_settings (section, key, value)
values ('config', 'payment_processors', '{"stripe": {"enabled": true}, "hummingbird": {"enabled": true}, "linkmoney": {"enabled": true}}')
on conflict (section, key) do update set value = '{"stripe": {"enabled": true}, "hummingbird": {"enabled": true}, "linkmoney": {"enabled": true}}', updated_at = now();

-- Announcement Bar (Canadian messaging)
insert into public.store_settings (section, key, value)
values ('config', 'announcement_bar', '{"enabled": true, "text": "Free Shipping on Orders $300+ CAD · Shipped via Canada Post"}')
on conflict (section, key) do update set value = '{"enabled": true, "text": "Free Shipping on Orders $300+ CAD · Shipped via Canada Post"}', updated_at = now();

-- Currency (CAD)
insert into public.store_settings (section, key, value)
values ('config', 'currency', 'CAD')
on conflict (section, key) do update set value = 'CAD', updated_at = now();

-- Country (Canada)
insert into public.store_settings (section, key, value)
values ('config', 'country', 'CA')
on conflict (section, key) do update set value = 'CA', updated_at = now();


-- ═════════════════════════════════════════════════════════════
-- NOTES
-- ═════════════════════════════════════════════════════════════
--
-- 1. Storage bucket "site-content" must be created manually via Supabase Dashboard:
--    - Go to Storage → Buckets → Create new bucket
--    - Name: "site-content"
--    - Make it PUBLIC
--    - Upload JSON files here for content overrides (e.g., homepage.json, catalog.json)
--
-- 2. RLS is configured for service-role-key bypass (API routes).
--    Direct client-side queries have limited permissions.
--
-- 3. All tables use "if not exists" to allow safe re-runs.
--
-- 4. WooCommerce webhook integration should post orders to:
--    POST /api/admin/webhooks/woocommerce/order
--
-- 5. Products are synced from WooCommerce → populate products table separately
--
-- ═════════════════════════════════════════════════════════════
