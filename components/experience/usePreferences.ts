"use client";
import { useEffect, useState } from "react";
import type { Atmosphere } from "./types";
import { defaultLook, readLook, readAtmosphere } from "./preferences";
const key = "systems-desk-experience-v3";
export function usePreferences() {
  const [ready, setReady] = useState(false);
  const [minimal, setMinimal] = useState(true);
  const [motion, setMotion] = useState(false);
  const [atmosphere, setAtmosphere] = useState<Atmosphere>("daylight");
  const [look, setLook] = useState(defaultLook);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let saved: Record<string, unknown> = {};
    try {
      const current = localStorage.getItem(key);
      const legacy = JSON.parse(
        localStorage.getItem("abhi-desk-look-graphite-v1") || "{}",
      );
      const previous = JSON.parse(
        localStorage.getItem("systems-desk-experience-v2") || "{}",
      );
      // v2 persisted Studio even without a user choice. Migrate that regression back to Daylight.
      const value = current
        ? JSON.parse(current)
        : {
            ...previous,
            atmosphere: previous?.atmosphere === "dusk" ? "dusk" : "daylight",
            look: legacy,
          };
      if (value && typeof value === "object" && !Array.isArray(value))
        saved = value;
    } catch {
      /* Storage is optional. */
    }
    setMinimal(
      typeof saved.minimal === "boolean" ? saved.minimal : media.matches,
    );
    setMotion(!media.matches && saved.motion !== false);
    setAtmosphere(readAtmosphere(saved.atmosphere));
    setLook(readLook(saved.look, media.matches));
    setReady(true);
    const change = () => {
      if (media.matches) setLook((value) => ({ ...value, gentle: true }));
    };
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(
        key,
        JSON.stringify({ minimal, motion, atmosphere, look }),
      );
    } catch {
      /* Private mode works without persistence. */
    }
  }, [ready, minimal, motion, atmosphere, look]);
  return {
    ready,
    minimal,
    setMinimal,
    motion,
    setMotion,
    atmosphere,
    setAtmosphere,
    look,
    setLook,
  };
}
