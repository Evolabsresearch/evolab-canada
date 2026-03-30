/**
 * Admin Dashboard Stats API
 * GET /api/admin/stats — returns revenue, order counts, recent orders, top products
 */
import { getSupabaseAdmin } from '../../../lib/supabase';
import { isAdminAuthed } from './_auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  if (!isAdminAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });

  const supabase = getSupabaseAdmin();

  try {
    // All orders
    const { data: allOrders, error } = await supabase
      .from('orders')
      .select('id, status, total, customer_email, line_items, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayOrders = allOrders.filter(o => new Date(o.created_at) >= todayStart);
    const weekOrders = allOrders.filter(o => new Date(o.created_at) >= weekStart);
    const monthOrders = allOrders.filter(o => new Date(o.created_at) >= monthStart);

    const sum = arr => arr.reduce((s, o) => s + (parseFloat(o.total) || 0), 0);

    // Top products from line_items
    const productRevenue = {};
    allOrders.forEach(order => {
      const items = Array.isArray(order.line_items) ? order.line_items : [];
      items.forEach(item => {
        if (!item?.name) return;
        productRevenue[item.name] = (productRevenue[item.name] || 0) + parseFloat(item.total || 0);
      });
    });
    const topProducts = Object.entries(productRevenue)
      .map(([name, revenue]) => ({ name, revenue: Math.round(revenue) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);

    // Status breakdown
    const statusCounts = {};
    allOrders.forEach(o => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });

    // Unique customers
    const uniqueEmails = new Set(allOrders.map(o => o.customer_email).filter(Boolean));

    // Pending affiliates
    const { count: pendingAffiliates } = await supabase
      .from('partners')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Pending affiliate payouts
    const { data: pendingPayouts } = await supabase
      .from('affiliate_conversions')
      .select('commission')
      .eq('status', 'approved');
    const totalPendingPayout = (pendingPayouts || []).reduce((s, p) => s + (parseFloat(p.commission) || 0), 0);

    res.status(200).json({
      today: { revenue: sum(todayOrders), orders: todayOrders.length },
      week: { revenue: sum(weekOrders), orders: weekOrders.length },
      month: { revenue: sum(monthOrders), orders: monthOrders.length },
      aov: monthOrders.length ? Math.round(sum(monthOrders) / monthOrders.length) : 0,
      totalCustomers: uniqueEmails.size,
      statusCounts,
      topProducts,
      pendingAffiliates: pendingAffiliates || 0,
      pendingPayout: parseFloat(totalPendingPayout.toFixed(2)),
      recentOrders: allOrders.slice(0, 10),
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: err.message });
  }
}
