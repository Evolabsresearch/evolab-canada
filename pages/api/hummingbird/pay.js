export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const {
    email, amount,
    encryptedCardNumber, encryptedExpiryMonth, encryptedExpiryYear,
    encryptedSecurityCode, holderName,
    address1, address2, city, state, zip, country,
    cartItems,
  } = req.body;

  if (!email || !amount || !encryptedCardNumber) {
    return res.status(400).json({ error: 'Missing required payment fields' });
  }

  const serverUrl = process.env.HUMMINGBIRD_SERVER_URL;
  const publicKey = process.env.HUMMINGBIRD_PUBLIC_KEY;
  const secretKey = process.env.HUMMINGBIRD_SECRET_KEY;

  if (!serverUrl || !publicKey || !secretKey) {
    return res.status(500).json({ error: 'Hummingbird not configured' });
  }

  try {
    const payload = {
      public_key: publicKey,
      secret_key: secretKey,
      user_email: email,
      currency_id: 'CAD',
      amount: parseFloat(amount),
      encryptedCardNumber,
      encryptedExpiryMonth,
      encryptedExpiryYear,
      encryptedSecurityCode,
      holderName,
      billing_detail: {
        address_1: address1 || '',
        address_2: address2 || '',
        city: city || '',
        postal_code: zip || '',
        state: state || '',
        country: country || 'CA',
      },
    };

    const payRes = await fetch(`${serverUrl.replace(/\/$/, '')}/api/adyen/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const payText = await payRes.text();
    let payData;
    try {
      payData = JSON.parse(payText);
    } catch {
      console.error('Hummingbird non-JSON response:', payText.substring(0, 300));
      return res.status(502).json({ error: `Payment request failed (${payRes.status})` });
    }

    const isSuccess = payData.status === true || payData.success === true;

    if (!isSuccess) {
      let errMsg = 'Payment declined';
      if (payData.message) {
        if (typeof payData.message === 'object' && Array.isArray(payData.message.error)) {
          errMsg = payData.message.error.join(', ');
        } else if (typeof payData.message === 'string') {
          errMsg = payData.message;
        }
      } else if (payData.refusalReason) {
        errMsg = payData.refusalReason;
      } else if (payData.reason) {
        errMsg = payData.reason;
      } else if (payData.errorCode) {
        errMsg = payData.errorCode;
      }
      console.error('Hummingbird payment failed:', payData);
      return res.status(402).json({ error: errMsg });
    }

    // Fire-and-forget: save order to Hummingbird
    if (payData.transaction_id) {
      fetch(`${serverUrl.replace(/\/$/, '')}/api/adyen/save-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_key: publicKey,
          secret_key: secretKey,
          transaction_id: payData.transaction_id,
          order_total: String(parseFloat(amount)),
          order_currency: 'CAD',
          order_status: 'processing',
          billing: {
            email,
            address_1: address1 || '',
            city: city || '',
            state: state || '',
            postal_code: zip || '',
            country: country || 'CA',
          },
          items: cartItems || [],
        }),
      }).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      transaction_id: payData.transaction_id,
      pspReference: payData.pspReference,
    });
  } catch (err) {
    console.error('Hummingbird pay error:', err);
    return res.status(500).json({ error: 'Payment processing failed', detail: err.message });
  }
}
