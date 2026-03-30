// Cloudflare Worker — Stripe Webhook Proxy for EvoVera
// Deployed at: evovera.store/api/webhooks/stripe
// Forwards to the real webhook handler on Vercel

const FORWARD_URL = 'https://evolabsresearch.ca/api/webhooks/stripe';
// Custom domain used since it is completely opaque to Stripe

export default {
  async fetch(request, env, ctx) {
    // Only handle POST requests (Stripe webhooks are always POST)
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      // Read the raw body — must be forwarded exactly as-is for signature verification
      const body = await request.arrayBuffer();

      // Forward all headers, especially Stripe-Signature
      const headers = new Headers();
      headers.set('Content-Type', request.headers.get('Content-Type') || 'application/json');
      headers.set('Stripe-Signature', request.headers.get('Stripe-Signature') || '');

      // Forward the request to the real webhook handler
      const response = await fetch(FORWARD_URL, {
        method: 'POST',
        headers: headers,
        body: body,
      });

      // Return the real handler's response back to Stripe
      const responseBody = await response.text();
      return new Response(responseBody, {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      // Return 200 to Stripe even on error to prevent retry storms
      // Log the error for debugging
      console.error('Webhook proxy error:', error.message);
      return new Response(JSON.stringify({ received: true, proxy_error: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};
