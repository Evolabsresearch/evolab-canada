import { ImageResponse } from 'next/og';

export const config = { runtime: 'edge' };

const LOGO_URL = 'https://evolabsresearch.ca/images/evo-logo.png';

export default function handler(req) {
  const { searchParams } = new URL(req.url);
  const sub = searchParams.get('sub') || 'Research-Grade Peptides. Zero Compromise.';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0d1f1a',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Radial green glow behind logo */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -60%)',
          width: 900, height: 500,
          background: 'radial-gradient(ellipse, rgba(27,77,62,0.6) 0%, transparent 65%)',
          display: 'flex',
        }} />

        {/* Top accent bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: 5, background: 'linear-gradient(90deg, #1B4D3E, #4ade80, #1B4D3E)',
          display: 'flex',
        }} />

        {/* Bottom accent bar */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 3, background: 'linear-gradient(90deg, transparent, rgba(74,222,128,0.3), transparent)',
          display: 'flex',
        }} />

        {/* Logo — the real branded image */}
        <img
          src={LOGO_URL}
          style={{
            width: 520,
            objectFit: 'contain',
            position: 'relative',
            marginBottom: 40,
          }}
        />

        {/* Tagline */}
        <div style={{
          display: 'flex',
          fontSize: 26,
          color: '#9ca3af',
          fontWeight: 500,
          letterSpacing: '0.04em',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}>
          {sub}
        </div>

        {/* Trust badges row */}
        <div style={{
          display: 'flex',
          gap: 16,
          marginTop: 40,
          position: 'relative',
        }}>
          {['99%+ Purity', '3rd-Party Tested', 'COA Every Batch'].map(badge => (
            <div key={badge} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(27,77,62,0.5)',
              border: '1px solid rgba(74,222,128,0.35)',
              borderRadius: 999,
              padding: '10px 20px',
            }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#4ade80', display: 'flex',
              }} />
              <span style={{
                fontSize: 16, color: '#d1fae5', fontWeight: 600,
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}>{badge}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
