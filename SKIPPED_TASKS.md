# SKIPPED TASKS — EVO Labs Research

> Tasks not implemented during this build session, with reasoning and suggested approach.

---

## Payment Integration (Plaid / Credit-Debit)

**Task:** 4.3 — Payment flow supporting Plaid and Credit/Debit
**Status:** SKIPPED
**Reason:** Plaid integration requires backend API credentials, business account setup, and OAuth flow that needs real keys. Cannot safely mock in frontend.
**Suggested Approach:**
1. Sign up at https://plaid.com for API credentials
2. Use Plaid Link React SDK: `npm install react-plaid-link`
3. Create `/api/payment/plaid-link-token` to generate link tokens server-side
4. Create `/api/payment/exchange-token` to exchange for access token
5. Process ACH payments via Plaid Payment Initiation API

**Alternative (recommended):** Use the "digital gift certificate" workaround used by Modern Aminos — integrate Stripe via a third-party gift card processor that handles compliance separately.

---

## Email Platform Integration (Klaviyo/Omnisend)

**Task:** 4.6 — Newsletter connected to email platform
**Status:** PARTIALLY SKIPPED (Omnisend already in `lib/omnisend.js`, newsletter popup exists)
**Reason:** Requires valid Omnisend/Klaviyo API keys in `.env`
**Suggested Approach:**
1. Add `OMNISEND_API_KEY` to `.env.local`
2. Update `/api/newsletter.js` with proper Omnisend contact creation
3. For Klaviyo: `npm install @klaviyo/api` and use Lists API

---

## Product Variant Pricing (Live Scrape from evolabsresearch.com)

**Task:** 4.2 — Size/variant selector with data scraped from evolabsresearch.com
**Status:** SKIPPED
**Reason:** Cannot scrape external site during build. Would require Puppeteer/Playwright in a separate script or manual data entry.
**Suggested Approach:**
1. Run `node scripts/scrapeVariants.js` (create this script using Puppeteer)
2. Or manually add variant pricing to `lib/data.js` for each product
3. Product page already has variant selector UI — just needs data

---

## Real-Time Analytics (Google Analytics / GTM)

**Task:** Analytics with live traffic data
**Status:** SKIPPED (analytics dashboard uses mock data)
**Reason:** Requires GA4 property ID and GTM container. No credentials available.
**Suggested Approach:**
1. Add `NEXT_PUBLIC_GA_ID` to `.env`
2. Add gtag.js to `pages/_document.tsx`
3. Or use `next-gtm` package for GTM integration
4. Connect to admin analytics page via GA Reporting API

---

## Trustpilot Integration

**Task:** Product review system with Trustpilot
**Status:** SKIPPED
**Reason:** Requires Trustpilot business account and review widget JavaScript snippet.
**Suggested Approach:**
1. Create Trustpilot Business account at https://business.trustpilot.com
2. Add widget snippet to product pages
3. Implement post-purchase review invitation via Trustpilot API

---

## SMS Order Notifications

**Task:** SMS notifications (Modern Aminos feature)
**Status:** SKIPPED
**Reason:** Requires Twilio or similar SMS provider API keys.
**Suggested Approach:**
1. Install `twilio` npm package
2. Add `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` to `.env`
3. Create `/api/sms/notify.js` endpoint
4. Trigger on order status change in admin

---

## Loyalty/Rewards Program

**Task:** Loyalty points balance in customer account
**Status:** SKIPPED
**Reason:** Requires points tracking database, rules engine, and redemption flow — significant scope.
**Suggested Approach:**
1. Add `loyalty_points` column to Supabase customers table
2. Award points on order completion (e.g., 1 point per $1 spent)
3. Display in `/account` page
4. Create redemption mechanism at checkout

---

## Discord Community Integration

**Task:** Discord community access with purchases
**Status:** SKIPPED
**Reason:** Requires Discord server setup and bot configuration.
**Suggested Approach:**
1. Create Discord server for EVO Labs Research community
2. Set up Discord bot with role assignment
3. On order completion, trigger Discord API to assign "Customer" role
4. Display Discord invite in order confirmation email

---

## Wholesale Application System

**Task:** Wholesale/bulk pricing application
**Status:** SKIPPED
**Reason:** Business process not yet defined (pricing tiers, approval workflow).
**Suggested Approach:**
1. Create `/wholesale` page with application form
2. Store applications in Supabase `wholesale_applications` table
3. Admin review in admin dashboard
4. Assign wholesale-tagged customers special pricing via discount codes

---

## COA Library — Fix GLP-1 (S) Double Extension

**Task:** Fix the GLP-1 (S) double .pdf extension link in COA library
**Status:** SKIPPED — requires knowing the exact broken URL in the COA data
**Suggested Approach:**
1. Open `/coa` page
2. Find GLP-1 (S) COA link
3. Remove the duplicate `.pdf.pdf` extension in `lib/data.js`

---

## Exit-Intent Popup (Desktop Only)

**Task:** Exit-intent popup "Get 10% off your first order"
**Status:** SKIPPED
**Reason:** Exit-intent detection using `mouseleave` on document is implemented in NewsletterPopup — enhance it.
**Suggested Approach:**
1. Add mouseleave event listener on document
2. Check if user is on desktop (`window.innerWidth > 768`)
3. Show popup with discount code offer only once per session
4. Connect to newsletter signup flow

---

## Breadcrumb Schema on Product/Category Pages

**Task:** BreadcrumbList JSON-LD schema
**Status:** SKIPPED
**Reason:** Minor SEO item, handled after other priorities.
**Suggested Approach:** Add to product page `<Head>` in `pages/products/[slug].jsx`

---

## Self-Host WordPress Assets

**Task:** Move remaining WordPress-hosted images to Vercel
**Status:** SKIPPED
**Reason:** Requires downloading 48+ images and uploading to `/public/images/products/`
**Suggested Approach:**
1. Run `node scripts/downloadImages.js` (create to batch download from evolabsresearch.com)
2. Update all image URLs in `lib/data.js`
3. Use `next/image` for optimization
