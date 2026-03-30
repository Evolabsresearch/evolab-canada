# Amino Club — Complete Design System & Site Documentation
Scraped: March 2026 | Source: aminoclub.com

---

## TABLE OF CONTENTS
1. Fonts & Typography
2. Color Palette (CSS Custom Properties + Brand Tokens)
3. Spacing System & Layout
4. Component Styles (Buttons, Badges, Cards, Inputs)
5. Elevation & Shadows
6. Borders & Radius
7. Animations & Transitions
8. Icons
9. Page-by-Page Documentation
   - Homepage (/)
   - Store / Products (/store)
   - Product Detail Page (/products/bpc-157 etc.)
   - FAQ (/faq)
   - Quality (/quality)
   - COA (/coa)
   - Contact (/contact)
   - Shipping (/shipping)
   - Returns (/returns)
   - Affiliate / Partner (/affiliate)
10. Navigation & Header
11. Footer
12. Full CSS Custom Properties Reference

---

## 1. FONTS & TYPOGRAPHY

### Font Families
Two fonts are used site-wide, loaded as Next.js CSS module variables:

**Primary — Anek Telugu** (headings, body, UI labels)
- CSS: `"Anek Telugu", "Anek Telugu Fallback", system-ui, sans-serif`
- Applied to: `<body>` via class `font-sans`
- Used for: all headings (h1–h3), body paragraphs, section labels

**Secondary — Poppins** (nav links, buttons, utility text, price labels, monospaced data)
- CSS: `Poppins, "Poppins Fallback", system-ui, sans-serif`
- Applied to: `<a>`, `<button>`, `.font-poppins` class
- Used for: nav links, CTAs, price spans, COA data, stat labels, alias tags

### Type Scale (computed at 1280px+ viewport)

| Element | Font | Size | Weight | Line Height | Letter Spacing | Color |
|---|---|---|---|---|---|---|
| H1 — Hero headline | Anek Telugu | 48px (text-5xl) → 64px (2xl screens) | 600 (semibold) | 1.05 (leading-[1.05]) | -1.2px (tracking-tight) | #000000 |
| H1 — Product name | Anek Telugu | 48px (text-3xl lg:text-5xl) | 700 (bold) | 1.0 | normal | #000000 |
| H1 — Store page | Anek Telugu | 36px (sm:text-3xl lg:text-4xl) | 600 (semibold) | tight | normal | #131315 |
| H2 — Section headings | Anek Telugu | 32px (lg:text-3xl) → 40px (lg:text-[40px]) | 600 (semibold) | 1.05 | normal | #000000 |
| H3 — Card/feature titles | Anek Telugu | 18px (lg:text-lg) | 600 (semibold) | 1.24 | normal | #000000 |
| H3 — Product card name (store) | Anek Telugu | 18px (lg:text-lg) | 600 (semibold) | tight | normal | #131315 |
| Body (hero subtitle) | Anek Telugu | 18px (xl:text-xl) | 400 | relaxed (1.625) | normal | rgba(0,0,0,0.8) |
| Body (section body) | Anek Telugu | 15–18px | 400 | relaxed | normal | #555555 / #666666 |
| Body (product description) | Anek Telugu | 14px | 400 | relaxed | normal | #666666 |
| Product subtitle (italic) | Anek Telugu | 14px | 400 | — | — | #555555 |
| Nav links | Poppins | 13px | 500 (medium) | — | normal | rgba(0,0,0,0.75) |
| Button text (primary) | Poppins | 14–16px | 500 (medium) | none | normal | #ffffff |
| Button text (outlined) | Anek Telugu | 14px | 500 (medium) | none | normal | #131315 |
| Price — product card | Anek Telugu | 20px (lg:text-xl) | 600 (semibold) | tight | normal | #131315 |
| Price — product panel | Poppins | 24px | 700 (bold) | — | normal | #000000 |
| "From" label | Poppins | 12px | 400 | — | normal | #6b7280 (gray-500) |
| Star rating text | Poppins | 14px | 400 | — | normal | #4b5563 (gray-600) |
| Badge text (green) | Poppins | 12px | 500 | — | normal | #166534 |
| Badge text (research) | Poppins | 10px | 600 | — | wider | #ffffff |
| COA purity number | Poppins | 32px | 700 | none | tight | #16a34a |
| COA label | Poppins | 12px | 600 | — | wider | #5a5a5a |
| Stat metric number | Anek Telugu | 32px (lg:text-3xl) | 700 | none | tight | #131315 |
| Stat metric label | Poppins | 12px | 600 | — | wider (tracking-wider) | #5a5a5a |
| Stat description | Anek Telugu | 14px | 400 | snug | normal | #4a5568 |
| Footer heading | Anek Telugu | 14px | 600 | — | wider (tracking-wider) | #ffffff (uppercase) |
| Footer link | Anek Telugu | 14px | 400 | — | normal | rgba(255,255,255,0.7) |
| Footer description | Anek Telugu | 14px | 400 | relaxed | normal | rgba(255,255,255,0.7) |
| Copyright / trust text | Anek Telugu | 12px | 400 | — | normal | rgba(255,255,255,0.7) |
| FAQ question | Anek Telugu | 16px | 400 | — | normal | #000000 |
| Alias pill tags | Poppins | 12px | 400 | — | normal | #555555 |
| Trust bar text (product page) | Poppins | 12px | 500 / 400 | — | normal | #333333 / #666666 |

---

## 2. COLOR PALETTE

### Brand Colors (CSS Custom Properties)
```css
--color-brand-black:        #131315   /* Primary text, buttons, nav */
--color-brand-white:        #ffffff
--color-brand-mint:         #e9fce6   /* Section backgrounds, icon circles */
--color-brand-sky:          #cbe5fc   /* Hero gradient, accent */
--color-brand-lavender:     #e8e5ff   /* Hero gradient overlay, decorative */
--color-brand-butter:       #fefeca   /* CTA bottom section gradient from */
--color-neutral-slate:      #4a5568   /* Stat description text */
--color-neutral-ash:        #bdc5cc   /* Subtle borders */
--color-neutral-cool:       #a3afb8   /* Muted elements */
--color-neutral-offwhite:   #f1f2f4   /* Subtle backgrounds */
```

### Semantic Background Colors
```css
--bg-base:                  #ffffff
--bg-base-hover:            #f4f4f5
--bg-base-pressed:          #e4e4e7
--bg-subtle:                #fafafa
--bg-subtle-hover:          #f4f4f5
--bg-subtle-pressed:        #e4e4e7
--bg-component:             #fafafa
--bg-component-hover:       #f4f4f5
--bg-component-pressed:     #e4e4e7
--bg-field:                 #fafafa
--bg-field-component:       #ffffff
--bg-field-component-hover: #fafafa
--bg-field-hover:           #f4f4f5
--bg-highlight:             #eff6ff
--bg-highlight-hover:       #dbeafe
--bg-interactive:           #3b82f6
--bg-overlay:               #18181b66  /* Scrim */
--bg-disabled:              #f4f4f5
--bg-switch-off:            #e4e4e7
--bg-switch-off-hover:      #d4d4d8
```

### Foreground / Text Colors
```css
--fg-base:             #18181b   /* Primary text */
--fg-subtle:           #52525b
--fg-muted:            #71717a
--fg-disabled:         #a1a1aa
--fg-on-color:         #ffffff   /* Text on dark backgrounds */
--fg-on-inverted:      #ffffff
--fg-interactive:      #3b82f6
--fg-interactive-hover:#2563eb
--fg-error:            #e11d48
```

