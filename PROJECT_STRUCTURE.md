# EVO Labs Research — Project Structure

**Framework:** Next.js (Pages Router)
**Language:** JavaScript/JSX + TypeScript (mixed)
**Styling:** Inline styles + CSS modules
**Auth:** NextAuth.js
**Database:** Supabase (PostgreSQL)
**Package Manager:** npm

---

## Root Directory

```
evolabs-site/
├── components/              # Shared/reusable UI components
├── context/                 # React context providers
├── data/                    # Legacy product/category data (superseded by lib/data.js)
├── lib/                     # Core data, utilities, and API clients
├── middleware.js            # Next.js middleware (admin route protection)
├── next.config.ts           # Next.js configuration
├── package.json             # Dependencies
├── pages/                   # All routes (Next.js Pages Router)
├── public/                  # Static assets (images, robots.txt, favicon)
├── scripts/                 # Build/image processing scripts
├── styles/                  # Global CSS and CSS modules
├── supabase/                # Supabase schema SQL
├── tsconfig.json            # TypeScript configuration
└── woocommerce/             # WooCommerce affiliate plugin (PHP)
```

---

## components/

| File | Type | Purpose |
|------|------|---------|
| `Layout.jsx` | Shared | Main layout wrapper — header, footer, nav, search, mini-cart |
| `MiniCart.jsx` | Shared | Slide-out cart panel |
| `NewsletterPopup.jsx` | Shared | Email/SMS signup popup |
| `ChatWidget.jsx` | Shared | AI chat support widget |
| `CompareDrawer.jsx` | Shared | Product comparison slide-out panel |
| `PharmCard.jsx` | Shared | Scientific compound profile card |
| `SocialProofToast.jsx` | Shared | "Someone just bought X" toast notifications |
| `TrackingMap.jsx` | Shared | Order tracking map visualization |
| `LoginGateModal.jsx` | Shared | Auth gate modal for cart access |
| `admin/AdminLayout.jsx` | Admin | Admin dashboard layout with auth |

---

## context/

| File | Purpose |
|------|---------|
| `CartContext.jsx` | Shopping cart state — items, quantities, totals, discounts |
| `CompareContext.jsx` | Product comparison state |
| `RecentlyViewedContext.jsx` | Recently viewed products history |
| `WishlistContext.jsx` | Wishlist/saved products |

---

## lib/

| File | Purpose |
|------|---------|
| `data.js` | **Primary data source** — 48 products, categories, COAs, FAQs, reviews, variants, research data |
| `adminData.js` | Admin mock data — orders, customers, affiliates, inventory, discounts |
| `aftership.js` | AfterShip shipment tracking integration |
| `newsletterCodes.js` | Newsletter discount code generation |
| `omnisend.js` | Omnisend email/SMS marketing integration |
| `supabase.js` | Supabase client initialization |
| `woocommerce.js` | WooCommerce API client (legacy) |

---

## data/ (Legacy)

| File | Note |
|------|------|
| `products.js` | Legacy product data — superseded by `lib/data.js` |
| `categories.js` | Legacy category data — superseded by `lib/data.js` |

---

## pages/ (All Routes)

