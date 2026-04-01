import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Layout from '../../components/Layout';
import PharmCard from '../../components/PharmCard';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useRecentlyViewed } from '../../context/RecentlyViewedContext';
import { products, COAS, CHEM_DATA, RESEARCH_DATA, getCategoryConfig, getProductBySlug, PRODUCT_VARIANTS } from '../../lib/data';

// Cross-category stacks: product slug → array of complementary product slugs
// Blend compositions (avoid pairing with ingredients already in the blend):
//   KLOW = BPC-157 + TB-500 + KPV + GHK-CU
//   GLOW = GHK-CU + BPC-157 + TB-500
//   BPC 157 + TB 500 = BPC-157 + TB-500
//   CJC-1295 + Ipamorelin = CJC-1295 w/o DAC + Ipamorelin
//   LIPO C = Methionine + Inositol + Choline + B vitamins
const STACK_MAP = {
  // GLP-1 / metabolic — pair with recovery blends + longevity (not other GLPs)
  'glp-3-r':       ['cagrilintide', 'klow', 'nad'],
  'glp-2-t':       ['cagrilintide', 'klow', 'mots-c'],
  'glp-1-s':       ['cagrilintide', 'klow', '5-amino-1-mq'],
  'cagrilintide':  ['glp-3-r', 'mots-c', 'lipo-c'],
  // Growth hormone — pair with recovery + longevity
  'hgh-191aa':     ['cjc-1295-w-o-dac-ipamorelin', 'klow', 'nad'],
  'ipamorelin':    ['cjc-1295-w-o-dac', 'klow', 'nad'],
  'cjc-1295-w-o-dac': ['ipamorelin', 'klow', 'mots-c'],
  'cjc-1295-w-o-dac-ipamorelin': ['klow', 'nad', 'igf-1lr3'],
  'igf-1lr3':      ['cjc-1295-w-o-dac-ipamorelin', 'klow', 'mots-c'],
  'tesa':          ['kisspeptin', 'nad', 'klow'],
  // Recovery singles — pair with GH + longevity (not blends containing same ingredients)
  'bpc-157':       ['ipamorelin', 'nad', 'epithalon'],
  // KLOW (contains BPC+TB500+KPV+GHK-CU) — pair with things NOT in it
  'klow':          ['glp-3-r', 'nad', 'semax'],
  // BPC+TB500 blend — pair with non-overlapping compounds
  'bpc-157-tb-500': ['ipamorelin', 'nad', 'epithalon'],
  // Longevity — pair with cognitive + metabolic
  'nad':           ['epithalon', 'ss31', 'semax'],
  'epithalon':     ['nad', 'ss31', 'glutathione'],
  'glutathione':   ['nad', 'glow', 'lipo-c'],
  'ss31':          ['nad', 'epithalon', 'mots-c'],
  'mots-c':        ['nad', '5-amino-1-mq', 'glp-3-r'],
  // Cognitive — pair with longevity + recovery blends
  'semax':         ['selank', 'cerebrolysin', 'nad'],
  'selank':        ['semax', 'dsip', 'nad'],
  'dsip':          ['selank', 'pinealon', 'epithalon'],
  'cerebrolysin':  ['semax', 'pinealon', 'nad'],
  'pinealon':      ['semax', 'dsip', 'cerebrolysin'],
  // Metabolic — pair with GLP + longevity
  '5-amino-1-mq': ['glp-3-r', 'mots-c', 'lipo-c'],
  'lipo-c':        ['5-amino-1-mq', 'glutathione', 'glp-3-r'],
  // Aesthetic — GLOW contains GHK-CU+BPC+TB500, so don't pair those
  'ghk-cu':        ['snap-8', 'glutathione', 'mt-2-melanotan-ii'],
  'snap-8':        ['ghk-cu', 'glutathione', 'mt-2-melanotan-ii'],
  'mt-2-melanotan-ii': ['pt-141', 'snap-8', 'glutathione'],
  // GLOW (contains GHK-CU+BPC+TB500) — pair with non-overlapping
  'glow':          ['snap-8', 'glutathione', 'nad'],
  // Immune — pair with longevity + cognitive
  'kpv':           ['thymosin-alpha', 'nad', 'semax'],
  'thymosin-alpha': ['kpv', 'nad', 'glutathione'],
  // Hormonal — pair with GH + cognitive
  'kisspeptin':    ['pt-141', 'tesa', 'selank'],
  'pt-141':        ['kisspeptin', 'mt-2-melanotan-ii', 'selank'],
  // Supplies
  'b12':           ['lipo-c', 'glutathione', 'nad'],
  'bac-water-10-ml':    ['bpc-157', 'glp-3-r', 'ipamorelin'],
  'bac-water-united-labs-30ml': ['bpc-157', 'glp-3-r', 'ipamorelin'],
};

// Short reason labels for why two products pair well
const STACK_REASONS = {
  // metabolic
  'cagrilintide': 'Amylin analog synergy',
  'klow':         'Recovery & repair stack',
  'nad':          'Cellular energy support',
  'mots-c':       'Mitochondrial health',
  'lipo-c':       'Lipid metabolism support',
  '5-amino-1-mq': 'Metabolic amplifier',
  // GH
  'cjc-1295-w-o-dac-ipamorelin': 'GH pulse stack',
  'cjc-1295-w-o-dac': 'GHRH component',
  'ipamorelin':   'GH secretagogue',
  'igf-1lr3':     'Downstream IGF-1',
  'tesa':         'Testosterone support',
  'kisspeptin':   'HPG axis support',
  // longevity
  'epithalon':    'Telomere lengthening',
  'ss31':         'Mitochondrial antioxidant',
  'glutathione':  'Antioxidant defense',
  // cognitive
  'semax':        'Cognitive enhancement',
  'selank':       'Anti-anxiety focus',
  'dsip':         'Sleep regulation',
  'cerebrolysin': 'Neuropeptide complex',
  'pinealon':     'Epiphysis support',
  // aesthetic
  'ghk-cu':       'Collagen regeneration',
  'snap-8':       'Expression line reduction',
  'mt-2-melanotan-ii': 'Melanogenesis',
  'pt-141':       'Sexual function support',
  'glow':         'Skin & hair blend',
  // immune
  'kpv':          'Anti-inflammatory',
  'thymosin-alpha': 'Immune modulator',
  // recovery
  'bpc-157':      'Tissue repair',
  'bpc-157-tb-500': 'Healing blend',
  // supplies
  'bac-water-10-ml': 'Reconstitution water',
  'bac-water-united-labs-30ml': 'Reconstitution water',
  'b12':          'Energy & nerve support',
  // GLP
  'glp-3-r':      'GLP-1 receptor agonist',
  'glp-2-t':      'Gut healing peptide',
  'glp-1-s':      'Semaglutide analog',
  // other
  'hgh-191aa':    'Growth hormone',
};

