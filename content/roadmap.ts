export const roadmap = [
  {
    id: "docs-checks",
    title: "Answers you can check",
    status: "Next in line",
    color: "#b5bce8",
    summary:
      "An open starter kit for maintainers who want to test a docs assistant before putting it in front of users.",
    build:
      "Version a small public Markdown corpus, expected source passages and unanswerable questions. Run promptfoo against a local model or a user-supplied provider, then publish a static comparison report from GitHub Actions.",
    done: "A fresh clone runs the fixture tests without a paid API. CI catches missing citations, invented links and failures to say “I don’t know”. Document dataset licences and keep secrets out of reports.",
    stack: "TypeScript · promptfoo · JSON fixtures · GitHub Actions",
  },
  {
    id: "incident-replay",
    title: "A safe place to break an agent",
    status: "Planned",
    color: "#efd594",
    summary:
      "Replay synthetic support incidents without giving an agent access to anyone’s real systems.",
    build:
      "Build a deterministic Node.js simulator with read-only tools, timeouts and recorded tool results. Let a reviewer replay a run, inspect its decisions and export a redacted trace.",
    done: "Duplicate events, stale records and tool failures each have regression tests. A proposed write requires a human decision and cannot reach a real endpoint.",
    stack: "Node.js · TypeScript · NDJSON · contract tests",
  },
  {
    id: "accessible-3d",
    title: "A lighter starting point for 3D",
    status: "Planned",
    color: "#b6c7a3",
    summary:
      "Share the useful parts of this site so the next portfolio does not have to choose between accessibility and a good scene.",
    build:
      "Extract the adaptive Canvas, keyboard project navigation and minimal-view switch into a documented example. Add Playwright flows, axe checks and a repeatable physical-device profiling checklist.",
    done: "All content works without WebGL. Reduced motion stops idle rendering. Switching to 2D releases the renderer, and repeated mounts stay within a measured memory budget.",
    stack: "React Three Fiber · Drei · Playwright · axe-core",
  },
  {
    id: "brew-log",
    title: "A brew notebook that travels",
    status: "Planned",
    color: "#d2c3a5",
    summary:
      "Save a recipe, change one variable and remember which cup was worth repeating. No account needed.",
    build:
      "Store recipes locally in IndexedDB with a versioned schema. Add grind, ratio, time and tasting notes, CSV import/export, and an opt-in offline cache with an explicit update prompt.",
    done: "Recipes survive reloads and schema upgrades. Export/import round-trips cleanly. Storage failures produce a readable recovery path, and deleting a notebook removes its local records.",
    stack: "IndexedDB · TypeScript · service worker · CSV",
  },
  {
    id: "map-access",
    title: "Travel notes beyond the globe",
    status: "Exploring",
    color: "#b5bce8",
    summary:
      "Make the map useful to people who prefer a list, use a screen reader or have a slow connection.",
    build:
      "Add country permalinks, a searchable text index and opt-in offline notes. Keep place names and map source versions together, and publish only deliberately shared locations.",
    done: "Every map selection has an equivalent keyboard route and shareable URL. The text index works without canvas. Offline updates preserve saved notes and clearly show their age.",
    stack: "GeoJSON · URL state · accessible HTML · offline cache",
  },
] as const;