### Public Pages
| Route | File | Description |
|-------|------|-------------|
| `/` | `index.jsx` | Homepage |
| `/products` | `products.jsx` | Product catalog with filters |
| `/products/[slug]` | `products/[slug].jsx` | Product detail page |
| `/stacks` | `stacks.jsx` | Research stacks/bundles |
| `/bundle` | `bundle.jsx` | Bundle builder |
| `/cart` | `cart.jsx` | Shopping cart |
| `/checkout` | `checkout.jsx` | Checkout flow (3-step) |
| `/payment-instructions` | `payment-instructions.jsx` | Zelle/crypto/ACH payment guide |
| `/about` | `about.jsx` | About page + FAQ |
| `/contact` | `contact.jsx` | Contact form |
| `/research` | `research.jsx` | Research library |
| `/research-use` | `research-use.jsx` | RUO policy page |
| `/coa` | `coa.jsx` | COA library |
| `/track` | `track.jsx` | Order tracking |
| `/faq` | `faq.jsx` | FAQ page |
| `/partners` | `partners.jsx` | Affiliate partner program |
| `/wholesale` | `wholesale.jsx` | Wholesale application |
| `/terms` | `terms.jsx` | Terms of service |
| `/privacy` | `privacy.jsx` | Privacy policy |
| `/returns` | `returns.jsx` | Returns/refunds policy |
| `/disclaimer` | `disclaimer.jsx` | Legal disclaimer |
| `/sitemap.xml` | `sitemap.xml.jsx` | Sitemap |
| `/404` | `404.jsx` | 404 error page |

### Account Pages
| Route | File |
|-------|------|
| `/account` | `account/index.jsx` |
| `/account/login` | `account/login.jsx` |
| `/account/partner` | `account/partner.jsx` |
| `/account/verify-email` | `account/verify-email.jsx` |
| `/account/auth-error` | `account/auth-error.jsx` |
| `/account/tracking/[trackingNumber]` | `account/tracking/[trackingNumber].jsx` |

### Admin Pages
| Route | File |
|-------|------|
| `/admin` | `admin/index.jsx` |
| `/admin/orders` | `admin/orders.jsx` |
| `/admin/products` | `admin/products.jsx` |
| `/admin/customers` | `admin/customers.jsx` |
| `/admin/affiliates` | `admin/affiliates.jsx` |
| `/admin/discounts` | `admin/discounts.jsx` |
| `/admin/inventory` | `admin/inventory.jsx` |
| `/admin/analytics` | `admin/analytics.jsx` |
| `/admin/settings` | `admin/settings.jsx` |

### API Routes
| Route | File |
|-------|------|
| `/api/auth/[...nextauth]` | `api/auth/[...nextauth].js` |
| `/api/auth/send-otp` | `api/auth/send-otp.js` |
| `/api/auth/send-sms` | `api/auth/send-sms.js` |
| `/api/auth/verify-sms` | `api/auth/verify-sms.js` |
| `/api/orders` | `api/orders.js` |
| `/api/contact` | `api/contact.js` |
| `/api/newsletter` | `api/newsletter.js` |
| `/api/chat` | `api/chat.js` |
| `/api/notify-restock` | `api/notify-restock.js` |
| `/api/discount/validate` | `api/discount/validate.js` |
| `/api/validate-discount` | `api/validate-discount.js` |
| `/api/tracking/[trackingNumber]` | `api/tracking/[trackingNumber].js` |
| `/api/affiliate/register` | `api/affiliate/register.js` |
| `/api/affiliate/stats` | `api/affiliate/stats.js` |
| `/api/admin/_auth` | `api/admin/_auth.js` |
| `/api/admin/affiliates` | `api/admin/affiliates.js` |
| `/api/admin/analytics` | `api/admin/analytics.js` |
| `/api/admin/customers` | `api/admin/customers.js` |
| `/api/admin/orders` | `api/admin/orders.js` |
| `/api/admin/stats` | `api/admin/stats.js` |
| `/api/admin/sync` | `api/admin/sync.js` |
| `/api/webhooks/woocommerce` | `api/webhooks/woocommerce.js` |
| `/api/hello` | `api/hello.ts` |

---

## public/

```
public/
├── images/products/     # 48 product images (01–48-*.png) + hero images
├── favicon.ico
├── robots.txt
├── sitemap.xml (static)
└── *.svg                # Next.js default SVGs
```

---

## Key Configuration Files

| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js config — images, rewrites |
| `middleware.js` | Admin route protection |
| `.env.local.example` | Environment variable template |
| `tsconfig.json` | TypeScript config |
| `supabase/schema.sql` | Database schema |
