# EVO Labs Research — All Components

## Shared / Reusable Components

| File | Type | Used In | Description |
|------|------|---------|-------------|
| `components/Layout.jsx` | Shared | Every page | Main layout — sticky nav, announcement bar, footer, search overlay, mobile nav |
| `components/MiniCart.jsx` | Shared | Layout | Slide-out cart drawer with line items, totals, upsells |
| `components/NewsletterPopup.jsx` | Shared | Layout | Email/SMS signup popup with discount offer |
| `components/ChatWidget.jsx` | Shared | Layout | AI-powered chat support widget (OpenAI) |
| `components/CompareDrawer.jsx` | Shared | Layout | Product comparison side panel (up to 4 products) |
| `components/PharmCard.jsx` | Shared | Product page | Scientific compound profile card (formula, CAS, aliases, purity) |
| `components/SocialProofToast.jsx` | Shared | App | "Someone just bought X" FOMO toast notifications |
| `components/TrackingMap.jsx` | Shared | Track page | Shipment route visualization map |
| `components/LoginGateModal.jsx` | Shared | CartContext | Auth gate modal — required before adding to cart |

## Admin Components

| File | Type | Used In | Description |
|------|------|---------|-------------|
| `components/admin/AdminLayout.jsx` | Admin | All admin pages | Admin layout with password auth, sidebar nav |

## Context Providers (Not components, but component-adjacent)

| File | Provides | Description |
|------|----------|-------------|
| `context/CartContext.jsx` | `CartProvider`, `useCart` | Cart state — items, totals, volume discounts, gate |
| `context/CompareContext.jsx` | `CompareProvider`, `useCompare` | Product comparison state |
| `context/RecentlyViewedContext.jsx` | `RecentlyViewedProvider`, `useRecentlyViewed` | Recently viewed products |
| `context/WishlistContext.jsx` | `WishlistProvider`, `useWishlist` | Wishlist/saved items |

## Page-Specific Inline Components

The following components are defined inline within their page files and not reusable:

### `pages/checkout.jsx`
- `InputField` — styled input with focus effects
- `SelectField` — styled select/dropdown
- `Checkbox` — custom styled checkbox

### `pages/products/[slug].jsx`
- `Stars` — star rating renderer
- `TabButton` — product detail tab navigation
- Sticky add-to-cart bar

### `pages/index.jsx`
- `ProductCard` — homepage product grid card
- `Stars` — star rating renderer

### `pages/products.jsx`
- Product filter sidebar
- Product grid with sort/filter

### `pages/stacks.jsx`
- Stack card with add-all-to-cart

### `pages/admin/*.jsx`
- Various admin table components (inline)

## Component Dependency Tree

```
_app.tsx
└── CartProvider (CartContext)
    └── CompareProvider (CompareContext)
        └── WishlistProvider (WishlistContext)
            └── RecentlyViewedProvider (RecentlyViewedContext)
                └── Layout (components/Layout.jsx)
                    ├── MiniCart
                    ├── NewsletterPopup
                    ├── ChatWidget
                    ├── CompareDrawer
                    └── LoginGateModal (via CartContext)
```
