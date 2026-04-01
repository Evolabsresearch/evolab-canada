import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

function authHeaders() {
  const pw = typeof window !== 'undefined' ? localStorage.getItem('evo_admin_pw') || '' : '';
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${pw}` };
}

export default function AdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [showLowOnly, setShowLowOnly] = useState(false);
  const [adjustId, setAdjustId] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [log, setLog] = useState([]);
  const [adjusting, setAdjusting] = useState(false);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/inventory', { headers: authHeaders() });
      const data = await res.json();
      setInventory(data.inventory || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  const CATEGORIES = ['all', ...Array.from(new Set(inventory.map(p => p.category))).sort()];

  let filtered = inventory.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'all' || p.category === catFilter;
    const matchLow = !showLowOnly || p.stock <= (p.low_stock_threshold || 10);
    return matchSearch && matchCat && matchLow;
  });

  const totalValue = inventory.reduce((sum, p) => sum + (p.stock || 0) * (p.cost_per_unit || 0), 0);
  const lowStockCount = inventory.filter(p => p.stock > 0 && p.stock <= (p.low_stock_threshold || 10)).length;
  const outOfStockCount = inventory.filter(p => p.stock === 0).length;

  const handleAdjust = async (item) => {
    const qty = parseInt(adjustQty);
    if (isNaN(qty)) return;
    setAdjusting(true);
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ id: item.id, stockDelta: qty }),
      });
      const data = await res.json();
      if (data.item) {
        setInventory(prev => prev.map(p => p.id === item.id ? { ...p, ...data.item } : p));
        setLog(prev => [{
          time: new Date().toLocaleTimeString(),
          product: item.name,
          change: qty > 0 ? `+${qty}` : `${qty}`,
          newStock: data.item.stock,
          reason: adjustReason || 'Manual adjustment',
        }, ...prev.slice(0, 19)]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAdjusting(false);
      setAdjustId(null);
      setAdjustQty('');
      setAdjustReason('');
    }
  };

  return (
    <AdminLayout title="Inventory">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
        {[
          { label: 'Total SKUs', value: inventory.length, icon: '🧬' },
          { label: 'Inventory Value', value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: '💰' },
          { label: 'Low Stock Alerts', value: lowStockCount, icon: '⚠', color: '#d97706' },
          { label: 'Out of Stock', value: outOfStockCount, icon: '🔴', color: '#dc2626' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: color || '#111' }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Search products or SKU..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 180, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }} />
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#fff' }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
              <input type="checkbox" checked={showLowOnly} onChange={e => setShowLowOnly(e.target.checked)} /> Low stock only
            </label>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 340px)' }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>Loading inventory…</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#f9fafb', zIndex: 1 }}>
                  <tr>
                    {['Product', 'SKU', 'Category', 'Stock', 'Cost/Unit', 'Status', 'Adjust'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(item => {
                    const threshold = item.low_stock_threshold || 10;
                    const isLow = item.stock > 0 && item.stock <= threshold;
                    const isOOS = item.stock === 0;
                    const isAdjusting = adjustId === item.id;
                    return (
                      <tr key={item.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#111' }}>{item.name}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>{item.sku}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280' }}>{item.category}</td>
                        <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700, color: isOOS ? '#dc2626' : isLow ? '#d97706' : '#111' }}>
                          {item.stock}{isLow && <span style={{ fontSize: 10, marginLeft: 4 }}>⚠</span>}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151' }}>
                          ${(item.cost_per_unit || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: isOOS ? '#fee2e2' : isLow ? '#fef3c7' : '#d1fae5', color: isOOS ? '#991b1b' : isLow ? '#92400e' : '#065f46', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 9999 }}>
                            {isOOS ? 'OUT OF STOCK' : isLow ? 'LOW STOCK' : 'IN STOCK'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {isAdjusting ? (
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <input type="number" value={adjustQty} onChange={e => setAdjustQty(e.target.value)}
                                placeholder="±qty" style={{ width: 64, padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12 }} />
                              <button onClick={() => handleAdjust(item)} disabled={adjusting}
                                style={{ padding: '4px 10px', background: '#0F2A4A', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>✓</button>
                              <button onClick={() => setAdjustId(null)} style={{ padding: '4px 8px', background: '#f3f4f6', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>✕</button>
                            </div>
                          ) : (
                            <button onClick={() => setAdjustId(item.id)} style={{ padding: '5px 10px', background: '#f3f4f6', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
                              Adjust
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111' }}>Adjustment Log</h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Recent stock changes this session</p>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
            {log.length === 0 ? (
              <div style={{ padding: '24px 20px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                No adjustments yet. Use the Adjust button to modify stock levels.
              </div>
            ) : (
              log.map((entry, i) => (
                <div key={i} style={{ padding: '10px 20px', borderBottom: '1px solid #f9fafb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{entry.product}</div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: entry.change.startsWith('+') ? '#065f46' : '#991b1b' }}>{entry.change}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>→ {entry.newStock} in stock · {entry.time}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{entry.reason}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
