import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';

const STAT_CARD = ({ label, value, sub, accent }) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)',
    border: `1px solid ${accent ? 'rgba(74,222,128,0.18)' : 'rgba(255,255,255,0.07)'}`,
    borderRadius: 14,
    padding: '20px 22px',
  }}>
    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 800, color: accent ? '#4ade80' : '#fff', lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 5 }}>{sub}</div>}
  </div>
);

export default function PartnerPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/account/login');
  }, [status, router]);

  useEffect(() => {
    if (!session) return;
    fetch('/api/affiliate/stats')
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setStats(d);
      })
      .catch(() => setError('Failed to load partner data.'))
      .finally(() => setLoading(false));
  }, [session]);

  if (status === 'loading' || !session) return null;

  async function handleApply() {
    setApplying(true);
    setApplyError('');
    try {
      const r = await fetch('/api/affiliate/register', { method: 'POST' });
      const d = await r.json();
      if (d.error) { setApplyError(d.error); return; }
      // Refresh stats
      const s = await fetch('/api/affiliate/stats').then(x => x.json());
      setStats(s);
    } catch {
      setApplyError('Something went wrong. Please try again.');
    } finally {
      setApplying(false);
    }
  }

  function copyLink() {
    if (!stats?.referralLink) return;
    navigator.clipboard.writeText(stats.referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const isPartner = session.user?.isPartner || stats?.referralCode;

  return (
    <>
      <Head><title>Partner Portal | EVO Labs Research</title></Head>
      <style>{`
        .partner-topbar { padding: 0 32px; }
        .partner-body { padding: 40px 32px; }
        .partner-features-grid { grid-template-columns: 1fr 1fr 1fr; }
        .partner-stat-grid { grid-template-columns: repeat(4, 1fr); }
        .partner-overview-grid { grid-template-columns: 1fr 1fr; }
        .partner-payouts-grid { grid-template-columns: 1fr 360px; }
        .partner-ref-row { flex-direction: row; }
        .partner-table-wrap { overflow-x: auto; }
        @media (max-width: 767px) {
          .partner-topbar { padding: 0 16px; }
          .partner-body { padding: 20px 16px; }
          .partner-features-grid { grid-template-columns: 1fr; }
          .partner-stat-grid { grid-template-columns: 1fr 1fr; }
          .partner-overview-grid { grid-template-columns: 1fr; }
          .partner-payouts-grid { grid-template-columns: 1fr; }
          .partner-ref-row { flex-direction: column; }
          .partner-ref-link-text { display: none; }
        }
      `}</style>
      <div style={{ minHeight: '100vh', background: '#0f0f0f', fontFamily: "'Poppins', sans-serif" }}>

        {/* Top bar */}
        <div className="partner-topbar" style={{ background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Link href="/account" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>← My Account</Link>
              <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Partner Portal</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: 6, minHeight: 44 }}
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="partner-body" style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* ── Not a partner yet ── */}
          {!loading && !isPartner && (
            <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🤝</div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 12 }}>Become an EVO Partner</h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 28 }}>
                Earn 10% commission on every order placed through your unique referral link.
                Share with researchers, scientists, and biohackers in your network.
              </p>
              <div className="partner-features-grid" style={{ display: 'grid', gap: 12, marginBottom: 32 }}>
                {[
                  { icon: '💰', title: '10% Commission', desc: 'On every referred order' },
                  { icon: '🍪', title: '30-Day Cookie', desc: 'Attribution window' },
                  { icon: '📊', title: 'Live Dashboard', desc: 'Track clicks & earnings' },
                ].map(f => (
                  <div key={f.title} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 12px' }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{f.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{f.title}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{f.desc}</div>
                  </div>
                ))}
              </div>
              {applyError && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{applyError}</p>}
              <button
                onClick={handleApply}
                disabled={applying}
                style={{
                  background: '#4ade80', color: '#0a0a0a', border: 'none', borderRadius: 10,
                  padding: '14px 32px', fontSize: 14, fontWeight: 700, cursor: applying ? 'not-allowed' : 'pointer',
                  opacity: applying ? 0.7 : 1,
                }}
              >
                {applying ? 'Applying…' : 'Apply Now — It\'s Free'}
              </button>
            </div>
          )}

          {/* ── Loading ── */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
              Loading partner data…
            </div>
          )}

          {/* ── Error ── */}
          {error && !loading && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ color: '#f87171', fontSize: 14 }}>{error}</p>
            </div>
          )}

          {/* ── Partner Dashboard ── */}
          {!loading && isPartner && stats && (
            <>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0 }}>Partner Dashboard</h1>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
                      background: stats.partnerStatus === 'active' ? 'rgba(74,222,128,0.12)' : 'rgba(250,204,21,0.12)',
                      color: stats.partnerStatus === 'active' ? '#4ade80' : '#facc15',
                      border: `1px solid ${stats.partnerStatus === 'active' ? 'rgba(74,222,128,0.25)' : 'rgba(250,204,21,0.25)'}`,
                      textTransform: 'uppercase',
                    }}>
                      {stats.partnerStatus || 'Pending Review'}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                    {session.user?.email} · Code: <span style={{ color: '#4ade80', fontWeight: 600 }}>{stats.referralCode}</span>
                  </p>
                </div>

                {/* Referral link copy */}
                {stats.referralLink && (
                  <div className="partner-ref-row" style={{
                    display: 'flex', alignItems: 'center', gap: 0,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, overflow: 'hidden',
                  }}>
                    <span className="partner-ref-link-text" style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', padding: '10px 14px', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {stats.referralLink}
                    </span>
                    <button
                      onClick={copyLink}
                      style={{
                        background: copied ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.06)',
                        border: 'none', borderLeft: '1px solid rgba(255,255,255,0.08)',
                        color: copied ? '#4ade80' : 'rgba(255,255,255,0.6)',
                        fontSize: 12, fontWeight: 600, padding: '10px 16px', cursor: 'pointer',
                        transition: 'all .15s',
                      }}
                    >
                      {copied ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                )}
              </div>

              {/* Stat cards */}
              <div className="partner-stat-grid" style={{ display: 'grid', gap: 14, marginBottom: 28 }}>
                <STAT_CARD label="30-Day Clicks"    value={stats.clicks30d ?? 0}                                          />
                <STAT_CARD label="Total Orders"     value={stats.totalConversions ?? 0}   sub="all time"                  />
                <STAT_CARD label="Total Earned"     value={`$${(stats.totalEarned ?? 0).toFixed(2)}`}   accent             />
                <STAT_CARD label="Pending Payout"   value={`$${(stats.pendingPayout ?? 0).toFixed(2)}`} sub="after 30-day window" />
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
                {['overview', 'conversions', 'payouts'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      background: activeTab === tab ? 'rgba(255,255,255,0.08)' : 'transparent',
                      border: 'none', color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.4)',
                      fontSize: 12, fontWeight: activeTab === tab ? 600 : 400,
                      padding: '7px 16px', borderRadius: 7, cursor: 'pointer', textTransform: 'capitalize',
                      transition: 'all .15s',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* ── Overview tab ── */}
              {activeTab === 'overview' && (
                <div className="partner-overview-grid" style={{ display: 'grid', gap: 18, alignItems: 'start' }}>

                  {/* How it works */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '24px' }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 18 }}>How Your Commission Works</h3>
                    {[
                      { step: '1', title: 'Share your link', desc: 'Anyone who visits evolabsresearch.ca through your link gets a 30-day tracking cookie.' },
                      { step: '2', title: 'They place an order', desc: 'When they purchase, the order is automatically attributed to you.' },
                      { step: '3', title: 'Commission clears', desc: 'After the 30-day return window, 10% of the order total is approved for payout.' },
                      { step: '4', title: 'Request payout', desc: 'Once your balance hits $50, you can request a payout to your preferred method.' },
                    ].map(s => (
                      <div key={s.step} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#4ade80', flexShrink: 0 }}>
                          {s.step}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{s.title}</div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{s.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recent conversions preview */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '24px' }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 18 }}>Recent Conversions</h3>
                    {stats.conversions?.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {stats.conversions.slice(0, 5).map((c, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                            <div>
                              <div style={{ fontSize: 12, color: '#fff', fontWeight: 500 }}>Order #{c.wc_order_id}</div>
                              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                                {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#4ade80' }}>+${c.commission?.toFixed(2)}</div>
                              <span style={{
                                fontSize: 9, padding: '2px 7px', borderRadius: 10, fontWeight: 600,
                                background: c.status === 'approved' ? 'rgba(74,222,128,0.1)' : 'rgba(250,204,21,0.1)',
                                color: c.status === 'approved' ? '#4ade80' : '#facc15',
                                textTransform: 'uppercase',
                              }}>
                                {c.status}
                              </span>
                            </div>
                          </div>
                        ))}
                        {stats.conversions.length > 5 && (
                          <button
                            onClick={() => setActiveTab('conversions')}
                            style={{ fontSize: 12, color: '#4ade80', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', textAlign: 'left' }}
                          >
                            View all {stats.conversions.length} conversions →
                          </button>
                        )}
                      </div>
                    ) : (
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>No conversions yet. Share your link to start earning!</p>
                    )}
                  </div>
                </div>
              )}

              {/* ── Conversions tab ── */}
              {activeTab === 'conversions' && (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '24px' }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 18 }}>All Conversions</h3>
                  {stats.conversions?.length > 0 ? (
                    <div className="partner-table-wrap">
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 400 }}>
                      <thead>
                        <tr>
                          {['Order ID', 'Order Total', 'Commission', 'Date', 'Status'].map(h => (
                            <th key={h} style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '.05em', padding: '0 12px 10px', textAlign: 'left' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {stats.conversions.map((c, i) => (
                          <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '11px 12px', fontSize: 12, color: '#fff' }}>#{c.wc_order_id}</td>
                            <td style={{ padding: '11px 12px', fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>${c.order_total?.toFixed(2)}</td>
                            <td style={{ padding: '11px 12px', fontSize: 13, fontWeight: 700, color: '#4ade80' }}>+${c.commission?.toFixed(2)}</td>
                            <td style={{ padding: '11px 12px', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                              {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td style={{ padding: '11px 12px' }}>
                              <span style={{
                                fontSize: 9, padding: '3px 8px', borderRadius: 10, fontWeight: 700,
                                background: c.status === 'approved' ? 'rgba(74,222,128,0.1)' : 'rgba(250,204,21,0.1)',
                                color: c.status === 'approved' ? '#4ade80' : '#facc15',
                                textTransform: 'uppercase',
                              }}>
                                {c.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  ) : (
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>No conversions yet.</p>
                  )}
                </div>
              )}

              {/* ── Payouts tab ── */}
              {activeTab === 'payouts' && (
                <div className="partner-payouts-grid" style={{ display: 'grid', gap: 18, alignItems: 'start' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '24px' }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 18 }}>Payout History</h3>
                    {stats.payouts?.length > 0 ? (
                      <div className="partner-table-wrap">
                      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 340 }}>
                        <thead>
                          <tr>
                            {['Amount', 'Method', 'Date', 'Status'].map(h => (
                              <th key={h} style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '.05em', padding: '0 12px 10px', textAlign: 'left' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {stats.payouts.map((p, i) => (
                            <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                              <td style={{ padding: '11px 12px', fontSize: 13, fontWeight: 700, color: '#fff' }}>${p.amount?.toFixed(2)}</td>
                              <td style={{ padding: '11px 12px', fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' }}>{p.method || 'Bank Transfer'}</td>
                              <td style={{ padding: '11px 12px', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                                {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>
                              <td style={{ padding: '11px 12px' }}>
                                <span style={{
                                  fontSize: 9, padding: '3px 8px', borderRadius: 10, fontWeight: 700,
                                  background: p.status === 'paid' ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.06)',
                                  color: p.status === 'paid' ? '#4ade80' : 'rgba(255,255,255,0.4)',
                                  textTransform: 'uppercase',
                                }}>
                                  {p.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      </div>
                    ) : (
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>No payouts yet.</p>
                    )}
                  </div>

                  {/* Payout request card */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '24px' }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Request Payout</h3>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 18, lineHeight: 1.6 }}>
                      Minimum payout is $50. Approved commissions (after 30-day window) are eligible.
                    </p>
                    <div style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: 10, padding: '14px 16px', marginBottom: 18 }}>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Available for payout</div>
                      <div style={{ fontSize: 26, fontWeight: 800, color: '#4ade80' }}>
                        ${(stats.pendingPayout ?? 0).toFixed(2)}
                      </div>
                    </div>
                    {(stats.pendingPayout ?? 0) >= 50 ? (
                      <a
                        href={`mailto:partners@evolabsresearch.ca?subject=Payout Request — ${stats.referralCode}&body=Hi EVO team,%0A%0APlease process my payout of $${stats.pendingPayout?.toFixed(2)}.%0A%0AReferral code: ${stats.referralCode}%0APreferred method: [bank / crypto / check]%0ADetails: [your payment info]`}
                        style={{
                          display: 'block', textAlign: 'center', background: '#4ade80', color: '#0a0a0a',
                          borderRadius: 9, padding: '12px', fontSize: 13, fontWeight: 700, textDecoration: 'none',
                        }}
                      >
                        Request Payout via Email
                      </a>
                    ) : (
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '12px 0' }}>
                        ${Math.max(0, 50 - (stats.pendingPayout ?? 0)).toFixed(2)} more needed to reach minimum
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(ctx) {
  const { getServerSession } = await import('next-auth/next');
  const { authOptions } = await import('../api/auth/[...nextauth]');
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const isAdmin = ctx.req.cookies?.evo_admin === '1';
  if (!session && !isAdmin) return { redirect: { destination: '/account/login', permanent: false } };
  return { props: {} };
}
