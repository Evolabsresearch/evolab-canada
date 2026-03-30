/**
 * POST /api/auth/send-otp
 * Sends a verification code via Twilio Verify (pre-registered A2P, bypasses 10DLC filtering).
 */
import twilio from 'twilio';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number required' });

  // Normalize to E.164
  const digits = phone.replace(/\D/g, '');
  const e164 = digits.startsWith('1') ? `+${digits}` : `+1${digits}`;
  if (digits.length < 10) return res.status(400).json({ error: 'Invalid phone number' });

  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_VERIFY_SERVICE_SID) {
    console.error('OTP send error: Twilio env vars not set');
    return res.status(500).json({ error: 'SMS is not configured. Please use email login instead.' });
  }

  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to: e164, channel: 'sms' });

    return res.status(200).json({ ok: true, phone: e164 });
  } catch (err) {
    console.error('OTP send error:', err);
    return res.status(500).json({ error: 'Failed to send SMS. Please use email login instead.' });
  }
}
