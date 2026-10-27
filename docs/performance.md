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

Settled annotations cache station/camera projections and collision layout; unchanged labels and the clock banner avoid transform/path writes. Compact screens omit 3D hover handlers while retaining clicks and the story dock. Paused/hidden data flow avoids redundant instance-buffer uploads. Coffee dimensions are cached by its resize observer. No resolution or model-detail reduction was introduced in this pass. See the [R3F performance guide](https://r3f.docs.pmnd.rs/advanced/scaling-performance) for renderer guidance.

On this development machine, the synthetic label harness compared the previous committed implementation with this revision: 2,000 stationary-camera updates took about 57ms versus 5ms, with transform/path writes falling from 24,000 to zero after settling. Moving-camera samples were about 49ms and 54ms per 1,000 updates, so this does **not** establish a moving-scene speedup. This Node/DOM-double test isolates label work; it does not measure browser paint, GPU time, route load or phone FPS. Run `node scripts/test-station-labels.mjs` to verify cache invalidation, resize, projection and compact layout behavior.

In the rebuilt Chromium preview at a 1440px emulated desktop width, an idle MutationObserver sample also recorded zero label style/path mutations while the layout counter stayed at 103. This confirms the cache is exercised in the browser; it is not a general FPS result.

## Verification

R3F 9.8.2 creates a deprecated `THREE.Clock` internally. `scripts/patch-r3f-timer.mjs` runs after install and replaces that constructor in its ESM/CJS bundles with the tested `lib/frameTimer.mjs` adapter backed by `THREE.Timer`. It preserves R3F's seconds-based delta, writable elapsed time and start/stop API without filtering console warnings or adding DOM listeners. The patch is version guarded: review it when upgrading R3F, and remove it when the renderer no longer requires Clock. See [upstream issue](https://github.com/pmndrs/react-three-fiber/issues/3741) and [Timer API](https://threejs.org/docs/pages/Timer.html).

`npm run check` covers TypeScript, scene motion, clock math, map sources and colours, documentation links and asset size. `npm run build` creates the static export. Desktop Chromium checks cover the tour, project opening, appearance controls, model picking, reduced motion, coffee transition and minimal-view teardown. Physical phones, Safari, screen readers and long-session GPU/thermal behaviour remain unverified.

Sources: [R3F performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance), [Drei PerformanceMonitor](https://drei.docs.pmnd.rs/performances/performance-monitor), [Three.js OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls).
