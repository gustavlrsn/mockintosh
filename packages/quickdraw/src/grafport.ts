/**
 * GrafPort management routines — from `QuickDraw.p` GrafPort Routines section
 * and `GrafAsm.a` implementation.
 *
 * A **GrafPort** is the drawing context for all QuickDraw operations.  You
 * must call {@link InitGraf} once at start-up (providing the screen bitmap),
 * then {@link OpenPort} or {@link newGrafPort} to create a port and
 * {@link SetPort} to make it current before drawing anything.
 */

import {
  GrafPort,
  GrafPtr,
  BitMap,
  Pattern,
  RgnHandle,
  Region,
  Rect,
  makeRect,
  cloneRect,
} from "./types";
import { globals, QDScreen } from "./globals";
import { patCopy, blackColor, whiteColor } from "./constants";
import { SectRect } from "./rects";
import { newBitMap } from "./packedBits";

// -------------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------------

function makeRegion(r: Rect): RgnHandle {
  return { rgn: { rgnSize: 10, rgnBBox: cloneRect(r) } };
}

function copyPattern(src: Pattern): Pattern {
  return new Uint8Array(src);
}

// -------------------------------------------------------------------------
// InitGraf
// -------------------------------------------------------------------------

/**
 * Initialise the QuickDraw global state.
 *
 * Must be called **once** at system start-up before any other QuickDraw
 * routine.  Provides the pixel buffer the OS will use as the screen.
 * Matches `PROCEDURE InitGraf(globalPtr: QDPtr)` from `QuickDraw.p`.
 *
 * @param screen  Screen size, optionally with a host-owned packed framebuffer.
 */
export function InitGraf(screen: QDScreen): void {
  globals._screen = screen;
  globals.screenBits = screen.bits ?? newBitMap(screen.width, screen.height);
  globals.randSeed = 1;
  globals.thePort = null;
}

// -------------------------------------------------------------------------
// OpenPort / InitPort / ClosePort
// -------------------------------------------------------------------------

/**
 * Allocate fresh clip and vis regions for `port`, then call {@link InitPort}.
 *
 * `PROCEDURE OpenPort(port: GrafPtr)` from `QuickDraw.p`.
 * The visRgn is set to the current screen bounds; clipRgn is set wide-open.
 *
 * @param port  An uninitialised {@link GrafPort} object to set up in place.
 */
export function OpenPort(port: GrafPort): void {
  const bounds = cloneRect(globals.screenBits.bounds);
  port.visRgn = makeRegion(bounds);
  port.clipRgn = makeRegion(makeRect(-32767, -32767, 32767, 32767));
  InitPort(port);
}

/**
 * Reset all fields of `port` to their standard defaults and make it the
 * current port (`globals.thePort`).
 *
 * `PROCEDURE InitPort(port: GrafPtr)` from `QuickDraw.p` / `GrafAsm.a`.
 * Pen is set to 1×1 black, mode `patCopy`; text is system font, size 0;
 * background is white; foreground is black.
 *
 * @param port  The port to initialise.  Existing clip/vis regions are reused.
 */
