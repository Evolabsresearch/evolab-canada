import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

function authHeaders() {
  const pw = typeof window !== 'undefined' ? localStorage.getItem('evo_admin_pw') || '' : '';
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${pw}` };
}

const COLLECTION_COLORS = {
  'evo-stacks': '#1B4D3E',
  'growth-series': '#1e40af',
  'longevity-cellular': '#6d28d9',
  'metabolic-glp-research-peptides': '#b45309',
  'cognitive': '#0f766e',
  'peptide-essentials': '#be185d',
  'bac-water': '#4b5563',
  '5-10-vial-pack': '#065f46',
};

function getCategoryColor(slug) {
  return COLLECTION_COLORS[slug] || '#374151';
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);

  // Edit form
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // New form
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchCategories(); }, []);

  async function fetchCategories() {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/categories', { headers: authHeaders() });
      const data = await r.json();
      if (data.categories) setCategories(data.categories.filter(c => c.slug !== 'uncategorized'));
    } catch (e) { setError('Failed to load categories'); }
    setLoading(false);
  }

  function openCategory(cat) {
    setSelected(cat);
    setEditName(cat.name);
    setEditDesc(cat.description || '');
    setEditSlug(cat.slug);
    setShowNew(false);
    setSaved(false);
  }

  async function saveCategory() {
    setSaving(true);
    try {
      const r = await fetch('/api/admin/categories', {
        method: 'PATCH', headers: authHeaders(),
        body: JSON.stringify({ id: selected.id, name: editName, description: editDesc, slug: editSlug }),
      });
      const data = await r.json();
      if (data.category) {
        setCategories(prev => prev.map(c => c.id === data.category.id ? data.category : c));
        setSelected(data.category);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else { setError(data.error || 'Save failed'); }
    } catch (e) { setError('Save failed'); }
    setSaving(false);
  }

  async function createCategory() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const r = await fetch('/api/admin/categories', {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ name: newName.trim(), description: newDesc }),
      });
      const data = await r.json();
      if (data.category) {
        setCategories(prev => [...prev, data.category].sort((a, b) => a.name.localeCompare(b.name)));
        setNewName(''); setNewDesc(''); setShowNew(false);
        openCategory(data.category);
      } else { setError(data.error || 'Create failed'); }
    } catch (e) { setError('Create failed'); }
    setCreating(false);
  }

  const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 };

  return (
    <AdminLayout title="Categories">
      <div style={{ display: 'flex', gap: 24, height: 'calc(100vh - 112px)', minHeight: 400 }}>

        {/* Category List */}
        <div style={{ flex: selected ? '0 0 320px' : 1, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111' }}>Product Categories</h2>
            <button
              onClick={() => { setShowNew(true); setSelected(null); }}
              style={{ padding: '7px 14px', background: '#1B4D3E', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              + New
            </button>
          </div>

          {loading && <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>Loading from WooCommerce…</div>}
          {error && <div style={{ margin: 16, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#991b1b' }}>{error}</div>}

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {categories.map(cat => {
              const color = getCategoryColor(cat.slug);
              const isActive = selected?.id === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => openCategory(cat)}
                  style={{
                    padding: '14px 20px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer',
                    background: isActive ? '#f0fdf4' : 'transparent',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {cat.image?.src ? (
                      <img src={cat.image.src} alt={cat.name} style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{cat.name.charAt(0)}</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{cat.count} product{cat.count !== 1 ? 's' : ''} · /{cat.slug}</div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <span style={{ background: '#f3f4f6', color: '#374151', fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 9999 }}>{cat.count}</span>
                  </div>
                </div>
              );
            })}
            {!loading && categories.length === 0 && (
              <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>No categories found</div>
            )}
          </div>
        </div>

        {/* Edit Panel */}
        {(selected || showNew) && (
          <div style={{ flex: 1, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111' }}>
                {showNew ? 'New Category' : selected?.name}
              </h2>
              <button onClick={() => { setSelected(null); setShowNew(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9ca3af', padding: 4 }}>✕</button>
            </div>

            <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
              {showNew ? (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Category Name *</label>
                    <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Peptide Essentials" style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Description</label>
                    <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={3} placeholder="Optional description shown on category page" style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>
                  <div style={{ background: '#f9fafb', borderRadius: 8, padding: '12px 14px', marginBottom: 20, fontSize: 13, color: '#6b7280' }}>
                    The slug will be auto-generated from the name. You can edit it in WooCommerce after creation.
                  </div>
                  <button onClick={createCategory} disabled={creating || !newName.trim()} style={{
                    padding: '10px 24px', background: '#1B4D3E', color: '#fff', border: 'none',
                    borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: creating ? 'not-allowed' : 'pointer',
                    opacity: creating ? 0.7 : 1,
                  }}>
                    {creating ? 'Creating…' : 'Create Category'}
                  </button>
                </>
              ) : selected && (
                <>
                  {/* Category Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                    <div style={{ background: '#f9fafb', borderRadius: 10, padding: '14px 16px' }}>
                      <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Products</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: '#111' }}>{selected.count}</div>
                    </div>
                    <div style={{ background: '#f9fafb', borderRadius: 10, padding: '14px 16px' }}>
                      <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>WC ID</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: '#111' }}>#{selected.id}</div>
                    </div>
                  </div>

                  {/* Shop link */}
                  <a
                    href={`https://evolabsresearch.ca/product-category/${selected.slug}`}
                    target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, marginBottom: 24, textDecoration: 'none', fontSize: 13, color: '#065f46', fontWeight: 600 }}
                  >
                    ↗ View on store: /product-category/{selected.slug}
                  </a>

                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Category Name</label>
                    <input value={editName} onChange={e => setEditName(e.target.value)} style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Slug (URL)</label>
                    <input value={editSlug} onChange={e => setEditSlug(e.target.value)} style={inputStyle} />
                    <p style={{ margin: '4px 0 0', fontSize: 11, color: '#9ca3af' }}>evolabsresearch.ca/product-category/{editSlug}</p>
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <label style={labelStyle}>Description</label>
                    <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3} placeholder="Shown on category page" style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={saveCategory} disabled={saving} style={{
                      flex: 1, padding: '10px', background: saved ? '#065f46' : '#1B4D3E', color: '#fff',
                      border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700,
                      cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
                    }}>
                      {saving ? 'Saving…' : saved ? '✓ Saved to WooCommerce' : 'Save Changes'}
                    </button>
                    <a
                      href={`https://evolabsresearch.ca/wp-admin/edit-tags.php?action=edit&taxonomy=product_cat&tag_ID=${selected.id}`}
                      target="_blank" rel="noreferrer"
                      style={{ padding: '10px 14px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#374151', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                    >
                      WP Admin ↗
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
