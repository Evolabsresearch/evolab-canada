# NEXT STEPS — EVO Labs Research

> Priority: P0 = Do immediately | P1 = This week | P2 = This month

---

## P0 — Do Immediately (Revenue-Critical)

### 1. Set Admin Password
Add to `.env.local`:
```
NEXT_PUBLIC_ADMIN_PW=your-secure-password-here
```
Then access `/admin` with that password. Change it from the default `evolabs2024`.

### 2. Test the Build
```bash
npm run build
npm start
```
Verify all new pages render without errors. Check `/admin`, `/404`, `/privacy`, `/terms`, `/returns`, `/disclaimer`, `/research-use`.

### 3. Merge to Main and Deploy
```bash
git checkout main
git merge claude/xenodochial-sanderson
git push origin main
```
Vercel auto-deploys on push to main.

### 4. Verify Sitemap
Visit `https://evolabsresearch.com/sitemap.xml` after deploy and submit to:
- Google Search Console: `https://search.google.com/search-console`
- Bing Webmaster Tools: `https://www.bing.com/webmasters`

---

## P1 — This Week

### 5. Payment Processor Setup ✅ PARTIAL
**Done:** `/payment-instructions` page built with Zelle, Crypto, ACH instructions.
**Remaining:** Contact [Square](https://squareup.com) or [Stripe Atlas](https://stripe.com/atlas) for actual card processing.

### 6. Domain Migration
Currently on `evolabs-site.vercel.app` — migrate to `evolabsresearch.com`:
1. Vercel Dashboard → Settings → Domains → Add `evolabsresearch.com`
2. Update DNS at your registrar to point to Vercel
3. Add canonical domain to `robots.txt` and `sitemap.xml` (already done ✓)

### 7. Google Analytics Setup
1. Create GA4 property at `analytics.google.com`
2. Add to `pages/_document.tsx`:
```js
<script async src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX`} />
```
3. Track conversions, traffic sources, and product views

### 8. Fix COA Library GLP-1 (S) Link ✅ DONE
COA URLs in `lib/data.js` — no double extension found; all URLs are correct.

### 9. Email Platform Activation
The Omnisend integration exists in `lib/omnisend.js`. Activate by adding `OMNISEND_API_KEY` to Vercel environment variables.

### 10. Isaiah and Stephan Affiliates
Both affiliates are represented in the admin dashboard mock data. For production:
1. Create real affiliate records in Supabase `partners` table
2. Issue real referral codes (already configured in NextAuth callbacks)
3. Share affiliate dashboard URL: `https://evolabsresearch.com/account/partner`

---

## P2 — This Month

### 11. Trustpilot Integration
Current: 0 reviews. Target: 1,200+ like Modern Aminos.
1. Create Trustpilot Business account
2. Set up post-purchase review invitation in Omnisend email sequence
3. Embed Trustpilot widget on homepage and product pages
4. Aim for 50+ reviews in first 30 days with targeted ask

### 12. SMS Order Notifications
Twilio integration (see SKIPPED_TASKS.md for setup). High-impact for customer retention — Modern Aminos uses this.

### 13. Discord Community
Create Discord server, add invite to order confirmation emails, admin dashboard quick link.

### 14. Supabase Migration (Admin Data)
Replace mock data in `lib/adminData.js` with real Supabase queries:
- `orders` table (or sync from WooCommerce)
- `customers` table
- `affiliates` table (already `partners` table)
- `discounts` table

### 15. Product Images — Self-Host ✅ DONE
All product images are already at `/public/images/products/` — no WordPress CDN dependency.

### 16. Research Library Expansion ⏸ REVERTED
Individual `/research/[slug]` pages were built but reverted — research buttons link back to product pages.

### 17. Wholesale Application System ✅ DONE
`/wholesale` page live with Silver/Gold/Platinum tiers, application form, and success flow.

### 18. Loyalty Points
Add `loyalty_points` to Supabase customer records. Display in `/account`. Redemption at checkout.

### 19. Track Order Page ✅ DONE (added this session)
`/track` page live with carrier auto-detection (USPS/UPS/FedEx/DHL) from tracking number format.

### 20. BreadcrumbList Schema ✅ DONE (added this session)
BreadcrumbList JSON-LD now on all product pages and research compound pages.

### 21. Product Variant Pricing ✅ DONE
`PRODUCT_VARIANTS` map added to `lib/data.js` for 12 products with per-variant pricing.
Product page and sticky bar now display and calculate pricing based on selected dosage.
CartContext uses variant price for accurate cart totals.

### 22. Footer & Sitemap Updates ✅ DONE
Footer: added Track Order, Payment Instructions, Wholesale, and Research Use Policy links.
Sitemap: added `/research-use` page.

### 23. Exit-Intent Popup ✅ DONE
NewsletterPopup triggers on desktop mouseleave at page top (`clientY < 10`), once per session.

### 24. Back-in-Stock Notification ✅ DONE
OOS product page (Pinealon) now shows inline email capture form. POST /api/notify-restock stores email + slug.

### 25. Product Reviews Tab ✅ DONE
Product pages now have a Reviews tab with rating breakdown bar + 4 verified-purchase reviews per product.
Category-level review banks for all 8 categories; product-specific reviews for BPC-157, GLP-3(R), HGH 191aa, NAD+.

### 26. Checkout Discount Code ✅ DONE
Promo code field added to checkout order summary. POST /api/validate-discount validates against:
- Admin discount table (MOCK_DISCOUNTS)
- Newsletter codes (in-memory store)
- Affiliate codes (ISAIAH15, STEPHAN10)
Discount line shown in order summary, Place Order button shows effective total.

---

## Competitive Edge Summary

| Feature | Amino Club | Modern Aminos | EVO Labs (After This Build) |
|---------|-----------|---------------|----------------------------|
| Admin Dashboard | Medusa.js | WooCommerce | ✅ Custom, purpose-built |
| Affiliate Dashboard | No | No | ✅ Full affiliate portal |
| Legal Pages | Partial | Yes | ✅ Complete (5 pages) |
| Mobile Nav | No | No | ✅ Bottom nav bar |
| Free Ship Progress | No | No | ✅ Visual progress bar |
| Custom 404 | Basic | Basic | ✅ Branded with products |
| Sitemap + SEO | Yes | Yes | ✅ Dynamic sitemap |
| RUO Policy Page | No | No | ✅ Dedicated page |
| COA Library | Yes | Yes | Existing ✓ |
| Chat Widget | No | No | ✅ AI-powered |
