/**
 * PharmCard — NuBiogen-style pharmaceutical compound profile card
 *
 * Props:
 *   product    — product object from lib/data.js
 *   chemData   — entry from CHEM_DATA (subname, cas, formula, mw)  — can be null
 *   catConfig  — category config from CATEGORIES (color, accentColor, name)
 */
export default function PharmCard({ product, chemData, catConfig }) {
  if (!chemData) return null;

  const accent = catConfig?.accentColor || '#1B4D3E';
  const pastel = catConfig?.color || '#E8F5EE';
  const isBlend = chemData.cas === 'Blend' || chemData.formula === 'Blend' || chemData.formula === 'Peptide Mixture' || chemData.formula === 'See COA';

  return (
    <div style={{
      background: '#fff',
      borderRadius: 20,
      overflow: 'hidden',
      boxShadow: '0 4px 40px rgba(0,0,0,0.10)',
      fontFamily: "'Poppins', 'Anek Telugu', sans-serif",
      maxWidth: 860,
      width: '100%',
    }}>

      {/* ── Header bar ── */}
      <div style={{
        background: accent,
        padding: '14px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <img
          src="/images/evo-logo.png"
          alt="EVO Labs Research"
          style={{ height: 26, filter: 'brightness(0) invert(1)', display: 'block' }}
        />
        <span style={{
          fontSize: 10,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.65)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}>
          Research Grade · 99%+ Purity
        </span>
      </div>

      {/* ── Card body ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 280px',
        minHeight: 320,
      }} className="pharmcard-body">

        {/* Left: compound info */}
        <div style={{ padding: '32px 36px 32px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

          {/* Name + category */}
          <div style={{ marginBottom: 28 }}>
            <p style={{
              fontSize: 11,
              fontWeight: 600,
              color: accent,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}>
              {catConfig?.name || 'Research Compound'}
            </p>
            <h2 style={{
              fontSize: 'clamp(22px, 3vw, 30px)',
              fontWeight: 800,
              color: '#0a0a0a',
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
              marginBottom: 4,
            }}>
              {product.name}
            </h2>
            {chemData.subname && (
              <p style={{ fontSize: 13, color: '#6b7280', fontStyle: 'italic', marginTop: 4 }}>
                {chemData.subname}
              </p>
            )}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: `${accent}22`, marginBottom: 24 }} />

          {/* Chemical data block */}
          {!isBlend ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto', gap: '8px 32px', marginBottom: 28 }}>
              {/* CAS */}
              <div>
                <p style={{ fontSize: 9, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>CAS Number</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', fontFamily: "'Courier New', monospace" }}>{chemData.cas}</p>
              </div>
              {/* Formula */}
              <div>
                <p style={{ fontSize: 9, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>Molecular Formula</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: accent, letterSpacing: '0.02em' }}>{chemData.formula}</p>
              </div>
              {/* MW */}
              <div>
                <p style={{ fontSize: 9, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>Molecular Weight</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>{chemData.mw} <span style={{ fontSize: 10, color: '#9ca3af' }}>g/mol</span></p>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>Composition</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: accent }}>Multi-Compound Blend</p>
              <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Full compositional data available in Certificate of Analysis</p>
            </div>
          )}

          {/* Divider */}
          <div style={{ height: 1, background: `${accent}22`, marginBottom: 24 }} />

          {/* PURITY + RUO row */}
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
            <div>
              <p style={{
                fontSize: 9,
                fontWeight: 800,
                color: accent,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginBottom: 4,
              }}>
                Purity
              </p>
              <p style={{ fontSize: 18, fontWeight: 800, color: '#0a0a0a', letterSpacing: '-0.01em' }}>
                {'>'}&thinsp;99% HPLC
              </p>
            </div>
            <div>
              <p style={{
                fontSize: 9,
                fontWeight: 800,
                color: accent,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginBottom: 4,
              }}>
                Designation
              </p>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>
                RUO · Research Use Only
              </p>
              <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 2, maxWidth: 220, lineHeight: 1.5 }}>
                Not for human or veterinary consumption. For in vitro laboratory research only.
              </p>
            </div>
          </div>
        </div>

        {/* Right: vial image panel (hidden on mobile since hero already shows product) */}
        <div className="pharmcard-image" style={{
          background: `radial-gradient(ellipse at 50% 58%, ${pastel} 0%, #ececec 82%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px',
          position: 'relative',
          borderRadius: '0 0 20px 0',
        }}>
          <img
            src={product.image}
            alt={product.name}
            style={{
              width: '92%',
              height: '92%',
              objectFit: 'contain',
              display: 'block',
              filter: 'drop-shadow(0 10px 32px rgba(0,0,0,0.22)) contrast(1.04) saturate(1.06)',
            }}
          />
        </div>
      </div>

      {/* ── Footer bar ── */}
      <div style={{
        background: '#f9fafb',
        borderTop: `1px solid ${accent}18`,
        padding: '10px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
      }}>
        <p style={{ fontSize: 10, color: '#9ca3af', letterSpacing: '0.05em' }}>
          Third-Party Tested · Certificate of Analysis Included · Ships from Toronto, ON Canada
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 9,
            fontWeight: 700,
            color: accent,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            background: `${accent}14`,
            padding: '3px 10px',
            borderRadius: 20,
          }}>
            Batch Verified
          </span>
          <span style={{
            fontSize: 9,
            fontWeight: 700,
            color: '#6b7280',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            background: '#f3f4f6',
            padding: '3px 10px',
            borderRadius: 20,
          }}>
            Lyophilized
          </span>
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .pharmcard-body {
            grid-template-columns: 1fr !important;
          }
          .pharmcard-image {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
