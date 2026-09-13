import { test } from 'node:test';
import assert from 'node:assert/strict';
import { submitTestimonial, loadTestimonials } from '../src/submitTestimonial.js';
const values = { name: 'Test', role: 'Engineer', company: 'Example', quote: 'Helpful.', passkey: 'test-password', consent: 'on' };
const endpoint = 'https://api.example/testimonials';
test('does not publish without a configured API or consent', async () => {
  const fetchImpl = () => { throw Error('must not call'); };
  await assert.rejects(submitTestimonial(values, { endpoint: '', fetchImpl }), /not configured/);
  await assert.rejects(submitTestimonial({ ...values, consent: false }, { endpoint, fetchImpl }), /agree/);
});
test('rejects a bad passkey and false success responses', async () => {
  await assert.rejects(submitTestimonial(values, { endpoint, fetchImpl: async () => ({ ok: false, json: async () => ({ error: 'Incorrect passkey.' }) }) }), /Incorrect passkey/);
  await assert.rejects(submitTestimonial(values, { endpoint, fetchImpl: async () => ({ ok: true, json: async () => ({ ok: true }) }) }), /could not be confirmed/);
});
test('successful publication returns public fields only and reload retrieves it', async () => {
  const testimonial = { id: 'record', name: 'Test', role: 'Engineer', company: 'Example', quote: 'Helpful.' };
  const result = await submitTestimonial(values, { endpoint, fetchImpl: async (_, options) => {
    assert.equal(JSON.parse(options.body).consent, true);
    return { ok: true, json: async () => ({ testimonial }) };
  }});
  assert.deepEqual(result, testimonial);
  assert.deepEqual(await loadTestimonials({ endpoint, fetchImpl: async () => ({ ok: true, json: async () => ({ testimonials: [testimonial] }) }) }), [testimonial]);
});
