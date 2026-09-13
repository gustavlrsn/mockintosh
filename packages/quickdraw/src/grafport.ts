/**
 * GrafPort management routines — `QuickDraw.p` / `GrafAsm.a`.
 */

import { GrafPort, BitMap, Pattern, RgnHandle, cloneRect } from "./types";
import { globals, requirePort, resetPrivateGlobals } from "./globals";
import { patCopy, blackColor, whiteColor } from "./constants";
import { CopyRgn, NewRgn, OffsetRgn, RectRgn } from "./regions";

function copyPatternInto(dst: Pattern, src: Pattern): void {
  dst.set(src.subarray(0, 8));
}

/**
 * Initialise QuickDraw. Must be called once before any other routine.
 * The original filled `screenBits` via `_GetScrnBits`; the host passes the
 * screen {@link BitMap} directly (§4.5).
 *
 * `PROCEDURE InitGraf(globalPtr: QDPtr)`.
 */
export function InitGraf(screenBits: BitMap): void {
  resetPrivateGlobals();
  globals.screenBits = screenBits;
}

/**
 * Allocate clipRgn and visRgn, then {@link InitPort}.
 * `PROCEDURE OpenPort(port: GrafPtr)` (`GrafAsm.a:89-103`).
 */
export function OpenPort(port: GrafPort): void {
  port.visRgn = NewRgn();
  port.clipRgn = NewRgn();
  InitPort(port);
}

/**
 * Reset every field of an existing port and make it current.
 * `PROCEDURE InitPort(port: GrafPtr)` (`GrafAsm.a:106-158`).
 */
export function InitPort(port: GrafPort): void {
  globals.thePort = port;

  port.device = 0;
  port.portBits = {
    baseAddr: globals.screenBits.baseAddr,
    rowBytes: globals.screenBits.rowBytes,
    bounds: cloneRect(globals.screenBits.bounds),
  };
  port.portRect = cloneRect(globals.screenBits.bounds);

  if (!port.visRgn) port.visRgn = NewRgn();
  if (!port.clipRgn) port.clipRgn = NewRgn();
  RectRgn(port.visRgn, port.portRect);
  CopyRgn(globals.wideOpen, port.clipRgn);

  port.bkPat = new Uint8Array(globals.white);
  port.fillPat = new Uint8Array(globals.black);
  port.pnLoc = { v: 0, h: 0 };
  port.pnSize = { v: 1, h: 1 };
  port.pnMode = patCopy;
  port.pnPat = new Uint8Array(globals.black);
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
  port.rgnSave = false;
  port.polySave = false;
  port.grafProcs = null;
}

/**
 * Dispose clipRgn and visRgn. Does **not** touch `thePort`
 * (`GrafAsm.a:162-176`).
 */
export function ClosePort(_port: GrafPort): void {
  // Handles are GC'd; the original only DisposHandle'd the two regions.
}

/** `PROCEDURE SetPort(port: GrafPtr)`. */
export function SetPort(port: GrafPort): void {
  globals.thePort = port;
}

/** `PROCEDURE GetPort(VAR port: GrafPtr)` — returns the value. */
export function GetPort(): GrafPort | null {
  return globals.thePort;
}

/** `PROCEDURE GrafDevice(device: INTEGER)`. */
export function GrafDevice(device: number): void {
  requirePort().device = device;
}

/**
 * Copy `bm` into the current port's `portBits` in place
 * (`GrafAsm.a` SetPortBits).
 */
export function SetPortBits(bm: BitMap): void {
  const bits = requirePort().portBits;
  bits.baseAddr = bm.baseAddr;
  bits.rowBytes = bm.rowBytes;
  bits.bounds.top = bm.bounds.top;
  bits.bounds.left = bm.bounds.left;
  bits.bounds.bottom = bm.bounds.bottom;
  bits.bounds.right = bm.bounds.right;
}

/** `PROCEDURE PortSize(width, height: INTEGER)`. */
export function PortSize(width: number, height: number): void {
  const port = requirePort();
  port.portRect.right = port.portRect.left + width;
  port.portRect.bottom = port.portRect.top + height;
}

/** `PROCEDURE MovePortTo(leftGlobal, topGlobal: INTEGER)`. */
export function MovePortTo(leftGlobal: number, topGlobal: number): void {
  const port = requirePort();
  const dh = port.portRect.left - port.portBits.bounds.left - leftGlobal;
  const dv = port.portRect.top - port.portBits.bounds.top - topGlobal;
  port.portBits.bounds.top += dv;
  port.portBits.bounds.left += dh;
  port.portBits.bounds.bottom += dv;
  port.portBits.bounds.right += dh;
}

/**
 * Redefine local coords by adjusting portBits.bounds, portRect, and visRgn.
 * `PROCEDURE SetOrigin(h, v: INTEGER)` (`GrafAsm.a:404-426`).
 */
export function SetOrigin(h: number, v: number): void {
  const port = requirePort();
  const dh = h - port.portRect.left;
  const dv = v - port.portRect.top;
  if (dh === 0 && dv === 0) return;
  port.portBits.bounds.top += dv;
  port.portBits.bounds.left += dh;
  port.portBits.bounds.bottom += dv;
  port.portBits.bounds.right += dh;
  port.portRect.top += dv;
  port.portRect.left += dh;
  port.portRect.bottom += dv;
  port.portRect.right += dh;
  OffsetRgn(port.visRgn, dh, dv);
}

/** `PROCEDURE SetClip(rgn: RgnHandle)` — copy *into* the existing handle. */
export function SetClip(rgn: RgnHandle): void {
  CopyRgn(rgn, requirePort().clipRgn);
}

/** `PROCEDURE GetClip(rgn: RgnHandle)`. */
export function GetClip(rgn: RgnHandle): void {
  CopyRgn(requirePort().clipRgn, rgn);
}

/** `PROCEDURE ClipRect(r: Rect)` — `RectRgn` into the existing clip handle. */
export function ClipRect(r: import("./types").Rect): void {
  RectRgn(requirePort().clipRgn, r);
}

/** `PROCEDURE BackPat(pat: Pattern)` — copy bytes in place. */
export function BackPat(pat: Pattern): void {
  copyPatternInto(requirePort().bkPat, pat);
}
