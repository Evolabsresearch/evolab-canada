/**
 * GET /api/tracking/[trackingNumber]?carrier=usps
 * Returns live AfterShip tracking data including checkpoint coordinates for the map.
 */
import { getTracking } from '../../../lib/aftership';
import { getSupabaseAdmin } from '../../../lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  const { trackingNumber, carrier = 'usps' } = req.query;
  const supabase = getSupabaseAdmin();

  try {
    // Try AfterShip live data
    const data = await getTracking(carrier, trackingNumber);
    const tracking = data?.tracking;

    if (!tracking) return res.status(404).json({ error: 'Tracking not found' });

    // Build checkpoint list with coordinates where available
    const checkpoints = (tracking.checkpoints || []).map(cp => ({
      datetime: cp.checkpoint_time,
      message: cp.message,
      location: cp.city ? `${cp.city}, ${cp.state || ''} ${cp.country_iso3 || ''}`.trim() : cp.location || '',
      // AfterShip sometimes returns coordinates in subtag_message or tag
      lat: cp.coordinates?.lat || null,
      lng: cp.coordinates?.lng || null,
    })).filter(cp => cp.datetime);

    const result = {
      trackingNumber: tracking.tracking_number,
      carrier: tracking.slug,
      status: tracking.tag,              // Pending | InTransit | OutForDelivery | Delivered | Exception
      statusDisplay: tracking.subtag_message || tracking.tag,
      estimatedDelivery: tracking.expected_delivery,
      originCountry: tracking.origin_country_iso3,
      destinationCountry: tracking.destination_country_iso3,
      lastUpdate: tracking.last_updated_at,
      checkpoints,
      // Most recent location (for map centering)
      currentLocation: checkpoints.find(cp => cp.lat) || null,
    };

    // Cache result in Supabase for faster repeated lookups
    await supabase.from('order_tracking').upsert({
      tracking_number: trackingNumber,
      carrier,
      status: result.status,
      last_checkpoint: checkpoints[0]?.message || '',
      estimated_delivery: result.estimatedDelivery,
      raw_data: result,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'tracking_number' });

    res.status(200).json(result);
  } catch (err) {
    console.error('Tracking API error:', err);
    res.status(500).json({ error: err.message });
  }
}
