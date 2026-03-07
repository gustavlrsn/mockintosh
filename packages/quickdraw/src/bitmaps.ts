/**
 * BitMap operations — from `QuickDraw.p` Graphical Operations on BitMaps
 * section.
 *
 * {@link CopyBits} is the primary entry point for blitting between bitmaps
 * (or from an offscreen buffer to the screen) with scaling and clipping.
 * {@link ScrollRect} provides hardware-scroll semantics with automatic
 * update-region tracking.
 */

import { BitMap, Rect, RgnHandle, GrafPort, Pattern, cloneRect } from "./types";
import { globals } from "./globals";
import { BitBlt, drawRectToPort, pointInRegion } from "./bitblt";
import { srcCopy } from "./constants";
import { SetRectRgn } from "./regions";

// -------------------------------------------------------------------------
// CopyBits
// -------------------------------------------------------------------------

/**
 * Copy (and optionally scale) pixels from `srcBits[srcRect]` to
 * `dstBits[dstRect]` using the given transfer `mode`.
 *
 * - Supports arbitrary scaling (nearest-neighbour interpolation).
 * - Clips to `port.visRgn`, `port.clipRgn`, and `port.portRect` when
 *   `dstBits` is the current port's bitmap.
 * - If `maskRgn` is non-null, only pixels inside the mask are updated.
 *
 * `PROCEDURE CopyBits(srcBits, dstBits: BitMap; srcRect, dstRect: Rect;
 *                     mode: INTEGER; maskRgn: RgnHandle)`.
 *
 * @param srcBits  Source bitmap.
 * @param dstBits  Destination bitmap (may equal the current port's portBits).
 * @param srcRect  Source area in `srcBits` coordinates.
 * @param dstRect  Destination area in `dstBits` coordinates.
 * @param mode     QuickDraw transfer mode (0–7).
 * @param maskRgn  Optional mask region; `null` means no mask.
 */
export function CopyBits(
  srcBits: BitMap,
  dstBits: BitMap,
  srcRect: Rect,
  dstRect: Rect,
  mode: number,
  maskRgn: RgnHandle | null
): void {
  const port = globals.thePort;

  const sw = srcRect.right - srcRect.left;
  const sh = srcRect.bottom - srcRect.top;
  const dw = dstRect.right - dstRect.left;
  const dh = dstRect.bottom - dstRect.top;

  if (sw === 0 || sh === 0 || dw === 0 || dh === 0) return;

  // Clip destination to port (if port provided and dstBits matches portBits)
  let clipLeft = dstRect.left;
  let clipTop = dstRect.top;
  let clipRight = dstRect.right;
  let clipBottom = dstRect.bottom;

  if (port && dstBits.baseAddr === port.portBits.baseAddr) {
    const vis = port.visRgn.rgn.rgnBBox;
    const clip = port.clipRgn.rgn.rgnBBox;
    clipLeft = Math.max(clipLeft, vis.left, clip.left, port.portRect.left);
    clipTop = Math.max(clipTop, vis.top, clip.top, port.portRect.top);
    clipRight = Math.min(clipRight, vis.right, clip.right, port.portRect.right);
    clipBottom = Math.min(
      clipBottom,
      vis.bottom,
      clip.bottom,
      port.portRect.bottom
    );
  }

  // Clamp to buffer bounds
  clipLeft = Math.max(clipLeft, 0);
  clipTop = Math.max(clipTop, 0);
  clipRight = Math.min(clipRight, dstBits.rowBytes);
  clipBottom = Math.min(
    clipBottom,
    (dstBits.baseAddr.length / dstBits.rowBytes) | 0
  );

  if (clipLeft >= clipRight || clipTop >= clipBottom) return;

  // Scale factors
  const xScale = sw / dw;
  const yScale = sh / dh;

  const hasMask = maskRgn !== null;
  const hasComplexClip =
    port &&
    ((port.visRgn.rgn.scanlines && port.visRgn.rgn.scanlines.length > 0) ||
      (port.clipRgn.rgn.scanlines && port.clipRgn.rgn.scanlines.length > 0));

  for (let dy = clipTop; dy < clipBottom; dy++) {
    if (hasMask && maskRgn && !pointInRegion(maskRgn, 0, dy)) continue;

    const sy = (srcRect.top + (dy - dstRect.top) * yScale) | 0;
    const sRow = sy * srcBits.rowBytes;
    const dRow = dy * dstBits.rowBytes;

    for (let dx = clipLeft; dx < clipRight; dx++) {
      if (hasMask && maskRgn && !pointInRegion(maskRgn, dx, dy)) continue;
      if (hasComplexClip && port) {
        if (!pointInRegion(port.visRgn, dx, dy)) continue;
        if (!pointInRegion(port.clipRgn, dx, dy)) continue;
      }

      const sx = (srcRect.left + (dx - dstRect.left) * xScale) | 0;
      const srcPx =
        sx >= 0 && sx < srcBits.rowBytes && sRow + sx < srcBits.baseAddr.length
          ? srcBits.baseAddr[sRow + sx]
          : 0;
      const dstPx = dstBits.baseAddr[dRow + dx];

      let result: number;
      switch (mode & 7) {
        case 0:
          result = srcPx;
          break; // copy / notCopy
        case 1:
          result = srcPx | dstPx;
          break; // or
        case 2:
          result = srcPx ^ dstPx;
          break; // xor
        case 3:
          result = srcPx & ~dstPx;
          break; // bic
        default:
          result = srcPx;
      }
      if (mode >= 4 && mode <= 7) result = 1 - result; // not* variants

      dstBits.baseAddr[dRow + dx] = result & 1;
    }
  }
}

