import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

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

const STATUS_OPTIONS = ['all', 'pending', 'awaiting-payment', 'processing', 'on-hold', 'shipped', 'completed', 'cancelled', 'refunded'];

function fmtUSD(n) { return `$${parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' ' + dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>{title}</h3>
      {children}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f9fafb' }}>
      <span style={{ fontSize: 12, color: '#6b7280' }}>{label}</span>
      <span style={{ fontSize: 13, color: '#111', fontWeight: 500 }}>{value || '—'}</span>
    </div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editTracking, setEditTracking] = useState('');
  const [editNote, setEditNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    const pw = localStorage.getItem('evo_admin_pw') || '';
    const params = new URLSearchParams({ limit: 200, status: statusFilter, search });
    fetch(`/api/admin/orders?${params}`, { headers: { Authorization: `Bearer ${pw}` } })
      .then(r => r.json())
      .then(data => { setOrders(data.orders || []); setTotal(data.total || 0); setLoading(false); })
      .catch(() => setLoading(false));
  }, [statusFilter, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const openOrder = (order) => {
    setSelectedOrder(order);
    setEditStatus(order.status);
    setEditTracking(order.tracking_number || '');
    setEditNote(order.notes || '');
    setSaved(false);
  };

  const saveChanges = async () => {
    setSaving(true);
    const pw = localStorage.getItem('evo_admin_pw') || '';
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pw}` },
        body: JSON.stringify({ id: selectedOrder.id, status: editStatus, tracking_number: editTracking, notes: editNote }),
      });
      const data = await res.json();
      if (data.order) {
        setOrders(prev => prev.map(o => o.id === data.order.id ? data.order : o));
        setSelectedOrder(data.order);
        setEditTracking(data.order.tracking_number || '');
        setEditNote(data.order.notes || '');
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const exportCSV = () => {
    const rows = [['Order #', 'Customer Email', 'Total', 'Status', 'Tracking', 'Date']];
    orders.forEach(o => rows.push([
      o.order_number || o.wc_order_id, o.customer_email,
      parseFloat(o.total || 0).toFixed(2), o.status, o.tracking_number || '', fmtDate(o.created_at)
    ]));
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'evo-orders.csv'; a.click();
  };

  const statusCount = (s) => orders.filter(o => o.status === s).length;

  return (
    <AdminLayout title="Orders">
      <div style={{ display: 'flex', gap: 24, height: isMobile ? 'auto' : 'calc(100vh - 128px)', flexDirection: isMobile ? 'column' : 'row' }}>
        {/* Orders List — hidden on mobile when detail is open */}
        <div style={{ flex: (!isMobile && selectedOrder) ? '1 1 55%' : '1', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', display: isMobile && selectedOrder ? 'none' : 'flex', flexDirection: 'column', minHeight: isMobile ? 400 : 'auto' }}>
          {/* Filters */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text" placeholder="Search by email…" value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 180, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {STATUS_OPTIONS.map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} style={{
                  padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  border: '1px solid', cursor: 'pointer',
                  background: statusFilter === s ? '#1B4D3E' : '#fff',
                  borderColor: statusFilter === s ? '#1B4D3E' : '#e5e7eb',
                  color: statusFilter === s ? '#fff' : '#374151',
                  textTransform: 'capitalize',
                }}>
                  {s === 'all' ? `All (${total})` : `${s} (${statusCount(s)})`}
                </button>
              ))}
            </div>
            <button onClick={exportCSV} style={{ padding: '8px 16px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151', flexShrink: 0 }}>
              Export CSV
            </button>
          </div>

          {/* Table */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>Loading orders…</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#f9fafb', zIndex: 1 }}>
                  <tr>
                    {['Order', 'Customer', 'Items', 'Total', 'Status', 'Date'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => {
                    const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
                    const isSelected = selectedOrder?.id === order.id;
                    const items = Array.isArray(order.line_items) ? order.line_items : [];
                    return (
                      <tr
                        key={order.id}
                        onClick={() => openOrder(order)}
                        style={{ borderTop: '1px solid #f3f4f6', cursor: 'pointer', background: isSelected ? '#f0fdf4' : 'transparent' }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f9fafb'; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#1B4D3E' }}>
                          #{order.order_number || order.wc_order_id}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontSize: 13, color: '#111' }}>{order.customer_email}</div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280' }}>{items.length} item{items.length !== 1 ? 's' : ''}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#111' }}>{fmtUSD(order.total)}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 9999, textTransform: 'capitalize' }}>
                            {order.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280' }}>{fmtDate(order.created_at)}</td>
                      </tr>
                    );
                  })}
                  {orders.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>No orders found. Orders will sync here when your WooCommerce webhook fires.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Order Detail Panel */}
        {selectedOrder && (() => {
          const items = Array.isArray(selectedOrder.line_items) ? selectedOrder.line_items : [];
          const addr = selectedOrder.shipping_address || {};
          const sc = STATUS_COLORS[selectedOrder.status] || STATUS_COLORS.pending;
          return (
            <div style={{ width: isMobile ? '100%' : 420, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0, minHeight: isMobile ? 500 : 'auto' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111' }}>Order #{selectedOrder.order_number || selectedOrder.wc_order_id}</h2>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{fmtDate(selectedOrder.created_at)}</div>
                </div>
                <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#6b7280', padding: 4 }}>✕</button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                {/* Customer */}
                <Section title="Customer">
                  <Detail label="Email" value={selectedOrder.customer_email} />
                  {addr.first_name && <Detail label="Name" value={`${addr.first_name} ${addr.last_name}`} />}
                  {addr.city && <Detail label="City" value={`${addr.city}, ${addr.state} ${addr.postcode}`} />}
                </Section>

                {/* Items */}
                <Section title={`Items (${items.length})`}>
                  {items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ fontSize: 13, color: '#374151' }}>{item.name} × {item.quantity}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{fmtUSD(item.total)}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid #f3f4f6', marginTop: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>Total</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>{fmtUSD(selectedOrder.total)}</span>
                  </div>
                </Section>

                {/* Shipping via PirateShip */}
                <Section title="Ship this Order">
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px 14px', marginBottom: 10 }}>
                    <div style={{ fontSize: 12, color: '#065f46', fontWeight: 600, marginBottom: 6 }}>Shipping Address</div>
                    {addr.first_name ? (
                      <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
                        {addr.first_name} {addr.last_name}<br />
                        {addr.address_1}{addr.address_2 ? `, ${addr.address_2}` : ''}<br />
                        {addr.city}, {addr.state} {addr.postcode}<br />
                        {addr.country}
                      </div>
                    ) : (
                      <div style={{ fontSize: 13, color: '#9ca3af' }}>No shipping address on file</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a
                      href="https://ship.pirateship.com/shipments/new"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        flex: 1, padding: '9px 12px', background: '#1B4D3E', color: '#fff',
                        borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none',
                        textAlign: 'center', display: 'block',
                      }}
                    >
                      Open PirateShip →
                    </a>
                    <button
                      onClick={() => {
                        const lines = [
                          `${addr.first_name || ''} ${addr.last_name || ''}`.trim(),
                          addr.address_1,
                          addr.address_2,
                          addr.city && `${addr.city}, ${addr.state} ${addr.postcode}`,
                          addr.country,
                        ].filter(Boolean).join('\n');
                        navigator.clipboard.writeText(lines);
                      }}
                      style={{
                        padding: '9px 14px', background: '#f3f4f6', border: '1px solid #e5e7eb',
                        borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151',
                      }}
                    >
                      Copy Address
                    </button>
                  </div>
                </Section>

                {/* Editable Status */}
                <Section title="Order Management">
                  <label style={{ display: 'block', fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 6 }}>Status</label>
                  <select value={editStatus} onChange={e => setEditStatus(e.target.value)} style={{
                    width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb',
                    borderRadius: 8, fontSize: 13, background: '#fff', cursor: 'pointer', marginBottom: 12,
                  }}>
                    {['pending', 'awaiting-payment', 'processing', 'on-hold', 'shipped', 'completed', 'cancelled', 'refunded'].map(s => (
                      <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                  <label style={{ display: 'block', fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 6 }}>Tracking Number</label>
                  <input
                    type="text" value={editTracking} onChange={e => setEditTracking(e.target.value)}
                    placeholder="e.g. 9400111899223382234280"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', marginBottom: 12 }}
                  />
                  <label style={{ display: 'block', fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 6 }}>Internal Notes</label>
                  <textarea
                    value={editNote} onChange={e => setEditNote(e.target.value)}
                    placeholder="Not visible to customer"
                    rows={3}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', resize: 'vertical' }}
                  />
                </Section>
              </div>

              {/* Save Bar */}
              <div style={{ padding: '16px 20px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 10 }}>
                <button onClick={saveChanges} disabled={saving} style={{
                  flex: 1, padding: '10px', background: saved ? '#065f46' : '#1B4D3E', color: '#fff',
                  border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  transition: 'background 0.2s', opacity: saving ? 0.7 : 1,
                }}>
                  {saving ? 'Saving…' : saved ? '✓ Saved to Supabase' : 'Save Changes'}
                </button>
                {editTracking && (
                  <a href={`https://tools.usps.com/go/TrackConfirmAction?tLabels=${editTracking}`} target="_blank" rel="noreferrer" style={{
                    padding: '10px 16px', background: '#f3f4f6', borderRadius: 8, fontSize: 13,
                    fontWeight: 600, color: '#374151', textDecoration: 'none', display: 'flex', alignItems: 'center',
                  }}>
                    Track ↗
                  </a>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </AdminLayout>
  );
}
