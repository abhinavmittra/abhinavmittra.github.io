---
type: Project Guide
title: Travel atlas provenance
description: Boundaries, coordinates, flags and counting.
tags:
  - systems-desk
status: current
updated: 2026-10-27
---

# Travel atlas

The atlas includes the portfolio owner's 29-country list. `scripts/prepare-travel-data.mjs` derives boundaries and focus coordinates from Natural Earth v5.1.2. Source GeoJSON and checksum live in `reference/geography/`; runtime data is in `public/travel/`.

The source uses `ADM0_A3`, `ISO_A2_EH`, `LABEL_X`, `LABEL_Y` and `SUBREGION`. Label points focus the camera; they are not claimed trip locations. Rings are normalized for D3’s spherical winding, including dateline islands. The map uses de facto boundaries and includes territories, which are not the counting denominator.

**29 / 195 = 14.9% of countries**, not land area. The denominator is 193 UN members plus two observer states. Highlighting does not claim visits to every region. Next-country flags show possibilities, not bookings.

`geography.js` shares projection/colours across WebGL, SVG and mini map: periwinkle visited, sand selected, neutral other countries. India is the initial explicit selection. Flags select/focus, drag/arrows rotate, and reduced motion disables automatic turning. The scheduler sleeps when paused, hidden or off-screen. All countries remain in the accessible text list.

Tests cover the exact list, flags, checksum, label containment, spherical areas, ocean samples, projection focus and colour agreement. See [verification](../performance.md).

Sources: [Natural Earth v5.1.2](https://github.com/nvkelso/natural-earth-vector/tree/v5.1.2), [public-domain terms](https://www.naturalearthdata.com/about/terms-of-use/), [UN members](https://www.un.org/en/about-us/member-states), [observers](https://research.un.org/en/unmembers/observers), [flag-icons v7.3.2 MIT](https://github.com/lipis/flag-icons/tree/v7.3.2), [D3 geo](https://d3js.org/d3-geo).
