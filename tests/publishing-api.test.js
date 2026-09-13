import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHandler } from '../server/testimonials.js';
const env = { UPSTASH_REDIS_REST_URL: 'https://redis.example', UPSTASH_REDIS_REST_TOKEN: 'test-only', TESTIMONIAL_PUBLISH_PASSKEY: 'test-only-passkey-at-least-20', TESTIMONIAL_ALLOWED_ORIGINS: 'https://aryandas2002.github.io' };
const body = { name: 'Test', role: 'Engineer', company: 'Example', quote: 'Helpful work.', passkey: env.TESTIMONIAL_PUBLISH_PASSKEY, consent: true };
function setup({ unavailable = false } = {}) {
  let attempts = 0;
  const records = new Map();
  const handler = createHandler({ env, fetchImpl: async (_, options) => {
    const [cmd, ...args] = JSON.parse(options.body);
    if (unavailable) throw Error('offline');
    let result;
    if (cmd === 'EVAL') result = ++attempts;
    if (cmd === 'HSETNX') { if (!records.has(args[1])) records.set(args[1], args[2]); result = 1; }
    if (cmd === 'HGET') result = records.get(args[1]);
    if (cmd === 'HVALS') result = [...records.values()];
    return { ok: true, json: async () => ({ result }) };
  }});
  const request = async (data = body, method = 'POST', origin = 'https://aryandas2002.github.io') => {
    const response = { headers: {}, setHeader(k,v) { this.headers[k] = v; }, status(s) { this.code = s; return this; }, json(v) { this.body = v; return this; }, end() { return this; } };
    await handler({ method, body: data, headers: { origin, 'content-type': 'application/json' }, socket: { remoteAddress: '127.0.0.1' } }, response);
    return response;
  };
  return { request, records };
}
test('bad passkeys and missing consent cannot write', async () => {
  const { request, records } = setup();
  assert.equal((await request({ ...body, passkey: 'wrong' })).code, 401);
  assert.equal((await request({ ...body, consent: false })).code, 400);
  assert.equal(records.size, 0);
});
test('publication survives refresh and retries without duplicate records or secrets', async () => {
  const { request, records } = setup();
  const first = await request(); const retry = await request();
  assert.equal(first.code, 200); assert.deepEqual(retry.body, first.body);
  const read = await request(null, 'GET');
  assert.equal(records.size, 1); assert.deepEqual(read.body.testimonials, [first.body.testimonial]);
  assert.ok(!JSON.stringify(read.body).includes(env.TESTIMONIAL_PUBLISH_PASSKEY));
});
test('disallowed origin, invalid fields and excessive attempts fail closed', async () => {
  const { request, records } = setup();
  assert.equal((await request(body, 'POST', 'https://evil.example')).code, 403);
  assert.equal((await request({ ...body, quote: 'x'.repeat(2001) })).code, 400);
  for (let i = 0; i < 10; i++) await request({ ...body, passkey: 'wrong' });
  assert.equal((await request()).code, 429); assert.equal(records.size, 0);
});
test('storage outages never claim successful publication', async () => {
  assert.equal((await setup({ unavailable: true }).request()).code, 503);
});
