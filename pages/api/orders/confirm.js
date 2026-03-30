/**
 * POST /api/orders/confirm
 * Sends order confirmation email via SendGrid + optional SMS via Twilio.
 * Called from all 3 payment success paths (Hummingbird, Stripe, LinkMoney).
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const {
    email, firstName, lastName, phone,
    address1, address2, city, state, zip, country,
    items = [],          // [{ name, quantity, price, image }]
    subtotal, shipping, total,
    shippingMethod,      // 'USPS Priority Mail' | 'UPS Ground'
    paymentMethod,       // 'card' | 'stripe' | 'linkmoney'
    orderNumber,         // optional — generated if not supplied
  } = req.body;

  if (!email || !firstName || !items.length) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sgKey   = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'orders@evolabsresearch.cam';
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom  = process.env.TWILIO_PHONE_NUMBER;

  const orderRef = orderNumber || `EVO-${Date.now().toString(36).toUpperCase()}`;
  const fullName = `${firstName} ${lastName}`.trim();
  const shippingLabel = shippingMethod || 'USPS Priority Mail';
  const deliveryEta   = shippingMethod === 'UPS Ground' ? '2–3 business days' : '3–5 business days';

  // ── Build item rows HTML ──────────────────────────────────────────
  const itemRowsHtml = items.map(item => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
        <strong style="color:#0a0a0a;">${item.name}</strong>
        <span style="color:#6b7280;font-size:13px;"> × ${item.quantity || 1}</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:700;color:#0a0a0a;">
        $${parseFloat(item.price || 0).toFixed(2)}
      </td>
    </tr>
  `).join('');

  const itemRowsText = items.map(i => `  • ${i.name} × ${i.quantity || 1}  $${parseFloat(i.price || 0).toFixed(2)}`).join('\n');

  // ── Email HTML ────────────────────────────────────────────────────
  const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f6f6f6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f6;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#1B4D3E;padding:32px 40px;text-align:center;">
            <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">⚗️ EVO Labs Research</div>
            <div style="font-size:13px;color:#a7d7c5;margin-top:6px;">Order Confirmation</div>
          </td>
        </tr>

        <!-- Hero message -->
        <tr>
          <td style="padding:36px 40px 24px;text-align:center;border-bottom:1px solid #f0f0f0;">
            <div style="font-size:28px;">✅</div>
            <h1 style="font-size:22px;font-weight:800;color:#0a0a0a;margin:12px 0 8px;">Your order is confirmed!</h1>
            <p style="color:#6b7280;font-size:14px;margin:0;">Hi ${firstName}, thanks for your research order. We're preparing it now.</p>
            <div style="display:inline-block;background:#f0fdf8;border:1.5px solid #1B4D3E;border-radius:8px;padding:8px 20px;margin-top:16px;">
              <span style="font-size:13px;color:#1B4D3E;font-weight:700;">Order #${orderRef}</span>
            </div>
          </td>
        </tr>

        <!-- Items -->
        <tr>
          <td style="padding:28px 40px;">
            <h2 style="font-size:14px;font-weight:700;color:#6b7280;letter-spacing:0.05em;margin:0 0 16px;text-transform:uppercase;">Items Ordered</h2>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${itemRowsHtml}
              <tr>
                <td style="padding:10px 0;color:#6b7280;font-size:13px;">Subtotal</td>
                <td style="padding:10px 0;text-align:right;color:#6b7280;font-size:13px;">$${parseFloat(subtotal || 0).toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;color:#6b7280;font-size:13px;">Shipping (${shippingLabel})</td>
                <td style="padding:4px 0;text-align:right;color:#6b7280;font-size:13px;">${parseFloat(shipping || 0) === 0 ? 'FREE' : '$' + parseFloat(shipping || 0).toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding:14px 0 0;font-size:16px;font-weight:800;color:#0a0a0a;border-top:2px solid #0a0a0a;">Total Paid</td>
                <td style="padding:14px 0 0;text-align:right;font-size:16px;font-weight:800;color:#1B4D3E;border-top:2px solid #0a0a0a;">$${parseFloat(total || 0).toFixed(2)}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Shipping info -->
        <tr>
          <td style="padding:0 40px 28px;">
            <div style="background:#f9fafb;border-radius:10px;padding:20px;">
              <h2 style="font-size:13px;font-weight:700;color:#6b7280;letter-spacing:0.05em;margin:0 0 12px;text-transform:uppercase;">📦 Shipping To</h2>
              <div style="font-size:14px;color:#0a0a0a;line-height:1.7;">
                <strong>${fullName}</strong><br>
                ${address1}${address2 ? ', ' + address2 : ''}<br>
                ${city}, ${state} ${zip}<br>
                ${country || 'US'}
              </div>
              <div style="margin-top:12px;padding-top:12px;border-top:1px solid #e5e7eb;">
                <span style="font-size:13px;color:#1B4D3E;font-weight:700;">🚚 ${shippingLabel}</span>
                <span style="font-size:12px;color:#6b7280;margin-left:8px;">Est. ${deliveryEta}</span>
              </div>
            </div>
          </td>
        </tr>

        <!-- Tracking note -->
        <tr>
          <td style="padding:0 40px 28px;">
            <div style="background:#eff6ff;border-radius:10px;padding:16px 20px;font-size:13px;color:#1d4ed8;">
              📬 <strong>Tracking info</strong> will be emailed and texted to you once your order ships. Orders placed before 2pm EST ship same business day.
            </div>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 40px 36px;text-align:center;">
            <a href="https://evolabsresearch.cam/account" style="display:inline-block;background:#1B4D3E;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:14px;">View Your Orders →</a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #f0f0f0;">
            <p style="font-size:12px;color:#9ca3af;margin:0 0 6px;">EVO Labs Research Canada · 100 King Street West, Suite 5600, Toronto ON M5X 1C9</p>
            <p style="font-size:11px;color:#d1d5db;margin:0;">These products are for research use only and not for human consumption.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  // ── Plain-text fallback ───────────────────────────────────────────
  const textBody = `
EVO Labs Research — Order Confirmed ✅
Order #${orderRef}

Hi ${firstName}, your order is confirmed!

ITEMS:
${itemRowsText}

Subtotal:  $${parseFloat(subtotal || 0).toFixed(2)}
Shipping:  ${parseFloat(shipping || 0) === 0 ? 'FREE' : '$' + parseFloat(shipping || 0).toFixed(2)} (${shippingLabel})
Total:     $${parseFloat(total || 0).toFixed(2)}

SHIPPING TO:
${fullName}
${address1}${address2 ? ', ' + address2 : ''}
${city}, ${state} ${zip}

Estimated delivery: ${deliveryEta}

Tracking info will be sent once your order ships.
Track your order: https://evolabsresearch.cam/account

EVO Labs Research | support@evolabsresearch.cam
`;

  const errors = [];

  // ── Send email via SendGrid ───────────────────────────────────────
  if (sgKey) {
    try {
      const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sgKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email, name: fullName }] }],
          from: { email: fromEmail, name: 'EVO Labs Research' },
          reply_to: { email: 'support@evolabsresearch.cam', name: 'EVO Labs Support' },
          subject: `✅ Order Confirmed — #${orderRef} | EVO Labs Research`,
          content: [
            { type: 'text/plain', value: textBody },
            { type: 'text/html',  value: htmlBody  },
          ],
        }),
      });
      if (!sgRes.ok) {
        const errText = await sgRes.text();
        console.error('SendGrid error:', sgRes.status, errText);
        errors.push(`email: SendGrid ${sgRes.status}`);
      }
    } catch (err) {
      console.error('SendGrid exception:', err);
      errors.push(`email: ${err.message}`);
    }
  } else {
    console.warn('SENDGRID_API_KEY not set — skipping confirmation email');
    errors.push('email: SENDGRID_API_KEY not configured');
  }

  // ── Send SMS via Twilio ───────────────────────────────────────────
  if (phone && twilioSid && twilioToken && twilioFrom) {
    try {
      const normalizedPhone = phone.replace(/\D/g, '');
      const e164 = normalizedPhone.startsWith('1') ? `+${normalizedPhone}` : `+1${normalizedPhone}`;
      const smsBody = `✅ EVO Labs Order Confirmed! Order #${orderRef} for $${parseFloat(total || 0).toFixed(2)} is being prepared. Tracking will be texted once shipped. Questions? support@evolabsresearch.cam`;

      const twilioRes = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({ From: twilioFrom, To: e164, Body: smsBody }).toString(),
        }
      );
      if (!twilioRes.ok) {
        const errText = await twilioRes.text();
        console.error('Twilio error:', twilioRes.status, errText);
        errors.push(`sms: Twilio ${twilioRes.status}`);
      }
    } catch (err) {
      console.error('Twilio exception:', err);
      errors.push(`sms: ${err.message}`);
    }
  }

  return res.status(200).json({
    success: true,
    orderRef,
    warnings: errors.length ? errors : undefined,
  });
}
