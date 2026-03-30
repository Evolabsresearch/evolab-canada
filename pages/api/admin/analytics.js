/**
 * GET /api/admin/analytics?days=30
 * Aggregates real order data from Supabase for the analytics dashboard.
 * Returns time-series revenue/orders, top products, top customers, status breakdown.
 */
import { getSupabaseAdmin } from '../../../lib/supabase';
import { isAdminAuthed } from './_auth';
import { products as PRODUCTS } from '../../../lib/data';

// Map product name → category
const CATEGORY_MAP = {};
PRODUCTS.forEach(p => { CATEGORY_MAP[p.name.toLowerCase()] = p.category; });
function getCategory(name) {
  if (!name) return 'Other';
  const key = name.toLowerCase();
  for (const [pname, cat] of Object.entries(CATEGORY_MAP)) {
    if (key.includes(pname.split(' ')[0].toLowerCase())) return cat;
  }
  return 'Other';
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  if (!isAdminAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });

  const days = Math.min(parseInt(req.query.days || '30'), 90);
  const supabase = getSupabaseAdmin();

  try {
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Fetch orders within the period
    const { data: orders, error } = await supabase
      .from('orders')
      .select('customer_email, status, total, line_items, created_at, shipping_address')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Also fetch previous period for week-over-week comparison
    const prevSince = new Date(since);
    prevSince.setDate(prevSince.getDate() - 7);
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: prevOrders } = await supabase
      .from('orders')
      .select('customer_email, total, created_at')
      .gte('created_at', prevSince.toISOString())
      .lt('created_at', since.toISOString());

    if (!orders || orders.length === 0) {
      return res.status(200).json({ empty: true });
    }

    // ── Time-series chart data ──────────────────────────────────────────────
    const byDate = {};
    orders.forEach(o => {
      const date = o.created_at?.split('T')[0];
      if (!date) return;
      if (!byDate[date]) byDate[date] = { revenue: 0, orders: 0 };
      byDate[date].revenue += parseFloat(o.total || 0);
      byDate[date].orders += 1;
    });

    const labels = [], revenueArr = [], ordersArr = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      revenueArr.push(Math.round((byDate[key]?.revenue || 0) * 100) / 100);
      ordersArr.push(byDate[key]?.orders || 0);
    }

    // ── Top products ────────────────────────────────────────────────────────
    const productMap = {};
    orders.forEach(o => {
      (o.line_items || []).forEach(item => {
        if (!item?.name) return;
        if (!productMap[item.name]) productMap[item.name] = { revenue: 0, units: 0 };
        productMap[item.name].revenue += parseFloat(item.total || 0);
        productMap[item.name].units += parseInt(item.quantity || 1);
      });
    });
    const topProducts = Object.entries(productMap)
      .map(([name, v]) => ({ name, revenue: Math.round(v.revenue), units: v.units }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);

    // ── Category revenue ────────────────────────────────────────────────────
    const categoryRevenue = {};
    orders.forEach(o => {
      (o.line_items || []).forEach(item => {
        const cat = getCategory(item.name);
        categoryRevenue[cat] = (categoryRevenue[cat] || 0) + parseFloat(item.total || 0);
      });
    });
    Object.keys(categoryRevenue).forEach(k => {
      categoryRevenue[k] = Math.round(categoryRevenue[k]);
    });

    // ── Top customers by LTV ────────────────────────────────────────────────
    const customerMap = {};
    orders.forEach(o => {
      const email = o.customer_email;
      if (!email) return;
      if (!customerMap[email]) {
        const addr = o.shipping_address || {};
        customerMap[email] = {
          email,
          name: [addr.first_name, addr.last_name].filter(Boolean).join(' ') || email.split('@')[0],
          orders: 0, ltv: 0, lastOrder: null,
        };
      }
      customerMap[email].orders += 1;
      customerMap[email].ltv += parseFloat(o.total || 0);
      const d = o.created_at?.split('T')[0];
      if (!customerMap[email].lastOrder || d > customerMap[email].lastOrder) customerMap[email].lastOrder = d;
    });
    const topCustomers = Object.values(customerMap)
      .map(c => ({ ...c, ltv: parseFloat(c.ltv.toFixed(2)), avgOrder: parseFloat((c.ltv / c.orders).toFixed(2)), tags: c.orders >= 5 ? ['VIP'] : [] }))
      .sort((a, b) => b.ltv - a.ltv)
      .slice(0, 6);

    // ── Status breakdown ────────────────────────────────────────────────────
    const statusCounts = {};
    orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });

    // ── Week comparison ─────────────────────────────────────────────────────
    const thisWeekOrders = orders.filter(o => new Date(o.created_at) >= weekAgo);
    const lastWeekOrders = prevOrders || [];
    const sum = arr => arr.reduce((s, o) => s + parseFloat(o.total || 0), 0);

    // ── Summary ─────────────────────────────────────────────────────────────
    const totalRevenue = orders.reduce((s, o) => s + parseFloat(o.total || 0), 0);
    const totalOrders = orders.length;

    // Trending: compare last 7 days vs prior 7 days per product
    const recentProductMap = {}, priorProductMap = {};
    orders.filter(o => new Date(o.created_at) >= weekAgo).forEach(o => {
      (o.line_items || []).forEach(item => {
        if (!item?.name) return;
        if (!recentProductMap[item.name]) recentProductMap[item.name] = { revenue: 0, units: 0 };
        recentProductMap[item.name].revenue += parseFloat(item.total || 0);
        recentProductMap[item.name].units += parseInt(item.quantity || 1);
      });
    });
    (prevOrders || []).forEach(o => {
      (o.line_items || []).forEach(item => {
        if (!item?.name) return;
        if (!priorProductMap[item.name]) priorProductMap[item.name] = { revenue: 0, units: 0 };
        priorProductMap[item.name].revenue += parseFloat(item.total || 0);
      });
    });
    const trendingProducts = Object.entries(recentProductMap)
      .filter(([, v]) => v.revenue > 0)
      .map(([name, v]) => ({
        name,
        thisWeek: Math.round(v.revenue),
        lastWeek: Math.round(priorProductMap[name]?.revenue || 0),
        units: v.units,
      }))
      .sort((a, b) => b.thisWeek - a.thisWeek)
      .slice(0, 6);

    return res.status(200).json({
      empty: false,
      labels, revenue: revenueArr, orders: ordersArr,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalOrders,
      aov: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
      topProducts,
      categoryRevenue,
      topCustomers,
      statusCounts,
      trendingProducts,
      weekComparison: {
        thisWeek: { revenue: Math.round(sum(thisWeekOrders)), orders: thisWeekOrders.length },
        lastWeek: { revenue: Math.round(sum(lastWeekOrders)), orders: lastWeekOrders.length },
      },
    });
  } catch (err) {
    console.error('Analytics error:', err);
    return res.status(500).json({ error: err.message });
  }
}
