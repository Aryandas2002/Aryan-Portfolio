# Passkey publishing — draft for review

Based on main commit 4a8bc425b6f7f1efb5c9df4f11d631f6d5994a6b. Prepared as a draft PR; not approved for merge or deployment.

The form asks for a shared publishing password (not a WebAuthn/device passkey). On success the new card appears immediately. New visits read published entries from the API. The five existing testimonials remain in source and continue displaying if the API is unavailable.

Proposed backend: Vercel Node API with Upstash Redis for persistent testimonial records and rate limiting. This replaces JSONBin; it does not recover or reuse the old exposed key. Concurrent writes use HSETNX per content-derived ID, preserving separate records and avoiding duplicate retries.

## Required activation configuration

- Provision a Vercel backend and durable Upstash Redis database after approval. api/testimonials.js is the endpoint; server/ and src/submitTestimonial.js must be included.
- Configure server-only UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, TESTIMONIAL_PUBLISH_PASSKEY (random, at least 20 characters), TESTIMONIAL_ALLOWED_ORIGINS=https://aryandas2002.github.io.
- Configure the GitHub repository variable VITE_TESTIMONIAL_API_URL to the deployed HTTPS /api/testimonials endpoint. This URL is public. Never put the passkey or Redis token into VITE variables.
- Verify the old JSONBin master key was revoked, as documented in the existing repository README.
- Deploy/test the backend first, then approve the frontend commit/deployment. GitHub Pages alone cannot run the API.

The API limits attempts to 10 per trusted Vercel client IP per 15 minutes, validates fields and consent, and returns no credentials. All submissions with a valid shared passkey publish immediately. The owner controls access by sharing/rotating the password. No password is embedded in the frontend or persisted in browser storage.

## Verification

Seven isolated API/client tests pass using mocked storage; no real testimonials were submitted. Browser and production service verification remain required after configuration. npm ci --offline failed because dependencies are not cached, so a build against the exact locked dependencies was not verified in this environment.

## Approval boundary

Draft only. Hosting and database are not provisioned. No secrets configured, GitHub variables changed, or deployments triggered. This PR contains implementation only.
