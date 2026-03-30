// POST /api/admin/restock-notify
// Called by admin when a product is restocked — notifies all subscribers
import { getSupabaseAdmin } from '../../../lib/supabase';
import { triggerEvent } from '../../../lib/omnisend';
import { isAdminAuthed } from './_auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!isAdminAuthed(req)) return res.status(401).end();

  const { productId, productName, productUrl, productImage } = req.body;
  if (!productId) return res.status(400).json({ error: 'productId required' });

  const supabase = getSupabaseAdmin();

  const { data: subs } = await supabase
    .from('restock_notifications')
    .select('email')
    .eq('product_id', productId)
    .eq('notified', false);

  for (const sub of (subs || [])) {
    await triggerEvent(sub.email, 'backInStock', {
      productId,
      productName,
      productUrl,
      productImage,
    }).catch(() => {});
  }

  await supabase
    .from('restock_notifications')
    .update({ notified: true, notified_at: new Date().toISOString() })
    .eq('product_id', productId)
    .eq('notified', false);

  return res.status(200).json({ notified: subs?.length || 0 });
}
