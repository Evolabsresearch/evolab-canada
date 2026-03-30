/**
 * Admin Data Layer — JSON-based MVP data store
 * In production, replace with Supabase/PostgreSQL calls.
 */
import { products as PRODUCT_LIST } from './data';

// ── Mock Orders ──────────────────────────────────────────────────────────────
export const MOCK_ORDERS = [
  { id: 'EVO-10041', customer: 'James R.', email: 'jamesr@email.com', items: [{ name: 'BPC-157', qty: 2, price: 29.99 }, { name: 'Bac Water 10 mL', qty: 1, price: 12.99 }], subtotal: 72.97, total: 72.97, shipping: 0, status: 'delivered', paymentMethod: 'Zelle', date: '2026-03-10', trackingNumber: '9400111899223497377282', notes: '' },
  { id: 'EVO-10040', customer: 'Sarah M.', email: 'sarah.m@email.com', items: [{ name: 'GLP-3 (R)', qty: 1, price: 99.99 }], subtotal: 99.99, total: 99.99, shipping: 0, status: 'shipped', paymentMethod: 'Crypto', date: '2026-03-11', trackingNumber: '9400111899223497377283', notes: '' },
  { id: 'EVO-10039', customer: 'Mike T.', email: 'miket@email.com', items: [{ name: 'KLOW', qty: 1, price: 149.99 }, { name: 'HGH 191aa', qty: 1, price: 79.99 }], subtotal: 229.98, total: 229.98, shipping: 9.99, status: 'processing', paymentMethod: 'Gift Card', date: '2026-03-12', trackingNumber: '', notes: 'Customer requested weekend delivery' },
  { id: 'EVO-10038', customer: 'Lisa K.', email: 'lisak@email.com', items: [{ name: 'NAD+', qty: 2, price: 89.99 }], subtotal: 179.98, total: 179.98, shipping: 9.99, status: 'pending', paymentMethod: 'Zelle', date: '2026-03-12', trackingNumber: '', notes: '' },
  { id: 'EVO-10037', customer: 'Tom B.', email: 'tomb@email.com', items: [{ name: 'EVO Alpha Research Stack', qty: 1, price: 249.99 }], subtotal: 249.99, total: 249.99, shipping: 0, status: 'delivered', paymentMethod: 'Crypto', date: '2026-03-08', trackingNumber: '9400111899223497377284', notes: '' },
  { id: 'EVO-10036', customer: 'Anna P.', email: 'annap@email.com', items: [{ name: 'Semax', qty: 1, price: 49.99 }, { name: 'Selank', qty: 1, price: 49.99 }], subtotal: 99.98, total: 109.97, shipping: 9.99, status: 'shipped', paymentMethod: 'Gift Card', date: '2026-03-09', trackingNumber: '9400111899223497377285', notes: '' },
  { id: 'EVO-10035', customer: 'David C.', email: 'davidc@email.com', items: [{ name: 'GLP-1 (S)', qty: 5, price: 89.99 }], subtotal: 449.95, total: 449.95, shipping: 0, status: 'delivered', paymentMethod: 'Zelle', date: '2026-03-07', trackingNumber: '9400111899223497377286', notes: 'VIP customer' },
  { id: 'EVO-10034', customer: 'Rachel H.', email: 'rachelh@email.com', items: [{ name: 'BPC 157 + TB 500', qty: 1, price: 79.99 }, { name: 'GLOW', qty: 1, price: 129.99 }], subtotal: 209.98, total: 209.98, shipping: 9.99, status: 'processing', paymentMethod: 'Crypto', date: '2026-03-13', trackingNumber: '', notes: '' },
  { id: 'EVO-10033', customer: 'Carlos M.', email: 'carlosm@email.com', items: [{ name: 'Epithalon', qty: 2, price: 69.99 }], subtotal: 139.98, total: 149.97, shipping: 9.99, status: 'refunded', paymentMethod: 'Gift Card', date: '2026-03-05', trackingNumber: '9400111899223497377287', notes: 'Item damaged in transit — refunded' },
  { id: 'EVO-10032', customer: 'Jen W.', email: 'jenw@email.com', items: [{ name: 'Cerebrolysin', qty: 1, price: 119.99 }, { name: 'Pinealon', qty: 1, price: 69.99 }], subtotal: 189.98, total: 199.97, shipping: 9.99, status: 'pending', paymentMethod: 'Zelle', date: '2026-03-13', trackingNumber: '', notes: '' },
];

