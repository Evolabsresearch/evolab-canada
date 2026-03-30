/**
 * Admin Inventory API
 * GET   /api/admin/inventory         — list all products with stock info
 * PATCH /api/admin/inventory         — adjust stock for a product
 */
import { getSupabaseAdmin } from '../../../lib/supabase';
import { isAdminAuthed } from './_auth';

export default async function handler(req, res) {
  if (!isAdminAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });
  const db = getSupabaseAdmin();

  // ── GET ─────────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { data, error } = await db
      .from('products')
      .select('id, name, slug, category, sku, stock, low_stock_threshold, cost_per_unit, out_of_stock, low_stock, sizes')
      .order('id');

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ inventory: data || [] });
  }

  // ── PATCH: adjust stock ─────────────────────────────────────────────────────
  if (req.method === 'PATCH') {
    const { id, stockDelta, newStock, costPerUnit, lowStockThreshold } = req.body;
    if (!id) return res.status(400).json({ error: 'id required' });

    const updates = { updated_at: new Date().toISOString() };

    if (newStock !== undefined) {
      updates.stock = Math.max(0, parseInt(newStock));
    } else if (stockDelta !== undefined) {
      // Fetch current stock first
      const { data: current } = await db.from('products').select('stock').eq('id', id).single();
      updates.stock = Math.max(0, (current?.stock || 0) + parseInt(stockDelta));
    }
    if (costPerUnit       !== undefined) updates.cost_per_unit        = parseFloat(costPerUnit) || 0;
    if (lowStockThreshold !== undefined) updates.low_stock_threshold  = parseInt(lowStockThreshold) || 10;

    // Auto-update out_of_stock and low_stock flags based on stock level
    if (updates.stock !== undefined) {
      const threshold = lowStockThreshold || 10;
      updates.out_of_stock = updates.stock === 0;
      updates.low_stock    = updates.stock > 0 && updates.stock <= threshold;
    }

    const { data, error } = await db
      .from('products')
      .update(updates)
      .eq('id', id)
      .select('id, name, slug, category, sku, stock, low_stock_threshold, cost_per_unit, out_of_stock, low_stock')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ item: data });
  }

  res.status(405).end();
}
