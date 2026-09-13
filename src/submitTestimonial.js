export const TESTIMONIAL_ENDPOINT = import.meta.env?.VITE_TESTIMONIAL_API_URL || '';

export function validateTestimonial(values) {
  const limits = { name: 100, role: 150, company: 150, quote: 2000 };
  const entry = {};
  for (const [field, limit] of Object.entries(limits)) {
    const value = typeof values[field] === 'string' ? values[field].trim() : '';
    if (!value || value.length > limit) throw new Error(`Please enter ${field === 'quote' ? 'a testimonial' : 'your ' + field} (up to ${limit} characters).`);
    entry[field] = value;
  }
  return entry;
}

export async function submitTestimonial(values, { signal, fetchImpl = fetch, endpoint = TESTIMONIAL_ENDPOINT } = {}) {
  const entry = validateTestimonial(values);
  if (!endpoint.startsWith('https://')) throw new Error('Publishing is not configured yet. Please try again later.');
  if (!values.passkey) throw new Error('Please enter the publishing passkey.');
  if (!values.consent) throw new Error('Please agree to publish your testimonial.');
  const response = await fetchImpl(endpoint, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, signal,
    body: JSON.stringify({ ...entry, passkey: values.passkey, consent: true, website: values.website || '' }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Publication could not be confirmed. Please try again.');
  if (!result.testimonial?.id) throw new Error('Publication could not be confirmed. Please try again.');
  return { ...validateTestimonial(result.testimonial), id: result.testimonial.id };
}

export async function loadTestimonials({ signal, fetchImpl = fetch, endpoint = TESTIMONIAL_ENDPOINT } = {}) {
  if (!endpoint.startsWith('https://')) return [];
  const response = await fetchImpl(endpoint, { signal, cache: 'no-store' });
  if (!response.ok) throw new Error('Testimonials unavailable');
  const result = await response.json();
  if (!Array.isArray(result.testimonials)) throw new Error('Invalid testimonials');
  return result.testimonials.filter(t => typeof t?.id === 'string').map(t => ({ ...validateTestimonial(t), id: t.id }));
}
