/**
 * POST /api/affiliate/register
 * Registers current user as a partner and generates their unique referral code.
 */
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getSupabaseAdmin } from '../../../lib/supabase';

function generateCode(name = '') {
  const base = name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 5) || 'EVO';
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${base}${rand}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  const supabase = getSupabaseAdmin();
  const { website, bio } = req.body;

  // Check if already a partner
  const { data: existing } = await supabase
    .from('partners')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (existing) return res.status(200).json({ partner: existing });

  // Generate unique code
  let code = generateCode(session.user.name || session.user.email);
  const { data: clash } = await supabase.from('partners').select('id').eq('referral_code', code).single();
  if (clash) code = generateCode() + Math.random().toString(36).slice(2,4).toUpperCase();

  const { data: partner, error } = await supabase.from('partners').insert({
    user_id: session.user.id,
    referral_code: code,
    commission_rate: 0.10,   // 10% default
    status: 'pending',        // pending → approved by admin
    website: website || null,
    bio: bio || null,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ partner });
}
