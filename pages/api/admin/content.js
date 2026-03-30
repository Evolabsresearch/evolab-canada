/**
 * Site content overrides — stored in Supabase Storage (site-content bucket)
 * Each page gets a JSON file:  site-content/{encoded-path}.json
 *
 * GET  /api/admin/content?page=/coa   → { selectors:{}, colors:{} }
 * POST /api/admin/content             → body: { page, selectors, colors }  (admin only)
 * DELETE /api/admin/content?page=/coa → clears overrides for that page     (admin only)
 */
import { getSupabaseAdmin } from '../../../lib/supabase';
import { isAdminAuthed } from './_auth';

const BUCKET = 'site-content';

function pageToKey(page) {
  // Turn /products/bpc-157  →  products--bpc-157.json
  const safe = (page || '/').replace(/^\//, '').replace(/\//g, '--') || 'home';
  return `${safe}.json`;
}

async function getOverrides(supabase, page) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(pageToKey(page));

  if (error) return { selectors: {}, colors: {} }; // file not found = no overrides

  const text = await data.text();
  try { return JSON.parse(text); } catch { return { selectors: {}, colors: {} }; }
}

export default async function handler(req, res) {
  const supabase = getSupabaseAdmin();
  const page = req.method === 'GET' || req.method === 'DELETE'
    ? (req.query.page || '/')
    : (req.body?.page || '/');

  // ── GET — public ───────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const data = await getOverrides(supabase, page);
    return res.status(200).json(data);
  }

  // ── Write ops — admin only ─────────────────────────────────────────────────
  if (!isAdminAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'DELETE') {
    await supabase.storage.from(BUCKET).remove([pageToKey(page)]);
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'POST') {
    const { page: pg, selectors = {}, colors = {} } = req.body;
    if (!pg) return res.status(400).json({ error: 'page required' });

    const json = JSON.stringify({ selectors, colors, updatedAt: new Date().toISOString() });
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(pageToKey(pg), json, { contentType: 'application/json', upsert: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}
