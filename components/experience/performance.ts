import type { Quality } from "./types";
/** Conservative, sticky degradation: avoid repeated GPU context reconstruction. */
export function lowerQuality(quality: Quality): Quality {
  return quality === "high" ? "balanced" : "low";
}
export const qualitySettings = {
  high: { maxDpr: 2, shadows: true, antialias: true },
  balanced: { maxDpr: 2, shadows: false, antialias: true },
  low: { maxDpr: 1.65, shadows: false, antialias: true },
} as const;
export function damp(
  current: number,
  target: number,
  delta: number,
  speed = 7,
) {
  return (
    current +
    (target - current) * (1 - Math.exp(-speed * Math.min(delta, 0.05)))
  );
}
export function mailDraft(email: string, subject: string, body: string) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
