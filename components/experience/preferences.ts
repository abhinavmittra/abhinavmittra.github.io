import type { Atmosphere } from "./types";
export type CameraAngle = "isometric" | "overhead" | "low";
export interface DeskLook {
  accent: string;
  light: number;
  speed: number;
  separation: number;
  angle: CameraAngle;
  gentle: boolean;
}
export const defaultLook: DeskLook = {
  accent: "#7d89d9",
  light: 100,
  speed: 100,
  separation: 0,
  angle: "isometric",
  gentle: false,
};
export function readLook(value: unknown, reduced = false): DeskLook {
  const record =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const number = (
    key: "light" | "speed" | "separation",
    min: number,
    max: number,
  ) => {
    const n = record[key];
    return typeof n === "number" && Number.isFinite(n)
      ? Math.min(max, Math.max(min, n))
      : defaultLook[key];
  };
  return {
    accent:
      typeof record.accent === "string" && /^#[0-9a-f]{6}$/i.test(record.accent)
        ? record.accent.toLowerCase()
        : defaultLook.accent,
    light: number("light", 50, 160),
    speed: number("speed", 20, 200),
    separation: number("separation", 0, 100),
    angle: ["isometric", "overhead", "low"].includes(String(record.angle))
      ? (record.angle as CameraAngle)
      : "isometric",
    gentle: reduced || record.gentle === true,
  };
}
export function readAtmosphere(value: unknown): Atmosphere {
  return value === "studio" || value === "dusk" || value === "daylight"
    ? value
    : "daylight";
}
/** Keep a visible focus/link colour even when a custom accent is very light or dark. */
export function accentText(accent: string, atmosphere: Atmosphere) {
  const rgb = accent
    .slice(1)
    .match(/../g)!
    .map((v) => parseInt(v, 16));
  const luminance = (values: number[]) =>
    values
      .map((n) => n / 255)
      .map((n) => (n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4))
      .reduce((sum, n, i) => sum + n * [0.2126, 0.7152, 0.0722][i], 0);
  const ground = atmosphere === "daylight" ? [250, 251, 240] : [32, 42, 43];
  const target = atmosphere === "daylight" ? 20 : 245;
  for (let i = 0; i < 30; i++) {
    const a = luminance(rgb),
      b = luminance(ground);
    if ((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= 4.5) break;
    rgb.forEach((n, j) => {
      rgb[j] = n + (target - n) * 0.12;
    });
  }
  return `rgb(${rgb.map(Math.round).join(" ")})`;
}
