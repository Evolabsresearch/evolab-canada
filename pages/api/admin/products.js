/**
 * Admin Products API
 * GET  /api/admin/products                    — list all products from Supabase
 * PATCH /api/admin/products                   — update one product
 * POST /api/admin/products {action:'seed'}    — seed from lib/data.js
 * POST /api/admin/products {action:'sync-wc'} — sync all products from WooCommerce
 */
import { getSupabaseAdmin } from '../../../lib/supabase';
import { isAdminAuthed } from './_auth';
import { products as LIB_PRODUCTS, PRODUCT_VARIANTS } from '../../../lib/data';

function wcAuth() {
  return 'Basic ' + Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString('base64');
}
async function wcFetch(path) {
  const base = process.env.WC_STORE_URL || 'https://evolabsresearch.ca';
  return fetch(`${base}/wp-json/wc/v3${path}`, {
    headers: { Authorization: wcAuth(), 'Content-Type': 'application/json' },
  });
}

export default async function handler(req, res) {
  if (!isAdminAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });
  const db = getSupabaseAdmin();

  // ── GET: list all products ──────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { data, error } = await db
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    // If table is empty, seed from lib/data.js and return
    if (!data || data.length === 0) {
      const seeded = await seedProducts(db);
      if (seeded.error) return res.status(500).json({ error: seeded.error });
      const { data: fresh } = await db.from('products').select('*').order('id');
      return res.status(200).json({ products: fresh || [], seeded: true });
    }

    return res.status(200).json({ products: data });
  }

  // ── PATCH: update one product ───────────────────────────────────────────────
  if (req.method === 'PATCH') {
    const {
      id,
      name, slug, price, salePrice, category, description,
      imageUrl, gallery, sizes, coaLink, status, badge,
    } = req.body;

    if (!id) return res.status(400).json({ error: 'id required' });

    const updates = {
      updated_at: new Date().toISOString(),
    };
    if (name       !== undefined) updates.name        = name;
    if (slug       !== undefined) updates.slug        = slug;
    if (price      !== undefined) updates.price       = price;
    if (salePrice  !== undefined) updates.sale_price  = salePrice || null;
    if (category   !== undefined) updates.category    = category;
    if (description!== undefined) updates.description = description;
    if (imageUrl   !== undefined) updates.image       = imageUrl;
    if (gallery    !== undefined) updates.gallery     = gallery;
    if (sizes      !== undefined) updates.sizes       = sizes;
    if (coaLink    !== undefined) updates.coa_link    = coaLink || null;
    if (badge      !== undefined) updates.badge       = badge || null;
    if (status     !== undefined) {
      updates.out_of_stock = status === 'out_of_stock';
      updates.low_stock    = status === 'low_stock';
    }

    const { data, error } = await db
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ product: data });
  }

  // ── POST: seed from lib/data.js ─────────────────────────────────────────────
  if (req.method === 'POST' && req.body?.action === 'seed') {
    const result = await seedProducts(db);
    if (result.error) return res.status(500).json({ error: result.error });
    return res.status(200).json({ seeded: result.count, message: `Seeded ${result.count} products` });
  }

  // ── POST: sync all products from WooCommerce ─────────────────────────────────
  if (req.method === 'POST' && req.body?.action === 'sync-wc') {
    const result = await syncFromWooCommerce(db);
    if (result.error) return res.status(500).json({ error: result.error });
    return res.status(200).json(result);
  }

  res.status(405).end();
}

async function seedProducts(db) {
  try {
    const rows = LIB_PRODUCTS.map(p => {
      const variants = PRODUCT_VARIANTS[p.slug];
      const sizes = variants
        ? variants.map(v => ({
            mg: v.label.replace('mg', '').replace(' × ', 'x').trim(),
            price: parseFloat(v.price.replace('$', '')),
            salePrice: null,
            imageUrl: null,
            inStock: true,
          }))
        : [];

      return {
        id:                  p.id,
        name:                p.name,
        slug:                p.slug,
        price:               p.price,
        sale_price:          p.salePrice || null,
        category:            p.category,
        description:         p.description || null,
        image:               p.image || null,
        gallery:             p.gallery || [],
        sizes,
        coa_link:            p.coaLink || null,
        badge:               p.badge || null,
        shop_url:            p.shopUrl || null,
        out_of_stock:        !!p.outOfStock,
        low_stock:           !!p.lowStock,
        stock:               p.outOfStock ? 0 : 50,
        low_stock_threshold: 10,
        cost_per_unit:       0,
        sku:                 `EVO-${String(p.id).padStart(4, '0')}`,
        rating:              p.rating || 4.8,
        review_count:        p.reviewCount || 0,
      };
    });

    const { error, count } = await db
      .from('products')
      .upsert(rows, { onConflict: 'id', count: 'exact' });

    if (error) return { error: error.message };
    return { count: rows.length };
  } catch (err) {
    return { error: err.message };
  }
}

