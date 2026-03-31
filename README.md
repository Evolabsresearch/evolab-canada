# EVO Labs Research — Developer Handoff

> **Last updated:** March 13, 2026
> This document covers the full current state of the codebase, all recent changes, and everything needed to get the site running locally and in production.

---

## 🚨 DEVELOPER TO-DO LIST — DO TONIGHT

These items are **blocking production functionality**. Work through them in order.

### Priority 1 — Set Environment Variables on Vercel
Log into Vercel → evolabs-site project → Settings → Environment Variables. Add/update ALL of these:

| Variable | Where to get it | Why needed |
|----------|----------------|------------|
| `RESEND_API_KEY` | resend.com → API Keys → Create | Email magic links — login won't send emails without this |
| `EMAIL_FROM` | Set to: `EVO Labs Research <noreply@evolabsresearch.com>` | Sender name on magic link emails |
| `TWILIO_ACCOUNT_SID` | console.twilio.com → Account Info | Phone OTP — SMS won't send without this |
| `TWILIO_AUTH_TOKEN` | console.twilio.com → Account Info | Phone OTP |
| `TWILIO_PHONE_NUMBER` | Twilio → Phone Numbers → Manage | Must be in E.164 format, e.g. `+15551234567` |
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` | Sessions broken without this |
| `NEXTAUTH_URL` | `https://www.evolabsresearch.com` | Magic link callback URLs |
| `ADMIN_SECRET` | Same value as your admin password | All `/api/admin/*` routes fail without this |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | All DB reads/writes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | Browser Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | Server-side admin DB access |
| `WC_STORE_URL` | `https://evolabsresearch.com` | WooCommerce sync |
| `WC_CONSUMER_KEY` | WP Admin → WooCommerce → REST API | WooCommerce sync |
| `WC_CONSUMER_SECRET` | WP Admin → WooCommerce → REST API | WooCommerce sync |

### Priority 2 — Resend Domain Verification
1. Go to **resend.com** → Domains → Add Domain
2. Add `evolabsresearch.com`
3. Add the DNS records Resend gives you (MX, TXT, DKIM) to your domain registrar
4. Wait for verification (usually 5–10 minutes)
5. Without this, Resend will silently reject outbound emails

### Priority 3 — Run WooCommerce Historical Sync
Once env vars are set and deployed:
1. Go to `https://www.evolabsresearch.com/admin`
2. Log in with admin credentials
3. Click **"↓ Import All WooCommerce Orders"** on the dashboard
4. Wait for it to complete (pulls all historical orders into Supabase)
5. Then click **"↻ Sync WooCommerce"** on the analytics page to verify data loaded

### Priority 4 — Test Login End-to-End
1. Visit `https://www.evolabsresearch.com/account/login`
2. **Email tab:** Enter a real email → confirm magic link email arrives in inbox (check spam too)
3. **Phone tab:** Enter a real phone number → confirm 6-digit SMS arrives → enter code → confirm redirect to `/account`
4. If email doesn't arrive: check Resend dashboard → Logs for delivery status
5. If SMS doesn't arrive: check Twilio console → Monitor → Logs

### Priority 5 — OmniSend Automation Flows
The code fires these events automatically — the actual email/SMS templates need to be built in the OmniSend dashboard:
1. Log into OmniSend → Automation → Create workflow
2. Create flows for each trigger:
   - `order_placed` → Order confirmation email
   - `order_shipped` → Shipping notification with tracking number
   - `order_delivered` → Delivery confirmation + review request
3. Test by triggering a test order through WooCommerce

### Priority 6 — Supabase `users` Table Check
Phone OTP login creates user records with a pseudo-email like `15551234567@phone.evolabsresearch.ca`. Verify the `users` table allows this:
```sql
-- Run in Supabase SQL Editor to confirm schema is correct
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'users' ORDER BY ordinal_position;
```
Expected columns: `id` (uuid), `name` (text), `email` (text), `emailVerified` (timestamptz), `image` (text)

