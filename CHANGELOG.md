# CHANGELOG — EVO Labs Research Site

> Branch: `claude/xenodochial-sanderson`
> All changes built overnight. See commit history for exact timestamps.

---

## [2026-03-13] — Overnight Full Build

### Commit: feat: admin dashboard — orders, products, customers, inventory, affiliates, analytics, discounts, settings

**Files Created:**
- `components/admin/AdminLayout.jsx` — Dark-themed sidebar admin layout with password protection
- `lib/adminData.js` — JSON-based mock data layer (orders, customers, affiliates, inventory, discounts, analytics)
- `pages/admin/index.jsx` — Dashboard home: revenue stats, recent orders, top products, pending payouts, quick actions
- `pages/admin/orders.jsx` — Order management: search/filter, status updates, tracking numbers, notes, CSV export
- `pages/admin/products.jsx` — Product management: list/search/sort, edit panel with price/status/COA fields
- `pages/admin/customers.jsx` — Customer list with LTV, order history, tags (VIP/wholesale/affiliate), notes
- `pages/admin/inventory.jsx` — Stock tracking with low-stock alerts, adjustment log, cost/margin data
- `pages/admin/affiliates.jsx` — Affiliate management: tier system, payout tracking, commission rate editing
- `pages/admin/discounts.jsx` — Coupon code creation/management with usage tracking and date ranges
- `pages/admin/analytics.jsx` — Revenue charts, product/category breakdowns, payment methods, affiliate leaderboard
- `pages/admin/settings.jsx` — Store info, shipping, payments (NO STRIPE), compliance, affiliate, email templates

**Files Modified:**
- `components/Layout.jsx` — Added skip-to-content link, enhanced OG/Twitter meta tags, ogImage/structuredData props

---

### Commit: feat: SEO foundation — sitemap, robots, meta tags, structured data, performance

**Files Created:**
- `public/robots.txt` — Allows public pages, disallows /account, /cart, /api, /admin
- `pages/sitemap.xml.jsx` — Dynamic sitemap with all 48 product URLs, 8 category pages, static pages

**Files Modified:**
- `components/Layout.jsx` — OG tags, Twitter Card, canonical URLs, skip-to-content, structuredData prop

---

### Commit: feat: customer UX, legal pages, mobile nav, free shipping progress bar

**Files Created:**
- `pages/404.jsx` — Branded 404 with search bar, quick links, popular products grid
- `pages/privacy.jsx` — Full Privacy Policy (CCPA/GDPR compliant language)
- `pages/terms.jsx` — Terms of Service
- `pages/disclaimer.jsx` — RUO disclaimer page
- `pages/returns.jsx` — Returns & Refunds Policy
- `pages/research-use.jsx` — Research Use Only compliance policy

**Files Modified:**
- `components/MiniCart.jsx` — Visual free-shipping progress bar (gradient, animated)
- `components/Layout.jsx` — Mobile bottom navigation (Shop/Research/Cart/Account with badge)
- `components/ChatWidget.jsx` — IntersectionObserver scroll behavior (moves to top-right when sticky cart bar visible)
- `pages/products/[slug].jsx` — Added `id="sticky-add-to-cart"` to sticky bar for observer target

---

## Architecture Notes

### Data Storage
- **MVP:** JSON-based mock data in `lib/adminData.js`
- **Production:** Supabase already configured (`lib/supabase.js`). Migrate adminData to Supabase tables.

### Admin Authentication
- Session-based: password stored in `NEXT_PUBLIC_ADMIN_PW` env var
- **Production:** Use NextAuth admin role or Supabase RLS policies

### Affiliate Tracking
- Cookie: `__evo_aff` set by `middleware.js` on `?ref=CODE`
- Attribution window: 30 days
- Commission calculation: runs on order completion (14-day hold)
