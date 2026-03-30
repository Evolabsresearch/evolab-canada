import { randomUUID } from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { firstName, lastName, email, amount } = req.body;
  if (!email || !amount) return res.status(400).json({ error: 'email and amount required' });

  const clientId = process.env.LINKMONEY_CLIENT_ID;
  const clientSecret = process.env.LINKMONEY_CLIENT_SECRET;
  const apiBase = process.env.LINKMONEY_API_BASE_URL || 'https://api.link.money';
  const redirectUrl = process.env.LINKMONEY_REDIRECT_URL || `${process.env.NEXTAUTH_URL}/checkout`;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Link Money credentials not configured' });
  }

  try {
    // Step 1: Get Bearer token from /v1/tokens using client credentials
    const tokenParams = new URLSearchParams();
    tokenParams.append('client_id', clientId);
    tokenParams.append('client_secret', clientSecret);
    tokenParams.append('scope', 'Link-Core');
    tokenParams.append('grant_type', 'client_credentials');

    const tokenRes = await fetch(`${apiBase}/v1/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString(),
    });

    const tokenText = await tokenRes.text();
    let tokenData;
    try {
      tokenData = JSON.parse(tokenText);
    } catch {
      console.error('Link Money token non-JSON:', tokenText.substring(0, 300));
      return res.status(502).json({ error: `Token request failed (${tokenRes.status})` });
    }

    if (!tokenRes.ok) {
      console.error('Link Money token error:', tokenData);
      return res.status(tokenRes.status).json({ error: tokenData?.errorSummary || tokenData?.error || 'Token fetch failed' });
    }

    const accessToken = tokenData.access_token;
    const parsedAmount = parseFloat(amount);

    // Step 2: Create session using Bearer token
    const sessionRes = await fetch(`${apiBase}/v2/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        firstName: firstName || '',
        lastName: lastName || '',
        email,
        customerProfile: { guestCheckout: true },
        orderDetails: {
          totalAmount: { value: parsedAmount, currency: 'USD' },
        },
        paymentDetails: {
          amount: { value: parsedAmount, currency: 'USD' },
          requestKey: randomUUID(),
        },
        redirectUrl,
      }),
    });

    const sessionText = await sessionRes.text();
    let sessionData;
    try {
      sessionData = JSON.parse(sessionText);
    } catch {
      console.error('Link Money session non-JSON:', sessionText.substring(0, 300));
      return res.status(502).json({ error: `Session request failed (${sessionRes.status})` });
    }

    if (!sessionRes.ok) {
      console.error('Link Money session error:', sessionData);
      return res.status(sessionRes.status).json({ error: sessionData?.errorMessage || sessionData?.message || sessionData?.error || 'Session creation failed' });
    }

    return res.status(200).json({ sessionUrl: sessionData.sessionUrl, sessionKey: sessionData.sessionKey });
  } catch (err) {
    console.error('Link Money error:', err);
    return res.status(500).json({ error: 'Failed to create payment session', detail: err.message });
  }
}
