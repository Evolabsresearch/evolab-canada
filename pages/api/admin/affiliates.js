/**
 * Admin Affiliates API
 * GET  /api/admin/affiliates — list all partners with stats
 * PATCH /api/admin/affiliates — body: { id, status?, commission_rate?, notes? }
 */
import { getSupabaseAdmin } from '../../../lib/supabase';
import { isAdminAuthed } from './_auth';

export default async function handler(req, res) {
  if (!isAdminAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });
  const supabase = getSupabaseAdmin();

  if (req.method === 'GET') {
    const { status } = req.query;

    let query = supabase
      .from('partners')
      .select(`
        id, user_id, referral_code, commission_rate, status, notes, created_at,
        users!inner(email, name)
      `)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') query = query.eq('status', status);

    const { data: partners, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    // Enrich with conversion stats
    const enriched = await Promise.all(
      (partners || []).map(async (partner) => {
        const { data: conversions } = await supabase
          .from('affiliate_conversions')
          .select('commission, status, order_total')
          .eq('partner_id', partner.id);

        const { count: clicks } = await supabase
          .from('affiliate_clicks')
          .select('id', { count: 'exact', head: true })
          .eq('partner_id', partner.id);

        const approved = (conversions || []).filter(c => c.status === 'approved' || c.status === 'paid');
        const pending = (conversions || []).filter(c => c.status === 'pending');
        const totalEarned = approved.reduce((s, c) => s + (parseFloat(c.commission) || 0), 0);
        const pendingPayout = pending.reduce((s, c) => s + (parseFloat(c.commission) || 0), 0);
        const totalSales = approved.reduce((s, c) => s + (parseFloat(c.order_total) || 0), 0);

        return {
          id: partner.id,
          email: partner.users?.email,
          name: partner.users?.name || partner.users?.email?.split('@')[0],
          referralCode: partner.referral_code,
          commissionRate: partner.commission_rate,
          status: partner.status,
          notes: partner.notes,
          createdAt: partner.created_at,
          clicks: clicks || 0,
          conversions: (conversions || []).length,
          totalSales: parseFloat(totalSales.toFixed(2)),
          totalEarned: parseFloat(totalEarned.toFixed(2)),
          pendingPayout: parseFloat(pendingPayout.toFixed(2)),
        };
      })
    );

    return res.status(200).json({ affiliates: enriched });
  }

  if (req.method === 'PATCH') {
    const { id, status, commission_rate, notes, action, amount, note } = req.body;
    if (!id) return res.status(400).json({ error: 'id required' });

    // Mark pending conversions as paid + record payout
    if (action === 'mark_paid') {
      const { data: convs } = await supabase
        .from('affiliate_conversions')
        .select('id, commission')
        .eq('partner_id', id)
        .eq('status', 'pending');

      const total = (convs || []).reduce((s, c) => s + (parseFloat(c.commission) || 0), 0);
      const ids = (convs || []).map(c => c.id);

      if (ids.length > 0) {
        await supabase
          .from('affiliate_conversions')
          .update({ status: 'paid' })
          .in('id', ids);
      }

      // Insert payout record (best-effort — table may not exist yet)
      await supabase.from('affiliate_payouts').insert({
        partner_id: id,
        amount: amount || total,
        note: note || 'Manual payout',
        paid_at: new Date().toISOString(),
      }).maybeSingle();

      return res.status(200).json({ ok: true, paidAmount: total });
    }

    const updates = {};
    if (status !== undefined) updates.status = status;
    if (commission_rate !== undefined) updates.commission_rate = commission_rate;
    if (notes !== undefined) updates.notes = notes;

    const { data, error } = await supabase
      .from('partners')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ affiliate: data });
  }

  res.status(405).end();
}
