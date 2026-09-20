/**
 * Kit theme — tokens widgets read so a host can restyle chrome in one place.
 * Radius follows the shadcn pattern: one base, then md/sm step down 2px.
 */

import { createContext, useContext, type Accessor } from "solid-js";

export const RADIUS_SCALES = ["none", "sm", "md", "lg"] as const;
export type RadiusScale = (typeof RADIUS_SCALES)[number];
export type RadiusStep = "sm" | "md" | "lg";

export const RADIUS_PX: Record<RadiusScale, number> = {
  none: 0,
  sm: 2,
  md: 4,
  lg: 6,
};

export interface UITheme {
  radius: RadiusScale;
}

export const DEFAULT_THEME: UITheme = { radius: "none" };

export function themeRadius(theme: UITheme, step: RadiusStep = "lg"): number {
  const base = RADIUS_PX[theme.radius];
  if (step === "lg") return base;
  if (step === "md") return Math.max(0, base - 2);
  return Math.max(0, base - 4);
}

export interface ThemeContextValue {
  theme: Accessor<UITheme>;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: () => DEFAULT_THEME,
});

export function useTheme(): UITheme {
  return useContext(ThemeContext).theme();
}

/**
 * Pixel radius for a step. Call the accessor in JSX (`borderRadius={radius()}`)
 * so `setTheme` updates; a one-shot `const n = useRadius()()` stays stale.
 */
export function useRadius(step: RadiusStep = "lg"): Accessor<number> {
  const theme = useContext(ThemeContext).theme;
  return () => themeRadius(theme(), step);
}
