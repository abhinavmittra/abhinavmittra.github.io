"use client";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { DeskModel } from "./DeskModel";
import { DeskCamera, type CameraPose } from "./DeskCamera";
import { lowerQuality, qualitySettings } from "./performance";
import type { SceneProps } from "./types";
import { stationCopy, travelStationCopy, type StationKey } from "@/content/portfolio";
import { deskStationColors } from "@/content/appearance";
import { sitePath } from "@/lib/sitePath";

class SceneBoundary extends Component<
  { onUnavailable: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onUnavailable();
  }
  render() {
    return this.state.failed ? (
      <p>Opening the minimal view…</p>
    ) : (
      this.props.children
    );
  }
}
function ContextLifecycle({ onUnavailable }: { onUnavailable: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const lost = (event: Event) => {
      event.preventDefault();
      onUnavailable();
    };
    gl.domElement.addEventListener("webglcontextlost", lost);
    return () => {
      gl.domElement.removeEventListener("webglcontextlost", lost);
    };
  }, [gl, onUnavailable]);
  // R3F owns declarative geometries/materials and the renderer. Its unmount disposes all of them,
  // disconnects events and releases the GL context. No shared global texture cache is used here.
  return null;
}
export default function AdaptiveScene(props: SceneProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true),
    [pageVisible, setPageVisible] = useState(true),
    [portal, setPortal] = useState(false),
    [highlight, setHighlight] = useState<string | null>(null);
  const labels = useRef<Record<string, HTMLElement | null>>({});
  const clock = useRef<HTMLButtonElement>(null);
  const cameraPose = useRef<CameraPose | null>(null);
  const coffeeClick = () => {
    props.onNavigate("coffee");
  };
  const config = qualitySettings[props.quality];
  const activeStation = highlight ?? props.focusedStation;
  useEffect(() => {
    // A desktop hover must not remain latched after switching to the touch layout.
    if (props.compact) setHighlight(null);
  }, [props.compact]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => setVisible(entries[0].isIntersecting),
      { threshold: 0.05 },
    );
    if (wrapper.current) observer.observe(wrapper.current);
    const change = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", change);
    change();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", change);
    };
  }, []);
  const running = props.motion && !props.suspended && visible && pageVisible;
  return (
    <div
      className="adaptive-canvas"
      ref={wrapper}
      data-quality={props.quality}
      data-running={running}
    >
      <SceneBoundary onUnavailable={props.onUnavailable}>
        {/* Preserve antialiasing and native detail; quality reduction removes shadows first. */}
        <Canvas
          dpr={[1, props.compact ? Math.min(config.maxDpr, 1.75) : config.maxDpr]}
          performance={{ min: 0.5, debounce: 180 }}
          shadows={config.shadows ? "basic" : false}
          frameloop={running ? "always" : "demand"}
          orthographic
          camera={{
            manual: true,
            position: [12, 11, 14],
            near: 0.1,
            far: 100,
            zoom: 1,
          }}
          gl={{
            antialias: config.antialias,
            alpha: true,
            powerPreference: "high-performance",
          }}
          fallback={
            <button className="action" onClick={props.onUnavailable}>
              Open minimal view
            </button>
          }
          onCreated={({ gl }) => {
            gl.domElement.setAttribute(
              "aria-label",
              "Abhinav’s desk with a live clock, reading lamp, A•WAKE flask and trekking backpack. Drag to rotate, scroll or pinch to zoom.",
            );
            gl.domElement.dataset.renderer = "r3f";
            gl.setClearColor(0x000000, 0);
          }}
        >
          <ContextLifecycle onUnavailable={props.onUnavailable} />
          <ambientLight intensity={(1.3 * props.look.light) / 100} />
          <hemisphereLight
            args={["#e4eadb", "#23342c", (1.4 * props.look.light) / 100]}
          />
          <directionalLight
            position={[-5, 14, 8]}
            intensity={(3 * props.look.light) / 100}
            color={props.atmosphere === "dusk" ? "#c5b5f0" : "#f2e8cc"}
            castShadow={config.shadows}
            shadow-mapSize={[512, 512]}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
            shadow-bias={-0.001}
          />
          <directionalLight
            position={[5, 3, -4]}
            intensity={(2 * props.look.light) / 100}
            color="#a4b3db"
          />
          {running && props.quality !== "low" && (
            <PerformanceMonitor
              iterations={8}
              ms={750}
              bounds={() => [38, 54]}
              flipflops={2}
              onDecline={() => props.onQuality(lowerQuality(props.quality))}
              onFallback={() => props.onQuality("low")}
            />
          )}
          <DeskCamera
            compact={props.compact}
            touring={props.focusedStation !== null}
            pose={cameraPose}
            angle={props.look.angle}
            speed={props.look.speed}
            command={props.command}
            motion={props.motion}
            orbit={props.orbit && running}
            onChapter={(coffee) => {
              setPortal(coffee);
              props.onChapter(coffee);
            }}
          />
          <DeskModel
            compact={props.compact}
            motion={running}
            active={visible && pageVisible}
            showClock={!portal && !props.focusedStation}
            showLabels={!portal && !props.focusedStation}
            flow={props.flow}
            look={props.look}
            arrival={props.arrival}
            lamp={props.lamp}
            atmosphere={props.atmosphere}
            highlight={activeStation}
            onHover={setHighlight}
            onOpen={props.onOpen}
            onCoffee={coffeeClick}
            onLamp={props.onLamp}
            onClock={() => props.onNavigate("clock")}
            onTravel={props.onTravel}
            labels={labels}
            host={wrapper}
            clock={clock}
          />
        </Canvas>
      </SceneBoundary>
      <button
        ref={clock}
        className={`clock-banner ${highlight === "clock" ? "is-hovered" : ""}`}
        hidden={portal || !!props.focusedStation}
        onClick={() => props.onNavigate("clock")}
        onMouseEnter={() => setHighlight("clock")}
        onMouseLeave={() => setHighlight(null)}
        onFocus={() => setHighlight("clock")}
        onBlur={() => setHighlight(null)}
        aria-label="Focus the live local clock"
      >
        <time>Local time</time>
        <small>Your timezone</small>
      </button>
      <div className="projected-labels" hidden={portal || !!props.focusedStation}>
        {(Object.keys(stationCopy) as StationKey[]).map((id) => (
          <button
            ref={(element) => {
              labels.current[id] = element;
            }}
            key={id}
            data-station={id}
            className={`scene-label ${activeStation === id ? "is-hovered" : ""}`}
            style={
              {
                "--item-color": deskStationColors[id],
                "--station-color": deskStationColors[id],
              } as React.CSSProperties
            }
            aria-label={`${stationCopy[id].label}. ${stationCopy[id].invitation}`}
            onFocus={() => setHighlight(id)}
            onBlur={() => setHighlight(null)}
            onMouseEnter={() => setHighlight(id)}
            onMouseLeave={() => setHighlight(null)}
            onClick={() => props.onOpen(id)}
          >
            <strong className="label-wide">{stationCopy[id].label}</strong>
            <span>{stationCopy[id].invitation} ↗</span>
          </button>
        ))}
        <button
          ref={(element) => {
            labels.current.coldbrew = element;
          }}
          data-station="coldbrew"
          style={
            {
              "--station-color": deskStationColors.coldbrew,
              "--item-color": deskStationColors.coldbrew,
            } as React.CSSProperties
          }
          className="scene-label coffee-scene-label"
          onClick={coffeeClick}
          onFocus={() => setHighlight("coldbrew")}
          onBlur={() => setHighlight(null)}
          onMouseEnter={() => setHighlight("coldbrew")}
          onMouseLeave={() => setHighlight(null)}
        >
          <strong>A•WAKE</strong>
          <span>Take a coffee break ↗</span>
        </button>
        <a
          ref={(element) => { labels.current.travel = element; }}
          data-station="travel"
          className={`scene-label travel-scene-label ${activeStation === "travel" ? "is-hovered" : ""}`}
          style={{ "--station-color": deskStationColors.travel, "--item-color": deskStationColors.travel } as React.CSSProperties}
          href={sitePath(travelStationCopy.href)}
          aria-label={`${travelStationCopy.label}: ${travelStationCopy.compactLabel}`}
          onFocus={() => setHighlight("travel")}
          onBlur={() => setHighlight(null)}
          onMouseEnter={() => setHighlight("travel")}
          onMouseLeave={() => setHighlight(null)}
        >
          <strong>{travelStationCopy.compactLabel}</strong>
          <span>{travelStationCopy.invitation} ↗</span>
        </a>
      </div>
    </div>
  );
}
