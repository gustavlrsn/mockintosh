/**
 * BitMap operations — from `QuickDraw.p` Graphical Operations on BitMaps
 * section.
 *
 * {@link CopyBits} is the primary entry point for blitting between bitmaps
 * (or from an offscreen buffer to the screen) with scaling and clipping.
 * {@link ScrollRect} provides hardware-scroll semantics with automatic
 * update-region tracking.
 */

import { BitMap, Rect, RgnHandle, GrafPort, Pattern, cloneRect, makeRect } from "./types";
import { globals } from "./globals";
import { BitBlt, drawRectToPort, pointInRegion } from "./bitblt";
import { getBit, setBit } from "./packedBits";
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

  // Clamp to destination bitmap bounds
  const dstBnd = dstBits.bounds;
  clipLeft = Math.max(clipLeft, dstBnd.left);
  clipTop = Math.max(clipTop, dstBnd.top);
  clipRight = Math.min(clipRight, dstBnd.right);
  clipBottom = Math.min(clipBottom, dstBnd.bottom);

  if (clipLeft >= clipRight || clipTop >= clipBottom) return;

  // Scale factors
  const xScale = sw / dw;
  const yScale = sh / dh;

  const hasMask = maskRgn !== null;
  const hasComplexClip =
    port &&
    ((port.visRgn.rgn.scanlines && port.visRgn.rgn.scanlines.length > 0) ||
      (port.clipRgn.rgn.scanlines && port.clipRgn.rgn.scanlines.length > 0));

  // Unscaled, unmasked, rectangular clip: move whole bytes. The source span
  // that corresponds to the clipped destination must lie inside the source.
  if (xScale === 1 && yScale === 1 && !hasMask && !hasComplexClip) {
    const sLeft = srcRect.left + (clipLeft - dstRect.left);
    const sTop = srcRect.top + (clipTop - dstRect.top);
    const w = clipRight - clipLeft;
    const h = clipBottom - clipTop;
    const sb = srcBits.bounds;
    if (sLeft >= sb.left && sLeft + w <= sb.right && sTop >= sb.top && sTop + h <= sb.bottom) {
      BitBlt(
        srcBits,
        dstBits,
        makeRect(sTop, sLeft, sTop + h, sLeft + w),
        makeRect(clipTop, clipLeft, clipBottom, clipRight),
        mode,
        globals.black
      );
      return;
    }
  }

  for (let dy = clipTop; dy < clipBottom; dy++) {
    if (hasMask && maskRgn && !pointInRegion(maskRgn, 0, dy)) continue;

    const sy = (srcRect.top + (dy - dstRect.top) * yScale) | 0;
    const syInside = sy >= srcBits.bounds.top && sy < srcBits.bounds.bottom;

    for (let dx = clipLeft; dx < clipRight; dx++) {
      if (hasMask && maskRgn && !pointInRegion(maskRgn, dx, dy)) continue;
      if (hasComplexClip && port) {
        if (!pointInRegion(port.visRgn, dx, dy)) continue;
        if (!pointInRegion(port.clipRgn, dx, dy)) continue;
      }

      const sx = (srcRect.left + (dx - dstRect.left) * xScale) | 0;
      const srcPx =
        syInside && sx >= srcBits.bounds.left && sx < srcBits.bounds.right
          ? getBit(srcBits, sx, sy)
          : 0;
      const dstPx = getBit(dstBits, dx, dy);

      // Modes 4–7 invert the source before the boolean operation
      // (matching the EOR D7,D0 step in the original 68k BitBlt.a).
      const s = mode & 4 ? 1 - srcPx : srcPx;
      let result: number;
      switch (mode & 3) {
        case 0:
          result = s;
          break; // copy
        case 1:
          result = s | dstPx;
          break; // or
        case 2:
          result = s ^ dstPx;
          break; // xor
        case 3:
          result = (1 - s) & dstPx;
          break; // bic: (NOT src) AND dst
        default:
          result = s;
      }

      setBit(dstBits, dx, dy, result);
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

  if (cdLeft < cdRight && cdTop < cdBottom) {
    // A self-copy; BitBlt orders the rows so none is overwritten before it
    // is read, and blitRowBits snapshots a row that shifts onto itself.
    BitBlt(
      bm,
      bm,
      makeRect(cdTop - dv, cdLeft - dh, cdBottom - dv, cdRight - dh),
      makeRect(cdTop, cdLeft, cdBottom, cdRight),
      srcCopy,
      globals.black
    );
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
