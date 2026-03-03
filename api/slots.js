import { Redis } from '@upstash/redis';

const redis = new Redis({
  url:   process.env.ERP_Beaumanoir_KV_REST_API_URL,
  token: process.env.ERP_Beaumanoir_KV_REST_API_TOKEN,
});

const STORAGE_KEY = 'beaumanoir_erp_v4';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const data = await redis.get(STORAGE_KEY);
      return res.status(200).json(data || { taken: {}, adminBlocked: {}, blockedDays: {} });
    }

    if (req.method === 'POST') {
      const body = req.body;
      if (!body || typeof body !== 'object') {
        return res.status(400).json({ error: 'Invalid body' });
      }
      const safe = {
        taken:        body.taken        || {},
        adminBlocked: body.adminBlocked || {},
        blockedDays:  body.blockedDays  || {},
      };
      await redis.set(STORAGE_KEY, safe);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('Redis error:', err);
    return res.status(500).json({ error: 'Storage unavailable', detail: err.message });
  }
}
