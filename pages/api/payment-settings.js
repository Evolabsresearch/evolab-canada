/**
 * Public Payment Settings API
 * GET /api/payment-settings — returns only enabled processors, sorted by order
 */
import { getSupabaseAdmin } from '../../lib/supabase';

const DEFAULT_ENABLED = [
  { key: 'stripe', label: 'Credit / Debit Card', description: 'Visa, Mastercard, Amex via Stripe', icon: 'card' },
];

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  res.setHeader('Cache-Control', 'no-store');

  try {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from('store_settings')
      .select('value')
      .eq('key', 'payment_processors')
      .maybeSingle();

    if (error || !data) return res.status(200).json({ processors: DEFAULT_ENABLED });

    const all = JSON.parse(data.value);
    const enabled = Object.entries(all)
      .filter(([, v]) => v.enabled)
      .sort(([, a], [, b]) => (a.order || 99) - (b.order || 99))
      .map(([key, v]) => ({ key, label: v.label, description: v.description, icon: v.icon }));

    return res.status(200).json({ processors: enabled.length > 0 ? enabled : DEFAULT_ENABLED });
  } catch {
    return res.status(200).json({ processors: DEFAULT_ENABLED });
  }
}
