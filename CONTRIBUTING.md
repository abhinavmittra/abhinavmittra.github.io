# Contributing

Use Node.js 24 or newer. Run `npm ci`, `npm run dev`, then `npm run check` and `npm run build`. Preview the actual export with `npm run preview`.

Keep interactions unless a request explicitly revises them. Verify desktop/phone layouts, projects, tour, terminal, themes, reduced motion, minimal-view unmount, coffee transitions and catalogue/map fallbacks. Do not claim universal 60fps from desktop emulation.

Edit canonical records in `content/`. Ground employment claims in supplied facts, label proposals and fictional demos, and render future untrusted content through escaped React text. Avoid dependencies for copy/styling changes. Keep `package-lock.json` in sync with dependency changes. Retain notices for bundled third-party assets.

## Knowledge format

Maintained documents under `docs/` follow [Google Cloud's Open Knowledge Format v0.2](https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/main/SPEC.md). Start discovery at [docs/index.md](docs/index.md), then open only the relevant topic or subdirectory index. Concept documents have YAML frontmatter at the **start** of the file. `type` is required; this project also uses `title`, `description`, `tags`, `status` and `updated`. These additional fields are project conventions, not OKF's minimum conformance rules. Cite primary sources beside technical claims; research documents use `sources` entries with stable IDs and matching footnotes.

```yaml
---
type: Project Guide
title: Example topic
description: One-sentence summary of the guidance.
tags:
  - systems-desk
status: current
updated: 2026-10-27
---
```

Reserved `index.md` files list their directory's concepts and subdirectories, with short descriptions. They do **not** carry concept metadata: only the bundle-root `docs/index.md` declares `okf_version: "0.2"`. Keep an index in each knowledge subdirectory. Reserve `log.md` for newest-first ISO date headings if a log is needed. Remove obsolete reviews or label them historical. The repository check verifies these index rules, index coverage, concept metadata and local Markdown links; it is not a full YAML/schema validator.

Keep personal brainstorms, draft research and editor-specific notes under the ignored `.vscode/` directory. Move only finalized, contributor-relevant guidance into `docs/` and add it to the appropriate OKF index. Do not commit local agent/editor files, environment files, credentials, exports or browser screenshots. CI builds without deployment credentials. Dependabot opens update PRs; review release notes and visual behavior before merging, especially graphics/Next.js majors.
