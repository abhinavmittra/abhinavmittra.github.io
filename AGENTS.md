# Systems Desk project context

Read README.md and HANDOFF.md before substantial changes.

- This is Abhinav Mittra's approved first visual draft, version 0.1.0. Preserve its composition, dark sage palette, project stations, camera tour, terminal, and customization interactions during structural work.
- The current app is plain HTML, CSS, JavaScript modules and Three.js 0.186.1. Next.js and a database are planned, not implemented.
- Edit common profile and project copy in dist/content.js. Keep one content record per project; reuse it in labels, tour cards and detail panels.
- Keep the hardware renderer and the software geometry compatibility renderer. Do not silently replace 3D objects with a flat background image.
- Use supplied career facts. Both AI projects are ongoing. Example workflows use fictional data. Do not invent outcomes, availability claims, or company internals. The attached résumé is a draft with unverified bracketed metrics.
- Do not edit dist/vendor directly. It contains upstream MIT licensed Three.js code.
- Avoid new dependencies for simple copy or styling edits. Preserve a single package manager lockfile.
- Run npm run check. For UI changes, verify the tour, project opening, custom settings, reduced motion, and layout on desktop and mobile. State any browser verification limits.
- Do not commit credentials or environment files. Follow the user's selected hosting target and keep local iteration separate from deployment.
- Future database content must be rendered as escaped text. The current source constants are trusted developer content; do not wire database strings into existing innerHTML templates unchanged.
