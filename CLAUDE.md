# EVO Labs Site — Claude Instructions

This file is read automatically at the start of every Claude Code session.

---

## 🚨 Vercel Cost Rules (READ EVERY SESSION)

**Every push to `claude/*` branches triggers a Vercel build costing ~$0.50–$1.00 in build minutes.**

### Before every `git commit`:
- If iterating/testing locally → add `[skip ci]` to the commit message
  ```
  git commit -m "tweak: adjust button color [skip ci]"
  ```
- Only drop `[skip ci]` on the **final push** when you want Vercel to actually deploy

### Branches that build on Vercel:
- `main` — always builds (production)
- `claude/quirky-allen` — always builds (active PR branch)
- All other branches → **skipped automatically** via `vercel.json`

### Quick rule: when in doubt → add `[skip ci]`

---

## Project Stack

- **Framework:** Next.js (pages router) on Vercel
- **Database:** Supabase (`jkhcsjvsmvdnehrrlrud.supabase.co`)
- **Auth:** NextAuth.js — providers: `admin-credentials`, `email` (Resend), `phone-otp` (Twilio Verify)
- **Payments:** Hummingbird (`https://hummingbird.paywithwallet.net/`)
- **Content overrides:** Supabase Storage bucket `site-content` (JSON files per page)
- **Git worktree:** `C:\Users\jakob\Documents\evolabs-site\.claude\worktrees\quirky-allen`
- **Active branch:** `claude/quirky-allen`

## Admin System

- Admin login: `/admin` → sets `localStorage.evo_admin_pw` + signs into NextAuth via `admin-credentials`
- Admin bar: `components/AdminEditBar.jsx` — shows when `localStorage.evo_admin_pw` is set
- Admin bypasses all auth gates (check `adminBypass` state in each page)
- Guest View toggle: `sessionStorage.evo_preview_guest`
- Inline editing: click=color picker, dblclick=text/image edit
- Save to site → `POST /api/admin/content` → Supabase Storage

## Key Files

| File | Purpose |
|------|---------|
| `components/AdminEditBar.jsx` | Floating admin toolbar with inline editing |
| `pages/api/admin/content.js` | Content override API (Supabase Storage) |
| `lib/categoryMap.js` | WooCommerce→display category name mapping |
| `context/CartContext.jsx` | Cart state (localStorage-persisted) |
| `pages/api/auth/[...nextauth].js` | Auth config — DO NOT break admin-credentials provider |
| `vercel.json` | Build optimization — only build main + claude/quirky-allen |

## Environment Variables

Set in `.env.local` AND in Vercel dashboard under project settings:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `ADMIN_SECRET`, `NEXT_PUBLIC_ADMIN_EMAIL`, `NEXT_PUBLIC_ADMIN_PW`
- `HUMMINGBIRD_SERVER_URL`, `HUMMINGBIRD_PUBLIC_KEY`, `HUMMINGBIRD_SECRET_KEY`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID`
- `WC_STORE_URL`, `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET`

## WooCommerce Category Mapping

Supabase/WooCommerce uses different category names than our UI. Always use `lib/categoryMap.js` `resolveCategory()` when reading product categories. Key mappings:
- "Growth Series" → "Growth Hormone Peptides"
- "Metabolic & GLP" → "GLP-1 Research Peptides"
- "Longevity & Cellular" → "Mitochondrial Peptides"
- "EVO Stacks" → "Research Kits"
- "Bac Water" → "Reconstitution Supplies"
- "Peptide Essentials" → falls back to name lookup

## Auth Gate Pattern (Client-side pages)

```js
const [adminBypass, setAdminBypass] = useState(false);
useEffect(() => {
  setAdminBypass(!!localStorage.getItem('evo_admin_pw') && !sessionStorage.getItem('evo_preview_guest'));
}, []);
```

## Never Do

- Never run a full deploy build just to test a small change — use `[skip ci]`
- Never modify `pages/api/auth/[...nextauth].js` without testing the admin-credentials flow
- Never store product categories as raw WooCommerce slugs — always resolve via `lib/categoryMap.js`
