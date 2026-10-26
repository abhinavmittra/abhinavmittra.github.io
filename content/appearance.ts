import { coldBrew } from "./cold-brew";

/** Station accents share A•WAKE’s palette; scene surfaces remain neutral. */
export const deskStationColors: Record<string, string> = {
  discovery: coldBrew.palette.sand,
  incident: coldBrew.palette.periwinkle,
  integrations: coldBrew.palette.sand,
  fieldnotes: "#9eab72",
  coldbrew: coldBrew.palette.olive,
  lamp: coldBrew.palette.sand,
};

/** The approved physical desk uses A•WAKE accents on neutral materials. */
export const deskPalette = {
  ...coldBrew.palette,
  graphite: "#252c30",
  metal: "#a7aca7",
  mat: "#303638",
  edge: "#615c48",
};
