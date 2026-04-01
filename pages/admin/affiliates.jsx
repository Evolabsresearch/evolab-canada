import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

function fmtUSD(n) { return `$${parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }

const STATUS_COLORS = {
  active: { bg: '#d1fae5', color: '#065f46' },
  pending: { bg: '#fef3c7', color: '#92400e' },
  suspended: { bg: '#fee2e2', color: '#991b1b' },
};

export default function AdminAffiliates() {
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('all');
  const [editRate, setEditRate] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchAffiliates = useCallback(() => {
    setLoading(true);
    const pw = localStorage.getItem('evo_admin_pw') || '';
    fetch('/api/admin/affiliates', { headers: { Authorization: `Bearer ${pw}` } })
      .then(r => r.json())
      .then(data => { setAffiliates(data.affiliates || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAffiliates(); }, [fetchAffiliates]);

  const filtered = affiliates.filter(a => tab === 'all' ? true : a.status === tab);

  const openAffiliate = (a) => {
    setSelected(a);
    setEditRate(String(Math.round((a.commissionRate || 0.10) * 100)));
    setSaved(false);
  };

  const saveRate = async () => {
    setSaving(true);
    const pw = localStorage.getItem('evo_admin_pw') || '';
    const rate = parseFloat(editRate) / 100;
    const res = await fetch('/api/admin/affiliates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pw}` },
      body: JSON.stringify({ id: selected.id, commission_rate: rate }),
    });
    const data = await res.json();
    if (data.affiliate) {
      setAffiliates(prev => prev.map(a => a.id === selected.id ? { ...a, commissionRate: rate } : a));
      setSelected(prev => ({ ...prev, commissionRate: rate }));
    }
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500);
  };

  const approveAffiliate = async (id) => {
    const pw = localStorage.getItem('evo_admin_pw') || '';
    await fetch('/api/admin/affiliates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pw}` },
      body: JSON.stringify({ id, status: 'active' }),
    });
    setAffiliates(prev => prev.map(a => a.id === id ? { ...a, status: 'active' } : a));
    if (selected?.id === id) setSelected(prev => ({ ...prev, status: 'active' }));
  };

  const suspendAffiliate = async (id) => {
    const pw = localStorage.getItem('evo_admin_pw') || '';
    await fetch('/api/admin/affiliates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pw}` },
      body: JSON.stringify({ id, status: 'suspended' }),
    });
    setAffiliates(prev => prev.map(a => a.id === id ? { ...a, status: 'suspended' } : a));
    if (selected?.id === id) setSelected(prev => ({ ...prev, status: 'suspended' }));
  };

  const markPaid = async (aff) => {
    const pw = localStorage.getItem('evo_admin_pw') || '';
    await fetch('/api/admin/affiliates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pw}` },
      body: JSON.stringify({ id: aff.id, action: 'mark_paid', amount: aff.pendingPayout }),
    });
    setAffiliates(prev => prev.map(a =>
      a.id === aff.id ? { ...a, pendingPayout: 0 } : a
    ));
    if (selected?.id === aff.id) setSelected(prev => ({ ...prev, pendingPayout: 0 }));
  };

  const totalPendingPayouts = affiliates.reduce((sum, a) => sum + (a.pendingPayout || 0), 0);
  const totalEarned = affiliates.reduce((sum, a) => sum + (a.totalEarned || 0), 0);

  return (
    <AdminLayout title="Affiliates">
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
        {[
          { label: 'Active Affiliates', value: affiliates.filter(a => a.status === 'active').length, icon: '👥' },
          { label: 'Total Commissions Paid', value: fmtUSD(totalEarned), icon: '💸' },
          { label: 'Pending Payouts', value: fmtUSD(totalPendingPayouts), icon: '⏳', color: '#d97706' },
          { label: 'Pending Applications', value: affiliates.filter(a => a.status === 'pending').length, icon: '📋' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: color || '#111' }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 24, height: 'calc(100vh - 300px)' }}>
        {/* Affiliate List */}
        <div style={{ flex: 1, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Tab filters */}
          <div style={{ padding: '12px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: 8 }}>
            {['all', 'active', 'pending', 'suspended'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                border: '1px solid', cursor: 'pointer', textTransform: 'capitalize',
                background: tab === t ? '#0F2A4A' : '#fff',
                borderColor: tab === t ? '#0F2A4A' : '#e5e7eb',
                color: tab === t ? '#fff' : '#374151',
              }}>
                {t} ({t === 'all' ? affiliates.length : affiliates.filter(a => a.status === t).length})
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#f9fafb', zIndex: 1 }}>
                <tr>
                  {['Affiliate', 'Code', 'Rate', 'Conversions', 'Total Sales', 'Pending Payout', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>Loading affiliates…</td></tr>}
                {!loading && filtered.length === 0 && <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>No affiliates yet</td></tr>}
                {filtered.map(aff => {
                  const sc = STATUS_COLORS[aff.status] || STATUS_COLORS.pending;
                  const isSelected = selected?.id === aff.id;
                  return (
                    <tr
                      key={aff.id}
                      onClick={() => openAffiliate(aff)}
                      style={{ borderTop: '1px solid #f3f4f6', cursor: 'pointer', background: isSelected ? '#f0fdf4' : 'transparent' }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f9fafb'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{aff.name}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>{aff.email}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: 'monospace', color: '#0F2A4A', fontWeight: 700 }}>{aff.referralCode}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#111' }}>{Math.round((aff.commissionRate || 0) * 100)}%</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151' }}>{aff.conversions}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#111' }}>{fmtUSD(aff.totalSales)}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: aff.pendingPayout > 0 ? '#d97706' : '#9ca3af' }}>
                        {aff.pendingPayout > 0 ? fmtUSD(aff.pendingPayout) : '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 9999, textTransform: 'capitalize' }}>{aff.status}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {aff.status === 'pending' && (
                          <button onClick={e => { e.stopPropagation(); approveAffiliate(aff.id); }} style={{ padding: '4px 10px', background: '#0F2A4A', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            Approve
                          </button>
                        )}
                        {aff.pendingPayout > 0 && (
                          <button onClick={e => { e.stopPropagation(); markPaid(aff); }} style={{ padding: '4px 10px', background: '#d97706', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', marginLeft: 6 }}>
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Affiliate Detail */}
        {selected && (
          <div style={{ width: 380, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111' }}>{selected.name}</h2>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                  <span style={{ fontFamily: 'monospace', color: '#0F2A4A', fontWeight: 700 }}>{selected.referralCode}</span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#6b7280' }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {/* Performance */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
                {[
                  { label: 'Clicks', value: (selected.clicks || 0).toLocaleString() },
                  { label: 'Conversions', value: selected.conversions || 0 },
                  { label: 'Total Sales', value: fmtUSD(selected.totalSales) },
                  { label: 'Total Earned', value: fmtUSD(selected.totalEarned) },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#111' }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Conv Rate */}
              <div style={{ marginBottom: 20, padding: '12px 16px', background: '#f0fdf4', borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: '#065f46', fontWeight: 600 }}>Conversion Rate</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#065f46' }}>
                  {(selected.clicks || 0) > 0 ? (((selected.conversions || 0) / selected.clicks) * 100).toFixed(1) : 0}%
                </div>
              </div>

              {/* Commission Rate Edit */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Commission Rate (%)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="number" min="0" max="50" step="0.5" value={editRate}
                    onChange={e => setEditRate(e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, fontWeight: 700 }}
                  />
                  <button onClick={saveRate} style={{ padding: '8px 16px', background: saved ? '#065f46' : '#0F2A4A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    {saved ? '✓' : 'Set'}
                  </button>
                </div>
              </div>

              {/* Payout */}
              {selected.pendingPayout > 0 && (
                <div style={{ background: '#fef3c7', borderRadius: 8, padding: '14px 16px', marginBottom: 20 }}>
                  <div style={{ fontSize: 12, color: '#92400e', fontWeight: 600, marginBottom: 4 }}>Pending Payout</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#92400e' }}>{fmtUSD(selected.pendingPayout)}</div>
                  <textarea
                    placeholder="Payout note (optional)"
                    rows={2}
                    style={{ width: '100%', padding: '8px', border: '1px solid #fbbf24', borderRadius: 6, fontSize: 12, marginTop: 10, boxSizing: 'border-box', resize: 'none' }}
                  />
                  <button onClick={() => markPaid(selected)} style={{ width: '100%', padding: '10px', background: '#d97706', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
                    Mark as Paid
                  </button>
                </div>
              )}

              {/* Notes */}
              <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6, background: '#f9fafb', borderRadius: 8, padding: '12px 14px' }}>
                <strong>Notes:</strong> {selected.notes || 'No notes'}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
