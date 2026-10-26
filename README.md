# Systems Desk

An interactive portfolio with a Three.js desk, engineering projects, A•WAKE cold brew and a travel atlas. Built with Next.js App Router, React, TypeScript, React Three Fiber, Drei and Tailwind CSS.

## Run locally

Requires Node.js 24 or newer.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4173. `npm run check` runs the project checks, `npm run build` creates the static export in `out/`, and `npm run preview` serves that export at http://127.0.0.1:4174.

## Routes

- `/` — interactive engineering portfolio, project stories and AI notebook.
- `/cold-brew/` — A•WAKE catalogue and coffee guide.
- `/travel/` — interactive globe and visited-country list.

## Project structure

- `app/` — Next.js routes and global styles.
- `components/experience/` — home interface, panels, preferences and R3F scene adapter.
- `components/three/` — desk, clock, bottle and other procedural 3D models.
- `components/cold-brew/` — A•WAKE scene and product interface.
- `components/travel/` — travel atlas, globe and map rendering.
- `content/` — canonical portfolio, product, appearance, travel and roadmap data.
- `reference/geography/` — Natural Earth source data and provenance for the generated map.
- `public/` — artwork, icons, flags, résumé and generated map data.
- `docs/` — architecture, performance, deployment and source notes. Maintained documents follow OKF v0.2.

Edit content in `content/` and preserve one canonical record per project. The work proposals are not claims of shipped features. Fictional workflows are labelled in the project stories.

## Contributing and deployment

See [Contributing](CONTRIBUTING.md), the [documentation index](docs/index.md), and [deployment notes](docs/deployment.md). The app builds as a static export; GitHub Pages can serve it from a user site or custom domain.

The project code is MIT licensed. The A•WAKE artwork, personal résumé and third-party assets have separate terms described in [NOTICE](NOTICE.md).
