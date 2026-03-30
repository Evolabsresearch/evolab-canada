/**
 * One-time endpoint to register a domain with Stripe Apple Pay.
 * Call once after deployment:
 *   curl -X POST https://evolabsresearch.ca/api/admin/stripe-register-apple-pay \
 *     -H "Authorization: Bearer YOUR_ADMIN_SECRET"
 */
import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const auth = req.headers.authorization?.replace('Bearer ', '');
  if (auth !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const domain = req.body?.domain || 'evolabsresearch.ca';

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const result = await stripe.applePayDomains.create({ domain_name: domain });
    res.status(200).json({ success: true, id: result.id, domain: result.domain_name });
  } catch (err) {
    console.error('[Apple Pay register]', err);
    res.status(500).json({ error: err.message });
  }
}
