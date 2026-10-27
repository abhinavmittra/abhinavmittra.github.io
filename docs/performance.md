---
type: Engineering Report
title: Rendering and verification
description: Current scene budgets, lifecycle and device-testing limits.
tags:
  - systems-desk
  - performance
status: current
updated: 2026-10-27
---

# Rendering

The physical desk uses procedural geometry. Current local Chromium samples report about **350 draw calls / 88,826 triangles** with high-tier shadows and **179 calls / 46,974 triangles** without shadows. Static grouping batches 379 mesh details. These development-browser figures are not a mobile performance guarantee; sustained 60fps on real devices has not been measured.

| Tier | DPR ceiling | Shadows | Antialiasing |
| --- | --- | --- | --- |
| High | 2 | Basic, 512px map | On |
| Balanced | 2 | Off | On |
| Low | 1.65 | Off | On |

R3F manages pixel ratio. Slow frames reduce shadows and then DPR while retaining antialiasing. The scene owns its procedural resources and disposes unique geometries, materials and textures, observers, handlers and controls on unmount. The clock continues to follow browser local time while decorative motion is paused, with one refresh per second when idle.

## Verification

R3F 9.8.2 creates a deprecated `THREE.Clock` internally. `scripts/patch-r3f-timer.mjs` runs after install and replaces that constructor in its ESM/CJS bundles with the tested `lib/frameTimer.mjs` adapter backed by `THREE.Timer`. It preserves R3F's seconds-based delta, writable elapsed time and start/stop API without filtering console warnings or adding DOM listeners. The patch is version guarded: review it when upgrading R3F, and remove it when the renderer no longer requires Clock. See [upstream issue](https://github.com/pmndrs/react-three-fiber/issues/3741) and [Timer API](https://threejs.org/docs/pages/Timer.html).

`npm run check` covers TypeScript, scene motion, clock math, map sources and colours, documentation links and asset size. `npm run build` creates the static export. Desktop Chromium checks cover the tour, project opening, appearance controls, model picking, reduced motion, coffee transition and minimal-view teardown. Physical phones, Safari, screen readers and long-session GPU/thermal behaviour remain unverified.

Sources: [R3F performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance), [Drei PerformanceMonitor](https://drei.docs.pmnd.rs/performances/performance-monitor), [Three.js OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls).
