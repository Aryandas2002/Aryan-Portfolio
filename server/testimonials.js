import { createHash, timingSafeEqual } from 'node:crypto';
import { validateTestimonial } from '../src/submitTestimonial.js';

const hash = value => createHash('sha256').update(value).digest();
export function createHandler({ env = process.env, fetchImpl = fetch } = {}) {
  const command = async (...args) => {
    const response = await fetchImpl(env.UPSTASH_REDIS_REST_URL, {
      method: 'POST', headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args), signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error('Storage unavailable');
    const data = await response.json();
    if (data.error) throw new Error('Storage unavailable');
    return data.result;
  };
  return async function handler(req, res) {
    const send = (status, body) => res.status(status).json(body);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Vary', 'Origin');
    const origin = req.headers.origin;
    const allowed = (env.TESTIMONIAL_ALLOWED_ORIGINS || '').split(',').map(x => x.trim()).filter(Boolean);
    if (origin && !allowed.includes(origin)) return send(403, { error: 'This website is not allowed.' });
    if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (!['GET', 'POST'].includes(req.method)) { res.setHeader('Allow', 'GET, POST, OPTIONS'); return send(405, { error: 'Method not allowed.' }); }
    if (!env.UPSTASH_REDIS_REST_URL?.startsWith('https://') || !env.UPSTASH_REDIS_REST_TOKEN || !env.TESTIMONIAL_PUBLISH_PASSKEY || env.TESTIMONIAL_PUBLISH_PASSKEY.length < 20) {
      return send(503, { error: 'Publishing is not configured yet. Please try again later.' });
    }
    try {
      if (req.method === 'GET') {
        const records = await command('HVALS', 'portfolio:testimonials:v1');
        return send(200, { testimonials: records.map(value => JSON.parse(value)) });
      }
      // Vercel sets this header; never trust the client-supplied generic forwarding header.
      const ip = req.headers['x-vercel-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
      const key = 'portfolio:publish-attempts:' + hash(String(ip)).toString('hex');
      const attempts = await command('EVAL', "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],900) end; return n", '1', key);
      if (attempts > 10) { res.setHeader('Retry-After', '900'); return send(429, { error: 'Too many attempts. Please try again in 15 minutes.' }); }
      if (!String(req.headers['content-type'] || '').startsWith('application/json')) return send(415, { error: 'JSON required.' });
      let body = req.body;
      if (typeof body === 'string') { if (Buffer.byteLength(body) > 16384) return send(413, { error: 'Submission too large.' }); try { body = JSON.parse(body); } catch { return send(400, { error: 'Invalid submission.' }); } }
      if (!body || Buffer.byteLength(JSON.stringify(body)) > 16384) return send(400, { error: 'Invalid submission.' });
      if (typeof body.passkey !== 'string' || body.passkey.length > 256 || !timingSafeEqual(hash(body.passkey), hash(env.TESTIMONIAL_PUBLISH_PASSKEY))) return send(401, { error: 'Incorrect passkey. Please try again.' });
      if (body.consent !== true || body.website) return send(400, { error: 'Please agree to publish your testimonial.' });
      let entry;
      try { entry = validateTestimonial(body); } catch (error) { return send(400, { error: error.message }); }
      // Content-derived IDs make retries safe, including after a lost success response.
      const id = hash(JSON.stringify(entry)).toString('hex');
      const testimonial = { ...entry, id, submittedAt: new Date().toISOString() };
      await command('HSETNX', 'portfolio:testimonials:v1', id, JSON.stringify(testimonial));
      const stored = await command('HGET', 'portfolio:testimonials:v1', id);
      return send(200, { testimonial: JSON.parse(stored) });
    } catch {
      return send(503, { error: 'Publication could not be confirmed. Retry the same testimonial safely.' });
    }
  };
}
