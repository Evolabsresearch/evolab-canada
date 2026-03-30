import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { getSupabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const supabase = getSupabaseAdmin();
  const userId = session.user.email;

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: error.message });
    }

    // If no profile yet, try to auto-fill from most recent WooCommerce order
    if (!data) {
      try {
        const { getOrdersByEmail } = await import('../../lib/woocommerce');
        const isPhoneUser = userId.endsWith('@phone.evolabsresearch.cam');
        // Phone users don't have WC orders by email — return empty profile
        if (isPhoneUser) return res.json({ profile: null });

        const orders = await getOrdersByEmail(userId);
        if (orders && orders.length > 0) {
          const b = orders[0].billing || {};
          const s = orders[0].shipping || {};
          return res.json({
            profile: {
              first_name: b.first_name || '',
              last_name: b.last_name || '',
              email: b.email || userId,
              phone: b.phone || '',
              billing_address_1: b.address_1 || '',
              billing_address_2: b.address_2 || '',
              billing_city: b.city || '',
              billing_state: b.state || '',
              billing_postcode: b.postcode || '',
              billing_country: b.country || 'US',
              shipping_first_name: s.first_name || b.first_name || '',
              shipping_last_name: s.last_name || b.last_name || '',
              shipping_address_1: s.address_1 || '',
              shipping_address_2: s.address_2 || '',
              shipping_city: s.city || '',
              shipping_state: s.state || '',
              shipping_postcode: s.postcode || '',
              shipping_country: s.country || 'US',
              _autofilled: true,
            },
          });
        }
      } catch (e) {
        // WC unavailable — just return null
      }
      return res.json({ profile: null });
    }

    return res.json({ profile: data });
  }

  if (req.method === 'POST') {
    const {
      first_name, last_name, email, phone,
      billing_address_1, billing_address_2, billing_city, billing_state, billing_postcode, billing_country,
      shipping_first_name, shipping_last_name, shipping_address_1, shipping_address_2, shipping_city, shipping_state, shipping_postcode, shipping_country,
      birthday_month, birthday_day,
    } = req.body;

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        first_name, last_name, email, phone,
        billing_address_1, billing_address_2, billing_city, billing_state, billing_postcode, billing_country,
        shipping_first_name, shipping_last_name, shipping_address_1, shipping_address_2, shipping_city, shipping_state, shipping_postcode, shipping_country,
        birthday_month: birthday_month || null,
        birthday_day: birthday_day || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ profile: data });
  }

  return res.status(405).end();
}
