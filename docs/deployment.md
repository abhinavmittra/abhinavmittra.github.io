---
type: Project Guide
title: Static deployment
description: Hosting requirements for the portfolio export.
tags:
  - systems-desk
status: current
updated: 2026-10-27
---

# Deployment

Next.js builds static HTML, CSS and JavaScript into `out/`. The WebGL scenes run in visitors’ browsers, and feedback opens a local email draft. No server is required by the current routes. GitHub Pages can serve the export from a user site or custom domain.

GitHub Pages restricts sites primarily used to run an online business or facilitate commercial transactions. If A•WAKE becomes an active storefront, review the [Pages usage policy](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) and host commerce separately as appropriate. The current catalogue links to an external WhatsApp order handoff.

The app uses root-relative URLs. A project site hosted under `/repository-name/` needs a configured `basePath` plus checks for image, CSS, fetch and navigation paths. For a user site or custom domain, the root path is simpler. Check direct refreshes for `/`, `/cold-brew/` and `/travel/` on the chosen Pages setup before publishing.

This repository has a check-and-build workflow, not a publishing workflow. To deploy, configure GitHub Pages with a GitHub Actions workflow that uploads the `out/` directory after `npm ci`, `npm run check` and `npm run build`.

Sources: [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports), [GitHub Pages limits and policy](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits), [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
