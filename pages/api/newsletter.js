import { upsertContact } from '../../lib/omnisend';
import crypto from 'crypto';
import { registerCode, getByEmail } from '../../lib/newsletterCodes';

// Generate a unique, human-readable discount code from email + random salt
function generateDiscountCode(email) {
  const salt = crypto.randomBytes(4).toString('hex').toUpperCase();
  const hash = crypto.createHash('sha256').update(email.toLowerCase() + salt).digest('hex');
  return `EVO${hash.slice(0, 6).toUpperCase()}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, phone, phoneOnly } = req.body || {};

  // Phone-only mode: user already has a code, just adding phone
  if (phoneOnly && phone) {
    try {
      await upsertContact({ phone, tags: ['sms-subscriber', 'phone-upsell'] });
    } catch (_) {}
    return res.status(200).json({ ok: true });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown';

  // Return existing code if this email already signed up
  const existing = getByEmail(email);
  if (existing) {
    return res.status(200).json({ ok: true, code: existing.code });
  }

  const code = generateDiscountCode(email);
  registerCode(email, code, ip);

  try {
    await upsertContact({
      email,
      phone: phone || undefined,
      tags: ['newsletter', 'popup-signup', phone ? 'sms-subscriber' : 'email-only'],
      customProperties: { discount_code: code },
    });
  } catch (err) {
    console.error('[newsletter] omnisend error:', err.message);
    // Still return the code even if Omnisend fails
  }

  return res.status(200).json({ ok: true, code });
}
