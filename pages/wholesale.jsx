import { useState } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';

const TIERS = [
  {
    name: 'Silver',
    min: 'CAD$500',
    discount: '10% off',
    pct: 10,
    perks: ['Priority processing', 'Bulk invoice billing', 'Dedicated support line'],
    color: '#9ca3af',
    bg: '#f9fafb',
  },
  {
    name: 'Gold',
    min: 'CAD$1,500',
    discount: '15% off',
    pct: 15,
    perks: ['Everything in Silver', 'Custom label options', 'Net-30 payment terms', 'Quarterly pricing review'],
    color: '#d97706',
    bg: '#fffbeb',
    featured: true,
  },
  {
    name: 'Platinum',
    min: 'CAD$5,000+',
    discount: '20%+ off',
    pct: 20,
    perks: ['Everything in Gold', 'White-label vials available', 'Dedicated account rep', 'First access to new compounds'],
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
];

const FIELDS = [
  { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Dr. Jane Smith', required: true },
  { id: 'email', label: 'Business Email', type: 'email', placeholder: 'jane@researchlab.org', required: true },
  { id: 'phone', label: 'Phone Number', type: 'tel', placeholder: '(555) 123-4567', required: false },
  { id: 'organization', label: 'Organization / Lab Name', type: 'text', placeholder: 'Smith Research Institute', required: true },
  { id: 'website', label: 'Website', type: 'url', placeholder: 'https://yourlab.com', required: false },
  { id: 'state', label: 'Province', type: 'text', placeholder: 'Ontario', required: true },
];

export default function WholesalePage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', organization: '', website: '', state: '', tier: 'Gold', volume: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (id, val) => setForm(prev => ({ ...prev, [id]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Send to the contact API with type=wholesale
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type: 'wholesale' }),
      });
    } catch (_) {}
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <Layout
      title="Wholesale & Bulk Pricing | EVO Labs Research Canada"
      description="Research institutions, labs, and qualified buyers — apply for wholesale pricing on EVO Labs Research Canada peptides. Up to 20% off on bulk orders."
    >
      {/* Header */}
      <div style={{ background: '#0a0a0a', padding: '72px 0 60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(6,182,212,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#06b6d4', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
            Institutional Access
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 16 }}>
            Wholesale & Bulk Pricing
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', maxWidth: 520, lineHeight: 1.7 }}>
            Qualified research institutions, labs, and institutional buyers can apply for tiered wholesale pricing — up to 20% off retail on all compounds.
          </p>
        </div>
      </div>

      {/* Tiers */}
      <section style={{ background: '#f9fafb', padding: '60px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: '#111827', letterSpacing: '-0.02em', marginBottom: 8 }}>Wholesale Tiers</h2>
            <p style={{ fontSize: 15, color: '#6b7280' }}>Discount applied to all products once your account is verified.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, maxWidth: 900, margin: '0 auto' }} className="tier-grid">
            {TIERS.map(t => (
              <div key={t.name} style={{
                background: t.featured ? '#fff' : t.bg,
                border: t.featured ? `2px solid ${t.color}` : '1px solid #e5e7eb',
                borderRadius: 20, padding: '28px 24px',
                position: 'relative', overflow: 'hidden',
                boxShadow: t.featured ? '0 8px 40px rgba(217,119,6,0.12)' : 'none',
              }}>
                {t.featured && (
                  <div style={{
                    position: 'absolute', top: 14, right: -24, transform: 'rotate(40deg)',
                    background: t.color, color: '#fff', fontSize: 10, fontWeight: 800,
                    padding: '3px 32px', letterSpacing: '0.08em',
                  }}>POPULAR</div>
                )}
                <div style={{ fontSize: 11, fontWeight: 800, color: t.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{t.name}</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#111827', letterSpacing: '-0.02em', marginBottom: 4 }}>{t.discount}</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>on orders from {t.min}/month</div>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {t.perks.map(p => (
                    <li key={p} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#374151' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      {p}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => { handleChange('tier', t.name); document.getElementById('wholesale-form')?.scrollIntoView({ behavior: 'smooth' }); }}
                  style={{
                    marginTop: 20, width: '100%', padding: '11px 20px', borderRadius: 10,
                    background: t.featured ? t.color : 'transparent',
                    color: t.featured ? '#fff' : t.color,
                    border: `1.5px solid ${t.color}`,
                    fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}
                >
                  Apply for {t.name} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="section" id="wholesale-form">
        <div className="container" style={{ maxWidth: 640 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: '#111827', letterSpacing: '-0.02em', marginBottom: 8 }}>Apply for Wholesale Access</h2>
            <p style={{ fontSize: 15, color: '#6b7280' }}>We review applications within 1–2 business days. All accounts are subject to verification.</p>
          </div>

          {submitted ? (
            <div style={{ textAlign: 'center', background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 20, padding: '48px 32px' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', border: '2px solid #06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: '#14532d', marginBottom: 10 }}>Application Received!</h3>
              <p style={{ fontSize: 15, color: '#166534', lineHeight: 1.7, maxWidth: 400, margin: '0 auto 24px' }}>
                We'll review your application and reach out to <strong>{form.email}</strong> within 1–2 business days.
              </p>
              <Link href="/products" style={{ background: '#0F2A4A', color: '#fff', padding: '13px 28px', borderRadius: 100, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                Browse Products →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 24, padding: '40px', border: '1px solid #f0f0f0', boxShadow: '0 4px 32px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 18 }}>

              {FIELDS.map(f => (
                <div key={f.id}>
                  <label htmlFor={f.id} style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>
                    {f.label} {f.required && <span style={{ color: '#ef4444' }}>*</span>}
                  </label>
                  <input
                    id={f.id}
                    type={f.type}
                    required={f.required}
                    placeholder={f.placeholder}
                    value={form[f.id]}
                    onChange={e => handleChange(f.id, e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, color: '#111827', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor = '#0F2A4A'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              ))}

              {/* Tier select */}
              <div>
                <label htmlFor="tier" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>
                  Desired Tier <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  id="tier"
                  value={form.tier}
                  onChange={e => handleChange('tier', e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, color: '#111827', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', background: '#fff', cursor: 'pointer' }}
                >
                  {TIERS.map(t => <option key={t.name} value={t.name}>{t.name} — {t.discount} (from {t.min}/mo)</option>)}
                </select>
              </div>

              {/* Monthly volume */}
              <div>
                <label htmlFor="volume" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>
                  Estimated Monthly Volume
                </label>
                <select
                  id="volume"
                  value={form.volume}
                  onChange={e => handleChange('volume', e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, color: '#111827', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', background: '#fff', cursor: 'pointer' }}
                >
                  <option value="">Select range</option>
                  <option>CAD$500 – CAD$1,499</option>
                  <option>CAD$1,500 – CAD$4,999</option>
                  <option>CAD$5,000 – CAD$9,999</option>
                  <option>CAD$10,000+</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>
                  Tell Us About Your Research <span style={{ color: '#9ca3af', fontWeight: 400, textTransform: 'none' }}>(optional)</span>
                </label>
                <textarea
                  id="message"
                  rows={3}
                  placeholder="Describe your research focus, compounds of interest, or any specific requirements..."
                  value={form.message}
                  onChange={e => handleChange('message', e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, color: '#111827', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#0F2A4A'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ padding: '14px 24px', background: loading ? '#e5e7eb' : '#0F2A4A', color: loading ? '#9ca3af' : '#fff', borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 700, cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}
              >
                {loading ? 'Submitting...' : 'Submit Application →'}
              </button>

              <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', lineHeight: 1.6 }}>
                For Research Use Only — Not for Human Consumption. All accounts are verified before approval. By applying you agree to our{' '}
                <Link href="/terms" style={{ color: '#0F2A4A' }}>Terms of Service</Link> and{' '}
                <Link href="/research-use" style={{ color: '#0F2A4A' }}>Research Use Agreement</Link>.
              </p>
            </form>
          )}
        </div>
      </section>

      <style>{`
        @media (max-width: 720px) {
          .tier-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Layout>
  );
}
