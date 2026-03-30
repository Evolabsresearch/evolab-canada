/**
 * POST /api/shipping/buy-label
 * Buys a shipping label via Shippo.
 * Body: { rateId }
 */
import Shippo from 'shippo';
import { isAdminAuthed } from '../admin/_auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!isAdminAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { rateId } = req.body;
  if (!rateId) return res.status(400).json({ error: 'rateId required' });

  if (!process.env.SHIPPO_API_KEY) {
    return res.status(503).json({ error: 'MISSING ENV: SHIPPO_API_KEY — add to Vercel dashboard before shipping admin will work' });
  }

  try {
    const shippo = new Shippo(process.env.SHIPPO_API_KEY);

    const transaction = await shippo.transaction.create({
      rate:             rateId,
      label_file_type:  'PDF',
      async:            false,
    });

    if (transaction.status !== 'SUCCESS') {
      return res.status(500).json({
        error: transaction.messages?.[0]?.text || 'Label creation failed',
      });
    }

    return res.status(200).json({
      trackingNumber: transaction.tracking_number,
      labelUrl:       transaction.label_url,
      carrier:        transaction.rate.provider,
      service:        transaction.rate.servicelevel_name,
      cost:           transaction.rate.amount,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Shippo error' });
  }
}
