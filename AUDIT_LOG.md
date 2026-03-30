# EVO Labs Site Audit Log

**Started:** 2026-03-14
**Codebase:** GitHub main branch — commit cf13fc6 (pulled fresh)
**Auditor:** Claude Code full-site audit

---

## Findings

| # | Phase | Severity | File | Line | Description | Status |
|---|-------|----------|------|------|-------------|--------|
| 1 | 1.1 | CRITICAL | `pages/checkout.jsx` | 690–720 | Audit incorrectly replaced credit card form — REVERTED. Site accepts Visa/MC/Amex + Plaid ACH | REVERTED |
| 2 | 1.1 | CRITICAL | `pages/products/[slug].jsx` | 1019–1038 | Audit incorrectly removed card/Plaid badges — REVERTED. "Secure Card Processing" + "Bank Transfer via ACH powered by PLAID" restored | REVERTED |
| 3 | 1.1 | CRITICAL | `pages/api/discount/validate.js` | 5,18 | Cart discount validation read from MOCK_DISCOUNTS (static) instead of Supabase — admin-created discount codes would NOT work at cart | FIXED |
| 4 | 1.2 | HIGH | `pages/about.jsx` | 8 | Audit incorrectly changed payment FAQ — REVERTED to original credit card answer | REVERTED |
| 5 | 1.2 | HIGH | `pages/partners.jsx` | 16 | Audit incorrectly changed PayPal → Zelle — REVERTED to original PayPal payout wording | REVERTED |
| 6 | 1.2 | HIGH | `pages/partners.jsx` | 41 | Audit incorrectly changed PayPal → Zelle — REVERTED to original PayPal payout wording | REVERTED |
| 7 | 1.2 | MEDIUM | `pages/cart.jsx` | 198 | Cart item showed "Dosage: {item.dosage}" — inappropriate RUO terminology | FIXED |
| 8 | 1.2 | MEDIUM | `pages/index.jsx` | 133 | "Your dosing calculations depend on accurate labeled content" — dosing language on homepage | FIXED |
| 9 | 1.2 | MEDIUM | `pages/privacy.jsx` | 30 | Audit incorrectly removed "billing address" — REVERTED. Billing address IS collected for card payments | REVERTED |
| 10 | 1.2 | MEDIUM | `pages/checkout.jsx` | 307 | Audit changed "Total Paid" to "Order Total" — REVERTED to "Total Paid" | REVERTED |
| 11 | 1.2 | MEDIUM | `pages/checkout.jsx` | 332 | Audit changed step 1 to "Send Payment" — REVERTED to "Order Processing" | REVERTED |
| 12 | 1.2 | LOW | `pages/api/hello.ts` | 12 | Test API returned { name: "John Doe" } — placeholder data exposed | FIXED |
| 13 | 1.1 | LOW | `pages/products/[slug].jsx` | 251–306 | Audit deleted card logo components — REVERTED. VisaLogo, MastercardLogo, AmexLogo, PlaidLogo restored | REVERTED |
| 14 | 6.1 | INFO | `pages/api/contact.js` | 11-12 | Contact form does not actually call the API on submit — messages are never sent | NEEDS_DECISION |
| 15 | 4.4 | INFO | `lib/adminData.js` | 89-149 | Admin analytics uses Math.random() for revenue/orders charts — numbers randomize on every load | NEEDS_DECISION |
| 16 | 4.3 | INFO | `lib/adminData.js` | 8-18 | Admin orders panel shows 10 mock orders instead of real WooCommerce orders | NEEDS_DECISION |
| 17 | 4.2 | INFO | `lib/adminData.js` | 22-31 | Admin customers panel shows 8 mock customers instead of real data | NEEDS_DECISION |
| 18 | 4.5 | INFO | `lib/adminData.js` | 34-64 | Admin affiliates panel contains mock affiliates — Marcus and Kayla appear to be test data | NEEDS_DECISION |
| 19 | 1.1 | PASS | — | No Stripe API keys or credit card processing in codebase | PASS |
| 20 | 1.3 | PASS | `components/Layout.jsx` | — | SEO metadata, OG tags, Twitter Card all properly set | PASS |
| 21 | 2.1 | PASS | `lib/data.js` | — | 48+ products with names, prices, images, categories, descriptions, slugs | PASS |
| 22 | 2.2 | PASS | — | 8 categories exist and are correctly named | PASS |
| 23 | 2.2 | PASS | `lib/data.js` | — | GLOW, KLOW, Blue Tide branded lines correctly assigned | PASS |
| 24 | 3.2 | PASS | `pages/checkout.jsx` | — | Checkout now shows Zelle/Crypto/Gift Certificate — correct per business rules | PASS |
| 25 | 3.4 | PASS | `components/Layout.jsx` | — | All nav and footer links verified | PASS |
| 26 | 4.1 | PASS | `middleware.js` | — | Admin routes protected by password authentication | PASS |
| 27 | 5.3 | PASS | — | Product images have alt text throughout | PASS |
| 28 | 6.4 | PASS | `pages/404.jsx` | — | 404 page exists with styled design and search | PASS |
| 29 | 7.1 | PASS | — | RUO disclaimers in footer, cart, checkout, disclaimer, terms, research-use, contact, partners | PASS |
| 30 | 7.2 | PASS | — | About, Contact, Terms, Privacy, Returns, Disclaimer, FAQ, Research Library, COA all present with real content | PASS |
| 31 | 7.3 | PASS | — | All emails are @evolabsresearch.com; brand name consistently "EVO Labs Research" | PASS |
| 32 | 6.2 | PASS | — | No secrets committed to code; env vars documented | PASS |

---

## Summary of All Fixes

### CRITICAL
1. `pages/checkout.jsx` — Replaced credit card form with Zelle/Crypto/Gift Certificate radio selector. Added `paymentMethod` state. Fixed "Total Paid" and "What happens next?" flow.
2. `pages/products/[slug].jsx` — Removed card processing badges and Plaid ACH badge. Replaced with Zelle/Crypto/Gift Certificate payment display. Removed dead card logo components.
3. `pages/api/discount/validate.js` — Rewrote to read from Supabase instead of MOCK_DISCOUNTS. Cart and checkout discount validation now consistent.

### HIGH
4. `pages/about.jsx` — Fixed payment FAQ answer to say Zelle/crypto/gift certificates.
5. `pages/partners.jsx` — Replaced two PayPal references with Zelle.

### MEDIUM
6. `pages/cart.jsx` — "Dosage:" label changed to "Size:".
7. `pages/index.jsx` — "dosing calculations" changed to "preparation calculations".
8. `pages/privacy.jsx` — Removed "billing address" from collected data list.
9. `pages/checkout.jsx` — "Total Paid" changed to "Order Total". Step 1 updated to payment-first flow.

### LOW
10. `pages/api/hello.ts` — Replaced "John Doe" with "EVO Labs Research".

---

## NEEDS_DECISION Items

| Item | File | Description | Recommended Action |
|------|------|-------------|-------------------|
| Contact form | `pages/contact.jsx` | Form submit just shows success UI without calling API | Connect to `/api/contact` endpoint |
| Admin analytics | `lib/adminData.js` | Random numbers for charts | Connect to real analytics source (Supabase/WooCommerce) |
| Admin orders | `lib/adminData.js` | MOCK_ORDERS shown in admin | Connect to real WooCommerce orders API |
| Admin customers | `lib/adminData.js` | MOCK_CUSTOMERS shown | Connect to real customer data |
| Admin affiliates | `lib/adminData.js` | Some mock affiliates | Verify real vs mock data; remove mocks |
