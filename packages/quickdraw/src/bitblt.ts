/**
 * BitBlt — the core 1-bpp raster engine.
 *
 * Implements all 16 QuickDraw transfer modes operating on flat pixel buffers
 * (1 byte per pixel, `0`=white, `1`=black).  Matches the behaviour described
 * in `reference/QuickDraw/BitBlt.a`.
 *
 * Internal helper functions (`drawRectToPort`, `drawHSpan`, `drawPixelToPort`)
 * are used by all shape-drawing modules.  `BitBlt` itself is the low-level
 * block transfer used by {@link CopyBits}.
 */

import { BitMap, Pattern, Rect, GrafPort, RgnHandle } from "./types";
import { globals } from "./globals";

/**
 * Sample a single pixel from an 8-byte packed pattern at screen position
 * `(x, y)`.  The pattern tiles with period 8 in both axes.
 *
 * The original Pattern is `PACKED ARRAY[0..7] OF 0..255`: bit 7 of each byte
 * is the leftmost pixel.
 *
 * @returns `1` (black) or `0` (white).
 */

export function samplePattern(pat: Pattern, x: number, y: number): number {
  const row = pat[y & 7];
  const bit = 7 - (x & 7);
  return (row >> bit) & 1;
}

// -------------------------------------------------------------------------
// Apply a single transfer mode to one pixel
// -------------------------------------------------------------------------

function applyMode(mode: number, src: number, dst: number): number {
  switch (mode) {
    case 0:
      return src; // srcCopy
    case 1:
      return src | dst; // srcOr
    case 2:
      return src ^ dst; // srcXor
    case 3:
      return src & ~dst; // srcBic  (clears dst where src=1)
    case 4:
      return 1 - src; // notSrcCopy
    case 5:
      return (1 - src) | dst; // notSrcOr
    case 6:
      return (1 - src) ^ dst; // notSrcXor
    case 7:
      return (1 - src) & ~dst; // notSrcBic
    // modes 8-15 are pattern modes — src is the pattern pixel
    case 8:
      return src; // patCopy
    case 9:
      return src | dst; // patOr
    case 10:
      return src ^ dst; // patXor
    case 11:
      return src & ~dst; // patBic
    case 12:
      return 1 - src; // notPatCopy
    case 13:
      return (1 - src) | dst; // notPatOr
    case 14:
      return (1 - src) ^ dst; // notPatXor
    case 15:
      return (1 - src) & ~dst; // notPatBic
    default:
      return src;
  }
}

// -------------------------------------------------------------------------
// Clip rect intersection helpers
// -------------------------------------------------------------------------

function intersectClip(
  left: number,
  top: number,
  right: number,
  bottom: number,
  port: GrafPort
): { left: number; top: number; right: number; bottom: number } | null {
  // Intersect with visRgn bbox
  const vis = port.visRgn.rgn.rgnBBox;
  left = Math.max(left, vis.left);
  top = Math.max(top, vis.top);
  right = Math.min(right, vis.right);
  bottom = Math.min(bottom, vis.bottom);

  // Intersect with clipRgn bbox
  const clip = port.clipRgn.rgn.rgnBBox;
  left = Math.max(left, clip.left);
  top = Math.max(top, clip.top);
  right = Math.min(right, clip.right);
  bottom = Math.min(bottom, clip.bottom);

  // Intersect with portRect
  left = Math.max(left, port.portRect.left);
  top = Math.max(top, port.portRect.top);
  right = Math.min(right, port.portRect.right);
  bottom = Math.min(bottom, port.portRect.bottom);

  // Clamp to portBits.bounds (local coords of the pixel buffer)
  const bnd = port.portBits.bounds;
  left = Math.max(left, bnd.left);
  top = Math.max(top, bnd.top);
  right = Math.min(right, bnd.right);
  bottom = Math.min(bottom, bnd.bottom);

  if (left >= right || top >= bottom) return null;
  return { left, top, right, bottom };
}

