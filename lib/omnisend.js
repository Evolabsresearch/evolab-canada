/**
 * OmniSend API helper
 * Docs: https://api-docs.omnisend.com/reference/
 */

const OMNISEND_BASE = 'https://api.omnisend.com/v3';

async function omnisendFetch(path, options = {}) {
  const res = await fetch(`${OMNISEND_BASE}${path}`, {
    ...options,
    headers: {
      'X-API-KEY': process.env.OMNISEND_API_KEY,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || json.message || 'OmniSend error');
  return json;
}

/**
 * Subscribe / upsert a contact
 */
export async function upsertContact({ email, phone, firstName, lastName, tags = [], customProperties }) {
  const body = {
    identifiers: [
      { type: 'email', id: email, channels: { email: { status: 'subscribed', statusDate: new Date().toISOString() } } },
      ...(phone ? [{ type: 'phone', id: phone, channels: { sms: { status: 'subscribed', statusDate: new Date().toISOString() } } }] : []),
    ],
    firstName,
    lastName,
    tags,
  };
  if (customProperties) body.customProperties = customProperties;
  return omnisendFetch('/contacts', { method: 'POST', body: JSON.stringify(body) });
}

/**
 * Trigger a custom event (used for flows like post-purchase, abandoned cart)
 * eventName examples: "order_placed", "order_shipped", "abandoned_cart"
 */
export async function triggerEvent(email, eventName, fields = {}) {
  return omnisendFetch('/events', {
    method: 'POST',
    body: JSON.stringify({
      email,
      eventName,
      fields,
      eventTime: new Date().toISOString(),
    }),
  });
}

/**
 * Track order for OmniSend automation flows
 */
export async function trackOrder({ email, orderId, orderTotal, currency = 'USD', items = [], status = 'placed' }) {
  return omnisendFetch('/orders', {
    method: 'POST',
    body: JSON.stringify({
      orderID: String(orderId),
      email,
      orderSum: orderTotal,
      currency,
      orderStatus: status,          // placed | confirmed | shipped | delivered | cancelled
      paymentMethod: 'private_gateway',
      products: items.map(item => ({
        productID: String(item.id || item.slug),
        sku: item.slug,
        name: item.name,
        quantity: item.qty || 1,
        price: parseFloat((item.salePrice || item.price || '0').replace(/[^0-9.]/g, '')),
        imageUrl: item.image ? `https://evolabsresearch.ca${item.image}` : '',
      })),
    }),
  });
}

/**
 * Send a transactional SMS (requires OmniSend Pro)
 */
export async function sendSMS(phone, message) {
  return omnisendFetch('/transactional/sms', {
    method: 'POST',
    body: JSON.stringify({ recipient: phone, content: message }),
  });
}
