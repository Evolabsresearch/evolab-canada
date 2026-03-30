/**
 * GET  /api/admin/categories  — list all WooCommerce product categories
 * POST /api/admin/categories  — create a new category
 * PATCH /api/admin/categories — update a category
 */
import { isAdminAuthed } from './_auth';

function wcAuth() {
  const key = process.env.WC_CONSUMER_KEY;
  const secret = process.env.WC_CONSUMER_SECRET;
  return 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64');
}

function wcUrl(path) {
  const base = process.env.WC_STORE_URL || 'https://evolabsresearch.ca';
  return `${base}/wp-json/wc/v3${path}`;
}

export default async function handler(req, res) {
  if (!isAdminAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });

  const headers = { Authorization: wcAuth(), 'Content-Type': 'application/json' };

  if (req.method === 'GET') {
    const r = await fetch(wcUrl('/products/categories?per_page=100&orderby=name&order=asc'), { headers });
    if (!r.ok) return res.status(502).json({ error: 'WooCommerce error' });
    const cats = await r.json();
    return res.status(200).json({ categories: cats });
  }

  if (req.method === 'POST') {
    const { name, description, slug, parent } = req.body || {};
    if (!name) return res.status(400).json({ error: 'Name required' });
    const r = await fetch(wcUrl('/products/categories'), {
      method: 'POST', headers,
      body: JSON.stringify({ name, description, slug, parent: parent || 0 }),
    });
    const cat = await r.json();
    if (!r.ok) return res.status(502).json({ error: cat.message || 'Create failed' });
    return res.status(200).json({ category: cat });
  }

  if (req.method === 'PATCH') {
    const { id, name, description, slug } = req.body || {};
    if (!id) return res.status(400).json({ error: 'ID required' });
    const r = await fetch(wcUrl(`/products/categories/${id}`), {
      method: 'PUT', headers,
      body: JSON.stringify({ name, description, slug }),
    });
    const cat = await r.json();
    if (!r.ok) return res.status(502).json({ error: cat.message || 'Update failed' });
    return res.status(200).json({ category: cat });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'ID required' });
    const r = await fetch(wcUrl(`/products/categories/${id}?force=true`), { method: 'DELETE', headers });
    if (!r.ok) return res.status(502).json({ error: 'Delete failed' });
    return res.status(200).json({ success: true });
  }

  res.status(405).end();
}
