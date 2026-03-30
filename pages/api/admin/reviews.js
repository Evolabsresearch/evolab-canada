/**
 * GET  /api/admin/reviews  — list WooCommerce product reviews
 * PATCH /api/admin/reviews — update a review (approve/unapprove)
 * DELETE /api/admin/reviews — delete a review
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
    const { status = 'all', per_page = 50, page = 1 } = req.query;
    const params = new URLSearchParams({ per_page, page });
    if (status !== 'all') params.set('status', status);
    const r = await fetch(wcUrl(`/products/reviews?${params}`), { headers });
    if (!r.ok) return res.status(502).json({ error: 'WooCommerce error' });
    const reviews = await r.json();
    const total = parseInt(r.headers.get('X-WP-Total') || '0', 10);
    return res.status(200).json({ reviews, total });
  }

  if (req.method === 'PATCH') {
    const { id, status } = req.body || {};
    if (!id) return res.status(400).json({ error: 'ID required' });
    const r = await fetch(wcUrl(`/products/reviews/${id}`), {
      method: 'PUT', headers,
      body: JSON.stringify({ status }),
    });
    const review = await r.json();
    if (!r.ok) return res.status(502).json({ error: review.message || 'Update failed' });
    return res.status(200).json({ review });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'ID required' });
    const r = await fetch(wcUrl(`/products/reviews/${id}?force=true`), { method: 'DELETE', headers });
    if (!r.ok) return res.status(502).json({ error: 'Delete failed' });
    return res.status(200).json({ success: true });
  }

  res.status(405).end();
}
