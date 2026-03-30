# ADMIN GUIDE — EVO Labs Research

> Internal reference for operating the EVO Labs Research admin dashboard.

---

## Accessing the Admin Dashboard

1. Go to `https://evolabsresearch.com/admin`
2. Enter the admin password (set via `NEXT_PUBLIC_ADMIN_PW` in `.env.local`)
3. Default password during development: `evolabs2024` — **change this before going live**
4. Session persists until you close the browser tab or click Logout

> **Security Note:** The admin password is stored in `sessionStorage` — it does NOT persist across browser sessions. You'll re-authenticate on each new browser session. This is intentional for MVP security.

---

## Dashboard Overview (`/admin`)

The home screen gives you an at-a-glance view of store health:

| Card | What It Shows |
|------|--------------|
| Today's Revenue | Sum of all orders placed today |
| This Week | 7-day revenue total |
| Avg Order Value | Revenue ÷ order count |
| Total Orders | All-time order count |
| Pending Orders | Orders awaiting processing |
| Low Stock Alerts | Products below reorder threshold |
| Affiliate Payouts | Pending commission payments |
| Active Affiliates | Partners with recent activity |

**Quick Actions** panel (bottom right) links directly to common tasks: Add Product, Process Orders, New Discount Code, View Analytics.

---

## Orders (`/admin/orders`)

### Daily Workflow
1. Open Orders page — pending orders appear at the top of the list
2. Click an order to open the detail panel on the right
3. Update **Status** using the dropdown (Pending → Processing → Shipped → Delivered)
4. Add **Tracking Number** once shipped (any format: USPS, FedEx, UPS, DHL)
5. Click **Save Changes**

### Order Statuses
| Status | Meaning |
|--------|---------|
| Pending | New order, payment not yet confirmed |
| Processing | Payment confirmed, preparing shipment |
| Shipped | Package handed to carrier |
| Delivered | Customer confirmed receipt |
| Refunded | Refund issued |

### Payment Methods
EVO Labs accepts Zelle and crypto only. When a customer places an order:
- Order lands as **Pending**
- Customer is shown Zelle handle / wallet address
- You manually confirm payment and move to **Processing**

### Exporting Orders
Click **Export CSV** to download the current filtered order list. Use for accounting, shipping label prep, or backup.

### Searching & Filtering
- Search by order ID, customer name, or email
- Filter by status using the tab bar at the top

---

## Products (`/admin/products`)

### Editing a Product
1. Find the product in the list (search by name or slug)
2. Click the product row to open the edit panel
3. Update: Name, Price, Sale Price, Category, Status, Description, COA Link
4. Click **Save Changes**

### Product Status
| Status | Effect |
|--------|--------|
| Active | Visible on store, purchasable |
| Out of Stock | Visible but "Notify Me" shown (no Add to Cart) |
| Hidden | Not shown on store |

### Price Fields
- **Price** — regular/retail price
- **Sale Price** — if set, displays as a strikethrough discount. Leave blank for no sale.

### COA Link
Paste the full URL to the Certificate of Analysis PDF. This links directly from the product page and COA library.

---

## Customers (`/admin/customers`)

### Customer Tags
| Tag | Meaning |
|-----|---------|
| VIP | High-LTV customer — prioritize support |
| Wholesale | Bulk buyer — may qualify for wholesale pricing |
| Affiliate | Has an active affiliate account |
| Flagged | Potential fraud, chargeback, or policy violation |

### Viewing Order History
Click a customer to see their full order history in the detail panel, including dates, amounts, and status.

### Internal Notes
Use the Notes field for internal team notes — NOT visible to the customer.

---

## Inventory (`/admin/inventory`)

### Stock Levels
| Status | Threshold |
|--------|-----------|
| In Stock | > 25 units |
| Low Stock | 10–25 units (highlighted yellow) |
| Critical | < 10 units (highlighted red) |
| Out of Stock | 0 units |

### Adjusting Stock
1. Find the product row
2. Click **Adjust**
3. Enter the quantity change (positive to add, negative to remove)
4. Enter a reason (e.g., "Received shipment 50 units", "Damaged — 3 vials")
5. Click Save — change is logged in the Adjustment Log panel

