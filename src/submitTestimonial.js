const ENDPOINT = 'https://formspree.io/f/xqevqyqq';

export function validateTestimonial(values) {
  const limits = { name: 100, role: 150, company: 150, quote: 2000 };
  const entry = {};
  for (const [field, limit] of Object.entries(limits)) {
    const value = typeof values[field] === 'string' ? values[field].trim() : '';
    if (!value || value.length > limit) {
      throw new Error(`Please enter ${field === 'quote' ? 'a testimonial' : 'your ' + field} (up to ${limit} characters).`);
    }
    entry[field] = value;
  }
  return entry;
}

// Formspree receives private review requests. This function never publishes quotes.
export async function submitTestimonial(values, { signal, fetchImpl = fetch } = {}) {
  const entry = validateTestimonial(values);
  const response = await fetchImpl(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    signal,
    body: JSON.stringify({ ...entry, _subject: `Testimonial for review: ${entry.name}` }),
  });
  if (!response.ok) {
    throw new Error(response.status === 429
      ? 'Too many requests. Please wait before trying again.'
      : 'Your submission was not accepted. Please try again or email Aryan.');
  }
  const result = await response.json();
  if (result.errors || result.ok === false) {
    throw new Error('Your submission was not accepted. Please try again or email Aryan.');
  }
}
