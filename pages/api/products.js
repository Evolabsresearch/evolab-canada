/**
 * GET /api/products
 * Public endpoint — returns all active products from Supabase.
 * Falls back gracefully if Supabase is unavailable.
 */
import { getSupabaseAdmin } from '../../lib/supabase';
import { products as staticProducts } from '../../lib/data';

const staticBySlug = {};
staticProducts.forEach(p => { if (p.slug) staticBySlug[p.slug] = p; });

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from('products')
      .select('id,name,slug,price,sale_price,category,image,badge,out_of_stock,low_stock,rating,review_count')
      .order('id', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.length === 0) return res.status(200).json({ products: [] });

    const products = data.map(row => {
      const stat = staticBySlug[row.slug] || {};
      let price = row.price || stat.price || '';
      if (price && /^\d+(\.\d+)?$/.test(String(price))) price = `$${price}`;
      return {
        id:          row.id,
        name:        row.name || stat.name || '',
        slug:        row.slug || '',
        price,
        salePrice:   row.sale_price || stat.salePrice || null,
        category:    row.category || '',
        image:       row.image || stat.image || '',
        badge:       row.badge || stat.badge || null,
        outOfStock:  row.out_of_stock || false,
        lowStock:    row.low_stock || false,
        rating:      row.rating || stat.rating || 4.9,
        reviewCount: row.review_count || stat.reviewCount || 0,
      };
    });

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ products });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
