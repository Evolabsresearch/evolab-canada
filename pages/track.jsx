import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Link from 'next/link';

const STATUS_LABELS = {
  Pending:        { label: 'Pending',            color: '#6b7280', bg: '#f9fafb' },
  InfoReceived:   { label: 'Info Received',      color: '#6366f1', bg: '#eef2ff' },
  InTransit:      { label: 'In Transit',         color: '#2563eb', bg: '#eff6ff' },
  OutForDelivery: { label: 'Out for Delivery',   color: '#d97706', bg: '#fffbeb' },
  AttemptFail:    { label: 'Delivery Attempted', color: '#ef4444', bg: '#fef2f2' },
  Delivered:      { label: 'Delivered',           color: '#0ea5e9', bg: '#eff6ff' },
  Exception:      { label: 'Exception',           color: '#ef4444', bg: '#fef2f2' },
};

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function TrackOrderPage() {
  const router = useRouter();
  const [trackingNum, setTrackingNum] = useState('');
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState(null);
  const [error, setError]             = useState('');

  useEffect(() => {
    const num = router.query.number;
    if (num) { setTrackingNum(String(num)); doTrack(String(num)); }
  }, [router.query.number]);

  async function doTrack(num) {
    const clean = (num || trackingNum).trim();
    if (!clean) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/tracking/public?number=' + encodeURIComponent(clean));
      const json = await res.json();
      if (!res.ok) setError(json.error || 'Could not find tracking information.');
      else setResult(json);
    } catch (e) { setError('Failed to fetch tracking. Please try again.'); }
    finally { setLoading(false); }
  }

  const si = result ? (STATUS_LABELS[result.status] || { label: result.statusDisplay || result.status, color: '#6b7280', bg: '#f9fafb' }) : null;

  return (
    <Layout title="Track Your Order | EVO Labs Research" description="Track your EVO Labs Research order with live updates.">

      <div style={{ background: '#0a0a0a', padding: '72px 0 60px' }}>
        <div className="container">
          <div style={{ fontSize: 12, fontWeight: 700, color: '#06b6d4', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>Order Status</div>
          <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 16 }}>Track Your Order</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', maxWidth: 460 }}>Enter your tracking number for live shipment updates.</p>
        </div>
      </div>

      <section className="section">
        <div className="container" style={{ maxWidth: 640 }}>

          <div style={{ background: '#fff', borderRadius: 24, padding: '36px 40px', border: '1px solid #f0f0f0', boxShadow: '0 4px 32px rgba(0,0,0,0.06)', marginBottom: 28 }}>
            <form onSubmit={e => { e.preventDefault(); doTrack(trackingNum); }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Tracking Number</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <input type="text" value={trackingNum}
                  onChange={e => { setTrackingNum(e.target.value); setResult(null); setError(''); }}
                  placeholder="e.g. 1Z999AA10123456784"
                  style={{ flex: 1, padding: '13px 16px', border: '1.5px solid #e5e7eb', borderRadius: 12, fontSize: 15, color: '#111827', outline: 'none', fontFamily: 'monospace', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#0F2A4A'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
                <button type="submit" disabled={!trackingNum.trim() || loading}
                  style={{ padding: '13px 24px', background: '#0F2A4A', color: '#fff', borderRadius: 12, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, opacity: (!trackingNum.trim() || loading) ? 0.5 : 1 }}>
                  {loading ? 'Tracking\u2026' : 'Track \u2192'}
                </button>
              </div>
            </form>

            {error && (
              <div style={{ marginTop: 16, padding: '14px 18px', background: '#fef2f2', borderRadius: 12, border: '1px solid #fecaca' }}>
                <p style={{ fontSize: 14, color: '#dc2626', fontWeight: 600, margin: 0 }}>{error}</p>
                <p style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>
                  {"Can't find it? "}<Link href="/contact" style={{ color: '#0F2A4A', fontWeight: 700 }}>Contact support</Link>
                </p>
              </div>
            )}
          </div>

          {result && (
            <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #f0f0f0', boxShadow: '0 4px 32px rgba(0,0,0,0.06)', overflow: 'hidden', marginBottom: 28 }}>
              <div style={{ padding: '28px 36px', background: si?.bg || '#f9fafb', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                      {result.carrier?.toUpperCase()} &middot; {result.trackingNumber}
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: si?.color || '#111827' }}>{si?.label || result.status}</div>
                    {result.estimatedDelivery && <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Est. delivery: {fmtDate(result.estimatedDelivery)}</div>}
                  </div>
                  <div style={{ fontSize: 40 }}>
                    {result.status === 'Delivered' ? '\u2705' : result.status === 'OutForDelivery' ? '\uD83D\uDE9A' : '\uD83D\uDCE6'}
                  </div>
                </div>
              </div>

              {result.checkpoints && result.checkpoints.length > 0 ? (
                <div style={{ padding: '28px 36px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>Tracking History</div>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 7, top: 12, bottom: 12, width: 2, background: '#e5e7eb' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      {result.checkpoints.map((cp, i) => (
                        <div key={i} style={{ display: 'flex', gap: 20, position: 'relative' }}>
                          <div style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0, marginTop: 2, background: i === 0 ? (si?.color || '#0F2A4A') : '#d1d5db', border: '2px solid ' + (i === 0 ? (si?.color || '#0F2A4A') : '#d1d5db'), zIndex: 1 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: i === 0 ? 700 : 500, color: i === 0 ? '#111827' : '#374151', lineHeight: 1.4 }}>{cp.message}</div>
                            {cp.location && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>{cp.location}</div>}
                            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{fmtDate(cp.datetime)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '28px 36px', textAlign: 'center', color: '#6b7280' }}>
                  <p>Tracking details will appear once your shipment is scanned by the carrier.</p>
                </div>
              )}
            </div>
          )}

          {!result && !loading && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="track-grid">
              {[
                { icon: '\uD83D\uDCE7', title: 'Tracking Email', body: 'You receive a tracking number by email once your order ships.' },
                { icon: '\u26A1', title: 'Ships Same Day', body: 'Orders placed before 2pm ET ship same day from Toronto, ON.' },
                { icon: '\uD83C\uDDFA\uD83C\uDDF8', title: 'Domestic Only', body: 'We ship within the continental United States via USPS and UPS.' },
                { icon: '\uD83D\uDCAC', title: 'Need Help?', body: 'Email support@evolabsresearch.ca with your order ID.' },
              ].map(({ icon, title, body }) => (
                <div key={title} style={{ background: '#f9fafb', border: '1px solid #f0f0f0', borderRadius: 16, padding: '20px' }}>
                  <div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{title}</h3>
                  <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{body}</p>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      <style>{'.track-grid { } @media (max-width: 560px) { .track-grid { grid-template-columns: 1fr !important; } }'}</style>
    </Layout>
  );
}
