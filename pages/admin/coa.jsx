import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

function authHeaders() {
  const pw = typeof window !== 'undefined' ? localStorage.getItem('evo_admin_pw') || '' : '';
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${pw}` };
}

const EMPTY_FORM = { product_name: '', batch_number: '', test_date: '', pdf_url: '', notes: '' };

function Input({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, color: '#111', outline: 'none', boxSizing: 'border-box' }}
      />
    </div>
  );
}

export default function AdminCOA() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchEntries(); }, []);

  async function fetchEntries() {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/coa', { headers: authHeaders() });
      const data = await r.json();
      if (data.entries) setEntries(data.entries);
      else setError(data.error || 'Failed to load');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  function selectEntry(entry) {
    setSelected(entry);
    setShowNew(false);
    setForm({
      product_name: entry.product_name || '',
      batch_number: entry.batch_number || '',
      test_date: entry.test_date || '',
      pdf_url: entry.pdf_url || '',
      notes: entry.notes || '',
    });
    setSaved(false);
  }

  function openNew() {
    setSelected(null);
    setShowNew(true);
    setForm(EMPTY_FORM);
    setSaved(false);
  }

  async function handleSave() {
    if (!form.product_name.trim()) return;
    setSaving(true);
    try {
      const isNew = showNew;
      const body = isNew ? form : { id: selected.id, ...form };
      const r = await fetch('/api/admin/coa', {
        method: isNew ? 'POST' : 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (data.entry) {
        if (isNew) {
          setEntries(prev => [...prev, data.entry].sort((a, b) => a.product_name.localeCompare(b.product_name)));
          setSelected(data.entry);
          setShowNew(false);
        } else {
          setEntries(prev => prev.map(e => e.id === data.entry.id ? data.entry : e));
          setSelected(data.entry);
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setError(data.error || 'Save failed');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selected || !confirm(`Delete COA for "${selected.product_name}"?`)) return;
    const r = await fetch('/api/admin/coa', {
      method: 'DELETE',
      headers: authHeaders(),
      body: JSON.stringify({ id: selected.id }),
    });
    if (r.ok) {
      setEntries(prev => prev.filter(e => e.id !== selected.id));
      setSelected(null);
      setForm(EMPTY_FORM);
    }
  }

  const filtered = entries.filter(e =>
    !search || e.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.batch_number?.toLowerCase().includes(search.toLowerCase())
  );

  const panelOpen = selected || showNew;

  return (
    <AdminLayout title="COA Management">
      <style>{`
        .coa-grid { display: grid; grid-template-columns: 300px 1fr; gap: 20px; }
        .coa-list-item { padding: 12px 14px; border-radius: 8px; cursor: pointer; border: 1px solid transparent; transition: all .15s; }
        .coa-list-item:hover { background: #f9fafb; }
        .coa-list-item.active { background: #f0fdf4; border-color: #86efac; }
        @media (max-width: 900px) {
          .coa-grid { grid-template-columns: 1fr; }
          .coa-panel-hide { display: none; }
          .coa-panel-show { display: block; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111' }}>COA Management</h2>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>Certificates of Analysis — batch numbers, test dates, PDF links</p>
        </div>
        <button
          onClick={openNew}
          style={{ padding: '9px 18px', background: '#0F2A4A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
        >
          + Add COA
        </button>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
          {error}
        </div>
      )}

      <div className="coa-grid">
        {/* Left: List */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', height: 'fit-content' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6' }}>
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {loading ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
              {entries.length === 0 ? 'No COA entries yet. Add one →' : 'No matches'}
            </div>
          ) : (
            <div style={{ padding: 8 }}>
              {filtered.map(entry => (
                <div
                  key={entry.id}
                  className={`coa-list-item${selected?.id === entry.id ? ' active' : ''}`}
                  onClick={() => selectEntry(entry)}
                >
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>{entry.product_name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    {entry.batch_number && <span>Batch: {entry.batch_number}</span>}
                    {entry.test_date && <span style={{ marginLeft: 8 }}>• {new Date(entry.test_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                  </div>
                  {entry.pdf_url && (
                    <div style={{ marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: '#0F2A4A', fontWeight: 600 }}>📄 PDF linked</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div style={{ padding: '8px 14px', borderTop: '1px solid #f3f4f6', fontSize: 12, color: '#9ca3af' }}>
            {entries.length} entr{entries.length !== 1 ? 'ies' : 'y'}
          </div>
        </div>

        {/* Right: Edit panel */}
        {panelOpen ? (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111' }}>
                {showNew ? 'New COA Entry' : `Edit: ${selected?.product_name}`}
              </h3>
              {!showNew && (
                <button
                  onClick={handleDelete}
                  style={{ padding: '6px 12px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  Delete
                </button>
              )}
            </div>

            <Input
              label="Product Name *"
              value={form.product_name}
              onChange={v => setForm(f => ({ ...f, product_name: v }))}
              placeholder="e.g. CAGRILINTIDE"
            />
            <Input
              label="Batch Number"
              value={form.batch_number}
              onChange={v => setForm(f => ({ ...f, batch_number: v }))}
              placeholder="e.g. 0010825"
            />
            <Input
              label="Test Date"
              type="date"
              value={form.test_date}
              onChange={v => setForm(f => ({ ...f, test_date: v }))}
            />
            <Input
              label="PDF / Certificate URL"
              value={form.pdf_url}
              onChange={v => setForm(f => ({ ...f, pdf_url: v }))}
              placeholder="https://…"
            />

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 }}>
                Notes
              </label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Optional notes…"
                rows={3}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, color: '#111', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
            </div>

            {/* PDF preview */}
            {form.pdf_url && (
              <div style={{ marginBottom: 16, padding: 12, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>PDF Preview:</div>
                <a
                  href={form.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 13, color: '#0F2A4A', fontWeight: 600, textDecoration: 'none', wordBreak: 'break-all' }}
                >
                  📄 {form.pdf_url.split('/').pop() || form.pdf_url}
                </a>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={handleSave}
                disabled={saving || !form.product_name.trim()}
                style={{
                  padding: '10px 24px', background: saving ? '#9ca3af' : '#0F2A4A',
                  color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700,
                  cursor: saving ? 'default' : 'pointer',
                }}
              >
                {saving ? 'Saving…' : showNew ? 'Create Entry' : 'Save Changes'}
              </button>
              {saved && (
                <span style={{ fontSize: 13, color: '#166534', fontWeight: 600 }}>✓ Saved</span>
              )}
            </div>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
            <div style={{ textAlign: 'center', color: '#9ca3af' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
              <p style={{ margin: 0, fontSize: 14 }}>Select a COA entry to edit,<br />or click <strong>+ Add COA</strong></p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
