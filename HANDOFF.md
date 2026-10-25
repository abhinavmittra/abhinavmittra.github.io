# Systems Desk coding handoff

This package preserves the first approved interactive draft. The visual baseline was deployed from commit 85774e0232b672cd199a07a3eb0ee932a4b23737. This handoff adds centralized copy, local development commands, and documentation while preserving the layout and scene.

Current hosted draft: https://abhinav-systems-desk-3d.frenfact.chatgpt.site

## Open in VS Code

Install Node.js 24 LTS. Extract the source ZIP and open the extracted project folder in VS Code. In the integrated terminal run:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4173. The server serves dist directly; refresh after editing. There is no hot reload in this draft. Stop it with Ctrl+C. `npm run check` checks application, content and dev server syntax.

The included vendor assets mean the page itself does not require a CDN. Do not open index.html using file:// because JavaScript modules require an HTTP server.

## Editing map

| Change | File or symbol |
| --- | --- |
| Name, role, employer, city, headline, metrics and contact links | dist/content.js profile |
| Project titles, description, contribution, tags, workflow steps and tour content | dist/content.js projects |
| Compact labels on the scene and project dock | dist/content.js stationCopy |
| Navigation and generic control wording | dist/index.html |
| Fonts, spacing, responsive layout and panel styles | dist/style.css |
| Scene palette | dist/app.js themes |
| Object locations and label anchors | dist/app.js positions and labelAnchors |
| 3D shapes and object materials | dist/app.js createScene |
| Camera movements, animation and controls | dist/app.js fly, focus and frame |

The copy module updates the main profile and project surfaces. Some longer journey/contact prose and HTML fallback text still live in app.js and index.html. The next migration should make all business copy structured content.

## Recommended next stack

Use Next.js with TypeScript, the existing Three.js scene, Supabase Postgres/Auth, and Vercel hosting. Next.js is already familiar from the Finance Discovery Workbench. Begin by wrapping the current scene in a client component; a React Three Fiber rewrite is optional and should be a separate decision after visual parity.

Suggested migration structure:

```text
app/page.tsx
app/admin/page.tsx
components/workspace/Workspace.tsx
components/workspace/scene.ts
components/workspace/ProjectPanel.tsx
components/workspace/Customizer.tsx
content/portfolio.ts
lib/supabase/client.ts
lib/supabase/server.ts
supabase/migrations/
public/resume.pdf
```

Keep the WebGL scene browser only. Mount it in a client component with a canvas ref, then clean up its frame callback, controls, event listeners, observer, renderer, materials, geometries and textures when the component unmounts. Preserve the software rendering path and reduced motion behavior. Server components can render profile text and load published content.

## Persistence plan

Today, Save this look writes only to localStorage in the current browser. The JSON export is a file, not a database backup or a cloud save. Project copy lives in source control.

Start with two Supabase tables:

| Table | Contents | Access |
| --- | --- | --- |
| site_settings | Profile copy, public contact links and the owner's published default theme/camera settings in structured JSON | Visitors read published fields; only the owner edits |
| projects | Stable slug, title, short label, status, description, contribution, tags, workflow steps, display order and published flag | Visitors read published records; only the owner edits |

Add a private admin page protected by Supabase Auth. Enable Row Level Security and restrict write policies to the actual owner identity, not all authenticated users. Grant anonymous visitors only the published content they need to read. Keep privileged keys on the server. Render database content as text or validated structured rich text; do not trust arbitrary HTML.

Keep a visitor's temporary orbit and camera movement in memory. Keep personal visitor appearance choices in localStorage unless cross device preferences are explicitly needed. Persist the owner's shared default look only on Save, not on each animation frame. Add a preferences table later if authenticated cross device saves become a real requirement.

A contact table is unnecessary while contact uses mailto. No database project, hosting account, credential, or paid service has been created as part of this handoff.

## Suggested sequence

1. Run this draft locally and commit the imported source to your own GitHub repository.
2. Make one small text change in content.js, inspect it in the browser and commit it.
3. Migrate to Next.js and TypeScript on a separate branch while preserving visual and behavioral parity.
4. Add Supabase content persistence and the owner admin page.
5. Connect the repository to Vercel, configure environment values and a custom domain, then decide when to make the portfolio public.

## First Codex task in VS Code

Ask Codex:

> Read AGENTS.md, README.md and HANDOFF.md. Explain how the current app loads content and creates the 3D scene. Run npm run check and start npm run dev. Make my requested copy changes in dist/content.js, preserving the scene, layout and interactions. Show the changed files and verification results.

For the migration, use a separate task:

> Create a branch for a Next.js App Router and TypeScript migration. Preserve the current approved visual draft and every existing interaction. Keep the Three.js scene and its software compatibility path; do not rewrite it in React Three Fiber yet. Extract typed content records and isolate scene initialization from UI state. Implement proper scene lifecycle cleanup. Establish visual and behavioral parity before adding Supabase. Keep all sample workflows clearly illustrative and both AI projects marked in progress.

## Verification limits and known follow ups

- Handoff checks passed for JavaScript syntax, exact parity of all four extracted project records, and startup through the local dev command. Refreshed browser QA of the content refactor was blocked by the browser session policy; it was not replaced with another browser surface.
- The QA browser has WebGL disabled. Software geometry rendering and UI flows were checked; review hardware lighting/shadows on a WebGL capable browser.
- Review touch layout on your own phone and tablet before public launch.
- Current geometry is procedural. There is no editable Blender scene or external GLB source asset yet.
- The résumé remains a draft with bracketed performance placeholders. Validate those before making it public.
- The scene and UI still share one app module. The Next.js migration should separate content, scene lifecycle, UI state, and workflow demos.

## Official references checked on 25 October 2026

- Codex IDE: https://learn.chatgpt.com/docs/codex/ide
- Project guidance: https://learn.chatgpt.com/docs/agent-configuration/agents-md
- Next.js client/server boundaries: https://nextjs.org/docs/app/getting-started/server-and-client-components
- Supabase with Next.js: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Next.js on Vercel: https://vercel.com/docs/frameworks/full-stack/nextjs
