import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

const TYPE_LABELS = {
  percent:       'Percent Off',
  fixed:         'Fixed Amount',
  free_shipping: 'Free Shipping only',
  bogo:          'Buy One Get One',
};

// Base types that can have free shipping added
const BASE_TYPES_WITH_VALUE = ['percent', 'fixed'];

const BLANK_FORM = {
  code: '', type: 'percent', value: 10, minOrder: 0,
  limit: '', startDate: new Date().toISOString().split('T')[0],
  endDate: '', description: '', includesFreeShip: false,
};

function authHeaders() {
  const pw = typeof window !== 'undefined' ? localStorage.getItem('evo_admin_pw') || '' : '';
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${pw}` };
}

export default function AdminDiscounts() {
  const [discounts, setDiscounts]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editingId, setEditingId]   = useState(null); // null = create mode, id = edit mode
  const [form, setForm]             = useState(BLANK_FORM);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');

  const fetchDiscounts = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/admin/discounts', { headers: authHeaders() });
      const data = await res.json();
      setDiscounts(data.discounts || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDiscounts(); }, [fetchDiscounts]);

  // ── Open edit form pre-filled ──────────────────────────────────────────────
  const openEdit = (d) => {
    // Decode combined types back to base + checkbox
    const isCombined = d.type === 'percent_free' || d.type === 'fixed_free';
    const baseType   = d.type === 'percent_free' ? 'percent'
                     : d.type === 'fixed_free'   ? 'fixed'
                     : d.type;
    setForm({
      code:             d.code,
      type:             baseType,
      value:            d.value ?? 0,
      minOrder:         d.min_order ?? 0,
      limit:            d.usage_limit ?? '',
      startDate:        d.start_date || '',
      endDate:          d.end_date || '',
      description:      d.description || '',
      includesFreeShip: isCombined,
    });
    setEditingId(d.id);
    setShowForm(true);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCreate = () => {
    setForm(BLANK_FORM);
    setEditingId(null);
    setShowForm(true);
    setError('');
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(BLANK_FORM);
    setError('');
  };

  // ── Toggle active ──────────────────────────────────────────────────────────
  const toggleActive = async (d) => {
    const res  = await fetch('/api/admin/discounts', {
      method: 'PATCH', headers: authHeaders(),
      body: JSON.stringify({ id: d.id, active: !d.active }),
    });
    const data = await res.json();
    if (data.discount) setDiscounts(prev => prev.map(x => x.id === d.id ? data.discount : x));
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteDiscount = async (d) => {
    if (!confirm(`Delete discount code ${d.code}?`)) return;
    await fetch(`/api/admin/discounts?id=${d.id}`, { method: 'DELETE', headers: authHeaders() });
    setDiscounts(prev => prev.filter(x => x.id !== d.id));
    if (editingId === d.id) closeForm();
  };

  // ── Save (create OR edit) ──────────────────────────────────────────────────
  const saveDiscount = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    // Encode combined type: percent+free_ship → percent_free, fixed+free_ship → fixed_free
    const resolvedType = form.includesFreeShip && BASE_TYPES_WITH_VALUE.includes(form.type)
      ? `${form.type}_free`
      : form.type;
    const payload = {
      code:        form.code,
      type:        resolvedType,
      value:       form.type === 'free_shipping' ? 0 : parseFloat(form.value) || 0,
      minOrder:    form.minOrder,
      usageLimit:  form.limit || null,
      active:      true,
      startDate:   form.startDate || null,
      endDate:     form.endDate   || null,
      description: form.description,
    };
    try {
      let res, data;
      if (editingId) {
        // PATCH — update existing
        res  = await fetch('/api/admin/discounts', {
          method: 'PATCH', headers: authHeaders(),
          body: JSON.stringify({ id: editingId, ...payload }),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update');
        setDiscounts(prev => prev.map(x => x.id === editingId ? data.discount : x));
      } else {
        // POST — create new
        res  = await fetch('/api/admin/discounts', {
          method: 'POST', headers: authHeaders(),
          body: JSON.stringify(payload),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create');
        setDiscounts(prev => [data.discount, ...prev]);
      }
      closeForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const generateCode = () => {
    const words = ['EVO', 'LABS', 'RESEARCH', 'PEPTIDE', 'PROMO'];
    const word = words[Math.floor(Math.random() * words.length)];
    const num  = Math.floor(Math.random() * 90) + 10;
    setForm(prev => ({ ...prev, code: `${word}${num}` }));
  };

  const activeCount = discounts.filter(d => d.active).length;
  const totalUses   = discounts.reduce((s, d) => s + (d.uses || 0), 0);

  return (
    <AdminLayout title="Discounts & Coupons">
      <div style={{ maxWidth: 1100 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>{activeCount} active codes · {totalUses} total uses</p>
          <button onClick={showForm ? closeForm : openCreate}
            style={{ padding: '10px 20px', background: '#1B4D3E', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            {showForm ? '✕ Cancel' : '+ Create Discount'}
          </button>
        </div>

        {/* Create / Edit Form */}
        {showForm && (
          <div style={{ background: '#fff', borderRadius: 12, border: `2px solid ${editingId ? '#1B4D3E' : '#e5e7eb'}`, padding: '24px', marginBottom: 24 }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: '#111' }}>
              {editingId ? `✏️ Edit Discount — ${form.code}` : '+ Create Discount Code'}
            </h2>
            <form onSubmit={saveDiscount}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {/* Code */}
                <div>
                  <label style={labelStyle}>Discount Code</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input required type="text" value={form.code}
                      onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. SAVE10"
                      style={{ ...inputStyle, textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700 }} />
                    {!editingId && (
                      <button type="button" onClick={generateCode}
                        style={{ padding: '8px 10px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, cursor: 'pointer', flexShrink: 0 }}>
                        Random
                      </button>
                    )}
                  </div>
                </div>

                {/* Type */}
                <div>
                  <label style={labelStyle}>Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={inputStyle}>
                    {Object.entries(TYPE_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Value (hidden for free_shipping & bogo) */}
                {(form.type === 'percent' || form.type === 'fixed') && (
                  <div>
                    <label style={labelStyle}>{form.type === 'percent' ? 'Percent Off (%)' : 'Amount Off ($)'}</label>
                    <input type="number" min="0" step="0.01" value={form.value}
                      onChange={e => setForm({ ...form, value: e.target.value })} style={inputStyle} />
                  </div>
                )}

                {/* Free shipping helper text */}
                {form.type === 'free_shipping' && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#15803d', fontWeight: 600 }}>
                      🚚 Waives shipping cost at checkout
                    </div>
                  </div>
                )}

                {/* Include free shipping checkbox (for percent / fixed types) */}
                {BASE_TYPES_WITH_VALUE.includes(form.type) && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                      background: form.includesFreeShip ? '#eff6ff' : '#f9fafb',
                      border: `1.5px solid ${form.includesFreeShip ? '#bfdbfe' : '#e5e7eb'}`,
                      borderRadius: 10, padding: '12px 16px', transition: 'all 0.15s' }}>
                      <input
                        type="checkbox"
                        checked={form.includesFreeShip}
                        onChange={e => setForm({ ...form, includesFreeShip: e.target.checked })}
                        style={{ width: 18, height: 18, accentColor: '#1d4ed8', cursor: 'pointer' }}
                      />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: form.includesFreeShip ? '#1d4ed8' : '#374151' }}>
                          🚚 Also give free shipping with this coupon
                        </div>
                        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                          Customer gets both the discount <strong>and</strong> free shipping when they apply this code
                        </div>
                      </div>
                    </label>
                  </div>
                )}

                {/* Min order */}
                <div>
                  <label style={labelStyle}>Min Order ($)</label>
                  <input type="number" min="0" step="0.01" value={form.minOrder}
                    onChange={e => setForm({ ...form, minOrder: e.target.value })} style={inputStyle} />
                </div>

                {/* Usage limit */}
                <div>
                  <label style={labelStyle}>Usage Limit (blank = unlimited)</label>
                  <input type="number" min="1" value={form.limit}
                    onChange={e => setForm({ ...form, limit: e.target.value })}
                    placeholder="Unlimited" style={inputStyle} />
                </div>

                {/* Start date */}
                <div>
                  <label style={labelStyle}>Start Date</label>
                  <input type="date" value={form.startDate}
                    onChange={e => setForm({ ...form, startDate: e.target.value })} style={inputStyle} />
                </div>

                {/* End date */}
                <div>
                  <label style={labelStyle}>End Date (blank = no expiry)</label>
                  <input type="date" value={form.endDate}
                    onChange={e => setForm({ ...form, endDate: e.target.value })} style={inputStyle} />
                </div>

                {/* Description */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Description (internal)</label>
                  <input type="text" value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Internal note about this code" style={inputStyle} />
                </div>
              </div>

              {error && <div style={{ marginTop: 12, color: '#dc2626', fontSize: 13 }}>✕ {error}</div>}

              <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                <button type="submit" disabled={saving}
                  style={{ padding: '10px 24px', background: '#1B4D3E', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving…' : editingId ? '💾 Save Changes' : 'Create Code'}
                </button>
                <button type="button" onClick={closeForm}
                  style={{ padding: '10px 24px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>Loading…</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Code', 'Type', 'Value', 'Min Order', 'Uses', 'Dates', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {discounts.map(d => (
                  <tr key={d.id} style={{ borderTop: '1px solid #f3f4f6', background: editingId === d.id ? '#f0fdf4' : 'transparent' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 800, color: '#1B4D3E' }}>{d.code}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{d.description}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: '#374151' }}>
                      {d.type === 'percent_free' ? 'Percent Off + Free Ship'
                        : d.type === 'fixed_free' ? 'Fixed Amount + Free Ship'
                        : TYPE_LABELS[d.type] || d.type}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: '#111' }}>
                      {d.type === 'percent'      ? `${d.value}% off`
                        : d.type === 'fixed'       ? `$${d.value} off`
                        : d.type === 'percent_free'? <span>{d.value}% off <span style={{ fontSize: 11, color: '#1d4ed8', fontWeight: 600 }}>+ 🚚 Free ship</span></span>
                        : d.type === 'fixed_free'  ? <span>${d.value} off <span style={{ fontSize: 11, color: '#1d4ed8', fontWeight: 600 }}>+ 🚚 Free ship</span></span>
                        : d.type === 'free_shipping'? '🚚 Free ship only'
                        : '—'}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151' }}>
                      {d.min_order > 0 ? `$${d.min_order}` : 'None'}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151' }}>
                      {d.uses || 0}{d.usage_limit ? ` / ${d.usage_limit}` : ''}
                      {d.usage_limit && (
                        <div style={{ marginTop: 4, height: 4, background: '#f3f4f6', borderRadius: 9999 }}>
                          <div style={{ height: 4, background: '#1B4D3E', borderRadius: 9999, width: `${Math.min(100, ((d.uses || 0) / d.usage_limit) * 100)}%` }} />
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: '#6b7280' }}>
                      <div>{d.start_date}</div>
                      {d.end_date ? <div>→ {d.end_date}</div> : <div style={{ color: '#9ca3af' }}>No expiry</div>}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: d.active ? '#d1fae5' : '#f3f4f6', color: d.active ? '#065f46' : '#6b7280', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 9999 }}>
                        {d.active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {/* Edit */}
                        <button onClick={() => openEdit(d)}
                          style={{ padding: '5px 12px', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: '#eff6ff', color: '#1d4ed8' }}>
                          ✏️ Edit
                        </button>
                        {/* Enable / Disable */}
                        <button onClick={() => toggleActive(d)}
                          style={{ padding: '5px 12px', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: d.active ? '#fee2e2' : '#f0fdf4', color: d.active ? '#991b1b' : '#374151' }}>
                          {d.active ? 'Disable' : 'Enable'}
                        </button>
                        {/* Delete */}
                        <button onClick={() => deleteDiscount(d)}
                          style={{ padding: '5px 10px', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', background: '#f3f4f6', color: '#9ca3af' }}>
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {discounts.length === 0 && !loading && (
                  <tr>
                    <td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                      No discount codes yet. Create one above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' };
const inputStyle  = { width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#fff', boxSizing: 'border-box', outline: 'none' };
