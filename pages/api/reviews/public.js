import { getSupabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
  const { productId } = req.query;
  if (!productId) return res.status(400).json({ error: 'productId required' });

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('reviews')
    .select('rating, review_text, created_at, verified, customer_name')
    .eq('product_slug', productId)
    .eq('approved', true)
    .order('created_at', { ascending: false });

  return res.status(200).json(data || []);
}