### Adjustment Log
All stock adjustments are recorded with timestamp, quantity delta, and reason. Use this for reconciliation with supplier invoices.

---

## Affiliates (`/admin/affiliates`)

### Tiers
| Tier | Commission | Requirement |
|------|-----------|-------------|
| Standard | 10% | Default for all new affiliates |
| Silver | 12% | $1,000+ in referred sales |
| Gold | 15% | $5,000+ in referred sales or manual assignment |

**Isaiah** is currently Gold (15%) — custom arrangement.
**Stephan** is Silver with a 5% recruiter override on any affiliates he brings in.

### Approving New Affiliates
1. Filter to **Pending** tab
2. Click the affiliate to review their application details
3. Click **Approve** to activate their account and referral code
4. Their referral link becomes active: `evolabsresearch.com?ref=THEIR_CODE`

### Processing Payouts
1. Filter to active affiliates with **Pending Payout** status
2. Confirm commission amount in the detail panel
3. Send payment via Zelle or crypto to the affiliate's payment info
4. Click **Mark as Paid** — this clears the pending payout and logs the payment

### Commission Hold Period
New commissions are held for **14 days** to account for returns/refunds. Payouts are released monthly.

---

## Discounts (`/admin/discounts`)

### Creating a Discount Code
1. Click **Create Discount**
2. Set the code (or click **Random** to generate one)
3. Choose type: Percentage, Fixed Amount, Free Shipping, or BOGO
4. Set value, minimum order, usage limit, and validity dates
5. Click **Create**

### Discount Types
| Type | Example |
|------|---------|
| Percentage | 15% off entire order |
| Fixed | $20 off orders over $150 |
| Free Shipping | Waives the $9.99 shipping fee |
| BOGO | Buy 1 Get 1 — requires manual fulfillment note |

### Affiliate Codes
Affiliate referral codes (ISAIAH15, STEPHAN10, etc.) are tracked separately via the affiliate system. If a customer enters a referral code at checkout, it is attributed to that affiliate — **independent of whether they clicked the referral link**.

---

## Analytics (`/admin/analytics`)

### Time Period
Toggle between 7-day, 14-day, and 30-day views.

### Key Metrics
- **Daily Revenue Bar Chart** — visual revenue trend
- **Top Products** — revenue leaders with progress bars
- **Category Breakdown** — which categories drive the most revenue
- **Payment Methods** — Zelle vs crypto split
- **New vs Returning** — customer acquisition vs retention ratio
- **Affiliate Leaderboard** — top performers by commission earned

> **Note:** Analytics currently use mock data. Connect to real Supabase order data as described in NEXT_STEPS.md (Task 14).

---

## Settings (`/admin/settings`)

### Tabs
| Tab | What You Can Set |
|-----|-----------------|
| Store Info | Business name, address, email, phone |
| Shipping | Free shipping threshold ($250), flat rate ($9.99) |
| Payments | Active payment methods (Zelle, crypto). Stripe intentionally disabled. |
| Compliance | RUO disclaimer text, required agreements |
| Affiliates | Commission tiers, cookie window, hold period, minimum payout |
| Email Templates | Order confirmation, shipping notification, welcome email copy |

### Changing Admin Password
The admin password is set via the `NEXT_PUBLIC_ADMIN_PW` environment variable in Vercel:
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Update `NEXT_PUBLIC_ADMIN_PW`
3. Redeploy (or wait for next auto-deploy)

---

## Common Tasks — Quick Reference

| Task | Where |
|------|-------|
| Confirm payment, mark order as Processing | Orders → click order → change status |
| Add tracking number | Orders → click order → Tracking Number field |
| Add new discount code | Discounts → Create Discount |
| Approve new affiliate | Affiliates → Pending tab → Approve |
| Mark affiliate payout sent | Affiliates → click affiliate → Mark as Paid |
| Update product price | Products → click product → Price field |
| Hide a product | Products → click product → Status → Hidden |
| Adjust stock after receiving shipment | Inventory → Adjust → Enter quantity |
| View revenue trend | Analytics → 30-day view |

---

## Environment Variables — Admin-Relevant

```
NEXT_PUBLIC_ADMIN_PW=your-secure-password
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

See `ARCHITECTURE.md` for the full environment variable list.
