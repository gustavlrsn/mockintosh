// GrafPort routines — from QuickDraw.p GrafPort Routines section
// and GrafAsm.a implementation.

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

// PROCEDURE InitGraf(globalPtr: QDPtr);
// In our implementation, globalPtr is a QDScreen — the pixel buffer the OS
// provides.  Everything else is initialized to the standard defaults from
// GrafAsm.a.
export function InitGraf(screen: QDScreen): void {
  globals._screen = screen;
  globals.screenBits = {
    baseAddr: screen.pixels,
    rowBytes: screen.width,
    bounds: makeRect(0, 0, screen.width, screen.height),
  };
  globals.randSeed = 1;
  globals.thePort = null;
}

// -------------------------------------------------------------------------
// OpenPort / InitPort / ClosePort
// -------------------------------------------------------------------------

// PROCEDURE OpenPort(port: GrafPtr);
// Allocates fresh clip+vis regions then calls InitPort.
export function OpenPort(port: GrafPort): void {
  const bounds = cloneRect(globals.screenBits.bounds);
  port.visRgn = makeRegion(bounds);
  port.clipRgn = makeRegion(makeRect(-32767, -32767, 32767, 32767));
  InitPort(port);
}

// PROCEDURE InitPort(port: GrafPtr);
// Sets all fields to defaults matching GrafAsm.a InitPort.
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

// PROCEDURE ClosePort(port: GrafPtr);
// Discards clipRgn and visRgn (in JS we just null them — GC handles the rest).
export function ClosePort(port: GrafPort): void {
  // No-op in JS; references will be GC'd
  if (globals.thePort === port) {
    globals.thePort = null;
  }
}

// -------------------------------------------------------------------------
// Port management
// -------------------------------------------------------------------------

// PROCEDURE SetPort(port: GrafPtr);
export function SetPort(port: GrafPort): void {
  globals.thePort = port;
}

// PROCEDURE GetPort(VAR port: GrafPtr);
export function GetPort(): GrafPort | null {
  return globals.thePort;
}

// PROCEDURE GrafDevice(device: INTEGER);
export function GrafDevice(device: number): void {
  if (globals.thePort) globals.thePort.device = device;
}

// PROCEDURE SetPortBits(bm: BitMap);
export function SetPortBits(bm: BitMap): void {
  const port = globals.thePort;
  if (!port) return;
  port.portBits = {
    baseAddr: bm.baseAddr,
    rowBytes: bm.rowBytes,
    bounds: cloneRect(bm.bounds),
  };
}

// PROCEDURE PortSize(width, height: INTEGER);
export function PortSize(width: number, height: number): void {
  const port = globals.thePort;
  if (!port) return;
  port.portRect.right = port.portRect.left + width;
  port.portRect.bottom = port.portRect.top + height;
}

// PROCEDURE MovePortTo(leftGlobal, topGlobal: INTEGER);
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

// PROCEDURE SetOrigin(h, v: INTEGER);
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

// PROCEDURE SetClip(rgn: RgnHandle);
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

// PROCEDURE GetClip(rgn: RgnHandle);
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

// PROCEDURE ClipRect(r: Rect);
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

// PROCEDURE BackPat(pat: Pattern);
export function BackPat(pat: Pattern): void {
  const port = globals.thePort;
  if (!port) return;
  port.bkPat = new Uint8Array(pat);
}

// -------------------------------------------------------------------------
// Create a new GrafPort object (not part of original API, but needed in JS)
// -------------------------------------------------------------------------

export function newGrafPort(): GrafPort {
  const bounds = globals._screen
    ? makeRect(0, 0, globals._screen.width, globals._screen.height)
    : makeRect(0, 0, 0, 0);
  const pixels = globals._screen ? globals._screen.pixels : new Uint8Array(0);
  const rowBytes = globals._screen ? globals._screen.width : 0;

  return {
    device: 0,
    portBits: { baseAddr: pixels, rowBytes, bounds: cloneRect(bounds) },
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