### Named Page-Specific Colors (hardcoded in Tailwind classes)
```
#131315  — brand-black (buttons, headings)
#000000  — hero H1, body
rgba(0,0,0,0.8) — hero subtitle
rgba(0,0,0,0.75) — nav links
rgba(0,0,0,0.7)  — nav icon buttons
#555555  — product subtitles, body text, alias pills
#666666  — product description, section subtext
#4b5563  — gray-600 (star rating, secondary labels)
#6b7280  — gray-500 ("From" label, product subtitle)
#51, 51, 51 — trust bar primary text (#333333)
#797979  — feature card body text
#0a192f  — footer background (rgb(10,25,47))
rgba(255,255,255,0.7) — footer links
rgba(255,255,255,0.1) — footer border-top
```

### Section Background Colors
```
Homepage hero (left half):  #ffffff (white)
Homepage hero (right half): linear-gradient(rgba(232,229,255,0.6) 0%, rgba(203,229,252,0.6) 100%)
Guarantee section:          #ffffff (bg-white)
Featured Products:          #ffffff
"Everything you need":      #e9fce6 (bg-[#e9fce6]) — brand-mint
"Quality you can verify":   #ffffff
"Why choose":               transparent (no bg, gradient decorative overlay)
FAQ section:                #ffffff
CTA bottom section:         linear-gradient(#fefeca → #e9fae7) (from-[#fefeca] to-[#e9fae7])
Footer:                     #0a192f (rgb(10,25,47)) — deep navy
Product page body:          #ffffff / #fafafa alternating
Product safety section:     #fafafa
Product sources section:    #fafafa
```

### Accent / Functional Colors
```
Green (COA purity, checkmarks): #16a34a
Green badge bg:                 #f0fdf4
Green badge border:             #dcfce7
Green badge text:               #166534
Teal (selected bundle):         border #0d9488, bg #f0fdfa
Orange accent:                  #f97316
```

### Tag Color System (full set)
```css
/* Blue */
--tag-blue-bg:        #dbeafe;   --tag-blue-text:   #1e40af;   --tag-blue-icon:   #60a5fa;   --tag-blue-border: #bfdbfe;
/* Green */
--tag-green-bg:       #d1fae5;   --tag-green-text:  #065f46;   --tag-green-icon:  #10b981;   --tag-green-border:#a7f3d0;
/* Orange */
--tag-orange-bg:      #ffedd5;   --tag-orange-text: #9a3412;   --tag-orange-icon: #f97316;   --tag-orange-border:#fed7aa;
/* Purple */
--tag-purple-bg:      #ede9fe;   --tag-purple-text: #5b21b6;   --tag-purple-icon: #a78bfa;   --tag-purple-border:#ddd6fe;
/* Red */
--tag-red-bg:         #ffe4e6;   --tag-red-text:    #9f1239;   --tag-red-icon:    #f43f5e;   --tag-red-border:  #fecdd3;
/* Neutral */
--tag-neutral-bg:     #f4f4f5;   --tag-neutral-text:#52525b;   --tag-neutral-icon:#a1a1aa;   --tag-neutral-border:#e4e4e7;
```

---

## 3. SPACING SYSTEM & LAYOUT

### Content Container
```css
max-width: 1440px;     /* .content-container / max-w-[1500px] */
padding:   0 24px;     /* px-4 sm:px-6 lg:px-8 (computed at lg = 32px) */
margin:    0 auto;
```

### Section Vertical Padding Pattern
```
Tight sections (guarantee bar, trust bar):   py-4 lg:py-6    → 16px / 24px top+bottom
Standard sections (features, quality, FAQ):  py-12 bg-white  → 48px top+bottom
Generous sections (mint features, why):      py-12 lg:py-16  → 48px / 64px
Product page sections:                       py-6 lg:py-8    → 24px / 32px
Bottom CTA section:                          pt-12 lg:pt-20 pb-20 lg:pb-28 → 80px / 112px
Footer inner:                                py-14 lg:py-20  → 56px / 80px
```

### Grid Systems
```
Homepage hero:          grid-cols-1 lg:grid-cols-2     — equal halves
Homepage featured grid: grid-cols-1 lg:grid-cols-12   — 12-col bento, gap-4 lg:gap-5 (20px)
  - Large cards:        lg:col-span-6 (half)
  - Full-width card:    lg:col-span-12
Quality section:        grid-cols-1 lg:grid-cols-2     — gap-8 lg:gap-16 (32px / 64px)
Why Choose cards:       grid-cols-1 md:grid-cols-2 lg:grid-cols-3 — gap-4 lg:gap-5 (20px)
Footer links:           grid-cols-2 md:grid-cols-3 lg:grid-cols-6 — gap-10 lg:gap-8

Product hero:           grid-cols-1 lg:grid-cols-2     — gap-4 lg:gap-5 (20px)
Product page sections:  single column, centered

Store grid:             grid-cols-2 md:grid-cols-3 lg:grid-cols-4 — gap-3 sm:gap-4 lg:gap-6 (24px)
  - Card width at lg:   285.75px (4 col, 1440px container)
```

---

## 4. COMPONENT STYLES

### Buttons

#### Primary CTA — Large (hero "Shop Now")
```css
background:    #000000
color:         #ffffff
font-size:     16px (lg:text-base)
font-weight:   500 (medium)
font-family:   Poppins
height:        44px (h-11) lg: 48px (h-12)
padding:       0 32px (px-8)
border-radius: 9999px (rounded-full)
border:        none
box-shadow:    none
transition:    all 0.2s cubic-bezier(0.4,0,0.2,1)
hover:         bg-black/90 (rgba(0,0,0,0.9))
```

#### Primary CTA — Standard (product panel "Add to cart")
```css
background:    #000000
color:         #ffffff
font-size:     14px
font-weight:   500
font-family:   Poppins
height:        48px (h-12)
padding:       0 24px (px-6)
border-radius: 9999px (rounded-full)
border:        none
flex:          1 (flex-1, fills remaining width)
transition:    all 0.2s
hover:         bg-black/90
```

#### Primary CTA — Compact (product card "View" button)
```css
background:    #131315 (brand-black)
color:         #ffffff
font-size:     14px (lg:text-sm)
font-weight:   500
height:        36px (h-9) lg: 40px (h-10)
padding:       0 12px (px-3)
border-radius: 9999px (rounded-full)
border:        none
width:         100% (w-full)
hover:         bg-gray-800
```

#### Secondary / Outlined — Ghost (homepage "View all", product card "View Studies")
```css
background:    transparent
color:         #131315 (brand-black)
font-size:     14px
font-weight:   400–500
height:        32–40px
padding:       8px 20px  (py-2 px-5)
border-radius: 9999px (rounded-full)
border:        1px solid #131315
hover:         bg-gray-50
```

#### Secondary / Outlined — CTA bottom section
```css
background:    #000000
color:         #ffffff
font-size:     16px (lg:text-base)
font-weight:   500
padding:       14px 28px (py-3 lg:py-3.5 px-6 lg:px-7)
border-radius: 9999px (rounded-full)
border:        none
overflow:      hidden (has shimmer overlay effect via ::before)
```

#### Variant Selector Button (product page dosage pills)
```css
/* Active/selected state */
background:    #000000
color:         #ffffff
border:        1px solid #000000
border-radius: 8px (rounded-lg)
padding:       8px 16px (px-4 py-2)
font-size:     14px
font-weight:   500
height:        38px

/* Inactive state */
background:    transparent
color:         #555555
border:        1px solid #e0e0e0
border-radius: 8px
```

