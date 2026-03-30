/**
 * POST /api/shipping/rates
 * Fetches Shippo shipping rates for an order.
 * Body: { orderId, weight?, length?, width?, height? }
 */
import Shippo from 'shippo';
import { getSupabaseAdmin } from '../../../lib/supabase';
import { isAdminAuthed } from '../admin/_auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!isAdminAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });

  const {
    orderId,
    weight = 0.5,   // lbs
    length = 6,     // inches
    width  = 4,
    height = 2,
  } = req.body;

  if (!orderId) return res.status(400).json({ error: 'orderId required' });

  if (!process.env.SHIPPO_API_KEY) {
    return res.status(503).json({ error: 'MISSING ENV: SHIPPO_API_KEY — add to Vercel dashboard before shipping admin will work' });
  }

  const supabase = getSupabaseAdmin();
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderErr || !order) return res.status(404).json({ error: 'Order not found' });

  const addr = order.shipping_address || {};

  const toAddress = {
    name:    order.customer_name  || `${addr.first_name || ''} ${addr.last_name || ''}`.trim(),
    street1: order.shipping_street || addr.address_1 || addr.street1 || '',
    city:    order.shipping_city   || addr.city || '',
    state:   order.shipping_state  || addr.state || '',
    zip:     order.shipping_zip    || addr.postcode || addr.zip || '',
    country: 'US',
    phone:   order.customer_phone  || addr.phone || '',
  };

  const fromAddress = {
    name:    process.env.SHIP_FROM_NAME    || 'EVO Labs Research',
    company: process.env.SHIP_FROM_COMPANY || 'EVO Labs Research LLC',
    street1: process.env.SHIP_FROM_STREET  || '100 King Street West, Suite 5600',
    city:    process.env.SHIP_FROM_CITY    || 'Toronto',
    state:   process.env.SHIP_FROM_STATE   || 'ON',
    zip:     process.env.SHIP_FROM_ZIP     || 'M5X 1C9',
    country: 'CA',
    phone:   process.env.SHIP_FROM_PHONE   || '6475550199',
  };

  try {
    const shippo = new Shippo(process.env.SHIPPO_API_KEY);

    const shipment = await shippo.shipment.create({
      address_from: fromAddress,
      address_to:   toAddress,
      parcels: [{
        length:        String(length),
        width:         String(width),
        height:        String(height),
        distance_unit: 'in',
        weight:        String(weight),
        mass_unit:     'lb',
      }],
      async: false,
    });

    const rates = (shipment.rates || [])
      .map(r => ({
        rateId:   r.object_id,
        provider: r.provider,
        service:  r.servicelevel.name,
        days:     r.estimated_days,
        amount:   r.amount,
        currency: r.currency,
        isUPS:    r.provider === 'UPS',
      }))
      .sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));

    return res.status(200).json({ rates });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Shippo error' });
  }
}
