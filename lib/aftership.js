/**
 * AfterShip API helper
 * Docs: https://www.aftership.com/docs/aftership/quickstart/api-quick-start
 */

const AFTERSHIP_BASE = 'https://api.aftership.com/v4';

async function aftershipFetch(path, options = {}) {
  const res = await fetch(`${AFTERSHIP_BASE}${path}`, {
    ...options,
    headers: {
      'aftership-api-key': process.env.AFTERSHIP_API_KEY,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.meta?.message || 'AfterShip error');
  return json.data;
}

/**
 * Create a tracking in AfterShip
 * @param {string} trackingNumber
 * @param {string} slug - carrier slug e.g. "ups", "fedex", "usps"
 * @param {string} title - e.g. customer name or order number
 */
export async function createTracking(trackingNumber, slug, title) {
  return aftershipFetch('/trackings', {
    method: 'POST',
    body: JSON.stringify({
      tracking: {
        tracking_number: trackingNumber,
        slug,
        title,
        smses: [],
        emails: [],
      },
    }),
  });
}

/**
 * Get full tracking details including checkpoints with lat/lng
 */
export async function getTracking(slug, trackingNumber) {
  return aftershipFetch(`/trackings/${slug}/${trackingNumber}`);
}

/**
 * Get all trackings (for admin view)
 */
export async function getAllTrackings(page = 1, limit = 50) {
  return aftershipFetch(`/trackings?page=${page}&limit=${limit}`);
}

/**
 * Delete a tracking
 */
export async function deleteTracking(slug, trackingNumber) {
  return aftershipFetch(`/trackings/${slug}/${trackingNumber}`, { method: 'DELETE' });
}