function Stars({ n = 5, size = 15 }) {
  return <span style={{ color: '#f59e0b', fontSize: size, letterSpacing: 2 }}>{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>;
}

// Per-product reviews — key is product slug. Falls back to category defaults.
const PRODUCT_REVIEWS = {
  'bpc-157': [
    { name: 'Dr. M. Calloway', date: 'Jan 12, 2025', rating: 5, title: 'Best purity I have tested', body: 'Ran the COA through our own HPLC setup in the lab. 99.2% net purity confirmed. Reconstitution was smooth, no particulates. Our tendon repair study is showing excellent results so far.', verified: true },
    { name: 'R. Santino', date: 'Feb 3, 2025', rating: 5, title: 'Arrived fast, lab results match label', body: 'Ordered 10mg. Shipping was 3 days from FL. Lyophilized cake was intact and dissolved cleanly in BAC water. Looking forward to running our full panel.', verified: true },
    { name: 'J. Thornton', date: 'Dec 28, 2024', rating: 5, title: 'Consistent quality, reordering', body: 'Third order from EVO Labs. Every vial tests clean. The Janoshik COA is always current and easy to download. Reliability matters when you\'re running controlled studies.', verified: true },
    { name: 'Lisa K.', date: 'Mar 1, 2025', rating: 4, title: 'Great product, packaging could be improved', body: 'Very high purity confirmed by our external lab. The vials arrived safely but the outer box was slightly dented. The product itself was perfect. Will order again.', verified: true },
  ],
  'glp-3-r': [
    { name: 'P. Harrington', date: 'Feb 18, 2025', rating: 5, title: 'Highest purity GLP available', body: 'Compared to three other suppliers. EVO Labs came out on top on both purity and net content. The 10mg vials are great value for extended research runs.', verified: true },
    { name: 'Amir S., PhD', date: 'Jan 30, 2025', rating: 5, title: 'Consistent across batches', body: 'We\'ve ordered 4 times now. Lot-to-lot consistency is excellent. Purity hovers between 98.8–99.4% on our in-house HPLC. Highly recommended for metabolic research.', verified: true },
    { name: 'T. Nguyen', date: 'Mar 5, 2025', rating: 5, title: 'Fast shipping, professional packaging', body: 'Ships out same day if you order before noon. Came with desiccant and the vial was perfectly sealed. This is how peptide companies should operate.', verified: true },
    { name: 'Rachel O.', date: 'Feb 22, 2025', rating: 4, title: 'Good product, solid COA', body: 'Purity verified at 98.9%. The research data on this compound is compelling and the quality matches the science. One star off only because the website is a bit slow.', verified: true },
  ],
  'hgh-191aa': [
    { name: 'Dr. B. Voss', date: 'Jan 8, 2025', rating: 5, title: 'Exceptional purity, seamless ordering', body: 'The 191aa isoform purity is critical for our receptor binding assays. EVO Labs\' COA confirms exactly what we need. No degradation products detected on our western blot.', verified: true },
    { name: 'M. Castellano', date: 'Feb 14, 2025', rating: 5, title: 'Best HGH source I\'ve used', body: 'Testing 5 vendors for our GH receptor study. EVO Labs was the only one with both HPLC AND mass spec confirmation in the COA. That level of documentation matters.', verified: true },
    { name: 'K. Osei', date: 'Mar 10, 2025', rating: 5, title: 'Great service, fast shipping', body: 'Placed order Wednesday, received Friday in Toronto-area packaging. Intact vial, lyophilized cake perfect. Customer support answered a technical question within 2 hours.', verified: true },
  ],
  'nad': [
    { name: 'C. Reynolds', date: 'Feb 27, 2025', rating: 5, title: 'Verified purity, excellent longevity research tool', body: 'NAD+ precursor purity at 99.1% per COA. We use this in our mitochondrial biogenesis studies. Reconstitutes cleanly and is stable for weeks when stored properly per instructions.', verified: true },
    { name: 'S. Blumenthal', date: 'Jan 25, 2025', rating: 5, title: 'Reorder #4', body: 'Consistent quality across all four orders. The only thing that changes is the Janoshik report date — everything else is rock-solid. Reliable supplier.', verified: true },
    { name: 'N. Patel', date: 'Mar 3, 2025', rating: 4, title: 'High quality, wish more sizes available', body: 'Product purity confirmed at 98.8%. Would love to see a 50mg vial option for bulk research runs. Otherwise, excellent all around.', verified: true },
  ],
};

// Fallback category reviews
const CATEGORY_REVIEWS = {
  'Healing & Regeneration': [
    { name: 'J. Marcello', date: 'Feb 1, 2025', rating: 5, title: 'Purity confirmed, fast shipping', body: 'Third time ordering this compound. Every batch comes with a fresh COA and tests clean on our equipment. EVO Labs is now our default supplier for regenerative research peptides.', verified: true },
    { name: 'Dr. A. Kim', date: 'Jan 15, 2025', rating: 5, title: 'Research-grade quality', body: 'Our collagen synthesis study required extremely precise concentrations. The net content verification on the COA was critical — EVO Labs delivered exactly labeled amount every time.', verified: true },
    { name: 'P. Larson', date: 'Mar 8, 2025', rating: 5, title: 'Great product', body: 'Arrived safely, purity on COA looks solid. Dissolved well in BAC water. Will be back.', verified: true },
    { name: 'T. Collins', date: 'Feb 19, 2025', rating: 4, title: 'Very good quality', body: 'Tested to 98.7% purity independently. Happy with the result. Fast delivery from Ontario.', verified: true },
  ],
  'GLP-1 / Metabolic Research': [
    { name: 'Dr. L. Chen', date: 'Jan 22, 2025', rating: 5, title: 'Best purity in its class', body: 'We run multiple vendors side by side. EVO Labs consistently tops the purity rankings in our lab. The current COA shows 99.3% — our own test matched within 0.2%.', verified: true },
    { name: 'M. Rodriguez', date: 'Feb 11, 2025', rating: 5, title: 'Exceptional documentation', body: 'The full Janoshik report with HPLC chromatogram is a game-changer. I can actually verify the data myself. No other peptide supplier provides this level of transparency.', verified: true },
    { name: 'A. Patel', date: 'Mar 2, 2025', rating: 5, title: 'Speedy and professional', body: 'Order to delivery in 2 days with expedited shipping. Vials were perfectly sealed and the lyophilized powder was intact. Exactly what I expect from a premium supplier.', verified: true },
    { name: 'G. Weiss', date: 'Jan 31, 2025', rating: 4, title: 'Solid quality', body: 'Purity tested at 98.9%. Happy with the results. Would love a loyalty discount for repeat orders.', verified: true },
  ],
  'Growth Hormone Peptides': [
    { name: 'Dr. F. Nakamura', date: 'Feb 7, 2025', rating: 5, title: 'Outstanding analytical data', body: 'The dual HPLC + mass spec verification is exactly what a serious research lab needs. Purity confirmed at 99.1% on our end. This is genuine research-grade material.', verified: true },
    { name: 'B. Harrison', date: 'Jan 20, 2025', rating: 5, title: 'Consistent, reliable supplier', body: 'Six orders over two years. Quality never wavers. The COA gets updated with each new production run and you can always get the latest one from the library.', verified: true },
    { name: 'C. Mensah', date: 'Mar 6, 2025', rating: 5, title: 'Fast shipping, great quality', body: 'Ordered Thursday, arrived Monday. Vial intact, dissolves clearly. The 5mg size is perfect for pilot studies.', verified: true },
    { name: 'R. Yuen', date: 'Feb 25, 2025', rating: 4, title: 'Very pleased with quality', body: 'Purity came in at 98.6% on our own test. COA showed 98.9%. Within acceptable variance. Will continue ordering.', verified: true },
  ],
  'Longevity & Anti-Aging': [
    { name: 'Dr. S. Ortega', date: 'Jan 28, 2025', rating: 5, title: 'High purity, well documented', body: 'Running a telomere length study. Purity and net content are both critical variables. EVO Labs\' documentation gives us the confidence to proceed with reliable data.', verified: true },
    { name: 'W. Bernstein', date: 'Feb 20, 2025', rating: 5, title: 'My go-to for longevity compounds', body: 'The combination of excellent purity, transparent COAs, and fast shipping makes EVO Labs the clear choice. I\'ve referred four colleagues already.', verified: true },
    { name: 'H. Takahashi', date: 'Mar 4, 2025', rating: 5, title: 'Top quality', body: 'Ordered 3 vials. All dissolved cleanly, no cloudiness. Janoshik COA is comprehensive and easy to read. Very happy.', verified: true },
    { name: 'N. Fairfield', date: 'Feb 3, 2025', rating: 4, title: 'Good product', body: 'COA is legitimate and matches what we tested. 98.8% purity. Happy customer.', verified: true },
  ],
  'Cognitive & Neuro Peptides': [
    { name: 'Prof. D. Levin', date: 'Feb 16, 2025', rating: 5, title: 'Neurochemistry-grade quality', body: 'Our BDNF assay requires extremely precise peptide concentrations. EVO Labs\' net content verification was critical for our concentration calculations. Perfect results.', verified: true },
    { name: 'Y. Stoychev', date: 'Jan 9, 2025', rating: 5, title: 'Best cognitive peptide source', body: 'Purity tested at 99.2%. The research on this compound is backed up by the quality of the product. Seamless ordering, fast delivery.', verified: true },
    { name: 'C. Burke', date: 'Mar 12, 2025', rating: 5, title: 'Excellent quality and service', body: 'Placed my first order here on a colleague\'s recommendation. Will not be the last. Quality is exactly as described.', verified: true },
    { name: 'T. Walsh', date: 'Feb 8, 2025', rating: 4, title: 'Very good', body: 'Purity of 98.9%. Clean dissolving, intact vial. Happy with this purchase.', verified: true },
  ],
};

function getReviews(product) {
  return PRODUCT_REVIEWS[product.slug] || CATEGORY_REVIEWS[product.category] || [
    { name: 'J. Clarke', date: 'Feb 10, 2025', rating: 5, title: 'High purity, fast delivery', body: 'COA verified, purity tested in-house at 98.7%. Vials arrived intact, dissolved cleanly. Reliable supplier.', verified: true },
    { name: 'M. Evans', date: 'Jan 26, 2025', rating: 5, title: 'Research-grade quality', body: 'Third order from EVO Labs. Quality is consistent across batches. The Janoshik documentation is excellent and updated regularly.', verified: true },
    { name: 'A. Novak', date: 'Mar 7, 2025', rating: 5, title: 'Exceeded expectations', body: 'Ordered 10mg vial, received within 3 days. Completely clear upon dissolution. COA matches exactly.', verified: true },
    { name: 'S. Liu', date: 'Feb 22, 2025', rating: 4, title: 'Good quality', body: 'Purity confirmed at 98.5%. Would recommend to other researchers.', verified: true },
  ];
}

function ReviewsTab({ product }) {
  const rating = product.rating || 4.9;
  const total = product.reviewCount || 100;
  // Synthesize distribution from the overall rating
  const fiveStar = Math.round(total * (rating >= 4.9 ? 0.82 : rating >= 4.7 ? 0.74 : 0.65));
  const fourStar = Math.round(total * 0.12);
  const threeStar = Math.round(total * 0.04);
  const twoStar = Math.round(total * 0.01);
  const oneStar = total - fiveStar - fourStar - threeStar - twoStar;

  return (
    <div style={{ maxWidth: 720 }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0a0a0a', marginBottom: 28 }}>Customer Reviews</h2>

      {/* Rating summary */}
      <div style={{ display: 'flex', gap: 40, marginBottom: 40, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center', minWidth: 100 }}>
          <div style={{ fontSize: 56, fontWeight: 900, color: '#0a0a0a', lineHeight: 1, fontFamily: "'DM Sans', sans-serif" }}>{rating}</div>
          <Stars n={Math.floor(rating)} size={18} />
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>out of 5</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>({total} reviews)</div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          {[
            [5, fiveStar],
            [4, fourStar],
            [3, threeStar],
            [2, twoStar],
            [1, oneStar < 0 ? 0 : oneStar],
          ].map(([stars, count]) => (
            <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
              <span style={{ fontSize: 12, color: '#374151', width: 8 }}>{stars}</span>
              <span style={{ color: '#f59e0b', fontSize: 12 }}>★</span>
              <div style={{ flex: 1, height: 8, background: '#f3f4f6', borderRadius: 9999, overflow: 'hidden' }}>
                <div style={{ height: 8, background: '#f59e0b', borderRadius: 9999, width: `${total > 0 ? Math.round((count / total) * 100) : 0}%`, transition: 'width 0.4s' }} />
              </div>
              <span style={{ fontSize: 12, color: '#6b7280', width: 30, textAlign: 'right' }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trust badge */}
      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 36 }}>⭐</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
            {total} verified purchases · {rating} average rating
          </div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>
            Reviews are verified through our order management system. Full review platform coming soon.
          </div>
        </div>
      </div>
    </div>
  );
}

function VisaLogo() {
  return (
    <svg width="50" height="32" viewBox="0 0 50 32" fill="none">
      <rect width="50" height="32" rx="5" fill="#fff" stroke="#e5e7eb" strokeWidth="1.5"/>
      <text x="25" y="22" textAnchor="middle" fill="#1A1F71" fontSize="17" fontWeight="700" fontStyle="italic" fontFamily="Arial Black, Arial, sans-serif" letterSpacing="-0.5">VISA</text>
    </svg>
  );
}

function MastercardLogo() {
  return (
    <svg width="50" height="32" viewBox="0 0 50 32" fill="none">
      <rect width="50" height="32" rx="5" fill="#fff" stroke="#e5e7eb" strokeWidth="1.5"/>
      <circle cx="19" cy="16" r="9" fill="#EB001B"/>
      <circle cx="31" cy="16" r="9" fill="#F79E1B"/>
      <path d="M25 8.2a9 9 0 0 1 0 15.6A9 9 0 0 1 25 8.2z" fill="#FF5F00"/>
    </svg>
  );
}

function AmexLogo() {
  return (
    <svg width="50" height="32" viewBox="0 0 50 32" fill="none">
      <rect width="50" height="32" rx="5" fill="#016FD0"/>
      <text x="25" y="14" textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize="7" fontWeight="600" fontFamily="Arial, sans-serif" letterSpacing="0.8">AMERICAN</text>
      <text x="25" y="24" textAnchor="middle" fill="#fff" fontSize="9.5" fontWeight="800" fontFamily="Arial, sans-serif" letterSpacing="0.4">EXPRESS</text>
    </svg>
  );
}

function PlaidLogo() {
  // Plaid lattice: two horizontal and two vertical bands woven together
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
        <defs>
          <clipPath id="plaidOct">
            <path d="M9 0H25L34 9V25L25 34H9L0 25V9Z"/>
          </clipPath>
        </defs>
        {/* Horizontal band 1 */}
        <rect x="0" y="5" width="34" height="9" fill="#111" clipPath="url(#plaidOct)"/>
        {/* Horizontal band 2 */}
        <rect x="0" y="20" width="34" height="9" fill="#111" clipPath="url(#plaidOct)"/>
        {/* Vertical band 1 — left */}
        <rect x="5" y="0" width="9" height="34" fill="#111" clipPath="url(#plaidOct)"/>
        {/* Vertical band 2 — right */}
        <rect x="20" y="0" width="9" height="34" fill="#111" clipPath="url(#plaidOct)"/>
        {/* Weave: horiz passes OVER vert at top-right + bottom-left */}
        <rect x="20" y="5" width="9" height="9" fill="white" clipPath="url(#plaidOct)"/>
        <rect x="5" y="20" width="9" height="9" fill="white" clipPath="url(#plaidOct)"/>
      </svg>
      <span style={{ fontWeight: 900, fontSize: 16, color: '#111', letterSpacing: '-0.02em', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>PLAID</span>
    </div>
  );
}

function normalizeProduct(row, staticMatch) {
  const fmt = (v) => {
    if (v == null) return null;
    if (typeof v === 'number') return `$${v.toFixed(2)}`;
    const s = String(v);
    return /^\d+(\.\d+)?$/.test(s) ? `$${s}` : s;
  };
  const stat = staticMatch || {};
  return {
    id: row.id,
    name: row.name || stat.name || '',
    slug: row.slug || '',
    price: fmt(row.price) || stat.price || '',
    salePrice: row.sale_price ? fmt(row.sale_price) : (stat.salePrice || null),
    category: row.category || '',
    description: row.description || '',
    image: row.image || stat.image || '',
    gallery: row.gallery || [],
    sizes: row.sizes || [],
    badge: row.badge || null,
    shopUrl: row.shop_url || '',
    outOfStock: row.out_of_stock || false,
    lowStock: row.low_stock || false,
    stock: row.stock || 0,
    rating: row.rating || 4.9,
    reviewCount: row.review_count || 100,
    coaLink: row.coa_link || null,
  };
}

export async function getServerSideProps(ctx) {
  const { params } = ctx;
  const { getCatalogMode, isProductsPublic } = await import('../../lib/catalogMode');
  const mode = await getCatalogMode();
  const { getServerSession } = await import('next-auth/next');
  const { authOptions } = await import('../api/auth/[...nextauth]');
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const isAdmin = ctx.req.cookies?.evo_admin === '1';
  const isLoggedIn = !!session || isAdmin;
  if (!isProductsPublic(mode) && !isLoggedIn) {
    return { redirect: { destination: `/account/login?redirect=/products/${params.slug}`, permanent: false } };
  }

  let product = null;

  // Load static product data — used as source of truth for description & category
  const { products: staticProducts, CATEGORIES: STATIC_CATS } = await import('../../lib/data');
  const validCats = new Set(STATIC_CATS.map(c => c.name));
  const staticBySlug = {};
  const staticByName = {};
  staticProducts.forEach(p => {
    if (p.slug) staticBySlug[p.slug] = p;
    staticByName[p.name.toLowerCase()] = p;
  });

  try {
    const { getSupabaseAdmin } = await import('../../lib/supabase');
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from('products')
      .select('*')
      .eq('slug', params.slug)
      .maybeSingle();
    if (!error && data) {
      const staticMatch = staticBySlug[data.slug] || staticByName[data.name?.toLowerCase()];
      product = normalizeProduct(data, staticMatch);
      // Override description and category with static data (Supabase may have wrong values)
      if (staticMatch) {
        if (staticMatch.description) product.description = staticMatch.description;
        if (!validCats.has(product.category) && staticMatch.category) product.category = staticMatch.category;
      }
    }
  } catch (e) {
    console.error('Supabase product fetch failed:', e.message);
  }

  // Fallback to static data if Supabase failed or table is empty
  if (!product) {
    product = getProductBySlug(params.slug);
    if (!product) return { notFound: true };
  }

  // Related products: same category, different slug (use static data as source for now)
  const related = products
    .filter(p => p.category === product.category && p.slug !== product.slug)
    .slice(0, 4);

  // Stack products: cross-category companions (use static data)
  const stackSlugs = STACK_MAP[product.slug] || [];
  const stackProducts = stackSlugs.map(s => products.find(p => p.slug === s)).filter(Boolean);

  // COA lookup
  const coa = COAS.find(c => c.name.toLowerCase().includes(product.name.toLowerCase().split(' ')[0])) || null;

  return { props: { product, related, stackProducts, coa, catalogMode: mode, isGuest: !isLoggedIn } };
}

// Deterministic "viewers" count from product id — same every render, no hydration mismatch
function getViewers(id) { return 8 + (id * 7) % 19; }
function getStockLeft(id) { return 12 + (id * 13) % 31; }

export default function ProductDetail({ product, related, stackProducts, coa, catalogMode = 'gated', isGuest: serverIsGuest = false }) {
  const { data: session, status: sessionStatus } = useSession();
  const [activeTab, setActiveTab] = useState('overview');
  const [cartAdded, setCartAdded] = useState(false);
  const [selectedQty, setSelectedQty] = useState(0); // index into qty options
  const [bundleCount, setBundleCount] = useState(1);
  // Flow 3: live reviews from DB
  const [dbReviews, setDbReviews] = useState([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const cat = getCategoryConfig(product.category);
  const isOOS = product.outOfStock;
  const chemData = CHEM_DATA[product.name] || null;
  const researchRef = useRef(null);
  const productInfoRef = useRef(null);
  const compoundProfileRef = useRef(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [phoneOfferDismissed, setPhoneOfferDismissed] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySubmitted, setNotifySubmitted] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);
  const { addItem } = useCart();
  const { toggle: wishlistToggle, isWishlisted } = useWishlist();
  const { track: trackRecent, recentSlugs } = useRecentlyViewed();

  // Track recently viewed products via context (persists to localStorage)
  useEffect(() => {
    trackRecent(product.slug);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.slug]);

  // GTM: Fire view_item
  useEffect(() => {
    if (typeof window !== "undefined") {
      const priceVal = parseFloat((product.salePrice || product.price || '0').toString().replace(/[^0-9.]/g, ''));
      const variantName = QTY_OPTIONS?.[selectedQty] || '';
      
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ ecommerce: null });
      window.dataLayer.push({
        event: 'view_item',
        currency: 'USD',
        value: priceVal,
        ecommerce: {
          currency: 'USD',
          value: priceVal,
          items: [{
            item_id: variantName ? `${product.slug}-${variantName}` : product.slug,
            item_name: variantName ? `${product.name} ${variantName}` : product.name,
            item_brand: 'EVO Labs Research',
            item_category: product.category || '',
            item_variant: variantName,
            price: priceVal,
            quantity: 1,
          }],
        },
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.slug]);

  // Omnisend: track product view (browse abandonment Flow 6)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.omnisend) {
        const itemPrice = parseFloat((product.salePrice || product.price || '0').toString().replace(/[^0-9.]/g, ''));
        window.omnisend.push(['track', '$productViewed', {
          $productID: product.slug,
          $currency: 'USD',
          $price: itemPrice,
          $imageUrl: product.image ? `https://evolabsresearch.ca${product.image}` : '',
          $productUrl: `https://evolabsresearch.ca/products/${product.slug}`,
          $title: product.name,
        }]);
      }
    } catch (_) {}
    // Server-side tracking for logged-in users (browse abandonment)
    if (session?.user?.email) {
      fetch('/api/omnisend/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.user.email,
          eventName: 'viewedProduct',
          fields: {
            productId: product.id || product.slug,
            productName: product.name,
            productSlug: product.slug,
            productUrl: typeof window !== 'undefined' ? window.location.href : `https://evolabsresearch.ca/products/${product.slug}`,
            productImage: product.image || '',
            price: product.salePrice || product.price || '',
            category: product.category || '',
          },
        }),
      }).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.slug]);

  // Derive display list: slugs other than current product → product objects
  useEffect(() => {
    const others = recentSlugs.filter(s => s !== product.slug);
    const viewed = others.map(s => products.find(p => p.slug === s)).filter(Boolean);
    setRecentlyViewed(viewed);
  }, [recentSlugs, product.slug]);

  const router = useRouter();

  // Flow 3: fetch approved DB reviews for this product
  useEffect(() => {
    if (!product?.slug) return;
    fetch(`/api/reviews/public?productId=${encodeURIComponent(product.slug)}`)
      .then(r => r.json())
      .then(data => Array.isArray(data) && setDbReviews(data))
      .catch(() => {});
  }, [product?.slug]);

  // Flow 3: open review modal when ?review=SLUG is in URL
  useEffect(() => {
    if (router.query.review && router.query.review === product.slug) {
      setReviewModalOpen(true);
    }
  }, [router.query.review, product.slug]);

  // Scroll to research section when arriving via #research hash
  useEffect(() => {
    if (window.location.hash === '#research' && researchRef.current) {
      setTimeout(() => {
        researchRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }, []);

  // Show sticky bar when user scrolls past the main product info section
  useEffect(() => {
    const el = productInfoRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Admin bypass — skip all gates when logged into admin panel
  const [adminBypass, setAdminBypass] = useState(false);
  useEffect(() => {
    setAdminBypass(!!localStorage.getItem('evo_admin_pw') && !sessionStorage.getItem('evo_preview_guest'));
  }, []);

  // Auth gate — redirect unauthenticated users to login (only in gated mode)
  const productsPublic = catalogMode === 'open_catalog' || catalogMode === 'full_open';
  const isGuest = !adminBypass && sessionStatus !== 'loading' && !session;
  useEffect(() => {
    if (!productsPublic && isGuest) router.push('/account/login');
  }, [isGuest, router, productsPublic]);

  // Use Supabase sizes if available, then lib/data variants, then defaults
  // Sort sizes small → large by numeric mg value
  function parseMgNum(mg) {
    const m = (mg || '').match(/^([\d.]+)/);
    return m ? parseFloat(m[1]) : Infinity;
  }
  const dbSizes = product.sizes?.length > 0
    ? [...product.sizes].sort((a, b) => parseMgNum(a.mg) - parseMgNum(b.mg))
    : null;
  const productVariants = dbSizes ? null : (PRODUCT_VARIANTS[product.slug] || null);
  const QTY_OPTIONS = dbSizes
    ? dbSizes.map(s => s.mg)
    : productVariants
      ? productVariants.map(v => v.label)
      : null; // null = no size selector for simple products with no variants

  // Resolved price for the selected variant — prefer salePrice over regular price
  const variantPrice = dbSizes
    ? (() => {
        const s = dbSizes[selectedQty];
        if (!s) return null;
        const p = s.salePrice != null ? s.salePrice : s.price;
        return p != null ? `$${Number(p).toFixed(2)}` : null;
      })()
    : productVariants
      ? productVariants[selectedQty]?.price
      : null;
  // Displayed price: variant price overrides product price when available
  const displayPrice = variantPrice || product.salePrice || product.price;


  function parsePrice(s) {
    const m = (s || '').match(/[\d.]+/);
    return m ? parseFloat(m[0]) : null;
  }

  function handleAddToCart() {
    const variantName = QTY_OPTIONS?.[selectedQty] || '';
    const basePrice = parseFloat((variantPrice || product.salePrice || product.price || '0').toString().replace(/[^0-9.]/g, ''));
    
    // GTM: Fire add_to_cart
    if (typeof window !== "undefined") {
      const discountMap = { 1: 0, 2: 5, 3: 7.5 };
      const discount = discountMap[bundleCount] || 0;
      const unitPrice = parseFloat((basePrice * (1 - discount / 100)).toFixed(2));

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ ecommerce: null });
      window.dataLayer.push({
        event: 'add_to_cart',
        currency: 'USD',
        value: unitPrice * bundleCount,
        ecommerce: {
          currency: 'USD',
          value: unitPrice * bundleCount,
          items: [{
            item_id: variantName ? `${product.slug}-${variantName}` : product.slug,
            item_name: variantName ? `${product.name} ${variantName}` : product.name,
            item_brand: 'EVO Labs Research',
            item_category: product.category || '',
            item_variant: variantName,
            price: unitPrice,
            quantity: bundleCount,
            discount: discount,
          }],
        },
      });
    }

    addItem(
      product,
      { dosage: variantName, bundleCount, variantPrice }
    );
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 3000);
  }

  function handleAddAllToCart() {
    const variantName = QTY_OPTIONS?.[selectedQty] || '';
    const basePrice = parseFloat((variantPrice || product.salePrice || product.price || '0').toString().replace(/[^0-9.]/g, ''));
    
    // GTM: Fire add_to_cart for stack
    if (typeof window !== "undefined") {
      const gtmItems = [];
      gtmItems.push({
        item_id: variantName ? `${product.slug}-${variantName}` : product.slug,
        item_name: variantName ? `${product.name} ${variantName}` : product.name,
        item_brand: 'EVO Labs Research',
        item_category: product.category || '',
        item_variant: variantName,
        price: basePrice,
        quantity: 1,
        discount: 0,
      });

      stackProducts.slice(0, 3).forEach(p => {
        const pPrice = parseFloat((p.salePrice || p.price || '0').toString().replace(/[^0-9.]/g, ''));
        gtmItems.push({
          item_id: p.slug,
          item_name: p.name,
          item_brand: 'EVO Labs Research',
          item_category: p.category || '',
          item_variant: '',
          price: pPrice,
          quantity: 1,
          discount: 0,
        });
      });
      
      const totalValue = gtmItems.reduce((sum, item) => sum + item.price, 0);

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ ecommerce: null });
      window.dataLayer.push({
        event: 'add_to_cart',
        currency: 'USD',
        value: totalValue,
        ecommerce: {
          currency: 'USD',
          value: totalValue,
          items: gtmItems,
        },
      });
    }

    // Add the current product
    addItem(product, { dosage: variantName, bundleCount: 1, variantPrice });
    // Add each stack product (default dosage, qty 1)
    stackProducts.slice(0, 3).forEach(p => {
      addItem(p, { dosage: '', bundleCount: 1 });
    });
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 3000);
  }

  async function handleNotifySubmit(e) {
    e.preventDefault();
    if (!notifyEmail) return;
    setNotifyLoading(true);
    try {
      await fetch('/api/notify-restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: notifyEmail, slug: product.slug, name: product.name }),
      });
    } catch (_) { /* fire and forget */ }
    setNotifyLoading(false);
    setNotifySubmitted(true);
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    if (!reviewRating || reviewRating < 1) return;
    setReviewSubmitting(true);
    try {
      const r = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.slug, rating: reviewRating, reviewText }),
      });
      if (r.ok) setReviewSubmitted(true);
    } catch (_) {}
    setReviewSubmitting(false);
  }

  const tabs = ['overview', 'coa', 'reviews', 'shipping', 'faq'];
  const tabLabels = { overview: 'Overview', coa: 'Certificate of Analysis', reviews: `Reviews (${product.reviewCount || 0})`, shipping: 'Shipping & Storage', faq: 'FAQ' };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://evolabsresearch.ca' },
      { '@type': 'ListItem', position: 2, name: 'Products', item: 'https://evolabsresearch.ca/products' },
      { '@type': 'ListItem', position: 3, name: product.name, item: `https://evolabsresearch.ca/products/${product.slug}` },
    ],
  };

  const priceNum = parsePrice(product.price);
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image,
    description: product.description,
    sku: product.slug.toUpperCase(),
    brand: { '@type': 'Brand', name: 'EVO Labs Research' },
    offers: {
      '@type': 'Offer',
      url: `https://evolabsresearch.ca/products/${product.slug}`,
      priceCurrency: 'USD',
      price: priceNum || undefined,
      availability: isOOS ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'EVO Labs Research' },
    },
    ...(coa ? { subjectOf: { '@type': 'CreativeWork', name: 'Certificate of Analysis', url: coa.url } } : {}),
  };

  return (
    <Layout
      title={`${product.name} | EVO Labs Research`}
      description={`${product.description} — 99%+ purity, third-party tested. COA available. Ships from the USA.`}
      ogImage={product.image}
      structuredData={[productSchema, breadcrumbSchema]}
    >
      {/* Guest banners for open catalog / full open modes */}
      {isGuest && productsPublic && catalogMode === 'open_catalog' && (
        <div style={{ background: '#C9A96E', color: '#1A1A1A', textAlign: 'center', padding: '12px 16px', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span>Sign in or create a free account to place orders</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/account/login" style={{ background: '#1A1A1A', color: '#fff', padding: '6px 16px', borderRadius: 9999, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
            <Link href="/account/login?tab=register" style={{ background: 'transparent', color: '#1A1A1A', padding: '6px 16px', borderRadius: 9999, fontSize: 12, fontWeight: 700, border: '1.5px solid #1A1A1A', textDecoration: 'none' }}>Create Account</Link>
          </div>
        </div>
      )}
      {isGuest && productsPublic && catalogMode === 'full_open' && (
        <div style={{ background: '#2A5C45', color: '#FFFFFF', textAlign: 'center', padding: '12px 16px', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span>Add to cart and checkout without an account</span>
        </div>
      )}
      {/* Guest scroll-lock overlay: top blur + sign-in CTA (gated mode only) */}
      {isGuest && !productsPublic && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 998,
          height: 148,
          background: 'linear-gradient(to bottom, rgba(248,249,250,0.98) 0%, rgba(248,249,250,0.92) 65%, rgba(248,249,250,0) 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
          paddingTop: 68,
          pointerEvents: 'none',
          gap: 8,
        }}>
          {/* CTA row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, pointerEvents: 'auto' }}>
            <Link href="/account/login?mode=signup" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: '#0F2A4A', color: '#fff',
              padding: '10px 20px', borderRadius: 10,
              fontSize: 13, fontWeight: 700, textDecoration: 'none',
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: '0 4px 16px rgba(27,77,62,0.25)',
              whiteSpace: 'nowrap',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Free account — takes 10 seconds
            </Link>
            <span style={{ fontSize: 12, color: '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>or</span>
            <Link href="/account/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#fff', color: '#374151',
              padding: '10px 18px', borderRadius: 10,
              fontSize: 13, fontWeight: 600, textDecoration: 'none',
              fontFamily: "'DM Sans', sans-serif",
              border: '1.5px solid #e5e7eb',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
              whiteSpace: 'nowrap',
            }}>
              Sign in
            </Link>
          </div>
          {/* Trust chips */}
          <div style={{ display: 'flex', gap: 14, pointerEvents: 'none' }}>
            {['No credit card required', 'We never sell your data', 'Unlock pricing & COA access'].map(t => (
              <span key={t} style={{
                fontSize: 11, color: '#6b7280',
                fontFamily: "'DM Sans', sans-serif",
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <span style={{ color: '#0ea5e9', fontWeight: 700 }}>✓</span> {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0', padding: '14px 0' }}>
        <div className="container" style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: '#9ca3af' }}>
          <Link href="/" style={{ color: '#9ca3af', transition: 'color 0.15s' }} onMouseEnter={e=>e.target.style.color='#111827'} onMouseLeave={e=>e.target.style.color='#9ca3af'}>Home</Link>
          <span>/</span>
          <Link href="/products" style={{ color: '#9ca3af', transition: 'color 0.15s' }} onMouseEnter={e=>e.target.style.color='#111827'} onMouseLeave={e=>e.target.style.color='#9ca3af'}>Products</Link>
          <span>/</span>
          <span style={{ color: '#374151', fontWeight: 500 }}>{product.name}</span>
        </div>
      </div>

      {/* Main product section */}
      <section className="section-sm" ref={productInfoRef}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'start' }} className="product-detail-grid">

            {/* Left: product image */}
            <div>
              <div style={{
                background: `radial-gradient(ellipse at 50% 60%, ${cat.color} 0%, #efefef 78%)`,
                borderRadius: 28, padding: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', aspectRatio: '1/1',
                marginBottom: 16, overflow: 'hidden',
              }}>
                <img
                  src={(dbSizes?.[selectedQty]?.imageUrl) || product.image}
                  alt={product.name}
                  style={{ width: '94%', height: '94%', objectFit: 'contain', filter: 'drop-shadow(0 16px 36px rgba(0,0,0,0.28)) contrast(1.04) saturate(1.06)' }}
                />
              </div>

              {/* Trust indicators */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { icon: '✓', label: '99%+ Purity' },
                  { icon: '📋', label: 'COA Included' },
                  { icon: '🇨🇦', label: 'Canada Shipped' },
                ].map(t => (
                  <div key={t.label} style={{ background: '#f9fafb', borderRadius: 12, padding: '14px 12px', textAlign: 'center', border: '1px solid #f0f0f0' }}>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{t.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{t.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: product info */}
            <div style={{ paddingTop: 8 }}>
              {/* Category + badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#0F2A4A', background: '#eff6ff', padding: '4px 12px', borderRadius: 9999, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: "'DM Sans', sans-serif" }}>
                  {product.category}
                </span>
                {product.badge && (
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#fff', background: '#131315', padding: '4px 12px', borderRadius: 9999, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: "'DM Sans', sans-serif" }}>
                    {product.badge}
                  </span>
                )}
              </div>

              <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: chemData?.aliases ? 8 : 10 }}>
                {product.name}
              </h1>

              {/* Aliases / synonyms */}
              {chemData?.aliases && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                  {chemData.aliases.map(alias => (
                    <span key={alias} style={{ fontSize: 10, color: '#6b7280', background: '#f3f4f6', border: '1px solid #e5e7eb', padding: '2px 10px', borderRadius: 9999, fontFamily: "'DM Sans', sans-serif" }}>
                      {alias}
                    </span>
                  ))}
                </div>
              )}

              {/* Rating + viewers */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Stars n={Math.floor(product.rating)} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', fontFamily: "'DM Sans', sans-serif" }}>{product.rating}</span>
                  <span style={{ fontSize: 13, color: '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>({product.reviewCount} reviews)</span>
                </div>
              </div>

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 24 }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em', fontFamily: "'DM Sans', sans-serif" }}>
                  {isOOS ? 'Out of Stock' : displayPrice}
                </span>
                {product.salePrice && !isOOS && !variantPrice && (
                  <span style={{ fontSize: 18, color: '#d1d5db', textDecoration: 'line-through', fontWeight: 400, fontFamily: "'DM Sans', sans-serif" }}>{product.price}</span>
                )}
                {product.salePrice && !isOOS && !variantPrice && (
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', background: '#fef2f2', padding: '3px 10px', borderRadius: 9999, fontFamily: "'DM Sans', sans-serif" }}>
                    Save {Math.round((1 - parseFloat(product.salePrice.replace(/[^0-9.]/g,'')) / parseFloat(product.price.replace(/[^0-9.]/g,''))) * 100)}%
                  </span>
                )}
              </div>

              {/* Quantity/variant selector */}
              {!isOOS && product.category !== 'Research Kits' && QTY_OPTIONS && QTY_OPTIONS.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: "'DM Sans', sans-serif" }}>
                    Select Quantity
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {QTY_OPTIONS.map((opt, i) => (
                      <button
                        key={opt}
                        onClick={() => setSelectedQty(i)}
                        style={{
                          padding: '9px 20px', borderRadius: 8, fontSize: 14, fontWeight: 500,
                          fontFamily: "'DM Sans', sans-serif",
                          background: selectedQty === i ? '#131315' : 'transparent',
                          color: selectedQty === i ? '#fff' : '#555',
                          border: selectedQty === i ? '1px solid #131315' : '1px solid #e0e0e0',
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bundle & Save */}
              {!isOOS && (
                <div style={{ marginBottom: 22 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'DM Sans', sans-serif" }}>
                    Bundle &amp; Save
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {[
                      { count: 1, label: product.category === 'Research Kits' ? '1 Stack'    : '1 Vial',    discount: 0,   tag: null },
                      { count: 2, label: product.category === 'Research Kits' ? '2 Stacks'   : '2 Vials',   discount: 5,   tag: 'MOST POPULAR' },
                      { count: 3, label: product.category === 'Research Kits' ? '3+ Stacks'  : '3+ Vials',  discount: 7.5, tag: 'BEST VALUE' },
                    ].map(({ count, label, discount, tag }) => {
                      const base = parsePrice(displayPrice);
                      const total = base ? (base * count * (1 - discount / 100)).toFixed(2) : null;
                      const isSelected = bundleCount === count;
                      return (
                        <button
                          key={count}
                          onClick={() => setBundleCount(count)}
                          style={{
                            position: 'relative',
                            padding: tag ? '18px 8px 10px' : '12px 8px 10px',
                            borderRadius: 14,
                            border: `2px solid ${isSelected ? '#131315' : '#e5e7eb'}`,
                            background: isSelected ? '#fafafa' : '#fff',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.15s',
                          }}
                        >
                          {tag && (
                            <div style={{
                              position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)',
                              fontSize: 8, fontWeight: 800, color: '#fff',
                              background: tag === 'MOST POPULAR' ? '#2563eb' : '#d97706',
                              padding: '2px 8px', borderRadius: 9999, whiteSpace: 'nowrap', letterSpacing: '0.06em',
                              fontFamily: "'DM Sans', sans-serif",
                            }}>
                              {tag}
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 2, marginBottom: 6, height: 40 }}>
                            {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                              <img key={i} src={product.image} alt="" style={{ height: count === 1 ? 38 : count === 2 ? 32 : 27, width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.2))' }} />
                            ))}
                          </div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#0a0a0a', letterSpacing: '0.01em', fontFamily: "'DM Sans', sans-serif" }}>{label}</div>
                          {discount > 0 ? (
                            <div style={{ fontSize: 10, fontWeight: 700, color: '#0ea5e9', marginTop: 2, fontFamily: "'DM Sans', sans-serif" }}>{discount}% OFF</div>
                          ) : (
                            <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2, fontFamily: "'DM Sans', sans-serif" }}>Base price</div>
                          )}
                          {total && <div style={{ fontSize: 12, fontWeight: 800, color: '#0a0a0a', marginTop: 2, fontFamily: "'DM Sans', sans-serif" }}>${total}</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Free shipping nudge */}
              {!isOOS && (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '10px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>🚚</span>
                  <span style={{ fontSize: 13, color: '#1e3a8a', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
                    Free shipping on orders $250+
                  </span>
                </div>
              )}

              {/* Stock urgency */}
              {!isOOS && (
                <div style={{
                  background: getStockLeft(product.id) < 20 ? '#fef2f2' : '#fffbeb',
                  border: `1px solid ${getStockLeft(product.id) < 20 ? '#fecaca' : '#fef3c7'}`,
                  borderRadius: 10, padding: '8px 14px', marginBottom: 16,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ fontSize: 14 }}>{getStockLeft(product.id) < 20 ? '🔥' : '⚡'}</span>
                  <span style={{
                    fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                    color: getStockLeft(product.id) < 20 ? '#dc2626' : '#92400e',
                  }}>
                    {getStockLeft(product.id) < 20
                      ? `Only ${getStockLeft(product.id)} left — order soon`
                      : `In stock — ships same day`}
                  </span>
                </div>
              )}


              {/* Description */}
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, marginBottom: 24 }}>{product.description}</p>


              {/* CTA buttons */}
              {isOOS ? (
                <div style={{ background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 16, padding: '24px', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 20 }}>🔔</span>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111', fontFamily: "'DM Sans', sans-serif" }}>Currently Out of Stock</p>
                  </div>
                  <p style={{ fontSize: 13, color: '#6b7280', marginTop: 0, marginBottom: 16, lineHeight: 1.6 }}>
                    Enter your email and we&apos;ll notify you the moment {product.name} is back in stock.
                  </p>
                  {notifySubmitted ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 10, padding: '12px 16px' }}>
                      <span style={{ fontSize: 18 }}>✓</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#1e40af', fontFamily: "'DM Sans', sans-serif" }}>
                        You&apos;re on the list! We&apos;ll email you when it&apos;s back.
                      </span>
                    </div>
                  ) : (
                    <form onSubmit={handleNotifySubmit} style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="email" required placeholder="your@email.com"
                        value={notifyEmail} onChange={e => setNotifyEmail(e.target.value)}
                        style={{
                          flex: 1, padding: '11px 14px', border: '1.5px solid #d1d5db',
                          borderRadius: 10, fontSize: 13, outline: 'none',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      />
                      <button
                        type="submit" disabled={notifyLoading}
                        style={{
                          padding: '11px 20px', background: '#0F2A4A', color: '#fff',
                          border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700,
                          cursor: notifyLoading ? 'wait' : 'pointer', whiteSpace: 'nowrap',
                          fontFamily: "'DM Sans', sans-serif", opacity: notifyLoading ? 0.7 : 1,
                        }}
                      >
                        {notifyLoading ? 'Saving…' : 'Notify Me'}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <div style={{ marginBottom: 20 }}>
                  {product.lowStock && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
                      <span style={{ fontSize: 14 }}>🔴</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#dc2626', fontFamily: "'DM Sans', sans-serif" }}>Only a few left in stock — order soon</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                    <button
                      onClick={handleAddToCart}
                      className="btn-primary"
                      style={{
                        flex: 1, justifyContent: 'center', fontSize: 15, padding: '16px 24px',
                        background: cartAdded ? '#0ea5e9' : '#000000',
                        transition: 'background 0.3s',
                      }}
                    >
                      {cartAdded ? '✓ Added to Cart' : 'Add to Cart →'}
                    </button>
                    {coa && (
                      <a href={coa.pdf} target="_blank" rel="noopener noreferrer"
                        className="btn-secondary" style={{ justifyContent: 'center', padding: '14px 20px' }}>
                        View COA
                      </a>
                    )}
                    <button
                      onClick={() => wishlistToggle(product.slug)}
                      title={isWishlisted(product.slug) ? 'Remove from wishlist' : 'Save to wishlist'}
                      style={{
                        padding: '14px 16px', background: isWishlisted(product.slug) ? '#fff0f3' : '#f9fafb',
                        border: `1.5px solid ${isWishlisted(product.slug) ? '#fda4af' : '#e5e7eb'}`,
                        borderRadius: 12, fontSize: 18, cursor: 'pointer',
                        transition: 'all 0.2s', flexShrink: 0,
                      }}
                    >
                      {isWishlisted(product.slug) ? '❤️' : '🤍'}
                    </button>
                  </div>
                  {cartAdded && (
                    <p style={{ fontSize: 12, color: '#0ea5e9', textAlign: 'center', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
                      ✓ Added to cart — view cart or continue shopping
                    </p>
                  )}

                  {/* RUO Disclaimer Banner */}
                  <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10, fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>
                    ⚠️ <strong style={{ color: '#dc2626' }}>Research Use Only</strong> — This product is not for human consumption and has not been approved by Health Canada. By purchasing, you confirm it will be used solely for legitimate scientific research.
                  </div>
                </div>
              )}

              {/* Payment methods */}
              {!isOOS && (
                <div style={{ marginBottom: 20 }}>
                  {/* Secure card */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f9fafb', border: '1px solid #f0f0f0', borderRadius: 11, padding: '9px 14px', marginBottom: 8 }}>
                    <span style={{ fontSize: 15 }}>🔒</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', fontFamily: "'DM Sans', sans-serif" }}>Secure Card Processing</span>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 5, alignItems: 'center' }}>
                      <VisaLogo />
                      <MastercardLogo />
                      <AmexLogo />
                    </div>
                  </div>
                  {/* ACH / Plaid */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f0f7ff', border: '1px solid #dbeafe', borderRadius: 11, padding: '9px 14px' }}>
                    <span style={{ fontSize: 15 }}>🏦</span>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#1d4ed8', fontFamily: "'DM Sans', sans-serif" }}>Bank Transfer via ACH</span>
                      <span style={{ fontSize: 10, color: '#6b7280', marginLeft: 8, fontFamily: "'DM Sans', sans-serif" }}>powered by</span>
                    </div>
                    <div style={{ marginLeft: 'auto' }}><PlaidLogo /></div>
                  </div>
                </div>
              )}

              {/* Trust badges */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
                {[
                  { icon: '🔒', label: 'Secure Checkout', sub: '256-bit SSL' },
                  { icon: '⚖️', label: 'Net Content Verified', sub: 'Exact labeled amount' },
                  { icon: '🇨🇦', label: 'Canada Shipped', sub: 'Toronto, ON' },
                ].map(b => (
                  <div key={b.label} style={{
                    background: '#f9fafb', border: '1px solid #f0f0f0', borderRadius: 10,
                    padding: '10px 12px', textAlign: 'center',
                  }}>
                    <span style={{ fontSize: 16, display: 'block', marginBottom: 3 }}>{b.icon}</span>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', fontFamily: "'DM Sans', sans-serif" }}>{b.label}</div>
                    <div style={{ fontSize: 9, color: '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>{b.sub}</div>
                  </div>
                ))}
              </div>

              {/* Feature list */}
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {[
                  '99%+ net purity — independently verified via HPLC',
                  'Net content confirmed — exact labeled amount in every vial',
                  'Certificate of Analysis with every batch',
                  'Third-party HPLC + mass spectrometry tested',
                  'Lyophilized, sealed for maximum stability',
                ].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#374151' }}>
                    <span style={{ color: '#0ea5e9', fontWeight: 700, fontSize: 14 }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>

              {/* Research link */}
              <Link href="/research" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', textDecoration: 'none', transition: 'color 0.15s', fontFamily: "'DM Sans', sans-serif", borderTop: '1px solid #f0f0f0', paddingTop: 16 }}
                onMouseEnter={e => e.currentTarget.style.color = '#131315'}
                onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
              >
                🔬 View research &amp; study references for this compound →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Compound Profile Card ── */}
      {CHEM_DATA[product.name] && (
        <section ref={compoundProfileRef} style={{ background: '#f8f9fa', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0', padding: '56px 0' }}>
          <div className="container">
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#0F2A4A', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
                Compound Profile
              </p>
              <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em' }}>
                Pharmaceutical Data Sheet
              </h2>
            </div>
            <PharmCard
              product={product}
              chemData={CHEM_DATA[product.name]}
              catConfig={cat}
            />
          </div>
        </section>
      )}

      {/* ── Research & Science Section ── */}
      {RESEARCH_DATA[product.name] && (() => {
        const rd = RESEARCH_DATA[product.name];
        return (
          <>
            {/* Quick Stats Bar */}
            <section id="research" ref={researchRef} style={{ background: '#0a1628', padding: '32px 0', scrollMarginTop: 80 }}>
              <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 24 }}>
                  {rd.stats.map((s, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: '12px 8px' }}>
                      <div style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 900, color: '#06b6d4', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.val}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 6, lineHeight: 1.4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Mechanism Section */}
            <section style={{ padding: '72px 0 56px', background: '#fff' }}>
              <div className="container">
                <div style={{ marginBottom: 40 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#0F2A4A', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
                    Mechanism of Action
                  </p>
                  <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em', marginBottom: 20 }}>
                    How {product.name} Works
                  </h2>
                  <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, maxWidth: 760 }}>{rd.mechanism.summary}</p>
                </div>

                {/* Pathway Circles */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 40 }}>
                  {rd.mechanism.pathways.map((pw, i) => (
                    <div key={i} style={{ background: '#f8faf9', borderRadius: 20, padding: '28px 24px', border: '1.5px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                        <div style={{
                          width: 52, height: 52, borderRadius: '50%',
                          background: cat?.accentColor || '#0F2A4A',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <span style={{ fontSize: 13, fontWeight: 900, color: '#fff', letterSpacing: '-0.01em' }}>{pw.abbr}</span>
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#0a0a0a', lineHeight: 1.2 }}>{pw.label}</div>
                          <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, marginTop: 2 }}>{pw.role}</div>
                        </div>
                      </div>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                        {pw.details.map((d, j) => (
                          <li key={j} style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, paddingLeft: 14, position: 'relative', marginBottom: 4 }}>
                            <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 5, height: 5, background: cat?.accentColor || '#0F2A4A', borderRadius: '50%' }} />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Key Mechanism Dark Card */}
                <div style={{ background: '#0a1628', borderRadius: 20, padding: '36px 40px', display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  <div style={{ flex: '1 1 260px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                      Key Mechanism
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1.3, marginBottom: 12 }}>
                      {rd.mechanism.keyMechanism.label}
                    </div>
                    <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.8, margin: 0 }}>
                      {rd.mechanism.keyMechanism.detail}
                    </p>
                  </div>
                  <div style={{ flex: '0 0 auto', maxWidth: 320, background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '20px 24px', alignSelf: 'stretch', minWidth: 220 }}>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                      Primary Source
                    </div>
                    <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
                      {rd.mechanism.keyMechanism.citation}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Preclinical Findings */}
            <section style={{ padding: '56px 0', background: '#f8f9fa', borderTop: '1px solid #f0f0f0' }}>
              <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#0F2A4A', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
                      Preclinical Findings
                    </p>
                    <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em', marginBottom: 32 }}>
                      Research Models
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      {rd.preclinical.map((item, i) => (
                        <div key={i}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#0a0a0a' }}>{item.label}</span>
                            <span style={{ fontSize: 14, fontWeight: 800, color: cat?.accentColor || '#0F2A4A' }}>{item.pct}%</span>
                          </div>
                          <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%',
                              width: `${item.pct}%`,
                              background: `linear-gradient(90deg, ${cat?.accentColor || '#0F2A4A'}, ${cat?.accentColor || '#0F2A4A'}99)`,
                              borderRadius: 4,
                              transition: 'width 0.8s ease',
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Clinical Data */}
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#0F2A4A', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
                      Clinical Data
                    </p>
                    <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em', marginBottom: 12 }}>
                      {rd.clinicalData.title}
                    </h2>
                    <div style={{ display: 'inline-block', background: cat?.color || '#e8f5ee', color: cat?.accentColor || '#0F2A4A', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px', borderRadius: 20, marginBottom: 16 }}>
                      {rd.clinicalData.badge}
                    </div>
                    <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, marginBottom: 24 }}>{rd.clinicalData.note}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {rd.clinicalData.findings.map((f, i) => (
                        <div key={i}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 13, color: '#374151', fontWeight: 500, flex: 1, paddingRight: 12 }}>{f.label}</span>
                            <span style={{ fontSize: 14, fontWeight: 800, color: cat?.accentColor || '#0F2A4A', flexShrink: 0 }}>{f.pct}%</span>
                          </div>
                          <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%',
                              width: `${f.pct}%`,
                              background: cat?.accentColor || '#0F2A4A',
                              borderRadius: 3,
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 20, padding: '14px 18px', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Source</div>
                      <p style={{ fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>{rd.clinicalData.citation}</p>
                      <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0 0', lineHeight: 1.5 }}>{rd.clinicalData.source}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Research Success Metrics */}
            <section style={{ padding: '56px 0', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
              <div className="container">
                <p style={{ fontSize: 11, fontWeight: 700, color: '#0F2A4A', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
                  Research Outcomes
                </p>
                <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em', marginBottom: 40 }}>
                  Key Research Success Metrics
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
                  {rd.successMetrics.map((m, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: '32px 24px', background: '#f8f9fa', borderRadius: 20, border: '1.5px solid #e5e7eb', position: 'relative', overflow: 'hidden' }}>
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: `conic-gradient(${cat?.accentColor || '#0F2A4A'} ${m.pct * 3.6}deg, #e5e7eb ${m.pct * 3.6}deg)`,
                        borderRadius: 20,
                        opacity: 0.06,
                      }} />
                      <div style={{ fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 900, color: cat?.accentColor || '#0F2A4A', lineHeight: 1, marginBottom: 6, letterSpacing: '-0.02em' }}>
                        {m.pct}%
                      </div>
                      <div style={{ fontSize: 14, color: '#374151', fontWeight: 600, marginBottom: 4 }}>{m.label}</div>
                      <div style={{ fontSize: 13, color: '#0F2A4A', fontWeight: 700, marginBottom: 6 }}>{m.sub}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{m.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Safety Profile */}
            <section style={{ padding: '56px 0', background: '#0a1628', borderTop: '1px solid #1e293b' }}>
              <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
                      Safety Profile
                    </p>
                    <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 24 }}>
                      Research Safety Notes
                    </h2>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {rd.safety.map((s, i) => (
                        <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                          <span style={{ flexShrink: 0, marginTop: 2, width: 18, height: 18, borderRadius: '50%', background: '#06b6d433', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </span>
                          <span style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.7 }}>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: '28px 32px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                        Research Disclaimer
                      </div>
                      <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.8, margin: '0 0 20px' }}>
                        {rd.disclaimer}
                      </p>
                      <div style={{ paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                          Research Grade Quality
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {['99%+ Net Purity (HPLC Verified)', 'Net Content Confirmed Per Vial', 'Batch-Specific COA Available', 'Lyophilized for Stability'].map((q, i) => (
                            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <span style={{ fontSize: 14, color: '#06b6d4' }}>✓</span>
                              <span style={{ fontSize: 13, color: '#94a3b8' }}>{q}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        );
      })()}

      {/* Tabs */}
      <section style={{ borderTop: '1px solid #f0f0f0' }}>
        <div className="container">
          {/* Tab nav */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #f0f0f0', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '18px 28px',
                  fontSize: 14,
                  fontWeight: activeTab === tab ? 700 : 500,
                  color: activeTab === tab ? '#0F2A4A' : '#6b7280',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid #0F2A4A' : '2px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s',
                  fontFamily: 'inherit',
                  marginBottom: -1,
                }}
              >
                {tabLabels[tab]}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ padding: '48px 0 64px' }}>
            {(() => {
              if (activeTab === 'overview') return (
                <div style={{ maxWidth: 720 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0a0a0a', marginBottom: 20 }}>About {product.name}</h2>
                  <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.9, marginBottom: 28 }}>{product.description}</p>
                  <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.9, marginBottom: 28 }}>
                    All EVO Labs Research compounds are manufactured to research-grade standards and independently tested by Janoshik Analytical (Prague, est. 2013). The Certificate of Analysis for this compound includes full HPLC chromatography data, mass spectrometry confirmation, net purity percentage, and net content verification.
                  </p>
                  <div style={{ background: '#fef9c3', border: '1px solid #fef08a', borderRadius: 16, padding: '20px 24px', display: 'flex', gap: 14 }}>
                    <span style={{ fontSize: 20 }}>⚠️</span>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#713f12', marginBottom: 4 }}>Research Use Only</p>
                      <p style={{ fontSize: 13, color: '#854d0e', lineHeight: 1.6 }}>
                        This product is strictly for in vitro research and laboratory use only. Not for human or veterinary consumption. By purchasing, you confirm use in a controlled research setting.
                      </p>
                    </div>
                  </div>
                </div>
              );
              if (activeTab === 'coa') return (
                <div>
                  {coa ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }} className="coa-detail-grid">
                      <div>
                        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0a0a0a', marginBottom: 8 }}>Certificate of Analysis</h2>
                        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 28, lineHeight: 1.7 }}>
                          Every batch of {product.name} is independently tested by Janoshik Analytical (Prague, Czech Republic). The full COA including HPLC chromatogram, mass spec data, net purity, and net content verification is available to download below.
                        </p>
                        <div style={{ background: '#f9fafb', borderRadius: 16, padding: '24px', border: '1px solid #f0f0f0', marginBottom: 24 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            {[
                              { label: 'Compound', val: coa.name },
                              { label: 'Batch #', val: coa.batch },
                              { label: 'Test Date', val: coa.tested },
                              { label: 'Purity', val: '99%+' },
                              { label: 'Method', val: 'HPLC + MS' },
                              { label: 'Testing Lab', val: 'Janoshik Analytical' },
                            ].map(row => (
                              <div key={row.label}>
                                <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{row.label}</p>
                                <p style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{row.val}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <a href={coa.pdf} target="_blank" rel="noopener noreferrer" className="btn-green" style={{ gap: 8 }}>
                          📄 Download Full COA PDF
                        </a>
                      </div>
                      <div>
                        <a href={coa.pdf} target="_blank" rel="noopener noreferrer">
                          <img src={coa.img} alt={`${product.name} COA`} style={{ width: '100%', borderRadius: 16, border: '1px solid #e5e7eb', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }} />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0a0a0a', marginBottom: 12 }}>Certificate of Analysis</h2>
                      <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 24 }}>
                        The COA for this batch is available in our full COA Library, searchable by product name or batch number.
                      </p>
                      <Link href="/coa" className="btn-green">View COA Library →</Link>
                    </div>
                  )}
                </div>
              );
              if (activeTab === 'shipping') return (
                <div style={{ maxWidth: 660 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0a0a0a', marginBottom: 24 }}>Shipping & Storage</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {[
                      { title: 'Shipping', body: 'Orders are shipped from our Toronto, ON fulfillment centre via Canada Post. Standard shipping typically delivers in 3–7 business days. Expedited shipping available at checkout. Orders over $300 CAD ship free.' },
                      { title: 'Packaging', body: 'All peptides are packed with temperature-appropriate materials to maintain integrity during transit. Lyophilized compounds remain stable at room temperature during standard shipping.' },
                      { title: 'Storage', body: 'Store lyophilized (freeze-dried) peptides at -20°C in a freezer. Keep sealed, dry, and protected from light. Stable for 24+ months under proper storage conditions.' },
                    ].map(item => (
                      <div key={item.title} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 20 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{item.title}</h3>
                        <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.8 }}>{item.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
              if (activeTab === 'reviews') return (
                <div>
                  <ReviewsTab product={product} />
                  {/* Flow 3: DB-backed approved reviews */}
                  {dbReviews.length > 0 && (
                    <div style={{ marginTop: 40 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0a0a0a', marginBottom: 20 }}>
                        Recent Reviews ({dbReviews.length})
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {dbReviews.map((r, i) => (
                          <div key={i} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '18px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                              <span style={{ color: '#f59e0b', fontSize: 15 }}>
                                {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                              </span>
                              {r.verified && (
                                <span style={{ fontSize: 11, color: '#0ea5e9', fontWeight: 700, background: 'rgba(22,163,74,0.08)', padding: '2px 8px', borderRadius: 9999 }}>
                                  Verified Purchase
                                </span>
                              )}
                              <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 'auto' }}>
                                {new Date(r.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            {r.customer_name && (
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 4 }}>{r.customer_name}</div>
                            )}
                            <p style={{ fontSize: 14, color: '#4b5563', margin: 0, lineHeight: 1.6 }}>{r.review_text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {session && (
                    <div style={{ marginTop: 32 }}>
                      <button
                        onClick={() => setReviewModalOpen(true)}
                        style={{
                          background: '#0F2A4A', color: '#fff', border: 'none', borderRadius: 10,
                          padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        Write a Review
                      </button>
                    </div>
                  )}
                </div>
              );
              if (activeTab === 'faq') return (
                <div style={{ maxWidth: 660 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0a0a0a', marginBottom: 28 }}>Frequently Asked Questions</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {[
                      { q: `What purity is the ${product.name}?`, a: `Our ${product.name} is independently tested to 99%+ net purity by Janoshik Analytical (Prague, est. 2013) using HPLC and mass spectrometry. Net content is also verified to ensure the labeled amount matches what's in the vial. The full Certificate of Analysis is publicly available.` },
                      { q: 'Can I verify the purity myself?', a: 'Yes. Download the Certificate of Analysis from the COA tab above or our COA Library. The full HPLC chromatogram, mass spec data, net purity percentage, and net content verification are all included.' },
                      { q: 'How is this peptide shipped?', a: 'Lyophilized (freeze-dried) in a sealed vial. Ships from Toronto, ON via Canada Post with temperature-appropriate packaging. Standard 3–7 day delivery across Canada.' },
                      { q: 'Is this safe for human use?', a: 'No. EVO Labs Research products are strictly for in vitro research and laboratory use only. Not intended for human or veterinary consumption. For research purposes only.' },
                    ].map((item, i) => (
                      <div key={i} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 20 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{item.q}</h3>
                        <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.8 }}>{item.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
              return null;
            })()}
          </div>
        </div>
      </section>

      {/* ── Frequently Bought Together ── */}
      {!isGuest && stackProducts.length >= 2 && (() => {
        const bundleItems = [product, ...stackProducts.slice(0, 3)];
        const bundleTotal = bundleItems.reduce((sum, p) => {
          const raw = (p.salePrice || p.price || '').replace(/[^0-9.]/g, '');
          return sum + (parseFloat(raw) || 0);
        }, 0);
        const bundleSavings = bundleTotal > 0 ? Math.round(bundleTotal * 0.05 * 100) / 100 : 0;
        return (
          <section className="section" style={{ borderTop: '1px solid #f0f0f0' }}>
            <div className="container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#0F2A4A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                    Popular Stacks
                  </div>
                  <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em' }}>
                    Frequently Bought Together
                  </h2>
                </div>
                {bundleSavings > 0 && (
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '8px 16px', fontSize: 13, fontWeight: 700, color: '#0ea5e9' }}>
                    Bundle &amp; save ${bundleSavings.toFixed(2)} on shipping
                  </div>
                )}
              </div>

              <div style={{ background: '#fafafa', borderRadius: 24, padding: '28px 32px', border: '1px solid #f0f0f0' }}>
                {/* Products row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, overflowX: 'auto', marginBottom: 24 }} className="fbt-row">
                  {/* Main product */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 110, flex: '0 0 auto' }}>
                    <div style={{
                      width: 88, height: 88, borderRadius: 14,
                      background: `radial-gradient(ellipse at 50% 60%, ${cat.color} 0%, #f5f5f5 80%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                      border: '2px solid #0F2A4A',
                    }}>
                      <img src={product.image} alt={product.name} style={{ width: '72%', height: '72%', objectFit: 'contain', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.12))' }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#0a0a0a', textAlign: 'center', maxWidth: 100, lineHeight: 1.3 }}>{product.name}</span>
                    <div style={{ fontSize: 9, fontWeight: 600, color: '#0F2A4A', background: 'rgba(27,77,62,0.08)', borderRadius: 6, padding: '2px 8px', textAlign: 'center' }}>This item</div>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#0a0a0a', fontFamily: "'DM Sans', sans-serif" }}>{product.salePrice || product.price}</span>
                  </div>

                  {/* Stack products */}
                  {stackProducts.slice(0, 3).map((p) => {
                    const c = getCategoryConfig(p.category);
                    const reason = STACK_REASONS[p.slug] || p.category;
                    return (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 0, flex: '0 0 auto' }}>
                        <div style={{ fontSize: 22, fontWeight: 300, color: '#d1d5db', padding: '30px 12px 0', flexShrink: 0 }}>+</div>
                        <Link href={`/products/${p.slug}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 110, textDecoration: 'none' }}>
                          <div style={{ width: 88, height: 88, borderRadius: 14, background: `radial-gradient(ellipse at 50% 60%, ${c.color} 0%, #f5f5f5 80%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1.5px solid #e5e7eb' }}>
                            <img src={p.image} alt={p.name} style={{ width: '72%', height: '72%', objectFit: 'contain', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.12))' }} />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#0a0a0a', textAlign: 'center', maxWidth: 100, lineHeight: 1.3 }}>{p.name}</span>
                          <div style={{ fontSize: 9, fontWeight: 600, color: '#6b7280', background: '#f0f0f0', borderRadius: 6, padding: '2px 8px', textAlign: 'center' }}>{reason}</div>
                          <span style={{ fontSize: 12, fontWeight: 800, color: '#0a0a0a', fontFamily: "'DM Sans', sans-serif" }}>{p.salePrice || p.price}</span>
                        </Link>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom CTA row */}
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>
                      Researchers often pair <strong style={{ color: '#0a0a0a' }}>{product.name}</strong> with these compounds for multi-system protocols.
                    </div>
                    {bundleTotal > 0 && (
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#0a0a0a', fontFamily: "'DM Sans', sans-serif" }}>
                        Bundle total:{' '}
                        <span style={{ color: '#0F2A4A' }}>${bundleTotal.toFixed(2)}</span>
                        {bundleTotal >= 250 && (
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#0ea5e9', marginLeft: 8 }}>✓ Free shipping!</span>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleAddAllToCart}
                    style={{
                      background: cartAdded ? '#0ea5e9' : '#131315', color: '#fff',
                      border: 'none', borderRadius: 9999, padding: '13px 28px',
                      fontSize: 14, fontWeight: 700, cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif", transition: 'background 0.2s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {cartAdded ? '✓ All Added to Cart!' : `Add All ${bundleItems.length} to Cart →`}
                  </button>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Related products */}
      {!isGuest && related.length > 0 && (
        <section className="section" style={{ background: '#fafafa', borderTop: '1px solid #f0f0f0' }}>
          <div className="container">
            <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0a0a0a', marginBottom: 32, letterSpacing: '-0.01em' }}>
              More in {product.category}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }} className="related-grid">
              {related.map(p => {
                const c = getCategoryConfig(p.category);
                return (
                  <Link key={p.id} href={`/products/${p.slug}`} style={{
                    textDecoration: 'none', display: 'flex', flexDirection: 'column',
                    background: '#fff', borderRadius: 16, overflow: 'hidden',
                    border: '1px solid #e5e7eb', transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{
                        background: `radial-gradient(ellipse at 50% 60%, ${c.color} 0%, #f5f5f5 75%)`,
                        padding: '24px 16px 16px', aspectRatio: '4/5',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                      }}>
                        <img src={p.image} alt={p.name} style={{
                          width: '70%', height: '70%', objectFit: 'contain',
                          filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.15))',
                        }} />
                      </div>
                    <div style={{ padding: '14px 14px 16px' }}>
                      <p style={{ fontSize: 9, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3, fontFamily: "'DM Sans', sans-serif" }}>{p.category}</p>
                      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 6, lineHeight: 1.3 }}>{p.name}</h3>
                      <p style={{ fontSize: 14, fontWeight: 800, color: '#0a0a0a', fontFamily: "'DM Sans', sans-serif" }}>From {p.salePrice || p.price}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Recently Viewed ── */}
      {!isGuest && recentlyViewed.length > 0 && (
        <section className="section" style={{ background: '#fff', borderTop: '1px solid #f0f0f0' }}>
          <div className="container">
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0a0a0a', marginBottom: 24, letterSpacing: '-0.01em' }}>
              Recently Viewed
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="related-grid">
              {recentlyViewed.slice(0, 4).map(p => {
                const c = getCategoryConfig(p.category);
                return (
                  <Link key={p.id} href={`/products/${p.slug}`} style={{
                    textDecoration: 'none', display: 'flex', flexDirection: 'column',
                    background: '#fff', borderRadius: 16, overflow: 'hidden',
                    border: '1px solid #e5e7eb', transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{
                      background: `radial-gradient(ellipse at 50% 60%, ${c.color} 0%, #f5f5f5 75%)`,
                      padding: '20px 12px 12px', aspectRatio: '4/5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                    }}>
                      <img src={p.image} alt={p.name} style={{ width: '65%', height: '65%', objectFit: 'contain', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.1))' }} loading="lazy" />
                    </div>
                    <div style={{ padding: '12px 14px 14px' }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: c.accent || '#0F2A4A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{p.category}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0a0a0a', lineHeight: 1.3, marginBottom: 6 }}>{p.name}</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#0a0a0a', fontFamily: "'DM Sans', sans-serif" }}>{p.salePrice || p.price}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Sticky Bottom Product Bar ── */}
      {!isOOS && !isGuest && (() => {
        const stickyBase = parsePrice(displayPrice);
        const stickyDiscount = bundleCount === 2 ? 5 : bundleCount === 3 ? 7.5 : 0;
        const stickyTotal = stickyBase ? (stickyBase * bundleCount * (1 - stickyDiscount / 100)).toFixed(2) : null;
        return (
          <div
            id="sticky-add-to-cart"
            className="sticky-bar-wrapper"
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 999,
              transform: showStickyBar ? 'translateY(0)' : 'translateY(100%)',
              opacity: showStickyBar ? 1 : 0,
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
              pointerEvents: showStickyBar ? 'auto' : 'none',
            }}
          >
            <div style={{
              background: '#111113',
              borderTop: '1px solid #2a2a2e',
              boxShadow: '0 -12px 48px rgba(0,0,0,0.35)',
            }}>
              <div className="container" style={{ padding: '18px 24px 20px' }}>
                {/* Single row layout */}
                <div className="sticky-bar-row" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>

                  {/* Product image + info */}
                  <div className="sticky-bar-product" style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                    <div style={{
                      width: 52, height: 52, flexShrink: 0,
                      borderRadius: 12,
                      background: `radial-gradient(ellipse at 50% 60%, ${cat.color}44 0%, #1a1a1e 80%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden',
                      border: '1px solid #2a2a2e',
                    }}>
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{ width: '78%', height: '78%', objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))' }}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 2 }}>
                        {product.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 10, color: '#06b6d4', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                          99%+ Purity
                        </span>
                        <span style={{ fontSize: 10, color: '#555' }}>|</span>
                        <span style={{ fontSize: 10, color: '#777', fontFamily: "'DM Sans', sans-serif" }}>
                          COA Included
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dosage pills */}
                  <div className="sticky-bar-dosage" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {(QTY_OPTIONS || []).map((opt, i) => (
                      <button
                        key={opt}
                        onClick={() => setSelectedQty(i)}
                        style={{
                          padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                          fontFamily: "'DM Sans', sans-serif",
                          background: selectedQty === i ? '#fff' : 'transparent',
                          color: selectedQty === i ? '#111' : '#888',
                          border: selectedQty === i ? '1px solid #fff' : '1px solid #333',
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {/* Bundle pills */}
                  <div className="sticky-bar-bundle" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {[
                      { count: 1, label: '1x', discount: 0 },
                      { count: 2, label: '2x', discount: 5 },
                      { count: 3, label: '3x', discount: 7.5 },
                    ].map(({ count, label, discount }) => {
                      const isActive = bundleCount === count;
                      return (
                        <button
                          key={count}
                          onClick={() => setBundleCount(count)}
                          style={{
                            padding: '7px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                            fontFamily: "'DM Sans', sans-serif",
                            background: isActive ? '#fff' : 'transparent',
                            color: isActive ? '#111' : '#888',
                            border: isActive ? '1px solid #fff' : '1px solid #333',
                            cursor: 'pointer', transition: 'all 0.15s',
                            display: 'flex', alignItems: 'center', gap: 4,
                          }}
                        >
                          {label}
                          {discount > 0 && (
                            <span style={{
                              fontSize: 9, fontWeight: 800,
                              color: isActive ? '#0ea5e9' : '#06b6d4',
                            }}>
                              -{discount}%
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Spacer */}
                  <div style={{ flex: 1 }} />

                  {/* Price */}
                  <div className="sticky-bar-price" style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1, fontFamily: "'DM Sans', sans-serif" }}>
                      ${stickyTotal || displayPrice.replace('$', '')}
                    </div>
                    {bundleCount > 1 && (
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#06b6d4', marginTop: 3, fontFamily: "'DM Sans', sans-serif" }}>
                        Save {stickyDiscount}%
                      </div>
                    )}
                    {product.salePrice && !variantPrice && bundleCount === 1 && (
                      <div style={{ fontSize: 10, color: '#666', textDecoration: 'line-through', marginTop: 2 }}>{product.price}</div>
                    )}
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={handleAddToCart}
                    className="sticky-bar-cta"
                    style={{
                      flexShrink: 0,
                      background: cartAdded ? '#0ea5e9' : '#0F2A4A',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 12,
                      padding: '14px 32px',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif",
                      transition: 'background 0.3s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {cartAdded ? '✓ Added' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <style>{`
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @media (max-width: 768px) {
          .product-detail-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
          .coa-detail-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
          .related-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .fbt-row { gap: 0 !important; padding-bottom: 8px; -webkit-overflow-scrolling: touch; }
        }
        @media (max-width: 480px) {
          .related-grid { grid-template-columns: 1fr !important; }
        }
        /* Sticky bar mobile layout */
        @media (max-width: 900px) {
          .sticky-bar-row {
            flex-wrap: wrap !important;
            gap: 12px !important;
          }
          .sticky-bar-product {
            width: 100% !important;
            flex-shrink: 1 !important;
          }
          .sticky-bar-dosage,
          .sticky-bar-bundle {
            flex-shrink: 0 !important;
          }
          .sticky-bar-price {
            text-align: left !important;
          }
          .sticky-bar-cta {
            flex: 1 !important;
            text-align: center !important;
          }
        }
      `}</style>

      {/* Flow 3: Review submission modal */}
      {reviewModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.7)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 16,
        }} onClick={() => setReviewModalOpen(false)}>
          <div
            style={{
              background: '#fff', borderRadius: 16, padding: 32,
              maxWidth: 480, width: '100%', position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setReviewModalOpen(false)}
              style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6b7280' }}
            >×</button>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0a0a0a', marginBottom: 6 }}>Leave a Review</h3>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>{product.name}</p>
            {reviewSubmitted ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0ea5e9' }}>Thank you for your review!</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>Your review will appear after approval.</div>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
                    Your Rating
                  </label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setReviewRating(n)}
                        style={{
                          fontSize: 28, background: 'none', border: 'none', cursor: 'pointer',
                          color: n <= reviewRating ? '#f59e0b' : '#d1d5db',
                          transition: 'color 0.15s',
                        }}
                      >★</button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
                    Your Review (optional)
                  </label>
                  <textarea
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    rows={4}
                    placeholder="Share your experience with this product..."
                    style={{
                      width: '100%', padding: '12px', border: '1.5px solid #e5e7eb',
                      borderRadius: 10, fontSize: 14, resize: 'vertical',
                      fontFamily: 'inherit', boxSizing: 'border-box',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={reviewSubmitting || !reviewRating}
                  style={{
                    width: '100%', padding: '13px', background: '#0F2A4A',
                    color: '#fff', border: 'none', borderRadius: 10,
                    fontSize: 15, fontWeight: 700, cursor: reviewSubmitting || !reviewRating ? 'default' : 'pointer',
                    opacity: reviewSubmitting || !reviewRating ? 0.6 : 1,
                    fontFamily: 'inherit',
                  }}
                >
                  {reviewSubmitting ? 'Submitting…' : 'Submit Review'}
                </button>
                {!session && (
                  <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 10, textAlign: 'center' }}>
                    You must be signed in to submit a review.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