/**
 * Test whether pixel `(h, v)` lies inside region `rgn`.
 *
 * For rectangular regions (no scanlines) a simple bounding-box test is used.
 * For complex regions the scanline inversion-point list is consulted: a pixel
 * is inside if the count of `xs[i] <= h` on that row is **odd**.
 */
export function pointInRegion(rgn: RgnHandle, h: number, v: number): boolean {
  const r = rgn.rgn;
  if (
    v < r.rgnBBox.top ||
    v >= r.rgnBBox.bottom ||
    h < r.rgnBBox.left ||
    h >= r.rgnBBox.right
  )
    return false;

  if (!r.scanlines || r.scanlines.length === 0) return true; // rectangular

  // Find the scanline for row v
  for (const sl of r.scanlines) {
    if (sl.y === v) {
      // xs is a sorted list of x inversion points
      // The region is "inside" at x if the number of xs <= x is odd
      let inside = false;
      for (const x of sl.xs) {
        if (x > h) break;
        inside = !inside;
      }
      return inside;
    }
  }
  return false;
}

/**
 * Low-level block transfer: copy/combine pixels from `srcBits[srcRect]`
 * to `dstBits[dstRect]` using the given transfer `mode` and `pat`.
 *
 * When `mode >= 8` the source pixels are ignored and `pat` is sampled at
 * each destination coordinate instead (pattern modes).
 *
 * **No clipping is performed** — callers must clip rectangles before calling.
 *
 * @param srcBits  Source bitmap.
 * @param dstBits  Destination bitmap (may be the same as srcBits for self-copy).
 * @param srcRect  Source rectangle in `srcBits` coordinate space.
 * @param dstRect  Destination rectangle in `dstBits` coordinate space.
 * @param mode     QuickDraw transfer mode (0–15).
 * @param pat      Pattern used for modes 8–15; ignored for modes 0–7.
 */

export function BitBlt(
  srcBits: BitMap,
  dstBits: BitMap,
  srcRect: Rect,
  dstRect: Rect,
  mode: number,
  pat: Pattern
): void {
  const srcLeft = srcRect.left;
  const srcTop = srcRect.top;
  const dstLeft = dstRect.left;
  const dstTop = dstRect.top;
  const width = Math.min(
    srcRect.right - srcRect.left,
    dstRect.right - dstRect.left
  );
  const height = Math.min(
    srcRect.bottom - srcRect.top,
    dstRect.bottom - dstRect.top
  );
  const usePattern = mode >= 8;

  for (let row = 0; row < height; row++) {
    const sy = srcTop + row;
    const dy = dstTop + row;
    const sRow = (sy - srcBits.bounds.top) * srcBits.rowBytes;
    const dRow = (dy - dstBits.bounds.top) * dstBits.rowBytes;
    for (let col = 0; col < width; col++) {
      const sx = srcLeft + col;
      const dx = dstLeft + col;

      const src = usePattern
        ? samplePattern(pat, dx, dy)
        : srcBits.baseAddr[sRow + (sx - srcBits.bounds.left)];
      const dst = dstBits.baseAddr[dRow + (dx - dstBits.bounds.left)];
      dstBits.baseAddr[dRow + (dx - dstBits.bounds.left)] =
        applyMode(mode, src, dst) & 1;
    }
  }
}

/**
 * Write a single pixel to the current port at `(x, y)` using the port's pen
 * pattern and mode, respecting visRgn / clipRgn / portRect clipping.
 */

export function drawPixelToPort(x: number, y: number, port: GrafPort): void {
  const vis = port.visRgn.rgn.rgnBBox;
  const clip = port.clipRgn.rgn.rgnBBox;
  const pr = port.portRect;
  const bnd = port.portBits.bounds;
  if (x < Math.max(vis.left, clip.left, pr.left, bnd.left)) return;
  if (y < Math.max(vis.top, clip.top, pr.top, bnd.top)) return;
  if (x >= Math.min(vis.right, clip.right, pr.right, bnd.right)) return;
  if (y >= Math.min(vis.bottom, clip.bottom, pr.bottom, bnd.bottom)) return;

  const patPx = samplePattern(port.pnPat, x, y);
  const mode = port.pnMode;
  const idx = (y - bnd.top) * port.portBits.rowBytes + (x - bnd.left);
  const dst = port.portBits.baseAddr[idx];
  port.portBits.baseAddr[idx] = applyMode(mode, patPx, dst) & 1;
}

