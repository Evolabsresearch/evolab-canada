# EVO Labs Research Site Audit Report

**Date:** 2026-03-14
**Auditor:** Claude Code
**Branch:** claude/quirky-allen

---

## Executive Summary

The EVO Labs Research site is a well-structured Next.js e-commerce application with a clean product catalog, proper RUO disclaimers throughout, and good technical architecture. The audit identified **2 critical issues** related to payment methods that violated the business constraints (no credit cards, no Stripe), plus several medium/low issues. All critical and high-severity issues have been fixed.

---

## Total Findings by Severity

| Severity | Total | Fixed | Needs Decision | Accepted/Noted |
|----------|-------|-------|----------------|----------------|
| CRITICAL | 2 | 2 | 0 | 0 |
| HIGH | 4 | 4 | 0 | 0 |
| MEDIUM | 2 | 2 | 0 | 0 |
| LOW | 1 | 1 | 0 | 0 |
| NEEDS_DECISION | 3 | 0 | 3 | 0 |
| INFO/ACCEPTED | 8 | 0 | 0 | 8 |
| **TOTAL** | **20** | **9** | **3** | **8** |

---

## Critical Issues Fixed

### 1. Credit Card Form in Checkout — FIXED
**File:** `pages/checkout.jsx`

The checkout page displayed a "Credit / Debit Card" payment form with Visa, Mastercard, and Amex logos, plus card number, expiry, and CVV input fields. This directly violated the business constraint that no Stripe or credit card processing is used.

**Fix:** Replaced the card form with a three-option payment section:
- Zelle (primary, highlighted as selected)
- Cryptocurrency (BTC/ETH/USDC)
- Gift Certificate

The order confirmation flow was also updated to reflect the manual payment model: customers are now instructed to send payment after placing the order, and the "What happens next?" steps correctly show "Send Payment" as step 1.

### 2. Card Logos on Product Detail Page — FIXED
**File:** `pages/products/[slug].jsx`

The product detail page add-to-cart section displayed a "Secure Card Processing" trust badge with Visa, Mastercard, and Amex logos, plus a "Bank Transfer via ACH powered by Plaid" widget.

**Fix:** Replaced with a payment methods badge showing "Zelle · BTC · ETH · Gift" with a link to the Payment Instructions page. Removed unused `VisaLogo`, `MastercardLogo`, `AmexLogo`, and `PlaidLogo` components from the codebase.

---

## High Issues Fixed

### 3. Incorrect Payment Methods in About FAQ — FIXED
**File:** `pages/about.jsx` line 8

FAQ answer stated "We accept major credit cards, debit cards, and other secure payment methods at checkout."

**Fix:** Updated to accurately describe Zelle, BTC/ETH/USDC, and gift certificates with a link to Payment Instructions.

### 4–5. Order Confirmation Flow Mismatch — FIXED
**File:** `pages/checkout.jsx` confirmation section

The order confirmation said "Order Confirmed!" and described immediate order processing, implying payment was already collected. Since payment is manual (Zelle/crypto), orders cannot be "confirmed" until payment is verified.

**Fix:** Updated to "Order Placed!" with a payment reminder box and updated "What happens next?" steps to correctly sequence: 1) Send Payment → 2) Order Processing → 3) Delivery.

### 6. Privacy Policy Listed "Billing Address" — FIXED
**File:** `pages/privacy.jsx` line 30

Listed "billing address" as collected data — not applicable for a Zelle/crypto payment model.

**Fix:** Removed "billing address" and updated to reflect actual data collected.

---

## NEEDS_DECISION Items

These items require business/technical decisions and cannot be auto-fixed:

### A. Contact Form Email Not Connected
**File:** `pages/api/contact.js` line 21

The contact form accepts submissions and returns 200 OK but does not actually send emails. The code has a `// TODO: connect email provider` comment with commented-out Resend and Supabase options.

**Decision needed:** Choose an email provider (Resend recommended) and connect the API route. Set `RESEND_API_KEY` and `CONTACT_EMAIL` env vars.

### B. Admin Dashboard Uses Mock Data
**File:** `lib/adminData.js`

All admin pages (orders, customers, affiliates, inventory, discounts) use hardcoded mock data arrays (`MOCK_ORDERS`, `MOCK_CUSTOMERS`, `MOCK_AFFILIATES`, `MOCK_INVENTORY`, `MOCK_DISCOUNTS`) rather than live Supabase data. The Supabase client and schema are set up (`lib/supabase.js`, `supabase/schema.sql`) but not wired to admin views.

**Decision needed:** Connect admin API routes to Supabase tables, or document that mock data is intentional for the current phase.

### C. Account Subscriptions Uses Mock Data
**File:** `pages/account/index.jsx` line 323

The "Subscriptions" tab in the customer account dashboard shows `MOCK_SUBSCRIPTIONS` array — 3 hardcoded subscription records.