export function InitPort(port: GrafPort): void {
  globals.thePort = port;

  port.device = 0;

  // portBits := screenBits
  port.portBits = {
    baseAddr: globals.screenBits.baseAddr,
    rowBytes: globals.screenBits.rowBytes,
    bounds: cloneRect(globals.screenBits.bounds),
  };

  // portRect := screenBits.bounds
  port.portRect = cloneRect(globals.screenBits.bounds);

  // visRgn := portRect (rectangular)
  if (port.visRgn) {
    port.visRgn.rgn.rgnBBox = cloneRect(port.portRect);
    port.visRgn.rgn.scanlines = undefined;
  } else {
    port.visRgn = makeRegion(port.portRect);
  }

  // clipRgn := wideOpen
  if (port.clipRgn) {
    port.clipRgn.rgn.rgnBBox = cloneRect(globals.wideOpen.rgn.rgnBBox);
    port.clipRgn.rgn.scanlines = undefined;
  } else {
    port.clipRgn = makeRegion(cloneRect(globals.wideOpen.rgn.rgnBBox));
  }

  port.bkPat = copyPattern(globals.white);
  port.fillPat = copyPattern(globals.black);
  port.pnLoc = { v: 0, h: 0 };
  port.pnSize = { v: 1, h: 1 };
  port.pnMode = patCopy;
  port.pnPat = copyPattern(globals.black);
  port.pnVis = 0;
  port.txFont = 0;
  port.txFace = 0;
  port.txMode = 1; // srcOr
  port.txSize = 0;
  port.spExtra = 0;
  port.fgColor = blackColor;
  port.bkColor = whiteColor;
  port.colrBit = 0;
  port.patStretch = 0;
  port.picSave = null;
  port.rgnSave = null;
  port.polySave = null;
  port.grafProcs = null;
}

/**
 * Close a port, releasing its association with `globals.thePort`.
 *
 * `PROCEDURE ClosePort(port: GrafPtr)` from `QuickDraw.p`.
 * In JS the region memory is garbage-collected; this call is mainly needed
 * to clear `globals.thePort` when the current port is being destroyed.
 *
 * @param port  The port to close.
 */
export function ClosePort(port: GrafPort): void {
  // No-op in JS; references will be GC'd
  if (globals.thePort === port) {
    globals.thePort = null;
  }
}

// -------------------------------------------------------------------------
// Port management
// -------------------------------------------------------------------------

/**
 * Make `port` the current drawing port.
 * `PROCEDURE SetPort(port: GrafPtr)`.
 */
export function SetPort(port: GrafPort): void {
  globals.thePort = port;
}

/**
 * Return the current drawing port.
 * `PROCEDURE GetPort(VAR port: GrafPtr)` — returns the value rather than
 * writing to a VAR parameter.
 */
export function GetPort(): GrafPort | null {
  return globals.thePort;
}

/** Set the device number of the current port (`PROCEDURE GrafDevice`). */
export function GrafDevice(device: number): void {
  if (globals.thePort) globals.thePort.device = device;
}

/** Replace the current port's backing bitmap (`PROCEDURE SetPortBits`). */
export function SetPortBits(bm: BitMap): void {
  const port = globals.thePort;
  if (!port) return;
  port.portBits = {
    baseAddr: bm.baseAddr,
    rowBytes: bm.rowBytes,
    bounds: cloneRect(bm.bounds),
  };
}

/**
 * Resize the current port's portRect to `width × height`.
 * `PROCEDURE PortSize(width, height: INTEGER)`.
 */
export function PortSize(width: number, height: number): void {
  const port = globals.thePort;
  if (!port) return;
  port.portRect.right = port.portRect.left + width;
  port.portRect.bottom = port.portRect.top + height;
}

/**
 * Move the current port so that its portRect's top-left maps to the
 * global screen coordinates `(leftGlobal, topGlobal)`.
 * `PROCEDURE MovePortTo(leftGlobal, topGlobal: INTEGER)`.
 */
export function MovePortTo(leftGlobal: number, topGlobal: number): void {
  const port = globals.thePort;
  if (!port) return;
  const dh = port.portRect.left - port.portBits.bounds.left - leftGlobal;
  const dv = port.portRect.top - port.portBits.bounds.top - topGlobal;
  port.portBits.bounds.top += dv;
  port.portBits.bounds.left += dh;
  port.portBits.bounds.bottom += dv;
  port.portBits.bounds.right += dh;
}

/**
 * Shift the coordinate origin of the current port.
 *
 * After this call, local coordinate `(h, v)` maps to the pixel that used
 * to be at `(h − oldLeft + h, v − oldTop + v)`.  The visRgn is adjusted
 * by the same delta so clipping remains correct.
 *
 * `PROCEDURE SetOrigin(h, v: INTEGER)` from `QuickDraw.p`.
 *
 * @param h  New left edge of portRect in local coordinates.
 * @param v  New top edge of portRect in local coordinates.
 */
