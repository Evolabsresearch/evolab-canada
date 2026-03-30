import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getSupabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  const { productId, rating, reviewText } = req.body;
  if (!productId || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const supabase = getSupabaseAdmin();

  // Insert review — reviews table uses product_slug, so use productId as slug
  const { error } = await supabase.from('reviews').insert({
    customer_name: session.user.name || session.user.email || 'Verified Customer',
    product_slug: String(productId),
    rating: parseInt(rating),
    review_text: reviewText || '',
    verified: true,
    approved: false, // requires admin approval
    created_at: new Date().toISOString(),
  });

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ ok: true });
}
