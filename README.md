# Abhinav Mittra Systems Desk

Interactive portfolio prototype built with Three.js and local static assets.

Version 0.1.0 is the approved visual draft. See HANDOFF.md for the VS Code workflow, editing map, and the planned Next.js / TypeScript / Supabase migration.

## Run locally

Use Node.js 24 LTS. Open the project folder in VS Code, then run:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4173. Refresh the browser after an edit. Run `npm run check` for JavaScript syntax validation. No credentials are required to run the current static draft.

## Features

- Four procedural 3D stations, orbit/pan/zoom, selectable geometry and accessible HTML project labels.
- Guided camera tour, animated data paths, incident feedback loop, floating layers and arrival animation.
- Studio, dusk and daylight palettes; accent, light, speed and layer controls; local settings save and JSON export.
- Project panels with illustrative workflow demos, including an explicit human review step.
- WebGL rendering when available, with a Three.js SVG geometry renderer for compatibility when WebGL is disabled.
- Responsive layout and reduced motion settings.

## Customize

Common profile copy, project records, and compact station labels are in `dist/content.js`. Scene settings remain in `dist/app.js`, particularly `themes`, `positions`, and `labelAnchors`. UI styling is in `dist/style.css`. All scene geometry is procedural and editable; no generated image is used as a fake 3D background.

The settings export is a JSON description of the current look. Saved settings remain in the visitor's browser. Example workflows use fictional data and do not connect to Cisco systems. The résumé attachment is a draft with bracketed metrics to validate.

The downloadable handoff ZIP excludes Git internals, dependency installs, credentials, and Sites hosting identity. Import it into your own GitHub repository for local development. Local changes do not automatically update the current Sites draft.

## Dependencies

Three.js 0.186.1 is pinned in package-lock.json and copied into dist/vendor for consistent runtime loading. There is no client CDN requirement. Three.js is MIT licensed; its license is included in dist/vendor.

## Verification

JavaScript syntax checked with Node. The handoff preserves all four original project records exactly and starts through the new local dev command. Browser checks of the original visual baseline covered the software-rendered scene, project selection, camera tour, customization and persisted preferences, and the finance demo's review step. Refreshed browser QA of the content refactor was blocked by the browser session policy. The QA browser also has WebGL disabled, so hardware lighting and shadows must be reviewed on a browser with WebGL support.
