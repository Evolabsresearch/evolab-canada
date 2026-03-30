-- ============================================================
-- EVO Labs — Products, Discounts & Settings Tables
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

-- ── Products ──────────────────────────────────────────────────────────────────
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

-- ── Discount Codes ────────────────────────────────────────────────────────────
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

-- ── Store Settings ─────────────────────────────────────────────────────────────
create table if not exists public.store_settings (
  section    text        not null,
  key        text        not null,
  value      text,
  updated_at timestamptz not null default now(),
  primary key (section, key)
);

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table public.products       enable row level security;
alter table public.discount_codes enable row level security;
alter table public.store_settings enable row level security;

-- Products: public read, service role full access
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