// ── Mock Customers ────────────────────────────────────────────────────────────
export const MOCK_CUSTOMERS = [
  { id: 'c001', name: 'James R.', email: 'jamesr@email.com', orders: 8, ltv: 634.92, avgOrder: 79.37, lastOrder: '2026-03-10', tags: ['VIP'], notes: 'Loyal customer, prefers Zelle' },
  { id: 'c002', name: 'David C.', email: 'davidc@email.com', orders: 12, ltv: 2189.40, avgOrder: 182.45, lastOrder: '2026-03-07', tags: ['VIP', 'wholesale'], notes: 'Bulk buyer — GLP-1 series' },
  { id: 'c003', name: 'Sarah M.', email: 'sarah.m@email.com', orders: 3, ltv: 349.97, avgOrder: 116.66, lastOrder: '2026-03-11', tags: [], notes: '' },
  { id: 'c004', name: 'Mike T.', email: 'miket@email.com', orders: 5, ltv: 987.45, avgOrder: 197.49, lastOrder: '2026-03-12', tags: ['VIP'], notes: '' },
  { id: 'c005', name: 'Lisa K.', email: 'lisak@email.com', orders: 2, ltv: 289.97, avgOrder: 144.99, lastOrder: '2026-03-12', tags: [], notes: '' },
  { id: 'c006', name: 'Tom B.', email: 'tomb@email.com', orders: 7, ltv: 1634.93, avgOrder: 233.56, lastOrder: '2026-03-08', tags: ['affiliate'], notes: 'Isaiah referral' },
  { id: 'c007', name: 'Anna P.', email: 'annap@email.com', orders: 4, ltv: 399.96, avgOrder: 99.99, lastOrder: '2026-03-09', tags: [], notes: '' },
  { id: 'c008', name: 'Rachel H.', email: 'rachelh@email.com', orders: 6, ltv: 1189.94, avgOrder: 198.32, lastOrder: '2026-03-13', tags: ['VIP'], notes: '' },
];

// ── Mock Affiliates ──────────────────────────────────────────────────────────
export const MOCK_AFFILIATES = [
  {
    id: 'aff001', name: 'Isaiah', email: 'isaiah@example.com', code: 'ISAIAH15',
    commissionRate: 15, role: 'standard', status: 'active',
    clicks: 1847, conversions: 89, totalSales: 8934.11, totalEarned: 1340.12,
    pendingPayout: 267.44, tier: 'Gold', joinDate: '2025-11-01', notes: 'Modified agreement — non-exclusive, no posting requirements',
    recruitedBy: null,
  },
  {
    id: 'aff002', name: 'Stephan', email: 'stephan@example.com', code: 'STEPHAN10',
    commissionRate: 10, role: 'recruiter', status: 'active',
    clicks: 934, conversions: 41, totalSales: 4109.59, totalEarned: 620.45,
    pendingPayout: 123.90, tier: 'Silver', joinDate: '2025-12-15', notes: 'Recruiter role — 5% override commission on recruited affiliates',
    recruitedBy: null,
    overrideRate: 5,
  },
  {
    id: 'aff003', name: 'Marcus D.', email: 'marcus@example.com', code: 'MARCUS10',
    commissionRate: 10, role: 'standard', status: 'active',
    clicks: 412, conversions: 18, totalSales: 1798.82, totalEarned: 179.88,
    pendingPayout: 89.94, tier: 'Standard', joinDate: '2026-01-20', notes: '',
    recruitedBy: 'aff002',
  },
  {
    id: 'aff004', name: 'Kayla V.', email: 'kayla@example.com', code: 'KAYLA10',
    commissionRate: 10, role: 'standard', status: 'pending',
    clicks: 0, conversions: 0, totalSales: 0, totalEarned: 0,
    pendingPayout: 0, tier: 'Standard', joinDate: '2026-03-10', notes: 'Application pending review',
    recruitedBy: null,
  },
];

// ── Mock Inventory ────────────────────────────────────────────────────────────
// Bundles are excluded — their availability is determined by component products
const BUNDLE_CATEGORIES = ['Research Kits'];
const isBundle = (p) => BUNDLE_CATEGORIES.includes(p.category) || /Vial Set/i.test(p.name);

export function getInventory() {
  return PRODUCT_LIST.filter(p => !isBundle(p)).map((p, i) => ({
    id: p.id || i + 1,
    name: p.name,
    slug: p.slug,
    category: p.category,
    sku: `EVO-${String(p.id || i + 1).padStart(4, '0')}`,
    stock: p.outOfStock ? 0 : Math.floor(Math.random() * 80) + 5,
    lowStockThreshold: 10,
    costPerUnit: parseFloat((parseFloat((p.salePrice || p.price || '').replace(/[^0-9.]/g, '') || 50) * 0.20).toFixed(2)),
    price: p.salePrice || p.price || '$0',
    variants: p.name.toLowerCase().includes('bpc') || p.name.toLowerCase().includes('glp') || p.name.toLowerCase().includes('hgh')
      ? ['5mg', '10mg', '20mg']
      : null,
  }));
}