// -------------------------------------------------------------------------
// ScrollRect
// -------------------------------------------------------------------------

/**
 * Scroll the pixels inside `dstRect` by `(dh, dv)` pixels, erase the
 * exposed strip using the port's background pattern, and record the exposed
 * area in `updateRgn`.
 *
 * `PROCEDURE ScrollRect(dstRect: Rect; dh, dv: INTEGER; updateRgn: RgnHandle)`.
 *
 * @param dstRect   The rectangle to scroll (in local port coordinates).
 * @param dh        Horizontal scroll amount (positive = right).
 * @param dv        Vertical scroll amount (positive = down).
 * @param updateRgn Receives the bounding rectangle of the newly exposed area.
 */
export function ScrollRect(
  dstRect: Rect,
  dh: number,
  dv: number,
  updateRgn: RgnHandle
): void {
  const port = globals.thePort;
  if (!port) return;

  const bm = port.portBits;
  const sw = dstRect.right - dstRect.left;
  const sh = dstRect.bottom - dstRect.top;
  const srcR: Rect = cloneRect(dstRect);
  const dstR: Rect = {
    top: dstRect.top + dv,
    left: dstRect.left + dh,
    bottom: dstRect.bottom + dv,
    right: dstRect.right + dh,
  };

  // Clip dstR to dstRect
  const cdLeft = Math.max(dstR.left, dstRect.left);
  const cdTop = Math.max(dstR.top, dstRect.top);
  const cdRight = Math.min(dstR.right, dstRect.right);
  const cdBottom = Math.min(dstR.bottom, dstRect.bottom);
  const csLeft = cdLeft - dh;
  const csTop = cdTop - dv;
  const csRight = cdRight - dh;
  const csBottom = cdBottom - dv;

  if (cdLeft < cdRight && cdTop < cdBottom) {
    // Copy pixels (must handle direction to avoid overwrite)
    if (dv > 0) {
      for (let y = cdBottom - 1; y >= cdTop; y--) {
        const sy = y - dv;
        bm.baseAddr.copyWithin(
          y * bm.rowBytes + cdLeft,
          sy * bm.rowBytes + csLeft,
          sy * bm.rowBytes + csRight
        );
      }
    } else {
      for (let y = cdTop; y < cdBottom; y++) {
        const sy = y - dv;
        bm.baseAddr.copyWithin(
          y * bm.rowBytes + cdLeft,
          sy * bm.rowBytes + csLeft,
          sy * bm.rowBytes + csRight
        );
      }
    }
  }

  // Erase the revealed (update) region using bkPat
  // Compute the update region as dstRect minus the scrolled destination
  // Simplified: fill exposed strips
  if (dv > 0) {
    // Top strip exposed
    drawRectToPort(
      dstRect.left,
      dstRect.top,
      dstRect.right,
      dstRect.top + dv,
      port.bkPat,
      8,
      port
    );
  } else if (dv < 0) {
    drawRectToPort(
      dstRect.left,
      dstRect.bottom + dv,
      dstRect.right,
      dstRect.bottom,
      port.bkPat,
      8,
      port
    );
  }
  if (dh > 0) {
    drawRectToPort(
      dstRect.left,
      dstRect.top,
      dstRect.left + dh,
      dstRect.bottom,
      port.bkPat,
      8,
      port
    );
  } else if (dh < 0) {
    drawRectToPort(
      dstRect.right + dh,
      dstRect.top,
      dstRect.right,
      dstRect.bottom,
      port.bkPat,
      8,
      port
    );
  }

  // Record the update region (simplified: the exposed strip(s))
  updateRgn.rgn.rgnBBox = cloneRect(dstRect);
  updateRgn.rgn.scanlines = undefined;
}