If the table doesn't exist yet, run `supabase/schema.sql` in the SQL Editor first.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Repository Structure](#3-repository-structure)
4. [Getting Started (Local Dev)](#4-getting-started-local-dev)
5. [Environment Variables](#5-environment-variables)
6. [Database Setup (Supabase)](#6-database-setup-supabase)
7. [Authentication (NextAuth)](#7-authentication-nextauth)
8. [Account Portal](#8-account-portal)
9. [Order Tracking System](#9-order-tracking-system)
10. [Affiliate / Partner System](#10-affiliate--partner-system)
11. [WooCommerce Integration](#11-woocommerce-integration)
12. [OmniSend Integration](#12-omnisend-integration)
13. [AfterShip Integration](#13-aftership-integration)
14. [Product Categories](#14-product-categories)
15. [WooCommerce WordPress Plugin](#15-woocommerce-wordpress-plugin)
16. [Admin Panel](#16-admin-panel)
17. [Deployment Checklist](#17-deployment-checklist)
18. [NPM Packages to Install](#18-npm-packages-to-install)
19. [Known Issues / TODO](#19-known-issues--todo)

---

## 1. Project Overview

EVO Labs Research is a research peptide e-commerce site. The **storefront and payment processing** lives on a separate WordPress/WooCommerce installation at `evolabsresearch.com`. This Next.js repo is the **marketing site + customer portal** that:

- Shows products, research pages, COA library, FAQ, etc.
- Lets customers log in (magic link) and view their orders
- Shows live package tracking on an interactive map
- Manages the affiliate/partner program
- Syncs with WooCommerce via REST API and webhooks

**Payment gateway:** Private WooCommerce plugin (not Stripe). All payment processing stays on the WooCommerce side — this Next.js app only reads order data via the WooCommerce REST API.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (Pages Router) |
| Styling | Inline styles (no CSS framework) |
| Auth | NextAuth.js — magic link / passwordless email |
| Database | Supabase (PostgreSQL) |
| Auth adapter | `@next-auth/supabase-adapter` |
| E-commerce | WooCommerce REST API v3 |
| Package tracking | AfterShip API v4 |
| Email / SMS flows | OmniSend API v3 |
| Map | Mapbox GL JS (dynamic import, no SSR) |
| Affiliate tracking | First-party cookie via Next.js edge middleware |

---

## 3. Repository Structure

```
evolabs-site/
├── components/
│   ├── Layout.jsx              # Master layout — nav, footer
│   ├── TrackingMap.jsx         # ★ NEW — Mapbox interactive tracking map
│   └── ...
│
├── lib/
│   ├── supabase.js             # ★ NEW — Supabase client factory
│   ├── aftership.js            # ★ NEW — AfterShip API helper
│   ├── omnisend.js             # ★ NEW — OmniSend API helper
│   ├── woocommerce.js          # ★ NEW — WooCommerce REST API bridge
│   └── data.js                 # ★ UPDATED — Products + 8-category system
│
├── middleware.js               # ★ NEW — Affiliate cookie edge middleware
│
├── pages/
│   ├── index.jsx               # ★ UPDATED — Floating transparent vials hero
│   ├── products.jsx            # ★ UPDATED — Fixed category filter pills
│   │
│   ├── account/
│   │   ├── index.jsx           # ★ NEW — Account dashboard (orders + settings)
│   │   ├── login.jsx           # ★ NEW — Magic link login
│   │   ├── verify-email.jsx    # ★ NEW — "Check your inbox" page
│   │   ├── auth-error.jsx      # ★ NEW — Auth error page
│   │   ├── partner.jsx         # ★ NEW — Partner/affiliate dashboard
│   │   └── tracking/
│   │       └── [trackingNumber].jsx  # ★ NEW — Interactive tracking page
│   │
│   └── api/
│       ├── auth/
│       │   └── [...nextauth].js      # ★ NEW — NextAuth config
│       ├── orders.js                 # ★ NEW — GET /api/orders
│       ├── tracking/
│       │   └── [trackingNumber].js   # ★ NEW — GET /api/tracking/:number
│       ├── affiliate/
│       │   ├── register.js           # ★ NEW — POST /api/affiliate/register
│       │   └── stats.js              # ★ NEW — GET /api/affiliate/stats
│       └── webhooks/
│           └── woocommerce.js        # ★ NEW — POST /api/webhooks/woocommerce
│
├── supabase/
│   └── schema.sql              # ★ NEW — Full database schema (run once)
│
├── woocommerce/
│   └── evo-affiliate-tracking.php   # ★ NEW — WordPress plugin (upload to WP)
│
├── .env.local.example          # ★ NEW — All required env vars documented
└── README.md                   # This file
```

---

## 4. Getting Started (Local Dev)

```bash
# 1. Clone the repo
git clone https://github.com/jakob4712/evolabs-site.git
cd evolabs-site

# 2. Install dependencies (see section 17 for new packages)
npm install

# 3. Set up environment variables
cp .env.local.example .env.local
# Then fill in your values — see Section 5

# 4. Run the database schema
# Open Supabase Dashboard → SQL Editor → paste supabase/schema.sql → Run

# 5. Start dev server
npm run dev
```

Site runs at `http://localhost:3000`

---

## 5. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in every value. Here's where to find each one:

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL        → Supabase Dashboard → Settings → API → Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   → Supabase Dashboard → Settings → API → anon/public key
SUPABASE_SERVICE_ROLE_KEY       → Supabase Dashboard → Settings → API → service_role key
```
> ⚠️ The service role key bypasses Row Level Security. **Never expose it to the browser.** It's only used in server-side API routes.

### NextAuth
```
NEXTAUTH_SECRET   → Run: openssl rand -base64 32
NEXTAUTH_URL      → https://www.evolabsresearch.com (no trailing slash)
```

### Email (Magic Link via Resend)
The site uses passwordless email auth via **Resend** SMTP:
```
RESEND_API_KEY   → resend.com → API Keys → Create key (starts with re_)
EMAIL_FROM       → EVO Labs Research <noreply@evolabsresearch.com>
```
> ⚠️ You must also verify the `evolabsresearch.com` domain in your Resend dashboard and add the DNS records they give you. Without domain verification, emails will be rejected silently.

### Twilio (Phone OTP)
Phone number login sends a 6-digit code via Twilio SMS:
```
TWILIO_ACCOUNT_SID    → console.twilio.com → Account → Account Info
TWILIO_AUTH_TOKEN     → console.twilio.com → Account → Account Info
TWILIO_PHONE_NUMBER   → Twilio → Phone Numbers → Manage → Active numbers (E.164 format)
```

### AfterShip
```
AFTERSHIP_API_KEY   → aftership.com → Settings → API Keys → Create API Key
```

### OmniSend
```
OMNISEND_API_KEY    → OmniSend Dashboard → Account → Integrations → API Key
```

### WooCommerce
```
WC_STORE_URL         → https://evolabsresearch.com
WC_CONSUMER_KEY      → WP Admin → WooCommerce → Settings → Advanced → REST API → Add Key
WC_CONSUMER_SECRET   → (same place — copy the secret immediately, shown once)
WC_WEBHOOK_SECRET    → WP Admin → WooCommerce → Settings → Advanced → Webhooks → (auto-generated)
```

### Mapbox
```
NEXT_PUBLIC_MAPBOX_TOKEN   → mapbox.com → Account → Access Tokens → Create token
```
> The free tier is generous — more than enough for this use case.

---

## 6. Database Setup (Supabase)

Run **`supabase/schema.sql`** once in the Supabase SQL Editor:

1. Go to `supabase.com` → your project → **SQL Editor**
2. Paste the full contents of `supabase/schema.sql`
3. Click **Run**

### Tables created:

| Table | Purpose |
|-------|---------|
| `users` | NextAuth — customer accounts |
| `accounts` | NextAuth — OAuth/provider links |
| `sessions` | NextAuth — active sessions |
| `verification_tokens` | NextAuth — magic link tokens |
| `orders` | WooCommerce orders synced via webhook |
| `order_tracking` | AfterShip tracking cache |
| `partners` | Affiliate partners |
| `affiliate_clicks` | Referral link click log |
| `affiliate_conversions` | Attributed orders + commission amounts |
| `affiliate_payouts` | Payout records |

### Auto-approve commissions (optional cron):
The schema includes a commented-out `pg_cron` snippet at the bottom. Enable it to automatically flip commission status from `pending` → `approved` after 30 days. Requires the `pg_cron` extension in Supabase (available on Pro plan).

---

## 7. Authentication (NextAuth)

**File:** `pages/api/auth/[...nextauth].js`

Two login methods, both passwordless:

| Method | Provider | Flow |
|--------|----------|------|
| **Email** | `EmailProvider` via Resend SMTP | User enters email → magic link sent → click to sign in |
| **Phone** | `CredentialsProvider` (phone-otp) | User enters phone → 6-digit SMS code → enter code → signed in |

- **Adapter:** `@next-auth/supabase-adapter` — stores email verification tokens in Supabase
- **Session strategy:** JWT (cookie-based; no server session table lookups)
- **Custom pages:**
  - Sign in → `/account/login`
  - After email sent → `/account/verify-email`
  - Errors → `/account/auth-error`

### Phone OTP internals:
- `POST /api/auth/send-otp` — generates a 6-digit code, stores it in memory (`OTP_STORE` Map), sends via Twilio
- Code expires in **10 minutes**
- NextAuth `CredentialsProvider` verifies code on sign-in, finds or creates a Supabase user with pseudo-email `{e164phone}@phone.evolabsresearch.ca`
- OTP_STORE is in-memory — works for single-instance Vercel deployments; if you ever move to multi-region, migrate to Supabase or Redis

### JWT session contains:
```js
session.user.id              // Supabase user UUID
session.user.email           // Customer email (or pseudo-email for phone users)
session.user.phone           // E.164 phone number (null for email users)
session.user.isPartner       // Boolean — has a partners record
session.user.referralCode    // Their affiliate code (if partner)
session.user.commissionRate  // e.g. 0.10 = 10%
```

### Protecting pages:
All account pages use `getServerSideProps` to redirect unauthenticated users:
```js
export async function getServerSideProps(ctx) {
  const { getSession } = await import('next-auth/react');
  const session = await getSession(ctx);
  if (!session) return { redirect: { destination: '/account/login', permanent: false } };
  return { props: {} };
}
```

---

## 8. Account Portal

### `/account` — Dashboard (`pages/account/index.jsx`)
- Shows all orders fetched from `/api/orders`
- Status badges (Processing, Shipped, Delivered, etc.)
- Each order with tracking number links to `/account/tracking/[trackingNumber]`
- Settings tab: shows email, sign-out button
- "Become a Partner" link (shows if not yet a partner)
- "Partner Dashboard" link (shows if already a partner)

### `/account/login` — Login (`pages/account/login.jsx`)
- Single email input field
- Sends magic link via NextAuth
- Transitions to "check your email" confirmation state
- Redirects to `/account` if already logged in

### `/account/verify-email`
- Displayed after magic link is sent
- Tips for if the email doesn't arrive

### `/account/auth-error`
- Shows specific error messages based on NextAuth error code (`?error=Verification`, etc.)

---

## 9. Order Tracking System

### Flow:
1. Customer clicks "Track" on an order → goes to `/account/tracking/[trackingNumber]?carrier=usps`
2. Page calls `GET /api/tracking/[trackingNumber]?carrier=usps`
3. API fetches live data from AfterShip, caches in Supabase `order_tracking` table
4. Page renders `<TrackingMap>` with checkpoint coordinates + timeline sidebar

### `TrackingMap` component (`components/TrackingMap.jsx`)
- Uses **Mapbox GL JS** (dynamically imported, `ssr: false`)
- Accepts `checkpoints[]` (with `lat`, `lng`) and `currentLocation`
- Draws a dashed green route line between all stops
- Green glowing marker = current location, blue markers = past stops
- Popups on click/hover showing checkpoint message, location, and time
- Auto-fits map bounds to show the full route
- Dark map style (`mapbox://styles/mapbox/dark-v11`)
- Graceful fallback UI when no coordinates are available yet

### Status tags from AfterShip:
| Tag | Display |
|-----|---------|
| `Pending` | ⏳ gray |
| `InTransit` | ✈️ purple |
| `OutForDelivery` | 🚚 blue |
| `Delivered` | ✅ green |
| `AttemptFail` | ⚠️ red |
| `Exception` | 🚨 red |

---

## 10. Affiliate / Partner System

### How the full flow works:

```
1. Partner shares link:  https://www.evolabsresearch.com?ref=THEIRCODE
                                          ↓
2. Next.js middleware (middleware.js) sets cookie:  __evo_aff=THEIRCODE  (30 days)
                                          ↓
3. Customer browses and checks out on WooCommerce at evolabsresearch.com
                                          ↓
4. WordPress plugin (evo-affiliate-tracking.php) reads __evo_aff cookie,
   saves as order meta: _evo_affiliate_code = THEIRCODE
                                          ↓
5. WooCommerce fires webhook → POST /api/webhooks/woocommerce
                                          ↓
6. Webhook reads _evo_affiliate_code, looks up partner in Supabase,
   calculates commission (order_total × commission_rate),
   inserts row in affiliate_conversions table (status: 'pending')
                                          ↓
7. After 30 days, commission auto-approves (pg_cron or manual SQL)
                                          ↓
8. Partner requests payout via /account/partner → Payouts tab
```

### Partner dashboard (`/account/partner`):
- **Overview tab:** How-it-works steps + recent conversions
- **Conversions tab:** Full table of all attributed orders
- **Payouts tab:** Payout history + request button (enabled at $50 minimum)
- Referral link copy button
- Status badge (Pending / Active)

### API endpoints:
- `POST /api/affiliate/register` — Creates partner record, generates unique referral code
- `GET /api/affiliate/stats` — Returns clicks, conversions, earnings, payout history

### Referral code format:
Auto-generated from the user's email prefix + random string, e.g. `jakob-x7k2p`. Guaranteed unique in the database.

---

## 11. WooCommerce Integration

**File:** `lib/woocommerce.js`

Connects to the private WooCommerce store at `evolabsresearch.com` using Basic Auth (Consumer Key + Secret). **No Stripe** — all payment processing is handled by the private WooCommerce gateway plugin already installed on the WordPress site.

### Available functions:
```js
getOrdersByEmail(email)          // Fetch all orders for a customer
getOrder(orderId)                // Fetch a single order by WC order ID
extractTrackingFromOrder(order)  // Reads tracking number + carrier from order meta
updateOrderStatus(orderId, status)
addOrderNote(orderId, note)
getProducts(page, perPage)
```

### WooCommerce Webhooks:
Two webhooks need to be configured in **WP Admin → WooCommerce → Settings → Advanced → Webhooks**:

| Webhook | Topic | Delivery URL |
|---------|-------|-------------|
| Order Created | `order.created` | `https://www.evolabsresearch.com/api/webhooks/woocommerce` |
| Order Updated | `order.updated` | `https://www.evolabsresearch.com/api/webhooks/woocommerce` |

Copy the auto-generated secret into `WC_WEBHOOK_SECRET` in `.env.local`.

### What the webhook handler does (`pages/api/webhooks/woocommerce.js`):
1. Verifies HMAC-SHA256 signature
2. Syncs order data to Supabase `orders` table
3. Credits affiliate commission (if `_evo_affiliate_code` present in order meta)
4. Upserts customer contact in OmniSend
5. Triggers OmniSend email/SMS flows (`order_placed`, `order_delivered`)
6. Creates AfterShip tracking entry when order status = `shipped`
7. Triggers OmniSend `order_shipped` event with tracking number

### Tracking number meta keys read from WooCommerce orders:
- `_tracking_number`
- `_shipment_tracking_number`
- `tracking_number`
- Carrier from `_tracking_provider` or `_shipment_carrier` (defaults to `usps`)

These keys are set automatically by most WooCommerce shipment tracking plugins. If you use a different plugin, check its meta key names and update `lib/woocommerce.js → extractTrackingFromOrder()`.

---

## 12. OmniSend Integration

**File:** `lib/omnisend.js`

### Available functions:
```js
upsertContact({ email, phone, firstName, lastName, tags })
triggerEvent(email, eventName, fields)
trackOrder({ email, orderId, orderTotal, currency, items, status })
sendSMS(phone, message)
```

### Events triggered automatically:
| Event | When |
|-------|------|
| `order_placed` | `order.created` webhook |
| `order_delivered` | `order.updated` + status = `completed` |
| `order_shipped` | `order.updated` + status = `shipped` |

To set up the actual email/SMS templates for these events, go to the **OmniSend dashboard → Automation** and create flows triggered by these custom event names.

---

## 13. AfterShip Integration

**File:** `lib/aftership.js`

### Available functions:
```js
createTracking(trackingNumber, slug, title)   // slug = 'usps', 'fedex', 'ups', etc.
getTracking(slug, trackingNumber)
getAllTrackings(page, limit)
deleteTracking(slug, trackingNumber)
```

### Tracking is created automatically:
When a WooCommerce order status changes to `shipped`, the webhook calls `createTracking()` automatically — no manual action needed.

### Checkpoint coordinates:
AfterShip sometimes includes `coordinates.lat` / `coordinates.lng` in checkpoint data. When available, these are passed to the TrackingMap. When not available (most domestic USPS shipments don't include them), the map shows a "waiting for location data" overlay.

---

## 14. Product Categories

**File:** `lib/data.js`

The site uses **8 product categories** (consolidated from a previous 11-category system):

| Category | Slug | Icon |
|----------|------|------|
| Growth Hormone Peptides | `growth-hormone` | 🔬 |
| GLP-1 Research Peptides | `glp1` | ⚗️ |
| Healing & Regeneration | `healing` | 💊 |
| Mitochondrial Peptides | `mitochondrial` | ⚡ |
| Cognitive & Neuro Peptides | `cognitive` | 🧠 |
| Metabolic Peptides | `metabolic` | 🔥 |
| Reconstitution Supplies | `supplies` | 💉 |
| Research Kits | `kits` | 📦 |

All 48 products are mapped to one of these 8 categories. The `CATEGORIES` array and all product `category` fields are in `lib/data.js`.

To add a new product, add an object to the `PRODUCTS` array in `lib/data.js` with a `category` value matching one of the 8 names exactly.

---

## 15. WooCommerce WordPress Plugin

**File:** `woocommerce/evo-affiliate-tracking.php`

This is a small custom WordPress plugin that bridges the affiliate cookie from the Next.js site into WooCommerce orders.

### Installation:
1. On the WordPress server, navigate to `/wp-content/plugins/`
2. Create a folder: `evo-affiliate-tracking`
3. Upload `evo-affiliate-tracking.php` into that folder
4. Go to **WP Admin → Plugins** → find "EVO Labs Affiliate Cookie Tracker" → **Activate**

### What it does:
- Reads the `__evo_aff` cookie (set by Next.js middleware when a customer arrives via `?ref=CODE`)
- Saves the code as `_evo_affiliate_code` order meta on every new WooCommerce order
- Includes a WC session fallback in case the cookie is gone by checkout time
- Displays the affiliate code in the WooCommerce order admin panel for manual verification

---

## 16. Admin Panel

The admin panel lives at `/admin` — it is **completely separate** from the customer-facing site and is protected by its own email + password login (not NextAuth).

### Login credentials
| Field | Value | Override via env var |
|-------|-------|---------------------|
| Email | `evolabs13@gmail.com` | `NEXT_PUBLIC_ADMIN_EMAIL` |
| Password | `Baseball@123` | `NEXT_PUBLIC_ADMIN_PW` |

> ⚠️ For production, always override both via Vercel environment variables. The defaults are fallbacks for local dev only. Also set `ADMIN_SECRET` to the same password value — it's used by all `/api/admin/*` routes to validate the `Authorization: Bearer` header.

### Pages
| URL | Purpose |
|-----|---------|
| `/admin` | Dashboard — live revenue stats, recent orders, status breakdown, WooCommerce sync |
| `/admin/orders` | Full order list — filter/search, edit status + tracking, export CSV, PirateShip button |
| `/admin/products` | Product list — edit name, price, sale price, status, image URL, COA link |
| `/admin/customers` | Customer profiles aggregated from orders — LTV, AOV, order history |
| `/admin/affiliates` | Affiliate partners — approve, set commission rate, mark payouts |
| `/admin/discounts` | Discount/coupon management |
| `/admin/inventory` | Inventory tracking |
| `/admin/analytics` | Revenue charts and analytics |
| `/admin/settings` | Site settings |

### API routes (all require `Authorization: Bearer <ADMIN_SECRET>`)
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin/stats` | GET | Dashboard stats: revenue, orders, top products, status counts |
| `/api/admin/orders` | GET | List orders (filter by status/email, paginate) |
| `/api/admin/orders` | PATCH | Update order: status, tracking_number, notes |
| `/api/admin/customers` | GET | Customer list aggregated from orders |
| `/api/admin/affiliates` | GET | Affiliate list with conversion stats |
| `/api/admin/affiliates` | PATCH | Update: status, commission_rate, notes |
| `/api/admin/sync` | POST | Import historical WooCommerce orders into Supabase |

### WooCommerce Historical Order Sync
The sync endpoint pulls all historical orders from WooCommerce and upserts them into Supabase. Use this once after initial deployment to backfill data, or anytime you think orders are out of sync.

**Required env vars:**
```
WC_API_URL           → https://evolabsresearch.com/wp-json/wc/v3
WC_CONSUMER_KEY      → from WP Admin → WooCommerce → Settings → Advanced → REST API
WC_CONSUMER_SECRET   → (same place)
```

**How to trigger:** Log into `/admin` → Dashboard → click **"↓ Import All WooCommerce Orders"**. The button loops through all pages automatically (100 orders per page). Safe to run multiple times — uses `upsert` on `wc_order_id`.

### PirateShip Shipping
PirateShip has no public API. The orders detail panel includes an **"Open PirateShip →"** button (opens `ship.pirateship.com/shipments/new` in a new tab) and a **"Copy Address"** button that copies the shipping address to your clipboard. Paste it directly into PirateShip's new shipment form.

### Product Image Editing
In `/admin/products`, click Edit on any product to open the panel. The **Image URL** field lets you paste a new image URL — the preview updates in real-time. Changes currently apply to the admin session only; to make them permanent, update `lib/data.js` with the new URL.

---

## 17. Deployment Checklist

Work through this list in order when deploying to production:

### Supabase
- [ ] Run `supabase/schema.sql` in the SQL Editor
- [ ] Confirm all 10 tables were created (check Table Editor)
- [ ] Copy `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- [ ] (Optional) Enable `pg_cron` extension and schedule the commission auto-approval job

### NextAuth
- [ ] Generate `NEXTAUTH_SECRET`: `openssl rand -base64 32`
- [ ] Set `NEXTAUTH_URL` to production domain (no trailing slash)
- [ ] Set `RESEND_API_KEY` and `EMAIL_FROM` (see Section 5)
- [ ] Verify `evolabsresearch.com` domain in Resend dashboard + add DNS records
- [ ] Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- [ ] Test email: go to `/account/login`, enter email, confirm magic link arrives
- [ ] Test phone: go to `/account/login` → Phone tab, enter phone, confirm 6-digit SMS arrives

### WooCommerce
- [ ] Create REST API key (Read/Write) → save Consumer Key + Secret
- [ ] Create two webhooks (`order.created`, `order.updated`) → save Webhook Secret
- [ ] Upload and activate `woocommerce/evo-affiliate-tracking.php` on WordPress
- [ ] Test: place a test order with `?ref=TESTCODE` in the URL → check order meta for `_evo_affiliate_code`

### AfterShip
- [ ] Create API key at aftership.com
- [ ] Set `AFTERSHIP_API_KEY`
- [ ] Test: call `GET /api/tracking/[a real tracking number]?carrier=usps`

### OmniSend
- [ ] Get API key from OmniSend dashboard
- [ ] Set `OMNISEND_API_KEY`
- [ ] Create automation flows in OmniSend for: `order_placed`, `order_shipped`, `order_delivered`

### Mapbox
- [ ] Create public access token at mapbox.com
- [ ] Set `NEXT_PUBLIC_MAPBOX_TOKEN`
- [ ] Consider adding a URL restriction to the token (only allow your domain)

### Final checks
- [ ] `npm run build` completes with no errors
- [ ] `/account/login` → magic link flow works end-to-end
- [ ] `/account` → orders load
- [ ] `/account/tracking/[number]` → map renders
- [ ] `/account/partner` → stats load / apply button works
- [ ] Webhook receives a test event from WooCommerce and processes correctly

---

## 18. NPM Packages to Install

These packages were added and need to be installed:

```bash
npm install \
  next-auth \
  @next-auth/supabase-adapter \
  @supabase/supabase-js \
  mapbox-gl
```

All other integrations (AfterShip, OmniSend, WooCommerce) use native `fetch` — no extra packages needed.

### Full `package.json` dependencies reference:
```json
{
  "next-auth": "^4.x",
  "@next-auth/supabase-adapter": "^0.x",
  "@supabase/supabase-js": "^2.x",
  "mapbox-gl": "^3.x"
}
```

---

## 19. Known Issues / TODO

### Pending / Not Yet Done:
- **Product vial image recoloring** — The Python recolor script (v15/v16) has some unresolved visual issues deferred by the client: GHK-CU and GLOW categories don't look right; 5-Amino-1MQ has blue powder instead of orange; KLOW has purple instead of blue; Growth Hormone and GLP-1 look too similar. This work was intentionally deferred — do not start on it without client confirmation.
- **AfterShip coordinates** — Most USPS shipments don't return GPS coordinates in their checkpoints, so the map won't show a route for domestic USPS orders. This is an AfterShip/carrier data limitation, not a code bug. The map shows a graceful fallback message. FedEx and UPS tend to have better coordinate data.
- **OmniSend automation flows** — The API integration is wired up but the actual email/SMS templates inside the OmniSend dashboard still need to be built for the `order_placed`, `order_shipped`, and `order_delivered` events.
- **Commission auto-approval cron** — The `pg_cron` snippet is in `schema.sql` as a comment. Needs to be enabled manually on Supabase Pro plan.
- **Affiliate payout processing** — The payout request currently sends an email to `partners@evolabsresearch.com`. There's no automated payout system — payouts are manually processed. This could be upgraded later.
- **WooCommerce order meta keys** — The tracking number is read from `_tracking_number`, `_shipment_tracking_number`, or `tracking_number`. If your current shipment tracking plugin uses different meta keys, update `extractTrackingFromOrder()` in `lib/woocommerce.js`.

### Design notes:
- The site uses **inline styles throughout** (no CSS modules, no Tailwind). Keep this consistent when adding new pages.
- Font is **Poppins** (loaded via Google Fonts in `_app.jsx` or `_document.jsx`).
- Color scheme: background `#0f0f0f`, surface `rgba(255,255,255,0.03)`, accent green `#4ade80`.

---

## Questions?

Contact the project owner before making significant architectural changes. The private payment gateway and WooCommerce integration in particular need to stay exactly as-is — do not swap in Stripe or any other public payment processor.