// ── Analytics Data ───────────────────────────────────────────────────────────
export function getAnalyticsData() {
  const days = 30;
  const labels = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const revenue = labels.map(() => Math.floor(Math.random() * 2800) + 400);
  const orders = labels.map(() => Math.floor(Math.random() * 18) + 2);

  return {
    labels,
    revenue,
    orders,
    totalRevenue: revenue.reduce((a, b) => a + b, 0),
    totalOrders: orders.reduce((a, b) => a + b, 0),
    aov: Math.round(revenue.reduce((a, b) => a + b, 0) / orders.reduce((a, b) => a + b, 0)),
    topProducts: [
      { name: 'GLP-3 (R)', revenue: 12840, units: 128 },
      { name: 'KLOW', revenue: 9870, units: 66 },
      { name: 'BPC-157', revenue: 7450, units: 248 },
      { name: 'HGH 191aa', revenue: 6340, units: 79 },
      { name: 'EVO Alpha Research Stack', revenue: 5990, units: 24 },
      { name: 'GLP-1 (S)', revenue: 5620, units: 63 },
      { name: 'Epithalon', revenue: 4380, units: 63 },
      { name: 'NAD+', revenue: 3990, units: 44 },
    ],
    categoryRevenue: {
      'GLP-1 Research Peptides': 28420,
      'Healing & Regeneration': 19870,
      'Growth Hormone Peptides': 14560,
      'Mitochondrial Peptides': 8970,
      'Cognitive & Neuro': 7340,
      'Research Kits': 5990,
      'Metabolic Peptides': 3450,
      'Reconstitution Supplies': 1240,
    },
    paymentMethods: { 'Zelle': 42, 'Crypto': 31, 'Gift Card': 27 },
    newVsReturning: { new: 58, returning: 42 },
    funnel: [
      { stage: 'Site Visits', count: 14820, icon: '👁' },
      { stage: 'Product Views', count: 7940, icon: '🔍' },
      { stage: 'Add to Cart', count: 2318, icon: '🛒' },
      { stage: 'Checkout Started', count: 864, icon: '💳' },
      { stage: 'Orders Placed', count: 504, icon: '✅' },
    ],
    trendingProducts: [
      { name: 'GLP-3 (R)', thisWeek: 3240, lastWeek: 2610, units: 32 },
      { name: 'KLOW', thisWeek: 2490, lastWeek: 1870, units: 17 },
      { name: 'Semax', thisWeek: 1120, lastWeek: 620, units: 22 },
      { name: 'BPC-157', thisWeek: 1890, lastWeek: 2140, units: 63 },
      { name: 'NAD+', thisWeek: 980, lastWeek: 1140, units: 11 },
      { name: 'HGH 191aa', thisWeek: 1590, lastWeek: 1760, units: 20 },
    ],
    weekComparison: {
      thisWeek: { revenue: 12840, orders: 84 },
      lastWeek: { revenue: 10220, orders: 71 },
    },
  };
}

// ── Discount Codes ────────────────────────────────────────────────────────────
export const MOCK_DISCOUNTS = [
  { id: 'd001', code: 'WELCOME10', type: 'percent', value: 10, minOrder: 0, uses: 47, limit: null, active: true, startDate: '2026-01-01', endDate: null, description: 'New customer 10% off' },
  { id: 'd002', code: 'SAVE20', type: 'percent', value: 20, minOrder: 200, uses: 23, limit: 100, active: true, startDate: '2026-03-01', endDate: '2026-03-31', description: 'March promo — 20% off $200+' },
  { id: 'd003', code: 'FREESHIP', type: 'free_shipping', value: 0, minOrder: 100, uses: 89, limit: null, active: true, startDate: '2026-01-01', endDate: null, description: 'Free shipping over $100' },
  { id: 'd004', code: 'ISAIAH15', type: 'percent', value: 15, minOrder: 0, uses: 89, limit: null, active: true, startDate: '2025-11-01', endDate: null, description: 'Affiliate code — Isaiah' },
  { id: 'd005', code: 'STEPHAN10', type: 'percent', value: 10, minOrder: 0, uses: 41, limit: null, active: true, startDate: '2025-12-15', endDate: null, description: 'Affiliate code — Stephan' },
  { id: 'd006', code: 'BOGO', type: 'bogo', value: 0, minOrder: 0, uses: 12, limit: 50, active: false, startDate: '2026-02-01', endDate: '2026-02-28', description: 'Feb BOGO promo — ended' },
];
