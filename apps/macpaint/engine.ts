/**
 * 1-bit painting primitives for MacPaint. Pixels are unpacked (`0` = white,
 * `1` = black, `width` bytes per row) — the same layout `<raster>` blits.
 */
import { patternInk, type Pattern } from "./patterns";

export interface Bitmap {
  width: number;
  height: number;
  pixels: Uint8Array;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type Plot = (x: number, y: number) => void;

export function createBitmap(width: number, height: number, fill: 0 | 1 = 0): Bitmap {
  const w = Math.max(1, width);
  const h = Math.max(1, height);
  const pixels = new Uint8Array(w * h);
  if (fill) pixels.fill(1);
  return { width: w, height: h, pixels };
}

export function cloneBitmap(src: Bitmap): Bitmap {
  return { width: src.width, height: src.height, pixels: new Uint8Array(src.pixels) };
}

export function resizeBitmap(src: Bitmap, width: number, height: number): Bitmap {
  const next = createBitmap(width, height, 0);
  const cw = Math.min(width, src.width);
  const ch = Math.min(height, src.height);
  for (let y = 0; y < ch; y++) {
    next.pixels.set(src.pixels.subarray(y * src.width, y * src.width + cw), y * next.width);
  }
  return next;
}

/** Copy `src` into `dst` at `(dx, dy)`, clipped to both bitmaps. */
export function blitBitmap(src: Bitmap, dst: Bitmap, dx = 0, dy = 0): void {
  for (let y = 0; y < src.height; y++) {
    const ty = y + dy;
    if (ty < 0 || ty >= dst.height) continue;
    for (let x = 0; x < src.width; x++) {
      const tx = x + dx;
      if (tx < 0 || tx >= dst.width) continue;
      dst.pixels[ty * dst.width + tx] = src.pixels[y * src.width + x];
    }
  }
}

export function inBounds(b: Bitmap, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < b.width && y < b.height;
}

export function getPixel(b: Bitmap, x: number, y: number): 0 | 1 {
  if (!inBounds(b, x, y)) return 0;
  return b.pixels[y * b.width + x] ? 1 : 0;
}

export function setPixel(b: Bitmap, x: number, y: number, ink: 0 | 1): void {
  if (!inBounds(b, x, y)) return;
  b.pixels[y * b.width + x] = ink;
}

export function plotPattern(b: Bitmap, x: number, y: number, pat: Pattern): void {
  setPixel(b, x, y, patternInk(pat, x, y));
}

/** Inclusive axis-aligned rect from two corners. */
export function normalizeRect(x0: number, y0: number, x1: number, y1: number): Rect {
  const l = Math.min(x0, x1);
  const t = Math.min(y0, y1);
  return { x: l, y: t, w: Math.abs(x1 - x0) + 1, h: Math.abs(y1 - y0) + 1 };
}

export function clipRect(b: Bitmap, r: Rect): Rect | null {
  const x = Math.max(0, r.x);
  const y = Math.max(0, r.y);
  const right = Math.min(b.width, r.x + r.w);
  const bottom = Math.min(b.height, r.y + r.h);
  if (right <= x || bottom <= y) return null;
  return { x, y, w: right - x, h: bottom - y };
}

export function invertRect(b: Bitmap, r: Rect): void {
  const c = clipRect(b, r);
  if (!c) return;
  for (let y = 0; y < c.h; y++) {
    const row = (c.y + y) * b.width + c.x;
    for (let x = 0; x < c.w; x++) b.pixels[row + x] ^= 1;
  }
}

export function clearRect(b: Bitmap, r: Rect): void {
  const c = clipRect(b, r);
  if (!c) return;
  for (let y = 0; y < c.h; y++) {
    b.pixels.fill(0, (c.y + y) * b.width + c.x, (c.y + y) * b.width + c.x + c.w);
  }
}

export function fillRectPattern(b: Bitmap, r: Rect, pat: Pattern): void {
  const c = clipRect(b, r);
  if (!c) return;
  for (let y = 0; y < c.h; y++) {
    const py = c.y + y;
    const row = py * b.width + c.x;
    for (let x = 0; x < c.w; x++) b.pixels[row + x] = patternInk(pat, c.x + x, py);
  }
}

/** Bresenham. Inclusive of both endpoints. */
export function walkLine(x0: number, y0: number, x1: number, y1: number, plot: Plot): void {
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

function stamp(plot: Plot, x: number, y: number, thickness: number): void {
  if (thickness <= 1) {
    plot(x, y);
    return;
  }
  const r = Math.floor((thickness - 1) / 2);
  const extra = thickness - 1 - r;
  for (let dy = -r; dy <= extra; dy++) {
    for (let dx = -r; dx <= extra; dx++) plot(x + dx, y + dy);
  }
}

export function strokeLine(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  thickness: number,
  plot: Plot,
): void {
  walkLine(x0, y0, x1, y1, (x, y) => stamp(plot, x, y, thickness));
}

export function frameRect(r: Rect, thickness: number, plot: Plot): void {
  const x1 = r.x + r.w - 1;
  const y1 = r.y + r.h - 1;
  strokeLine(r.x, r.y, x1, r.y, thickness, plot);
  strokeLine(x1, r.y, x1, y1, thickness, plot);
  strokeLine(x1, y1, r.x, y1, thickness, plot);
  strokeLine(r.x, y1, r.x, r.y, thickness, plot);
}

export function fillRectPixels(r: Rect, plot: Plot): void {
  for (let y = 0; y < r.h; y++) {
    for (let x = 0; x < r.w; x++) plot(r.x + x, r.y + y);
  }
}

function insideEllipse(x: number, y: number, r: Rect): boolean {
  if (r.w <= 0 || r.h <= 0) return false;
  const cx = r.x + (r.w - 1) / 2;
  const cy = r.y + (r.h - 1) / 2;
  const rx = r.w / 2;
  const ry = r.h / 2;
  if (rx <= 0 || ry <= 0) return x === r.x && y === r.y;
  const nx = (x - cx) / rx;
  const ny = (y - cy) / ry;
  return nx * nx + ny * ny <= 1;
}

export function fillOval(r: Rect, plot: Plot): void {
  for (let y = 0; y < r.h; y++) {
    for (let x = 0; x < r.w; x++) {
      if (insideEllipse(r.x + x, r.y + y, r)) plot(r.x + x, r.y + y);
    }
  }
}

export function frameOval(r: Rect, thickness: number, plot: Plot): void {
  const inset = Math.max(1, thickness);
  for (let y = -1; y <= r.h; y++) {
    for (let x = -1; x <= r.w; x++) {
      const px = r.x + x;
      const py = r.y + y;
      if (!insideEllipse(px, py, r)) continue;
      let edge = false;
      for (const [dx, dy] of [[-inset, 0], [inset, 0], [0, -inset], [0, inset]] as const) {
        if (!insideEllipse(px + dx, py + dy, r)) {
          edge = true;
          break;
        }
      }
      if (edge) plot(px, py);
    }
  }
}

function cornerRadius(r: Rect): number {
  return Math.max(0, Math.min(8, Math.floor(Math.min(r.w, r.h) / 2)));
}

function insideRoundRect(x: number, y: number, r: Rect, rad: number): boolean {
  if (x < r.x || y < r.y || x >= r.x + r.w || y >= r.y + r.h) return false;
  if (rad <= 0) return true;
  const lx = r.x + rad;
  const ty = r.y + rad;
  const rx = r.x + r.w - 1 - rad;
  const by = r.y + r.h - 1 - rad;
  if (x >= lx && x <= rx) return true;
  if (y >= ty && y <= by) return true;
  const cx = x < lx ? lx : rx;
  const cy = y < ty ? ty : by;
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= rad * rad;
}

export function fillRoundRect(r: Rect, plot: Plot): void {
  const rad = cornerRadius(r);
  for (let y = 0; y < r.h; y++) {
    for (let x = 0; x < r.w; x++) {
      if (insideRoundRect(r.x + x, r.y + y, r, rad)) plot(r.x + x, r.y + y);
    }
  }
}

export function frameRoundRect(r: Rect, thickness: number, plot: Plot): void {
  const rad = cornerRadius(r);
  const inset = Math.max(1, thickness);
  for (let y = -1; y <= r.h; y++) {
    for (let x = -1; x <= r.w; x++) {
      const px = r.x + x;
      const py = r.y + y;
      if (!insideRoundRect(px, py, r, rad)) continue;
      let edge = false;
      for (const [dx, dy] of [[-inset, 0], [inset, 0], [0, -inset], [0, inset]] as const) {
        if (!insideRoundRect(px + dx, py + dy, r, rad)) {
          edge = true;
          break;
        }
      }
      if (edge) plot(px, py);
    }
  }
}

export function floodFill(b: Bitmap, sx: number, sy: number, pat: Pattern): void {
  if (!inBounds(b, sx, sy)) return;
  const seed = getPixel(b, sx, sy);
  const { width: w, height: h, pixels } = b;
  const visited = new Uint8Array(pixels.length);
  const stack = [sy * w + sx];
  while (stack.length) {
    const i = stack.pop()!;
    if (visited[i]) continue;
    if (pixels[i] !== seed) continue;
    visited[i] = 1;
    const x = i % w;
    const y = (i - x) / w;
    pixels[i] = patternInk(pat, x, y);
    if (x > 0) stack.push(i - 1);
    if (x + 1 < w) stack.push(i + 1);
    if (y > 0) stack.push(i - w);
    if (y + 1 < h) stack.push(i + w);
  }
}

export function brushStamp(b: Bitmap, cx: number, cy: number, size: number, pat: Pattern): void {
  if (size <= 1) {
    plotPattern(b, cx, cy, pat);
    return;
  }
  const r = size / 2;
  const ir = Math.ceil(r);
  const r2 = r * r;
  for (let dy = -ir; dy <= ir; dy++) {
    for (let dx = -ir; dx <= ir; dx++) {
      if (dx * dx + dy * dy <= r2) plotPattern(b, cx + dx, cy + dy, pat);
    }
  }
}

export function eraserStamp(b: Bitmap, cx: number, cy: number, size: number): void {
  const s = Math.max(1, size);
  const half = Math.floor(s / 2);
  clearRect(b, { x: cx - half, y: cy - half, w: s, h: s });
}

export function spray(
  b: Bitmap,
  cx: number,
  cy: number,
  radius: number,
  pat: Pattern,
  random: () => number = Math.random,
): void {
  const dots = Math.max(6, radius * 3);
  for (let i = 0; i < dots; i++) {
    const ang = random() * Math.PI * 2;
    const dist = random() * radius;
    plotPattern(b, Math.round(cx + Math.cos(ang) * dist), Math.round(cy + Math.sin(ang) * dist), pat);
  }
}

export function extractRect(src: Bitmap, r: Rect): Bitmap {
  const c = clipRect(src, r) ?? { x: 0, y: 0, w: 1, h: 1 };
  const out = createBitmap(c.w, c.h, 0);
  for (let y = 0; y < c.h; y++) {
    out.pixels.set(src.pixels.subarray((c.y + y) * src.width + c.x, (c.y + y) * src.width + c.x + c.w), y * c.w);
  }
  return out;
}
