"use client";
import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { createRestoredDesk } from "@/components/three/restoredDesk";
import { createStationLabels } from "@/components/three/stationLabels";
import { createClockBanner } from "@/components/three/clockBanner";
import type { SceneProps } from "./types";
import type { ProjectKey } from "@/content/portfolio";

type Props = Pick<
  SceneProps,
  "motion" | "flow" | "look" | "arrival" | "lamp" | "atmosphere" | "onOpen"
> & {
  active: boolean;
  showClock: boolean;
  showLabels: boolean;
  compact: boolean;
  highlight: string | null;
  onHover: (id: string | null) => void;
  onCoffee: () => void;
  onLamp: () => void;
  onClock: () => void;
  onTravel: () => void;
  labels: RefObject<Record<string, HTMLElement | null>>;
  host: RefObject<HTMLDivElement | null>;
  clock: RefObject<HTMLButtonElement | null>;
};
export function DeskModel(props: Props) {
  const root = useRef<THREE.Group>(null),
    runtime = useRef<ReturnType<typeof createRestoredDesk> | null>(null);
  const annotations = useRef<ReturnType<typeof createStationLabels> | null>(
      null,
    ),
    banner = useRef<ReturnType<typeof createClockBanner> | null>(null);
  const { invalidate, gl, camera } = useThree();
  const options = useRef(props);
  options.current = props;
  // Camera flights measure station bounds in a passive effect after this model is attached.
  useLayoutEffect(() => {
    const desk = createRestoredDesk(invalidate);
    runtime.current = desk;
    root.current?.add(desk.world);
    desk.setLamp(options.current.lamp);
    desk.theme(options.current.atmosphere);
    desk.setAccent(options.current.look.accent);
    desk.highlight(options.current.highlight);
    const buttons = Object.values(props.labels.current).filter(
      Boolean,
    ) as HTMLElement[];
    if (props.host.current && buttons.length)
      annotations.current = createStationLabels(
        props.host.current,
        desk.stations,
        buttons,
      );
    if (props.host.current && props.clock.current)
      banner.current = createClockBanner(
        props.host.current,
        desk.clock,
        props.clock.current,
      );
    gl.domElement.dataset.batchedMeshes = String(desk.batched);
    gl.domElement.dataset.occupiedChair = String(desk.occupiedChair);
    invalidate();
    return () => {
      annotations.current?.dispose();
      annotations.current = null;
      banner.current?.dispose();
      banner.current = null;
      desk.world.removeFromParent();
      desk.dispose();
      runtime.current = null;
    };
  }, [invalidate, gl, props.labels, props.host, props.clock]);
  useEffect(() => {
    runtime.current?.setLamp(props.lamp);
    invalidate();
  }, [props.lamp, invalidate]);
  useEffect(() => {
    runtime.current?.theme(props.atmosphere);
    invalidate();
  }, [props.atmosphere, invalidate]);
  useEffect(() => {
    runtime.current?.setAccent(props.look.accent);
    invalidate();
  }, [props.look.accent, invalidate]);
  useEffect(() => {
    if (props.arrival > 0) runtime.current?.replay();
    invalidate();
  }, [props.arrival, invalidate]);
  useEffect(() => {
    runtime.current?.highlight(props.highlight);
    invalidate();
  }, [props.highlight, invalidate]);
  useEffect(() => {
    if (!props.active) return;
    // Real time still ticks while decorative motion is paused; at rest this is one frame a second.
    const timer = setInterval(invalidate, 1000);
    return () => clearInterval(timer);
  }, [invalidate, props.active]);
  useFrame((_, delta) => {
    const desk = runtime.current;
    if (!desk) return;
    const lampAnimating = desk.update(
      delta,
      options.current,
      (readout: {
        time: string;
        zone: string;
        iso: string;
        hour: number;
        minute: number;
        second: number;
      }) => {
        const button = props.clock.current;
        if (button) {
          const time = button.querySelector("time"),
            zone = button.querySelector("small");
          if (time) {
            time.textContent = readout.time;
            time.dateTime = readout.iso;
          }
          if (zone) zone.textContent = readout.zone;
          button.setAttribute(
            "aria-label",
            `Focus the clock. ${readout.time} ${readout.zone}`,
          );
        }
        gl.domElement.dataset.clockTime = readout.iso;
        gl.domElement.dataset.clockAngles = `${readout.hour},${readout.minute},${readout.second}`;
      },
    );
    const obstacles = banner.current?.update(camera, props.showClock) || [];
    if (lampAnimating) invalidate();
    if (props.showLabels) annotations.current?.update(camera, delta, {
      separation: props.look.separation / 100,
      hovered: props.highlight,
      snap: !props.motion,
      obstacles,
    });
  });
  function identity(object: THREE.Object3D): string | null {
    let item: THREE.Object3D | null = object;
    while (item) {
      if (item.userData.action) return item.userData.action;
      if (item.userData.station) return item.userData.station;
      item = item.parent;
    }
    return null;
  }
  function click(event: ThreeEvent<MouseEvent>) {
    if (event.delta > 5) return;
    const id = identity(event.object);
    if (!id) return;
    event.stopPropagation();
    if (id === "lamp") props.onLamp();
    else if (id === "clock") props.onClock();
    else if (id === "coldbrew") props.onCoffee();
    else if (id === "travel") props.onTravel();
    else props.onOpen(id as ProjectKey);
  }
  return (
    <group
      ref={root}
      onClick={click}
      // Touch navigation uses clicks and the story dock. Without hover handlers R3F
      // skips pointer-move raycasts across the entire desk while a phone is orbiting.
      onPointerMove={props.compact ? undefined : (event) => {
        const id = identity(event.object);
        if (id) {
          event.stopPropagation();
          props.onHover(id);
        }
      }}
      onPointerOut={props.compact ? undefined : () => props.onHover(null)}
    />
  );
}
