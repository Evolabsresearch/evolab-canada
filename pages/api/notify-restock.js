// POST /api/notify-restock
// Stores email + product slug for back-in-stock notifications in Supabase.
import { getSupabaseAdmin } from '../../lib/supabase';
import { triggerEvent } from '../../lib/omnisend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, slug, name } = req.body || {};
  if (!email || !slug) {
    return res.status(400).json({ error: 'email and slug required' });
  }

  const supabase = getSupabaseAdmin();

  // Upsert into restock_notifications (avoid duplicates)
  const { error } = await supabase
    .from('restock_notifications')
    .upsert(
      {
        product_id: slug,
        email: email.toLowerCase().trim(),
        notified: false,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'product_id,email', ignoreDuplicates: true }
    );

  if (error) {
    // Non-fatal — still fire Omnisend event
    console.error('restock_notifications insert error:', error.message);
  }

  // Trigger Omnisend back-in-stock request event
  triggerEvent(email.toLowerCase().trim(), 'backInStockRequest', {
    productId: slug,
    productName: name || slug,
    productUrl: `https://evolabsresearch.ca/products/${slug}`,
  }).catch(() => {});

  return res.status(200).json({ ok: true, message: "We'll email you when this is back!" });
}
