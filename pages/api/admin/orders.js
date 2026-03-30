/**
 * Admin Orders API
 * GET  /api/admin/orders?page=1&limit=50&status=&search=
 * PATCH /api/admin/orders — body: { id, status?, tracking_number?, carrier?, notes? }
 */
import { getSupabaseAdmin } from '../../../lib/supabase';
import { isAdminAuthed } from './_auth';

export default async function handler(req, res) {
  if (!isAdminAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });
  const supabase = getSupabaseAdmin();

  if (req.method === 'GET') {
    const { page = 1, limit = 50, status, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (status && status !== 'all') query = query.eq('status', status);
    if (search) query = query.ilike('customer_email', `%${search}%`);

    const { data, error, count } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ orders: data, total: count });
  }

  if (req.method === 'PATCH') {
    const { id, status, tracking_number, carrier, notes } = req.body;
    if (!id) return res.status(400).json({ error: 'id required' });

    const updates = { updated_at: new Date().toISOString() };
    if (status !== undefined) updates.status = status;
    if (tracking_number !== undefined) updates.tracking_number = tracking_number;
    if (carrier !== undefined) updates.carrier = carrier;
    if (notes !== undefined) updates.notes = notes;

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ order: data });
  }

  res.status(405).end();
}
