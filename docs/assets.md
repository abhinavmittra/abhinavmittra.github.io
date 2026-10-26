---
type: Project Guide
title: Asset sources and delivery
description: Active asset inventory, provenance and size checks.
tags:
  - systems-desk
status: current
updated: 2026-10-27
---

# Assets

The active 3D scenes use procedural geometry; there are no imported OBJ, GLTF or GLB models to compress. The A•WAKE bottle and mood-board artwork are source-controlled and reuse the supplied logo pixels. See [brand identity](awake/README.md).

The travel globe is generated from the Natural Earth source in `reference/geography/`. The source version and checksum are in `reference/geography/provenance.json`; the simplified runtime features are in `public/travel/countries.json`. Recreate them with `node scripts/prepare-travel-data.mjs`.

Platform icons and country flags retain their upstream licences beside the assets. `NOTICE.md` lists their sources. Run `npm run audit:assets` to inspect public file sizes; review large images or new model assets before adding them.
