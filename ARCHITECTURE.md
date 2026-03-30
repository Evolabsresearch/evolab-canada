# ARCHITECTURE — EVO Labs Research Site

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (Pages Router) | 16.1.6 |
| UI | React | 19.2.3 |
| Language | JavaScript (JSX) + TypeScript | TS 5.9.3 |
| Database | Supabase (PostgreSQL) | @supabase/supabase-js ^2 |
| Auth | NextAuth.js + Supabase Adapter | ^4.24 |
| AI Chat | Anthropic Claude API | @anthropic-ai/sdk ^0.78 |
| Tracking | AfterShip | lib/aftership.js |
| Email | Omnisend | lib/omnisend.js |
| Maps | Mapbox GL | ^3.20 |
| Hosting | Vercel | — |

---

## File Structure

```
evolabs-site/
├── components/
│   ├── admin/
│   │   └── AdminLayout.jsx         # Admin sidebar layout + auth
│   ├── ChatWidget.jsx               # AI chat with Anthropic API
│   ├── Layout.jsx                   # Global page layout
│   ├── MiniCart.jsx                 # Slide-out cart drawer
│   ├── NewsletterPopup.jsx          # Email capture popup
│   ├── PharmCard.jsx                # Product card component
│   └── TrackingMap.jsx              # Mapbox shipment tracking
│
├── context/
│   └── CartContext.jsx              # Cart state (localStorage persistence)
│
├── data/
│   ├── categories.js                # 9 product categories
│   └── products.js                  # 48 product records (basic)
│
├── lib/
│   ├── adminData.js                 # Admin mock data layer (MVP)
│   ├── aftership.js                 # Shipment tracking integration
│   ├── data.js                      # Full product data (research, COAs, reviews)
│   ├── omnisend.js                  # Email marketing integration
│   ├── supabase.js                  # Supabase client
│   └── woocommerce.js               # WooCommerce REST API client
│
├── pages/
│   ├── _app.tsx                     # App wrapper with CartProvider
│   ├── _document.tsx                # HTML head (fonts)
│   ├── 404.jsx                      # Custom 404 page
│   ├── about.jsx
│   ├── cart.jsx
│   ├── checkout.jsx
│   ├── coa.jsx                      # COA library
│   ├── contact.jsx
│   ├── disclaimer.jsx               # NEW: Legal disclaimer
│   ├── faq.jsx
│   ├── index.jsx                    # Homepage
│   ├── partners.jsx                 # Affiliate public page
│   ├── privacy.jsx                  # NEW: Privacy policy
│   ├── products.jsx                 # Product catalog
│   ├── research.jsx
│   ├── research-use.jsx             # NEW: RUO policy
│   ├── returns.jsx                  # NEW: Returns policy
│   ├── sitemap.xml.jsx              # NEW: Dynamic sitemap
│   ├── terms.jsx                    # NEW: Terms of service
│   │
│   ├── account/
│   │   ├── index.jsx               # Customer account dashboard
│   │   ├── login.jsx
│   │   ├── partner.jsx             # Affiliate dashboard
│   │   ├── auth-error.jsx
│   │   ├── verify-email.jsx
│   │   └── tracking/[trackingNumber].jsx
│   │
│   ├── admin/                       # NEW: Full admin dashboard
│   │   ├── index.jsx               # Dashboard home
│   │   ├── orders.jsx              # Order management
│   │   ├── products.jsx            # Product management
│   │   ├── customers.jsx           # Customer management
│   │   ├── inventory.jsx           # Inventory management
│   │   ├── affiliates.jsx          # Affiliate management
│   │   ├── discounts.jsx           # Discount codes
│   │   ├── analytics.jsx           # Analytics
│   │   └── settings.jsx            # Store settings
│   │
│   ├── api/
│   │   ├── auth/[...nextauth].js   # NextAuth config
│   │   ├── affiliate/
│   │   │   ├── register.js
│   │   │   └── stats.js
│   │   ├── chat.js                  # Anthropic AI endpoint
│   │   ├── newsletter.js
│   │   ├── orders.js
│   │   ├── tracking/[trackingNumber].js
│   │   └── webhooks/woocommerce.js
│   │
│   └── products/
│       └── [slug].jsx              # Product detail page
│
├── public/
│   ├── robots.txt                   # NEW
│   └── images/products/
│
├── styles/
│   └── globals.css
│
├── middleware.js                    # Affiliate cookie tracking
├── next.config.ts
└── supabase/
```

---

## Data Flow

### Product Data
```
lib/data.js (products array)
    → pages/products.jsx (catalog listing)
    → pages/products/[slug].jsx (detail page)
    → components/PharmCard.jsx (product card)
```

### Cart Flow
```
User clicks "Add to Cart"
    → CartContext.addItem()
    → localStorage 'evo_cart' (persistence)
    → MiniCart drawer opens
    → Checkout page reads cart from context
    → Order placed → manual payment (Zelle/crypto)
```

### Affiliate Tracking
```
User visits evolabsresearch.com?ref=ISAIAH15
    → middleware.js intercepts
    → Sets cookie: __evo_aff=ISAIAH15 (30 days)
    → On purchase: affiliate credited via API
```

### Admin Auth
```
Visit /admin
    → AdminLayout checks sessionStorage 'evo_admin'
    → Not found: shows password form
    → Correct password: sessionStorage.setItem('evo_admin', 'true')
    → Subsequent pages: auth check passes
```

### Supabase Auth (Customer/Affiliate)
```
Email entered at /account/login
    → NextAuth sends magic link
    → User clicks link → /account/verify-email
    → Session created with Supabase adapter
    → Session includes isPartner flag from 'partners' table
```

---

## Environment Variables Required

Create `.env.local` with:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth
NEXTAUTH_URL=https://evolabsresearch.com
NEXTAUTH_SECRET=your-nextauth-secret

# Email (for magic links)
EMAIL_SERVER=smtp://...
EMAIL_FROM=noreply@evolabsresearch.com

# Anthropic (AI Chat)
ANTHROPIC_API_KEY=sk-ant-...

# Admin Dashboard
NEXT_PUBLIC_ADMIN_PW=your-admin-password

# AfterShip
AFTERSHIP_API_KEY=your-aftership-key

# Omnisend
OMNISEND_API_KEY=your-omnisend-key

# WooCommerce (legacy product sync)
WC_URL=https://evolabsresearch.com
WC_KEY=ck_...
WC_SECRET=cs_...

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...
```

---

## Key Components

### AdminLayout
- Password-protected (sessionStorage)
- Collapsible dark sidebar with icon navigation
- Responsive (works on tablet)
- Logout clears session

### CartContext
- Persistent via localStorage (`evo_cart`)
- Free shipping at $250
- Flat rate $9.99 below threshold
- Provides: cart, itemCount, subtotal, shipping, total, addItem, removeItem, updateQty

### ChatWidget
- Anthropic Claude API via `/api/chat`
- IntersectionObserver moves widget when sticky cart bar visible
- Session-based conversation history

### Affiliate Tracking
- Middleware sets `__evo_aff` cookie on `?ref=CODE`
- 30-day attribution window
- Discount code attribution independent of URL click
