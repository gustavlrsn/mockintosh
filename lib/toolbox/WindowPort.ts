/**
 * WindowPort.ts — Per-window GrafPort factory (outside quickdraw)
 *
 * Creates and caches GrafPorts for window content areas with local origin (0,0)
 * at content top-left. Each port shares the screen pixel buffer; portBits.bounds
 * maps local coords to buffer indices (bounds.topLeft = -contentRect in screen).
 */

import type { GrafPort, Rect, RgnHandle } from "@mockintosh/quickdraw";
import {
  makeRect,
  cloneRect,
  patCopy,
  blackColor,
  whiteColor,
} from "@mockintosh/quickdraw";

export interface ContentRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const cache = new Map<string, GrafPort>();

function makeRegion(r: Rect): RgnHandle {
  return { rgn: { rgnSize: 10, rgnBBox: cloneRect(r) } };
}

/**
 * Create or update a GrafPort for the given window's content area.
 * The port has portRect = (0, 0, contentW, contentH) and portBits.bounds
 * = (-contentX, -contentY, screenW - contentX, screenH - contentY) so that
 * local (0,0) maps to the content top-left in the shared screen buffer.
 */
export function getWindowPort(
  windowId: string,
  contentRect: ContentRect,
  screenPort: GrafPort
): GrafPort {
  const existing = cache.get(windowId);
  const screenW = screenPort.portRect.right;
  const screenH = screenPort.portRect.bottom;
  const baseAddr = screenPort.portBits.baseAddr;
  const rowBytes = screenPort.portBits.rowBytes;
  const portRect = makeRect(0, 0, contentRect.w, contentRect.h);
  const bounds = makeRect(
    -contentRect.x,
    -contentRect.y,
    screenW - contentRect.x,
    screenH - contentRect.y
  );

  if (existing) {
    existing.portRect = cloneRect(portRect);
    existing.portBits.baseAddr = baseAddr;
    existing.portBits.rowBytes = rowBytes;
    existing.portBits.bounds = cloneRect(bounds);
    existing.visRgn.rgn.rgnBBox = cloneRect(portRect);
    existing.visRgn.rgn.scanlines = undefined;
    existing.clipRgn.rgn.rgnBBox = cloneRect(portRect);
    existing.clipRgn.rgn.scanlines = undefined;
    return existing;
  }

  const port: GrafPort = {
    device: 0,
    portBits: { baseAddr, rowBytes, bounds: cloneRect(bounds) },
    portRect: cloneRect(portRect),
    visRgn: makeRegion(portRect),
    clipRgn: makeRegion(portRect),
    bkPat: new Uint8Array(8),
    fillPat: new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]),
    pnLoc: { v: 0, h: 0 },
    pnSize: { v: 1, h: 1 },
    pnMode: patCopy,
    pnPat: new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]),
    pnVis: 0,
    txFont: 0,
    txFace: 0,
    txMode: 1,
    txSize: 0,
    spExtra: 0,
    fgColor: blackColor,
    bkColor: whiteColor,
    colrBit: 0,
    patStretch: 0,
    picSave: null,
    rgnSave: null,
    polySave: null,
    grafProcs: screenPort.grafProcs,
  };
  cache.set(windowId, port);
  return port;
}

/**
 * Remove the cached port for a window when it is closed.
 */
export function closeWindowPort(windowId: string): void {
  cache.delete(windowId);
}
