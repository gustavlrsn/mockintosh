/**
 * SpriteManager.ts
 *
 * Bridges the Mockintosh Sprite format (1-byte-per-pixel with optional mask)
 * to QuickDraw GrafPorts. QuickDraw operates on BitMaps; the Sprite format is
 * a Mockintosh extension.
 *
 * All functions write directly to port.portBits.baseAddr, respecting the
 * port's clipRgn and visRgn bounding boxes.
 */

import type { GrafPort } from "@mockintosh/quickdraw";
import type { Sprite } from "./BitCanvas";

// -------------------------------------------------------------------------
// Internal helpers
// -------------------------------------------------------------------------

interface ClipBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

function getPortClip(port: GrafPort): ClipBounds {
  const vis = port.visRgn?.rgn.rgnBBox;
  const clip = port.clipRgn?.rgn.rgnBBox;
  const pr = port.portRect;
  const rowBytes = port.portBits.rowBytes;
  const totalRows = (port.portBits.baseAddr.length / rowBytes) | 0;

  const left = Math.max(vis?.left ?? 0, clip?.left ?? 0, pr.left, 0);
  const top = Math.max(vis?.top ?? 0, clip?.top ?? 0, pr.top, 0);
  const right = Math.min(
    vis?.right ?? rowBytes,
    clip?.right ?? rowBytes,
    pr.right,
    rowBytes
  );
  const bottom = Math.min(
    vis?.bottom ?? totalRows,
    clip?.bottom ?? totalRows,
    pr.bottom,
    totalRows
  );

  return { left, top, right, bottom };
}

// -------------------------------------------------------------------------
// blitSprite — normal sprite blit (srcCopy with mask)
// -------------------------------------------------------------------------

export function blitSprite(
  port: GrafPort,
  sprite: Sprite,
  dx: number,
  dy: number
): void {
  dx = dx | 0;
  dy = dy | 0;
  const { width: sw, height: sh, data, mask } = sprite;
  const pixels = port.portBits.baseAddr;
  const rowBytes = port.portBits.rowBytes;
  const cl = getPortClip(port);

  for (let sy = 0; sy < sh; sy++) {
    const ty = dy + sy;
    if (ty < cl.top || ty >= cl.bottom) continue;
    const srcRow = sy * sw;
    const dstRow = ty * rowBytes;
    for (let sx = 0; sx < sw; sx++) {
      const tx = dx + sx;
      if (tx < cl.left || tx >= cl.right) continue;
      const si = srcRow + sx;
      if (mask && !mask[si]) continue;
      pixels[dstRow + tx] = data[si];
    }
  }
}

// -------------------------------------------------------------------------
// blitSpriteInverted — draw with notSrcCopy (each pixel flipped)
// -------------------------------------------------------------------------

export function blitSpriteInverted(
  port: GrafPort,
  sprite: Sprite,
  dx: number,
  dy: number
): void {
  dx = dx | 0;
  dy = dy | 0;
  const { width: sw, height: sh, data, mask } = sprite;
  const pixels = port.portBits.baseAddr;
  const rowBytes = port.portBits.rowBytes;
  const cl = getPortClip(port);

  for (let sy = 0; sy < sh; sy++) {
    const ty = dy + sy;
    if (ty < cl.top || ty >= cl.bottom) continue;
    const srcRow = sy * sw;
    const dstRow = ty * rowBytes;
    for (let sx = 0; sx < sw; sx++) {
      const tx = dx + sx;
      if (tx < cl.left || tx >= cl.right) continue;
      const si = srcRow + sx;
      if (mask && !mask[si]) continue;
      pixels[dstRow + tx] = data[si] ^ 1;
    }
  }
}

// -------------------------------------------------------------------------
// blitSpriteShadowOutline — dithered shadow effect on mask
// -------------------------------------------------------------------------

export function blitSpriteShadowOutline(
  port: GrafPort,
  sprite: Sprite,
  dx: number,
  dy: number
): void {
  dx = dx | 0;
  dy = dy | 0;
  const { width: sw, height: sh, mask } = sprite;
  if (!mask) return blitSprite(port, sprite, dx, dy);
  const pixels = port.portBits.baseAddr;
  const rowBytes = port.portBits.rowBytes;
  const cl = getPortClip(port);

  for (let sy = 0; sy < sh; sy++) {
    const ty = dy + sy;
    if (ty < cl.top || ty >= cl.bottom) continue;
    const srcRow = sy * sw;
    const dstRow = ty * rowBytes;
    for (let sx = 0; sx < sw; sx++) {
      const tx = dx + sx;
      if (tx < cl.left || tx >= cl.right) continue;
      const si = srcRow + sx;
      if (!mask[si]) continue;
      // Same dither pattern as BitCanvas.blitShadowOutline
      const color =
        (tx % 4 === 0 && ty % 2 === 0) ||
        (tx % 2 === 0 && tx % 4 !== 0 && ty % 2 !== 0)
          ? 1
          : 0;
      pixels[dstRow + tx] = color;
    }
  }
}

