# EVO Labs Research — All Routes

## Public Routes

| Route | Page File | Notes |
|-------|-----------|-------|
| `/` | `pages/index.jsx` | Homepage with hero, featured products, reviews |
| `/products` | `pages/products.jsx` | Full product catalog with category/search filters |
| `/products/[slug]` | `pages/products/[slug].jsx` | Dynamic product detail page |
| `/stacks` | `pages/stacks.jsx` | Pre-built research stacks/bundles |
| `/bundle` | `pages/bundle.jsx` | Custom bundle builder |
| `/cart` | `pages/cart.jsx` | Shopping cart page |
| `/checkout` | `pages/checkout.jsx` | 3-step checkout (shipping → payment → confirmation) |
| `/payment-instructions` | `pages/payment-instructions.jsx` | Zelle/crypto/ACH payment guide |
| `/about` | `pages/about.jsx` | About page + FAQ |
| `/contact` | `pages/contact.jsx` | Contact form |
| `/research` | `pages/research.jsx` | Research library with per-compound data |
| `/research-use` | `pages/research-use.jsx` | Research Use Only (RUO) policy |
| `/coa` | `pages/coa.jsx` | Certificate of Analysis library |
| `/track` | `pages/track.jsx` | Order/shipment tracking |
| `/faq` | `pages/faq.jsx` | Frequently asked questions |
| `/partners` | `pages/partners.jsx` | Affiliate partner application |
| `/wholesale` | `pages/wholesale.jsx` | Wholesale account application |
| `/terms` | `pages/terms.jsx` | Terms of Service |
| `/privacy` | `pages/privacy.jsx` | Privacy Policy |
| `/returns` | `pages/returns.jsx` | Returns & Refund Policy |
| `/disclaimer` | `pages/disclaimer.jsx` | Legal disclaimer |
| `/sitemap.xml` | `pages/sitemap.xml.jsx` | XML sitemap |
| `/404` | `pages/404.jsx` | Not found page |

## Account Routes (Protected — requires login)

| Route | File | Notes |
|-------|------|-------|
| `/account` | `pages/account/index.jsx` | Dashboard — orders, subscriptions, loyalty points |
| `/account/login` | `pages/account/login.jsx` | Login / OTP / SMS auth |
| `/account/partner` | `pages/account/partner.jsx` | Partner/affiliate dashboard |
| `/account/verify-email` | `pages/account/verify-email.jsx` | Email verification callback |
| `/account/auth-error` | `pages/account/auth-error.jsx` | Auth error handler |
| `/account/tracking/[trackingNumber]` | `pages/account/tracking/[trackingNumber].jsx` | Shipment tracking detail |

## Admin Routes (Protected — admin credentials required)

| Route | File | Notes |
|-------|------|-------|
| `/admin` | `pages/admin/index.jsx` | Admin dashboard overview |
| `/admin/orders` | `pages/admin/orders.jsx` | Order management |
| `/admin/products` | `pages/admin/products.jsx` | Product management (edit/add) |
| `/admin/customers` | `pages/admin/customers.jsx` | Customer list |
| `/admin/affiliates` | `pages/admin/affiliates.jsx` | Affiliate management |
| `/admin/discounts` | `pages/admin/discounts.jsx` | Discount code management |
| `/admin/inventory` | `pages/admin/inventory.jsx` | Inventory management |
| `/admin/analytics` | `pages/admin/analytics.jsx` | Analytics overview |
| `/admin/settings` | `pages/admin/settings.jsx` | Site/payment settings |

## API Routes

### Auth
| Route | Method | Notes |
|-------|--------|-------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth.js handler |
| `/api/auth/send-otp` | POST | Send email OTP |
| `/api/auth/send-sms` | POST | Send SMS verification |
| `/api/auth/verify-sms` | POST | Verify SMS code |

### Orders & Cart
| Route | Method | Notes |
|-------|--------|-------|
| `/api/orders` | POST | Create/retrieve orders |
| `/api/discount/validate` | POST | Validate promo/discount code |
| `/api/validate-discount` | POST | Validate discount (alternate) |

### Marketing
| Route | Method | Notes |
|-------|--------|-------|
| `/api/newsletter` | POST | Newsletter signup (Omnisend) |
| `/api/notify-restock` | POST | Restock notification signup |
| `/api/chat` | POST | AI chat (OpenAI) |

### Tracking
| Route | Method | Notes |
|-------|--------|-------|
| `/api/tracking/[trackingNumber]` | GET | Shipment tracking (AfterShip) |

### Contact
| Route | Method | Notes |
|-------|--------|-------|
| `/api/contact` | POST | Contact/wholesale form submission |

### Affiliate
| Route | Method | Notes |
|-------|--------|-------|
| `/api/affiliate/register` | POST | Affiliate registration |
| `/api/affiliate/stats` | GET | Affiliate performance stats |

### Admin (Protected)
| Route | Method | Notes |
|-------|--------|-------|
| `/api/admin/_auth` | — | Admin auth helper |
| `/api/admin/affiliates` | GET/POST/PATCH | Affiliate CRUD |
| `/api/admin/analytics` | GET | Analytics data |
| `/api/admin/customers` | GET | Customer list |
| `/api/admin/orders` | GET/PATCH | Order management |
| `/api/admin/stats` | GET | Dashboard stats |
| `/api/admin/sync` | POST | WooCommerce sync |

### Webhooks
| Route | Method | Notes |
|-------|--------|-------|
| `/api/webhooks/woocommerce` | POST | WooCommerce event webhook |

### Misc
| Route | Method | Notes |
|-------|--------|-------|
| `/api/hello` | GET | Test endpoint |
