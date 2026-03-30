// /api/contact — handles contact, wholesale, and partner application submissions
import { getSupabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type = 'contact', ...fields } = req.body || {};

  if (!fields.email || !fields.email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  try {
    const supabase = getSupabaseAdmin();
    await supabase.from('contact_submissions').insert({
      type,
      email: fields.email,
      name: fields.name || null,
      data: fields,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    // Non-fatal — log and continue
    console.error('[contact API] Supabase save error:', err.message);
  }

  return res.status(200).json({ ok: true });
}
