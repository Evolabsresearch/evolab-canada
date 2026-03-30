/**
 * GET /api/affiliate/stats
 * Returns partner's click count, conversions, earnings, and payout history.
 */
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getSupabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  const supabase = getSupabaseAdmin();

  const { data: partner } = await supabase
    .from('partners')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (!partner) return res.status(404).json({ error: 'Not a partner' });

  // Clicks in last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { count: clicks30d } = await supabase
    .from('affiliate_clicks')
    .select('id', { count: 'exact', head: true })
    .eq('partner_id', partner.id)
    .gte('created_at', thirtyDaysAgo);

  // All conversions
  const { data: conversions } = await supabase
    .from('affiliate_conversions')
    .select('*')
    .eq('partner_id', partner.id)
    .order('created_at', { ascending: false });

  const totalEarned = (conversions || []).reduce((sum, c) => sum + (c.commission || 0), 0);
  const pendingPayout = (conversions || [])
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + (c.commission || 0), 0);

  // Payout history
  const { data: payouts } = await supabase
    .from('affiliate_payouts')
    .select('*')
    .eq('partner_id', partner.id)
    .order('created_at', { ascending: false });

  res.status(200).json({
    referralCode: partner.referral_code,
    commissionRate: partner.commission_rate,
    partnerStatus: partner.status,
    referralLink: `https://evolabsresearch.ca/?ref=${partner.referral_code}`,
    clicks30d: clicks30d || 0,
    totalConversions: conversions?.length || 0,
    totalEarned: parseFloat(totalEarned.toFixed(2)),
    pendingPayout: parseFloat(pendingPayout.toFixed(2)),
    conversions: (conversions || []).slice(0, 20),
    payouts: payouts || [],
  });
}
