/**
 * POST /api/webhooks/woocommerce
 * WooCommerce sends order events here (order.created, order.updated).
 * Handles:
 *  - Syncing order to Supabase for account portal
 *  - Crediting affiliate commission if __evo_aff cookie was present at checkout
 *  - Triggering OmniSend email/SMS flows
 *  - Creating AfterShip tracking when order ships
 */
import crypto from 'crypto';
import { getSupabaseAdmin } from '../../../lib/supabase';
import { upsertContact, trackOrder, triggerEvent } from '../../../lib/omnisend';
import { createTracking } from '../../../lib/aftership';
import { extractTrackingFromOrder } from '../../../lib/woocommerce';

// Verify WooCommerce HMAC-SHA256 webhook signature
function verifyWCSignature(rawBody, signature) {
  const secret = process.env.WC_WEBHOOK_SECRET;
  if (!secret) return true; // skip in dev
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('base64');
  return expected === signature;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Read raw body for signature verification
  const rawBody = JSON.stringify(req.body);
  const sig = req.headers['x-wc-webhook-signature'];
  if (!verifyWCSignature(rawBody, sig)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const topic = req.headers['x-wc-webhook-topic'];  // e.g. "order.created"
  const order = req.body;

  const supabase = getSupabaseAdmin();

  try {
    // ── 1. Sync order to Supabase ──────────────────────────────────────────
    const { trackingNumber, carrier } = extractTrackingFromOrder(order);
    await supabase.from('orders').upsert({
      wc_order_id: order.id,
      order_number: order.number,
      customer_email: order.billing?.email,
      status: order.status,
      total: parseFloat(order.total),
      currency: order.currency,
      line_items: order.line_items,
      shipping_address: order.shipping,
      tracking_number: trackingNumber,
      carrier,
      created_at: order.date_created,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'wc_order_id' });

    // ── 2. Affiliate attribution ───────────────────────────────────────────
    // WooCommerce stores the cookie value in order meta (set by your gateway plugin
    // or a custom snippet that reads __evo_aff from the cookie on checkout)
    const affCode = order.meta_data?.find(m => m.key === '_evo_affiliate_code')?.value;
    if (affCode) {
      const { data: partner } = await supabase
        .from('partners')
        .select('id, commission_rate')
        .eq('referral_code', affCode)
        .single();

      if (partner) {
        const commission = parseFloat(order.total) * partner.commission_rate;
        await supabase.from('affiliate_conversions').insert({
          partner_id: partner.id,
          wc_order_id: order.id,
          order_total: parseFloat(order.total),
          commission: parseFloat(commission.toFixed(2)),
          status: 'pending',          // becomes 'approved' after 30-day return window
          created_at: new Date().toISOString(),
        });
      }
    }

    // ── 3. OmniSend flows ──────────────────────────────────────────────────
    if (order.billing?.email) {
      await upsertContact({
        email: order.billing.email,
        phone: order.billing.phone,
        firstName: order.billing.first_name,
        lastName: order.billing.last_name,
        tags: ['customer'],
      }).catch(console.error);

      if (topic === 'order.created') {
        await trackOrder({
          email: order.billing.email,
          orderId: order.id,
          orderTotal: parseFloat(order.total),
          currency: order.currency,
          items: order.line_items,
          status: 'placed',
        }).catch(console.error);
      }

      if (topic === 'order.updated' && order.status === 'completed') {
        await triggerEvent(order.billing.email, 'order_delivered', {
          orderNumber: order.number,
          orderTotal: order.total,
        }).catch(console.error);
      }
    }

    // ── 4. AfterShip tracking — create when order ships ───────────────────
    if (topic === 'order.updated' && order.status === 'shipped' && trackingNumber) {
      await createTracking(
        trackingNumber,
        carrier,
        `Order #${order.number} — ${order.billing?.first_name} ${order.billing?.last_name}`
      ).catch(console.error);

      // Trigger OmniSend shipped event
      if (order.billing?.email) {
        await triggerEvent(order.billing.email, 'order_shipped', {
          orderNumber: order.number,
          trackingNumber,
          carrier,
        }).catch(console.error);
      }
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('WC webhook error:', err);
    res.status(500).json({ error: err.message });
  }
}

export const config = {
  api: { bodyParser: true },
};
