export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const serverUrl = process.env.HUMMINGBIRD_SERVER_URL;
  const publicKey = process.env.HUMMINGBIRD_PUBLIC_KEY;

  if (!serverUrl || !publicKey) {
    return res.status(500).json({ error: 'Hummingbird not configured' });
  }

  try {
    const r = await fetch(`${serverUrl.replace(/\/$/, '')}/api/adyen/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_key: publicKey }),
    });
    const data = await r.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('Hummingbird config error:', err);
    return res.status(500).json({ error: 'Failed to fetch Adyen config', detail: err.message });
  }
}