// -------------------------------------------------------------------------
// blitSpriteOutline — contour pixels only (opaque pixels with transparent neighbour)
// -------------------------------------------------------------------------

export function blitSpriteOutline(
  port: GrafPort,
  sprite: Sprite,
  dx: number,
  dy: number,
  color: number = 1
): void {
  dx = dx | 0;
  dy = dy | 0;
  const { width: sw, height: sh, mask } = sprite;
  if (!mask) return;
  const pixels = port.portBits.baseAddr;
  const rowBytes = port.portBits.rowBytes;
  const cl = getPortClip(port);

  for (let sy = 0; sy < sh; sy++) {
    const ty = dy + sy;
    if (ty < cl.top || ty >= cl.bottom) continue;
    const srcRow = sy * sw;
    const dstRow = ty * rowBytes;
    for (let sx = 0; sx < sw; sx++) {
      const si = srcRow + sx;
      if (!mask[si]) continue;
      const hasTransparentNeighbor =
        sx === 0 ||
        !mask[si - 1] ||
        sx === sw - 1 ||
        !mask[si + 1] ||
        sy === 0 ||
        !mask[(sy - 1) * sw + sx] ||
        sy === sh - 1 ||
        !mask[(sy + 1) * sw + sx];
      if (!hasTransparentNeighbor) continue;
      const tx = dx + sx;
      if (tx < cl.left || tx >= cl.right) continue;
      pixels[dstRow + tx] = color;
    }
  }
}

// -------------------------------------------------------------------------
// blitImageData — RGBA ImageData threshold to 1-bit
// -------------------------------------------------------------------------

export function blitImageData(
  port: GrafPort,
  imageData: ImageData,
  dx: number,
  dy: number
): void {
  dx = dx | 0;
  dy = dy | 0;
  const { width: sw, height: sh, data } = imageData;
  const pixels = port.portBits.baseAddr;
  const rowBytes = port.portBits.rowBytes;
  const cl = getPortClip(port);

  for (let sy = 0; sy < sh; sy++) {
    const ty = dy + sy;
    if (ty < cl.top || ty >= cl.bottom) continue;
    const dstRow = ty * rowBytes;
    for (let sx = 0; sx < sw; sx++) {
      const tx = dx + sx;
      if (tx < cl.left || tx >= cl.right) continue;
      const si = (sy * sw + sx) * 4;
      const alpha = data[si + 3];
      if (alpha < 128) continue;
      pixels[dstRow + tx] = data[si] < 128 ? 1 : 0;
    }
  }
}

// -------------------------------------------------------------------------
// blit1bitPixels — bulk copy of a 1-byte-per-pixel buffer
// -------------------------------------------------------------------------

export function blit1bitPixels(
  port: GrafPort,
  src: Uint8Array,
  srcW: number,
  srcH: number,
  dx: number,
  dy: number
): void {
  const pixels = port.portBits.baseAddr;
  const rowBytes = port.portBits.rowBytes;
  const cl = getPortClip(port);

  const sx0 = Math.max(0, cl.left - dx);
  const sy0 = Math.max(0, cl.top - dy);
  const sx1 = Math.min(srcW, cl.right - dx, rowBytes - dx);
  const sy1 = Math.min(srcH, cl.bottom - dy);

  if (sx0 >= sx1 || sy0 >= sy1) return;
  const copyW = sx1 - sx0;

  for (let sy = sy0; sy < sy1; sy++) {
    pixels.set(
      src.subarray(sy * srcW + sx0, sy * srcW + sx0 + copyW),
      (dy + sy) * rowBytes + dx + sx0
    );
  }
}

// -------------------------------------------------------------------------
// fillSpriteTile — tile a sprite as a repeating pattern
// -------------------------------------------------------------------------

export function fillSpriteTile(
  port: GrafPort,
  sprite: Sprite,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  x = x | 0;
  y = y | 0;
  w = w | 0;
  h = h | 0;
  const { width: sw, height: sh, data } = sprite;
  const pixels = port.portBits.baseAddr;
  const rowBytes = port.portBits.rowBytes;
  const cl = getPortClip(port);

  const x0 = Math.max(x, cl.left);
  const y0 = Math.max(y, cl.top);
  const x1 = Math.min(x + w, cl.right);
  const y1 = Math.min(y + h, cl.bottom);

  for (let py = y0; py < y1; py++) {
    const row = py * rowBytes;
    const sy = (((py - y) % sh) + sh) % sh;
    for (let px = x0; px < x1; px++) {
      const sx = (((px - x) % sw) + sw) % sw;
      pixels[row + px] = data[sy * sw + sx];
    }
  }
}