#### Bundle Selector (quantity bundles)
```css
/* Selected */
background:    #f0fdfa (teal-50)
border:        1px solid #0d9488 (teal-600)
border-radius: 8px (rounded-lg)
padding:       8px 12px (px-3 py-2)
height:        66px

/* Unselected */
background:    transparent
border:        1px solid #e5e7eb (gray-200)
border-radius: 8px
hover:         border-gray-300
```

#### CoA Quick-Link Button (product panel)
```css
background:    transparent
color:         #555555
border:        1px solid #e0e0e0
border-radius: 9999px (rounded-full)
padding:       0 20px (h-12 px-5)
height:        48px
font-size:     14px
font-weight:   500
hover:         border-[#999]
```

#### Filter Category Pills (store page)
```css
/* Inactive */
background:    #f3f4f6 (gray-100)
color:         #374151 (gray-700)
border:        none
border-radius: 9999px (rounded-full)
padding:       8px 16px (px-4 py-2)
font-size:     14px
font-weight:   500
transition:    all 0.2s

/* Active (selected category) */
background:    #111827 (gray-900)
color:         #ffffff
```

---

### Badges & Pills

#### Product Research Badge (on product pages)
```css
/* Example: "Phase 3 Clinical Trials Active", "Tissue Repair Peptide" */
background:    #131315
color:         #ffffff
font-size:     10px
font-weight:   600
text-transform: uppercase
letter-spacing: wider (tracking-wider)
padding:       2px 8px (px-2 py-0.5)
border-radius: 9999px (rounded-full)
```

#### Green Test Method Badge (quality section)
```css
/* "HPLC Analysis", "Mass Spectrometry" */
background:    #f0fdf4
color:         #166534
border:        1px solid #dcfce7
border-radius: 9999px (rounded-full)
padding:       4px 10px (px-2.5 py-1)
font-size:     12px
font-weight:   500
display:       inline-flex
gap:           6px (gap-1.5)
/* Contains a checkmark SVG icon (stroke, currentColor, strokeWidth 2.5) */
```

#### COA Card Badges
```css
/* "Latest" badge */
background:    #131315
color:         #ffffff
font-size:     10px
font-weight:   600
text-transform: uppercase
letter-spacing: wider
padding:       2px 8px
border-radius: 9999px

/* "Selected dosage" badge */
background:    #e9fce6 (brand-mint)
color:         #16a34a
font-size:     10px
font-weight:   600
border-radius: 9999px
```

#### Alias/AKA Tags (product page)
```css
background:    transparent
color:         #555555
border:        1px solid #e0e0e0
border-radius: 9999px (rounded-full)
padding:       6px 12px (px-3 py-1.5)
font-size:     12px
font-weight:   400
font-family:   Poppins
```

---

### Cards

#### Bento Feature Card (homepage: "Everything you need" + "Featured Products" sections)
```css
background:    #ffffff
border-radius: 28px (lg:rounded-[28px]) — mobile: 16px (rounded-2xl)
box-shadow:    0px 4px 12.5px 0px rgba(151,201,143,0.44)  /* soft green glow */
padding:       24px (p-6)
border:        none
overflow:      hidden
position:      relative
/* Min heights: 220px (tall), 140px (short), 300px (tall+rowspan) */
/* Contains absolute product image: bottom-4 right-4, w-24 h-24, object-contain */
```

#### "Why Choose" Feature Card
```css
background:    rgba(255,255,255,0.8)
backdrop-filter: blur (backdrop-blur-sm)
border:        1px solid rgba(227,227,227,0.6)
border-radius: 24px (lg:rounded-3xl)  — mobile: 16px (rounded-2xl)
box-shadow:    0px 1px 2px 0px rgba(0,0,0,0.05) (shadow-sm)
padding:       20px (p-4 lg:p-5)
/* Decorative inner border overlay: 3px, rgba(220,215,255,0.3) per card */
```

#### Product Store Card
```css
/* Outer container */
background:    #f5f5f5 (neutral-100)
border-radius: 24px (lg:rounded-[24px]) — mobile: 20px (rounded-[20px])
overflow:      hidden
display:       flex flex-col
box-shadow:    none
border:        none

/* Image area */
aspect-ratio:  4/5
overflow:      hidden
background:    transparent

/* Image */
object-fit:    cover
object-position: 80% center
transition:    transform 0.3s
group-hover:   scale-105 (transform)

/* Info panel */
background:    #f9f9f9
border-radius: 0 0 24px 24px (rounded-b-[24px])
padding:       16px (p-3 lg:p-4)
```

#### Product Detail Hero Card — Image Panel (left)
```css
background:    #f8f8f8
border:        1px solid #e8e8e8
border-radius: 24px (lg:rounded-[24px]) — mobile: 20px
padding:       32px (p-6 lg:p-8)
display:       flex items-center justify-center
```

#### Product Detail Hero Card — Info Panel (right)
```css
background:    #ffffff
border:        1px solid #e8e8e8
border-radius: 24px (lg:rounded-[24px]) — mobile: 20px
padding:       28px (p-5 lg:p-7)
display:       flex flex-col
```

#### COA Result Card
```css
background:    #ffffff
border:        2px solid #131315   /* thick black border = "selected/active" */
border-radius: 16px (rounded-2xl)
padding:       20px (p-5)
box-shadow:    0px 4px 12px 0px rgba(151,201,143,0.1)
width:         280px (sm:w-[280px])
snap-align:    start (horizontal scroll carousel)
transition:    transform 0.3s, box-shadow
hover:         -translate-y-0.5, shadow upgrade
/* Large purity % displayed in #16a34a, 32px bold Poppins */
```

#### Guarantee Pillar (row item with colored left stripe)
```css
/* Wrapper card concept: 3 items stacked vertically, each with */
/* an absolute left bar (12px lg:24px wide) in brand color */
/* and a circular icon (44px lg:60px) in matching pastel bg */

/* Purity guarantee: left bar #e9fce6, icon circle bg #e9fce6 */
/* Shipment protection: left bar #cbe5fc, icon circle bg #cbe5fc */
/* COA guarantee: left bar #fefeca, icon circle bg #fefeca */

icon-circle-size: 44px mobile / 52px md / 60px lg
border-radius: 9999px (fully round)
inner content area padding: 0 16px 0 40px (pl-7 md:pl-9 lg:pl-10 pr-4)
gap: 12–16px (gap-3 md:gap-3 lg:gap-4)
```

#### Tooltip/Popover
```css
background:    #131315 (brand-black)
color:         #ffffff
font-size:     13px
line-height:   relaxed
border-radius: 8px (rounded-lg)
padding:       12px 14px (px-3.5 py-3)
box-shadow:    shadow-2xl
width:         280px (sm:w-[280px])
transition:    opacity 0.2s ease-out
```

---

### Form Inputs

#### Search Input (store page)
```css
background:    #f9fafb (gray-50)
border:        1px solid #e5e7eb (gray-200)
border-radius: 9999px (rounded-full)
height:        44px (h-11)
padding:       0 40px 0 48px (has search icon inset left)
font-size:     16px
color:         #111827 (gray-900)
placeholder:   #9ca3af (gray-400)
focus:         ring-2, ring color blue-500
```

#### Sort Dropdown (store page)
```css
background:    #ffffff
border:        1px solid #e5e7eb (gray-200)
border-radius: 9999px (rounded-full)
padding:       10px 40px 10px 16px (px-4 py-2.5 pr-10)
font-size:     14px
font-weight:   500
color:         #374151 (gray-700)
appearance:    none (custom arrow)
hover:         border-gray-300
```

#### Quantity Stepper (product page)
```css
stepper button: w-9 h-9 (36px square), transparent, color #555555
value display:  w-8 (32px), text-center, font-size 14px, font-weight 500
```

---

