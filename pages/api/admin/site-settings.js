/**
 * Admin Site Settings API
 * GET  /api/admin/site-settings  — returns all site_settings rows
 * POST /api/admin/site-settings  — upsert a key { key, value }
 */
import { getSupabaseAdmin } from '../../../lib/supabase';
import { isAdminAuthed } from './_auth';

export default async function handler(req, res) {
  if (!isAdminAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });
  const db = getSupabaseAdmin();

  if (req.method === 'GET') {
    const { data, error } = await db.from('site_settings').select('key, value');
    if (error) return res.status(500).json({ error: error.message });
    const settings = {};
    (data || []).forEach(row => {
      try { settings[row.key] = JSON.parse(row.value); } catch { settings[row.key] = row.value; }
    });
    return res.status(200).json({ settings });
  }

  if (req.method === 'POST') {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ error: 'key is required' });

    // Validate catalog_mode values
    if (key === 'catalog_mode') {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      const validModes = ['gated', 'open_catalog', 'full_open'];
      if (!parsed?.mode || !validModes.includes(parsed.mode)) {
        return res.status(400).json({ error: `Invalid mode. Must be one of: ${validModes.join(', ')}` });
      }
    }

    const strValue = typeof value === 'string' ? value : JSON.stringify(value);
    const { error } = await db
      .from('site_settings')
      .upsert({ key, value: strValue, updated_at: new Date().toISOString() }, { onConflict: 'key' });

    if (error) return res.status(500).json({ error: error.message });

    if (key === 'catalog_mode') {
      const parsed = typeof strValue === 'string' ? JSON.parse(strValue) : strValue;
      return res.status(200).json({ ok: true, success: true, mode: parsed.mode });
    }
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}
