/**
 * POST /api/webhooks/aftership
 * Receives AfterShip webhook events.
 * Configure in AfterShip dashboard: Webhook URL → https://evolabsresearch.ca/api/webhooks/aftership
 */
import { getSupabaseAdmin } from '../../../lib/supabase';
import { triggerEvent } from '../../../lib/omnisend';

export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const event = req.body;
  const tracking = event?.msg;
  if (!tracking) return res.status(200).json({ ok: true }); // ack with no payload

  const trackingNumber = tracking.tracking_number;
  const tag            = tracking.tag; // e.g. 'InTransit', 'OutForDelivery', 'Delivered'

  const supabase = getSupabaseAdmin();

  // Find the order by tracking number
  const { data: order } = await supabase
    .from('orders')
    .select('id, order_number, customer_email, customer_name, line_items, created_at')
    .eq('tracking_number', trackingNumber)
    .single();

  const trackingUrl = `https://evolabsresearch.ca/track?number=${trackingNumber}`;

  switch (tag) {
    case 'OutForDelivery':
      if (order?.customer_email) {
        triggerEvent(order.customer_email, 'outForDelivery', {
          trackingNumber,
          trackingUrl,
          orderId: order.order_number,
        }).catch(() => {});
      }
      break;

    case 'Delivered':
      if (order) {
        await supabase
          .from('orders')
          .update({ status: 'delivered', updated_at: new Date().toISOString() })
          .eq('id', order.id);

        triggerEvent(order.customer_email, 'orderDelivered', {
          orderId:      order.order_number,
          trackingNumber,
          customerName: order.customer_name,
        }).catch(() => {});

        // Schedule review request (Omnisend handles the 7-day delay)
        const items = order.line_items || [];
        triggerEvent(order.customer_email, 'requestProductReview', {
          orderId: order.order_number,
          orderDate: order.created_at,
          deliveredDate: new Date().toISOString(),
          products: items.map(item => ({
            productId: item.product_id || item.id || '',
            productName: item.name || item.product_name || '',
            productImage: item.image || item.image_url || '',
            reviewUrl: `https://evolabsresearch.ca/account?review=${item.product_id || item.id || ''}`,
          })),
        }).catch(() => {});

        // Cross-sell — fire 3 days after delivery (Omnisend handles the delay)
        const purchasedSlugs = (order.line_items || []).map(i => i.slug || i.product_slug).filter(Boolean);
        if (purchasedSlugs.length > 0) {
          import('../../../lib/crossSell').then(({ getCrossSellProducts }) => {
            const recSlugs = getCrossSellProducts(purchasedSlugs);
            if (recSlugs.length > 0) {
              triggerEvent(order.customer_email, 'crossSellRecommendation', {
                orderId: order.order_number,
                recommendedSlugs: recSlugs,
                shopUrl: 'https://evolabsresearch.ca/products',
              }).catch(() => {});
            }
          }).catch(() => {});
        }
      }
      break;

    case 'Exception':
    case 'AttemptFail':
      if (order?.customer_email) {
        const lastCheckpoint = (tracking.checkpoints || []).slice(-1)[0];
        triggerEvent(order.customer_email, 'deliveryException', {
          trackingNumber,
          trackingUrl,
          message: lastCheckpoint?.message || 'Delivery exception — please check tracking.',
        }).catch(() => {});
      }
      break;

    default:
      // InTransit, InfoReceived, etc — no action needed
      break;
  }

  return res.status(200).json({ ok: true });
}
