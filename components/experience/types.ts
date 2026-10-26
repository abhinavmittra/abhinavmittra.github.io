import type { DeskLook } from "./preferences";
import type { ProjectKey, StationKey } from "@/content/portfolio";
export type Quality = "high" | "balanced" | "low";
export type Atmosphere = "studio" | "dusk" | "daylight";
export type Panel =
  ProjectKey | "story" | "notebook" | "roadmap" | "contact" | "settings" | null;
export interface SceneCommand {
  id: number;
  target: StationKey | "overview" | "coffee" | "clock" | "zoom-in" | "zoom-out";
}
export interface SceneProps {
  compact: boolean;
  focusedStation: StationKey | null;
  motion: boolean;
  suspended: boolean;
  flow: boolean;
  look: DeskLook;
  arrival: number;
  orbit: boolean;
  lamp: boolean;
  atmosphere: Atmosphere;
  quality: Quality;
  command: SceneCommand;
  onQuality: (quality: Quality) => void;
  onOpen: (key: ProjectKey) => void;
  onChapter: (coffee: boolean) => void;
  onUnavailable: () => void;
  onNavigate: (target: SceneCommand["target"]) => void;
  onLamp: () => void;
  onTravel: () => void;
}