// ── Sync all WooCommerce products into Supabase ───────────────────────────────
async function syncFromWooCommerce(db) {
  try {
    // Fetch all WC products (paginated)
    let allProducts = [];
    let page = 1;
    while (true) {
      const r = await wcFetch(`/products?per_page=100&page=${page}&status=publish`);
      if (!r.ok) {
        const txt = await r.text();
        return { error: `WooCommerce error ${r.status}: ${txt.slice(0, 200)}` };
      }
      const batch = await r.json();
      if (!batch.length) break;
      allProducts = allProducts.concat(batch);
      const totalPages = parseInt(r.headers.get('X-WP-TotalPages') || '1', 10);
      if (page >= totalPages) break;
      page++;
    }

    // For variable products, fetch their variations in parallel (batched)
    const variableProducts = allProducts.filter(p => p.type === 'variable' && p.variations?.length > 0);
    const variationMap = {};
    await Promise.all(
      variableProducts.map(async (p) => {
        const vr = await wcFetch(`/products/${p.id}/variations?per_page=100`);
        if (vr.ok) variationMap[p.id] = await vr.json();
      })
    );

    // Fetch existing product sizes from Supabase to preserve manual edits on simple products
    const wcIds = allProducts.map(p => p.id);
    const { data: existingRows } = await db.from('products').select('id, sizes').in('id', wcIds);
    const existingSizesMap = {};
    for (const row of existingRows || []) existingSizesMap[row.id] = row.sizes;

    // Map WC products → Supabase rows
    const rows = allProducts.map(p => {
      const images = p.images || [];
      const mainImage = images[0]?.src || null;
      const gallery = images.slice(1).map(img => img.src).filter(Boolean);

      // Build sizes from variations (variable) or name/price (simple)
      let sizes = null; // null = don't overwrite in upsert
      if (p.type === 'variable' && variationMap[p.id]) {
        sizes = variationMap[p.id].map(v => {
          const doseAttr = v.attributes?.find(a =>
            a.name?.toLowerCase().includes('dose') ||
            a.name?.toLowerCase().includes('mg') ||
            a.name?.toLowerCase().includes('size') ||
            a.name?.toLowerCase().includes('vial')
          );
          const mg = doseAttr?.option || v.attributes?.[0]?.option || `${v.id}`;
          return {
            mg: mg.trim(),
            price: parseFloat(v.regular_price || v.price || 0),
            salePrice: v.sale_price ? parseFloat(v.sale_price) : null,
            imageUrl: v.image?.src || null,
            inStock: v.stock_status !== 'outofstock',
            wcVariationId: v.id,
          };
        }).filter(s => s.price > 0);
      } else if (p.type === 'simple') {
        // Extract dosage from product name (e.g. "DSIP(15mg)", "CJC-1295 5mg+Ipamorelin 5mg")
        const doseMatch = p.name?.match(/(\d+(?:\.\d+)?\s*(?:mg|mcg|IU|mL|ml|g)(?:\s*\+\s*\d+(?:\.\d+)?\s*(?:mg|mcg|IU|mL|ml|g))*)/i);
        if (doseMatch) {
          sizes = [{
            mg: doseMatch[0].trim(),
            price: parseFloat(p.regular_price || p.price || 0),
            salePrice: p.sale_price ? parseFloat(p.sale_price) : null,
            imageUrl: p.images?.[0]?.src || null,
            inStock: p.stock_status !== 'outofstock',
          }];
        } else {
          // No dosage in name — preserve existing manual sizes, or default to []
          sizes = existingSizesMap[p.id] ?? [];
        }
      }

      // Category: first category name
      const category = p.categories?.[0]?.name || 'Uncategorized';

      // Price display — use p.price (WC minimum price) to avoid HTML entity issues in price_html
      const priceDisplay = p.type === 'variable'
        ? (p.price ? `From $${p.price}` : '')
        : (p.price ? `$${p.price}` : '');

      const salePrice = p.type !== 'variable' && p.sale_price ? p.sale_price : null;

      const outOfStock = p.stock_status === 'outofstock';
      const lowStock = !outOfStock && p.stock_quantity !== null && p.stock_quantity <= 10;

      // COA link from meta
      const coaLink = p.meta_data?.find(m => m.key === '_coa_link' || m.key === 'coa_link' || m.key === '_coa_url')?.value || null;
      const badge = p.meta_data?.find(m => m.key === '_badge' || m.key === 'badge')?.value || null;

      return {
        id:                  p.id,
        name:                p.name,
        slug:                p.slug,
        price:               priceDisplay,
        sale_price:          salePrice,
        category,
        description:         p.short_description?.replace(/<[^>]+>/g, '').trim() || p.description?.replace(/<[^>]+>/g, '').slice(0, 400).trim() || null,
        image:               mainImage,
        gallery,
        sizes,
        coa_link:            coaLink,
        badge,
        shop_url:            `${process.env.WC_STORE_URL || 'https://evolabsresearch.ca'}/product/${p.slug}/`,
        out_of_stock:        outOfStock,
        low_stock:           lowStock,
        stock:               p.stock_quantity ?? (outOfStock ? 0 : 50),
        low_stock_threshold: 10,
        cost_per_unit:       0,
        sku:                 p.sku || `WC-${p.id}`,
        rating:              parseFloat(p.average_rating || '4.8'),
        review_count:        p.rating_count || 0,
      };
    });

    // Upsert by WC product ID — preserves manual edits (e.g. sizes set for simple products)
    const { error } = await db
      .from('products')
      .upsert(rows, { onConflict: 'id', ignoreDuplicates: false });

    if (error) return { error: error.message };
    return { synced: rows.length, message: `Synced ${rows.length} products from WooCommerce` };
  } catch (err) {
    return { error: err.message };
  }
}
