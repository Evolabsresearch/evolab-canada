// POST /api/discount/validate — used by cart page
// Response format: { valid, pct, label, error, freeShipping }
// Reads from Supabase discount_codes table (same source as /api/validate-discount)

import { getSupabaseAdmin } from '../../../lib/supabase';
import { getNewsletterCode } from '../../../lib/newsletterCodes';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { code, subtotal = 0 } = req.body || {};
  if (!code) return res.status(400).json({ valid: false, error: 'Code required' });

  const upper = code.toUpperCase().trim();
  const today = new Date().toISOString().split('T')[0];

  // 1. Supabase discount_codes table
  try {
    const db = getSupabaseAdmin();
    const { data: row } = await db
      .from('discount_codes')
      .select('*')
      .eq('code', upper)
      .eq('active', true)
      .maybeSingle();

    if (row) {
      if (row.end_date && row.end_date < today) {
        return res.status(200).json({ valid: false, error: 'This code has expired.' });
      }
      if (row.usage_limit && row.uses >= row.usage_limit) {
        return res.status(200).json({ valid: false, error: 'This code has reached its usage limit.' });
      }
      if (row.min_order && subtotal < row.min_order) {
        return res.status(200).json({ valid: false, error: `Minimum order of $${row.min_order} required.` });
      }
      if (row.type === 'free_shipping') {
        return res.status(200).json({ valid: true, pct: 0, label: 'Free Shipping', freeShipping: true });
      }
      const isPercent = row.type === 'percent' || row.type === 'percent_free';
      const isFreeShip = row.type === 'free_shipping' || row.type === 'percent_free' || row.type === 'fixed_free';
      
      const pct = isPercent
        ? row.value / 100
        : row.value / Math.max(subtotal, 1);
        
      return res.status(200).json({
        valid: true,
        pct: Math.min(pct, 1),
        label: isPercent ? `${row.value}% off` : `$${row.value} off`,
        freeShipping: isFreeShip
      });
    }
  } catch (_) { /* fall through to newsletter codes */ }

  // 2. Newsletter codes
  if (getNewsletterCode(upper)) {
    return res.status(200).json({ valid: true, pct: 0.10, label: '10% off — newsletter code' });
  }

  return res.status(200).json({ valid: false, error: 'Invalid or expired discount code.' });
}
