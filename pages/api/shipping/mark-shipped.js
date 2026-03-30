/**
 * POST /api/shipping/mark-shipped
 * Marks an order as shipped: updates Supabase, registers AfterShip tracking,
 * and fires Omnisend orderShipped event.
 * Body: { orderId, trackingNumber, carrier, labelUrl, shipmentCost }
 */
import { getSupabaseAdmin } from '../../../lib/supabase';
import { isAdminAuthed } from '../admin/_auth';
import { createTracking } from '../../../lib/aftership';
import { triggerEvent } from '../../../lib/omnisend';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!isAdminAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { orderId, trackingNumber, carrier, labelUrl, shipmentCost } = req.body;
  if (!orderId || !trackingNumber || !carrier) {
    return res.status(400).json({ error: 'orderId, trackingNumber and carrier required' });
  }

  const supabase = getSupabaseAdmin();

  // 1. Fetch order for customer details
  const { data: order, error: fetchErr } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (fetchErr || !order) return res.status(404).json({ error: 'Order not found' });

  // 2. Update order in Supabase
  const { error: updateErr } = await supabase
    .from('orders')
    .update({
      status:          'shipped',
      tracking_number: trackingNumber,
      carrier:         carrier,
      label_url:       labelUrl || null,
      shipment_cost:   shipmentCost ? parseFloat(shipmentCost) : null,
      shipped_at:      new Date().toISOString(),
      updated_at:      new Date().toISOString(),
    })
    .eq('id', orderId);

  if (updateErr) return res.status(500).json({ error: updateErr.message });

  const trackingUrl = `https://evolabsresearch.ca/track?number=${trackingNumber}`;
  const carrierSlug = carrier.toLowerCase().includes('ups') ? 'ups'
    : carrier.toLowerCase().includes('fedex') ? 'fedex'
    : 'usps';

  // 3. Register with AfterShip + fire Omnisend (fire-and-forget)
  Promise.allSettled([
    createTracking(trackingNumber, carrierSlug, `EVO Labs Order ${order.order_number}`),
    triggerEvent(order.customer_email, 'orderShipped', {
      orderId:           order.order_number,
      trackingNumber,
      carrier,
      trackingUrl,
      customerName:      order.customer_name,
    }),
  ]).catch(() => {});

  return res.status(200).json({ ok: true, trackingUrl });
}
