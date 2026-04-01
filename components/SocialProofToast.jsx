import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const CITIES = [
  'Toronto, ON', 'Vancouver, BC', 'Calgary, AB', 'Montreal, QC', 'Ottawa, ON',
  'New York, NY', 'Chicago, IL', 'Phoenix, AZ', 'Atlanta, GA', 'Dallas, TX',
  'Seattle, WA', 'Boston, MA', 'San Diego, CA', 'Portland, OR', 'Nashville, TN',
  'Charlotte, NC', 'Las Vegas, NV', 'Minneapolis, MN', 'Orlando, FL', 'Houston, TX',
];

const PRODUCTS = [
  { name: 'BPC-157 5mg', slug: 'bpc-157', img: '/images/products/catalog/BPC-157 5MG.png' },
  { name: 'GLP-3 (R) 10mg', slug: 'glp-3-r', img: '/images/products/catalog/GLP-3(R) 10MG.png' },
  { name: 'HGH 191aa 24IU', slug: 'hgh-191aa', img: '/images/products/catalog/HGH 191aa 24iu.png' },
  { name: 'BPC-157 + TB-500', slug: 'bpc-157-tb-500', img: '/images/products/catalog/BPC-157 TB500 20MG.png' },
  { name: 'NAD+ 500mg', slug: 'nad', img: '/images/products/catalog/NAD-Plus 500MG.png' },
  { name: 'Cagrilintide 10mg', slug: 'cagrilintide', img: '/images/products/catalog/Cagrilintide 10MG.png' },
  { name: 'CJC-1295 / Ipamorelin', slug: 'cjc-1295-w-o-dac-ipamorelin', img: '/images/products/catalog/CJC-1295 Ipamorelin 10MG.png' },
  { name: 'Epithalon 10mg', slug: 'epithalon', img: '/images/products/catalog/Epithalon 10MG.png' },
  { name: 'Semax 10mg', slug: 'semax', img: '/images/products/catalog/Semax 10MG.png' },
  { name: 'MOTS-C 10mg', slug: 'mots-c', img: '/images/products/catalog/MOTS-C 10MG.png' },
  { name: 'PT-141 10mg', slug: 'pt-141', img: '/images/products/catalog/PT-141 10MG.png' },
  { name: 'Selank 10mg', slug: 'selank', img: '/images/products/catalog/Selank 10MG.png' },
  { name: 'IGF-1 LR3 1mg', slug: 'igf-1lr3', img: '/images/products/catalog/IGF-1 LR3 1MG.png' },
  { name: 'KLOW 80mg', slug: 'klow', img: '/images/products/catalog/KLOW 80MG.png' },
  { name: 'GLOW 70mg', slug: 'glow', img: '/images/products/catalog/GLOW 70MG.png' },
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomMinutes() {
  // Returns "X minutes ago" or "X hours ago"
  const n = Math.floor(Math.random() * 55) + 2;
  if (n < 60) return `${n} minutes ago`;
  return `${Math.floor(n / 60)} hour${n >= 120 ? 's' : ''} ago`;
}

export default function SocialProofToast() {
  const [toast, setToast] = useState(null);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);
  const hideRef = useRef(null);

  function showToast() {
    const product = randomItem(PRODUCTS);
    const city = randomItem(CITIES);
    const time = randomMinutes();
    setToast({ product, city, time });
    setVisible(true);

    // Auto-hide after 5s
    hideRef.current = setTimeout(() => {
      setVisible(false);
    }, 5000);
  }

  useEffect(() => {
    // First show after 8–14s
    const initialDelay = 8000 + Math.random() * 6000;
    timerRef.current = setTimeout(() => {
      showToast();
      // Then repeat every 25–45s
      timerRef.current = setInterval(() => {
        showToast();
      }, 25000 + Math.random() * 20000);
    }, initialDelay);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(timerRef.current);
      clearTimeout(hideRef.current);
    };
  }, []);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 80,
        left: 16,
        zIndex: 9000,
        transition: 'opacity 0.4s ease, transform 0.4s ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        pointerEvents: visible ? 'auto' : 'none',
        maxWidth: 300,
      }}
    >
      <div style={{
        background: '#fff',
        borderRadius: 10,
        boxShadow: '0 4px 20px rgba(0,0,0,0.14)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        border: '1px solid #e5e7eb',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 13,
        position: 'relative',
      }}>
        {/* Product image */}
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 6,
          overflow: 'hidden',
          flexShrink: 0,
          background: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <img
            src={toast.product.img}
            alt={toast.product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, color: '#111827', lineHeight: 1.3, marginBottom: 2 }}>
            Someone from {toast.city}
          </div>
          <div style={{ color: '#374151', lineHeight: 1.3 }}>
            ordered{' '}
            <Link
              href={`/products/${toast.product.slug}`}
              style={{ color: '#0F2A4A', fontWeight: 600, textDecoration: 'none' }}
            >
              {toast.product.name}
            </Link>
          </div>
          <div style={{ color: '#9ca3af', fontSize: 11, marginTop: 2 }}>{toast.time}</div>
        </div>

        {/* Close button */}
        <button
          onClick={() => { setVisible(false); clearTimeout(hideRef.current); }}
          aria-label="Dismiss"
          style={{
            position: 'absolute',
            top: 6,
            right: 8,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#9ca3af',
            fontSize: 16,
            lineHeight: 1,
            padding: 2,
          }}
        >
          ×
        </button>

        {/* Green dot indicator */}
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#0ea5e9',
          boxShadow: '0 0 0 2px #dcfce7',
        }} />
      </div>
    </div>
  );
}
