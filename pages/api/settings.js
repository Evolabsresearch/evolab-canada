/**
 * Public Site Settings API
 * GET /api/settings — returns announcement_bar, free_shipping_threshold, catalogMode
 */
import { getSupabaseAdmin } from '../../lib/supabase';
import { getCatalogMode, isProductsPublic, isCheckoutPublic } from '../../lib/catalogMode';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

  try {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from('site_settings')
      .select('key, value')
      .in('key', ['announcement_bar', 'free_shipping_threshold']);

    if (error) {
      const mode = await getCatalogMode();
      return res.status(200).json({ announcement_bar: { enabled: false }, free_shipping_threshold: 250, catalogMode: mode, productsPublic: isProductsPublic(mode), checkoutPublic: isCheckoutPublic(mode) });
    }

    const result = {};
    (data || []).forEach(row => {
      try { result[row.key] = JSON.parse(row.value); } catch { result[row.key] = row.value; }
    });

    const mode = await getCatalogMode();

    return res.status(200).json({
      announcement_bar: result.announcement_bar || { enabled: false },
      free_shipping_threshold: result.free_shipping_threshold || 250,
      catalogMode: mode,
      productsPublic: isProductsPublic(mode),
      checkoutPublic: isCheckoutPublic(mode),
    });
  } catch {
    return res.status(200).json({ announcement_bar: { enabled: false }, free_shipping_threshold: 250, catalogMode: 'gated', productsPublic: false, checkoutPublic: false });
  }
}
