import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtDateTime(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return (
    dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' ' +
    dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  );
}

function fmtUSD(n) {
  return `$${parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getPriority(createdAt) {
  const ageMs = Date.now() - new Date(createdAt).getTime();
  const ageHrs = ageMs / (1000 * 60 * 60);
  if (ageHrs > 48) return { dot: '🔴', label: '>48h', level: 3 };
  if (ageHrs > 24) return { dot: '🟡', label: '24-48h', level: 2 };
  return { dot: '🟢', label: '<24h', level: 1 };
}

function Spinner() {
  return (
    <span style={{
      display: 'inline-block', width: 16, height: 16,
      border: '2px solid #e5e7eb', borderTopColor: '#0F2A4A',
      borderRadius: '50%', animation: 'spin 0.7s linear infinite',
      verticalAlign: 'middle',
    }} />
  );
}

// ─── Ship Modal ────────────────────────────────────────────────────────────────
function ShipModal({ order, onClose, onShipped }) {
  const [weight, setWeight] = useState('0.5');
  const [length, setLength] = useState('6');
  const [width, setWidth] = useState('4');
  const [height, setHeight] = useState('2');
  const [loadingRates, setLoadingRates] = useState(false);
  const [rates, setRates] = useState(null);
  const [ratesError, setRatesError] = useState('');
  const [buyingRateId, setBuyingRateId] = useState(null);
  const [labelResult, setLabelResult] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const addr = order.shipping_address || {};
  const customerName = [addr.first_name, addr.last_name].filter(Boolean).join(' ') || order.customer_email;
  const pw = typeof window !== 'undefined' ? localStorage.getItem('evo_admin_pw') || '' : '';

  const getRates = async () => {
    setLoadingRates(true);
    setRatesError('');
    setRates(null);
    setLabelResult(null);
    try {
      const res = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pw}` },
        body: JSON.stringify({
          orderId: order.id,
          weight: parseFloat(weight),
          length: parseFloat(length),
          width: parseFloat(width),
          height: parseFloat(height),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch rates');
      setRates(data.rates || []);
    } catch (err) {
      setRatesError(err.message);
    }
    setLoadingRates(false);
  };

  const buyLabel = async (rateId) => {
    setBuyingRateId(rateId);
    try {
      const res = await fetch('/api/shipping/buy-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pw}` },
        body: JSON.stringify({ rateId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to buy label');
      setLabelResult(data);
    } catch (err) {
      alert('Error buying label: ' + err.message);
    }
    setBuyingRateId(null);
  };

  const confirmShipment = async () => {
    if (!labelResult) return;
    setConfirming(true);
    try {
      const res = await fetch('/api/shipping/mark-shipped', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pw}` },
        body: JSON.stringify({
          orderId: order.id,
          trackingNumber: labelResult.trackingNumber,
          carrier: labelResult.carrier,
          labelUrl: labelResult.labelUrl,
          shipmentCost: labelResult.cost,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to mark shipped');
      onShipped(order.id);
      onClose();
    } catch (err) {
      alert('Error confirming shipment: ' + err.message);
    }
    setConfirming(false);
  };

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }}
      >
        {/* Modal Card */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560,
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '20px 24px', borderBottom: '1px solid #e5e7eb',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            position: 'sticky', top: 0, background: '#fff', zIndex: 1,
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#111' }}>
                Ship Order #{order.order_number || order.wc_order_id}
              </h2>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{customerName}</div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#6b7280', padding: '0 4px', lineHeight: 1 }}>✕</button>
          </div>

          <div style={{ padding: '20px 24px' }}>
            {/* Section 1 — Ship To */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Ship To</div>
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', fontSize: 14, color: '#374151', lineHeight: 1.8 }}>
                {addr.first_name ? (
                  <>
                    <strong>{addr.first_name} {addr.last_name}</strong><br />
                    {addr.address_1}{addr.address_2 ? `, ${addr.address_2}` : ''}<br />
                    {addr.city}, {addr.state} {addr.postcode}<br />
                    {addr.country}
                  </>
                ) : (
                  <span style={{ color: '#9ca3af' }}>No shipping address on file</span>
                )}
              </div>
            </div>

            {/* Section 2 — Package Details */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Package Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Weight (lbs)', value: weight, set: setWeight },
                  { label: 'Length (in)', value: length, set: setLength },
                  { label: 'Width (in)', value: width, set: setWidth },
                  { label: 'Height (in)', value: height, set: setHeight },
                ].map(({ label, value, set }) => (
                  <div key={label}>
                    <label style={{ display: 'block', fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 4 }}>{label}</label>
                    <input
                      type="number" min="0" step="0.1" value={value}
                      onChange={e => set(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none' }}
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={getRates}
                disabled={loadingRates}
                style={{
                  marginTop: 14, width: '100%', padding: '10px', background: '#0F2A4A', color: '#fff',
                  border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: loadingRates ? 'not-allowed' : 'pointer',
                  opacity: loadingRates ? 0.75 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {loadingRates ? <><Spinner /> Getting Rates…</> : 'Get Rates'}
              </button>
              {ratesError && (
                <div style={{ marginTop: 10, background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#991b1b' }}>
                  {ratesError}
                </div>
              )}
            </div>

            {/* Section 3 — Rate Cards */}
            {rates && !labelResult && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                  Available Rates ({rates.length})
                </div>
                {rates.length === 0 ? (
                  <div style={{ color: '#6b7280', fontSize: 14 }}>No rates available for this shipment.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {rates.map(rate => {
                      const isUPS = (rate.provider || '').toUpperCase().includes('UPS');
                      const isBuying = buyingRateId === rate.rateId;
                      return (
                        <div
                          key={rate.rateId}
                          style={{
                            border: `2px solid ${isUPS ? '#C9A96E' : '#e5e7eb'}`,
                            borderRadius: 10, padding: '12px 16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: isUPS ? '#eff6ff' : '#fafafa',
                            transition: 'box-shadow 0.15s',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>
                              {rate.provider} {rate.service}
                            </div>
                            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                              {rate.days != null ? `Est. ${rate.days} day${rate.days !== 1 ? 's' : ''}` : 'Est. delivery varies'}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>${parseFloat(rate.amount).toFixed(2)}</span>
                            <button
                              onClick={() => buyLabel(rate.rateId)}
                              disabled={isBuying || buyingRateId !== null}
                              style={{
                                padding: '7px 16px', background: '#0F2A4A', color: '#fff',
                                border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700,
                                cursor: (isBuying || buyingRateId !== null) ? 'not-allowed' : 'pointer',
                                opacity: (buyingRateId !== null && !isBuying) ? 0.5 : 1,
                                display: 'flex', alignItems: 'center', gap: 6,
                              }}
                            >
                              {isBuying ? <><Spinner /> Buying…</> : 'Buy'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Label Created */}
            {labelResult && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 10, padding: '16px 20px', marginBottom: 14 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#065f46', marginBottom: 8 }}>✓ Label Created</div>
                  <div style={{ fontSize: 13, color: '#065f46', lineHeight: 2 }}>
                    <div><strong>Carrier:</strong> {labelResult.carrier}</div>
                    <div><strong>Tracking:</strong> {labelResult.trackingNumber}</div>
                    <div><strong>Cost:</strong> {fmtUSD(labelResult.cost)}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {labelResult.labelUrl && (
                    <button
                      onClick={() => window.open(labelResult.labelUrl, '_blank')}
                      style={{
                        flex: 1, padding: '10px', background: '#f3f4f6', border: '1px solid #e5e7eb',
                        borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151',
                      }}
                    >
                      🖨 Print Label
                    </button>
                  )}
                  <button
                    onClick={confirmShipment}
                    disabled={confirming}
                    style={{
                      flex: 1, padding: '10px', background: confirming ? '#6b7280' : '#0F2A4A', color: '#fff',
                      border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700,
                      cursor: confirming ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}
                  >
                    {confirming ? <><Spinner /> Confirming…</> : '✓ Confirm Shipment'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminShipping() {
  const [activeTab, setActiveTab] = useState('unfulfilled');
  const [unfulfilled, setUnfulfilled] = useState([]);
  const [shipped, setShipped] = useState([]);
  const [delivered, setDelivered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOrder, setModalOrder] = useState(null);

  const pw = typeof window !== 'undefined' ? localStorage.getItem('evo_admin_pw') || '' : '';

  const authHeaders = { Authorization: `Bearer ${pw}` };

  const fetchUnfulfilled = useCallback(async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([
        fetch('/api/admin/orders?status=processing&limit=200', { headers: authHeaders }),
        fetch('/api/admin/orders?status=paid&limit=200', { headers: authHeaders }),
      ]);
      const [d1, d2] = await Promise.all([r1.json(), r2.json()]);
      const combined = [...(d1.orders || []), ...(d2.orders || [])];
      // Deduplicate by id
      const seen = new Set();
      const unique = combined.filter(o => { if (seen.has(o.id)) return false; seen.add(o.id); return true; });
      // Sort oldest first
      unique.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      setUnfulfilled(unique);
    } catch (err) {
      console.error('Failed to fetch unfulfilled orders', err);
    }
    setLoading(false);
  }, [pw]);

  const fetchShipped = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders?status=shipped&limit=200', { headers: authHeaders });
      const data = await res.json();
      setShipped(data.orders || []);
    } catch (err) {
      console.error('Failed to fetch shipped orders', err);
    }
    setLoading(false);
  }, [pw]);

  const fetchDelivered = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders?status=delivered&limit=200', { headers: authHeaders });
      const data = await res.json();
      setDelivered(data.orders || []);
    } catch (err) {
      console.error('Failed to fetch delivered orders', err);
    }
    setLoading(false);
  }, [pw]);

  useEffect(() => {
    if (activeTab === 'unfulfilled') fetchUnfulfilled();
    if (activeTab === 'shipped') fetchShipped();
    if (activeTab === 'delivered') fetchDelivered();
  }, [activeTab]);

  const handleShipped = (orderId) => {
    setUnfulfilled(prev => prev.filter(o => o.id !== orderId));
  };

  const tabs = [
    { key: 'unfulfilled', label: 'Unfulfilled', count: unfulfilled.length },
    { key: 'shipped', label: 'Shipped', count: shipped.length },
    { key: 'delivered', label: 'Delivered', count: delivered.length },
  ];

  const thStyle = {
    padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700,
    color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em',
    background: '#f9fafb', borderBottom: '1px solid #e5e7eb',
  };

  const tdStyle = { padding: '12px 16px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6' };

  return (
    <AdminLayout title="Fulfillment Queue">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .rate-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
      `}</style>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #e5e7eb', paddingBottom: 0 }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              border: 'none', background: 'none', borderBottom: activeTab === tab.key ? '2px solid #0F2A4A' : '2px solid transparent',
              color: activeTab === tab.key ? '#0F2A4A' : '#6b7280',
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'color 0.15s, border-color 0.15s',
              marginBottom: -1,
            }}
          >
            {tab.label}
            <span style={{
              background: activeTab === tab.key ? '#0F2A4A' : '#e5e7eb',
              color: activeTab === tab.key ? '#fff' : '#6b7280',
              fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 9999,
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <Spinner /> Loading…
          </div>
        ) : (
          <>
            {/* ─── UNFULFILLED ─── */}
            {activeTab === 'unfulfilled' && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Priority', 'Order #', 'Date', 'Customer', 'Items', 'Action'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {unfulfilled.map(order => {
                    const p = getPriority(order.created_at);
                    const items = Array.isArray(order.line_items) ? order.line_items : [];
                    return (
                      <tr key={order.id} style={{ background: 'transparent' }}>
                        <td style={tdStyle}>
                          <span title={p.label} style={{ fontSize: 18, lineHeight: 1 }}>{p.dot}</span>
                          <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 4 }}>{p.label}</span>
                        </td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: '#0F2A4A' }}>
                          #{order.order_number || order.wc_order_id}
                        </td>
                        <td style={{ ...tdStyle, color: '#6b7280' }}>{fmtDateTime(order.created_at)}</td>
                        <td style={tdStyle}>{order.customer_email}</td>
                        <td style={tdStyle}>{items.length} item{items.length !== 1 ? 's' : ''}</td>
                        <td style={tdStyle}>
                          <button
                            onClick={() => setModalOrder(order)}
                            style={{
                              padding: '7px 14px', background: '#0F2A4A', color: '#fff',
                              border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700,
                              cursor: 'pointer', whiteSpace: 'nowrap',
                            }}
                          >
                            Ship This Order
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {unfulfilled.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                        No unfulfilled orders. All caught up!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {/* ─── SHIPPED ─── */}
            {activeTab === 'shipped' && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Order #', 'Customer', 'Shipped Date', 'Carrier', 'Tracking #', 'Track'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shipped.map(order => (
                    <tr key={order.id}>
                      <td style={{ ...tdStyle, fontWeight: 700, color: '#0F2A4A' }}>
                        #{order.order_number || order.wc_order_id}
                      </td>
                      <td style={tdStyle}>{order.customer_email}</td>
                      <td style={{ ...tdStyle, color: '#6b7280' }}>{fmtDate(order.shipped_at || order.updated_at)}</td>
                      <td style={tdStyle}>{order.carrier || '—'}</td>
                      <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 12 }}>{order.tracking_number || '—'}</td>
                      <td style={tdStyle}>
                        {order.tracking_number ? (
                          <a
                            href={`/track?number=${order.tracking_number}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#0F2A4A', fontWeight: 700, textDecoration: 'none', fontSize: 13 }}
                          >
                            Track →
                          </a>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                  {shipped.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                        No shipped orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {/* ─── DELIVERED ─── */}
            {activeTab === 'delivered' && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Order #', 'Customer', 'Shipped Date', 'Delivered', 'Status'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {delivered.map(order => (
                    <tr key={order.id}>
                      <td style={{ ...tdStyle, fontWeight: 700, color: '#0F2A4A' }}>
                        #{order.order_number || order.wc_order_id}
                      </td>
                      <td style={tdStyle}>{order.customer_email}</td>
                      <td style={{ ...tdStyle, color: '#6b7280' }}>{fmtDate(order.shipped_at || order.updated_at)}</td>
                      <td style={{ ...tdStyle, color: '#6b7280' }}>{fmtDate(order.delivered_at) || '—'}</td>
                      <td style={tdStyle}>
                        <span style={{
                          background: '#d1fae5', color: '#065f46',
                          fontSize: 11, fontWeight: 700, padding: '3px 9px',
                          borderRadius: 9999, textTransform: 'capitalize',
                        }}>
                          Delivered
                        </span>
                      </td>
                    </tr>
                  ))}
                  {delivered.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                        No delivered orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      {/* Ship Modal */}
      {modalOrder && (
        <ShipModal
          order={modalOrder}
          onClose={() => setModalOrder(null)}
          onShipped={handleShipped}
        />
      )}
    </AdminLayout>
  );
}