## 5. ELEVATION & SHADOWS

```css
/* Card at rest */
--elevation-card-rest:    0px 0px 0px 1px rgba(0,0,0,0.08),
                          0px 1px 2px -1px rgba(0,0,0,0.08),
                          0px 2px 4px 0px rgba(0,0,0,0.04);

/* Card on hover */
--elevation-card-hover:   0px 0px 0px 1px rgba(0,0,0,0.08),
                          0px 1px 2px -1px rgba(0,0,0,0.08),
                          0px 2px 8px 0px rgba(0,0,0,0.10);

/* Flyout/dropdown */
--elevation-flyout:       0px 0px 0px 1px rgba(0,0,0,0.08),
                          0px 4px 8px 0px rgba(0,0,0,0.08),
                          0px 8px 16px 0px rgba(0,0,0,0.08);

/* Modal */
--elevation-modal:        0px 0px 0px 1px #fff inset,
                          0px 0px 0px 1.5px rgba(228,228,231,0.6) inset,
                          0px 0px 0px 1px rgba(0,0,0,0.08),
                          0px 8px 16px 0px rgba(0,0,0,0.08),
                          0px 16px 32px 0px rgba(0,0,0,0.08);

/* Tooltip */
--elevation-tooltip:      0px 0px 0px 1px rgba(0,0,0,0.08),
                          0px 2px 4px 0px rgba(0,0,0,0.08),
                          0px 4px 8px 0px rgba(0,0,0,0.08);

/* Header */
box-shadow: 0px 1px 3px rgba(0,0,0,0.05);

/* Bento/feature card — green glow (signature shadow) */
box-shadow: 0px 4px 12.5px 0px rgba(151,201,143,0.44);

/* COA card hover */
box-shadow: 0px 4px 12px 0px rgba(151,201,143,0.10);
```

---

## 6. BORDERS & RADIUS

### Border Radius Values
```
Fully rounded (pills, circles):  border-radius: 9999px
Small cards / badges:            border-radius: 8px  (rounded-lg)
Small icon containers:           border-radius: 12px (rounded-xl)
Product cards (mobile):          border-radius: 20px (rounded-[20px])
Product cards (desktop):         border-radius: 24px (lg:rounded-[24px])
Bento / feature cards (mobile):  border-radius: 16px (rounded-2xl)
Bento / feature cards (desktop): border-radius: 28px (lg:rounded-[28px])
"Why choose" cards (desktop):    border-radius: 24px (lg:rounded-3xl)
COA result card:                 border-radius: 16px (rounded-2xl)
Product hero panel:              border-radius: 24px (lg:rounded-[24px])
Tooltip / popover:               border-radius: 8px  (rounded-lg)
Info panel (product page bottom):border-radius: 0 0 24px 24px
```

### Border Colors
```css
--border-base:         #e4e4e7  /* Standard dividers */
--border-strong:       #d4d4d8
--border-interactive:  #3b82f6
--border-transparent:  rgba(255,255,255,0)
--border-danger:       #be123c
--border-error:        #e11d48
--border-menu-top:     #e4e4e7
--border-menu-bot:     #ffffff

/* Page-specific */
Header bottom:         1px solid rgba(243,244,246,0.8) (gray-100/80)
FAQ divider:           1px solid #eeeeee
Product panel:         1px solid #e8e8e8
COA card (active):     2px solid #131315
Footer top separator:  1px solid rgba(255,255,255,0.1)
Quality section divider: 1px solid #eeeeee (border-b)
```

### Focus Rings
```css
--borders-focus:          0px 0px 0px 1px #fff, 0px 0px 0px 3px rgba(59,130,246,0.6);
--borders-interactive-with-focus: 0px 1px 2px 0px rgba(30,58,138,0.5), 0px 0px 0px 1px #2563eb, 0px 0px 0px 2px #fff, 0px 0px 0px 4px rgba(37,99,235,0.6);
```

---

## 7. ANIMATIONS & TRANSITIONS

### Base Transition
All interactive elements use Tailwind's default easing:
```css
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1)  /* ease-in-out */
```

### Duration Classes Used
```
duration-200  — nav links, buttons, badges, icon hovers (default)
duration-300  — product image hover scale, card hover effects
duration-500  — CTA shimmer overlay, stat number reveal
duration-1000 — slower decorative animations
```

### Specific Transition Rules
```css
/* Nav links */
transition: color 0.2s, background-color 0.2s, border-color 0.2s — all props

/* Buttons (primary) */
transition: all 0.2s cubic-bezier(0.4,0,0.2,1)

/* Product card image */
transition: transform 0.3s  (scale-105 on group-hover)

/* COA card */
transition: transform 0.3s ease-out, box-shadow 0.3s
hover: translateY(-2px), shadow increase

/* Arrow icon in CTA button */
transition: transform (group-hover:translate-x-1)

/* Hero rotating product image */
transition: opacity 0.5s

/* FAQ accordion */
transition: all (open/close with smooth height)

/* Tooltip */
transition: opacity 0.2s ease-out
```

### Hover States
```
nav links:        text-black (from rgba(0,0,0,0.75)), + bg-black/[0.03]
product card img: scale-105 (group-hover)
CTA button arrow: translate-x-1
COA card:         -translate-y-0.5, shadow-xl
"Why choose" card: hover:shadow-xl hover:scale-[1.02]
quality img:       hover:scale-[1.01]
primary button:   bg-black/90
store card button:hover:bg-gray-800
```

---

## 8. ICONS

### Style: Lucide / Heroicons line art
All icons are SVG with `fill="none"`, drawn with `stroke="currentColor"`, 24×24 viewBox.

### Stroke Widths Used
```
strokeWidth 1.5  — nav icons (user, cart, hamburger), product page nav arrows
strokeWidth 2.0  — general UI icons (chevrons, shield, clock, check-circle, lightning)
strokeWidth 2.5  — small badge checkmarks (12px icons in green quality badges)
```

### Icon Sizes
```
Nav bar icons:           20–22px (w-5/h-5 to w-[22px]/h-[22px])
In-button arrow (CTA):   24px wide, custom viewBox 0 0 45 15 (filled arrow path, currentColor fill)
Carousel nav arrows:     15×15px (w-4 h-4)
Feature card icons:      Emoji (🧬 🔬 💊) at 24px, in 40×40px rounded-xl #f4f4f5 container
Stat section icons:      Emoji at 24px in 48×48px rounded-xl container
Badge/check icons:       12px (w-3 h-3) in green badges
Product panel icons:     16px (w-4 h-4) in info rows
```

### Icon Color
All icons use `currentColor` — inheriting from parent's text color:
- Nav icons: `color: rgba(0,0,0,0.7)` → hover `#000000`
- Button arrow: `color: #ffffff`
- Feature icons: inherited from card context
- Green badge icons: `color: #166534`

---

## 9. PAGE-BY-PAGE DOCUMENTATION

---

### HOMEPAGE (`/us`)

**URL:** https://www.aminoclub.com/us
**Title:** "Amino Club - Premium Peptides | Buy Research Peptides | 99%+ Purity"

