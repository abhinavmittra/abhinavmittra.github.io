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

## URL and folders

The GitHub repository is `abhinavmittra.github.io`, which makes it a user site served at `https://abhinavmittra.github.io/`. The site uses the domain root; there is no repository-name prefix in its routes. The repository name is separate from the build output folder.

`npm run build` writes the static site to `out/`. `.next/` contains Next.js build and cache files. Both are generated and ignored by Git; only `out/` is uploaded to Pages. The WebGL scenes run in visitors’ browsers, and feedback opens a local email draft, so current routes need no application server.

The Pages workflow builds with no `basePath`, matching the user-site domain root. `sitePath()` supports a prefix if the app is later hosted under a project path; no prefix is set for this deployment. `trailingSlash: true` exports routes such as `/travel/index.html`, so direct route loads map to directory index files. The Pages build can be previewed with the regular `npm run preview` command.

## GitHub Actions setup

The workflow at `.github/workflows/pages.yml` runs checks and a static build for pull requests, and publishes on pushes to `main` or `migration/nextjs-typescript`. It uploads only `out/` as the Pages artifact. To enable publishing, open repository **Settings → Pages** and choose **GitHub Actions** as the build and deployment source. In **Settings → Environments → github-pages**, allow both `main` and `migration/nextjs-typescript` under deployment branches so the in-progress branch can deploy before its pull request is merged. No deploy token or secret is needed.

After merging the current branch into `main`, the `main` trigger keeps publishing from the default branch. The migration branch trigger is included so the current app can be published while the migration branch is active; remove that trigger after the branch is retired if desired.

## Custom domain and A•WAKE

A custom domain can replace the GitHub URL later. Configure it in repository settings and DNS; it can continue serving the site from the domain root without a `basePath`.

The coffee catalogue links to an external WhatsApp order handoff. GitHub Pages restricts sites primarily used to run an online business or facilitate commercial transactions; review the [Pages usage policy](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) if A•WAKE becomes an active storefront.

Sources: [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports), [GitHub Pages limits and policy](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits), [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
