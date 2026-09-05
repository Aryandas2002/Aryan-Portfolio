# Aryan Das — Portfolio

Personal portfolio site. Minimal, editorial.

**Live:** [aryandas2002.github.io/Aryan-Portfolio](https://aryandas2002.github.io/Aryan-Portfolio/)
**Source:** [github.com/Aryandas2002/Aryan-Portfolio](https://github.com/Aryandas2002/Aryan-Portfolio)

## Stack
- **React 18** + **Vite**
- Vanilla CSS (no Tailwind), Fraunces + Inter via Google Fonts
- Deployed via GitHub Actions to GitHub Pages on every push to `main`

## Local development
```bash
npm install
npm run dev      # start dev server on http://localhost:5173
npm run build    # build to ./dist
npm run preview  # preview the production build
npm test         # submission and interface regression tests (no external writes)
```

## Structure
- `src/App.jsx` — page sections and responsive navigation
- `src/TestimonialDialog.jsx` — accessible native dialog for private review submissions
- `src/submitTestimonial.js` — validated submission to the existing Formspree form
- `src/testimonials.js` — manually reviewed public testimonials
- `src/index.css` — all styles
- `src/tools.js` — brand SVGs for the Tools marquee
- `src/companies.js` — Ultrahuman / Atlys logo data URIs
- `public/resume.html` — ATS-friendly résumé (print to PDF from the browser)
- `public/atlys.png`, `public/ultrahuman.png` — also available as static assets

## Deployment
Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds with Vite and publishes `./dist` to GitHub Pages.

Pull requests run tests and a production build. Deployment also runs tests before publishing.

## Testimonial review and credential rotation

The old frontend exposed a JSONBin master key and used it to replace public testimonials. Revoke that key in JSONBin and check the account's records and access history. Removing the key from the current source does not invalidate copies in Git history, old deployments, or browser caches. Never put a replacement storage key into client code or a Vite environment variable.

Submissions now go only to the existing Formspree endpoint for private review. Confirm that form is active in the owner's Formspree dashboard and configure its spam protection. The UI reports acceptance only after a successful service response; it does not claim confirmed inbox delivery. No real submissions are made by the automated tests.

Existing JSONBin records are untouched. Review them and confirm the author's permission before migrating genuine quotes into `APPROVED_TESTIMONIALS` in `src/testimonials.js`. Each approved entry needs a stable `id`, `quote`, `name`, `role`, and `company`. Commit reviewed entries through the usual pull request workflow. The public section stays hidden until at least one approved quote exists; sample quotes are never displayed.

The résumé link opens the printable HTML résumé. Its print button opens the browser's print dialog, where visitors can choose Save as PDF.

Interface tests use jsdom with a minimal dialog shim. They cover app state, menu handlers, request failures, retries, and cancellation, but do not replace real-browser checks of mobile layout, Escape behavior, focus containment, and focus restoration.
