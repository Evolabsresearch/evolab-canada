/**
 * POST /api/orders/save
 * Saves a completed order to the Supabase orders table.
 * In full_open mode: creates a guest Supabase account if none exists.
 */
import { getSupabaseAdmin } from '../../../lib/supabase';
import { trackOrder, upsertContact, triggerEvent } from '../../../lib/omnisend';
import { getCatalogMode } from '../../../lib/catalogMode';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const {
    email, firstName, lastName, phone,
    address1, address2, city, state, zip, country,
    items, total, paymentMethod, transactionId,
    catalogMode: clientCatalogMode,
  } = req.body;

  if (!email || !total) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const supabase = getSupabaseAdmin();
  const cleanEmail = email.toLowerCase().trim();
  const orderNumber = `EVO-${Date.now()}`;

  const lineItems = (items || []).map(item => ({
    id: item.id || null,
    name: item.name || 'Unknown item',
    quantity: item.qty || item.quantity || 1,
    total: parseFloat(item.lineTotal || item.total || 0),
    image: item.image || null,
  }));

  const shippingAddress = {
    first_name: firstName || '',
    last_name: lastName || '',
    address_1: address1 || '',
    address_2: address2 || '',
    city: city || '',
    state: state || '',
    postcode: zip || '',
    country: country || 'US',
  };

  // --- STEP 1: Find or create user ---
  let userId = null;

  // Check auth.users by email
  try {
    const { data: authData } = await supabase.auth.admin.listUsers();
    const authUser = authData?.users?.find(
      u => u.email?.toLowerCase() === cleanEmail
    );
    if (authUser) userId = authUser.id;
  } catch (e) {
    console.error('User lookup error:', e.message);
  }

  // Check by phone if still no match
  if (!userId && phone) {
    try {
      const digits = phone.replace(/\D/g, '');
      if (digits.length >= 10) {
        const pseudoEmail = `${digits}@phone.evolabsresearch.cam`;
        const { data: authData } = await supabase.auth.admin.listUsers();
        const match = authData?.users?.find(u => u.email === pseudoEmail);
        if (match) userId = match.id;
      }
    } catch {}
  }

  // In full_open mode, create account if none found
  const catalogMode = clientCatalogMode || await getCatalogMode();
  let isNewGuestAccount = false;
  if (!userId && catalogMode === 'full_open' && cleanEmail) {
    try {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: cleanEmail,
        email_confirm: true,
        user_metadata: {
          first_name: firstName || '',
          last_name: lastName || '',
          phone: phone || '',
          source: 'guest_checkout',
        },
      });

      if (!createError && newUser?.user) {
        userId = newUser.user.id;
        isNewGuestAccount = true;

        // Generate magic link so they can set a password
        try {
          await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email: cleanEmail,
            options: {
              redirectTo: 'https://evolabsresearch.ca/account?welcome=true',
            },
          });
        } catch (linkErr) {
          console.error('Magic link generation error:', linkErr.message);
        }
      }
    } catch (createErr) {
      console.error('Guest account creation error:', createErr.message);
    }
  }

  // --- STEP 2: Save order ---
  const orderData = {
    order_number: orderNumber,
    customer_email: cleanEmail,
    customer_name: `${firstName || ''} ${lastName || ''}`.trim(),
    total: parseFloat(total),
    status: 'processing',
    line_items: lineItems,
    shipping_address: shippingAddress,
    payment_method: paymentMethod || 'card',
    transaction_id: transactionId || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Link order to user if found/created
  if (userId) {
    orderData.user_id = userId;
  }

  const { data, error } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single();

  if (error) {
    console.error('Save order error:', error);
    return res.status(500).json({ error: error.message });
  }

  // --- STEP 3: Omnisend tracking (fire-and-forget) ---
  const omnisendPromises = [
    trackOrder({
      email: cleanEmail,
      orderId: orderNumber,
      orderTotal: parseFloat(total),
      items: (items || []).map(item => ({
        id: item.id || item.slug,
        slug: item.slug,
        name: item.name,
        qty: item.qty || item.quantity || 1,
        price: item.price,
        salePrice: item.salePrice,
        image: item.image || '',
      })),
    }),
    upsertContact({
      email: cleanEmail,
      firstName: firstName || '',
      lastName: lastName || '',
      phone: phone || '',
      tags: ['customer', 'purchased', ...(isNewGuestAccount ? ['guest_checkout'] : [])],
    }),
  ];

  // Fire welcome flow for new guest accounts
  if (isNewGuestAccount) {
    omnisendPromises.push(
      triggerEvent(cleanEmail, 'welcomeSeriesStart', {
        firstName: firstName || '',
        email: cleanEmail,
        discountCode: 'WELCOME10',
      })
    );
  }

  Promise.allSettled(omnisendPromises).catch(() => {});

  return res.status(200).json({ order: data, orderNumber });
}
