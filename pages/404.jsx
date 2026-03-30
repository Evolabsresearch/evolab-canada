import Link from 'next/link';
import Layout from '../components/Layout';
import { useState } from 'react';
import { products } from '../lib/data';

const FEATURED_PRODUCTS = ['bpc-157', 'glp-3-r', 'hgh-191aa', 'klow'].map(slug =>
  products.find(p => p.slug === slug)
).filter(Boolean);

export default function NotFound() {
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(search.trim())}`;
    }
  };

  return (
    <Layout title="Page Not Found | EVO Labs Research" description="The page you're looking for doesn't exist. Browse our research peptide catalog.">
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center', fontFamily: "'Anek Telugu', sans-serif" }}>

        {/* 404 Visual */}
        <div style={{ fontSize: 120, fontWeight: 900, color: '#f3f4f6', letterSpacing: '-0.06em', lineHeight: 1, marginBottom: 0, userSelect: 'none' }}>
          404
        </div>
        <div style={{ marginTop: -20, marginBottom: 24 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', letterSpacing: '0.12em', textTransform: 'uppercase', background: '#f0fdf4', padding: '4px 12px', borderRadius: 9999 }}>
            Page Not Found
          </span>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
          This compound hasn't been synthesized yet
        </h1>
        <p style={{ fontSize: 16, color: '#6b7280', margin: '0 0 32px', maxWidth: 420, lineHeight: 1.6 }}>
          The page you're looking for doesn't exist or may have moved. Try searching our catalog or browse popular products below.
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 0, width: '100%', maxWidth: 440, marginBottom: 40, borderRadius: 12, overflow: 'hidden', border: '2px solid #e5e7eb', background: '#fff' }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search peptides, research kits..."
            style={{ flex: 1, padding: '14px 20px', border: 'none', outline: 'none', fontSize: 15, background: 'transparent' }}
          />
          <button type="submit" style={{
            padding: '14px 24px', background: '#1B4D3E', color: '#fff',
            border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700,
          }}>
            Search →
          </button>
        </form>

        {/* Quick Links */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 48 }}>
          {[
            { href: '/products', label: '🧬 Browse All Products' },
            { href: '/research', label: '📚 Research Library' },
            { href: '/coa', label: '🔬 COA Library' },
            { href: '/contact', label: '✉ Contact Support' },
          ].map(({ href, label }) => (
            <Link key={href} href={href} style={{
              padding: '10px 20px', border: '1px solid #e5e7eb', borderRadius: 10,
              textDecoration: 'none', color: '#374151', fontSize: 14, fontWeight: 500,
              background: '#fff', transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#1B4D3E'; e.currentTarget.style.color = '#1B4D3E'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151'; }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Popular Products */}
        <div style={{ width: '100%', maxWidth: 800 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 16 }}>Popular Research Compounds</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {FEATURED_PRODUCTS.map(p => (
              <Link key={p.slug} href={`/products/${p.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', background: '#fff', transition: 'box-shadow 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  <div style={{ background: '#f9fafb', padding: 12, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={p.image} alt={p.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} loading="lazy" />
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#111', lineHeight: 1.3 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: '#4ade80', fontWeight: 700, marginTop: 4 }}>{p.salePrice || p.price}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
