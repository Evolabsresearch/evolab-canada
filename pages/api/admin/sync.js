/**
 * POST /api/admin/sync
 * Pulls historical orders from WooCommerce REST API and upserts them into Supabase.
 * Query params:
 *   ?page=1&per_page=100   — pagination (WC max is 100 per page)
 *   ?status=any            — WC order status filter (default: any)
 *   ?after=2024-01-01      — only orders after this ISO date
 *
 * Returns: { imported, skipped, errors, hasMore }
 */
import { getSupabaseAdmin } from '../../../lib/supabase';
import { isAdminAuthed } from './_auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!isAdminAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });

  const wcStoreUrl = process.env.WC_STORE_URL;  // e.g. https://evolabsresearch.ca
  const wcUrl = wcStoreUrl ? `${wcStoreUrl}/wp-json/wc/v3` : null;
  const wcKey = process.env.WC_CONSUMER_KEY;
  const wcSecret = process.env.WC_CONSUMER_SECRET;

  if (!wcUrl || !wcKey || !wcSecret) {
    return res.status(503).json({
      error: 'WooCommerce credentials not configured.',
      hint: 'Set WC_STORE_URL, WC_CONSUMER_KEY, and WC_CONSUMER_SECRET in your environment variables.',
    });
  }

  const { page = 1, per_page = 100, status = 'any', after } = req.body || {};

  // Build WooCommerce request URL
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(per_page),
    status,
    orderby: 'date',
    order: 'desc',
  });
  if (after) params.set('after', after);

  const authHeader = 'Basic ' + Buffer.from(`${wcKey}:${wcSecret}`).toString('base64');

  let wcOrders;
  let totalPages = 1;
  try {
    const wcRes = await fetch(`${wcUrl}/orders?${params}`, {
      headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
    });
    if (!wcRes.ok) {
      const text = await wcRes.text();
      return res.status(502).json({ error: `WooCommerce API error ${wcRes.status}: ${text.slice(0, 200)}` });
    }
    totalPages = parseInt(wcRes.headers.get('X-WP-TotalPages') || '1', 10);
    wcOrders = await wcRes.json();
  } catch (err) {
    return res.status(502).json({ error: `Failed to reach WooCommerce: ${err.message}` });
  }

  const supabase = getSupabaseAdmin();
  let imported = 0;
  let skipped = 0;
  const errors = [];

  for (const order of wcOrders) {
    try {
      // Extract tracking from order meta (set by WooCommerce Shipment Tracking plugin)
      const tracking = order.meta_data?.find(m =>
        m.key === '_tracking_number' || m.key === 'tracking_number'
      )?.value || null;
      const carrier = order.meta_data?.find(m =>
        m.key === '_tracking_provider' || m.key === 'tracking_provider'
      )?.value || null;

      const { error } = await supabase.from('orders').upsert({
        wc_order_id: order.id,
        order_number: order.number,
        customer_email: order.billing?.email,
        status: order.status,
        total: parseFloat(order.total || 0),
        currency: order.currency,
        line_items: order.line_items || [],
        shipping_address: order.shipping || {},
        tracking_number: tracking,
        carrier,
        notes: order.customer_note || null,
        created_at: order.date_created,
        updated_at: order.date_modified || new Date().toISOString(),
      }, { onConflict: 'wc_order_id' });

      if (error) {
        errors.push({ id: order.id, error: error.message });
        skipped++;
      } else {
        imported++;
      }
    } catch (err) {
      errors.push({ id: order.id, error: err.message });
      skipped++;
    }
  }

  return res.status(200).json({
    imported,
    skipped,
    errors: errors.slice(0, 10), // cap error list
    hasMore: page < totalPages,
    totalPages,
    currentPage: page,
  });
}
