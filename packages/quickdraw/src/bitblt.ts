// BitBlt — the core raster engine.
// Implements all 16 QuickDraw transfer modes operating on 1-bpp pixel buffers.
// Matches the behaviour described in reference/QuickDraw/BitBlt.a.
//
// All pixel buffers use 1 byte per pixel (0 = white, 1 = black).

import { BitMap, Pattern, Rect, GrafPort, RgnHandle } from "./types";
import { globals } from "./globals";

// -------------------------------------------------------------------------
// Pattern sampling (8-byte packed pattern → 1-bit pixel)
// The original Pattern is a PACKED ARRAY[0..7] OF 0..255.
// Bit 7 of each byte is the leftmost pixel.
// -------------------------------------------------------------------------

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

  // Clamp to pixel buffer bounds
  left = Math.max(left, 0);
  top = Math.max(top, 0);
  right = Math.min(right, port.portBits.rowBytes);
  bottom = Math.min(
    bottom,
    port.portBits.baseAddr.length / port.portBits.rowBytes
  );

  if (left >= right || top >= bottom) return null;
  return { left, top, right, bottom };
}

// Test whether a point is inside a region (handles complex scanline regions)
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

// -------------------------------------------------------------------------
// Core BitBlt
// Transfers from srcBits[srcRect] → dstBits[dstRect] using mode + pattern.
// No clipping — callers are responsible for clipping before calling.
// -------------------------------------------------------------------------

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
    const sRow = sy * srcBits.rowBytes;
    const dRow = dy * dstBits.rowBytes;
    for (let col = 0; col < width; col++) {
      const sx = srcLeft + col;
      const dx = dstLeft + col;

      const src = usePattern
        ? samplePattern(pat, dx, dy)
        : srcBits.baseAddr[sRow + sx];
      const dst = dstBits.baseAddr[dRow + dx];
      dstBits.baseAddr[dRow + dx] = applyMode(mode, src, dst) & 1;
    }
  }
}

// -------------------------------------------------------------------------
// DrawPixel — write a single pixel to thePort with clipping + mode
// -------------------------------------------------------------------------

export function drawPixelToPort(x: number, y: number, port: GrafPort): void {
  // Check clip
  const vis = port.visRgn.rgn.rgnBBox;
  const clip = port.clipRgn.rgn.rgnBBox;
  const pr = port.portRect;
  if (x < Math.max(vis.left, clip.left, pr.left, 0)) return;
  if (y < Math.max(vis.top, clip.top, pr.top, 0)) return;
  if (x >= Math.min(vis.right, clip.right, pr.right, port.portBits.rowBytes))
    return;
  if (
    y >=
    Math.min(
      vis.bottom,
      clip.bottom,
      pr.bottom,
      (port.portBits.baseAddr.length / port.portBits.rowBytes) | 0
    )
  )
    return;

  const patPx = samplePattern(port.pnPat, x, y);
  const mode = port.pnMode;
  const idx = y * port.portBits.rowBytes + x;
  const dst = port.portBits.baseAddr[idx];
  port.portBits.baseAddr[idx] = applyMode(mode, patPx, dst) & 1;
}

// -------------------------------------------------------------------------
// DrawRect — fill/frame a rectangle into the port's pixel buffer
// Used by StdRect and all rect drawing routines.
// -------------------------------------------------------------------------

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
  const hasComplexClip =
    (port.visRgn.rgn.scanlines && port.visRgn.rgn.scanlines.length > 0) ||
    (port.clipRgn.rgn.scanlines && port.clipRgn.rgn.scanlines.length > 0);

  for (let y = cl.top; y < cl.bottom; y++) {
    const row = y * rowBytes;
    for (let x = cl.left; x < cl.right; x++) {
      if (hasComplexClip) {
        if (!pointInRegion(port.visRgn, x, y)) continue;
        if (!pointInRegion(port.clipRgn, x, y)) continue;
      }
      const src = samplePattern(pat, x, y);
      const idx = row + x;
      pixels[idx] = applyMode(mode, src, pixels[idx]) & 1;
    }
  }
}

// -------------------------------------------------------------------------
// DrawHSpan — draw a single horizontal span (used by shape scanline fillers)
// -------------------------------------------------------------------------

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

// -------------------------------------------------------------------------
// SetPixel in a BitMap at (h, v) with per-pixel colour
// -------------------------------------------------------------------------

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
  const idx = v * bm.rowBytes + h;
  if (idx >= 0 && idx < bm.baseAddr.length) bm.baseAddr[idx] = color & 1;
}

export function bmGetPixel(bm: BitMap, h: number, v: number): number {
  if (
    v < bm.bounds.top ||
    v >= bm.bounds.bottom ||
    h < bm.bounds.left ||
    h >= bm.bounds.right
  )
    return 0;
  const idx = v * bm.rowBytes + h;
  if (idx < 0 || idx >= bm.baseAddr.length) return 0;
  return bm.baseAddr[idx] & 1;
}
