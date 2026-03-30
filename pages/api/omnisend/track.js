// POST /api/omnisend/track — fires a custom Omnisend event
import { triggerEvent } from '../../../lib/omnisend';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, eventName, fields } = req.body;
  if (!email || !eventName) return res.status(400).json({ error: 'email and eventName required' });
  try {
    await triggerEvent(email, eventName, fields || {});
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
