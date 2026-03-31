# EVO Labs Research Canada — Backend Setup Guide

This guide walks you through setting up the complete backend for the Canadian site.

---

## Step 1: Create a New Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Name it something like `evolabs-canada`
4. Choose a region close to your users (e.g., **East US** or **Canada** if available)
5. Set a strong database password and save it somewhere safe
6. Wait for the project to spin up

### Run the Setup SQL

1. In your new Supabase project, go to **SQL Editor**
2. Open and run the file: `supabase/setup-canada.sql`
3. This creates all tables, indexes, RLS policies, and seeds Canadian defaults

### Create the Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Click **New Bucket**
3. Name it `site-content`
4. Set it to **Public** (for COA PDFs and content overrides)

### Get Your Keys

Go to **Settings → API** and copy:
- `Project URL` → use as `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → use as `SUPABASE_SERVICE_ROLE_KEY` (never expose to browser)

---

## Step 2: Set Up Payment Processors

### Stripe (Card Payments)

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Create a **new Stripe account** for your Canadian entity (processes in CAD)
3. Go to **Developers → API Keys**
4. Copy:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`
5. Set up webhook:
   - Go to **Developers → Webhooks → Add endpoint**
   - URL: `https://evolabsresearch.ca/api/webhooks/stripe` (or through your Cloudflare proxy)
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
   - Copy the **Signing Secret** → `STRIPE_WEBHOOK_SECRET`
6. Enable `NEXT_PUBLIC_STRIPE_ENABLED=true`

### Hummingbird / Adyen (Alternative Card Processing)

1. Contact Hummingbird to set up a new merchant account for CAD
2. Get your keys from the Hummingbird dashboard:
   - `HUMMINGBIRD_SERVER_URL` (usually `https://hummingbird.paywithwallet.net`)
   - `HUMMINGBIRD_PUBLIC_KEY`
   - `HUMMINGBIRD_SECRET_KEY`

### Link Money (Bank Payments / EFT)

1. Set up a Link Money account for Canadian bank payments
2. Get credentials:
   - `LINKMONEY_CLIENT_ID`
   - `LINKMONEY_CLIENT_SECRET`
   - `LINKMONEY_REDIRECT_URL` = `https://evolabsresearch.ca/checkout`

---

## Step 3: Set Up Email (Resend)

