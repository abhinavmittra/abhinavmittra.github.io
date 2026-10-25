# Systems Desk project context

Read README.md and HANDOFF.md before substantial changes.

- This is Abhinav Mittra's approved first visual draft, version 0.1.0. Preserve its composition, dark sage palette, project stations, camera tour, terminal, and customization interactions during structural work.
- The app is being migrated to Next.js App Router and TypeScript while preserving the original Three.js 0.186.1 draft under public/legacy.
- Edit active profile, project, and station copy in content/portfolio.ts. Keep one content record per project; reuse it in labels, tour cards and detail panels.
- The active route renders the workspace through components/workspace/WorkspaceMarkup.tsx and mounts the scene through components/workspace/Workspace.tsx. Continue replacing imperative scene/UI compatibility code incrementally, without changing the approved composition and interactions.
- Keep the hardware renderer and the software geometry compatibility renderer. Do not silently replace 3D objects with a flat background image.
- Use supplied career facts. Both AI projects are ongoing. Example workflows use fictional data. Do not invent outcomes, availability claims, or company internals. The attached résumé is a draft with unverified bracketed metrics.
- Do not edit public/legacy/vendor directly. It contains upstream MIT licensed Three.js code.
- Avoid new dependencies for simple copy or styling edits. Preserve a single package manager lockfile.
- Run npm run check. For UI changes, verify the tour, project opening, custom settings, reduced motion, and layout on desktop and mobile. State any browser verification limits.
- Do not commit credentials or environment files. Follow the user's selected hosting target and keep local iteration separate from deployment.
- Future database content must be rendered as escaped text. The current source constants are trusted developer content; do not wire database strings into existing innerHTML templates unchanged.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
