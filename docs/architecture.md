---
type: Project Guide
title: Experience architecture
description: Route composition, state, rendering and resource lifecycle.
tags:
  - systems-desk
status: current
updated: 2026-10-27
---

# Architecture

Next.js statically exports the home, A•WAKE and travel routes. `Experience` owns home navigation, panels, tour and stored preferences. `AdaptiveScene` lazily mounts the R3F canvas; minimal view removes it while keeping written project summaries available.

## Scene and controls

`DeskModel` mounts the procedural desk from `components/three/`. It owns projected project labels, the browser-local clock readout, model picking and disposal. The desk includes independent stations for the four project areas and A•WAKE. The bottle has a separate pad and hover target. The reading lamp’s base switch toggles its animated lever, bulb and light.

`DeskCamera` uses OrbitControls for unrestricted horizontal rotation, bounded eased zoom and interruptible camera transitions. Project, clock and coffee navigation use explicit camera flights. Normal orbit and zoom are not reset by the render loop.

The clock follows local browser time while decorative animation is paused. At rest, one invalidation per second updates its hands and adjacent readout. Off-screen scenes stop that timer.

## Preferences and lifecycle

`AppearancePanel` edits validated preferences in `usePreferences`: atmosphere, accent, lighting, animation speed, layer separation, camera angle and reduced motion. Daylight is the default. Changes persist in browser storage; a JSON export keeps a local copy.

The model builder disposes unique geometries, materials and textures on unmount. Labels, clock banner, observers, image handlers, animation controls and clock timers have paired cleanup. Context loss switches to minimal view. Coffee and travel use independent scene lifecycles and retain geometry fallbacks.

## Interface and content

`content/portfolio.ts` is the source for project stories, labels and profile content. Product data lives in `content/cold-brew.ts`; travel details in `content/travel.ts`; appearance colours in `content/appearance.ts`; future work in `content/roadmap.ts`.

Projected labels are regular DOM buttons outside Canvas. Project details use native dialogs. Feedback opens a prefilled email draft; it does not submit to a server.

Sources: [R3F performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance), [Three.js OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls).
