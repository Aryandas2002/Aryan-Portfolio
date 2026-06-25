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
```

## Structure
- `src/App.jsx` — the entire single-page app (one component, all sections inline)
- `src/index.css` — all styles
- `src/tools.js` — brand SVGs for the Tools marquee
- `src/companies.js` — Ultrahuman / Atlys logo data URIs
- `public/resume.html` — ATS-friendly résumé (print to PDF from the browser)
- `public/atlys.png`, `public/ultrahuman.png` — also available as static assets

## Deployment
Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds with Vite and publishes `./dist` to GitHub Pages.