export function SetOrigin(h: number, v: number): void {
  const port = globals.thePort;
  if (!port) return;
  const dh = h - port.portRect.left;
  const dv = v - port.portRect.top;
  if (dh === 0 && dv === 0) return;
  // Offset portBits.bounds
  port.portBits.bounds.top += dv;
  port.portBits.bounds.left += dh;
  port.portBits.bounds.bottom += dv;
  port.portBits.bounds.right += dh;
  // Offset portRect
  port.portRect.top += dv;
  port.portRect.left += dh;
  port.portRect.bottom += dv;
  port.portRect.right += dh;
  // Offset visRgn
  if (port.visRgn) {
    const r = port.visRgn.rgn.rgnBBox;
    r.top += dv;
    r.left += dh;
    r.bottom += dv;
    r.right += dh;
  }
}

// -------------------------------------------------------------------------
// Clip management
// -------------------------------------------------------------------------

/**
 * Replace the current port's clip region with a deep copy of `rgn`.
 * `PROCEDURE SetClip(rgn: RgnHandle)`.
 */
export function SetClip(rgn: RgnHandle): void {
  const port = globals.thePort;
  if (!port) return;
  // Copy rgn into port.clipRgn
  port.clipRgn = {
    rgn: {
      rgnSize: rgn.rgn.rgnSize,
      rgnBBox: cloneRect(rgn.rgn.rgnBBox),
      scanlines: rgn.rgn.scanlines
        ? rgn.rgn.scanlines.map((sl) => ({ y: sl.y, xs: [...sl.xs] }))
        : undefined,
    },
  };
}

/**
 * Copy the current port's clip region into `rgn`.
 * `PROCEDURE GetClip(rgn: RgnHandle)`.
 */
export function GetClip(rgn: RgnHandle): void {
  const port = globals.thePort;
  if (!port) return;
  const src = port.clipRgn.rgn;
  rgn.rgn.rgnSize = src.rgnSize;
  rgn.rgn.rgnBBox = cloneRect(src.rgnBBox);
  rgn.rgn.scanlines = src.scanlines
    ? src.scanlines.map((sl) => ({ y: sl.y, xs: [...sl.xs] }))
    : undefined;
}

/**
 * Set the current port's clip region to the rectangle `r`.
 * `PROCEDURE ClipRect(r: Rect)`.
 */
export function ClipRect(r: Rect): void {
  const port = globals.thePort;
  if (!port) return;
  port.clipRgn = {
    rgn: {
      rgnSize: 10,
      rgnBBox: cloneRect(r),
      scanlines: undefined,
    },
  };
}

/**
 * Set the current port's background pattern to `pat`.
 * Used by erase operations.  `PROCEDURE BackPat(pat: Pattern)`.
 */
export function BackPat(pat: Pattern): void {
  const port = globals.thePort;
  if (!port) return;
  port.bkPat = new Uint8Array(pat);
}

// -------------------------------------------------------------------------
// Create a new GrafPort object (not part of original API, but needed in JS)
// -------------------------------------------------------------------------

/**
 * Allocate and return a fully initialised {@link GrafPort} pointing at the
 * current screen buffer.
 *
 * This is a JS-only convenience that replaces the original two-step
 * `NEW(port); OpenPort(port)` pattern.  The returned port is **not** made
 * the current port — call {@link SetPort} or {@link OpenPort} to activate it.
 */

export function newGrafPort(): GrafPort {
  const screen = globals.screenBits;
  const bounds = cloneRect(screen.bounds);

  return {
    device: 0,
    portBits: { baseAddr: screen.baseAddr, rowBytes: screen.rowBytes, bounds: cloneRect(bounds) },
    portRect: cloneRect(bounds),
    visRgn: makeRegion(cloneRect(bounds)),
    clipRgn: makeRegion(makeRect(-32767, -32767, 32767, 32767)),
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
    grafProcs: null,
  };
}
