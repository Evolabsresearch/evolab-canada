/**
 * GET /api/orders
 * Returns orders for the logged-in user from Supabase orders table.
 * Queries by BOTH email AND user_id, then deduplicates.
 */
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { getSupabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  const email = session.user.email?.toLowerCase().trim();
  if (!email) return res.status(200).json({ orders: [] });

  try {
    const supabase = getSupabaseAdmin();

    // Find user_id from auth.users
    let userId = null;
    try {
      const { data: authData } = await supabase.auth.admin.listUsers();
      const authUser = authData?.users?.find(
        u => u.email?.toLowerCase() === email
      );
      if (authUser) userId = authUser.id;
    } catch {}

    // Query by email
    const queries = [
      supabase
        .from('orders')
        .select('*')
        .eq('customer_email', email)
        .order('created_at', { ascending: false })
        .limit(50),
    ];

    // Also query by user_id if found
    if (userId) {
      queries.push(
        supabase
          .from('orders')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50)
      );
    }

    const results = await Promise.all(queries);
    const allOrders = results.flatMap(r => r.data || []);

    // Deduplicate by order id
    const seen = new Set();
    const uniqueOrders = allOrders
      .filter(o => {
        if (seen.has(o.id)) return false;
        seen.add(o.id);
        return true;
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const orders = uniqueOrders.map(order => {
      const lineItems = Array.isArray(order.line_items) ? order.line_items : [];
      const addr = order.shipping_address || {};

      let tracking = null;
      if (order.tracking_number) {
        tracking = {
          trackingNumber: order.tracking_number,
          carrier: order.carrier || 'usps',
          status: order.tracking_status || 'pending',
        };
      }

      return {
        id: order.id,
        number: order.order_number || order.id,
        status: order.status || 'processing',
        dateCreated: order.created_at,
        total: parseFloat(order.total || 0).toFixed(2),
        currency: 'USD',
        lineItems: lineItems.map((item, i) => ({
          id: item.id || i,
          name: item.name,
          quantity: item.quantity,
          total: item.total,
          image: item.image || null,
        })),
        shippingAddress: addr,
        billing: {
          email,
          name: order.customer_name || `${addr.first_name || ''} ${addr.last_name || ''}`.trim(),
        },
        tracking,
      };
    });

    res.status(200).json({ orders });
  } catch (err) {
    console.error('Orders API error:', err);
    res.status(500).json({ error: err.message });
  }
}