#### Section 0: Hero
```
Layout:      Full-width, height 450px (lg) / 520px (xl) / 580px (2xl)
Structure:   2-column grid (50/50 desktop), stacked mobile
             Left (lg:w-1/2): solid white bg (#ffffff)
             Right (flex-1 lg:w-2/3): gradient bg rgba(232,229,255,0.6) → rgba(203,229,252,0.6)
             Product vial image: absolute positioned on right side, fills height

Content col: flex-col, gap-2 lg:gap-4, pt-4 pb-8 lg:py-8 xl:py-10
             z-20, order-2 lg:order-1 (text behind image on mobile)

H1:          "Premium Peptides You Can Trust"
             text-[2.75rem] sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl 2xl:text-[4rem]
             font-semibold, leading-[1.05], tracking-tight, text-black, max-w-md lg:max-w-lg

Subtext:     text-base sm:text-lg md:text-xl lg:text-lg xl:text-xl
             text-black/80, leading-relaxed, max-w-sm lg:max-w-md

Primary CTA: bg-black, text-white, h-11 lg:h-12, px-6 lg:px-8, rounded-full
             text-sm lg:text-base, font-medium
             Contains right-arrow SVG (custom, 24px wide, viewBox 0 0 45 15, fill)
             Arrow has group-hover:translate-x-1 animation

Product image: hero/TB500.webp + rotating product images
               object-contain, pointer-events-none, select-none
```

#### Section 1: The Amino Club Guarantee
```
Layout:      2-column grid (50/50 desktop), mobile stacked
             Left half: white bg overlay (hidden lg:block)
             Right half: gradient bg (lavender → sky) fills right side

Content:     Left col: header with H2 + subtitle + 3 guarantee pillar rows
             Right col: large visual element (likely product/lab imagery)

Header area: padding-left 56px on desktop (lg:pl-14), mb-4 md:mb-5 lg:mb-8

H2:          text-xl md:text-2xl lg:text-3xl, font-semibold, text-black, leading-[1.05], mb-2

3 Pillars (each):
  Container: relative overflow-hidden (card wrapper)
  Left bar:  absolute left-0, top-0, bottom-0, w-[12px] lg:w-[24px]
             Colors: mint #e9fce6 / sky #cbe5fc / butter #fefeca
  Icon circle: w-[44px] h-[44px] md:[52px] lg:[60px], rounded-full
               Matching pastel bg to left bar color
  Content:   pl-7 md:pl-9 lg:pl-10, pr-4, gap-3 lg:gap-4, items-center
  Title:     Bold, black
  Subtitle:  Smaller gray text

Pillar 1:   "99% Purity Guaranteed" / "Or your money back" — mint color
Pillar 2:   "Shipment Protection" / tooltip on hover — sky color
Pillar 3:   "CoA with Every Batch" / tooltip on hover — butter color
```

#### Section 2: Featured Products
```
Background:  #ffffff, py-8 lg:py-12 (48px vertical)

H2:          "Featured Products"
             text-xl md:text-2xl lg:text-3xl, font-semibold, text-black

"View all" link: outlined pill, border-brand-black, text-brand-black
                 py-2 px-5, rounded-full, font-normal text-sm, h-32px

Carousel nav: w-10 h-10, rounded-full, border border-brand-black, bg-white
              absolute positioned on left/right of carousel

Product cards in horizontal scroll carousel (3–4 visible):
  Each card: flex-col items-start
  Product name: text-[15px] lg:text-lg, font-semibold, text-brand-black (H3)
  "From" label: text-[10px] lg:text-xs, text-gray-500
  Price: text-base lg:text-lg (or text-lg lg:text-xl), font-semibold, text-brand-black
  Subtitle: text-xs lg:text-sm, text-gray-500, mb-2 lg:mb-3, line-clamp-1
  Buttons: flex row, gap
    "View Studies": outlined, h-9 lg:h-10, rounded-full, border-brand-black
    "View": filled black, h-9 lg:h-10, rounded-full, bg-brand-black
```

#### Section 3: "Everything you need to succeed" (Mint Bento)
```
Background:  #e9fce6 (brand-mint), py-12 lg:py-16 (48px/64px)

H2:          "Everything you need to succeed"
Grid:        grid-cols-1 lg:grid-cols-12, gap-4 lg:gap-5 (20px)

6 bento cards, all sharing:
  bg-white, rounded-2xl lg:rounded-[28px], p-5 lg:p-6
  shadow: 0px 4px 12.5px 0px rgba(151,201,143,0.44)
  overflow: hidden, position: relative

Card 1 (col-span-6, min-h-220): "Join a community of researchers"
Card 2 (col-span-6, min-h-220): "Lab-grade quality meets research-friendly pricing"
Card 3 (col-span-6, min-h-140): "Expert support whenever you need it"
Card 4 (col-span-6, row-span-2, min-h-300): "Extensive research library at your fingertips"
Card 5 (col-span-6, min-h-140): "Anywhere in the US, as fast as next day"
Card 6 (col-span-12, min-h-140): "60-day money-back guarantee & free shipment protection"
  — full-width, flex-col lg:flex-row, items-center, justify-between
```

#### Section 4: "Quality you can verify, not just trust"
```
Background:  #ffffff, py-12 (48px)

H2:          "Quality you can verify, not just trust"
             text-2xl md:text-3xl lg:text-[40px], font-semibold, text-black, leading-[1.1]

Stats row:   3 inline stats before accordion
  "99%+"  — text-xl lg:text-2xl, font-bold, text-black
  "5"     — text-xl lg:text-2xl, font-bold, text-black
  "100%"  — text-xl lg:text-2xl, font-bold, text-black
  Labels: text-xs lg:text-sm, text-[#555], max-w-[80px]

Grid:        grid-cols-1 lg:grid-cols-2, gap-8 lg:gap-16 (32px/64px), items-center
  Left col:  product/COA visual (order-2 lg:order-1)
             Top: quality badge chips row (green pills with checkmarks)
               "HPLC Analysis", "Mass Spectrometry", "pH & Stability Testing", "USP Sterility & LAL", "QC Verification"
             Divider: border-b border-[#eee] pb-6 lg:pb-8
             Bottom: COA floating card (absolute, top-4 right-4)
               bg-white/95, backdrop-blur-sm, rounded-xl, px-4 py-3
               border border-white/50, shadow-lg
               hover: shadow-xl, scale-[1.02]

  Right col: Accordion list (order-1 lg:order-2)
             4 items: Verified Potency, 99%+ Purity, Long-Term Stability, Contaminant-Free, Batch Consistency
             Each: border-b border-[#eee], py-5 lg:py-6 (24px)
             H3: text-base lg:text-lg, font-semibold, text-black
             Body: text-sm lg:text-[15px], text-[#555], leading-relaxed
             "Why it matters:" — font-semibold text-black inline prefix
             Button/CTA: "Shop Now" + "Free COA included with every order" sub-caption
```

#### Section 5: "Why choose Amino Club?"
```
Background:  transparent (no section bg), py-12 lg:py-16 (64px)
             Decorative inner-border overlays on each card (colored borders, rgba 0.3 opacity)

H2:          "Why choose Amino Club?"

Grid:        grid-cols-1 md:grid-cols-2 lg:grid-cols-3, gap-4 lg:gap-5 (20px)

Each card:
  bg: rgba(255,255,255,0.8), backdrop-blur-sm
  border: 1px solid rgba(227,227,227,0.6)
  radius: rounded-2xl lg:rounded-3xl (16px / 24px)
  shadow: 0px 1px 2px rgba(0,0,0,0.05)
  padding: 20px (p-4 lg:p-5)
  Decorative overlay: absolute inset-0, rounded-[same], border-[3px], ~0.3 opacity
    Colors: lavender(#dcd7ff), mint(#e9fae7), butter(#fffad6), pink(#fad9ff) per card

  H3: font-semibold, text-base lg:text-lg, text-black, leading-tight, mb-1.5 lg:mb-2
  P:  text-[#797979], text-sm lg:text-base, leading-relaxed

Cards:
  "Always in Stock"
  "Free Priority Shipping"
  "Research-Backed Products"
  "Lifetime Customer Support"
  "60-Day Money Back Guarantee"
  "Private Research Community"
```

