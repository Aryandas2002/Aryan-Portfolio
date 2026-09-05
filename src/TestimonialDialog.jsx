import { useEffect, useRef, useState } from 'react';
import { submitTestimonial } from './submitTestimonial.js';

export default function TestimonialDialog({ onClose }) {
  const dialogRef = useRef(null);
  const requestRef = useRef(null);
  const errorRef = useRef(null);
  const successRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => {
      requestRef.current?.abort();
      dialog.close();
    };
  }, []);

  useEffect(() => {
    if (error) errorRef.current?.focus();
    if (sent) successRef.current?.focus();
  }, [error, sent]);

  const close = () => dialogRef.current.close();

  const onSubmit = async (event) => {
    event.preventDefault();
    if (requestRef.current) return;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (values.website) return; // Honeypot; configure service-side spam protection too.
    const controller = new AbortController();
    requestRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 15000);
    setSubmitting(true);
    setError('');
    try {
      await submitTestimonial(values, { signal: controller.signal });
      if (dialogRef.current?.open) setSent(true);
    } catch (failure) {
      if (dialogRef.current?.open) {
        setError(controller.signal.aborted
          ? 'The request timed out. Delivery could not be confirmed. Please email Aryan if you are unsure.'
          : failure.message || 'Delivery could not be confirmed. Please try again or email Aryan.');
      }
    } finally {
      clearTimeout(timeout);
      requestRef.current = null;
      if (dialogRef.current?.open) setSubmitting(false);
    }
  };

  return (
    <dialog ref={dialogRef} className="modal" aria-labelledby="testimonial-title"
      aria-describedby="testimonial-description" onClose={() => {
        // Ignore a queued close event if StrictMode has already reopened it.
        if (!dialogRef.current?.open) onClose();
      }}>
      <button type="button" className="modal-close" onClick={close} aria-label="Close testimonial form">×</button>
      {sent ? (
        <div className="sent-block">
          <h3 id="testimonial-title" ref={successRef} tabIndex={-1}>Submitted for review</h3>
          <p id="testimonial-description">Thank you. Your submission was accepted for review. It will appear on the site only if approved.</p>
          <button type="button" className="btn primary" onClick={close}>Done</button>
        </div>
      ) : (
        <form onSubmit={onSubmit} aria-busy={submitting}>
          <h3 id="testimonial-title">Share a testimonial</h3>
          <p id="testimonial-description">Tell me what we built or fixed together. Your submission is private until reviewed. If approved, your quote, name, role, and company will appear on this site.</p>
          <fieldset disabled={submitting}>
            <label htmlFor="testimonial-name">Your name</label>
            <input id="testimonial-name" name="name" autoComplete="name" maxLength={100} required autoFocus />
            <label htmlFor="testimonial-role">Your role</label>
            <input id="testimonial-role" name="role" autoComplete="organization-title" maxLength={150} required />
            <label htmlFor="testimonial-company">Company</label>
            <input id="testimonial-company" name="company" autoComplete="organization" maxLength={150} required />
            <label htmlFor="testimonial-quote">What did we build or fix together?</label>
            <textarea id="testimonial-quote" name="quote" rows={4} maxLength={2000} required />
            <div className="form-honeypot" aria-hidden="true">
              <label htmlFor="testimonial-website">Leave this empty</label>
              <input id="testimonial-website" name="website" tabIndex={-1} autoComplete="off" />
            </div>
            <label className="consent"><input type="checkbox" name="consent" required />
              <span>I agree to publication with my name, role, and company if approved.</span>
            </label>
            <button type="submit" className="btn primary">{submitting ? 'Submitting…' : 'Submit for review'}</button>
          </fieldset>
          {error && <p className="form-err" role="alert" ref={errorRef} tabIndex={-1}>{error}</p>}
          <p className="form-contact">You can also <a href="mailto:aryandaspvt@gmail.com">email Aryan</a>.</p>
        </form>
      )}
    </dialog>
  );
}
