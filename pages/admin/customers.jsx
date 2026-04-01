import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

function fmtUSD(n) { return `$${parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);

  const saveNote = async () => {
    setNoteSaving(true);
    const pw = localStorage.getItem('evo_admin_pw') || '';
    await fetch('/api/admin/customers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + pw },
      body: JSON.stringify({ email: selected.email, note }),
    });
    setNoteSaving(false);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2500);
  };

  const fetchCustomers = useCallback(() => {
    setLoading(true);
    const pw = localStorage.getItem('evo_admin_pw') || '';
    const params = new URLSearchParams({ search });
    fetch(`/api/admin/customers?${params}`, { headers: { Authorization: `Bearer ${pw}` } })
      .then(r => r.json())
      .then(data => { setCustomers(data.customers || []); setTotal(data.total || 0); setLoading(false); })
      .catch(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const openCustomer = (c) => { setSelected(c); setNote(c.note || ''); setNoteSaved(false); };

  const customerOrders = selected?.orders || [];

  return (
    <AdminLayout title="Customers">
      <div style={{ display: 'flex', gap: 24, height: 'calc(100vh - 128px)' }}>
        {/* Customer List */}
        <div style={{ flex: 1, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              type="text" placeholder="Search customers..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }}
            />
            <span style={{ fontSize: 12, color: '#6b7280' }}>{total} customers</span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>Loading customers…</div>
            ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#f9fafb', zIndex: 1 }}>
                <tr>
                  {['Customer', 'Orders', 'Lifetime Value', 'Avg Order', 'Last Order', 'Account'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map(c => {
                  const isSelected = selected?.email === c.email;
                  return (
                    <tr
                      key={c.email}
                      onClick={() => openCustomer(c)}
                      style={{ borderTop: '1px solid #f3f4f6', cursor: 'pointer', background: isSelected ? '#f0fdf4' : 'transparent' }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f9fafb'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#0F2A4A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                            {(c.name || c.email || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{c.name || '—'}</div>
                            <div style={{ fontSize: 11, color: '#9ca3af' }}>{c.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#111' }}>{c.orderCount}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#111' }}>{fmtUSD(c.ltv)}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151' }}>{fmtUSD(c.aov)}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280' }}>{fmtDate(c.lastOrder)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: c.hasAccount ? '#d1fae5' : '#f3f4f6', color: c.hasAccount ? '#065f46' : '#6b7280', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 9999 }}>
                          {c.hasAccount ? 'Registered' : 'Guest'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {customers.length === 0 && !loading && (
                  <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>No customers yet</td></tr>
                )}
              </tbody>
            </table>
            )}
          </div>
        </div>

        {/* Customer Detail */}
        {selected && (
          <div style={{ width: 400, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#0F2A4A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 700 }}>
                  {selected.name.charAt(0)}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111' }}>{selected.name}</h2>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{selected.email}</div>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#6b7280' }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                {[
                  { label: 'Lifetime Value', value: fmtUSD(selected.ltv) },
                  { label: 'Total Orders', value: selected.orderCount },
                  { label: 'Avg Order', value: fmtUSD(selected.aov) },
                  { label: 'Last Order', value: fmtDate(selected.lastOrder) },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: '#f9fafb', borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#111' }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Account status */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Account</h3>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ background: selected.hasAccount ? '#d1fae5' : '#f3f4f6', color: selected.hasAccount ? '#065f46' : '#6b7280', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 9999 }}>
                    {selected.hasAccount ? 'Registered Account' : 'Guest Customer'}
                  </span>
                  <span style={{ background: '#f3f4f6', color: '#374151', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 9999 }}>
                    First order: {fmtDate(selected.firstOrder)}
                  </span>
                </div>
              </div>

              {/* Order History */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Order History</h3>
                {customerOrders.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#9ca3af' }}>No orders</p>
                ) : (
                  customerOrders.map((order, i) => (
                    <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111', textTransform: 'capitalize' }}>{order.status}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>{fmtDate(order.date)}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{fmtUSD(order.total)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Notes */}
              <div>
                <h3 style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Internal Notes</h3>
                <textarea
                  value={note} onChange={e => setNote(e.target.value)}
                  placeholder="Add notes about this customer..."
                  rows={3}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', resize: 'vertical' }}
                />
                <button
                  onClick={saveNote}
                  disabled={noteSaving}
                  style={{ marginTop: 8, padding: '8px 18px', background: noteSaved ? '#065f46' : '#0F2A4A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: noteSaving ? 0.7 : 1 }}
                >
                  {noteSaved ? '✓ Saved' : noteSaving ? 'Saving…' : 'Save Note'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
