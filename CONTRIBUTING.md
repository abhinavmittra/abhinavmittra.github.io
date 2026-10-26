# Contributing

Use Node.js 24 or newer. Run `npm ci`, `npm run dev`, then `npm run check` and `npm run build`. Preview the actual export with `npm run preview`.

Keep interactions unless a request explicitly revises them. Verify desktop/phone layouts, projects, tour, terminal, themes, reduced motion, minimal-view unmount, coffee transitions and catalogue/map fallbacks. Do not claim universal 60fps from desktop emulation.

Edit canonical records in `content/`. Ground employment claims in supplied facts, label proposals and fictional demos, and render future untrusted content through escaped React text. Avoid dependencies for copy/styling changes. Keep `package-lock.json` in sync with dependency changes. Retain notices for bundled third-party assets.

## Knowledge format

Maintained documents under `docs/` follow [Open Knowledge Format v0.2](https://github.com/GoogleCloudPlatform/open-knowledge-format/blob/main/SPEC.md). YAML frontmatter belongs at the **start** of the file. `type` is required; this project also uses `title`, `description`, `tags`, `status` and `updated`. Cite primary sources beside technical claims.

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

Maintain [docs/index.md](docs/index.md). Remove obsolete reviews or label them historical. The repository check verifies frontmatter placement, project fields and local Markdown links; it is not a full OKF schema validator.

Do not commit local agent/editor files, environment files, credentials, exports or browser screenshots. CI builds without deployment credentials. Dependabot opens update PRs; review release notes and visual behavior before merging, especially graphics/Next.js majors.
