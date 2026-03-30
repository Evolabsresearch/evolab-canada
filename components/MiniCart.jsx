import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { products } from '../lib/data';

// Products frequently added with peptide orders
const UPSELL_SLUGS = ['bac-water-10-ml', 'bac-water-united-labs-30ml', 'evo-alpha-research-stack', 'b12'];


export default function MiniCart() {
  const { cart, itemCount, subtotal, shipping, total, miniCartOpen, setMiniCartOpen, removeItem, updateQty, addItem } = useCart();

  // Upsell products not already in cart
  const cartSlugs = new Set(cart.map(i => i.slug));
  const upsells = UPSELL_SLUGS
    .map(slug => products.find(p => p.slug === slug))
    .filter(p => p && !cartSlugs.has(p.slug))
    .slice(0, 2);

  return (
    <>
      {/* Backdrop */}
      {miniCartOpen && (
        <div
          onClick={() => setMiniCartOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            zIndex: 9998, transition: 'opacity 0.3s',
          }}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '100%', maxWidth: 420,
        background: '#fff',
        zIndex: 9999,
        transform: miniCartOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex', flexDirection: 'column',
        boxShadow: miniCartOpen ? '-8px 0 40px rgba(0,0,0,0.12)' : 'none',
        fontFamily: "'Anek Telugu', sans-serif",
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#0a0a0a' }}>Your Cart</span>
            {itemCount > 0 && (
              <span style={{
                background: '#1B4D3E', color: '#fff',
                fontSize: 11, fontWeight: 700, fontFamily: "'Poppins', sans-serif",
                padding: '2px 10px', borderRadius: 9999,
              }}>
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <button
            onClick={() => setMiniCartOpen(false)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 24, color: '#9ca3af', padding: 10, lineHeight: 1,
              minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            &times;
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px' }}>
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>Your cart is empty</p>
              <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 24 }}>Add some compounds to get started.</p>
              <button
                onClick={() => setMiniCartOpen(false)}
                style={{
                  background: '#0a0a0a', color: '#fff', border: 'none',
                  borderRadius: 10, padding: '12px 28px', fontSize: 14,
                  fontWeight: 600, cursor: 'pointer',
                }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {cart.map((item, idx) => {
                const price = parseFloat((item.salePrice || item.price || '0').replace(/[^0-9.]/g, ''));
                return (
                  <div key={idx} style={{
                    display: 'flex', gap: 14,
                    padding: '14px 0',
                    borderBottom: idx < cart.length - 1 ? '1px solid #f3f4f6' : 'none',
                  }}>
                    <div style={{
                      width: 64, height: 64, flexShrink: 0,
                      borderRadius: 10, background: '#f9fafb',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1px solid #f0f0f0',
                    }}>
                      <img src={item.image} alt={item.name} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#0a0a0a', lineHeight: 1.3 }}>{item.name}</div>
                          {item.dosage && (
                            <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: "'Poppins', sans-serif" }}>{item.dosage}</span>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(idx)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', fontSize: 18, padding: 8, lineHeight: 1, flexShrink: 0, minWidth: 36, minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Remove"
                        >
                          &times;
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                          <button
                            onClick={() => updateQty(idx, (item.qty || 1) - 1)}
                            style={{
                              width: 38, height: 38, border: 'none', background: '#f9fafb',
                              fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#6b7280',
                            }}
                          >-</button>
                          <span style={{
                            width: 32, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 600, borderLeft: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb',
                          }}>{item.qty || 1}</span>
                          <button
                            onClick={() => updateQty(idx, (item.qty || 1) + 1)}
                            style={{
                              width: 38, height: 38, border: 'none', background: '#f9fafb',
                              fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#6b7280',
                            }}
                          >+</button>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#0a0a0a', fontFamily: "'Poppins', sans-serif" }}>
                          ${(price * (item.qty || 1)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upsell Strip */}
        {cart.length > 0 && upsells.length > 0 && (
          <div style={{ padding: '12px 24px', background: '#f9fafb', borderTop: '1px solid #f0f0f0' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              Frequently Added Together
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {upsells.map(p => (
                <div key={p.slug} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 10, padding: '8px 10px', border: '1px solid #e5e7eb' }}>
                  <img src={p.image} alt={p.name} style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 6, background: '#f3f4f6' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#111', lineHeight: 1.3 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>{p.salePrice || p.price}</div>
                  </div>
                  <button
                    onClick={() => addItem(p, { dosage: '', bundleCount: 1 })}
                    style={{
                      padding: '10px 14px', background: '#1B4D3E', color: '#fff',
                      border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
                      minHeight: 40,
                    }}
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding: '20px 24px', borderTop: '1px solid #f0f0f0', background: '#fafafa' }}>
            {/* Free Shipping Progress Bar */}
            <div style={{ marginBottom: 16 }}>
              {subtotal >= 250 ? (
                <div style={{ background: '#d1fae5', borderRadius: 8, padding: '8px 14px', fontSize: 12, color: '#065f46', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  🎉 You qualify for <strong>FREE shipping!</strong>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: '#166534' }}>
                    <span>Add <strong>${(250 - subtotal).toFixed(2)}</strong> for free shipping</span>
                    <span style={{ color: '#6b7280' }}>${subtotal.toFixed(2)} / $250</span>
                  </div>
                  <div style={{ height: 6, background: '#e5e7eb', borderRadius: 9999, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', background: 'linear-gradient(90deg, #1B4D3E, #4ade80)',
                      borderRadius: 9999,
                      width: `${Math.min(100, (subtotal / 250) * 100)}%`,
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>Subtotal</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>Shipping</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: shipping === 0 ? '#16a34a' : '#0a0a0a' }}>
                {shipping === 0 ? 'FREE' : '$9.99'}
              </span>
            </div>
            <div style={{ height: 1, background: '#e5e7eb', marginBottom: 14 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Total</span>
              <span style={{ fontSize: 15, fontWeight: 700 }}>${total.toFixed(2)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dataLayer = window.dataLayer || [];
                  window.dataLayer.push({ ecommerce: null });
                  window.dataLayer.push({
                    event: 'begin_checkout',
                    currency: 'USD',
                    value: total,
                    ecommerce: {
                      currency: 'USD',
                      value: total,
                      items: cart.map(item => ({
                        item_id: item.dosage ? `${item.slug}-${item.dosage}` : item.slug,
                        item_name: item.dosage ? `${item.name} ${item.dosage}` : item.name,
                        item_brand: 'EVO Labs Research',
                        item_category: item.category || '',
                        item_variant: item.dosage || '',
                        price: parseFloat((item.salePrice || item.price || '0').replace(/[^0-9.]/g, '')),
                        quantity: item.qty || 1,
                      })),
                    },
                  });
                }
                setMiniCartOpen(false);
              }}
              style={{
                display: 'block', width: '100%', background: '#1B4D3E', color: '#fff',
                padding: '14px 24px', borderRadius: 12, fontSize: 15,
                fontWeight: 700, fontFamily: "'Poppins', sans-serif",
                textAlign: 'center', textDecoration: 'none',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#163d31'}
              onMouseLeave={e => e.currentTarget.style.background = '#1B4D3E'}
            >
              Checkout &rarr;
            </Link>
            <Link
              href="/cart"
              onClick={() => setMiniCartOpen(false)}
              style={{
                display: 'block', textAlign: 'center', marginTop: 10,
                fontSize: 13, color: '#6b7280', fontWeight: 500,
                textDecoration: 'underline', textUnderlineOffset: 2,
              }}
            >
              View Full Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
