import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { products, getCategoryConfig } from '../lib/data';

export async function getServerSideProps(ctx) {
  const { getCatalogMode, isProductsPublic } = await import('../lib/catalogMode');
  const mode = await getCatalogMode();
  const { getServerSession } = await import('next-auth/next');
  const { authOptions } = await import('./api/auth/[...nextauth]');
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const isAdmin = ctx.req.cookies?.evo_admin === '1';
  const isLoggedIn = !!session || isAdmin;
  if (!isProductsPublic(mode) && !isLoggedIn) return { redirect: { destination: '/account/login?redirect=/cart', permanent: false } };
  return { props: { catalogMode: mode, isGuest: !isLoggedIn } };
}

export default function CartPage({ catalogMode = 'gated', isGuest = false }) {
  const { cart, itemCount, subtotal, volumeDiscount, subtotalAfterVolume, shipping, total, removeItem, updateQty, addItem } = useCart();
  const { recentSlugs } = useRecentlyViewed();
  const [promoInput, setPromoInput] = useState('');
  const [appliedCode, setAppliedCode] = useState(null);
  // Cart reservation countdown: 12 minutes, resets each visit
  const [cartSecs, setCartSecs] = useState(() => {
    if (typeof window === 'undefined') return 720;
    const stored = sessionStorage.getItem('evo_cart_timer');
    const exp = stored ? parseInt(stored) : 0;
    const remaining = Math.max(0, exp - Math.floor(Date.now() / 1000));
    if (remaining > 0) return remaining;
    const fresh = 720;
    sessionStorage.setItem('evo_cart_timer', String(Math.floor(Date.now() / 1000) + fresh));
    return fresh;
  });
  useEffect(() => {
    if (cartSecs <= 0) return;
    const iv = setInterval(() => setCartSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(iv);
  }, [cartSecs > 0]);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const discountAmt = appliedCode ? parseFloat((subtotalAfterVolume * appliedCode.pct).toFixed(2)) : 0;
  const finalTotal = Math.max(0, total - discountAmt);

  // Upsell: suggest contextually relevant products based on cart contents
  const upsells = useMemo(() => {
    const cartSlugs = new Set(cart.map(i => i.slug));
    // Cross-sell map: suggest complements based on cart items
    const CROSS_SELL = {
      'bpc-157': ['tb-500', 'ghk-cu', 'nad'],
      'tb-500': ['bpc-157', 'ghk-cu', 'kpv'],
      'glp-3-r': ['cagrilintide', 'mots-c', 'lipo-c'],
      'glp-2-t': ['cagrilintide', 'lipo-c', '5-amino-1-mq'],
      'cagrilintide': ['glp-3-r', 'mots-c', 'lipo-c'],
      'nad': ['epithalon', 'ss31', 'mots-c'],
      'epithalon': ['nad', 'ss31', 'glutathione'],
      'semax': ['selank', 'cerebrolysin', 'nad'],
      'hgh-191aa': ['cjc-1295-w-o-dac-ipamorelin', 'igf-1lr3', 'klow'],
      'cjc-1295-w-o-dac-ipamorelin': ['klow', 'nad', 'igf-1lr3'],
    };
    const suggested = new Set();
    // First: context-aware suggestions from cart items
    for (const item of cart) {
      const matches = CROSS_SELL[item.slug] || [];
      matches.forEach(s => { if (!cartSlugs.has(s)) suggested.add(s); });
    }
    // Fill remainder with general bestsellers
    const fallback = ['bac-water-10-ml', 'ghk-cu', 'glutathione', 'nad', 'epithalon', 'semax'];
    fallback.forEach(s => { if (!cartSlugs.has(s)) suggested.add(s); });
    return [...suggested].slice(0, 4).map(s => products.find(p => p.slug === s)).filter(Boolean);
  }, [cart]);

  // Recently viewed: exclude items already in cart, max 4
  const recentlyViewed = useMemo(() => {
    const cartSlugs = new Set(cart.map(i => i.slug));
    return recentSlugs
      .map(s => products.find(p => p.slug === s))
      .filter(p => p && !cartSlugs.has(p.slug))
      .slice(0, 4);
  }, [recentSlugs, cart]);

  async function handleApplyPromo() {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoError('');
    setPromoLoading(true);
    try {
      const res = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCode({ code, pct: data.pct, label: data.label });
      } else {
        setPromoError(data.error || 'Code not found. Check the code and try again.');
      }
    } catch {
      setPromoError('Could not validate code. Please try again.');
    }
    setPromoLoading(false);
  }

  function handleRemovePromo() {
    setAppliedCode(null);
    setPromoInput('');
    setPromoError('');
  }

  return (
    <Layout title="Cart | EVO Labs Research" description="Your research cart.">
      {/* Guest banner — open_catalog mode */}
      {isGuest && catalogMode === 'open_catalog' && (
        <div style={{ background: '#C9A96E', color: '#1A1A1A', textAlign: 'center', padding: '12px 16px', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span>Sign in to proceed to checkout</span>
          <Link href="/account/login?redirect=/checkout" style={{ background: '#1A1A1A', color: '#fff', padding: '6px 16px', borderRadius: 9999, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
        </div>
      )}
      <section style={{ padding: '64px 0 120px', minHeight: '60vh' }}>
        <div className="container" style={{ maxWidth: 960 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em', marginBottom: 8 }}>
            Your Cart
          </h1>
          <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 40 }}>
            {itemCount > 0
              ? `${itemCount} ${itemCount === 1 ? 'item' : 'items'} in your cart`
              : 'Review your research compounds before checkout.'}
          </p>

          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ margin: '0 auto 20px', opacity: 0.3 }}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </div>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Your cart is empty</p>
              <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 32 }}>Browse our catalog to find the right compounds for your research.</p>
              <Link href="/products" className="btn-primary" style={{ padding: '14px 32px' }}>
                Browse All Compounds &rarr;
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 40, alignItems: 'start' }} className="cart-page-grid">
              {/* Left: Cart items */}
              <div>
                {/* Volume discount nudge banner */}
                {cart.some(item => (item.qty || 1) === 1) && (
                  <div style={{
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                    border: '1.5px solid #bbf7d0',
                    borderRadius: 12, padding: '12px 16px',
                    marginBottom: 20,
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <span style={{ fontSize: 20 }}>🏷️</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#15803d' }}>
                        Multi-Vial Discount — Save up to 10%
                      </div>
                      <div style={{ fontSize: 12, color: '#166534', marginTop: 2 }}>
                        Order 2 vials of any product: <strong>5% off</strong> · Order 3+: <strong>10% off</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Column headers */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 140px 100px 40px',
                  gap: 16, padding: '0 0 12px',
                  borderBottom: '1px solid #e5e7eb',
                  fontSize: 11, fontWeight: 700, color: '#9ca3af',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  fontFamily: "'Poppins', sans-serif",
                }} className="cart-header-row">
                  <span>Product</span>
                  <span style={{ textAlign: 'center' }}>Quantity</span>
                  <span style={{ textAlign: 'right' }}>Total</span>
                  <span />
                </div>

                {cart.map((item, idx) => {
                  const price = parseFloat((item.salePrice || item.price || '0').replace(/[^0-9.]/g, ''));
                  const lineTotal = price * (item.qty || 1);
                  return (
                    <div key={idx} style={{
                      display: 'grid', gridTemplateColumns: '1fr 140px 100px 40px',
                      gap: 16, alignItems: 'center',
                      padding: '20px 0',
                      borderBottom: '1px solid #f3f4f6',
                    }} className="cart-item-row">
                      {/* Product info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Link href={`/products/${item.slug}`} style={{
                          width: 72, height: 72, flexShrink: 0,
                          borderRadius: 12, background: '#f9fafb',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '1px solid #f0f0f0',
                        }}>
                          <img src={item.image} alt={item.name} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                        </Link>
                        <div>
                          <Link href={`/products/${item.slug}`} style={{
                            fontSize: 15, fontWeight: 700, color: '#0a0a0a',
                            textDecoration: 'none', lineHeight: 1.3,
                          }}>
                            {item.name}
                          </Link>
                          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{item.category}</div>
                          {item.dosage && (
                            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3, fontFamily: "'Poppins', sans-serif" }}>
                              Size: {item.dosage}
                            </div>
                          )}
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginTop: 4 }}>
                            ${price.toFixed(2)} each
                          </div>
                        </div>
                      </div>

                      {/* Quantity */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
                          <button
                            onClick={() => updateQty(idx, (item.qty || 1) - 1)}
                            style={{
                              width: 34, height: 34, border: 'none', background: '#f9fafb',
                              fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#6b7280',
                            }}
                          >-</button>
                          <span style={{
                            width: 40, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, fontWeight: 600,
                            borderLeft: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb',
                          }}>{item.qty || 1}</span>
                          <button
                            onClick={() => updateQty(idx, (item.qty || 1) + 1)}
                            style={{
                              width: 34, height: 34, border: 'none', background: '#f9fafb',
                              fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#6b7280',
                            }}
                          >+</button>
                        </div>
                      </div>

                      {/* Line total */}
                      <div style={{ textAlign: 'right', fontSize: 15, fontWeight: 700, color: '#0a0a0a', fontFamily: "'Poppins', sans-serif" }}>
                        ${lineTotal.toFixed(2)}
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(idx)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#d1d5db', fontSize: 20, padding: 4, lineHeight: 1,
                          transition: 'color 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}
                        title="Remove item"
                      >
                        &times;
                      </button>
                    </div>
                  );
                })}

                <Link href="/products" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  marginTop: 24, fontSize: 13, color: '#6b7280', fontWeight: 500,
                  textDecoration: 'none',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#111'}
                  onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
                >
                  &larr; Continue Shopping
                </Link>
              </div>

              {/* Right: Order Summary */}
              <div style={{
                background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 16,
                padding: '28px', position: 'sticky', top: 100,
              }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0a0a0a', marginBottom: 20, letterSpacing: '-0.01em' }}>
                  Order Summary
                </h2>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 14, color: '#6b7280' }}>Subtotal ({itemCount} items)</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#0a0a0a' }}>${subtotal.toFixed(2)}</span>
                </div>

                {/* Volume discount line */}
                {volumeDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontSize: 15 }}>🏷️</span> Multi-vial savings
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#16a34a' }}>−${volumeDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 14, color: '#6b7280' }}>Shipping</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: shipping === 0 ? '#16a34a' : '#0a0a0a' }}>
                    {shipping === 0 ? 'FREE' : '$9.99'}
                  </span>
                </div>

                {subtotalAfterVolume < 250 && (
                  <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#166534', fontWeight: 500 }}>
                    Add ${(250 - subtotalAfterVolume).toFixed(2)} more for <strong>free shipping</strong>!
                  </div>
                )}

                {/* Promo code */}
                <div style={{ marginBottom: 16 }}>
                  {appliedCode ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdf4', borderRadius: 10, padding: '10px 14px', border: '1px solid #bbf7d0' }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>
                          Code: <span style={{ fontFamily: 'monospace' }}>{appliedCode.code}</span> — {appliedCode.label}
                        </div>
                        <div style={{ fontSize: 11, color: '#4ade80' }}>−${discountAmt.toFixed(2)} applied</div>
                      </div>
                      <button onClick={handleRemovePromo} style={{ background: 'none', border: 'none', fontSize: 12, color: '#6b7280', cursor: 'pointer', textDecoration: 'underline' }}>Remove</button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          value={promoInput}
                          onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                          onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                          placeholder="Promo code"
                          style={{
                            flex: 1, padding: '9px 12px', fontSize: 13, borderRadius: 8,
                            border: `1.5px solid ${promoError ? '#fca5a5' : '#e5e7eb'}`,
                            outline: 'none', fontFamily: 'monospace', letterSpacing: '0.05em',
                          }}
                          onFocus={e => e.target.style.borderColor = '#1B4D3E'}
                          onBlur={e => e.target.style.borderColor = promoError ? '#fca5a5' : '#e5e7eb'}
                        />
                        <button
                          onClick={handleApplyPromo}
                          disabled={promoLoading || !promoInput.trim()}
                          style={{
                            background: promoInput.trim() ? '#1B4D3E' : '#e5e7eb',
                            color: promoInput.trim() ? '#fff' : '#9ca3af',
                            border: 'none', borderRadius: 8, padding: '9px 14px',
                            fontSize: 12, fontWeight: 700, cursor: promoInput.trim() ? 'pointer' : 'default',
                            transition: 'background 0.2s', minWidth: 60,
                          }}
                        >
                          {promoLoading ? '…' : 'Apply'}
                        </button>
                      </div>
                      {promoError && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 6 }}>{promoError}</p>}
                    </div>
                  )}
                </div>

                <div style={{ height: 1, background: '#e5e7eb', margin: '16px 0' }} />

                {appliedCode && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 14, color: '#16a34a' }}>Discount ({appliedCode.label})</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#16a34a' }}>−${discountAmt.toFixed(2)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#0a0a0a' }}>Total</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#0a0a0a', fontFamily: "'Poppins', sans-serif" }}>
                    ${finalTotal.toFixed(2)}
                  </span>
                </div>

                {/* Cart reservation timer */}
                {cart.length > 0 && cartSecs > 0 && (
                  <div style={{ background: cartSecs < 120 ? '#fef2f2' : '#fff7ed', border: `1px solid ${cartSecs < 120 ? '#fecaca' : '#fed7aa'}`, borderRadius: 8, padding: '10px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>⏱</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: cartSecs < 120 ? '#dc2626' : '#ea580c' }}>
                        Cart reserved for {Math.floor(cartSecs / 60)}:{String(cartSecs % 60).padStart(2, '0')}
                      </div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>
                        Complete checkout before your reservation expires
                      </div>
                    </div>
                  </div>
                )}

                <Link
                  href={isGuest && catalogMode === 'open_catalog' ? '/account/login?redirect=/checkout' : '/checkout'}
                  style={{
                    display: 'block', width: '100%', background: '#1B4D3E', color: '#fff',
                    padding: '16px 24px', borderRadius: 12, fontSize: 15,
                    fontWeight: 700, fontFamily: "'Poppins', sans-serif",
                    textAlign: 'center', textDecoration: 'none',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#163d31'}
                  onMouseLeave={e => e.currentTarget.style.background = '#1B4D3E'}
                >
                  Proceed to Checkout &rarr;
                </Link>

                <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>
                  For Research Use Only &middot; Not for Human Consumption
                </p>

                {/* Trust signals */}
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #e5e7eb' }}>
                  {[
                    { icon: '🔒', text: 'Secure checkout' },
                    { icon: '⚖️', text: 'Net purity & content verified' },
                    { icon: '📋', text: 'COA included with every order' },
                  ].map(b => (
                    <div key={b.text} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      fontSize: 12, color: '#6b7280', marginBottom: 8,
                    }}>
                      <span>{b.icon}</span>
                      {b.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── You Might Also Like ── */}
      {upsells.length > 0 && itemCount > 0 && (
        <section style={{ borderTop: '1px solid #f0f0f0', padding: '56px 0 80px', background: '#fafafa' }}>
          <div className="container" style={{ maxWidth: 960 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0a0a0a', letterSpacing: '-0.02em', marginBottom: 8 }}>
              Researchers Also Added
            </h2>
            <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 28 }}>Complete your research stack</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
              {upsells.map(p => {
                const cat = getCategoryConfig(p.category);
                const displayPrice = p.salePrice || p.price;
                return (
                  <div key={p.slug} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '20px 16px', textAlign: 'center' }}>
                    <Link href={`/products/${p.slug}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        width: 72, height: 72, borderRadius: 12, margin: '0 auto 12px',
                        background: `radial-gradient(ellipse at 50% 60%, ${cat.color} 0%, #f5f5f5 80%)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <img src={p.image} alt={p.name} style={{ width: '75%', height: '75%', objectFit: 'contain' }} />
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#111', marginBottom: 4, lineHeight: 1.3, fontFamily: "'Poppins', sans-serif" }}>{p.name}</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#1B4D3E', marginBottom: 12, fontFamily: "'Poppins', sans-serif" }}>{displayPrice}</div>
                    </Link>
                    <button
                      onClick={() => addItem(p, { dosage: '5mg', bundleCount: 1 })}
                      style={{
                        width: '100%', padding: '8px 0', background: '#f0fdf4',
                        border: '1px solid #bbf7d0', borderRadius: 8,
                        fontSize: 12, fontWeight: 700, color: '#1B4D3E', cursor: 'pointer',
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      + Add to Cart
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Recently Viewed ── */}
      {recentlyViewed.length > 0 && (
        <section style={{ borderTop: '1px solid #f0f0f0', padding: '48px 0 72px', background: '#fff' }}>
          <div className="container" style={{ maxWidth: 960 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0a0a0a', letterSpacing: '-0.02em', marginBottom: 6 }}>
              Recently Viewed
            </h2>
            <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 24 }}>Pick up where you left off</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
              {recentlyViewed.map(p => {
                const cat = getCategoryConfig(p.category);
                const displayPrice = p.salePrice || p.price;
                return (
                  <Link key={p.slug} href={`/products/${p.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: '#fafafa', borderRadius: 16, border: '1px solid #e5e7eb',
                      padding: '16px', textAlign: 'center',
                      transition: 'box-shadow 0.2s ease',
                    }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                    >
                      <div style={{
                        width: 64, height: 64, borderRadius: 12, margin: '0 auto 10px',
                        background: `radial-gradient(ellipse at 50% 60%, ${cat.color} 0%, #f5f5f5 80%)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <img src={p.image} alt={p.name} style={{ width: '75%', height: '75%', objectFit: 'contain' }} />
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#111', marginBottom: 3, lineHeight: 1.3, fontFamily: "'Poppins', sans-serif" }}>{p.name}</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#1B4D3E', fontFamily: "'Poppins', sans-serif" }}>{displayPrice}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <style>{`
        @media (max-width: 768px) {
          .cart-page-grid { grid-template-columns: 1fr !important; }
          .cart-header-row { display: none !important; }
          .cart-item-row {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </Layout>
  );
}
