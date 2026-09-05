import test from 'node:test';
import assert from 'node:assert/strict';
import { submitTestimonial } from '../src/submitTestimonial.js';

const entry = { name: ' Test Author ', role: ' Engineer ', company: ' Example ', quote: ' We built a useful tool. ' };

test('submits one private review request and strips whitespace', async () => {
  const requests = [];
  await submitTestimonial(entry, { fetchImpl: async (...args) => {
    requests.push(args);
    return { ok: true, json: async () => ({ ok: true }) };
  } });
  assert.equal(requests.length, 1);
  const [url, options] = requests[0];
  assert.equal(new URL(url).hostname, 'formspree.io');
  assert.equal(options.method, 'POST');
  assert.equal(JSON.parse(options.body).name, 'Test Author');
  assert.equal(options.headers['X-Master-Key'], undefined);
});

test('rejects blank and oversized fields without making a request', async () => {
  let requests = 0;
  const fetchImpl = async () => { requests++; };
  await assert.rejects(submitTestimonial({ ...entry, name: '   ' }, { fetchImpl }), /name/);
  await assert.rejects(submitTestimonial({ ...entry, quote: 'x'.repeat(2001) }, { fetchImpl }), /testimonial/);
  assert.equal(requests, 0);
});

test('rejects service failures, rate limits, and malformed responses', async () => {
  for (const status of [400, 429, 500]) {
    await assert.rejects(submitTestimonial(entry, { fetchImpl: async () => ({ ok: false, status }) }));
  }
  await assert.rejects(submitTestimonial(entry, { fetchImpl: async () => ({ ok: true, json: async () => ({ errors: ['rejected'] }) }) }));
  await assert.rejects(submitTestimonial(entry, { fetchImpl: async () => ({ ok: true, json: async () => { throw new Error('Invalid JSON'); } }) }));
});

test('independent simultaneous submissions never replace a shared list', async () => {
  const requests = [];
  const fetchImpl = async (url, options) => {
    requests.push(JSON.parse(options.body));
    return { ok: true, json: async () => ({ ok: true }) };
  };
  await Promise.all([
    submitTestimonial({ ...entry, name: 'First' }, { fetchImpl }),
    submitTestimonial({ ...entry, name: 'Second' }, { fetchImpl }),
  ]);
  assert.deepEqual(requests.map((request) => request.name).sort(), ['First', 'Second']);
  assert.ok(requests.every((request) => !('testimonials' in request)));
});

test('forwards cancellation and does not swallow network errors', async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(submitTestimonial(entry, { signal: controller.signal, fetchImpl: async (_, { signal }) => {
    assert.equal(signal, controller.signal);
    signal.throwIfAborted();
  } }), { name: 'AbortError' });
});
