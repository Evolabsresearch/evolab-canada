import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Load the map only on client side (no SSR)
const TrackingMap = dynamic(() => import('../../../components/TrackingMap'), { ssr: false });

const TAG_STYLES = {
  Delivered:         { color: '#059669', bg: '#D1FAE5', icon: '✅' },
  OutForDelivery:    { color: '#2563EB', bg: '#DBEAFE', icon: '🚚' },
  InTransit:         { color: '#7C3AED', bg: '#EDE9FE', icon: '✈️' },
  AttemptFail:       { color: '#DC2626', bg: '#FEE2E2', icon: '⚠️' },
  Exception:         { color: '#DC2626', bg: '#FEE2E2', icon: '🚨' },
  Pending:           { color: '#6B7280', bg: '#F3F4F6', icon: '⏳' },
  default:           { color: '#4B5563', bg: '#F9FAFB', icon: '📦' },
};

export default function TrackingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { trackingNumber, carrier = 'usps' } = router.query;
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/account/login');
  }, [status, router]);

  useEffect(() => {
    if (!trackingNumber || !session) return;
    fetch(`/api/tracking/${trackingNumber}?carrier=${carrier}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setTracking(d);
      })
      .catch(() => setError('Failed to load tracking data.'))
      .finally(() => setLoading(false));
  }, [trackingNumber, carrier, session]);

  if (status === 'loading' || !session) return null;

  const tagStyle = tracking ? (TAG_STYLES[tracking.status] || TAG_STYLES.default) : TAG_STYLES.default;

  return (
    <>
      <Head><title>Track Package | EVO Labs Research</title></Head>
      <div style={{ minHeight: '100vh', background: '#0f0f0f', fontFamily: "'DM Sans', sans-serif" }}>

        {/* Top bar */}
        <div style={{ background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 32px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, height: 64 }}>
            <Link href="/account" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>← My Orders</Link>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Tracking: {trackingNumber}</span>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
              Loading tracking data…
            </div>
          )}
          {error && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ color: '#f87171', fontSize: 14 }}>{error}</p>
              <Link href="/account" style={{ color: '#06b6d4', fontSize: 13 }}>← Back to orders</Link>
            </div>
          )}

          {tracking && !loading && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28, alignItems: 'start' }}>

              {/* Left — Map + status */}
              <div>
                {/* Status header */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: tagStyle.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                      {tagStyle.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{tracking.statusDisplay}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                        {tracking.carrier?.toUpperCase()} · {tracking.trackingNumber}
                      </div>
                    </div>
                  </div>
                  {tracking.estimatedDelivery && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: 8, padding: '8px 14px' }}>
                      <span style={{ fontSize: 12, color: '#06b6d4', fontWeight: 600 }}>
                        📅 Est. delivery: {new Date(tracking.estimatedDelivery).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Interactive Map */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden', height: 380 }}>
                  <TrackingMap checkpoints={tracking.checkpoints} currentLocation={tracking.currentLocation} />
                </div>
              </div>

              {/* Right — Checkpoint timeline */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Shipment Timeline</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {tracking.checkpoints.map((cp, i) => (
                    <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: i < tracking.checkpoints.length - 1 ? 20 : 0 }}>
                      {/* Dot + line */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: i === 0 ? '#06b6d4' : 'rgba(255,255,255,0.2)', border: i === 0 ? '2px solid rgba(6,182,212,0.5)' : '2px solid rgba(255,255,255,0.1)', marginTop: 3, flexShrink: 0 }} />
                        {i < tracking.checkpoints.length - 1 && (
                          <div style={{ width: 1, flex: 1, background: 'rgba(255,255,255,0.08)', marginTop: 4 }} />
                        )}
                      </div>
                      {/* Content */}
                      <div style={{ flex: 1, paddingBottom: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: i === 0 ? 700 : 500, color: i === 0 ? '#fff' : 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
                          {cp.message}
                        </div>
                        {cp.location && (
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{cp.location}</div>
                        )}
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 3 }}>
                          {new Date(cp.datetime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {tracking.checkpoints.length === 0 && (
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>No checkpoints yet. Check back soon.</p>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(ctx) {
  const { getServerSession } = await import('next-auth/next');
  const { authOptions } = await import('../../api/auth/[...nextauth]');
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const isAdmin = ctx.req.cookies?.evo_admin === '1';
  if (!session && !isAdmin) return { redirect: { destination: '/account/login', permanent: false } };
  return { props: {} };
}
