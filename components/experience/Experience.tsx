"use client";
import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  profile,
  projects,
  stationCopy,
  travelStationCopy,
  interfaceCopy,
  type ProjectKey,
  type StationKey,
} from "@/content/portfolio";
import { WorkspaceTerminal } from "./WorkspaceTerminal";
import type { WorkspaceTarget, WorkspaceCommand } from "@/content/workspace-search";
import { ContentPanel } from "./ContentPanel";
import { MinimalView } from "./MinimalView";
import { CoffeeLanding } from "./CoffeeLanding";
import { usePreferences } from "./usePreferences";
import type { Panel, Quality, SceneCommand } from "./types";
import "./experience.css";
import { accentText, defaultLook, type DeskLook } from "./preferences";
import { sitePath } from "@/lib/sitePath";
import { deskStationColors } from "@/content/appearance";
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
    [quality, setQuality] = useState<Quality>("balanced"),
    [compact, setCompact] = useState(false);
  const [flow, setFlow] = useState(true),
    [orbit, setOrbit] = useState(false),
    [lamp, setLamp] = useState(false);
  const [coffee, setCoffee] = useState(false),
    [tour, setTour] = useState(-1),
    [announcement, setAnnouncement] = useState("");
  const [command, setCommand] = useState<SceneCommand>({
      id: 0,
      target: "overview",
    });
  const [searchHeading, setSearchHeading] = useState<string>();
  useEffect(() => {
    if (!announcement) return;
    const timer = setTimeout(() => setAnnouncement(""), 6000);
    return () => clearTimeout(timer);
  }, [announcement]);
  const coffeeRef = useRef<HTMLDivElement>(null),
    sceneRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const media = matchMedia('(max-width: 800px)');
    setCompact(media.matches);
    setQuality(media.matches ? "balanced" : "high");
    const resize = () => {
      setCompact(media.matches);
      if (media.matches)
        setQuality(current => current === 'high' ? 'balanced' : current);
    };
    media.addEventListener('change', resize);
    return () => media.removeEventListener('change', resize);
  }, []);
  useEffect(() => {
    if (!compact || (tour < 0 && !coffee)) return;
    // Measure after React commits the panel so document height includes its full contents.
    const frame = requestAnimationFrame(() => {
      const stage = sceneRef.current;
      if (!stage) return;
      const available = (window.visualViewport?.height ?? innerHeight) - 24;
      const panel = stage.querySelector<HTMLElement>('.experience-tour, .coffee-landing');
      if (panel && stage.offsetHeight > available)
        panel.scrollIntoView({ behavior: 'instant', block: 'end' });
      else stage.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, [compact, tour, coffee]);
  const navigate = useCallback(
    (target: SceneCommand["target"]) =>
      setCommand((value) => ({ id: value.id + 1, target })),
    [],
  );
  const open = useCallback(
    (next: Panel) => {
      setSearchHeading(undefined);
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
    setOrbit(false);
    setPanel(null);
    if (minimal) {
      setCoffee(true);
      requestAnimationFrame(() =>
        coffeeRef.current?.scrollIntoView({
          behavior: motion ? "smooth" : "instant",
          block: "start",
        }),
      );
    } else {
      scrollToScene();
      navigate("coffee");
    }
  }
  function scrollToScene() {
    if (compact) requestAnimationFrame(() => sceneRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' }));
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
    setCoffee(false);
    setPanel(null);
    setOrbit(false);
    setTour(index);
    navigate(keys[index]);
  }
  function selectTerminalResult(target: WorkspaceTarget) {
    if (target.kind === "page") window.location.assign(sitePath(target.href));
    else if (target.kind === "panel") {
      open(target.panel);
      setSearchHeading(target.heading);
    } else runTerminalCommand(target.command);
  }
  function runTerminalCommand(value: WorkspaceCommand) {
    switch (value) {
      case "brew": coffeeBreak(); break;
      case "tour":
        if (minimal) open(keys[0]);
        else tourStep(0);
        break;
      case "reset":
        setPanel(null);
        setCoffee(false);
        setTour(-1);
        navigate("overview");
        break;
      case "flow": setFlow(!flow); break;
      case "explode": setExplode(!explode); break;
      case "orbit": setOrbit(!orbit); break;
      case "pause": setMotion(false); break;
      case "resume": setMotion(true); break;
      case "lamp":
        setLamp(!lamp);
        setAnnouncement(lamp ? interfaceCopy.lampOffQuote : interfaceCopy.lampOnQuote);
        break;
      case "travel": window.location.assign(sitePath("/travel/")); break;
      case "clock":
        setTour(-1);
        setCoffee(false);
        scrollToScene();
        if (!minimal) navigate("clock");
        setAnnouncement(new Intl.DateTimeFormat(undefined, { timeStyle: "long" }).format(new Date()));
        break;
      case "arrival": replayArrival(); break;
    }
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
            <details className="desk-controls" open={!compact}>
              <summary>Desk controls</summary>
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
            </details>
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
            <WorkspaceTerminal onSelect={selectTerminalResult} />
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
              ref={sceneRef}
              className={`scene-stage ${coffee ? "is-coffee" : ""} ${tour >= 0 ? 'is-touring' : ''}`}
              aria-label="Interactive Systems Desk"
            >
              {ready && (
                <AdaptiveScene
                  compact={compact}
                  focusedStation={tour >= 0 ? keys[tour] : null}
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
                  onOpen={(key) => {
                    const index = keys.indexOf(key as StationKey);
                    if (compact && index >= 0) tourStep(index);
                    else openProject(key);
                  }}
                  onTravel={() => window.location.assign(sitePath(travelStationCopy.href))}
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
              ) : tour < 0 ? (
                <div className="scene-caption">
                  <span>{compact ? 'Tap a model or choose a story.' : 'Pick a story on the desk.'}</span>
                </div>
              ) : null}
              {compact && !coffee && (
                <nav className="mobile-station-nav" aria-label="Explore the desk">
                  {keys.map((key, index) => (
                    <button
                      key={key}
                      onClick={() => tourStep(index)}
                      aria-pressed={tour === index}
                      style={{ '--item-color': deskStationColors[key] } as React.CSSProperties}
                    >
                      {stationCopy[key].compactLabel}
                    </button>
                  ))}
                  <button
                    onClick={coffeeBreak}
                    style={{ '--item-color': deskStationColors.coldbrew } as React.CSSProperties}
                  >
                    A•WAKE coffee
                  </button>
                  <a
                    href={sitePath(travelStationCopy.href)}
                    aria-label={`${travelStationCopy.label}: ${travelStationCopy.compactLabel}`}
                    style={{ '--item-color': deskStationColors.travel } as React.CSSProperties}
                  >
                    {travelStationCopy.compactLabel} ↗
                  </a>
                </nav>
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
        searchHeading={searchHeading}
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
