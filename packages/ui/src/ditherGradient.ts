/**
 * Box-sized dithered gray ramps. 8×8 QuickDraw patterns cannot do this —
 * the ramp is built at the destination width × height.
 *
 * Directions follow CSS `linear-gradient`: keywords (`to bottom right`) or
 * degrees (`0` = up, clockwise). Radial and conic match the other two CSS
 * gradient families.
 */

import { toBits, type DitherMode, type ImageFrame } from "./dither";
import type {
  DitherGradientFill,
  GradientAt,
  GradientDirection,
  GradientKeyword,
} from "./nodes";

/** CSS degrees: 0 = up, clockwise. */
const KEYWORD_DEG: Record<GradientKeyword, number> = {
  n: 0,
  "to top": 0,
  ne: 45,
  "to top right": 45,
  e: 90,
  "to right": 90,
  se: 135,
  "to bottom right": 135,
  s: 180,
  "to bottom": 180,
  sw: 225,
  "to bottom left": 225,
  w: 270,
  "to left": 270,
  nw: 315,
  "to top left": 315,
};

const AT_XY: Record<string, { x: number; y: number }> = {
  center: { x: 0.5, y: 0.5 },
  n: { x: 0.5, y: 0 },
  top: { x: 0.5, y: 0 },
  ne: { x: 1, y: 0 },
  "top right": { x: 1, y: 0 },
  e: { x: 1, y: 0.5 },
  right: { x: 1, y: 0.5 },
  se: { x: 1, y: 1 },
  "bottom right": { x: 1, y: 1 },
  s: { x: 0.5, y: 1 },
  bottom: { x: 0.5, y: 1 },
  sw: { x: 0, y: 1 },
  "bottom left": { x: 0, y: 1 },
  w: { x: 0, y: 0.5 },
  left: { x: 0, y: 0.5 },
  nw: { x: 0, y: 0 },
  "top left": { x: 0, y: 0 },
};

