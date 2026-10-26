import {
  projects,
  stationCopy,
  type ProjectKey,
  type StationKey,
} from "@/content/portfolio";
import { deskStationColors } from "@/content/appearance";
export function MinimalView({ onOpen }: { onOpen: (key: ProjectKey) => void }) {
  return (
    <section
      className="minimal-projects"
      id="projects"
      aria-label="Project case studies"
    >
      <div className="flex items-center justify-between gap-3">
        <h2>The work, at a glance.</h2>
        <span className="muted">No 3D required</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {(Object.keys(stationCopy) as StationKey[]).map((key) => (
          <article
            key={key}
            className="case-study"
            style={
              { "--item-color": deskStationColors[key] } as React.CSSProperties
            }
          >
            <p className="muted">{projects[key].status}</p>
            <h3>{projects[key].title}</h3>
            <p>{projects[key].description}</p>
            <div className="flex flex-wrap gap-2">
              {projects[key].tags.map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
            <button className="text-link" onClick={() => onOpen(key)}>
              {stationCopy[key].invitation} ↗
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
