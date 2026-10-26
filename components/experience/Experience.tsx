"use client";
import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  profile,
  projects,
  stationCopy,
  interfaceCopy,
  type ProjectKey,
  type StationKey,
} from "@/content/portfolio";
import { ContentPanel } from "./ContentPanel";
import { MinimalView } from "./MinimalView";
import { CoffeeLanding } from "./CoffeeLanding";
import { usePreferences } from "./usePreferences";
import type { Panel, Quality, SceneCommand } from "./types";
import "./experience.css";
import { accentText, defaultLook, type DeskLook } from "./preferences";
import { sitePath } from "@/lib/sitePath";
const AdaptiveScene = dynamic(() => import("./AdaptiveScene"), {
  ssr: false,
  loading: () => (
    <div className="scene-loading">
      <span className="loading-orbit" />
      <p>Preparing the workbench…</p>
      <p className="muted">Minimal view is always available above.</p>
    </div>
  ),
});
const keys = Object.keys(stationCopy) as StationKey[];
export function Experience() {
  const {
    ready,
    minimal,
    setMinimal,
    motion,
    setMotion,
    atmosphere,
    setAtmosphere,
    look,
    setLook,
  } = usePreferences();
  const [panel, setPanel] = useState<Panel>(null),
    [quality, setQuality] = useState<Quality>("balanced");
  const [flow, setFlow] = useState(true),
    [orbit, setOrbit] = useState(false),
    [lamp, setLamp] = useState(false);
  const [coffee, setCoffee] = useState(false),
    [tour, setTour] = useState(-1),
    [announcement, setAnnouncement] = useState("");
  const [command, setCommand] = useState<SceneCommand>({
      id: 0,
      target: "overview",
    }),
    [input, setInput] = useState("");
  useEffect(() => {
    if (!announcement) return;
    const timer = setTimeout(() => setAnnouncement(""), 6000);
    return () => clearTimeout(timer);
  }, [announcement]);
  const coffeeRef = useRef<HTMLDivElement>(null),
    inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setQuality(innerWidth < 800 ? "balanced" : "high");
  }, []);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  const navigate = useCallback(
    (target: SceneCommand["target"]) =>
      setCommand((value) => ({ id: value.id + 1, target })),
    [],
  );
  const open = useCallback(
    (next: Panel) => {
      setPanel(next);
      if (next && keys.includes(next as StationKey))
        navigate(next as StationKey);
    },
    [navigate],
  );
  const unavailable = useCallback(() => {
    setMinimal(true);
    setAnnouncement(
      "3D is unavailable here. Every project is available in minimal view.",
    );
  }, [setMinimal]);
  const openProject = useCallback((key: ProjectKey) => open(key), [open]);
  const chapter = useCallback((active: boolean) => setCoffee(active), []);
  const explode = look.separation > 0;
  const effectiveMotion = motion && !look.gentle;
  const [arrival, setArrival] = useState(0);
  function setExplode(value: boolean) {
    setLook((current) => ({ ...current, separation: value ? 85 : 0 }));
  }
  function changeLook(patch: Partial<DeskLook>) {
    setLook((current) => ({ ...current, ...patch }));
    if (patch.angle) {
      setTour(-1);
      navigate("overview");
    }
  }
  function resetLook() {
    setLook({
      ...defaultLook,
      gentle: matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
    setAtmosphere("daylight");
    setMotion(true);
    setOrbit(false);
    navigate("overview");
  }
  function replayArrival() {
    if (effectiveMotion) {
      setArrival((value) => value + 1);
      navigate("overview");
    }
  }
  function coffeeBreak() {
    setTour(-1);
    setPanel(null);
    if (minimal) {
      setCoffee(true);
      requestAnimationFrame(() =>
        coffeeRef.current?.scrollIntoView({
          behavior: motion ? "smooth" : "instant",
          block: "start",
        }),
      );
    } else navigate("coffee");
  }
  function toggleView() {
    setMinimal(!minimal);
    setCoffee(false);
    setTour(-1);
    navigate("overview");
    setAnnouncement(
      minimal
        ? "3D view enabled."
        : "Minimal view enabled. 3D rendering is off.",
    );
  }
  function tourStep(index: number) {
    if (index >= keys.length) {
      setTour(-1);
      navigate("overview");
      return;
    }
    setTour(index);
    navigate(keys[index]);
  }
  function terminal(event: FormEvent) {
    event.preventDefault();
    const value = input.trim().toLowerCase().split(/\s+/)[0];
    setInput("");
    const panels: Record<string, Panel> = {
      story: "story",
      journey: "story",
      about: "story",
      evals: "notebook",
      notebook: "notebook",
      ai: "notebook",
      roadmap: "roadmap",
      next: "roadmap",
      contact: "contact",
      settings: "settings",
      customize: "settings",
      cisco: "discovery",
      agents: "incident",
      inference: "integrations",
      field: "fieldnotes",
      fieldnotes: "fieldnotes",
    };
    if (panels[value]) open(panels[value]);
    else if (["brew", "coffee", "awake", "coldbrew"].includes(value))
      coffeeBreak();
    else if (["reset", "home", "overview", "work"].includes(value)) {
      setCoffee(false);
      setTour(-1);
      navigate("overview");
    } else if (["tour", "explore"].includes(value)) {
      if (minimal) open(keys[0]);
      else tourStep(0);
    } else if (value === "flow") setFlow(!flow);
    else if (["explode", "layers"].includes(value)) setExplode(!explode);
    else if (value === "orbit") setOrbit(!orbit);
    else if (value === "pause") setMotion(false);
    else if (value === "resume") setMotion(true);
    else if (value === "lamp") {
      setLamp(!lamp);
      setAnnouncement(
        lamp ? interfaceCopy.lampOffQuote : interfaceCopy.lampOnQuote,
      );
    } else if (["travel", "globe", "countries"].includes(value))
      window.location.assign(sitePath("/travel/"));
    else if (["clock", "time"].includes(value)) {
      if (!minimal) navigate("clock");
      setAnnouncement(
        new Intl.DateTimeFormat(undefined, { timeStyle: "long" }).format(
          new Date(),
        ),
      );
    } else if (["arrival", "replay"].includes(value)) {
      replayArrival();
    } else
      setAnnouncement(
        "Try cisco, agents, inference, story, notebook, next, coffee, travel, lamp, pause or resume.",
      );
  }
  return (
    <div
      className="systems-experience"
      data-atmosphere={atmosphere}
      data-view={minimal ? "minimal" : "3d"}
      data-motion={effectiveMotion}
      style={
        {
          "--exp-accent": accentText(look.accent, atmosphere),
          "--desk-accent": look.accent,
        } as React.CSSProperties
      }
    >
      <a className="experience-skip" href="#workbench">
        Skip to projects
      </a>
      <header className="experience-header">
        <div className="identity">
          <button
            className="identity-name"
            onClick={() => {
              setPanel(null);
              setCoffee(false);
              navigate("overview");
            }}
          >
            Abhinav Mittra
          </button>
          <button className="hello-link" onClick={() => open("contact")}>
            <span className="envelope-icon" aria-hidden="true" />
            Say hello ↗
          </button>
        </div>
        <nav aria-label="Main navigation">
          <button
            onClick={() => {
              setPanel(null);
              setCoffee(false);
              navigate("overview");
            }}
          >
            Workbench
          </button>
          <button onClick={() => open("story")}>My story</button>
          <button onClick={() => open("notebook")}>AI notebook</button>
          <button onClick={coffeeBreak}>A•WAKE</button>
          <button className="next-nav" onClick={() => open("roadmap")}>
            Next up <span aria-hidden="true">↗</span>
          </button>
        </nav>
        <button
          className="view-switch"
          onClick={toggleView}
          aria-label="Toggle Performance / Minimal View"
          aria-pressed={minimal}
        >
          <span aria-hidden="true">{minimal ? "◈" : "▦"}</span>
          {minimal ? "Explore in 3D" : "Minimal view"}
        </button>
      </header>
      <main className="experience-main" id="workbench" tabIndex={-1}>
        <section className="profile-intro">
          <h1>
            Abhinav
            <br /> Mittra
          </h1>
          <p className="profile-role">
            {profile.role}
            <br /> <span>at {profile.company}</span>
          </p>
          <p className="profile-description">
            Enterprise systems by day.
            <br />
            Agents, coffee and the road
            <br className="desktop-break" /> after hours.
          </p>
          <div className="profile-facts">
            <span>
              <strong>6+</strong> years at Cisco
            </span>
            <a href={sitePath("/travel/")}>
              <strong>29</strong> countries visited ↗
            </a>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              className="action primary-action"
              onClick={() => (minimal ? open("discovery") : tourStep(0))}
            >
              {minimal ? "Read the work" : "Tour the desk"} ↗
            </button>
            <button className="action coffee-action" onClick={coffeeBreak}>
              Coffee break ↗
            </button>
          </div>
          {!minimal && (
            <div className="motion-controls">
              <button
                style={{ "--item-color": "#efd594" } as React.CSSProperties}
                aria-pressed={flow}
                onClick={() => setFlow(!flow)}
              >
                Data flow
              </button>
              <button
                style={{ "--item-color": "#b5bce8" } as React.CSSProperties}
                aria-pressed={explode}
                onClick={() => setExplode(!explode)}
              >
                Explode
              </button>
              <button
                style={{ "--item-color": "#b6c7a3" } as React.CSSProperties}
                aria-pressed={orbit}
                disabled={!effectiveMotion}
                onClick={() => setOrbit(!orbit)}
              >
                Auto orbit
              </button>
              <button
                onClick={() => {
                  navigate("overview");
                  setExplode(false);
                  setTour(-1);
                }}
              >
                Reset view
              </button>
              <button
                aria-label="Zoom in on the desk"
                onClick={() => navigate("zoom-in")}
              >
                Zoom +
              </button>
              <button
                aria-label="Zoom out from the desk"
                onClick={() => navigate("zoom-out")}
              >
                Zoom −
              </button>
              <button aria-pressed={!motion} onClick={() => setMotion(!motion)}>
                {motion ? "Pause" : "Resume"}
              </button>
              <button
                aria-pressed={lamp}
                onClick={() => {
                  setLamp(!lamp);
                  setAnnouncement(
                    lamp
                      ? interfaceCopy.lampOffQuote
                      : interfaceCopy.lampOnQuote,
                  );
                }}
              >
                Desk light
              </button>
            </div>
          )}
          <div className="profile-footer">
            <button className="text-link" onClick={() => open("settings")}>
              Appearance & motion ↗
            </button>
          </div>
        </section>
        <div className="workbench-content">
          <div className="workbench-toolbar">
            <span>{coffee ? "Coffee / A•WAKE" : "Workspace / overview"}</span>
            <form onSubmit={terminal}>
              <span aria-hidden="true">abhi://</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                aria-label="Workspace command"
                placeholder="Try ‘story’, ‘coffee’ or ‘next’"
                autoComplete="off"
              />
              <button aria-label="Run command">↵</button>
            </form>
          </div>
          {minimal ? (
            <>
              <MinimalView onOpen={openProject} />
              {coffee && (
                <div ref={coffeeRef} className="minimal-coffee">
                  <CoffeeLanding />
                </div>
              )}
            </>
          ) : (
            <section
              className={`scene-stage ${coffee ? "is-coffee" : ""}`}
              aria-label="Interactive Systems Desk"
            >
              {ready && (
                <AdaptiveScene
                  motion={effectiveMotion}
                  look={look}
                  arrival={arrival}
                  suspended={!!panel}
                  flow={flow}
                  orbit={orbit}
                  lamp={lamp}
                  quality={quality}
                  atmosphere={atmosphere}
                  command={command}
                  onQuality={setQuality}
                  onOpen={openProject}
                  onChapter={chapter}
                  onUnavailable={unavailable}
                  onNavigate={(target) => {
                    if (target === "coffee") coffeeBreak();
                    else {
                      if (target === "clock") setTour(-1);
                      navigate(target);
                    }
                  }}
                  onLamp={() => {
                    setLamp((value) => !value);
                    setAnnouncement(
                      lamp
                        ? interfaceCopy.lampOffQuote
                        : interfaceCopy.lampOnQuote,
                    );
                  }}
                />
              )}
              {coffee ? (
                <>
                  <button
                    className="back-to-board action"
                    onClick={() => navigate("overview")}
                  >
                    ← Back to the desk
                  </button>
                  <div className="coffee-landing">
                    <CoffeeLanding />
                  </div>
                </>
              ) : (
                <div className="scene-caption">
                  <span>Pick a story on the desk.</span>
                </div>
              )}
              {tour >= 0 && (
                <aside className="experience-tour" aria-label="Guided tour">
                  <span className="muted">
                    {tour + 1} / {keys.length}
                  </span>
                  <h2>{projects[keys[tour]].title}</h2>
                  <p>{projects[keys[tour]].description}</p>
                  <div className="flex gap-3">
                    <button className="action" onClick={() => open(keys[tour])}>
                      Read the story
                    </button>
                    <button
                      className="action primary-action"
                      onClick={() => tourStep(tour + 1)}
                    >
                      {tour === keys.length - 1 ? "Finish tour" : "Next stop"} →
                    </button>
                    <button
                      className="icon-action"
                      aria-label="End tour"
                      onClick={() => {
                        setTour(-1);
                        navigate("overview");
                      }}
                    >
                      ×
                    </button>
                  </div>
                </aside>
              )}
            </section>
          )}
        </div>
      </main>
      <div className="experience-announcement" role="status">
        {announcement && (
          <>
            <span>{announcement}</span>
            <button
              className="icon-action"
              aria-label="Dismiss message"
              onClick={() => setAnnouncement("")}
            >
              ×
            </button>
          </>
        )}
      </div>
      <ContentPanel
        panel={panel}
        onClose={() => setPanel(null)}
        onOpen={open}
        atmosphere={atmosphere}
        setAtmosphere={setAtmosphere}
        motion={motion}
        setMotion={setMotion}
        look={look}
        onLook={changeLook}
        onResetLook={resetLook}
        onReplay={() => {
          replayArrival();
          setPanel(null);
        }}
      />
      <noscript>
        <p className="noscript-note">
          The case studies above are available without 3D. For the full written
          background, <a href={sitePath("/resume.pdf")}>read the résumé</a>,{" "}
          <a href={sitePath("/cold-brew/")}>visit A•WAKE</a> or{" "}
          <a href={`mailto:${profile.email}`}>email Abhinav</a>.
        </p>
      </noscript>
    </div>
  );
}
