import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

const ADMIN_PW = typeof window !== 'undefined' ? localStorage.getItem('evo_admin_pw') : '';

function authHeaders() {
  const pw = typeof window !== 'undefined' ? localStorage.getItem('evo_admin_pw') : '';
  return { Authorization: `Bearer ${pw}`, 'Content-Type': 'application/json' };
}

function TrendBadge({ thisWeek, lastWeek }) {
  const pct = lastWeek === 0 ? (thisWeek > 0 ? 100 : 0) : Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  const up = pct >= 0;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      background: up ? '#d1fae5' : '#fee2e2',
      color: up ? '#065f46' : '#991b1b',
      fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 9999,
    }}>
      {up ? '▲' : '▼'} {Math.abs(pct)}%
    </span>
  );
}

function Card({ label, value, sub }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#111', letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>{sub}</div>
    </div>
  );
}

export default function AdminAnalytics() {
  const [period, setPeriod] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [affiliates, setAffiliates] = useState([]);
  const [discounts, setDiscounts] = useState([]);

  const days = period === '7d' ? 7 : period === '14d' ? 14 : 30;

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [analyticsRes, affiliatesRes, discountsRes] = await Promise.all([
        fetch(`/api/admin/analytics?days=${days}`, { headers: authHeaders() }),
        fetch('/api/admin/affiliates', { headers: authHeaders() }),
        fetch('/api/admin/discounts', { headers: authHeaders() }),
      ]);
      const json = await analyticsRes.json();
      if (!analyticsRes.ok) throw new Error(json.error || 'Failed to load analytics');
      setData(json);
      if (affiliatesRes.ok) {
        const aff = await affiliatesRes.json();
        setAffiliates(aff.affiliates || []);
      }
      if (discountsRes.ok) {
        const disc = await discountsRes.json();
        setDiscounts(disc.discounts || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const runSync = async () => {
    setSyncing(true);
    setSyncMsg('');
    let page = 1, totalImported = 0, hasMore = true;
    try {
      while (hasMore) {
        const res = await fetch('/api/admin/sync', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ page, per_page: 100, status: 'any' }),
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || 'Sync failed');
        totalImported += d.imported || 0;
        hasMore = d.hasMore && page < d.totalPages;
        page++;
      }
      setSyncMsg(`✓ Synced ${totalImported} orders from WooCommerce`);
      fetchAnalytics();
    } catch (err) {
      setSyncMsg(`Error: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const maxRevenue = data ? Math.max(...data.revenue, 1) : 1;
  const maxOrders = data ? Math.max(...data.orders, 1) : 1;
  const chartData = data
    ? data.labels.map((label, i) => ({ label, revenue: data.revenue[i], orders: data.orders[i] }))
    : [];

  return (
    <AdminLayout title="Analytics">
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['7d', '14d', '30d'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              border: '1px solid', cursor: 'pointer',
              background: period === p ? '#1B4D3E' : '#fff',
              borderColor: period === p ? '#1B4D3E' : '#e5e7eb',
              color: period === p ? '#fff' : '#374151',
            }}>
              Last {p.replace('d', ' days')}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {syncMsg && (
            <span style={{ fontSize: 12, color: syncMsg.startsWith('Error') ? '#dc2626' : '#065f46', fontWeight: 600 }}>
              {syncMsg}
            </span>
          )}
          <button
            onClick={runSync}
            disabled={syncing}
            style={{
              padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: syncing ? '#9ca3af' : '#1B4D3E', color: '#fff',
              border: 'none', cursor: syncing ? 'not-allowed' : 'pointer',
            }}
          >
            {syncing ? 'Syncing…' : '↻ Sync WooCommerce'}
          </button>
          <button onClick={fetchAnalytics} style={{ padding: '8px 14px', borderRadius: 8, fontSize: 13, background: '#f3f4f6', border: '1px solid #e5e7eb', cursor: 'pointer' }}>
            Refresh
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280', fontSize: 14 }}>
          Loading analytics…
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontWeight: 700, color: '#dc2626', marginBottom: 4 }}>Failed to load analytics</div>
          <div style={{ fontSize: 13, color: '#7f1d1d' }}>{error}</div>
        </div>
      )}

      {/* Empty state — no orders synced yet */}
      {!loading && !error && data?.empty && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '48px 40px', textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 8 }}>No order data yet</h2>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24, lineHeight: 1.6 }}>
            Sync your WooCommerce orders to see real analytics — revenue charts, top products, customer LTV, and more.
          </p>
          <button
            onClick={runSync}
            disabled={syncing}
            style={{
              padding: '12px 28px', background: '#1B4D3E', color: '#fff',
              border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: syncing ? 'not-allowed' : 'pointer',
            }}
          >
            {syncing ? 'Syncing WooCommerce…' : '↻ Sync Orders from WooCommerce'}
          </button>
          {syncMsg && <div style={{ marginTop: 12, fontSize: 13, color: syncMsg.startsWith('Error') ? '#dc2626' : '#065f46', fontWeight: 600 }}>{syncMsg}</div>}
        </div>
      )}

      {/* Real data */}
      {!loading && !error && data && !data.empty && (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }}>
            <Card
              label="Total Revenue"
              value={`$${data.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              sub={<span>vs last week <TrendBadge thisWeek={data.weekComparison.thisWeek.revenue} lastWeek={data.weekComparison.lastWeek.revenue} /></span>}
            />
            <Card
              label="Total Orders"
              value={data.totalOrders}
              sub={<span>vs last week <TrendBadge thisWeek={data.weekComparison.thisWeek.orders} lastWeek={data.weekComparison.lastWeek.orders} /></span>}
            />
            <Card label="Avg Order Value" value={`$${data.aov}`} sub={`${days}-day average`} />
            <Card
              label="Active Statuses"
              value={Object.keys(data.statusCounts || {}).length}
              sub={Object.entries(data.statusCounts || {}).map(([s, n]) => `${n} ${s}`).join(' · ') || '—'}
            />
          </div>

          {/* Revenue + Orders Chart */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '24px', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111' }}>Revenue & Orders — Last {days} Days</h2>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#6b7280' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 12, height: 12, background: '#1B4D3E', borderRadius: 2, display: 'inline-block' }} /> Revenue
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 12, height: 12, background: '#4ade80', borderRadius: 2, display: 'inline-block' }} /> Orders
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 160, overflowX: 'auto' }}>
              {chartData.map(({ label, revenue, orders }) => (
                <div key={label} style={{ flex: '1 0 auto', minWidth: 18, display: 'flex', alignItems: 'flex-end', gap: 2 }}>
                  <div
                    style={{ flex: 1, background: '#1B4D3E', borderRadius: '3px 3px 0 0', height: `${Math.max(4, (revenue / maxRevenue) * 140)}px`, minHeight: 4 }}
                    title={`${label}: $${revenue.toLocaleString()}`}
                  />
                  <div
                    style={{ flex: 1, background: '#4ade80', borderRadius: '3px 3px 0 0', height: `${Math.max(4, (orders / maxOrders) * 140)}px`, minHeight: 4, opacity: 0.85 }}
                    title={`${label}: ${orders} orders`}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>{chartData[0]?.label}</span>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>{chartData[chartData.length - 1]?.label}</span>
            </div>
          </div>

          {/* Trending Products + Status Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            {/* Trending */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111' }}>Trending Products</h2>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9ca3af' }}>Week-over-week revenue change</p>
              </div>
              <div>
                {(data.trendingProducts || []).length === 0 ? (
                  <div style={{ padding: 24, color: '#9ca3af', fontSize: 13, textAlign: 'center' }}>Not enough data yet for trends</div>
                ) : (data.trendingProducts || []).map((p, i) => {
                  const pct = p.lastWeek === 0 ? (p.thisWeek > 0 ? 100 : 0) : Math.round(((p.thisWeek - p.lastWeek) / p.lastWeek) * 100);
                  const up = pct >= 0;
                  return (
                    <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: i > 0 ? '1px solid #f3f4f6' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 28, height: 28, borderRadius: '50%', background: up ? '#d1fae5' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                          {up ? '📈' : '📉'}
                        </span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: '#9ca3af' }}>{p.units} units this week</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>${p.thisWeek.toLocaleString()}</div>
                        <TrendBadge thisWeek={p.thisWeek} lastWeek={p.lastWeek} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Status Breakdown */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111' }}>Order Status Breakdown</h2>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9ca3af' }}>From synced WooCommerce orders</p>
              </div>
              <div style={{ padding: '20px' }}>
                {Object.entries(data.statusCounts || {}).sort(([, a], [, b]) => b - a).map(([status, count]) => {
                  const total = Object.values(data.statusCounts).reduce((s, n) => s + n, 0);
                  const pct = Math.round((count / total) * 100);
                  const colors = {
                    completed: '#065f46', processing: '#1d4ed8', pending: '#92400e',
                    shipped: '#5b21b6', refunded: '#991b1b', cancelled: '#6b7280', 'on-hold': '#d97706',
                  };
                  const color = colors[status] || '#374151';
                  return (
                    <div key={status} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', textTransform: 'capitalize' }}>{status.replace(/-/g, ' ')}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{count} <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: 11 }}>({pct}%)</span></span>
                      </div>
                      <div style={{ height: 8, background: '#f3f4f6', borderRadius: 9999 }}>
                        <div style={{ height: 8, borderRadius: 9999, background: color, width: `${pct}%`, opacity: 0.85 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Products + Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111' }}>Top Products by Revenue ({days}d)</h2>
              </div>
              <div>
                {(data.topProducts || []).map((p, i) => {
                  const pct = (p.revenue / (data.topProducts[0]?.revenue || 1)) * 100;
                  return (
                    <div key={p.name} style={{ padding: '12px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>{i + 1}. {p.name}</span>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>${p.revenue.toLocaleString()}</span>
                          <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 8 }}>{p.units} units</span>
                        </div>
                      </div>
                      <div style={{ height: 4, background: '#f3f4f6', borderRadius: 9999 }}>
                        <div style={{ height: 4, background: '#1B4D3E', borderRadius: 9999, width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111' }}>Revenue by Category</h2>
              </div>
              <div style={{ padding: '12px 0' }}>
                {Object.entries(data.categoryRevenue || {}).sort(([, a], [, b]) => b - a).map(([cat, rev]) => {
                  const maxCat = Math.max(...Object.values(data.categoryRevenue));
                  const pct = (rev / maxCat) * 100;
                  const totalCatRev = Object.values(data.categoryRevenue).reduce((a, b) => a + b, 0);
                  const share = ((rev / totalCatRev) * 100).toFixed(1);
                  return (
                    <div key={cat} style={{ padding: '10px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: '#374151' }}>{cat}</span>
                        <div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>${rev.toLocaleString()}</span>
                          <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 6 }}>{share}%</span>
                        </div>
                      </div>
                      <div style={{ height: 4, background: '#f3f4f6', borderRadius: 9999 }}>
                        <div style={{ height: 4, background: '#4ade80', borderRadius: 9999, width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Customers */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: 24 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111' }}>Top Customers by Lifetime Value</h2>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9ca3af' }}>From synced orders · {days}-day window</p>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Rank', 'Customer', 'Email', 'Orders', 'Avg Order', 'LTV', 'Last Order', 'Tags'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data.topCustomers || []).map((c, i) => (
                    <tr key={c.email} style={{ borderTop: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ width: 26, height: 26, borderRadius: '50%', background: i === 0 ? '#fef3c7' : '#f3f4f6', color: i === 0 ? '#92400e' : '#6b7280', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>
                          {i === 0 ? '🥇' : i + 1}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#111', whiteSpace: 'nowrap' }}>{c.name}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280' }}>{c.email}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151', textAlign: 'center' }}>{c.orders}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151' }}>${c.avgOrder.toFixed(2)}</td>
                      <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 800, color: '#1B4D3E', whiteSpace: 'nowrap' }}>${c.ltv.toFixed(2)}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280' }}>{c.lastOrder || '—'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {(c.tags || []).map(tag => (
                            <span key={tag} style={{ background: '#fef3c7', color: '#92400e', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 9999, textTransform: 'uppercase' }}>{tag}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Affiliate Leaderboard + Promo Performance */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, marginBottom: 24 }}>
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px' }}>
              <h2 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#111' }}>Affiliate Leaderboard</h2>
              <p style={{ margin: '0 0 16px', fontSize: 11, color: '#9ca3af' }}>Active partners ranked by total sales</p>
              {affiliates.filter(a => a.status === 'active').length === 0 ? (
                <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '24px 0' }}>No active affiliates yet</p>
              ) : affiliates.filter(a => a.status === 'active').sort((a, b) => b.totalSales - a.totalSales).slice(0, 5).map((aff, i) => (
                <div key={aff.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ width: 24, height: 24, background: i === 0 ? '#fef3c7' : '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: i === 0 ? '#92400e' : '#6b7280', flexShrink: 0 }}>
                    {i === 0 ? '🥇' : i + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{aff.name || aff.email}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{aff.conversions} conversions · {aff.referralCode}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>${(aff.totalSales || 0).toFixed(0)}</div>
                </div>
              ))}
            </div>

            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111' }}>Promo Code Performance</h2>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9ca3af' }}>All active discount codes and usage</p>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      {['Code', 'Type', 'Discount', 'Uses', 'Revenue Impact', 'Status', 'Expires'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...discounts].sort((a, b) => (b.uses || 0) - (a.uses || 0)).map(disc => {
                      const uses = disc.uses || 0;
                      const estImpact = disc.type === 'percent'
                        ? `−$${(uses * (disc.value / 100) * (data?.aov || 89)).toLocaleString()}`
                        : disc.type === 'free_shipping' ? `−$${(uses * 9.99).toFixed(0)}` : '—';
                      return (
                        <tr key={disc.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <code style={{ background: '#f3f4f6', padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700, color: '#111' }}>{disc.code}</code>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280', textTransform: 'capitalize' }}>{(disc.type || '').replace('_', ' ')}</td>
                          <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#111' }}>
                            {disc.type === 'percent' ? `${disc.value}% off` : disc.type === 'free_shipping' ? 'Free shipping' : 'BOGO'}
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>
                            {uses}{disc.usage_limit && <span style={{ fontSize: 11, color: '#9ca3af' }}> / {disc.usage_limit}</span>}
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: '#ef4444', fontWeight: 600 }}>{estImpact}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ background: disc.active ? '#d1fae5' : '#f3f4f6', color: disc.active ? '#065f46' : '#6b7280', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 9999 }}>
                              {disc.active ? 'Active' : 'Ended'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280' }}>{disc.end_date || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
