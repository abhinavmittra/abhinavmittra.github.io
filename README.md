# Abhinav Mittra Systems Desk

Interactive portfolio prototype built with Next.js, TypeScript, React, and Three.js.

Version 0.1.0 is the approved visual draft and remains the visual baseline. The current migration preserves its composition and interactions while moving the page markup into React, adding typed portfolio content, and bundling the Three.js runtime through Next.js. The production build is a static export. See HANDOFF.md for migration boundaries and hosting research.

## Run locally

Use Node.js 24 LTS. Open the project folder in VS Code, then run:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4173. Run `npm run check` for TypeScript and JavaScript checks. `npm run build` generates the static site in `out/`; `npm run preview` serves that export at http://127.0.0.1:4174. No credentials are required.

## Features

- Four procedural 3D stations, orbit/pan/zoom, selectable geometry, and accessible HTML project labels.
- Guided camera tour, animated data paths, incident feedback loop, floating layers and arrival animation.
- Studio, dusk and daylight palettes; accent, light, speed and layer controls; local settings save and JSON export.
- Project panels with illustrative workflow demos, including an explicit human review step.
- WebGL rendering when available, with a Three.js SVG geometry renderer for compatibility when WebGL is disabled.
- Responsive layout and reduced motion settings.

## Customize

Typed profile copy, project records, and station labels are in `content/portfolio.ts`. React-rendered workspace markup is in `components/workspace/WorkspaceMarkup.tsx`; the active scene runtime and its typed boundary are in `components/workspace/sceneRuntime.js` and `components/workspace/scene.ts`. App-wide styling is in `app/globals.css`. The original static reference, including its source CSS and Three.js vendor files, remains under `public/legacy/`. Scene geometry is procedural; no generated image is used as a fake 3D background.

The settings export is a JSON description of the current look. Saved settings remain in the visitor's browser. Example workflows use fictional data and do not connect to Cisco systems. The résumé attachment is a draft with bracketed metrics to validate.

The original static app is available at `/legacy/index.html` as a reference. To run that reference independently, use `PORT=4174 npm run dev:legacy` and open http://127.0.0.1:4174. Local changes do not automatically update any hosted draft.

## Automated checks and hosting

VS Code tasks provide **Start Systems Desk**, **Check app**, **Build static site**, and **Preview static site**. GitHub Actions runs the type/syntax checks and static build on pushes and pull requests to `main` and `migration/nextjs-typescript`. It requires no secrets. This local repository does not yet have a GitHub remote, so CI and hosting are not active. When you are ready, connect a remote and Cloudflare Pages for automatic deploys and pull-request previews.

The app currently needs no server or database, so it is configured for Next.js static export. Recommended free host: Cloudflare Pages, using `npm run build` and `out` as the output directory. Its documented free limits include 500 builds/month, 20-minute build timeout, up to 20,000 files, and 25 MiB per asset. A future admin/API/database feature would change the hosting requirements and should be evaluated separately.

Vercel Hobby is a convenient fallback for a strictly personal, non-commercial site; its plan terms restrict Hobby use to personal, non-commercial projects. GitHub Pages is another static option, but has a public-site expectation for GitHub Free and is not intended for business/commercial hosting.

## Dependencies

Next.js, React, TypeScript, and Three.js are locked in package-lock.json. The supplied Three.js 0.186.1 vendor files remain available locally under `public/legacy/vendor`; there is no client CDN requirement. Three.js is MIT licensed; its license is included with those files.

## Verification

The current migration passed `npm run check` and `npm run build`. Browser QA verified the WebGL canvas in development and static preview, project opening, tour progression, theme and reduced-motion controls, and desktop/mobile layouts without horizontal overflow. The SVG compatibility renderer is retained but has not yet been forced in browser QA; review touch layout on a physical device before launch.