1. Go to [resend.com](https://resend.com)
2. **Add domain**: `evolabsresearch.ca`
3. Add the DNS records Resend provides (DKIM, SPF, DMARC)
4. Create an API key
5. Set env vars:
   - `RESEND_API_KEY` = your new key
   - `EMAIL_SERVER_PASSWORD` = same key
   - `EMAIL_FROM` = `EVO Labs Research Canada <noreply@evolabsresearch.ca>`

---

## Step 4: Set Up Twilio (Phone OTP)

You can reuse your existing Twilio account, but consider:
1. Get a **Canadian phone number** for SMS sender ID
2. Create a new **Verify Service** at console.twilio.com → Verify → Services
3. Set:
   - `TWILIO_ACCOUNT_SID` (same as US)
   - `TWILIO_AUTH_TOKEN` (same as US)
   - `TWILIO_VERIFY_SERVICE_SID` (new or same)

---

## Step 5: Set Up Omnisend (Email Marketing)

**Recommended: Create a separate Omnisend workspace** for CASL compliance.

1. Go to [omnisend.com](https://omnisend.com) and create a new store/workspace
2. Go to **Store Settings → API Keys**
3. Set:
   - `OMNISEND_API_KEY`
   - `NEXT_PUBLIC_OMNISEND_BRAND_ID` (from the embed snippet)

This keeps Canadian and US subscriber lists separate — important for CASL.

---

## Step 6: Set Up Google Analytics

1. Go to [analytics.google.com](https://analytics.google.com)
2. Create a **new GA4 property** for `evolabsresearch.ca`
3. Create a **Web data stream** for `evolabsresearch.ca`
4. Copy the **Measurement ID** (G-XXXXXXXXXX) → `NEXT_PUBLIC_GA_ID`

Note: GA only loads after users accept cookies (PIPEDA compliant).

---

## Step 7: Deploy to Vercel

### Import the Repo

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `Evolabsresearch/evolab-canada`
3. Framework: **Next.js** (auto-detected)

### Add Environment Variables

In Vercel → Project Settings → Environment Variables, add ALL of these:

```
# Supabase (NEW — from Step 1)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# NextAuth (NEW)
NEXTAUTH_SECRET=          # run: openssl rand -base64 32
NEXTAUTH_URL=https://evolabsresearch.ca

# Admin (NEW credentials)
ADMIN_SECRET=
NEXT_PUBLIC_ADMIN_EMAIL=
NEXT_PUBLIC_ADMIN_PW=

# Email - Resend (NEW — from Step 3)
RESEND_API_KEY=
EMAIL_SERVER_HOST=smtp.resend.com
EMAIL_SERVER_PORT=465
EMAIL_SERVER_USER=resend
EMAIL_SERVER_PASSWORD=
EMAIL_FROM=EVO Labs Research Canada <noreply@evolabsresearch.ca>

# Twilio (reuse or new — from Step 4)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_VERIFY_SERVICE_SID=

# Hummingbird (NEW — from Step 2)
HUMMINGBIRD_SERVER_URL=https://hummingbird.paywithwallet.net
HUMMINGBIRD_PUBLIC_KEY=
HUMMINGBIRD_SECRET_KEY=

# Stripe (NEW — from Step 2)
NEXT_PUBLIC_STRIPE_ENABLED=true
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Link Money (NEW — from Step 2)
LINKMONEY_CLIENT_ID=
LINKMONEY_CLIENT_SECRET=
LINKMONEY_API_BASE_URL=https://api.link.money
LINKMONEY_REDIRECT_URL=https://evolabsresearch.ca/checkout

# Omnisend (NEW — from Step 5)
OMNISEND_API_KEY=
NEXT_PUBLIC_OMNISEND_BRAND_ID=

# Google Analytics (NEW — from Step 6)
NEXT_PUBLIC_GA_ID=

# WooCommerce (reuse from US if same catalog)
WC_STORE_URL=https://evolabsresearch.com
WC_CONSUMER_KEY=
WC_CONSUMER_SECRET=
WC_WEBHOOK_SECRET=

# Other (reuse or new)
ANTHROPIC_API_KEY=
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=
AFTERSHIP_API_KEY=
CRON_SECRET=
```

### Connect Domain

1. Go to **Project Settings → Domains**
2. Add `evolabsresearch.ca`
3. Add DNS records at your registrar:
   - **A record**: `@` → `76.76.21.21`
   - **CNAME**: `www` → `cname.vercel-dns.com`

---

## Step 8: Cloudflare Worker (Stripe Webhook Proxy)

If you route Stripe webhooks through Cloudflare:

1. Deploy the updated worker from `evovera-webhook-proxy/`
2. The Canadian version already points to `evolabsresearch.ca/api/webhooks/stripe`
3. Set the Stripe webhook URL to your Cloudflare worker's Canadian endpoint

---

## Step 9: Seed Products

After deploying, hit the admin product seed endpoint:

```bash
curl -X POST https://evolabsresearch.ca/api/admin/products \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"action": "seed"}'
```

This populates the Supabase products table from `lib/data.js`.

---

## Step 10: Verify Everything Works

1. Visit `https://evolabsresearch.ca` — age gate should appear
2. Accept cookies — GA should start loading
3. Browse products — should show with CAD pricing
4. Test checkout flow with Stripe test mode
5. Test admin panel at `/admin`
6. Test newsletter signup — CASL consent checkbox should appear
7. Test phone OTP login

---

## Quick Reference: What's Separate vs Shared

| Service | Separate for Canada? | Why? |
|---------|---------------------|------|
| Supabase | ✅ Yes | PIPEDA data residency, clean reporting |
| Stripe | ✅ Yes | CAD processing, separate merchant |
| Hummingbird | ✅ Yes | CAD processing |
| Omnisend | ✅ Yes | CASL compliance, separate lists |
| Resend | ✅ Yes | Different sending domain (.ca) |
| GA4 | ✅ Yes | Separate analytics property |
| Twilio | 🔁 Can share | Same account, maybe different number |
| AfterShip | 🔁 Can share | Same tracking service |
| WooCommerce | 🔁 Can share | If same product catalog |
| Anthropic | 🔁 Can share | Same API key works |
| Mapbox | 🔁 Can share | Add .ca to allowed domains |
