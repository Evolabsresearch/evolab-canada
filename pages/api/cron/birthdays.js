import { getSupabaseAdmin } from '../../../lib/supabase';
import { triggerEvent } from '../../../lib/omnisend';

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = getSupabaseAdmin();
  const now = new Date();

  // user_profiles has birthday_month/birthday_day and first_name/email
  const { data: users } = await supabase
    .from('user_profiles')
    .select('email, first_name')
    .eq('birthday_month', now.getUTCMonth() + 1)
    .eq('birthday_day', now.getUTCDate());

  let triggered = 0;
  for (const user of (users || [])) {
    if (!user.email) continue;
    await triggerEvent(user.email, 'customerBirthday', {
      firstName: user.first_name || '',
      birthdayCode: 'BDAY20',
    });
    triggered++;
  }

  return res.status(200).json({ triggered });
}
