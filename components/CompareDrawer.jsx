import { useState } from 'react';
import Link from 'next/link';
import { useCompare } from '../context/CompareContext';
import { products, getCategoryConfig } from '../lib/data';
import { useCart } from '../context/CartContext';

const COMPARE_ROWS = [
  { label: 'Category', key: 'category' },
  { label: 'Price', key: '_price' },
  { label: 'Rating', key: '_rating' },
  { label: 'Best For', key: '_use' },
  { label: 'Purity', key: '_purity' },
  { label: 'COA', key: '_coa' },
];

// Static metadata for compare rows
const META = {
  'bpc-157':           { _use: 'Tissue repair, joints', _rating: '4.9 ★', _purity: '99%+', _coa: '✓' },
  'tb-500':            { _use: 'Systemic healing', _rating: '4.8 ★', _purity: '99%+', _coa: '✓' },
  'glp-3-r':           { _use: 'Metabolic, body comp', _rating: '4.9 ★', _purity: '99%+', _coa: '✓' },
  'glp-2-t':           { _use: 'Metabolic research', _rating: '4.8 ★', _purity: '99%+', _coa: '✓' },
  'hgh-191aa':         { _use: 'Growth hormone axis', _rating: '4.9 ★', _purity: '99%+', _coa: '✓' },
  'nad':               { _use: 'Energy, longevity', _rating: '4.8 ★', _purity: '99%+', _coa: '✓' },
  'epithalon':         { _use: 'Anti-aging, telomeres', _rating: '4.7 ★', _purity: '99%+', _coa: '✓' },
  'klow':              { _use: 'Multi-target healing', _rating: '4.9 ★', _purity: '99%+', _coa: '✓' },
  'mots-c':            { _use: 'Metabolic, exercise', _rating: '4.8 ★', _purity: '99%+', _coa: '✓' },
  'ipamorelin':        { _use: 'GH secretagogue', _rating: '4.7 ★', _purity: '99%+', _coa: '✓' },
  'semax':             { _use: 'Cognitive, neuroprotect', _rating: '4.8 ★', _purity: '99%+', _coa: '✓' },
  'selank':            { _use: 'Anxiety, cognition', _rating: '4.7 ★', _purity: '99%+', _coa: '✓' },
  'nad+':              { _use: 'Energy, longevity', _rating: '4.8 ★', _purity: '99%+', _coa: '✓' },
  'ss31':              { _use: 'Cardio, mitochondria', _rating: '4.7 ★', _purity: '99%+', _coa: '✓' },
  'glutathione':       { _use: 'Detox, antioxidant', _rating: '4.8 ★', _purity: '99%+', _coa: '✓' },
};

function getProductMeta(slug) {
  return META[slug.toLowerCase()] || { _use: 'Research compound', _rating: '4.7 ★', _purity: '99%+', _coa: '✓' };
}

export default function CompareDrawer() {
  const { compareList, open, setOpen, removeFromCompare, clearCompare } = useCompare();
  const { addItem } = useCart();

  const compared = compareList
    .map(slug => products.find(p => p.slug === slug))
    .filter(Boolean);

  if (!open || compared.length === 0) return null;

  function getValue(product, key) {
    if (key === '_price') return product.salePrice || product.price;
    if (key === 'category') return product.category;
    const meta = getProductMeta(product.slug);
    return meta[key] || '—';
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          zIndex: 9998, backdropFilter: 'blur(2px)',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#fff', zIndex: 9999,
        borderRadius: '24px 24px 0 0',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
        maxHeight: '85vh', overflowY: 'auto',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: 40, height: 4, borderRadius: 9999, background: '#e5e7eb' }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px', borderBottom: '1px solid #f3f4f6',
        }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0a0a0a', margin: 0 }}>
              Compare Products
            </h2>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>
              {compared.length} of 3 selected
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={clearCompare}
              style={{
                padding: '7px 14px', background: 'none',
                border: '1px solid #e5e7eb', borderRadius: 8,
                fontSize: 12, color: '#6b7280', cursor: 'pointer',
              }}
            >
              Clear all
            </button>
            <button
              onClick={() => setOpen(false)}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: '#f3f4f6', border: 'none',
                fontSize: 18, cursor: 'pointer', color: '#374151',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Comparison table */}
        <div style={{ padding: '20px 24px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 400 }}>
            {/* Product headers */}
            <thead>
              <tr>
                <th style={{ width: 120, padding: '0 12px 16px 0', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Attribute
                </th>
                {compared.map(p => {
                  const cat = getCategoryConfig(p.category);
                  return (
                    <th key={p.slug} style={{ padding: '0 12px 16px', textAlign: 'center', minWidth: 150 }}>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                          onClick={() => removeFromCompare(p.slug)}
                          style={{
                            position: 'absolute', top: -6, right: -6,
                            width: 18, height: 18, borderRadius: '50%',
                            background: '#e5e7eb', border: 'none',
                            fontSize: 12, cursor: 'pointer', color: '#6b7280',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            lineHeight: 1,
                          }}
                        >×</button>
                        <div style={{
                          width: 56, height: 56, borderRadius: 12, margin: '0 auto 8px',
                          background: `radial-gradient(ellipse at 50% 60%, ${cat.color} 0%, #f5f5f5 80%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <img src={p.image} alt={p.name} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#111', lineHeight: 1.3 }}>{p.name}</div>
                      </div>
                    </th>
                  );
                })}
                {/* Empty slots */}
                {Array.from({ length: 3 - compared.length }).map((_, i) => (
                  <th key={`empty-${i}`} style={{ padding: '0 12px 16px', textAlign: 'center', minWidth: 150 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 12, margin: '0 auto 8px',
                      border: '2px dashed #e5e7eb', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 22, color: '#d1d5db',
                    }}>+</div>
                    <div style={{ fontSize: 11, color: '#d1d5db' }}>Add product</div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Rows */}
            <tbody>
              {COMPARE_ROWS.map((row, rowIdx) => (
                <tr key={row.key} style={{ background: rowIdx % 2 === 0 ? '#fafafa' : '#fff' }}>
                  <td style={{ padding: '10px 12px 10px 0', fontSize: 12, fontWeight: 600, color: '#374151', borderTop: '1px solid #f3f4f6' }}>
                    {row.label}
                  </td>
                  {compared.map(p => (
                    <td key={p.slug} style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, color: '#374151', borderTop: '1px solid #f3f4f6' }}>
                      {getValue(p, row.key)}
                    </td>
                  ))}
                  {Array.from({ length: 3 - compared.length }).map((_, i) => (
                    <td key={`empty-${i}`} style={{ borderTop: '1px solid #f3f4f6' }} />
                  ))}
                </tr>
              ))}
            </tbody>

            {/* CTA row */}
            <tfoot>
              <tr>
                <td />
                {compared.map(p => (
                  <td key={p.slug} style={{ padding: '16px 12px 0', textAlign: 'center' }}>
                    <button
                      onClick={() => { addItem(p, { dosage: '5mg', bundleCount: 1 }); }}
                      style={{
                        display: 'block', width: '100%', padding: '10px 0',
                        background: '#0F2A4A', color: '#fff', border: 'none',
                        borderRadius: 10, fontSize: 12, fontWeight: 700,
                        cursor: 'pointer', marginBottom: 6,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      + Add to Cart
                    </button>
                    <Link
                      href={`/products/${p.slug}`}
                      style={{ fontSize: 11, color: '#6b7280', textDecoration: 'none' }}
                      onClick={() => setOpen(false)}
                    >
                      View Details →
                    </Link>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
}
