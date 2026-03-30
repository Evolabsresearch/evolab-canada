import { getSupabaseAdmin } from '../../../lib/supabase';
import { triggerEvent } from '../../../lib/omnisend';

export default async function handler(req, res) {
  // Protect with cron secret
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = getSupabaseAdmin();

  // Find customers exactly at the 45-day mark
  const { data: lapsed } = await supabase.rpc('get_lapsed_customers');

  if (!lapsed || lapsed.length === 0) return res.status(200).json({ triggered: 0 });

  let triggered = 0;
  for (const customer of lapsed) {
    await triggerEvent(customer.email, 'customerReactivation', {
      firstName: customer.first_name || '',
      daysSinceLastOrder: 45,
      lastOrderDate: customer.last_order,
      reactivationCode: 'COMEBACK15',
    });
    triggered++;
  }

  return res.status(200).json({ triggered });
}
