# Systems Desk coding handoff

The approved static draft is being migrated to Next.js App Router, React, and TypeScript on branch `migration/nextjs-typescript`, based on baseline commit `c0ef835`. The active page renders React markup, uses typed source content, bundles Three.js from npm, and exports statically. The original markup and scene remain under `public/legacy/` for reference. The local repository has no Git remote; CI hosting, site deployment, and Supabase remain future work.

Current hosted draft: https://abhinav-systems-desk-3d.frenfact.chatgpt.site

## Open in VS Code

Install Node.js 24 LTS and open the project folder in VS Code. In the integrated terminal run:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4173. Next.js serves the App Router page with hot reload. Stop it with Ctrl+C. `npm run check` runs the TypeScript check plus syntax checks; `npm run build` creates the static export in `out/`. No credentials or environment variables are needed.

To compare the original static reference independently, run `PORT=4174 npm run dev:legacy` and open http://127.0.0.1:4174.

The included vendor assets mean the page itself does not require a CDN. Do not open index.html using file:// because JavaScript modules require an HTTP server.

## Editing map

| Change | File or symbol |
| --- | --- |
| Name, role, employer, city, headline, metrics and contact links | content/portfolio.ts profile |
| Project titles, description, contribution, tags, workflow steps and tour content | content/portfolio.ts projects |
| Compact labels on the scene and project dock | content/portfolio.ts stationCopy |
| App Router metadata and global styles | app/layout.tsx and app/globals.css |
| Server-rendered workspace markup | components/workspace/WorkspaceMarkup.tsx |
| Client-side scene mount and teardown boundary | components/workspace/Workspace.tsx and components/workspace/scene.ts |
| Scene palette, object locations, geometry and controls | components/workspace/sceneRuntime.js |
| Preserved original static reference and upstream Three.js vendor files | public/legacy/ |

The page passes server-rendered React children into the client workspace. Its effect initializes the bundled Three.js scene and returns cleanup for the animation frame, resize observer, controls, timers, listeners, renderer and scene resources. The scene runtime remains JavaScript behind a typed TypeScript initializer. Project details, tour, and customization still use imperative DOM updates; continue replacing those with React state without changing behavior.

## Recommended next stack

Use Next.js with TypeScript and the existing Three.js scene. The current route is configured for static export and requires no backend. For the existing static app, Cloudflare Pages Free is the recommended future host; use its Next.js static export preset, build command `npm run build`, and output directory `out`. Cloudflare documents Git-backed automatic deployments and pull-request previews.

Vercel Hobby is a convenient alternative only for personal, non-commercial use. If server-side features become necessary, revisit the architecture and provider before adding Supabase or an admin route. Do not add paid services or credentials as part of local iteration.

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

1. Convert project detail panels, tour and customization interactions from imperative DOM writes to React state, preserving exact behavior.
2. Finish migrating the scene runtime from JavaScript into fully typed modules.
3. Reverify WebGL and SVG fallback, tour, project opening, appearance controls, reduced motion, and desktop/mobile layout.
4. Add Supabase content persistence and an owner admin page only if source-controlled edits stop being convenient; that requires moving away from a static-only export.
5. Push to a GitHub repository and connect Cloudflare Pages when the owner is ready to host.

## First Codex task in VS Code

Ask Codex:

> Read AGENTS.md, README.md and HANDOFF.md. Explain how the Next.js route mounts the current workspace and how typed content reaches the scene. Run npm run check and start npm run dev. Make my requested copy changes in content/portfolio.ts, preserving the scene, layout and interactions. Show the changed files and verification results.

Continue the migration on the existing `migration/nextjs-typescript` branch:

> Continue migrating the workspace UI from imperative DOM updates to React components and state. Preserve the current approved visual draft and every existing interaction. Keep the WebGL scene and software compatibility renderer; do not rewrite it in React Three Fiber yet. Keep content records in content/portfolio.ts, isolate scene initialization from UI state, and preserve full lifecycle cleanup. Establish visual and behavioral parity before adding Supabase. Keep sample workflows illustrative and both AI projects marked in progress.

## Verification limits and known follow ups

- `npm run check` and `npm run build` pass. Browser QA verified the WebGL canvas in both development and static preview, project opening, tour progression, theme customization, reduced motion, and desktop plus 390px mobile layouts without horizontal overflow. Next.js reported no current runtime errors.
- The hardware WebGL and SVG compatibility renderers are both retained. The SVG path has not yet been forced in browser QA; verify both paths after scene changes, especially on browsers without WebGL.
- Review touch layout on your own phone and tablet before public launch.
- Current geometry is procedural. There is no editable Blender scene or external GLB source asset yet.
- The résumé remains a draft with bracketed performance placeholders. Validate those before making it public.
- The active scene runtime remains one JavaScript module behind a typed initializer, and project details, tour, and customization still use imperative DOM updates. These are the next migration targets.
- No Git remote or deployment is configured. Push and connect Cloudflare Pages only when the owner is ready.

## Official references checked on 25 October 2026

- Codex IDE: https://learn.chatgpt.com/docs/codex/ide
- Project guidance: https://learn.chatgpt.com/docs/agent-configuration/agents-md
- Next.js client/server boundaries: https://nextjs.org/docs/app/getting-started/server-and-client-components
- Supabase with Next.js: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Next.js on Vercel: https://vercel.com/docs/frameworks/full-stack/nextjs
- Next.js static exports: https://nextjs.org/docs/app/guides/static-exports
- Cloudflare Pages static Next.js site: https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/
- Cloudflare Pages build configuration: https://developers.cloudflare.com/pages/configuration/build-configuration/
- Cloudflare Pages free limits: https://developers.cloudflare.com/pages/platform/limits/
- Cloudflare Pages preview deployments: https://developers.cloudflare.com/pages/configuration/preview-deployments/
- Vercel Hobby plan: https://vercel.com/docs/plans/hobby
- GitHub Actions billing: https://docs.github.com/en/billing/concepts/product-billing/github-actions
- GitHub Pages limits: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- GitHub Actions checkout v7: https://github.com/actions/checkout
- GitHub Actions setup-node v7: https://github.com/actions/setup-node
