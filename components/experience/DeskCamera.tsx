"use client";
import { useEffect, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as THREE from "three";
import { deskPositions } from "@/components/three/restoredDesk";
import type { SceneProps } from "./types";
import type { CameraAngle } from "./preferences";

type Flight = {
  elapsed: number;
  from: THREE.Vector3;
  to: THREE.Vector3;
  fromTarget: THREE.Vector3;
  target: THREE.Vector3;
  fromZoom: number;
  zoom: number;
  coffee: boolean;
};
export type CameraPose = {
  position: [number, number, number];
  target: [number, number, number];
  zoom: number;
  commandId: number;
  coffee: boolean;
};
const clamp = THREE.MathUtils.clamp;
/** Orbit owns the camera between explicit flights. No scroll handler can pull it back each frame. */
export function DeskCamera({
  command,
  motion,
  orbit,
  onChapter,
  pose,
  angle,
  speed,
}: Pick<SceneProps, "command" | "motion" | "orbit" | "onChapter"> & {
  pose: RefObject<CameraPose | null>;
  angle: CameraAngle;
  speed: number;
}) {
  const { camera: rawCamera, gl, size, invalidate } = useThree();
  const camera = rawCamera as THREE.OrthographicCamera;
  const controls = useRef<OrbitControls | null>(null),
    flight = useRef<Flight | null>(null),
    zoom = useRef(1),
    lastCommand = useRef(-1),
    report = useRef({ time: 0, frames: 0 });
  const saved = useRef({ motion, orbit, onChapter, command, speed });
  saved.current = { motion, orbit, onChapter, command, speed };
  const manual = useRef(false),
    applying = useRef(false),
    portal = useRef(false);
  useEffect(() => {
    const control = new OrbitControls(camera, gl.domElement);
    controls.current = control;
    control.target.set(0, 0.35, 0);
    control.enableDamping = true;
    control.dampingFactor = 0.09;
    control.rotateSpeed = 0.55;
    control.zoomSpeed = 0.6;
    control.enablePan = false;
    control.minPolarAngle = 0.12;
    control.maxPolarAngle = Math.PI * 0.48;
    control.minZoom = 0.65;
    control.maxZoom = 2.8;
    control.autoRotateSpeed = 0.6;
    if (pose.current) {
      camera.position.fromArray(pose.current.position);
      control.target.fromArray(pose.current.target);
      camera.zoom = pose.current.zoom;
      camera.updateProjectionMatrix();
      lastCommand.current = pose.current.commandId;
      portal.current = pose.current.coffee;
    }
    control.update();
    zoom.current = camera.zoom;
    const start = () => {
      flight.current = null;
      manual.current = true;
      zoom.current = camera.zoom;
    };
    const end = () => {
      manual.current = false;
    };
    const change = () => {
      if (manual.current && !applying.current) zoom.current = camera.zoom;
      invalidate();
    };
    control.addEventListener("start", start);
    control.addEventListener("end", end);
    control.addEventListener("change", change);
    const wheel = (event: WheelEvent) => {
      // Pinch uses OrbitControls. Desktop wheels use our eased zoom target.
      if (matchMedia("(pointer:coarse)").matches && !event.ctrlKey) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      flight.current = null;
      const delta = clamp(
        event.deltaY *
          (event.deltaMode === 1
            ? 16
            : event.deltaMode === 2
              ? size.height
              : 1),
        -120,
        120,
      );
      zoom.current = clamp(zoom.current * Math.exp(-delta * 0.0018), 0.65, 2.8);
      invalidate();
    };
    const key = (event: KeyboardEvent) => {
      if (["+", "=", "-", "_"].includes(event.key)) {
        event.preventDefault();
        zoom.current = clamp(
          zoom.current * (event.key === "-" || event.key === "_" ? 0.85 : 1.18),
          0.65,
          2.8,
        );
        flight.current = null;
        invalidate();
      } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        flight.current = null;
        const offset = camera.position.clone().sub(control.target);
        offset.applyAxisAngle(
          THREE.Object3D.DEFAULT_UP,
          event.key === "ArrowLeft" ? 0.12 : -0.12,
        );
        camera.position.copy(control.target).add(offset);
        control.update();
        invalidate();
      }
    };
    gl.domElement.tabIndex = 0;
    gl.domElement.addEventListener("wheel", wheel, {
      capture: true,
      passive: false,
    });
    gl.domElement.addEventListener("keydown", key);
    return () => {
      pose.current = {
        position: camera.position.toArray(),
        target: control.target.toArray(),
        zoom: camera.zoom,
        commandId: flight.current ? -1 : saved.current.command.id,
        coffee: portal.current,
      };
      gl.domElement.removeEventListener("wheel", wheel, true);
      gl.domElement.removeEventListener("keydown", key);
      control.removeEventListener("start", start);
      control.removeEventListener("end", end);
      control.removeEventListener("change", change);
      control.dispose();
      controls.current = null;
    };
  }, [camera, gl, invalidate]);
  useEffect(() => {
    // Fit the original room fragment at any aspect ratio without changing the user's orbit or zoom.
    const aspect = size.width / Math.max(1, size.height),
      span = Math.max(11.8, 18.6 / aspect);
    camera.left = (-span * aspect) / 2;
    camera.right = (span * aspect) / 2;
    camera.top = span / 2;
    camera.bottom = -span / 2;
    camera.updateProjectionMatrix();
    invalidate();
  }, [size.width, size.height, camera, invalidate]);
  useEffect(() => {
    const control = controls.current;
    if (!control || lastCommand.current === command.id) return;
    lastCommand.current = command.id;
    if (command.target === "zoom-in" || command.target === "zoom-out") {
      flight.current = null;
      zoom.current = clamp(
        zoom.current * (command.target === "zoom-in" ? 1.18 : 1 / 1.18),
        0.65,
        2.8,
      );
      invalidate();
      return;
    }
    const coffee = command.target === "coffee",
      clock = command.target === "clock";
    const target = new THREE.Vector3(0, 0.35, 0);
    let targetZoom = 1;
    if (command.target !== "overview") {
      const p = deskPositions[command.target];
      target.set(p[0], p[1] + 0.9, p[2]);
      targetZoom = coffee ? 2.5 : clock ? 2.3 : 1.4;
      // Leave the bottle on the left of the desktop catalogue overlay.
      if (coffee && size.width >= 600) target.x += 1.9;
    }
    const offset = coffee
      ? new THREE.Vector3(4, 3, 13)
      : clock
        ? new THREE.Vector3(7, 4, 12)
        : angle === "overhead"
          ? new THREE.Vector3(0, 22, 0.8)
          : angle === "low"
            ? new THREE.Vector3(12, 5, 16)
            : new THREE.Vector3(12, 11, 14);
    // Discard residual orbit damping once before taking ownership for an explicit transition.
    control.enableDamping = false;
    control.update();
    control.enableDamping = saved.current.motion;
    flight.current = {
      elapsed: 0,
      from: camera.position.clone(),
      to: target.clone().add(offset),
      fromTarget: control.target.clone(),
      target,
      fromZoom: camera.zoom,
      zoom: targetZoom,
      coffee,
    };
    if (!coffee && portal.current) {
      portal.current = false;
      saved.current.onChapter(false);
    }
    invalidate();
  }, [command, camera, invalidate, size.width, angle]);
  useFrame((_, delta) => {
    const control = controls.current;
    if (!control) return;
    const dt = Math.min(delta, 0.05);
    const current = flight.current;
    applying.current = true;
    if (current) {
      control.autoRotate = false;
      control.enableDamping = false;
      current.elapsed += dt;
      const t = saved.current.motion ? Math.min(1, current.elapsed / 0.95) : 1;
      const eased = t * t * t * (t * (t * 6 - 15) + 10); // Quintic ease: zero acceleration at both ends.
      camera.position.lerpVectors(current.from, current.to, eased);
      control.target.lerpVectors(current.fromTarget, current.target, eased);
      camera.zoom = THREE.MathUtils.lerp(current.fromZoom, current.zoom, eased);
      zoom.current = camera.zoom;
      camera.updateProjectionMatrix();
      control.update();
      if (t === 1) {
        flight.current = null;
        if (current.coffee && !portal.current) {
          portal.current = true;
          saved.current.onChapter(true);
        }
      } else invalidate();
    } else {
      control.enableDamping = saved.current.motion;
      control.dampingFactor = 1 - Math.exp(-8 * dt);
      control.autoRotate =
        saved.current.orbit && saved.current.motion && !portal.current;
      if (!manual.current && Math.abs(camera.zoom - zoom.current) > 0.0001) {
        camera.zoom = saved.current.motion
          ? THREE.MathUtils.damp(camera.zoom, zoom.current, 10, dt)
          : zoom.current;
        camera.updateProjectionMatrix();
        invalidate();
      }
      control.autoRotateSpeed = (0.6 * saved.current.speed) / 100;
      control.update(dt);
    }
    applying.current = false;
    const stats = report.current;
    stats.time += delta;
    stats.frames++;
    gl.domElement.dataset.dpr = gl.getPixelRatio().toFixed(2);
    gl.domElement.dataset.antialias = String(
      gl.getContext().getContextAttributes()?.antialias,
    );
    gl.domElement.dataset.zoom = camera.zoom.toFixed(3);
    gl.domElement.dataset.azimuth = control.getAzimuthalAngle().toFixed(3);
    if (stats.time >= 1) {
      gl.domElement.dataset.drawCalls = String(gl.info.render.calls);
      gl.domElement.dataset.triangles = String(gl.info.render.triangles);
      gl.domElement.dataset.fps = String(Math.round(stats.frames / stats.time));
      gl.domElement.dataset.geometries = String(gl.info.memory.geometries);
      gl.domElement.dataset.textures = String(gl.info.memory.textures);
      stats.time = 0;
      stats.frames = 0;
    }
  });
  return null;
}