#### Section 6: FAQ
```
Background:  #ffffff, py-12 (48px)

H2:          "Frequently Asked Questions"

Each item:   border-b border-[#eeeeee] (last:border-b-0)
             Button: w-full, py-5 lg:py-6 (24px), flex items-center justify-between
             Question: text 16px, left aligned
             Chevron: SVG, rotates on open
             Answer: text-[#555] or text-[#666], leading-relaxed, pb-4
```

#### Section 7: Bottom CTA Gradient
```
Background:  linear-gradient(#fefeca → #e9fae7) (butter → soft green)
             pt-12 lg:pt-20 pb-20 sm:pb-24 lg:pb-28 (top 80px, bottom 112px)

Heading:     "All the research peptides you need, with the [peace of mind]
              and research community at your fingertips."
             text-[36px], font-semibold
             "peace of mind" — animated text (rotating phrases, opacity transition 0.5s)

CTA:         "Shop Now" — bg-black, text-white, px-6 lg:px-7, py-3 lg:py-3.5
             rounded-full, font-medium, text-sm lg:text-base
             overflow:hidden (shimmer effect via ::before pseudo-element)
```

---

### STORE PAGE (`/us/store`)

**URL:** https://www.aminoclub.com/us/store
**Title:** "Peptides for Sale | 99%+ Purity Research Peptides | Amino Club"

#### Page Header
```
H1:          "All Products"
             font-semibold, text-2xl sm:text-3xl lg:text-4xl (36px), text-brand-black

Layout:      flex-col sm:flex-row sm:items-end sm:justify-between, gap-4
             Left: H1 + subtitle
             Right: Sort dropdown (rounded-full select)
```

#### Search + Filter Bar
```
Search input: h-11, rounded-full, bg-gray-50, border gray-200, pl-12 (search icon inset)
Sort dropdown: rounded-full, bg-white, border gray-200, text-sm font-medium

Category filter pills: horizontal scroll row
  bg-gray-100, rounded-full, px-4 py-2, text-sm font-medium
  Active: bg-gray-900 text-white

Categories:
  "Recovery Research", "Skin & Anti-Aging Research", "Metabolic Research",
  "Growth Research", "Longevity Research", "Cognitive Research", "Sleep Research"
```

#### Product Grid
```
Grid:        grid-cols-2 md:grid-cols-3 lg:grid-cols-4
Gap:         gap-3 sm:gap-4 lg:gap-6 (24px at lg)
Column width: 285.75px per column at 1215px viewport

25 products listed (all from sitemap)

Each product card:
  Outer <li>: h-full, no styling
    .group wrapper: h-full
      Card container: bg-neutral-100 (#f5f5f5), rounded-[20px] lg:rounded-[24px], overflow-hidden, flex flex-col

      Image area (top):
        <a> block, aspect-[4/5], overflow-hidden
        <img> object-cover, object-[80% center]
        transition: transform 0.3s | group-hover:scale-105

      Info panel (bottom):
        bg-[#f9f9f9], p-3 lg:p-4, pt-3 lg:pt-4, flex flex-col flex-grow
        rounded-b-[20px] lg:rounded-b-[24px]

        H3 name:     font-semibold text-base lg:text-lg text-brand-black leading-tight line-clamp-2
        "From" label: text-[10px] lg:text-xs text-gray-500 block
        Price span:  font-semibold text-lg lg:text-xl text-brand-black leading-tight
        Subtitle p:  text-gray-500 text-xs lg:text-sm mb-2 line-clamp-1
        Rating:      "4.8 (373)" — text-xs text-gray-500 leading-none
        View button: w-full h-9 lg:h-10 px-3 rounded-full bg-brand-black text-white
                     font-medium text-xs lg:text-sm leading-none
```

---

### PRODUCT DETAIL PAGE (`/us/products/[slug]`)

**Example:** BPC-157 — $39.99 | GLP-3 — $69.99–$199.99 | GHK-Cu — $29.99–$57.99

#### Section 0: Product Hero
```
Layout:      grid-cols-1 lg:grid-cols-2, gap-4 lg:gap-5 (20px)
             py-6 lg:py-8 (24px/32px top+bottom)

Left panel — Image:
  bg-[#f8f8f8], border border-[#e8e8e8]
  rounded-[20px] lg:rounded-[24px], p-6 lg:p-8 (24px/32px)
  flex items-center justify-center
  min-height: varies (380–500px)
  Product image: centered, max-height fills panel

Right panel — Product info:
  bg-white, border border-[#e8e8e8]
  rounded-[20px] lg:rounded-[24px], p-5 lg:p-7 (20px/28px)
  flex flex-col

  Subtitle:    text-sm, text-[#555], italic, mb-2  e.g. "Regenerative Peptide"
  H1 name:     text-3xl lg:text-5xl (48px), font-bold (#700), text-black, leading-[1], mb-1
  Rating:      "4.9 (227 reviews)" — text-sm, text-gray-600
  Alias pills: Scrollable row of rounded-full pills
               px-3 py-1.5, border border-[#e0e0e0], text-xs, text-[#555]
               font-family: Poppins
  Description: text-sm, text-[#666], leading-relaxed, mb-5

  Selector label: text-sm font-semibold text-black w-20 (e.g. "Dosage")
  Dosage pills:   px-4 py-2 rounded-lg text-sm font-medium, border, h-38px
                  Active: bg-black text-white border-black
                  Inactive: bg-transparent text-[#555] border-[#e0e0e0]

  Quantity label + stepper:
    label: text-sm font-semibold text-black
    stepper: w-9 h-9 buttons, w-8 text center

  Bundle options: px-3 py-2 rounded-lg border, h-66px, flex items-center gap-2
    Active: bg-teal-50 border-teal-600
    Badges on bundle: "MOST POPULAR", "BEST VALUE" — tiny labels
    Discount: "5% OFF" / "7.5% OFF"

  Price: text-2xl (24px), font-bold, text-black

  Action row: flex gap-2
    CoA button: h-12 px-5 border border-[#e0e0e0] rounded-full text-sm font-medium text-[#555]
    Add to cart: flex-1 h-12 px-6 rounded-full bg-black text-white text-sm font-medium

  Trust micro-text: text-[11px], text-[#555], inline-flex items-center gap-0.5
    "Free shipment protection?" (tooltip trigger)
```

#### Section 1: Trust Bar
```
4 items, flex-col gap-4 (on mobile)
Each item: flex-col items-center text-center gap-2
  Icon (SVG): w-8 h-8, stroke-based
  Text:
    Title: text-xs font-medium text-[#333]
    Subtitle: text-xs text-[#666]

Items: "Free shipping on orders over $150" | "60-day money-back guarantee" | "Secure checkout 256-bit SSL" | (4th)
```

#### Section 2: Certificate of Analysis
```
Heading: "Certificate of Analysis", with green icon (w-10 h-10, rounded-xl, bg-[#e9fce6])

COA card (scrollable horizontal carousel):
  Active card: border 2px solid #131315, rounded-2xl (16px), p-5, w-280px, bg-white
               shadow: 0px 4px 12px rgba(151,201,143,0.1)
  Badges: "Latest" (black pill) + "Selected dosage" (green pill)
  Purity %: text-3xl (32px), font-bold, text-[#16a34a], Poppins, tracking-tight
  "Purity" label: text-xs font-semibold text-[#5a5a5a] uppercase tracking-wider
  Data rows: "Variant", "Lot #", "Labeled", "Actual", "Tested"
    Label: text-xs text-[#5a5a5a]
    Value: text-xs font-medium text-[#131315] / green for "Actual"
  "Actual" value color: #16a34a (confirms overfill)
```

