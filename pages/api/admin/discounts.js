/**
 * Admin Discounts API
 * GET   /api/admin/discounts         — list all discount codes
 * POST  /api/admin/discounts         — create a new discount code
 * PATCH /api/admin/discounts         — update a discount code (toggle active, etc.)
 * DELETE /api/admin/discounts?id=x   — delete a discount code
 */
import { getSupabaseAdmin } from '../../../lib/supabase';
import { isAdminAuthed } from './_auth';

const SEED_DISCOUNTS = [
  { code: 'WELCOME10', type: 'percent', value: 10, min_order: 0, uses: 47, usage_limit: null, active: true, start_date: '2026-01-01', end_date: null, description: 'New customer 10% off' },
  { code: 'SAVE20',    type: 'percent', value: 20, min_order: 200, uses: 23, usage_limit: 100, active: true, start_date: '2026-03-01', end_date: '2026-03-31', description: 'March promo — 20% off $200+' },
  { code: 'FREESHIP',  type: 'free_shipping', value: 0, min_order: 100, uses: 89, usage_limit: null, active: true, start_date: '2026-01-01', end_date: null, description: 'Free shipping over $100' },
  { code: 'ISAIAH15',  type: 'percent', value: 15, min_order: 0, uses: 89, usage_limit: null, active: true, start_date: '2025-11-01', end_date: null, description: 'Affiliate code — Isaiah' },
  { code: 'STEPHAN10', type: 'percent', value: 10, min_order: 0, uses: 41, usage_limit: null, active: true, start_date: '2025-12-15', end_date: null, description: 'Affiliate code — Stephan' },
];

export default async function handler(req, res) {
  if (!isAdminAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });
  const db = getSupabaseAdmin();

  // ── GET ─────────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    let { data, error } = await db
      .from('discount_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    // Auto-seed if empty
    if (!data || data.length === 0) {
      const { error: seedErr } = await db.from('discount_codes').insert(SEED_DISCOUNTS);
      if (seedErr) return res.status(500).json({ error: seedErr.message });
      const { data: fresh } = await db.from('discount_codes').select('*').order('created_at', { ascending: false });
      return res.status(200).json({ discounts: fresh || [], seeded: true });
    }

    return res.status(200).json({ discounts: data });
  }

  // ── POST: create ────────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { code, type, value, minOrder, usageLimit, active, startDate, endDate, description } = req.body;
    if (!code || !type) return res.status(400).json({ error: 'code and type required' });

    const { data, error } = await db
      .from('discount_codes')
      .insert({
        code:        code.toUpperCase().trim(),
        type,
        value:       parseFloat(value) || 0,
        min_order:   parseFloat(minOrder) || 0,
        usage_limit: usageLimit ? parseInt(usageLimit) : null,
        active:      active !== false,
        start_date:  startDate || null,
        end_date:    endDate   || null,
        description: description || null,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ discount: data });
  }

  // ── PATCH: update ───────────────────────────────────────────────────────────
  if (req.method === 'PATCH') {
    const { id, active, code, type, value, minOrder, usageLimit, startDate, endDate, description } = req.body;
    if (!id) return res.status(400).json({ error: 'id required' });

    const updates = { updated_at: new Date().toISOString() };
    if (active      !== undefined) updates.active       = active;
    if (code        !== undefined) updates.code         = code.toUpperCase().trim();
    if (type        !== undefined) updates.type         = type;
    if (value       !== undefined) updates.value        = parseFloat(value) || 0;
    if (minOrder    !== undefined) updates.min_order    = parseFloat(minOrder) || 0;
    if (usageLimit  !== undefined) updates.usage_limit  = usageLimit ? parseInt(usageLimit) : null;
    if (startDate   !== undefined) updates.start_date   = startDate || null;
    if (endDate     !== undefined) updates.end_date     = endDate || null;
    if (description !== undefined) updates.description  = description || null;

    const { data, error } = await db
      .from('discount_codes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ discount: data });
  }

  // ── DELETE ──────────────────────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id required' });

    const { error } = await db.from('discount_codes').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}