**Decision needed:** Remove the subscriptions tab if subscriptions aren't offered, or connect to a real subscriptions system.

---

## Incomplete / Non-Functional Features

| Feature | Status | Notes |
|---------|--------|-------|
| Order placement API | Simulated (setTimeout) | `handlePlaceOrder` in checkout simulates a 2s delay then moves to confirmation. No real order is saved. Needs `/api/orders` POST integration. |
| Email notifications | Not connected | Contact form, order confirmation, and restock notifications all lack working email delivery. |
| Admin data | Mock only | All admin views show placeholder data, not live orders/customers. |
| SMS auth | Partial | Send-SMS and verify-SMS API routes exist but depend on Twilio credentials in env. |
| AfterShip tracking | Configured | `lib/aftership.js` exists; tracking page calls `/api/tracking/[number]` which calls AfterShip — works if `AFTERSHIP_API_KEY` is set. |
| Omnisend newsletter | Configured | `lib/omnisend.js` exists; `/api/newsletter` calls Omnisend — works if `OMNISEND_API_KEY` is set. |
| AI Chat | Configured | `/api/chat` uses OpenAI — works if `OPENAI_API_KEY` is set. |

---

## Prioritized Remaining Work

### Priority 1 — Revenue-Critical
1. **Connect order placement API** — The checkout currently simulates order creation. Real orders need to be saved to Supabase and trigger a confirmation email with the Order ID and payment instructions.
2. **Connect contact/order email provider** — Set up Resend (or similar) so customers receive actual order confirmations and operators receive contact form submissions.

### Priority 2 — Operations
3. **Connect admin dashboard to Supabase** — Replace all mock data in admin views with live database queries.
4. **Remove account subscriptions mock** — Either build real subscription functionality or remove the tab.

### Priority 3 — Enhancement
5. **Set up environment variables** — Verify all required env vars are documented and set in production: `NEXTAUTH_SECRET`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `RESEND_API_KEY`, `OMNISEND_API_KEY`, `OPENAI_API_KEY`, `AFTERSHIP_API_KEY`, etc.
6. **Wire discount codes to Supabase** — Currently `/api/discount/validate` reads from `MOCK_DISCOUNTS` array. Should query Supabase for real code management.

---

## What's Working Well

- **Product catalog** — All 48 products correctly defined with prices, images, descriptions, categories, slugs, and ratings. 8 categories correctly mapped. Branded lines (GLOW, KLOW, Blue Tide/GLP) properly tagged.
- **RUO compliance** — "For Research Use Only" disclaimers present in footer, cart, checkout, product pages, terms, disclaimer, research-use policy, and partners program. Research data uses appropriate academic framing.
- **Payment method consistency** — After fixes, all user-facing payment references now consistently show Zelle/crypto/gift certificates (no credit cards, no Stripe).
- **Cart functionality** — Volume discounts, promo codes, shipping threshold, mini-cart, upsells, and recently-viewed all functional.
- **Product search** — Live search overlay with keyboard shortcut (Cmd/Ctrl+K), product results with images and prices.
- **Admin auth protection** — Admin routes protected by password via `middleware.js` and `AdminLayout.jsx`.
- **COA library** — 30+ COA entries with batch numbers, test dates, image previews, and PDF download links.
- **Research library** — Deep per-compound research data including mechanisms, clinical data, safety profiles, and citations.
- **Legal pages** — Terms, Privacy, Returns, Disclaimer, Research-Use all present with real content.
- **SEO** — Canonical URLs, OG tags, Twitter Cards, structured data, and FAQ schema all implemented.
- **Accessibility** — Skip-to-content link, ARIA labels, focus-visible styles, reduced-motion media query.
- **Responsive design** — Mobile bottom nav, collapsible header nav, responsive grid layouts.

---

## Files Modified

| File | Change |
|------|--------|
| `pages/checkout.jsx` | Replaced credit card form → Zelle/crypto/gift payment options; updated order confirmation flow |
| `pages/products/[slug].jsx` | Removed card logos/ACH widget; replaced with accurate payment methods; removed unused card logo functions |
| `pages/about.jsx` | Fixed payment FAQ answer |
| `pages/privacy.jsx` | Fixed order information list and payment processing section |
| `pages/cart.jsx` | "Dosage:" → "Size:" label |
| `pages/api/hello.ts` | "John Doe" → "EVO Labs Research" |

## Files Created

| File | Purpose |
|------|---------|
| `PROJECT_STRUCTURE.md` | Full project directory tree with framework info |
| `ALL_ROUTES.md` | Complete list of all public, account, admin, and API routes |
| `ALL_COMPONENTS.md` | All components with types, dependencies, and descriptions |
| `AUDIT_LOG.md` | Detailed finding log with severity, file, line, and status |
| `AUDIT_REPORT.md` | This file |
