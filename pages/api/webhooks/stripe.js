/**
 * POST /api/webhooks/stripe
 * Stripe webhook handler for payment intent and charge events.
 * Configured via Cloudflare Worker proxy at evovera.store/api/webhooks/stripe
 * which forwards to this handler.
 *
 * Events handled:
 *  - payment_intent.succeeded: Order payment completed
 *  - payment_intent.payment_failed: Payment failed
 *  - charge.refunded: Refund issued
 */
import Stripe from 'stripe';
import { getSupabaseAdmin } from '../../../lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function verifyStripeSignature(rawBody, signature) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('STRIPE_WEBHOOK_SECRET not set — skipping verification in dev');
    return true;
  }

  try {
    const event = stripe.webhooks.constructEvent(rawBody, signature, secret);
    return event;
  } catch (err) {
    console.error('Stripe signature verification failed:', err.message);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  // Use raw body for signature verification
  let rawBody;
  if (typeof req.body === 'string') {
    rawBody = req.body;
  } else {
    rawBody = JSON.stringify(req.body);
  }

  const event = verifyStripeSignature(rawBody, sig);
  if (!event) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const supabase = getSupabaseAdmin();

  try {
    const eventType = event.type;
    const data = event.data.object;

    // ── Handle payment_intent.succeeded ────────────────────────────────────
    if (eventType === 'payment_intent.succeeded') {
      const paymentIntentId = data.id;
      const metadata = data.metadata || {};
      const orderId = metadata.order_id || metadata.orderId;

      if (orderId) {
        await supabase.from('orders').update({
          status: 'paid',
          stripe_payment_intent_id: paymentIntentId,
          updated_at: new Date().toISOString(),
        }).eq('id', orderId);

        console.log(`Order ${orderId} marked as paid via Stripe payment intent ${paymentIntentId}`);
      }
    }

    // ── Handle payment_intent.payment_failed ───────────────────────────────
    if (eventType === 'payment_intent.payment_failed') {
      const paymentIntentId = data.id;
      const metadata = data.metadata || {};
      const orderId = metadata.order_id || metadata.orderId;

      if (orderId) {
        await supabase.from('orders').update({
          status: 'payment_failed',
          stripe_payment_intent_id: paymentIntentId,
          updated_at: new Date().toISOString(),
        }).eq('id', orderId);

        console.log(`Order ${orderId} payment failed for Stripe payment intent ${paymentIntentId}`);
      }
    }

    // ── Handle charge.refunded ─────────────────────────────────────────────
    if (eventType === 'charge.refunded') {
      const chargeId = data.id;
      const paymentIntentId = data.payment_intent;
      const refunded = data.refunded;

      if (refunded && paymentIntentId) {
        // Find order by stripe_payment_intent_id
        const { data: order } = await supabase
          .from('orders')
          .select('id')
          .eq('stripe_payment_intent_id', paymentIntentId)
          .single()
          .catch(() => ({}));

        if (order?.id) {
          await supabase.from('orders').update({
            status: 'refunded',
            updated_at: new Date().toISOString(),
          }).eq('id', order.id);

          console.log(`Order ${order.id} refunded via Stripe charge ${chargeId}`);
        }
      }
    }

    // Acknowledge receipt to Stripe
    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Stripe webhook error:', err);
    // Return 200 to Stripe to avoid retry loops on processing errors
    res.status(200).json({ received: true, error: err.message });
  }
}

// Required for raw body access (needed for signature verification)
export const config = {
  api: { bodyParser: false },
};
