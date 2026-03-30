/**
 * GET    /api/admin/coa  — list all COA entries
 * POST   /api/admin/coa  — create a new COA entry
 * PATCH  /api/admin/coa  — update a COA entry
 * DELETE /api/admin/coa  — delete a COA entry
 */
import { isAdminAuthed } from './_auth';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export default async function handler(req, res) {
  if (!isAdminAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });

  const supabase = getSupabase();

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('coa_entries')
      .select('*')
      .order('product_name', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ entries: data });
  }

  if (req.method === 'POST') {
    const { product_name, batch_number, test_date, pdf_url, notes } = req.body || {};
    if (!product_name) return res.status(400).json({ error: 'product_name required' });
    const { data, error } = await supabase
      .from('coa_entries')
      .insert({ product_name, batch_number, test_date: test_date || null, pdf_url, notes })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ entry: data });
  }

  if (req.method === 'PATCH') {
    const { id, product_name, batch_number, test_date, pdf_url, notes } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id required' });
    const { data, error } = await supabase
      .from('coa_entries')
      .update({ product_name, batch_number, test_date: test_date || null, pdf_url, notes, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ entry: data });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id required' });
    const { error } = await supabase.from('coa_entries').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  res.status(405).end();
}
