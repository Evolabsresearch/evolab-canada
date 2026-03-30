/**
 * Admin Settings API
 * GET   /api/admin/settings          — get all settings (returns nested object)
 * POST  /api/admin/settings          — save all settings (body: { section, settings: {key:value} })
 */
import { getSupabaseAdmin } from '../../../lib/supabase';
import { isAdminAuthed } from './_auth';

const DEFAULT_SETTINGS = {
  store: {
    name: 'EVO Labs Research LLC',
    address: '100 King Street West, Suite 5600, Toronto, ON M5X 1C9',
    phone: '(647) 555-0199',
    email: 'support@evolabsresearch.ca',
    website: 'https://evolabsresearch.ca',
  },
  shipping: {
    freeShippingThreshold: '250',
    flatRate: '9.99',
    processingDays: '1-2',
    sameDayCutoff: '12:00',
    carrier: 'USPS Priority Mail',
  },
  payments: {
    interac: 'Interac e-Transfer to support@evolabsresearch.ca',
    crypto: 'BTC, ETH, USDC accepted — contact for wallet address',
    giftCard: 'Digital gift certificate processing enabled',
    stripe: 'NOT ENABLED — use alternatives above',
  },
  compliance: {
    ruoDisclaimer: 'For Research Use Only — Not for Human Consumption. These products are intended solely for laboratory research. Not intended for use in humans or animals. Must be 18+ to purchase.',
    age: 'true',
    termsRequired: 'true',
  },
  affiliates: {
    defaultCommission: '10',
    silverThreshold: '10',
    silverCommission: '12',
    goldThreshold: '25',
    goldCommission: '15',
    cookieDays: '30',
    holdDays: '14',
    minPayout: '50',
  },
  emails: {
    orderConfirmation: "Hi {name},\n\nThank you for your order #{orderId}! We'll process it within 1-2 business days.\n\nFor Research Use Only.\n\nEVO Labs Research",
    shippingNotification: 'Your order #{orderId} has shipped! Track it at: {trackingUrl}',
    refundConfirmation: 'Your refund of ${amount} for order #{orderId} has been processed.',
  },
};

export default async function handler(req, res) {
  if (!isAdminAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });
  const db = getSupabaseAdmin();

  // ── GET: all settings ────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { data, error } = await db.from('store_settings').select('*');
    if (error) return res.status(500).json({ error: error.message });

    // Build nested object from flat rows, falling back to defaults
    const result = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    (data || []).forEach(row => {
      if (result[row.section]) {
        result[row.section][row.key] = row.value;
      }
    });

    return res.status(200).json({ settings: result });
  }

  // ── POST: save a section ──────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { section, settings } = req.body;
    if (!section || !settings) return res.status(400).json({ error: 'section and settings required' });

    const rows = Object.entries(settings).map(([key, value]) => ({
      section,
      key,
      value: String(value),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await db
      .from('store_settings')
      .upsert(rows, { onConflict: 'section,key' });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}
