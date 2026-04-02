/**
 * Admin Payment Processor Settings API
 * GET  /api/admin/payment-settings  — returns full processor settings (including disabled)
 * POST /api/admin/payment-settings  — toggle a processor { processor, enabled }
 */
import { getSupabaseAdmin } from '../../../lib/supabase';
import { isAdminAuthed } from './_auth';

const DEFAULT_PROCESSORS = {
  hummingbird: { enabled: true, label: 'Credit / Debit Card', description: 'Visa, Mastercard, Amex via Hummingbird', icon: 'card', order: 1 },
  stripe: { enabled: true, label: 'Credit / Debit & More', description: 'Cards, Apple Pay, Google Pay via Stripe', icon: 'card', order: 2 },
  linkmoney: { enabled: true, label: 'Bank Transfer', description: 'Pay directly from bank via LinkMoney', icon: 'bank', order: 3 },
};

async function getProcessors(db) {
  const { data, error } = await db
    .from('store_settings')
    .select('value')
    .eq('key', 'payment_processors')
    .maybeSingle();
  if (error || !data) return { ...DEFAULT_PROCESSORS };
  try {
    return JSON.parse(data.value);
  } catch {
    return { ...DEFAULT_PROCESSORS };
  }
}

export default async function handler(req, res) {
  if (!isAdminAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });
  const db = getSupabaseAdmin();

  if (req.method === 'GET') {
    const processors = await getProcessors(db);
    return res.status(200).json({ processors });
  }

  if (req.method === 'POST') {
    const { processor, enabled } = req.body;
    if (!processor || typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'processor and enabled (boolean) required' });
    }

    const processors = await getProcessors(db);
    if (!processors[processor]) {
      return res.status(400).json({ error: `Unknown processor: ${processor}` });
    }

    // Guard: prevent disabling last active processor
    if (!enabled) {
      const activeCount = Object.values(processors).filter(p => p.enabled).length;
      if (activeCount <= 1 && processors[processor].enabled) {
        return res.status(400).json({ error: 'Cannot disable the last active payment processor' });
      }
    }

    processors[processor].enabled = enabled;

    const { error } = await db
      .from('store_settings')
      .update({ value: JSON.stringify(processors), updated_at: new Date().toISOString() })
      .eq('key', 'payment_processors');

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ processors });
  }

  res.status(405).end();
}
