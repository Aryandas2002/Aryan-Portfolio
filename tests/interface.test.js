import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createServer } from 'vite';

let server, dom, root, App, createRoot;
before(async () => {
  dom = new JSDOM('<div id="root"></div>', { url: 'https://example.com/Aryan-Portfolio/', pretendToBeVisual: true });
  for (const key of ['window', 'document', 'HTMLElement', 'FormData', 'Event', 'MouseEvent', 'KeyboardEvent']) {
    globalThis[key] = dom.window[key];
  }
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  // Load ReactDOM only after the DOM exists, so it detects modern input events.
  ({ createRoot } = await import('react-dom/client'));
  globalThis.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
  window.matchMedia = () => ({ matches: false });
  globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window);
  globalThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
  // jsdom has no native dialog implementation. Test app state, not browser focus containment.
  dom.window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  dom.window.HTMLDialogElement.prototype.close = function () {
    if (!this.open) return;
    this.open = false;
    queueMicrotask(() => this.dispatchEvent(new Event('close')));
  };
  server = await createServer({ server: { middlewareMode: true, watch: null }, appType: 'custom' });
  App = (await server.ssrLoadModule('/src/App.jsx')).default;
});
after(async () => {
  if (root) await act(async () => root.unmount());
  await server?.close();
  dom?.window.close();
});

test('navigation retains native links and menu closes on selection and Escape', async () => {
  root = createRoot(document.getElementById('root'));
  await act(async () => root.render(React.createElement(React.StrictMode, null, React.createElement(App))));
  const toggle = document.querySelector('.menu-toggle');
  const work = document.querySelector('nav a[href="#work"]');
  await act(async () => toggle.click());
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  const click = new MouseEvent('click', { bubbles: true, cancelable: true });
  await act(async () => work.dispatchEvent(click));
  assert.equal(click.defaultPrevented, false);
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  await act(async () => toggle.click());
  await act(async () => toggle.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(document.activeElement, toggle);
  for (const anchor of document.querySelectorAll('a[href^="#"]')) {
    assert.ok(document.querySelector(anchor.getAttribute('href')), `Missing target for ${anchor.textContent}`);
  }
  assert.equal(document.querySelectorAll('nav a').length, 7); // Logo plus six destinations.
  assert.equal(document.querySelector('nav a[href$="resume.html"]').getAttribute('href'), '/Aryan-Portfolio/resume.html');
  assert.equal(document.querySelector('#testimonials'), null);
  assert.equal(document.querySelector('.project .arrow'), null);
  assert.ok(document.querySelector('#skills .logo-track'));
});

test('dialog survives StrictMode and reports service failure before allowing retry', async () => {
  const trigger = document.querySelector('.testimonial-cta button');
  await act(async () => trigger.click());
  assert.equal(document.querySelector('dialog').open, true);
  const form = document.querySelector('dialog form');
  for (const [name, value] of Object.entries({ name: 'Test', role: 'Engineer', company: 'Example', quote: 'A useful project.' })) {
    form.elements[name].value = value;
  }
  form.elements.consent.checked = true;
  globalThis.fetch = async () => ({ ok: false, status: 500 });
  await act(async () => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  assert.match(document.querySelector('[role="alert"]').textContent, /not accepted/);
  assert.equal(document.querySelector('fieldset').disabled, false);
  assert.equal(document.querySelector('.sent-block'), null);
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ ok: true }) });
  await act(async () => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  assert.match(document.querySelector('.sent-block').textContent, /Submitted for review/);
  assert.equal(document.querySelector('#testimonials'), null);
  await act(async () => document.querySelector('.sent-block button').click());
  assert.equal(document.querySelector('dialog'), null);
});

test('closing a pending dialog aborts the request without a stale success screen', async () => {
  await act(async () => document.querySelector('.testimonial-cta button').click());
  const form = document.querySelector('dialog form');
  for (const name of ['name', 'role', 'company', 'quote']) form.elements[name].value = 'Test';
  let requestSignal;
  globalThis.fetch = (_, { signal }) => new Promise((resolve, reject) => {
    requestSignal = signal;
    signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
  });
  await act(async () => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  assert.equal(document.querySelector('fieldset').disabled, true);
  await act(async () => document.querySelector('.modal-close').click());
  assert.equal(requestSignal.aborted, true);
  assert.equal(document.querySelector('dialog'), null);
});
