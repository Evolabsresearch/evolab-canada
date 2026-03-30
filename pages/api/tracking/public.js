/**
 * GET /api/tracking/public?number=TRACKING_NUMBER&carrier=usps
 * Public endpoint — no auth required.
 * Fetches live tracking from AfterShip.
 */

const CARRIER_SLUGS = {
  ups:   ['ups'],
  usps:  ['usps'],
  fedex: ['fedex'],
};

function detectSlug(trackingNumber) {
  const n = trackingNumber.trim().toUpperCase();
  if (/^1Z/.test(n)) return 'ups';
  if (/^9[2-5]/.test(n)) return 'usps';
  if (/^\d{12,15}$/.test(n)) return 'fedex';
  return 'usps'; // default
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { number, carrier } = req.query;
  if (!number) return res.status(400).json({ error: 'number required' });

  const slug = carrier || detectSlug(number);
  const AFTERSHIP_KEY = process.env.AFTERSHIP_API_KEY;

  if (!AFTERSHIP_KEY) {
    return res.status(503).json({ error: 'Tracking not configured' });
  }

  try {
    const r = await fetch(`https://api.aftership.com/v4/trackings/${slug}/${encodeURIComponent(number)}`, {
      headers: { 'aftership-api-key': AFTERSHIP_KEY, 'Content-Type': 'application/json' },
    });

    if (r.status === 404) {
      // Try auto-detect with other carriers
      for (const trySlug of ['usps', 'ups', 'fedex']) {
        if (trySlug === slug) continue;
        const r2 = await fetch(`https://api.aftership.com/v4/trackings/${trySlug}/${encodeURIComponent(number)}`, {
          headers: { 'aftership-api-key': AFTERSHIP_KEY },
        });
        if (r2.ok) {
          const json2 = await r2.json();
          return res.status(200).json(formatTracking(json2.data?.tracking));
        }
      }
      return res.status(404).json({ error: 'Tracking not found. It may take up to 24 hours after shipment for tracking to appear.' });
    }

    if (!r.ok) {
      const j = await r.json();
      return res.status(r.status).json({ error: j.meta?.message || 'Tracking error' });
    }

    const json = await r.json();
    return res.status(200).json(formatTracking(json.data?.tracking));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

function formatTracking(t) {
  if (!t) return null;
  const checkpoints = (t.checkpoints || [])
    .map(cp => ({
      datetime:  cp.checkpoint_time,
      message:   cp.message,
      location:  cp.city ? `${cp.city}${cp.state ? ', ' + cp.state : ''}` : cp.location || '',
      tag:       cp.tag,
    }))
    .filter(cp => cp.datetime)
    .reverse(); // newest first

  return {
    trackingNumber:   t.tracking_number,
    carrier:          t.slug,
    status:           t.tag,
    statusDisplay:    t.subtag_message || t.tag || 'In Transit',
    estimatedDelivery: t.expected_delivery,
    checkpoints,
  };
}