function clamp01(value: number): number {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

/** Keyword or CSS degrees → heading in degrees (`0` = up, clockwise). */
export function gradientDegrees(direction: GradientDirection = "s"): number {
  if (typeof direction === "number" && Number.isFinite(direction)) {
    return ((direction % 360) + 360) % 360;
  }
  return KEYWORD_DEG[direction as GradientKeyword] ?? 180;
}

export function gradientAt(at: GradientAt | undefined): { x: number; y: number } {
  if (!at) return { x: 0.5, y: 0.5 };
  if (typeof at === "object") {
    return { x: clamp01(at.x), y: clamp01(at.y) };
  }
  return AT_XY[at] ?? { x: 0.5, y: 0.5 };
}

function linearT(nx: number, ny: number, direction: GradientDirection): number {
  const deg = gradientDegrees(direction);
  const rad = (deg * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  const raw = nx * dx + ny * dy;
  const min = (dx < 0 ? dx : 0) + (dy < 0 ? dy : 0);
  const max = (dx > 0 ? dx : 0) + (dy > 0 ? dy : 0);
  if (max === min) return 0.5;
  return (raw - min) / (max - min);
}

function radialT(
  x: number,
  y: number,
  width: number,
  height: number,
  fill: DitherGradientFill,
): number {
  const origin = gradientAt(fill.at);
  const cx = origin.x * Math.max(0, width - 1);
  const cy = origin.y * Math.max(0, height - 1);
  const circle = fill.shape === "circle";
  let max = 0;
  const corners: [number, number][] = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ];
  if (circle) {
    for (const [px, py] of corners) {
      const d = Math.hypot(px - cx, py - cy);
      if (d > max) max = d;
    }
    if (max <= 0) return 0;
    return Math.hypot(x - cx, y - cy) / max;
  }
  const rx = Math.max(cx, width - 1 - cx, 1);
  const ry = Math.max(cy, height - 1 - cy, 1);
  return Math.hypot((x - cx) / rx, (y - cy) / ry);
}

function conicT(
  x: number,
  y: number,
  width: number,
  height: number,
  fill: DitherGradientFill,
): number {
  const origin = gradientAt(fill.at);
  const cx = origin.x * Math.max(0, width - 1);
  const cy = origin.y * Math.max(0, height - 1);
  const start =
    fill.start !== undefined
      ? gradientDegrees(fill.start)
      : typeof fill.direction === "number"
        ? gradientDegrees(fill.direction)
        : 0;
  // atan2(dx, -dy): 0 = up, clockwise, in (-π, π].
  const angle = Math.atan2(x - cx, -(y - cy));
  const deg = ((angle * 180) / Math.PI + 360) % 360;
  return ((deg - start + 360) % 360) / 360;
}

function wrapT(t: number, repeat: number | undefined): number {
  if (repeat === undefined || !(repeat > 0)) return clamp01(t);
  const period = repeat;
  const u = t / period;
  return u - Math.floor(u);
}

/** 0 at the start of a linear `direction`, 1 at the end, across the box. */
export function gradientT(
  x: number,
  y: number,
  width: number,
  height: number,
  direction: GradientDirection,
): number {
  const nx = width <= 1 ? 0.5 : x / (width - 1);
  const ny = height <= 1 ? 0.5 : y / (height - 1);
  return linearT(nx, ny, direction);
}

export function fillGradientT(
  x: number,
  y: number,
  width: number,
  height: number,
  fill: DitherGradientFill,
): number {
  const kind = fill.kind ?? "linear";
  let t: number;
  if (kind === "radial") t = radialT(x, y, width, height, fill);
  else if (kind === "conic") t = conicT(x, y, width, height, fill);
  else {
    const nx = width <= 1 ? 0.5 : x / (width - 1);
    const ny = height <= 1 ? 0.5 : y / (height - 1);
    t = linearT(nx, ny, fill.direction ?? "s");
  }
  return wrapT(t, fill.repeat);
}

function gradientFrame(width: number, height: number, fill: DitherGradientFill): ImageFrame {
  const a = clamp01(fill.from);
  const b = clamp01(fill.to);
  const rgba = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const t = fillGradientT(x, y, width, height, fill);
      const lum = Math.round(255 * (1 - (a + (b - a) * t)));
      const o = (y * width + x) << 2;
      rgba[o] = lum;
      rgba[o + 1] = lum;
      rgba[o + 2] = lum;
      rgba[o + 3] = 255;
    }
  }
  return { width, height, rgba };
}

const GRADIENT_CACHE_CAP = 64;
const gradientCache = new Map<string, Uint8Array>();

function gradientCacheKey(width: number, height: number, fill: DitherGradientFill): string {
  const at = fill.at;
  const atKey =
    at == null ? "" : typeof at === "string" ? at : `${at.x},${at.y}`;
  const dir =
    fill.direction == null
      ? ""
      : typeof fill.direction === "number"
        ? String(fill.direction)
        : fill.direction;
  return [
    width,
    height,
    fill.from,
    fill.to,
    fill.kind ?? "linear",
    dir,
    fill.mode ?? "bayer",
    atKey,
    fill.shape ?? "",
    fill.start ?? "",
    fill.repeat ?? "",
  ].join(":");
}

/** 1-byte-per-pixel (`0` paper, `1` ink) for a laid-out box. */
export function rasterizeDitherGradient(
  width: number,
  height: number,
  fill: DitherGradientFill,
): Uint8Array {
  const w = Math.max(0, width | 0);
  const h = Math.max(0, height | 0);
  if (w < 1 || h < 1) return new Uint8Array(0);
  const key = gradientCacheKey(w, h, fill);
  const hit = gradientCache.get(key);
  if (hit) {
    gradientCache.delete(key);
    gradientCache.set(key, hit);
    return hit;
  }
  const mode: DitherMode = fill.mode === "atkinson" ? "atkinson" : "bayer";
  const bits = toBits(gradientFrame(w, h, fill), mode);
  gradientCache.set(key, bits);
  if (gradientCache.size > GRADIENT_CACHE_CAP) {
    const oldest = gradientCache.keys().next().value;
    if (oldest !== undefined) gradientCache.delete(oldest);
  }
  return bits;
}