/**
 * Fill or frame a rectangle into the current port's pixel buffer, applying
 * clipping (visRgn, clipRgn, portRect) and the given transfer mode.
 *
 * Used internally by `StdRect` and all other rectangle-drawing code.  If
 * the port has a complex clip region the per-pixel `pointInRegion` check is
 * applied; for rectangular clips a fast bounding-box path is used.
 *
 * @param left, top, right, bottom  Rectangle to fill (local port coordinates).
 * @param pat   Pattern to tile across the rectangle.
 * @param mode  QuickDraw transfer mode.
 * @param port  The port to draw into.
 */

export function drawRectToPort(
  left: number,
  top: number,
  right: number,
  bottom: number,
  pat: Pattern,
  mode: number,
  port: GrafPort
): void {
  const cl = intersectClip(left, top, right, bottom, port);
  if (!cl) return;

  const pixels = port.portBits.baseAddr;
  const rowBytes = port.portBits.rowBytes;
  const bnd = port.portBits.bounds;
  const hasComplexClip =
    (port.visRgn.rgn.scanlines && port.visRgn.rgn.scanlines.length > 0) ||
    (port.clipRgn.rgn.scanlines && port.clipRgn.rgn.scanlines.length > 0);

  for (let y = cl.top; y < cl.bottom; y++) {
    const row = (y - bnd.top) * rowBytes;
    for (let x = cl.left; x < cl.right; x++) {
      if (hasComplexClip) {
        if (!pointInRegion(port.visRgn, x, y)) continue;
        if (!pointInRegion(port.clipRgn, x, y)) continue;
      }
      const src = samplePattern(pat, x, y);
      const idx = row + (x - bnd.left);
      pixels[idx] = applyMode(mode, src, pixels[idx]) & 1;
    }
  }
}

/**
 * Draw a single horizontal span from `x0` (inclusive) to `x1` (exclusive)
 * at row `y` into the current port.  Used by scanline-fill rasterizers
 * (ovals, arcs, regions, polygons).
 */

export function drawHSpan(
  x0: number,
  x1: number,
  y: number,
  pat: Pattern,
  mode: number,
  port: GrafPort
): void {
  drawRectToPort(x0, y, x1, y + 1, pat, mode, port);
}

/**
 * Set pixel `(h, v)` in bitmap `bm` to `color` (0 or 1).
 * Performs bounds checking; out-of-bounds writes are silently ignored.
 */

export function bmSetPixel(
  bm: BitMap,
  h: number,
  v: number,
  color: number
): void {
  if (
    v < bm.bounds.top ||
    v >= bm.bounds.bottom ||
    h < bm.bounds.left ||
    h >= bm.bounds.right
  )
    return;
  const idx = (v - bm.bounds.top) * bm.rowBytes + (h - bm.bounds.left);
  if (idx >= 0 && idx < bm.baseAddr.length) bm.baseAddr[idx] = color & 1;
}

/**
 * Read the pixel value at `(h, v)` from bitmap `bm`.
 * Returns `0` for out-of-bounds reads.
 */
export function bmGetPixel(bm: BitMap, h: number, v: number): number {
  if (
    v < bm.bounds.top ||
    v >= bm.bounds.bottom ||
    h < bm.bounds.left ||
    h >= bm.bounds.right
  )
    return 0;
  const idx = (v - bm.bounds.top) * bm.rowBytes + (h - bm.bounds.left);
  if (idx < 0 || idx >= bm.baseAddr.length) return 0;
  return bm.baseAddr[idx] & 1;
}
