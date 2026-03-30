// POST /api/omnisend/identify — upsert a contact in Omnisend
import { upsertContact } from '../../../lib/omnisend';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, phone, firstName, lastName } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });
  try {
    await upsertContact({ email, phone, firstName, lastName, tags: ['customer'] });
    return res.status(200).json({ ok: true });
  } catch (e) {
    // Never block auth flows — always return 200
    return res.status(200).json({ ok: true });
  }
}
