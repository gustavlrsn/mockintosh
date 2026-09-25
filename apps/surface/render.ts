/**
 * Rasterize a `SurfaceScene` into a 1-byte-per-pixel buffer (`0` = white,
 * `1` = black) that `<raster>` can blit. Kept free of QuickDraw so it runs
 * the same headless (tests, icon generation) as on screen.
 */
import type { Point2, SurfaceScene } from "./mesh";

/**
 * `ridgeline` is hidden-line with only the lines running across the screen,
 * the stacked-profiles look of *Unknown Pleasures*.
 */
export type RenderMode = "wireframe" | "hidden" | "shaded" | "ridgeline";

export interface RenderOptions {
  mode: RenderMode;
  /** White ink on black paper, like a plotter terminal. */
  inverted: boolean;
  /** Draw `scene.axes` (default true). */
  axes?: boolean;
}

export interface PixelFrame {
  width: number;
  height: number;
  pixels: Uint8Array;
}

type Ink = 0 | 1;

const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

export function createFrame(width: number, height: number): PixelFrame {
  return { width, height, pixels: new Uint8Array(Math.max(0, width * height)) };
}

function plot(frame: PixelFrame, x: number, y: number, ink: Ink): void {
  if (x < 0 || y < 0 || x >= frame.width || y >= frame.height) return;
  frame.pixels[y * frame.width + x] = ink;
}

export function drawLine(frame: PixelFrame, a: Point2, b: Point2, ink: Ink): void {
  let x0 = Math.round(a.x);
  let y0 = Math.round(a.y);
  const x1 = Math.round(b.x);
  const y1 = Math.round(b.y);
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  // Lines far outside the frame (a wild zoom) are not worth walking.
  if (Math.max(dx, -dy) > 8 * (frame.width + frame.height)) return;
  for (;;) {
    plot(frame, x0, y0, ink);
    if (x0 === x1 && y0 === y1) return;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

/**
 * Even-odd scanline fill sampled at pixel centers, so two quads that share an
 * edge never both claim (or both miss) the pixels along it.
 */
export function fillPolygon(frame: PixelFrame, points: readonly Point2[], inkAt: (x: number, y: number) => Ink): void {
  let top = Infinity;
  let bottom = -Infinity;
  for (const p of points) {
    if (p.y < top) top = p.y;
    if (p.y > bottom) bottom = p.y;
  }
  const y0 = Math.max(0, Math.ceil(top - 0.5));
  const y1 = Math.min(frame.height - 1, Math.floor(bottom - 0.5));
  const xs: number[] = [];
  for (let y = y0; y <= y1; y++) {
    const cy = y + 0.5;
    xs.length = 0;
    for (let k = 0; k < points.length; k++) {
      const p = points[k];
      const q = points[(k + 1) % points.length];
      if ((p.y <= cy && q.y > cy) || (q.y <= cy && p.y > cy)) {
        xs.push(p.x + ((cy - p.y) / (q.y - p.y)) * (q.x - p.x));
      }
    }
    xs.sort((m, n) => m - n);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const xa = Math.max(0, Math.ceil(xs[k] - 0.5));
      const xb = Math.min(frame.width - 1, Math.floor(xs[k + 1] - 0.5));
      const row = y * frame.width;
      for (let x = xa; x <= xb; x++) frame.pixels[row + x] = inkAt(x, y);
    }
  }
}

/** Ordered-dither ink for a brightness in [0, 1]; 1 is paper, 0 is solid ink. */
export function ditherInk(light: number, x: number, y: number, paper: Ink): Ink {
  const level = Math.round(Math.max(0, Math.min(1, light)) * 16);
  const lit = BAYER4[(y & 3) * 4 + (x & 3)] < level;
  return (lit ? paper : 1 - paper) as Ink;
}

export function renderScene(scene: SurfaceScene, frame: PixelFrame, options: RenderOptions): void {
  const paper: Ink = options.inverted ? 1 : 0;
  const ink: Ink = options.inverted ? 0 : 1;
  frame.pixels.fill(paper);
  if (options.axes ?? true) {
    for (const segment of scene.axes) drawLine(frame, segment.a, segment.b, ink);
  }
  const paperAt = () => paper;
  for (const quad of scene.quads) {
    const [a, b, c, d] = quad.corners;
    switch (options.mode) {
      case "shaded": {
        // Keep some tone in the brightest faces so the mesh still reads as a surface.
        const light = 0.12 + quad.light * 0.8;
        fillPolygon(frame, quad.corners, (x, y) => ditherInk(light, x, y, paper));
        break;
      }
      case "ridgeline":
        fillPolygon(frame, quad.corners, paperAt);
        if (scene.ridges === "x") {
          drawLine(frame, a, b, ink);
          drawLine(frame, d, c, ink);
        } else {
          drawLine(frame, b, c, ink);
          drawLine(frame, a, d, ink);
        }
        break;
      case "hidden":
        fillPolygon(frame, quad.corners, paperAt);
      // falls through
      case "wireframe":
        drawLine(frame, a, b, ink);
        drawLine(frame, b, c, ink);
        drawLine(frame, c, d, ink);
        drawLine(frame, d, a, ink);
        break;
    }
  }
}
