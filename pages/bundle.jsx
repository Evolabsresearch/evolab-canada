import { useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { products, CATEGORIES, getCategoryConfig } from '../lib/data';
import { useCart } from '../context/CartContext';

const DISCOUNT_TIERS = [
  { min: 2, label: '2 items', pct: 5,  badge: null },
  { min: 3, label: '3 items', pct: 10, badge: 'Popular' },
  { min: 4, label: '4 items', pct: 15, badge: 'Best Value' },
  { min: 5, label: '5+ items', pct: 20, badge: 'Max Savings' },
];

function getDiscount(count) {
  const tier = [...DISCOUNT_TIERS].reverse().find(t => count >= t.min);
  return tier ? tier.pct : 0;
}

function parsePrice(str) {
  if (!str) return 0;
  const m = str.replace(/[^0-9.]/g, '').match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

// Only include products that have a real price and aren't supplies/kits
const BUNDLEABLE = products.filter(p =>
  p.category !== 'Reconstitution Supplies' &&
  p.category !== 'Research Kits' &&
  !p.outOfStock &&
  parsePrice(p.salePrice || p.price) > 0
);

function ProductTile({ product, selected, onToggle }) {
  const cat = getCategoryConfig(product.category);
  const price = parsePrice(product.salePrice || product.price);
  return (
    <button
      onClick={() => onToggle(product.slug)}
      style={{
        all: 'unset',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        background: selected ? 'rgba(6,182,212,0.06)' : 'rgba(255,255,255,0.03)',
        border: `1.5px solid ${selected ? 'rgba(6,182,212,0.4)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 14,
        padding: '14px 12px',
        textAlign: 'left',
        transition: 'all 0.2s ease',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {selected && (
        <span style={{
          position: 'absolute', top: 8, right: 8,
          background: '#06b6d4', color: '#0a0a0a', borderRadius: '50%',
          width: 20, height: 20, fontSize: 11, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>✓</span>
      )}
      <div style={{
        width: '100%', paddingBottom: '100%', position: 'relative', marginBottom: 10,
        background: `radial-gradient(ellipse at 50% 60%, ${cat.color} 0%, transparent 80%)`,
        borderRadius: 10,
      }}>
        <img
          src={product.image}
          alt={product.name}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', padding: 8 }}
          loading="lazy"
        />
      </div>
      <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{product.category}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: 6, flex: 1 }}>{product.name}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: selected ? '#06b6d4' : 'rgba(255,255,255,0.5)', fontFamily: "'Poppins', sans-serif" }}>
        {product.salePrice || product.price}
      </div>
    </button>
  );
}

export default function BundlePage() {
  const [selectedSlugs, setSelectedSlugs] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem } = useCart();

  function toggleSlug(slug) {
    setSelectedSlugs(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
    setAddedToCart(false);
  }

  const discount = getDiscount(selectedSlugs.length);
  const currentTier = DISCOUNT_TIERS.filter(t => selectedSlugs.length >= t.min).pop();
  const nextTier = DISCOUNT_TIERS.find(t => selectedSlugs.length < t.min);

  const selectedProducts = selectedSlugs.map(s => products.find(p => p.slug === s)).filter(Boolean);
  const subtotal = selectedProducts.reduce((sum, p) => sum + parsePrice(p.salePrice || p.price), 0);
  const savings = subtotal * (discount / 100);
  const total = subtotal - savings;

  const categoryNames = ['All', ...CATEGORIES.filter(c =>
    c.name !== 'Reconstitution Supplies' && c.name !== 'Research Kits'
  ).map(c => c.name)];

  const filtered = BUNDLEABLE.filter(p =>
    activeCategory === 'All' || p.category === activeCategory
  );

  function handleAddToCart() {
    selectedProducts.forEach(p => {
      addItem(p, { dosage: '', bundleCount: 1 });
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  }

  return (
    <Layout
      title="Build a Bundle | EVO Labs Research — Save up to 20%"
      description="Mix and match research peptides into your own custom bundle. Get 5–20% off when you combine 2 or more compounds. 99%+ purity, COA included."
    >
      {/* Hero */}
      <div style={{ background: '#0a0a0a', padding: '56px 0 48px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="container">
          <div style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Custom Bundle</div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 14 }}>
            Build Your Research Bundle
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', maxWidth: 480, marginBottom: 32 }}>
            Mix and match any compounds. The more you add, the more you save — up to 20% off automatically applied at checkout.
          </p>

          {/* Discount tier indicators */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {DISCOUNT_TIERS.map(tier => {
              const active = selectedSlugs.length >= tier.min;
              const isCurrent = currentTier?.min === tier.min;
              return (
                <div key={tier.min} style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  background: isCurrent ? 'rgba(6,182,212,0.12)' : active ? 'rgba(6,182,212,0.06)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isCurrent ? 'rgba(6,182,212,0.35)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 9999, padding: '7px 14px',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: active ? '#06b6d4' : 'rgba(255,255,255,0.3)', fontFamily: "'Poppins', sans-serif" }}>
                    {tier.pct}% off
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{tier.label}</span>
                  {tier.badge && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#0a0a0a', background: '#06b6d4', padding: '2px 6px', borderRadius: 9999, letterSpacing: '0.04em' }}>
                      {tier.badge}
                    </span>
                  )}
                  {isCurrent && <span style={{ fontSize: 12 }}>✓</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ background: '#0a0a0a', minHeight: '60vh' }}>
        <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 40, alignItems: 'start' }} className="bundle-layout">

            {/* Left: product selector */}
            <div>
              {/* Category filter */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                {categoryNames.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      background: activeCategory === cat ? '#1B4D3E' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${activeCategory === cat ? '#1B4D3E' : 'rgba(255,255,255,0.08)'}`,
                      color: activeCategory === cat ? '#fff' : 'rgba(255,255,255,0.45)',
                      borderRadius: 9999, padding: '6px 14px', fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                {filtered.map(p => (
                  <ProductTile
                    key={p.slug}
                    product={p}
                    selected={selectedSlugs.includes(p.slug)}
                    onToggle={toggleSlug}
                  />
                ))}
              </div>
            </div>

            {/* Right: sticky summary */}
            <div style={{ position: 'sticky', top: 88 }}>
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 20, overflow: 'hidden',
              }}>
                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Your Bundle</div>
                    {selectedSlugs.length > 0 && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#0a0a0a', background: '#06b6d4', padding: '3px 10px', borderRadius: 9999 }}>
                        {selectedSlugs.length} item{selectedSlugs.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: '16px 24px' }}>
                  {selectedProducts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.2)' }}>
                      <div style={{ fontSize: 32, marginBottom: 10 }}>🧬</div>
                      <div style={{ fontSize: 13 }}>Select products to build your bundle</div>
                    </div>
                  ) : (
                    <>
                      {/* Item list */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                        {selectedProducts.map(p => (
                          <div key={p.slug} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <img src={p.image} alt={p.name} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>{p.name}</div>
                              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: "'Poppins', sans-serif" }}>{p.salePrice || p.price}</div>
                            </div>
                            <button
                              onClick={() => toggleSlug(p.slug)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', fontSize: 16, lineHeight: 1, padding: 0 }}
                            >&times;</button>
                          </div>
                        ))}
                      </div>

                      {/* Pricing */}
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14, marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Subtotal</span>
                          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontFamily: "'Poppins', sans-serif" }}>${subtotal.toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 12, color: '#06b6d4' }}>Bundle discount ({discount}%)</span>
                            <span style={{ fontSize: 12, color: '#06b6d4', fontFamily: "'Poppins', sans-serif" }}>−${savings.toFixed(2)}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Total</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: discount > 0 ? '#06b6d4' : '#fff', fontFamily: "'Poppins', sans-serif" }}>
                            ${total.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Upsell nudge */}
                      {nextTier && (
                        <div style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.12)', borderRadius: 10, padding: '10px 12px', marginBottom: 14, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                          Add {nextTier.min - selectedSlugs.length} more item{nextTier.min - selectedSlugs.length !== 1 ? 's' : ''} to unlock <strong style={{ color: '#06b6d4' }}>{nextTier.pct}% off</strong>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* CTA */}
                <div style={{ padding: '0 24px 24px' }}>
                  <button
                    onClick={handleAddToCart}
                    disabled={selectedProducts.length === 0}
                    style={{
                      width: '100%', padding: '14px 0',
                      background: selectedProducts.length === 0 ? 'rgba(255,255,255,0.05)' : addedToCart ? '#16a34a' : '#1B4D3E',
                      color: selectedProducts.length === 0 ? 'rgba(255,255,255,0.2)' : '#fff',
                      border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700,
                      cursor: selectedProducts.length === 0 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s', fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    {addedToCart ? '✓ Added to Cart!' : selectedProducts.length === 0 ? 'Select Items to Build Bundle' : `Add Bundle to Cart${discount > 0 ? ` (${discount}% off)` : ''}`}
                  </button>
                  {selectedProducts.length > 0 && (
                    <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
                      Discount applied automatically at checkout
                    </div>
                  )}
                </div>
              </div>

              {/* Trust badges */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                {['🔬 99%+ purity, third-party tested', '📋 COA included with every order', '🚚 Free shipping on bundles $250+'].map(t => (
                  <div key={t} style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 6 }}>{t}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{ background: '#0d0d0d', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '40px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Prefer a pre-built stack?</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Our research stacks are expertly curated combinations for specific protocols.</p>
          </div>
          <Link href="/stacks" style={{ background: '#1B4D3E', color: '#fff', padding: '12px 24px', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', fontFamily: "'Poppins', sans-serif" }}>
            View Research Stacks →
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .bundle-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Layout>
  );
}
