/**
 * Apple Pay Domain Verification
 * Stripe requires this file to be served at:
 *   /.well-known/apple-developer-merchantid-domain-association
 *
 * This route fetches the file from Stripe's API so you never have
 * to manually download or update it.
 *
 * next.config.ts rewrites /.well-known/... → this route.
 */
import Stripe from 'stripe';

export default async function handler(req, res) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Fetch Apple Pay domain association file directly from Stripe
    const response = await fetch(
      'https://stripe.com/files/apple-pay/apple-developer-merchantid-domain-association',
    );

    if (!response.ok) {
      throw new Error(`Stripe returned ${response.status}`);
    }

    const text = await response.text();

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // cache 24h
    res.status(200).send(text);
  } catch (err) {
    console.error('[Apple Pay domain-association]', err);
    res.status(500).send('Error fetching domain association file');
  }
}