#### Section 3: "Frequently Researched Together"
```
Background:  bg-white, py-6 lg:py-8
Heading: "Frequently Researched Together"
Layout: horizontal scroll carousel of product cards
Carousel nav: w-9 h-9 rounded-full border border-brand-black bg-white
```

#### Section 4: Key Research Statistics Bar
```
Horizontal flex-wrap, justify-center, gap-4 lg:gap-5
Each stat tile: w-[calc(50%-0.5rem)] sm:w-[calc(33%-1rem)] lg:w-[220px]
No card background — metrics displayed directly

  Icon: emoji in 48×48px rounded-xl container, text-2xl
  Metric: text-2xl lg:text-3xl font-bold text-[#131315] leading-none tracking-tight
  Label: text-xs font-semibold text-[#5a5a5a] uppercase tracking-wider mt-2
  Description: text-sm text-[#4a5568] mt-2 leading-snug
```

#### Sections 5+: Research Content
```
Section 5 (empty/spacer): flex justify-center
Section 6: "How [Product] Works" — mechanism circles + pathway explanation
  Mechanism circles: w-20 h-20 lg:w-24 lg:h-24 rounded-full, gradient border (3px)
                     Inner white circle, pathway label (e.g. "VEGF", "NO", "GF")
  Citation box: mt-5 p-4 rounded-xl bg-white/[0.06], text-sm

Section 7: "What Research Has Shown" — trial results
Section 8: "Research Applications" — benefit grid
Section 9: "Safety Profile" — bg-[#fafafa]
Section 10: "Compound Information" — specs grid
Section 11: "Frequently Asked Questions" — bg-white
Section 12: "Sources & References" — bg-[#fafafa]
Section 13: Research disclaimer — "⚠️ Important Research Notice"
Section 14: Bottom CTA gradient (same as homepage section 7)
```

---

### FAQ PAGE (`/us/faq`)

```
6 category sections: Ordering, Shipping, Products, Reconstitution, Quality & Testing, Returns & Support
3 Q&A per category
Accordion-style with smooth transitions
Schema.org FAQPage markup
```

### QUALITY PAGE (`/us/quality`)

```
H1:          "Our Quality Commitment"
Subtitle:    "From synthesis to shipment, every step is designed to deliver the purest peptides..."

Sections:
  "The Amino Club Difference" — 4 pillars (USA-Based, cGMP, 3rd Party Testing, 99%+ Purity)
  "Quality Process" — 6-step linear flow
  "Commitments to You" — cGMP Partners, Batch Traceability, Continuous Improvement, Transparency

CTAs:        "Browse Products" → /us/store  |  "Learn About COAs" → /us/coa
```

### COA PAGE (`/us/coa`)

```
H1:          "Certificate of Analysis"
Stats:       "99%+ Purity Standard", "100% Batches Tested", "ISO 17025 Lab Accreditation"

4 testing methods: HPLC Purity Analysis, Mass Spectrometry, Endotoxin Testing, Sterility Verification
3-step access guide
5 FAQ accordion items
```

### CONTACT PAGE (`/us/contact`)

```
Two contact methods:
  Email: support@aminoclub.com (response within 24 hours Mon–Fri 9am–6pm EST)
  Discord: discord.gg/gADfdjqWcd (24/7 community)

Form fields not listed — likely name, email, message
```

### AFFILIATE PAGE (`/us/affiliate`)

```
H2s: "Partner with premium research peptides", "How it works", "Why partners choose us",
     "Simple, transparent pricing", "Success stories", "Frequently asked questions"

Commission: 20% first order, 10% recurring
Customer discount: 20% first order
Cookie: 30-day attribution
Payout: PayPal, 1st of month
CTA: "Become a Partner"
```

---

## 10. NAVIGATION & HEADER

### Header Specs
```css
element:        <header>
height:         64px mobile (h-16) / 70px desktop (lg:h-[70px])
position:       relative (NOT sticky at time of scrape)
background:     #ffffff
border-bottom:  1px solid rgba(243,244,246,0.8) (gray-100/80)
box-shadow:     0px 1px 3px rgba(0,0,0,0.05)
font-family:    Anek Telugu
```

### Header Layout
```
Content container: max-w-[1440px], px-4 sm:px-6 lg:px-8 (32px), mx-auto
Inner: flex items-center justify-between w-full h-full

Left:   Logo (SVG — LogoMain.svg), linked to /us
Center: Nav links (hidden on mobile)
Right:  Account icon + Cart icon (+ mobile hamburger)
```

### Nav Links
```css
font-size:      13px
font-weight:    500 (medium)
color:          rgba(0,0,0,0.75)
padding:        8px 16px (px-4 py-2)
border-radius:  9999px (rounded-full)
transition:     color 0.2s, background-color 0.2s
hover color:    #000000
hover bg:       rgba(0,0,0,0.03)

Links: Products (/us/store) | Research (/us/research) | Partner Program (/us/affiliate) | Contact us (/us/contact)
```

### Icon Buttons (Account, Cart)
```css
size:           40×40px (w-10 h-10)
border-radius:  9999px (rounded-full)
color:          rgba(0,0,0,0.7)
hover color:    #000000
hover bg:       rgba(0,0,0,0.03)
transition:     all 0.2s

Cart badge:     18×18px min, px-1, bg-black, text-white, text-[10px], font-semibold
                rounded-full, positioned absolute -top-0.5 -right-0.5
```

### Logo
```
File:     /LogoMain.svg (light mode) / /LogoWhite.svg (used in footer/dark contexts)
Link:     /us (homepage)
```

---

## 11. FOOTER

### Footer Specs
```css
element:        <footer>
background:     #0a192f  /* Deep navy: rgb(10,25,47) */
font-family:    Anek Telugu
```

### Footer Layout
```
Outer padding:   py-14 lg:py-20 (56px / 80px)
Inner padding:   px-4 sm:px-6 lg:px-8 (same as header)
max-width:       1440px

Grid:            grid-cols-2 md:grid-cols-3 lg:grid-cols-6
Gap:             gap-10 lg:gap-8

Column 1 (lg:col-span-2?): Brand description
  Logo: /LogoWhite.svg
  Description: text-sm, text-white/70, leading-relaxed, max-w-xs
  Social icons: Discord, Instagram, X, YouTube
    Each: w-9 h-9 (or similar), rounded, text-white/70 hover:text-white

Columns 2–5: Link groups
  Heading: text-sm font-semibold text-white uppercase tracking-wider (H3)
  Links: text-sm text-white/70 leading-relaxed hover:text-white

  Shop: All Products
  Resources: Research Library, Certificates of Analysis
  Support: Contact Us, FAQ, Shipping Info, Returns & Refunds
  Legal: Privacy Policy, Terms of Service, Disclaimer, Research Use Only

Bottom bar:
  border-top: 1px solid rgba(255,255,255,0.1)
  padding: py-6 (24px)
  Layout: flex-col sm:flex-row sm:items-center sm:justify-between, gap-4

  Left: "© 2026 Amino Club. All rights reserved." — text-xs, text-white/70
  Right: Trust badges row (flex items-center gap-4)
    Each badge: flex items-center gap-2 text-xs text-white/70
    "SSL Secured" | "99%+ Purity" | "Shipment Protection"
    Each with small icon (SVG, ~14px, stroke-based, currentColor)
```

---

## 12. FULL CSS CUSTOM PROPERTIES REFERENCE

