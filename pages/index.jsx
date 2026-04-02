import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Layout from '../components/Layout';
import FloatingVials from '../components/FloatingVials';
import { TiltCard, ScrollReveal, Float3D, ParallaxLayer, DepthCard } from '../components/Effects3D';
import { products as STATIC_PRODUCTS, CATEGORIES, REVIEWS, COAS, getCategoryConfig } from '../lib/data';

const FEATURED_SLUGS = ['bpc-157','glp-3-r','hgh-191aa','klow','nad','epithalon','cjc-1295-w-o-dac-ipamorelin','bpc-157-tb-500'];

// Star renderer
function Stars({ n = 5, size = 14 }) {
  return <span style={{ color: '#f59e0b', fontSize: size, letterSpacing: 1 }}>{'★'.repeat(Math.floor(n))}{'☆'.repeat(5 - Math.floor(n))}</span>;
}

// Product card — 3D tilt effect with depth
function ProductCard({ product }) {
  const isOOS = product.outOfStock;
  return (
    <TiltCard intensity={8} scale={1.03} glare style={{ borderRadius: 16, position: 'relative' }}>
      <Link href={`/products/${product.slug}`} className="product-card" style={{ display: 'block', textDecoration: 'none', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
        {/* Image area with white/light background so products are visible */}
        <div className="card-image-wrap" style={{ background: '#fff' }}>
          {product.badge && (
            <span style={{
              position: 'absolute', top: 12, left: 12, zIndex: 3,
              background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
              color: '#fff', fontSize: 9, fontWeight: 700, padding: '5px 12px',
              borderRadius: 9999, letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>{product.badge}</span>
          )}
          {isOOS && (
            <span style={{
              position: 'absolute', top: 12, right: 12, zIndex: 3,
              background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 9, fontWeight: 600,
              padding: '4px 10px', borderRadius: 9999,
            }}>Sold Out</span>
          )}
          <img src={product.image} alt={product.name} loading="lazy" />
          {/* Hover overlay */}
          <div className="card-overlay">
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 4, letterSpacing: '-0.01em' }}>{product.name}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
              <Stars n={product.rating} size={11} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: "'DM Sans', sans-serif" }}>({product.reviewCount})</span>
            </div>
            {!isOOS && (
              <span style={{
                display: 'inline-block', background: '#fff', color: '#0a0a0a',
                fontSize: 12, fontWeight: 700, padding: '8px 18px', borderRadius: 9999,
                fontFamily: "'DM Sans', sans-serif",
              }}>View Research →</span>
            )}
          </div>
        </div>
        {/* Info panel below image */}
        <div style={{ padding: '14px 16px 16px', background: '#141414' }}>
          <span style={{ fontSize: 9, fontWeight: 600, color: '#06b6d4', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
            {product.category}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{product.name}</h3>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#06b6d4', flexShrink: 0, fontFamily: "'DM Sans', sans-serif" }}>
              {isOOS ? <span style={{ color: '#6b7280' }}>Sold Out</span> : product.salePrice || product.price}
            </span>
          </div>
        </div>
      </Link>
    </TiltCard>
  );
}

// Review card — with 3D tilt
function ReviewCard({ review }) {
  return (
    <TiltCard intensity={5} scale={1.01} style={{ borderRadius: 20, height: '100%' }}>
      <div className="review-card" style={{ height: '100%' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
          <Stars />
        </div>
        <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>
          "{review.text}"
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#0F2A4A', flexShrink: 0 }}>
            {review.name[0]}
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{review.name}</p>
            <p style={{ fontSize: 11, color: '#9ca3af' }}>{review.role} · {review.date}</p>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span style={{ fontSize: 10, color: '#9ca3af', background: '#f9fafb', padding: '3px 10px', borderRadius: 100, border: '1px solid #f0f0f0' }}>{review.product}</span>
          </div>
        </div>
      </div>
    </TiltCard>
  );
}

// Quality tab data
const QUALITY_TABS = [
  {
    key: 'potency',
    label: 'Verified Potency',
    icon: '⚗️',
    method: 'HPLC Analysis',
    desc: 'Every vial is tested to confirm it contains exactly what the label says — down to the microgram. No guessing, no rounding. You get the exact concentration you paid for.',
    why: 'Accurate dosing is the foundation of any reliable research protocol.',
    accent: '#0ea5e9',
    bg: '#eff6ff',
  },
  {
    key: 'purity',
    label: '99%+ Purity',
    icon: '🔬',
    method: 'Mass Spectrometry',
    desc: 'Comprehensive mass spec testing confirms our peptides are free from impurities, degradation products, and synthesis byproducts. We guarantee 99%+ purity — or your money back.',
    why: 'Higher purity = better results. Period.',
    accent: '#3b82f6',
    bg: '#eff6ff',
  },
  {
    key: 'stability',
    label: 'Long-Term Stability',
    icon: '🧪',
    method: 'pH & Stability Testing',
    desc: 'Optimal pH and formulation testing ensures your peptides remain effective throughout their entire shelf life — not just when they arrive. Lyophilized and sealed for maximum stability.',
    why: 'Your peptides should work when you need them, not just when they ship.',
    accent: '#a855f7',
    bg: '#fdf4ff',
  },
  {
    key: 'safety',
    label: 'Net Content Conformity',
    icon: '⚖️',
    method: 'Gravimetric Verification',
    desc: 'Precision weighing confirms every vial contains the exact labeled amount. Net content and net purity are verified to ensure what\'s on the label is what\'s in the vial — no short-fills, no discrepancies.',
    why: 'Your preparation calculations depend on accurate labeled content.',
    accent: '#f59e0b',
    bg: '#fffbeb',
  },
  {
    key: 'consistency',
    label: 'Batch Consistency',
    icon: '📋',
    method: 'QC Verification',
    desc: 'Precision weighing and multi-point quality controls ensure every batch meets the same exacting standards. Your 10th order will be identical in quality to your first.',
    why: 'Reproducible research demands reproducible compounds.',
    accent: '#ef4444',
    bg: '#fef2f2',
  },
];

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'OnlineStore'],
  name: 'EVO Labs Research LLC',
  alternateName: 'EVO Labs Research',
  url: 'https://evolabsresearch.ca',
  logo: {
    '@type': 'ImageObject',
    url: 'https://evolabsresearch.ca/images/evo-logo.png',
    width: 400,
    height: 400,
  },
  description: 'EVO Labs Research Canada provides research-grade peptides with 99%+ purity, independently verified by Janoshik Analytical. Every batch includes a full Certificate of Analysis.',
  telephone: '+1-813-555-0100',
  email: 'support@evolabsresearch.ca',
  contactPoint: [
    {
      '@type': 'ContactPoint',
      email: 'support@evolabsresearch.ca',
      contactType: 'customer service',
      availableLanguage: 'English',
      areaServed: 'CA',
    },
  ],
  address: {
    '@type': 'PostalAddress',
    streetAddress: '181 Bay Street',
    addressLocality: 'Toronto',
    addressRegion: 'ON',
    postalCode: 'M5J 2R2',
    addressCountry: 'CA',
  },
  areaServed: {
    '@type': 'Country',
    name: 'Canada',
  },
  sameAs: [
    'https://www.instagram.com/evolabsresearch',
    'https://x.com/evolabsresearch',
  ],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'EVO Labs Research Canada',
  url: 'https://evolabsresearch.ca',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://evolabsresearch.ca/products?search={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function Home({ dbProducts }) {
  // Use live Supabase products when available, fall back to static data
  const products = (dbProducts && dbProducts.length > 0) ? dbProducts : STATIC_PRODUCTS;
  const FEATURED = products.filter(p => FEATURED_SLUGS.includes(p.slug)).slice(0, 8);

  const { data: session } = useSession();
  const [adminBypass, setAdminBypass] = useState(false);
  useEffect(() => {
    setAdminBypass(!!localStorage.getItem('evo_admin_pw') && !sessionStorage.getItem('evo_preview_guest'));
  }, []);

  const [reviewPage, setReviewPage] = useState(0);
  const [activeQuality, setActiveQuality] = useState('potency');
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const reviewsPerPage = 3;
  const totalPages = Math.ceil(REVIEWS.length / reviewsPerPage);
  const visibleReviews = REVIEWS.slice(reviewPage * reviewsPerPage, reviewPage * reviewsPerPage + reviewsPerPage);
  const activeTab = QUALITY_TABS.find(t => t.key === activeQuality);

  return (
    <Layout structuredData={[organizationSchema, websiteSchema]}>
      {/* ════════════════════════════════════════════════════════
          HERO — Full-width centered layout with background vials
      ════════════════════════════════════════════════════════ */}
      <section style={{ background: '#0c1018', overflow: 'hidden', position: 'relative', padding: '120px 0 100px' }}>
        <FloatingVials />

        {/* Gradient orb behind centered text */}
        <div className="hide-mobile" style={{
          position: 'absolute', top: '40%', left: '50%',
          width: 600, height: 600,
          background: 'radial-gradient(circle at 50% 40%, rgba(6,182,212,0.12) 0%, transparent 60%)',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', position: 'relative', zIndex: 2, textAlign: 'center' }}>
          {/* Centered badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: 100, padding: '6px 14px', marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#06b6d4', flexShrink: 0, boxShadow: '0 0 8px rgba(6,182,212,0.8)' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#06b6d4', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              EVO Labs Research — Toronto, ON
            </span>
          </div>

          {/* Centered h1 */}
          <h1 style={{ fontSize: 'clamp(32px, 4.5vw, 64px)', fontWeight: 900, color: '#fff', lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: 24, maxWidth: 900, margin: '0 auto 24px' }}>
            Research-Grade<br />
            Peptides.<br />
            <span style={{ color: '#06b6d4' }}>Zero Compromise.</span>
          </h1>

          {/* Centered subtitle */}
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, maxWidth: 520, marginBottom: 36, margin: '0 auto 36px' }}>
            Every compound independently tested by Janoshik Analytical.
            99%+ purity. COA for every batch. For research use only.
          </p>

          {/* Centered CTA buttons */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40, justifyContent: 'center' }}>
            <Link href={session ? "/products" : "/account/login"} style={{
              background: '#fff', color: '#0c1018',
              padding: '15px 32px', borderRadius: 9999,
              fontSize: 15, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
              display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none',
              transition: 'background 0.2s, transform 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e5e7eb'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'none'; }}
            >
              Shop All Peptides →
            </Link>
            <Link href="/coa" style={{
              background: 'transparent', color: 'rgba(255,255,255,0.75)',
              padding: '14px 28px', borderRadius: 9999,
              fontSize: 14, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
              border: '1px solid rgba(255,255,255,0.2)', textDecoration: 'none',
              transition: 'border-color 0.2s, color 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
            >
              View COA Library
            </Link>
          </div>

          {/* Horizontal stats row */}
          <div className="hero-stats" style={{ display: 'flex', gap: 48, flexWrap: 'wrap', justifyContent: 'center', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              { val: '99%+', label: 'Purity Guaranteed' },
              { val: '3rd Party', label: 'Lab Tested' },
              { val: 'Same Day', label: 'Fulfillment' },
              { val: 'Discreet', label: 'Packaging' },
            ].map(s => (
              <div key={s.val} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{s.val}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          TRUST BAR — icons + text, full-width
      ════════════════════════════════════════════════════════ */}
      <section style={{ background: '#0f1520', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '18px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'center', gap: 0, flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            {
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
              text: '99%+ Purity Guaranteed',
            },
            {
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
              text: 'Third-Party Lab Tested',
            },
            {
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
              text: 'COA With Every Order',
            },
            {
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
              text: 'Same-Day Fulfillment',
            },
            {
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
              text: 'For Research Use Only',
            },
          ].map((item, i) => (
            <div key={item.text} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 20px',
              borderRight: i < 4 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}>
              <span style={{ color: '#06b6d4', display: 'flex', alignItems: 'center', flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          THE EVO LABS GUARANTEE
      ════════════════════════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <ScrollReveal type="up" delay={0}>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0F2A4A', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                Our Promise
              </div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em' }}>
                The EVO Labs Guarantee
              </h2>
              <p style={{ fontSize: 15, color: '#6b7280', marginTop: 12, maxWidth: 480, margin: '12px auto 0' }}>
                We don't compromise on quality. Every product meets the highest standards — or your money back.
              </p>
            </div>
          </ScrollReveal>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gridTemplateRows: 'auto auto', gap: 20 }} className="guarantee-grid">
            {[
              {
                icon: '🔬',
                title: '99%+ Purity Guaranteed',
                subtitle: 'Or your money back',
                desc: 'Every batch is independently verified by Janoshik Analytical via HPLC and mass spectrometry. No compromises — ever.',
                bg: '#eff6ff',
                accent: '#0F2A4A',
                iconBg: '#dbeafe',
                bento: { gridRow: '1 / 3' },
              },
              {
                icon: '📦',
                title: 'Free Shipment Protection',
                subtitle: 'Every order fully covered',
                desc: 'Every order ships with full protection. If your package is lost, damaged, or stolen in transit — we reship it at no cost to you.',
                bg: '#eff6ff',
                accent: '#1d4ed8',
                iconBg: '#dbeafe',
                bento: {},
              },
              {
                icon: '📋',
                title: 'COA With Every Order',
                subtitle: 'Independently verified by Janoshik Analytical',
                desc: 'Full Certificate of Analysis included with every batch. HPLC chromatograms and mass spec data published publicly — before you ever order.',
                bg: '#fdf4ff',
                accent: '#7c3aed',
                iconBg: '#ede9fe',
                bento: {},
              },
            ].map((g, i) => (
              <ScrollReveal key={i} type="up" delay={i * 0.15}>
                <TiltCard intensity={6} scale={1.02} glare style={{ borderRadius: 24, height: '100%', ...g.bento }}>
                  <div style={{
                    background: g.bg, borderRadius: 24, padding: '36px 32px',
                    border: '1px solid rgba(0,0,0,0.04)',
                    height: '100%',
                  }}>
                    <div style={{ width: 64, height: 64, borderRadius: 20, background: g.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, marginBottom: 24, transform: 'translateZ(30px)', transition: 'transform 0.3s' }}>
                      {g.icon}
                    </div>
                    <h3 style={{ fontSize: 19, fontWeight: 800, color: '#0a0a0a', marginBottom: 6, lineHeight: 1.2 }}>{g.title}</h3>
                    <p style={{ fontSize: 12, fontWeight: 700, color: g.accent, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>{g.subtitle}</p>
                    <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.8 }}>{g.desc}</p>
                  </div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FEATURED PRODUCTS — members only
      ════════════════════════════════════════════════════════ */}
      {(session || adminBypass) ? (
        <section className="section" style={{ background: '#0a0c10', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
                  Top Research Compounds
                </div>
                <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  Best Selling Peptides
                </h2>
              </div>
              <Link href={session ? "/products" : "/account/login"} style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 9999, padding: '8px 18px', transition: 'border-color 0.2s, color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
              >
                View All Products →
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }} className="products-grid">
              {FEATURED.slice(0, 6).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      ) : (
        <section style={{ background: '#0a0c10', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '80px 0' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: '50%', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', marginBottom: 28 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Members Only</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 16, lineHeight: 1.1 }}>
              Sign in to View Our Catalog
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', maxWidth: 440, margin: '0 auto 36px', lineHeight: 1.75 }}>
              Access to our research peptide catalog is restricted to verified researchers. Create a free account to browse products, view COAs, and place orders.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
              <Link href="/account/login?mode=signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#06b6d4', color: '#0a0a0a', padding: '14px 32px', borderRadius: 100, fontSize: 15, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                Free account — takes 10 seconds
              </Link>
              <Link href="/account/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', padding: '14px 28px', borderRadius: 100, fontSize: 14, fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>
                Sign in →
              </Link>
            </div>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['No credit card required', 'We never sell your data', 'Unlock pricing & COA access'].map(t => (
                <span key={t} style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ color: '#06b6d4', fontWeight: 700 }}>✓</span> {t}
                </span>
              ))}
            </div>
            {/* Placeholder grid to hint at structure without revealing products */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 56, opacity: 0.18, pointerEvents: 'none' }} className="products-grid">
              {[0,1,2,3,4,5,6,7].map(i => (
                <div key={i} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ background: 'rgba(255,255,255,0.04)', height: 180 }} />
                  <div style={{ padding: '14px 16px', background: '#141414' }}>
                    <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.15)', marginBottom: 10, width: '40%' }} />
                    <div style={{ height: 12, borderRadius: 4, background: 'rgba(255,255,255,0.2)', width: '70%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════
          QUALITY VERIFICATION — TABBED
      ════════════════════════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <ScrollReveal type="up" delay={0}>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0F2A4A', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                Proof Over Promises
              </div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Quality You Can Verify,<br />Not Just Trust
              </h2>
              <p style={{ fontSize: 15, color: '#6b7280', marginTop: 16, maxWidth: 520, margin: '16px auto 0', lineHeight: 1.7 }}>
                Every batch undergoes independent quality checks at Janoshik Analytical (Prague, est. 2013). We give you the data — you verify the results.
              </p>
            </div>
          </ScrollReveal>

          {/* Stats bar */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap', marginBottom: 48, padding: '24px', background: '#0a0a0a', borderRadius: 20 }}>
            {[
              { val: '99%+', label: 'Purity Guaranteed' },
              { val: '5', label: 'Quality Checks' },
              { val: '100%', label: 'Canada Verified' },
            ].map(s => (
              <div key={s.val} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#06b6d4', letterSpacing: '-0.02em' }}>{s.val}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
            {QUALITY_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveQuality(tab.key)}
                style={{
                  padding: '10px 20px', borderRadius: 100, fontSize: 13, fontWeight: 600,
                  border: activeQuality === tab.key ? `2px solid ${tab.accent}` : '2px solid #e5e7eb',
                  background: activeQuality === tab.key ? tab.bg : '#fff',
                  color: activeQuality === tab.key ? tab.accent : '#374151',
                  cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Active tab content */}
          {activeTab && (
            <div style={{
              background: activeTab.bg, borderRadius: 28, padding: '48px 52px',
              border: `1px solid ${activeTab.accent}20`,
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center',
            }} className="quality-tab-content">
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: activeTab.accent, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                  {activeTab.method}
                </div>
                <h3 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em', marginBottom: 20, lineHeight: 1.1 }}>
                  {activeTab.label}
                </h3>
                <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8, marginBottom: 24 }}>{activeTab.desc}</p>
                <div style={{ background: '#fff', borderRadius: 16, padding: '18px 22px', border: `1px solid ${activeTab.accent}30` }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: activeTab.accent, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Why it matters</p>
                  <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{activeTab.why}</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                {/* Professional vial illustration instead of emoji */}
                <div style={{
                  width: 180, height: 180, borderRadius: 24,
                  background: `linear-gradient(135deg, ${activeTab.bg}, #fff)`,
                  border: `1px solid ${activeTab.accent}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', overflow: 'hidden',
                }}>
                  {/* Product vial image */}
                  <img
                    src="/images/products/catalog/BPC-157 10MG.png"
                    alt="Research-grade peptide vial"
                    style={{ width: 120, height: 120, objectFit: 'contain', filter: `drop-shadow(0 8px 24px ${activeTab.accent}30)` }}
                  />
                  {/* Verified badge overlay */}
                  <div style={{
                    position: 'absolute', bottom: 12, right: 12,
                    background: activeTab.accent, color: '#fff',
                    borderRadius: 8, padding: '4px 10px',
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, verticalAlign: 'middle' }}><polyline points="20 6 9 17 4 12"/></svg>
                    VERIFIED
                  </div>
                </div>
                <Link href="/coa" style={{
                  display: 'block', textAlign: 'center', background: activeTab.accent, color: '#fff',
                  padding: '14px 28px', borderRadius: 100, fontSize: 14, fontWeight: 700,
                  textDecoration: 'none', transition: 'opacity 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  View COA Library →
                </Link>
                <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af' }}>
                  33+ compounds, 33+ COAs published. Publicly accessible, always.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          WHY EVO LABS — FEATURE CARDS
      ════════════════════════════════════════════════════════ */}
      <section className="section" style={{ background: '#0a0a0a' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#06b6d4', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
              Why Choose EVO Labs
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              The EVO Standard
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }} className="features-grid">
            {[
              {
                icon: '🔬',
                title: '99%+ Purity, Every Batch',
                desc: 'Every compound independently tested via HPLC and mass spectrometry. Full COA published before any product is listed.',
                accent: '#0ea5e9',
                bg: '#141414',
                layout: { gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center', padding: '48px 40px' },
              },
              {
                icon: '📦',
                title: 'Always in Stock',
                desc: 'Top peptides like BPC-157, GLP-3(R), and HGH 191aa ready to ship. No backorders, no waiting.',
                accent: '#3b82f6',
                bg: '#141414',
              },
              {
                icon: '💰',
                title: 'Volume Discounts',
                desc: 'Save on bulk orders with our multi-vial sets. The more you research, the more you save — up to 25% off.',
                accent: '#f59e0b',
                bg: '#141414',
              },
              {
                icon: '🇨🇦',
                title: 'Canada-Based & Shipped',
                desc: 'All products stored and shipped from Toronto, ON. 100% domestic supply chain. No overseas sourcing — ever.',
                accent: '#ef4444',
                bg: '#141414',
              },
              {
                icon: '🧪',
                title: '3rd-Party Verified',
                desc: 'We never self-certify. Janoshik Analytical — independent, no financial stake — runs every test. Period.',
                accent: '#a855f7',
                bg: '#141414',
              },
              {
                icon: '⚡',
                title: 'Fast, Discreet Shipping',
                desc: 'Cold-pack shipping where needed. Discreet, unlabeled packaging on every order. Full tracking included.',
                accent: '#06b6d4',
                bg: '#141414',
              },
            ].map((f, i) => (
              <ScrollReveal key={i} type="up" delay={i * 0.1}>
                <TiltCard intensity={7} scale={1.02} style={{ borderRadius: 20, height: '100%' }}>
                  {i === 0 ? (
                    <div style={{
                      background: f.bg, borderRadius: 20,
                      border: '1px solid #1a1a1a',
                      transition: 'background 0.2s, border-color 0.2s',
                      height: '100%',
                      ...f.layout,
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.borderColor = `${f.accent}30`; }}
                      onMouseLeave={e => { e.currentTarget.style.background = f.bg; e.currentTarget.style.borderColor = '#1a1a1a'; }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                        <div style={{ width: 52, height: 52, borderRadius: 16, background: `${f.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 20 }}>
                          {f.icon}
                        </div>
                        <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 12 }}>{f.title}</h3>
                        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75 }}>{f.desc}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 180, height: 180, borderRadius: 16, background: `${f.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 72 }}>{f.icon}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      background: f.bg, padding: '36px 32px', borderRadius: 20,
                      border: '1px solid #1a1a1a',
                      transition: 'background 0.2s, border-color 0.2s',
                      height: '100%',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.borderColor = `${f.accent}30`; }}
                      onMouseLeave={e => { e.currentTarget.style.background = f.bg; e.currentTarget.style.borderColor = '#1a1a1a'; }}
                    >
                      <div style={{ width: 52, height: 52, borderRadius: 16, background: `${f.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 20 }}>
                        {f.icon}
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 10 }}>{f.title}</h3>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.75 }}>{f.desc}</p>
                    </div>
                  )}
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          COMPETITOR COMPARISON
      ════════════════════════════════════════════════════════ */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0F2A4A', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
              How We Compare
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Why Researchers Choose EVO Labs
            </h2>
            <p style={{ fontSize: 15, color: '#6b7280', maxWidth: 520, margin: '16px auto 0', lineHeight: 1.7 }}>
              We built this company to do things the right way. Here's how we stack up against the alternatives.
            </p>
          </div>

          {/* Comparison table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: 640 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', width: '40%' }}>Feature</th>
                  {[
                    { name: 'EVO Labs', highlight: true },
                    { name: 'Other Peptide Co.', highlight: false },
                    { name: 'Gray Market Sources', highlight: false },
                  ].map(col => (
                    <th key={col.name} style={{
                      textAlign: 'center', padding: '16px 20px',
                      fontSize: 13, fontWeight: 800,
                      color: col.highlight ? '#fff' : '#374151',
                      background: col.highlight ? '#0F2A4A' : '#f9fafb',
                      borderRadius: col.highlight ? '12px 12px 0 0' : 0,
                      borderTop: col.highlight ? 'none' : '1px solid #f0f0f0',
                      borderLeft: col.highlight ? 'none' : '1px solid #f0f0f0',
                      borderRight: col.highlight ? 'none' : '1px solid #f0f0f0',
                    }}>
                      {col.name}
                      {col.highlight && (
                        <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', marginTop: 2 }}>★ RECOMMENDED</div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Independent 3rd-Party COA', evo: '✓ Janoshik Analytical', other: '✓ Some provide', gray: '— Rarely provided' },
                  { feature: 'Minimum 99%+ Purity Guarantee', evo: '✓ Every batch', other: '— Variable quality', gray: '— Unverified' },
                  { feature: 'Canada-Based & Shipped', evo: '✓ Toronto, ON', other: '✓ Some are Canada-based', gray: '— Often overseas' },
                  { feature: 'Free Shipping Threshold', evo: '✓ $300+ CAD', other: '— Rarely offered', gray: '— Unknown' },
                  { feature: 'Loyalty & Rewards Program', evo: '✓ Points + tiers', other: '— None', gray: '— None' },
                  { feature: 'Live Chat Support', evo: '✓ AI-powered', other: '— None', gray: '— None' },
                  { feature: 'Wholesale / Bulk Pricing', evo: '✓ 3 tiers', other: '— None', gray: '— None' },
                  { feature: 'Order Tracking Page', evo: '✓ Real-time', other: '— Email only', gray: '— None' },
                ].map((row, i) => {
                  const isLast = i === 7;
                  const cellBase = {
                    padding: '15px 20px', fontSize: 13, borderBottom: isLast ? 'none' : '1px solid #f0f0f0',
                    verticalAlign: 'middle',
                  };
                  const evoPositive = row.evo.startsWith('✓');
                  return (
                    <tr key={i}>
                      <td style={{ ...cellBase, paddingLeft: 24, fontWeight: 600, color: '#374151' }}>{row.feature}</td>
                      <td style={{
                        ...cellBase,
                        textAlign: 'center', fontWeight: 700,
                        color: evoPositive ? '#16a34a' : '#9ca3af',
                        background: 'rgba(15,42,74,0.04)',
                        borderLeft: '1.5px solid rgba(15,42,74,0.15)',
                        borderRight: '1.5px solid rgba(15,42,74,0.15)',
                        borderBottom: isLast ? '1.5px solid rgba(15,42,74,0.15)' : '1px solid rgba(15,42,74,0.08)',
                      }}>
                        {row.evo}
                      </td>
                      <td style={{ ...cellBase, textAlign: 'center', color: row.other.startsWith('✓') ? '#374151' : '#9ca3af', background: '#f9fafb', borderLeft: '1px solid #f0f0f0', borderRight: '1px solid #f0f0f0' }}>{row.other}</td>
                      <td style={{ ...cellBase, textAlign: 'center', color: row.gray.startsWith('✓') ? '#374151' : '#9ca3af', background: '#f9fafb', borderLeft: '1px solid #f0f0f0', borderRight: '1px solid #f0f0f0' }}>{row.gray}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <Link href={session ? "/products" : "/account/login"} className="btn-green" style={{ padding: '14px 36px' }}>
              Shop EVO Labs Now →
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          REVIEWS
      ════════════════════════════════════════════════════════ */}
      <section className="section" style={{ background: '#fafafa' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0F2A4A', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
              Researcher Reviews
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 16 }}>
              What Scientists Are Saying
            </h2>
            {/* Aggregate rating display */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <Stars />
              <span style={{ fontSize: 20, fontWeight: 800, color: '#0a0a0a' }}>4.9</span>
              <span style={{ fontSize: 14, color: '#9ca3af' }}>from 2,000+ verified researchers</span>
            </div>
          </div>

          {/* Review grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 36 }} className="reviews-grid">
            {visibleReviews.map((r, i) => <ReviewCard key={i} review={r} />)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setReviewPage(i)} style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: i === reviewPage ? '#0F2A4A' : '#d1d5db',
                  border: 'none', cursor: 'pointer', transition: 'background 0.2s',
                }} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          SHOP BY CATEGORY — only visible when logged in
      ════════════════════════════════════════════════════════ */}
      {session && <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0F2A4A', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                Browse by Category
              </div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em' }}>
                Shop by Research Goal
              </h2>
            </div>
            <Link href={session ? "/products" : "/account/login"} style={{ fontSize: 14, fontWeight: 600, color: '#0F2A4A', textDecoration: 'none', borderBottom: '1px solid #0F2A4A', paddingBottom: 2 }}>
              View all 48 compounds →
            </Link>
          </div>

          {/* Masonry-style 2-row layout with varying widths */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16, marginBottom: 16 }} className="cat-featured-grid">
            {CATEGORIES.slice(0, 3).map((cat, i) => {
              const catProductCount = products.filter(p => p.category === cat.name).length;
              const GOAL_LABELS = [
                'Growth Hormone Research',
                'Metabolic & GLP-1',
                'Healing & Regeneration',
              ];
              const isLarge = i === 0;
              return (
                <Link
                  key={cat.slug}
                  href={session ? `/products?category=${encodeURIComponent(cat.name)}` : '/account/login'}
                  className="cat-card"
                  style={{
                    background: `radial-gradient(ellipse at 50% 80%, ${cat.color} 0%, #f9f9f9 100%)`,
                    padding: isLarge ? '36px 32px 28px' : '28px 20px 20px',
                    display: 'flex', flexDirection: 'column', gap: 0,
                    border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {/* Lock icon for unauthenticated users, product image for authenticated */}
                  <div style={{
                    display: 'flex', justifyContent: isLarge ? 'flex-start' : 'center',
                    marginBottom: isLarge ? 20 : 12,
                  }}>
                    {session ? (
                      (() => {
                        const catProducts = products.filter(p => p.category === cat.name);
                        const hero = catProducts[0];
                        return hero ? (
                          <img
                            src={hero.image}
                            alt={hero.name}
                            style={{ height: isLarge ? 140 : 80, objectFit: 'contain', filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.15))' }}
                            loading="lazy"
                          />
                        ) : null;
                      })()
                    ) : (
                      <div style={{ width: isLarge ? 140 : 80, height: isLarge ? 140 : 80, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.05)', borderRadius: '50%' }}>
                        <svg width={isLarge ? 36 : 24} height={isLarge ? 36 : 24} viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
                    {catProductCount} compounds
                  </div>
                  <h3 style={{ fontSize: isLarge ? 20 : 14, fontWeight: 800, color: '#0a0a0a', lineHeight: 1.25, marginBottom: 6 }}>
                    {GOAL_LABELS[i]}
                  </h3>
                  <p style={{ fontSize: isLarge ? 13 : 11, color: '#6b7280', lineHeight: 1.6, marginBottom: 16 }}>
                    {cat.name}
                  </p>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 12, fontWeight: 700, color: '#131315',
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    Shop {cat.name.split(' ')[0]} →
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Second row — remaining categories */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="category-grid">
            {CATEGORIES.slice(3).map(cat => {
              const count = products.filter(p => p.category === cat.name).length;
              return (
                <Link
                  key={cat.slug}
                  href={session ? `/products?category=${encodeURIComponent(cat.name)}` : '/account/login'}
                  className="cat-card"
                  style={{ background: cat.color, padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 14, border: '1px solid rgba(0,0,0,0.05)' }}
                >
                  <span style={{ fontSize: 28, flexShrink: 0 }}>{cat.icon}</span>
                  <div>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0a0a0a', marginBottom: 3, lineHeight: 1.3 }}>{cat.name}</h3>
                    <p style={{ fontSize: 11, color: '#6b7280', fontFamily: "'DM Sans', sans-serif" }}>{count} compounds →</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>}

      {/* ════════════════════════════════════════════════════════
          COA PREVIEW STRIP — only visible when logged in
      ════════════════════════════════════════════════════════ */}
      {session && <section className="section-sm" style={{ background: '#f8fafc', borderTop: '1px solid #f0f0f0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em' }}>
                Certificate of Analysis Library
              </h2>
              <p style={{ fontSize: 14, color: '#6b7280', marginTop: 6 }}>
                Every batch independently tested. Full HPLC + mass spec reports — publicly available, always.
              </p>
            </div>
            <Link href="/coa" className="btn-green">
              View All COAs →
            </Link>
          </div>

          {/* COA preview: first 8 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 12 }} className="coa-preview-grid">
            {COAS.slice(0, 8).map((coa, i) => {
              const matchedProduct = products.find(p => p.name === coa.name || p.name.includes(coa.name.split('-')[0].trim()));
              return (
                <a key={i} href={coa.pdf} target="_blank" rel="noopener noreferrer" className="coa-card">
                  <div style={{ background: '#f8fafc', aspectRatio: '3/4', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', padding: 16 }}>
                    {matchedProduct ? (
                      <img src={matchedProduct.image} alt={coa.name} style={{ width: '80%', height: '80%', objectFit: 'contain' }} loading="lazy" />
                    ) : (
                      <img src={coa.img} alt={coa.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    )}
                    <div style={{
                      position: 'absolute', bottom: 6, right: 6,
                      background: '#0F2A4A', color: '#fff',
                      borderRadius: 4, padding: '2px 6px',
                      fontSize: 8, fontWeight: 700, letterSpacing: '0.05em',
                      fontFamily: "'DM Sans', sans-serif",
                    }}>COA</div>
                  </div>
                  <div style={{ padding: '10px 10px 12px' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>{coa.name}</p>
                    <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 3 }}>Batch {coa.batch}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>}

      {/* ════════════════════════════════════════════════════════
          BRAND PROMISE SPLIT
      ════════════════════════════════════════════════════════ */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="brand-split">
            {/* Left: large text */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0F2A4A', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
                Our Commitment
              </div>
              <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em', lineHeight: 1.05, marginBottom: 24 }}>
                We Never Sell<br />
                a Peptide Without<br />
                <span style={{ color: '#0F2A4A' }}>Proof of Purity.</span>
              </h2>
              <p style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.8, marginBottom: 36 }}>
                Every compound we carry has been independently tested by Janoshik Analytical (Prague, est. 2013) — one of the most trusted independent labs in the research compound industry. We publish the Certificate of Analysis — HPLC chromatograms, mass spec data, and purity percentage — before any product is made available for purchase.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <Link href="/coa" className="btn-green">View COA Library</Link>
                <Link href="/about" className="btn-secondary">Our Story</Link>
              </div>
            </div>

            {/* Right: stats cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { val: '99%+',   label: 'Average Purity',      bg: '#eff6ff', accent: '#0F2A4A' },
                { val: '100%',   label: 'Batches Tested',       bg: '#eff6ff', accent: '#2563eb' },
                { val: 'Same Day', label: 'Fulfillment',        bg: '#fdf4ff', accent: '#7c3aed' },
                { val: 'Free',   label: 'Shipping $300+ CAD',    bg: '#fff7ed', accent: '#ea580c' },
              ].map(s => (
                <div key={s.val} style={{ background: s.bg, borderRadius: 20, padding: '32px 24px' }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: s.accent, letterSpacing: '-0.02em', marginBottom: 8 }}>{s.val}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          NEWSLETTER
      ════════════════════════════════════════════════════════ */}
      <section style={{ background: '#0a0a0a', padding: '72px 0', borderTop: '1px solid #1a1a1a' }}>
        <div className="container">
          <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#06b6d4', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
              Stay Updated
            </div>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 14 }}>
              Research Updates & Member Pricing
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 32 }}>
              Subscribe for exclusive deals, new compound announcements, and member-only pricing. Join 5,000+ researchers.
            </p>
            {emailSubmitted ? (
              <div style={{ background: '#0F2A4A', borderRadius: 16, padding: '20px 28px', color: '#fff' }}>
                <p style={{ fontWeight: 700, fontSize: 16 }}>✓ You're on the list!</p>
                <p style={{ fontSize: 13, opacity: 0.7, marginTop: 6 }}>We'll be in touch with research updates and exclusive offers.</p>
              </div>
            ) : (
              <form onSubmit={async e => {
                e.preventDefault();
                setEmailLoading(true);
                try {
                  await fetch('/api/newsletter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                  });
                } catch { /* non-blocking */ }
                setEmailLoading(false);
                setEmailSubmitted(true);
              }} style={{ display: 'flex', gap: 10, maxWidth: 440, margin: '0 auto' }} className="newsletter-form">
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={emailLoading}
                  style={{
                    flex: 1, padding: '13px 20px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 14,
                    outline: 'none', fontFamily: 'inherit',
                  }}
                />
                <button type="submit" disabled={emailLoading} style={{
                  background: '#0F2A4A', color: '#fff', border: 'none', borderRadius: 100,
                  padding: '13px 24px', fontSize: 14, fontWeight: 700, cursor: emailLoading ? 'default' : 'pointer',
                  whiteSpace: 'nowrap', transition: 'background 0.15s', opacity: emailLoading ? 0.7 : 1,
                }}
                  onMouseEnter={e => { if (!emailLoading) e.currentTarget.style.background = '#16a34a'; }}
                  onMouseLeave={e => e.currentTarget.style.background = '#0F2A4A'}
                >
                  {emailLoading ? '…' : 'Subscribe'}
                </button>
              </form>
            )}
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 16 }}>No spam. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          RESEARCH STACKS PROMO — only visible when logged in
      ════════════════════════════════════════════════════════ */}
      {session && <section style={{ background: '#fff', padding: '80px 0', borderTop: '1px solid #f0f0f0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0F2A4A', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
              Curated Protocols
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em', marginBottom: 14 }}>
              Research Stacks — Save Up to 25%
            </h2>
            <p style={{ fontSize: 15, color: '#6b7280', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
              Curated compound combinations studied for synergistic activity. Add an entire protocol to your cart in one click.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="stacks-promo-grid">
            {[
              {
                name: 'Recovery & Regeneration',
                desc: 'BPC-157 + TB-500 + GHK-CU + KPV',
                savings: '$23',
                pct: '12%',
                color: '#E8F5EE',
                accent: '#14532D',
                href: '/stacks',
                icon: '🔬',
              },
              {
                name: 'Longevity & Cellular Health',
                desc: 'NAD+ + Epithalon + MOTS-C + Glutathione',
                savings: '$29',
                pct: '13%',
                color: '#FFF7ED',
                accent: '#92400E',
                href: '/stacks',
                icon: '⚡',
              },
              {
                name: 'Cognitive Enhancement',
                desc: 'Semax + Selank + Cerebrolysin',
                savings: '$22',
                pct: '11%',
                color: '#E8EFF9',
                accent: '#1E3A5F',
                href: '/stacks',
                icon: '🧠',
              },
            ].map(s => (
              <Link key={s.name} href={s.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: s.color, borderRadius: 20, padding: '28px 24px',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{s.icon}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0a0a0a', marginBottom: 6, lineHeight: 1.3 }}>{s.name}</h3>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 16, lineHeight: 1.5 }}>{s.desc}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      background: s.accent, color: '#fff',
                      fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 9999,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      fontFamily: "'DM Sans', sans-serif",
                    }}>
                      Save {s.savings} ({s.pct})
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: s.accent }}>View Stack →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <Link href="/stacks" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#0a0a0a', color: '#fff', padding: '13px 32px',
              borderRadius: 100, fontSize: 14, fontWeight: 700, textDecoration: 'none',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#0F2A4A'}
              onMouseLeave={e => e.currentTarget.style.background = '#0a0a0a'}
            >
              Browse All 6 Research Stacks →
            </Link>
          </div>
        </div>
      </section>}

      {/* ════════════════════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════════════════════ */}
      <section style={{ background: '#0F2A4A', padding: '80px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 16 }}>
            Ready to Elevate Your Research?
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.7 }}>
            Join thousands of researchers who trust EVO Labs for independently verified, research-grade peptides.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={session ? "/products" : "/account/login"}
              style={{ background: '#fff', color: '#0F2A4A', padding: '15px 36px', borderRadius: 100, fontSize: 15, fontWeight: 700, transition: 'transform 0.15s', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              Shop Now →
            </Link>
            <Link href="/coa"
              style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', padding: '15px 36px', borderRadius: 100, fontSize: 15, fontWeight: 600, border: '1.5px solid rgba(255,255,255,0.25)', transition: 'background 0.15s', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            >
              View COA Library
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 1024px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
          .hero-right { min-height: 360px !important; }
          .hero-vial-secondary { display: block !important; }
          .hero-info-card { display: none !important; }
          .features-grid { grid-template-columns: 1fr 1fr !important; }
          .products-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .coa-preview-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .guarantee-grid { grid-template-columns: 1fr !important; }
          .quality-tab-content { grid-template-columns: 1fr !important; gap: 32px !important; }
          .cat-featured-grid { grid-template-columns: 1fr 1fr !important; }
          .stacks-promo-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .hero-left { padding: 48px 0 24px !important; text-align: center !important; }
          .hero-left p { margin-left: auto !important; margin-right: auto !important; }
          .hero-left > div:first-child { justify-content: center !important; }
          .hero-left > div[style*="flex-wrap"] { justify-content: center !important; }
          .hero-stats { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
          .hero-right { min-height: 280px !important; }
          .hero-vial-secondary { display: none !important; }
          .hero-info-card { display: none !important; }
          .products-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .reviews-grid { grid-template-columns: 1fr !important; }
          .category-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .cat-featured-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .brand-split { grid-template-columns: 1fr !important; gap: 40px !important; }
          .coa-preview-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .quality-tab-content { padding: 28px 20px !important; }
          .newsletter-form { flex-direction: column !important; }
        }
        @media (max-width: 480px) {
          .products-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .coa-preview-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .category-grid { grid-template-columns: 1fr !important; }
          .cat-featured-grid { grid-template-columns: 1fr !important; }
          .hero-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .stacks-promo-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Layout>
  );
}

export async function getServerSideProps() {
  // Build category lookup from static data (source of truth for category names)
  const { products: staticProducts, CATEGORIES: STATIC_CATS } = await import('../lib/data');
  const validCats = new Set(STATIC_CATS.map(c => c.name));
  const staticCatByName = {};
  const staticBySlug = {};
  staticProducts.forEach(p => {
    staticCatByName[p.name.toLowerCase()] = p.category;
    if (p.slug) staticBySlug[p.slug] = p;
  });

  try {
    const { getSupabaseAdmin } = await import('../lib/supabase');
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from('products')
      .select('id,name,slug,price,sale_price,category,image,badge,out_of_stock,low_stock,rating,review_count')
      .order('id', { ascending: true });

    if (!error && data && data.length > 0) {
      const dbProducts = data.map(row => {
        // Resolve WooCommerce category → standard category name
        let category = row.category || '';
        if (!validCats.has(category)) {
          category = staticCatByName[row.name?.toLowerCase()] || category;
        }
        const stat = staticBySlug[row.slug] || {};
        // Normalize price: if bare number like "29.99", add "$" prefix
        const fmtP = (v) => {
          if (v == null) return null;
          const s = String(v);
          return /^\d+(\.\d+)?$/.test(s) ? `$${s}` : s;
        };
        let price = fmtP(row.price) || stat.price || '';
        const rawSale = row.sale_price || stat.salePrice || null;
        const salePrice = (() => {
          const sp = rawSale ? fmtP(rawSale) : null;
          return (sp && sp !== price) ? sp : null;
        })();
        return {
          id:          row.id,
          name:        row.name || stat.name || '',
          slug:        row.slug || '',
          price,
          salePrice,
          category,
          image:       row.image || stat.image || '',
          badge:       row.badge || stat.badge || null,
          outOfStock:  row.out_of_stock || false,
          lowStock:    row.low_stock || false,
          rating:      row.rating || stat.rating || 4.9,
          reviewCount: row.review_count || stat.reviewCount || 0,
        };
      });
      return { props: { dbProducts } };
    }
  } catch (e) {
    console.error('Home SSR product fetch failed:', e.message);
  }
  return { props: { dbProducts: [] } };
}
