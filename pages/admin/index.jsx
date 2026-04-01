import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import CatalogModeSelector from '../../components/admin/CatalogModeSelector';
import Link from 'next/link';

const STATUS_COLORS = {
  pending: { bg: '#fef3c7', color: '#92400e' },
  processing: { bg: '#dbeafe', color: '#1e40af' },
  'on-hold': { bg: '#fde8d8', color: '#9a3412' },
  'awaiting-payment': { bg: '#fef9c3', color: '#713f12' },
  shipped: { bg: '#e0e7ff', color: '#3730a3' },
  completed: { bg: '#d1fae5', color: '#065f46' },
  delivered: { bg: '#d1fae5', color: '#065f46' },
  cancelled: { bg: '#fee2e2', color: '#991b1b' },
  refunded: { bg: '#fee2e2', color: '#991b1b' },
};

function fmt(n) { return typeof n === 'number' ? n.toLocaleString('en-US', { minimumFractionDigits: 0 }) : '—'; }
function fmtUSD(n) { return typeof n === 'number' ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'; }

function StatCard({ label, value, sub, icon }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '24px 28px', border: '1px solid #e5e7eb', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 16, right: 20, fontSize: 28, opacity: 0.12 }}>{icon}</div>
      <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color: '#111', letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  useEffect(() => {
    const pw = localStorage.getItem('evo_admin_pw') || '';
    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${pw}` } })
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const runSync = useCallback(async () => {
    setSyncing(true);
    setSyncResult(null);
    const pw = localStorage.getItem('evo_admin_pw') || '';
    let page = 1;
    let totalImported = 0;
    let totalSkipped = 0;
    let hasMore = true;
    while (hasMore) {
      const res = await fetch('/api/admin/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pw}` },
        body: JSON.stringify({ page, per_page: 100, status: 'any' }),
      });
      const data = await res.json();
      if (!res.ok) { setSyncResult({ error: data.error || 'Sync failed', hint: data.hint }); break; }
      totalImported += data.imported || 0;
      totalSkipped += data.skipped || 0;
      hasMore = data.hasMore && page < data.totalPages;
      page++;
    }
    if (!syncResult?.error) setSyncResult({ imported: totalImported, skipped: totalSkipped });
    setSyncing(false);
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#6b7280' }}>
          Loading live data…
        </div>
      </AdminLayout>
    );
  }

  if (!stats || stats.error) {
    return (
      <AdminLayout title="Dashboard">
        <div style={{ background: '#fff', borderRadius: 12, padding: 32, border: '1px solid #e5e7eb', color: '#374151' }}>
          <strong>Could not load live data.</strong>
          <p style={{ marginTop: 8, color: '#6b7280', fontSize: 14 }}>
            Check that your Supabase credentials (SUPABASE_SERVICE_ROLE_KEY) are configured in Vercel environment variables.
          </p>
        </div>
      </AdminLayout>
    );
  }

  const recentOrders = stats.recentOrders || [];
  const topProducts = stats.topProducts || [];
  const statusCounts = stats.statusCounts || {};

  return (
    <AdminLayout title="Dashboard">
      {/* Site Access Mode — top-level operational control */}
      <CatalogModeSelector />

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
        <StatCard label="Today's Revenue" value={fmtUSD(stats.today?.revenue)} sub={`${stats.today?.orders} orders today`} icon="💰" />
        <StatCard label="This Week" value={fmtUSD(stats.week?.revenue)} sub="Last 7 days" icon="📈" />
        <StatCard label="Avg Order Value" value={fmtUSD(stats.aov)} sub="This month" icon="🧾" />
        <StatCard label="Total Orders (mo)" value={fmt(stats.month?.orders)} sub="All statuses" icon="📦" />
      </div>

      {/* Second row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
        <StatCard label="Pending Orders" value={fmt(statusCounts.pending || 0)} sub="Needs processing" icon="⏳" />
        <StatCard label="Total Customers" value={fmt(stats.totalCustomers)} sub="Unique emails" icon="👤" />
        <StatCard label="Affiliate Payouts" value={fmtUSD(stats.pendingPayout)} sub="Pending disbursement" icon="🔗" />
        <StatCard label="Pending Affiliates" value={fmt(stats.pendingAffiliates)} sub="Awaiting approval" icon="⏳" />
      </div>

      {/* Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
        {/* Recent Orders */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111' }}>Recent Orders</h2>
            <Link href="/admin/orders" style={{ fontSize: 13, color: '#0F2A4A', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Order', 'Customer', 'Total', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: '24px 16px', color: '#9ca3af', fontSize: 14, textAlign: 'center' }}>No orders yet — they'll appear here after your WooCommerce webhook syncs.</td></tr>
                )}
                {recentOrders.map(order => {
                  const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
                  return (
                    <tr key={order.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#0F2A4A' }}>
                        <Link href={`/admin/orders`} style={{ color: '#0F2A4A', textDecoration: 'none' }}>#{order.order_number || order.wc_order_id}</Link>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151' }}>{order.customer_email}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#111' }}>{fmtUSD(parseFloat(order.total))}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 9999, textTransform: 'capitalize' }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280' }}>
                        {order.created_at ? (
                          <>
                            <div>{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                            <div style={{ fontSize: 11, color: '#9ca3af' }}>{new Date(order.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</div>
                          </>
                        ) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Top Products */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111' }}>Top Products</h2>
              <Link href="/admin/analytics" style={{ fontSize: 13, color: '#0F2A4A', fontWeight: 600, textDecoration: 'none' }}>Analytics →</Link>
            </div>
            <div style={{ padding: '12px 0' }}>
              {topProducts.length === 0 && (
                <div style={{ padding: '16px 24px', color: '#9ca3af', fontSize: 13 }}>No product data yet</div>
              )}
              {topProducts.slice(0, 5).map((p, i) => (
                <div key={p.name} style={{ padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 24, height: 24, background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#6b7280', flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#111', lineHeight: 1.3 }}>{p.name}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#111', flexShrink: 0, marginLeft: 8 }}>{fmtUSD(p.revenue)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Status Breakdown */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111' }}>Order Status</h2>
            </div>
            <div style={{ padding: '12px 0' }}>
              {Object.entries(statusCounts).length === 0 && (
                <div style={{ padding: '16px 24px', color: '#9ca3af', fontSize: 13 }}>No data yet</div>
              )}
              {Object.entries(statusCounts).map(([status, count]) => {
                const sc = STATUS_COLORS[status] || STATUS_COLORS.pending;
                return (
                  <div key={status} style={{ padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 9999, textTransform: 'capitalize' }}>{status}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div style={{ background: '#0f1117', borderRadius: 12, padding: '20px 24px' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quick Actions</h2>
            {[
              { href: '/admin/orders', label: '→ Process Pending Orders', badge: statusCounts.pending || 0 },
              { href: '/admin/customers', label: '→ View Customers' },
              { href: '/admin/discounts', label: '→ Create Discount Code' },
              { href: '/admin/affiliates', label: '→ Review Affiliate Applications', badge: stats.pendingAffiliates || 0 },
            ].map(({ href, label, badge }) => (
              <Link key={href} href={href} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 0', color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
                fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                <span>{label}</span>
                {!!badge && <span style={{ background: '#06b6d4', color: '#000', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 9999 }}>{badge}</span>}
              </Link>
            ))}
          </div>

          {/* WooCommerce Sync */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px 24px' }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700, color: '#111' }}>Sync from WooCommerce</h2>
            <p style={{ margin: '0 0 14px', fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>
              Import all historical orders from your WooCommerce store into Supabase. Safe to run multiple times — existing orders are updated, not duplicated.
            </p>
            {syncResult && !syncResult.error && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#065f46' }}>
                ✓ Synced {syncResult.imported} orders{syncResult.skipped > 0 ? ` · ${syncResult.skipped} skipped` : ''}
              </div>
            )}
            {syncResult?.error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#991b1b' }}>
                {syncResult.error}{syncResult.hint ? ` — ${syncResult.hint}` : ''}
              </div>
            )}
            <button
              onClick={runSync}
              disabled={syncing}
              style={{
                width: '100%', padding: '10px', background: syncing ? '#9ca3af' : '#0F2A4A',
                color: '#fff', border: 'none', borderRadius: 8, fontSize: 13,
                fontWeight: 700, cursor: syncing ? 'default' : 'pointer',
              }}
            >
              {syncing ? 'Syncing orders…' : '↓ Import All WooCommerce Orders'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
