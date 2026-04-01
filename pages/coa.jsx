import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { COAS } from '../lib/data';

export default function COAPage() {
  const { data: session, status } = useSession();
  const [search, setSearch] = useState('');
  const [adminBypass, setAdminBypass] = useState(false);
  useEffect(() => {
    setAdminBypass(!!localStorage.getItem('evo_admin_pw') && !sessionStorage.getItem('evo_preview_guest'));
  }, []);

  if (status === 'loading') {
    return (
      <Layout title="COA Library | EVO Labs Research Canada">
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!session && !adminBypass) {
    return (
      <Layout title="COA Library | EVO Labs Research Canada">
        <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
          <div style={{ textAlign: 'center', maxWidth: 480, padding: '0 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>🔒</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 12 }}>
              Sign In to Access COA Library
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
              Our full Certificate of Analysis library is available to registered members. Create a free account or sign in to view all batch reports.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              <Link href="/account/login?mode=signup" style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: '#06b6d4', color: '#0a0a0a',
                padding: '13px 28px', borderRadius: 100,
                fontSize: 14, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap',
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                Free account — takes 10 seconds
              </Link>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>or</span>
              <Link href="/account/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)',
                padding: '13px 24px', borderRadius: 100,
                fontSize: 14, fontWeight: 600, textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.15)', whiteSpace: 'nowrap',
              }}>
                Sign in
              </Link>
            </div>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['No credit card required', 'We never sell your data', 'Unlock full COA library'].map(t => (
                <span key={t} style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ color: '#06b6d4', fontWeight: 700 }}>✓</span> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const filtered = COAS.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.batch.includes(search)
  );

  return (
    <Layout
      title="COA Library | EVO Labs Research Canada"
      description="Full Certificate of Analysis library for every EVO Labs Research peptide. Download HPLC and mass spectrometry test results by batch number."
    >
      {/* Header */}
      <div style={{ background: '#0a0a0a', padding: '72px 0 60px' }}>
        <div className="container">
          <div style={{ fontSize: 12, fontWeight: 700, color: '#06b6d4', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
            Transparency First
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 16, maxWidth: 640 }}>
            Certificate of Analysis Library
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', maxWidth: 560, lineHeight: 1.8 }}>
            Every batch independently tested by Janoshik Analytical — one of the most trusted labs in the industry since 2013. Full HPLC and mass spectrometry reports — publicly available, always.
          </p>

          {/* Search */}
          <div style={{ marginTop: 36, maxWidth: 440, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
            <input
              className="input"
              placeholder="Search by compound name or batch number..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 48, background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: 100 }}
            />
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background: '#0F2A4A', padding: '20px 0' }}>
        <div className="container" style={{ display: 'flex', gap: 48, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { val: `${COAS.length}+`, label: 'COAs Published' },
            { val: '99%+', label: 'Average Purity' },
            { val: '100%', label: 'Batch Coverage' },
            { val: 'HPLC + MS', label: 'Test Methods' },
          ].map(s => (
            <div key={s.val} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>{s.val}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* COA grid */}
      <section className="section">
        <div className="container">
          {/* Result count */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 14, color: '#6b7280' }}>
              Showing <strong style={{ color: '#111827' }}>{filtered.length}</strong> of {COAS.length} COAs
              {search && ` for "${search}"`}
            </p>
            {search && (
              <button onClick={() => setSearch('')} style={{ fontSize: 13, color: '#0F2A4A', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                Clear search ×
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
              <p style={{ fontSize: 18, fontWeight: 600, color: '#374151' }}>No COAs found</p>
              <p style={{ fontSize: 14, marginTop: 8 }}>Try searching for the compound name or batch number.</p>
              <button onClick={() => setSearch('')} className="btn-green" style={{ marginTop: 24 }}>
                Show All COAs
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16 }} className="coa-grid">
              {filtered.map((coa, i) => (
                <a
                  key={i}
                  href={coa.pdf || undefined}
                  target={coa.pdf ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="coa-card"
                  style={{ display: 'block', textDecoration: 'none', cursor: coa.pdf ? 'pointer' : 'default', opacity: coa.pdf ? 1 : 0.6 }}
                  onClick={!coa.pdf ? (e => e.preventDefault()) : undefined}
                >
                  {/* COA thumbnail */}
                  <div style={{ background: '#f1f5f9', aspectRatio: '3/4', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src={coa.img}
                      alt={`${coa.name} COA`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                      loading="lazy"
                      onError={e => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<div style="font-size:36px;padding:24px">📄</div>'; }}
                    />
                  </div>
                  <div style={{ padding: '12px 12px 14px' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#111827', lineHeight: 1.3, marginBottom: 4 }}>{coa.name}</p>
                    <p style={{ fontSize: 10, color: '#9ca3af' }}>Batch #{coa.batch}</p>
                    <p style={{ fontSize: 10, color: '#9ca3af' }}>{coa.tested}</p>
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#166534', background: '#dcfce7', padding: '2px 8px', borderRadius: 100 }}>99%+ Purity</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Info section */}
      <section className="section-sm" style={{ background: '#fafafa', borderTop: '1px solid #f0f0f0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }} className="info-grid">
            {[
              {
                icon: '🔬',
                title: 'HPLC Testing',
                desc: 'High-performance liquid chromatography separates and quantifies each compound to verify identity and purity percentage.',
              },
              {
                icon: '⚗️',
                title: 'Mass Spectrometry',
                desc: 'Mass spec analysis confirms molecular weight and identity, ruling out contamination and verifying compound structure.',
              },
              {
                icon: '📋',
                title: 'Janoshik Analytical',
                desc: 'All testing is conducted by Janoshik Analytical (Prague, est. 2013) — an independent laboratory with no financial relationship to EVO Labs. We are also adding Kovera Labs (Illinois, USA) for dual-lab verification.',
              },
            ].map(item => (
              <div key={item.title} style={{ background: '#fff', borderRadius: 20, padding: '32px', border: '1px solid #f0f0f0' }}>
                <div style={{ fontSize: 28, marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0a0a0a', marginBottom: 10 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.75 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 1200px) {
          .coa-grid { grid-template-columns: repeat(5, 1fr) !important; }
        }
        @media (max-width: 960px) {
          .coa-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .info-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .coa-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 420px) {
          .coa-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </Layout>
  );
}
