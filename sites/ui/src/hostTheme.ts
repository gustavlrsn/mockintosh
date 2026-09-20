import { createSignal, RADIUS_SCALES, type RadiusScale } from "@mockintosh/ui";

const KEY = "mockintosh-ui-radius";

export const RADIUS_PRESETS = [
  { id: "none", label: "None" },
  { id: "sm", label: "SM" },
  { id: "md", label: "MD" },
  { id: "lg", label: "LG" },
] as const satisfies readonly { id: RadiusScale; label: string }[];

function readStored(): RadiusScale {
  try {
    const raw = localStorage.getItem(KEY);
    if (RADIUS_SCALES.some((id) => id === raw)) return raw as RadiusScale;
  } catch {
    /* ignore */
  }
  return "none";
}

const [radiusScale, setRadiusSignal] = createSignal<RadiusScale>(readStored());

export { radiusScale };

let apply: ((radius: RadiusScale) => void) | undefined;

export function bindThemeHost(fn: (radius: RadiusScale) => void): void {
  apply = fn;
}

export function setRadiusScale(next: RadiusScale): void {
  setRadiusSignal(next);
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* ignore quota / private mode */
  }
  apply?.(next);
}

export function readRadiusScale(): RadiusScale {
  return radiusScale();
}
