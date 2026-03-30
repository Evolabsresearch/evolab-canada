/**
 * WooCommerce REST API bridge
 * Connects to your private WooCommerce store at evolabsresearch.ca
 * Uses Consumer Key / Consumer Secret (generated in WooCommerce → Settings → Advanced → REST API)
 */

const WC_BASE = `${process.env.WC_STORE_URL}/wp-json/wc/v3`;

async function wcFetch(path, options = {}) {
  const credentials = Buffer.from(
    `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
  ).toString('base64');

  const res = await fetch(`${WC_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'WooCommerce API error');
  return json;
}

/**
 * Look up orders by customer email
 * Returns array of orders with line items, status, tracking meta
 */
export async function getOrdersByEmail(email) {
  return wcFetch(`/orders?search=${encodeURIComponent(email)}&per_page=50`);
}

/**
 * Get a single order by ID
 */
export async function getOrder(orderId) {
  return wcFetch(`/orders/${orderId}`);
}

/**
 * Get order tracking number (stored in order meta by your gateway plugin)
 * Common meta keys: _tracking_number, _shipment_tracking_number
 */
export function extractTrackingFromOrder(order) {
  const meta = order.meta_data || [];
  const trackingNumber =
    meta.find(m => m.key === '_tracking_number')?.value ||
    meta.find(m => m.key === '_shipment_tracking_number')?.value ||
    meta.find(m => m.key === 'tracking_number')?.value ||
    null;
  const carrier =
    meta.find(m => m.key === '_tracking_provider')?.value ||
    meta.find(m => m.key === '_shipment_carrier')?.value ||
    'usps';
  return { trackingNumber, carrier };
}

/**
 * Get all products from WooCommerce (for inventory sync if needed)
 */
export async function getProducts(page = 1, perPage = 100) {
  return wcFetch(`/products?page=${page}&per_page=${perPage}`);
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId, status) {
  return wcFetch(`/orders/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

/**
 * Add order note (used for affiliate credit logging)
 */
export async function addOrderNote(orderId, note) {
  return wcFetch(`/orders/${orderId}/notes`, {
    method: 'POST',
    body: JSON.stringify({ note, customer_note: false }),
  });
}
