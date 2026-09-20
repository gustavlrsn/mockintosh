import type { HitMask, RasterSurface } from "@mockintosh/ui";
import type { FillStyle, ShapeElement } from "./document";
import { LINE_HIT_SLACK, lineEndpoints } from "./document";

export function fillInk(style: FillStyle, x: number, y: number): 0 | 1 | null {
  if (style === "none") return null;
  if (style === "white") return 0;
  if (style === "black") return 1;
  if (style === "gray50") return ((x + y) & 1) as 0 | 1;
  if (style === "gray25") return (x & 1) === 0 && (y & 1) === 0 ? 1 : 0;
  return (x & 1) === 0 && (y & 1) === 0 ? 0 : 1;
}

function insideEllipse(x: number, y: number, w: number, h: number): boolean {
  if (w <= 0 || h <= 0) return false;
  const cx = (w - 1) / 2;
  const cy = (h - 1) / 2;
  const rx = w / 2;
  const ry = h / 2;
  if (rx <= 0 || ry <= 0) return x === 0 && y === 0;
  const nx = (x - cx) / rx;
  const ny = (y - cy) / ry;
  return nx * nx + ny * ny <= 1;
}

function walkLine(x0: number, y0: number, x1: number, y1: number, plot: (x: number, y: number) => void): void {
  let x = x0;
  let y = y0;
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    plot(x, y);
    if (x === x1 && y === y1) break;
    const e2 = err * 2;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
}

export function paintOval(surface: RasterSurface, el: ShapeElement): void {
  const w = el.width;
  const h = el.height;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!insideEllipse(x, y, w, h)) continue;
      const ink = fillInk(el.fill, el.x + x, el.y + y);
      if (ink !== null) surface.setPixel(x, y, ink);
      if (!el.stroke) continue;
      let edge = false;
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
        if (!insideEllipse(x + dx, y + dy, w, h)) {
          edge = true;
          break;
        }
      }
      if (edge) surface.setPixel(x, y, 1);
    }
  }
}

export function paintLine(surface: RasterSurface, el: ShapeElement): void {
  const { x0, y0, x1, y1 } = lineEndpoints(el);
  walkLine(x0 - el.x, y0 - el.y, x1 - el.x, y1 - el.y, (x, y) => surface.setPixel(x, y, 1));
}

export function boxFill(style: FillStyle): 0 | 1 | "gray25" | "gray50" | "gray75" | undefined {
  if (style === "none") return undefined;
  if (style === "white") return 0;
  if (style === "black") return 1;
  return style;
}

export function ovalHitMask(w: number, h: number): HitMask {
  const data = new Uint8Array(Math.max(0, w) * Math.max(0, h));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (insideEllipse(x, y, w, h)) data[y * w + x] = 1;
    }
  }
  return { data, width: w, height: h };
}

export function lineHitMask(el: ShapeElement): HitMask {
  const w = el.width;
  const h = el.height;
  const data = new Uint8Array(Math.max(0, w) * Math.max(0, h));
  const { x0, y0, x1, y1 } = lineEndpoints(el);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x1 - x0;
      const dy = y1 - y0;
      const len2 = dx * dx + dy * dy;
      const px = el.x + x;
      const py = el.y + y;
      let dist: number;
      if (len2 === 0) dist = Math.hypot(px - x0, py - y0);
      else {
        let t = ((px - x0) * dx + (py - y0) * dy) / len2;
        t = Math.max(0, Math.min(1, t));
        dist = Math.hypot(px - (x0 + t * dx), py - (y0 + t * dy));
      }
      if (dist <= LINE_HIT_SLACK) data[y * w + x] = 1;
    }
  }
  return { data, width: w, height: h };
}