```css
:root {
  /* Backgrounds */
  --bg-base:                    #ffffff;
  --bg-base-hover:              #f4f4f5;
  --bg-base-pressed:            #e4e4e7;
  --bg-component:               #fafafa;
  --bg-component-hover:         #f4f4f5;
  --bg-component-pressed:       #e4e4e7;
  --bg-subtle:                  #fafafa;
  --bg-subtle-hover:            #f4f4f5;
  --bg-subtle-pressed:          #e4e4e7;
  --bg-field:                   #fafafa;
  --bg-field-component:         #ffffff;
  --bg-field-component-hover:   #fafafa;
  --bg-field-hover:             #f4f4f5;
  --bg-highlight:               #eff6ff;
  --bg-highlight-hover:         #dbeafe;
  --bg-interactive:             #3b82f6;
  --bg-overlay:                 #18181b66;
  --bg-disabled:                #f4f4f5;
  --bg-switch-off:              #e4e4e7;
  --bg-switch-off-hover:        #d4d4d8;

  /* Foreground */
  --fg-base:                    #18181b;
  --fg-subtle:                  #52525b;
  --fg-muted:                   #71717a;
  --fg-disabled:                #a1a1aa;
  --fg-on-color:                #ffffff;
  --fg-on-inverted:             #ffffff;
  --fg-interactive:             #3b82f6;
  --fg-interactive-hover:       #2563eb;
  --fg-error:                   #e11d48;

  /* Borders */
  --border-base:                #e4e4e7;
  --border-strong:              #d4d4d8;
  --border-interactive:         #3b82f6;
  --border-transparent:         rgba(255,255,255,0);
  --border-danger:              #be123c;
  --border-error:               #e11d48;
  --border-menu-top:            #e4e4e7;
  --border-menu-bot:            #ffffff;

  /* Buttons */
  --button-inverted:            #27272a;
  --button-inverted-hover:      #3f3f46;
  --button-inverted-pressed:    #52525b;
  --button-neutral:             #ffffff;
  --button-neutral-hover:       #f4f4f5;
  --button-neutral-pressed:     #e4e4e7;
  --button-danger:              #e11d48;
  --button-danger-hover:        #be123c;
  --button-danger-pressed:      #9f1239;
  --button-transparent:         rgba(255,255,255,0);
  --button-transparent-hover:   #f4f4f5;
  --button-transparent-pressed: #e4e4e7;

  /* Shadows */
  --elevation-card-rest:        0px 0px 0px 1px rgba(0,0,0,0.08), 0px 1px 2px -1px rgba(0,0,0,0.08), 0px 2px 4px 0px rgba(0,0,0,0.04);
  --elevation-card-hover:       0px 0px 0px 1px rgba(0,0,0,0.08), 0px 1px 2px -1px rgba(0,0,0,0.08), 0px 2px 8px 0px rgba(0,0,0,0.10);
  --elevation-flyout:           0px 0px 0px 1px rgba(0,0,0,0.08), 0px 4px 8px 0px rgba(0,0,0,0.08), 0px 8px 16px 0px rgba(0,0,0,0.08);
  --elevation-modal:            0px 0px 0px 1px #fff inset, 0px 0px 0px 1.5px rgba(228,228,231,0.6) inset, 0px 0px 0px 1px rgba(0,0,0,0.08), 0px 8px 16px 0px rgba(0,0,0,0.08), 0px 16px 32px 0px rgba(0,0,0,0.08);
  --elevation-tooltip:          0px 0px 0px 1px rgba(0,0,0,0.08), 0px 2px 4px 0px rgba(0,0,0,0.08), 0px 4px 8px 0px rgba(0,0,0,0.08);
  --elevation-commandbar:       0px 0px 0px 0.75px #27272a inset, 0px 0px 0px 1.25px rgba(255,255,255,0.3) inset, 0px 8px 16px 0px rgba(0,0,0,0.08), 0px 16px 32px 0px rgba(0,0,0,0.08);

  /* Contrast / dark surface */
  --contrast-bg-base:           #18181b;
  --contrast-bg-base-hover:     #27272a;
  --contrast-bg-base-pressed:   #3f3f46;
  --contrast-bg-subtle:         #27272a;
  --contrast-border-base:       rgba(255,255,255,0.15);
  --contrast-border-bot:        rgba(255,255,255,0.10);
  --contrast-border-top:        #18181b;
  --contrast-fg-primary:        rgba(255,255,255,0.875);
  --contrast-fg-secondary:      rgba(255,255,255,0.562);

  /* Brand */
  --color-brand-black:          #131315;
  --color-brand-white:          #ffffff;
  --color-brand-mint:           #e9fce6;
  --color-brand-sky:            #cbe5fc;
  --color-brand-lavender:       #e8e5ff;
  --color-brand-butter:         #fefeca;
  --color-neutral-slate:        #4a5568;
  --color-neutral-ash:          #bdc5cc;
  --color-neutral-cool:         #a3afb8;
  --color-neutral-offwhite:     #f1f2f4;

  /* Alphas */
  --alpha-250:                  rgba(24,24,27,0.10);
  --alpha-400:                  rgba(24,24,27,0.24);

  /* Focus/border combos */
  --borders-base:               0px 1px 2px 0px rgba(0,0,0,0.12), 0px 0px 0px 1px rgba(0,0,0,0.08);
  --borders-focus:              0px 0px 0px 1px #fff, 0px 0px 0px 3px rgba(59,130,246,0.6);
  --borders-error:              0px 0px 0px 1px #e11d48, 0px 0px 0px 3px rgba(225,29,72,0.15);
  --borders-interactive-with-active:  0px 0px 0px 4px rgba(37,99,235,0.2), 0px 0px 0px 1px #2563eb;
  --borders-interactive-with-focus:   0px 1px 2px 0px rgba(30,58,138,0.5), 0px 0px 0px 1px #2563eb, 0px 0px 0px 2px #fff, 0px 0px 0px 4px rgba(37,99,235,0.6);
  --buttons-neutral:            0px 1px 2px 0px rgba(0,0,0,0.12), 0px 0px 0px 1px rgba(0,0,0,0.08);
  --buttons-inverted:           0px 0.75px 0px 0px rgba(255,255,255,0.2) inset, 0px 1px 2px 0px rgba(0,0,0,0.4), 0px 0px 0px 1px #18181b;
  --buttons-danger:             0px 0.75px 0px 0px rgba(255,255,255,0.2) inset, 0px 1px 2px 0px rgba(190,18,60,0.4), 0px 0px 0px 1px #be123c;
}
```

---

## QUICK REFERENCE: SIGNATURE DESIGN DECISIONS

1. **Font pairing**: Anek Telugu (display/body) + Poppins (utility/data) — both loaded as Next.js variable fonts
2. **Buttons are always pills** (border-radius: 9999px) — never rectangular
3. **Card shadow signature**: `0px 4px 12.5px 0px rgba(151,201,143,0.44)` — soft warm green glow
4. **Brand accent colors are pastels**: mint, sky, lavender, butter — never saturated
5. **Footer is deep navy** `#0a192f` — stark contrast to the white/pastel site body
6. **All hover transitions**: `0.2s cubic-bezier(0.4,0,0.2,1)` (TW default ease-in-out)
7. **Headings use tracking-tight** only on H1 hero (-1.2px); all other headings are normal letter-spacing
8. **Icon style**: Lucide/Heroicons line art, `fill="none"`, `stroke="currentColor"`, strokeWidth 1.5–2.5
9. **No drop shadows on product store cards** — relies on neutral-100 bg contrast instead
10. **COA purity number** always in `#16a34a` (green-600) — a trust signal color
11. **Content max-width**: 1440px with 32px padding on desktop
12. **Bento grid** uses 12-column system on homepage features with col-span mixing
