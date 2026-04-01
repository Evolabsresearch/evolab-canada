import { useState, useEffect, useCallback, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Link from 'next/link';

const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#fff', boxSizing: 'border-box', outline: 'none' };

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
      {children}
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, marginTop: 20, paddingBottom: 6, borderBottom: '1px solid #f3f4f6' }}>
      {title}
    </div>
  );
}

function authHeaders() {
  const pw = typeof window !== 'undefined' ? localStorage.getItem('evo_admin_pw') || '' : '';
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${pw}` };
}

function GalleryUploadButton({ onUpload }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try { onUpload(await uploadFile(file)); } catch {} finally { setUploading(false); e.target.value = ''; }
  };
  return (
    <>
      <button onClick={() => inputRef.current?.click()} disabled={uploading}
        style={{ padding: '8px 12px', background: uploading ? '#9ca3af' : '#374151', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: uploading ? 'default' : 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
        {uploading ? '…' : '↑ Upload'}
      </button>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: 'none' }} onChange={handleFile} />
    </>
  );
}

async function uploadFile(file) {
  const pw = typeof window !== 'undefined' ? localStorage.getItem('evo_admin_pw') || '' : '';
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${pw}` },
    body: fd,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data.url;
}

function ImageUploadField({ label, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const inputRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const url = await uploadFile(file);
      onChange(url);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="url" value={value} onChange={e => onChange(e.target.value)} placeholder="https://..." style={{ ...inputStyle, flex: 1 }} />
        <button onClick={() => inputRef.current?.click()} disabled={uploading}
          style={{ padding: '8px 12px', background: uploading ? '#9ca3af' : '#374151', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: uploading ? 'default' : 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {uploading ? 'Uploading…' : '↑ Upload'}
        </button>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: 'none' }} onChange={handleFile} />
      </div>
      {uploadError && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>{uploadError}</div>}
    </div>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [editForm, setEditForm] = useState({});
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products', { headers: authHeaders() });
      const data = await res.json();
      setProducts(data.products || []);
    } catch (e) {
      console.error('Failed to load products', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const parsePrice = (str) => parseFloat((str || '0').replace(/[^0-9.]/g, '')) || 0;
  const CATEGORIES = ['all', ...Array.from(new Set(products.map(p => p.category))).sort()];

  let filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.slug || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'all' || p.category === catFilter;
    return matchSearch && matchCat;
  });
  if (sortBy === 'name') filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  else if (sortBy === 'price-asc') filtered = [...filtered].sort((a, b) => parsePrice(a.sale_price || a.price) - parsePrice(b.sale_price || b.price));
  else if (sortBy === 'price-desc') filtered = [...filtered].sort((a, b) => parsePrice(b.sale_price || b.price) - parsePrice(a.sale_price || a.price));
  else if (sortBy === 'status') filtered = [...filtered].sort((a, b) => (a.out_of_stock ? 1 : 0) - (b.out_of_stock ? 1 : 0));

  const openProduct = (p) => {
    setSelectedProduct(p);
    setSaved(false);
    setSaveError('');
    setEditForm({
      name: p.name,
      price: p.price,
      salePrice: p.sale_price || '',
      category: p.category,
      description: p.description || '',
      status: p.out_of_stock ? 'out_of_stock' : p.low_stock ? 'low_stock' : 'active',
      coaLink: p.coa_link || '',
      slug: p.slug || '',
      badge: p.badge || '',
      imageUrl: p.image || '',
      gallery: p.gallery || [],
      newGalleryUrl: '',
      sizes: p.sizes || [],
      newSizeMg: '',
      newSizePrice: '',
      newSizeSalePrice: '',
      newSizeImageUrl: '',
    });
  };

  const addSize = () => {
    const mg = editForm.newSizeMg.trim();
    const price = editForm.newSizePrice.trim();
    if (!mg || !price) return;
    const updated = [...editForm.sizes, {
      mg,
      price: parseFloat(price),
      salePrice: editForm.newSizeSalePrice ? parseFloat(editForm.newSizeSalePrice) : null,
      imageUrl: editForm.newSizeImageUrl.trim() || null,
      inStock: true,
    }];
    setEditForm({ ...editForm, sizes: updated, newSizeMg: '', newSizePrice: '', newSizeSalePrice: '', newSizeImageUrl: '' });
  };

  const removeSize = (i) => setEditForm({ ...editForm, sizes: editForm.sizes.filter((_, idx) => idx !== i) });
  const toggleSizeStock = (i) => setEditForm({ ...editForm, sizes: editForm.sizes.map((s, idx) => idx === i ? { ...s, inStock: !s.inStock } : s) });
  const updateSizeMg = (i, val) => setEditForm({ ...editForm, sizes: editForm.sizes.map((s, idx) => idx === i ? { ...s, mg: val } : s) });
  const updateSizeImage = (i, url) => setEditForm({ ...editForm, sizes: editForm.sizes.map((s, idx) => idx === i ? { ...s, imageUrl: url } : s) });
  const updateSizePrice = (i, field, val) => setEditForm({ ...editForm, sizes: editForm.sizes.map((s, idx) => idx === i ? { ...s, [field]: val === '' ? null : parseFloat(val) } : s) });

  const addGalleryImage = () => {
    const url = editForm.newGalleryUrl.trim();
    if (!url) return;
    setEditForm({ ...editForm, gallery: [...editForm.gallery, url], newGalleryUrl: '' });
  };
  const removeGalleryImage = (i) => setEditForm({ ...editForm, gallery: editForm.gallery.filter((_, idx) => idx !== i) });

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({
          id:          selectedProduct.id,
          name:        editForm.name,
          slug:        editForm.slug,
          price:       editForm.price,
          salePrice:   editForm.salePrice || null,
          category:    editForm.category,
          description: editForm.description,
          imageUrl:    editForm.imageUrl,
          gallery:     editForm.gallery,
          sizes:       editForm.sizes,
          coaLink:     editForm.coaLink,
          status:      editForm.status,
          badge:       editForm.badge,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      // Update local product list
      setProducts(prev => prev.map(p => p.id === data.product.id ? data.product : p));
      setSelectedProduct(data.product);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSyncWC = async () => {
    setSyncing(true);
    setSyncResult('');
    try {
      const r = await fetch('/api/admin/products', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ action: 'sync-wc' }),
      });
      const data = await r.json();
      if (r.ok) {
        setSyncResult(`✓ ${data.message || `Synced ${data.synced} products`}`);
        fetchProducts();
      } else {
        setSyncResult(`✕ ${data.error}`);
      }
    } catch (e) {
      setSyncResult(`✕ Network error`);
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncResult(''), 6000);
    }
  };

  return (
    <AdminLayout title="Products">
      <div style={{ display: 'flex', gap: 24, height: 'calc(100vh - 128px)' }}>
        {/* Product List */}
        <div style={{ flex: 1, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 180, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }} />
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#fff', cursor: 'pointer' }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? `All Categories (${products.length})` : c}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#fff', cursor: 'pointer' }}>
              <option value="name">Sort: A-Z</option>
              <option value="price-asc">Price: Low-High</option>
              <option value="price-desc">Price: High-Low</option>
              <option value="status">Status</option>
            </select>
            <span style={{ fontSize: 12, color: '#6b7280' }}>{filtered.length} products</span>
            <button
              onClick={handleSyncWC}
              disabled={syncing}
              title="Pull all products from WooCommerce into the database"
              style={{ padding: '7px 14px', background: syncing ? '#9ca3af' : '#0F2A4A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: syncing ? 'default' : 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              {syncing ? 'Syncing…' : '↻ Sync WooCommerce'}
            </button>
            {syncResult && (
              <span style={{ fontSize: 12, color: syncResult.startsWith('✓') ? '#166534' : '#dc2626', fontWeight: 600 }}>
                {syncResult}
              </span>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>Loading products…</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#f9fafb', zIndex: 1 }}>
                  <tr>
                    {['Product', 'Category', 'Price', 'Sale Price', 'Sizes', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(product => {
                    const isSelected = selectedProduct?.id === product.id;
                    const isOOS = product.out_of_stock;
                    return (
                      <tr key={product.id}
                        style={{ borderTop: '1px solid #f3f4f6', cursor: 'pointer', background: isSelected ? '#f0fdf4' : 'transparent' }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f9fafb'; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img src={product.image} alt={product.name} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', background: '#f3f4f6', flexShrink: 0 }} onError={e => { e.target.style.opacity = 0.3; }} />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{product.name}</div>
                              <div style={{ fontSize: 11, color: '#9ca3af' }}>/products/{product.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280' }}>{product.category}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#111' }}>{product.price}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: product.sale_price ? '#dc2626' : '#9ca3af' }}>{product.sale_price || '—'}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280' }}>
                          {product.sizes?.length > 0 ? (
                            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                              {product.sizes.map((s, i) => (
                                <span key={i} style={{ background: s.inStock ? '#d1fae5' : '#fee2e2', color: s.inStock ? '#065f46' : '#991b1b', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 9999 }}>{s.mg}</span>
                              ))}
                            </div>
                          ) : '—'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: isOOS ? '#fee2e2' : '#d1fae5', color: isOOS ? '#991b1b' : '#065f46', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 9999 }}>
                            {isOOS ? 'Out of Stock' : 'Active'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => openProduct(product)} style={{ padding: '5px 12px', background: '#f3f4f6', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Edit</button>
                            <Link href={`/products/${product.slug}`} target="_blank" style={{ padding: '5px 12px', background: '#f3f4f6', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: 'none', color: '#374151' }}>View ↗</Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Edit Panel */}
        {selectedProduct && (
          <div style={{ width: 480, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111' }}>Edit Product</h2>
              <button onClick={() => setSelectedProduct(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#6b7280' }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

              {/* ── IMAGES ── */}
              <SectionHeader title="Images" />
              <div style={{ marginBottom: 8, borderRadius: 8, overflow: 'hidden', background: '#f9fafb', height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={editForm.imageUrl || selectedProduct.image} alt={selectedProduct.name}
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                  onError={e => { e.target.style.opacity = 0.2; }} />
              </div>
              <Field label="Primary Image">
                <ImageUploadField value={editForm.imageUrl} onChange={url => setEditForm({ ...editForm, imageUrl: url })} />
              </Field>

              <Field label="Additional Photos">
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="url" value={editForm.newGalleryUrl} onChange={e => setEditForm({ ...editForm, newGalleryUrl: e.target.value })}
                    placeholder="Paste image URL and click Add" style={{ ...inputStyle, flex: 1 }}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addGalleryImage(); } }} />
                  <button onClick={addGalleryImage} style={{ padding: '8px 14px', background: '#0F2A4A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>Add URL</button>
                  <GalleryUploadButton onUpload={url => setEditForm(f => ({ ...f, gallery: [...f.gallery, url] }))} />
                </div>
                {editForm.gallery?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                    {editForm.gallery.map((url, i) => (
                      <div key={i} style={{ position: 'relative', width: 64, height: 64 }}>
                        <img src={url} alt="" style={{ width: 64, height: 64, borderRadius: 6, objectFit: 'cover', border: '1px solid #e5e7eb' }} onError={e => { e.target.style.opacity = 0.3; }} />
                        <button onClick={() => removeGalleryImage(i)} style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, lineHeight: '18px', textAlign: 'center', padding: 0 }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </Field>

              {/* ── DETAILS ── */}
              <SectionHeader title="Product Details" />
              <Field label="Product Name">
                <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} style={inputStyle} />
              </Field>
              <Field label="URL Slug">
                <input type="text" value={editForm.slug} onChange={e => setEditForm({ ...editForm, slug: e.target.value })} style={inputStyle} />
              </Field>
              <Field label="Badge (e.g. Best Seller, New)">
                <input type="text" value={editForm.badge} onChange={e => setEditForm({ ...editForm, badge: e.target.value })} placeholder="Best Seller, New, Popular…" style={inputStyle} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Base Price ($)">
                  <input type="text" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} placeholder="e.g. $49.99 or From $29.99" style={inputStyle} />
                </Field>
                <Field label="Sale Price ($)">
                  <input type="number" step="0.01" value={editForm.salePrice} onChange={e => setEditForm({ ...editForm, salePrice: e.target.value })} placeholder="Leave blank if no sale" style={inputStyle} />
                </Field>
              </div>
              <Field label="Category">
                <select value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} style={inputStyle}>
                  {Array.from(new Set(products.map(p => p.category))).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} style={inputStyle}>
                  <option value="active">Active</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </Field>
              <Field label="Description">
                <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              </Field>
              <Field label="COA Link (URL)">
                <input type="url" value={editForm.coaLink} onChange={e => setEditForm({ ...editForm, coaLink: e.target.value })} placeholder="https://..." style={inputStyle} />
              </Field>

              {/* ── SIZES & PRICING ── */}
              <SectionHeader title="Sizes & Pricing (MG Variants)" />
              <p style={{ margin: '0 0 12px', fontSize: 12, color: '#6b7280' }}>
                Add each available mg amount with its own price. These appear as selectable size buttons on the product page. Changes save directly to the database.
              </p>

              {/* Existing sizes */}
              {editForm.sizes?.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  {editForm.sizes.map((s, i) => (
                    <div key={i} style={{ background: '#f9fafb', borderRadius: 8, padding: '8px 10px', marginBottom: 8, border: '1px solid #f0f0f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {s.imageUrl && (
                          <img src={s.imageUrl} alt="" style={{ width: 32, height: 32, borderRadius: 4, objectFit: 'cover', border: '1px solid #e5e7eb', flexShrink: 0 }} onError={e => { e.target.style.opacity = 0.3; }} />
                        )}
                        <input type="text" value={s.mg} onChange={e => updateSizeMg(i, e.target.value)}
                          style={{ width: 70, padding: '3px 6px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, fontWeight: 700, color: '#111' }} />
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          <span style={{ fontSize: 11, color: '#9ca3af' }}>$</span>
                          <input type="number" step="0.01" value={s.price || ''} onChange={e => updateSizePrice(i, 'price', e.target.value)}
                            style={{ width: 70, padding: '3px 6px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12 }} />
                          <span style={{ fontSize: 11, color: '#9ca3af' }}>sale $</span>
                          <input type="number" step="0.01" value={s.salePrice || ''} onChange={e => updateSizePrice(i, 'salePrice', e.target.value)}
                            placeholder="—" style={{ width: 70, padding: '3px 6px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12 }} />
                        </div>
                        <button onClick={() => toggleSizeStock(i)} style={{ marginLeft: 'auto', padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', background: s.inStock ? '#d1fae5' : '#fee2e2', color: s.inStock ? '#065f46' : '#991b1b' }}>
                          {s.inStock ? 'In Stock' : 'Out of Stock'}
                        </button>
                        <button onClick={() => removeSize(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 16, padding: 0 }}>✕</button>
                      </div>
                      <div style={{ marginTop: 6 }}>
                        <ImageUploadField value={s.imageUrl || ''} onChange={url => updateSizeImage(i, url)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new size */}
              <div style={{ background: '#f9fafb', borderRadius: 8, padding: '12px 14px', marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Add Size</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8, alignItems: 'end', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>mg Amount</div>
                    <input type="text" placeholder="e.g. 5" value={editForm.newSizeMg} onChange={e => setEditForm({ ...editForm, newSizeMg: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>Price ($)</div>
                    <input type="number" step="0.01" placeholder="29.99" value={editForm.newSizePrice} onChange={e => setEditForm({ ...editForm, newSizePrice: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>Sale Price ($)</div>
                    <input type="number" step="0.01" placeholder="optional" value={editForm.newSizeSalePrice} onChange={e => setEditForm({ ...editForm, newSizeSalePrice: e.target.value })} style={inputStyle} />
                  </div>
                  <button onClick={addSize} style={{ padding: '8px 14px', background: '#0F2A4A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ Add</button>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>Image for this size (optional)</div>
                  <ImageUploadField value={editForm.newSizeImageUrl} onChange={url => setEditForm({ ...editForm, newSizeImageUrl: url })} />
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 20px', borderTop: '1px solid #f3f4f6' }}>
              {saveError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '8px 12px', marginBottom: 10, fontSize: 12, color: '#dc2626' }}>
                  ✕ {saveError}
                </div>
              )}
              <button onClick={handleSave} disabled={saving} style={{
                width: '100%', padding: '10px', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
                background: saved ? '#065f46' : '#0F2A4A', color: '#fff', opacity: saving ? 0.7 : 1,
              }}>
                {saving ? 'Saving to database…' : saved ? '✓ Saved to Supabase' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
