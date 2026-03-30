/**
 * Admin Customers API
 * GET /api/admin/customers?search=&page=1&limit=50
 * Aggregates customers from the orders table
 */
import { getSupabaseAdmin } from '../../../lib/supabase';
import { isAdminAuthed } from './_auth';

export default async function handler(req, res) {
  if (!isAdminAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });

  // PATCH: save customer note (stored in store_settings as customer_note:<email>)
  if (req.method === 'PATCH') {
    const { email, note } = req.body || {};
    if (!email) return res.status(400).json({ error: 'email required' });
    const supabase = getSupabaseAdmin();
    const key = `note:${email}`;
    await supabase.from('store_settings').upsert(
      { section: 'customer_notes', key, value: note || '', updated_at: new Date().toISOString() },
      { onConflict: 'section,key' }
    );
    return res.status(200).json({ ok: true });
  }

  if (req.method !== 'GET') return res.status(405).end();

  const supabase = getSupabaseAdmin();
  const { search, page = 1, limit = 50 } = req.query;

  try {
    let query = supabase
      .from('orders')
      .select('customer_email, total, status, created_at, shipping_address, line_items')
      .order('created_at', { ascending: false });

    if (search) query = query.ilike('customer_email', `%${search}%`);

    const { data: orders, error } = await query;
    if (error) throw error;

    // Group by email to build customer profiles
    const customerMap = {};
    orders.forEach(order => {
      const email = order.customer_email;
      if (!email) return;
      if (!customerMap[email]) {
        const addr = order.shipping_address || {};
        customerMap[email] = {
          email,
          name: [addr.first_name, addr.last_name].filter(Boolean).join(' ') || email.split('@')[0],
          orders: [],
          ltv: 0,
          firstOrder: order.created_at,
          lastOrder: order.created_at,
        };
      }
      const c = customerMap[email];
      c.orders.push({ status: order.status, total: order.total, date: order.created_at });
      c.ltv += parseFloat(order.total) || 0;
      if (new Date(order.created_at) < new Date(c.firstOrder)) c.firstOrder = order.created_at;
      if (new Date(order.created_at) > new Date(c.lastOrder)) c.lastOrder = order.created_at;
    });

    // Also pull registered users from NextAuth users table
    const { data: users } = await supabase.from('users').select('email, name, created_at');
    const userMap = {};
    (users || []).forEach(u => { userMap[u.email] = u; });

    const customers = Object.values(customerMap)
      .map(c => ({
        ...c,
        orderCount: c.orders.length,
        ltv: parseFloat(c.ltv.toFixed(2)),
        aov: c.orders.length ? parseFloat((c.ltv / c.orders.length).toFixed(2)) : 0,
        hasAccount: !!userMap[c.email],
        name: userMap[c.email]?.name || c.name,
      }))
      .sort((a, b) => b.ltv - a.ltv);

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginated = customers.slice(offset, offset + parseInt(limit));

    res.status(200).json({ customers: paginated, total: customers.length });
  } catch (err) {
    console.error('Admin customers error:', err);
    res.status(500).json({ error: err.message });
  }
}
