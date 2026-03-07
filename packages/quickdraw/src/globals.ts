// QuickDraw global state
// Equivalent to the global variables declared in QuickDraw.p and GrafTypes.a.
// In the original, these lived at a fixed negative offset from register A5.
// Here they are a plain module-level object.

import { GrafPort, Pattern, Cursor, BitMap, RgnHandle, Region } from "./types";
import { makeRect } from "./types";

// The screen interface passed to InitGraf
export interface QDScreen {
  width: number;
  height: number;
  pixels: Uint8Array; // 1 byte per pixel, 0=white 1=black
}

// Internal QuickDraw state (analogous to the Pascal global VAR block)
export const globals: {
  thePort: GrafPort | null;

  // Standard patterns (8-byte packed bitmaps, MSB = left pixel)
  white: Pattern;
  black: Pattern;
  gray: Pattern;
  ltGray: Pattern;
  dkGray: Pattern;

  arrow: Cursor;
  screenBits: BitMap;
  randSeed: number;

  // Private globals
  wideOpen: RgnHandle;
  rgnBuf: number[] | null;
  rgnIndex: number;
  rgnMax: number;
  thePoly: { poly: import("./types").Polygon } | null;
  polyMax: number;

  // Font state for text rendering
  _fontMeasure: ((text: string) => number) | null;
  _fontDraw:
    | ((text: string, x: number, y: number, port: GrafPort) => void)
    | null;

  // The pixel buffer (set by InitGraf)
  _screen: QDScreen | null;
} = {
  thePort: null,

  white: new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
  black: new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]),
  // gray: alternating 0xAA/0x55 rows (classic Mac 50% gray)
  gray: new Uint8Array([0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55]),
  // ltGray: 25% density
  ltGray: new Uint8Array([0x88, 0x22, 0x88, 0x22, 0x88, 0x22, 0x88, 0x22]),
  // dkGray: 75% density
  dkGray: new Uint8Array([0x77, 0xdd, 0x77, 0xdd, 0x77, 0xdd, 0x77, 0xdd]),

  // Arrow cursor (from GrafAsm.a CURDATA)
  arrow: {
    data: new Uint16Array([
      0x0000, 0x4000, 0x6000, 0x7000, 0x7800, 0x7c00, 0x7e00, 0x7f00, 0x7f80,
      0x7c00, 0x6c00, 0x4600, 0x0600, 0x0300, 0x0300, 0x0000,
    ]),
    mask: new Uint16Array([
      0xc000, 0xe000, 0xf000, 0xf800, 0xfc00, 0xfe00, 0xff00, 0xff80, 0xffc0,
      0xffe0, 0xfe00, 0xef00, 0xcf00, 0x8780, 0x0780, 0x0380,
    ]),
    hotSpot: { v: 1, h: 1 },
  },

  screenBits: {
    baseAddr: new Uint8Array(0),
    rowBytes: 0,
    bounds: makeRect(0, 0, 0, 0),
  },

  randSeed: 1,

  wideOpen: {
    rgn: {
      rgnSize: 10,
      rgnBBox: makeRect(-32767, -32767, 32767, 32767),
    },
  },

  rgnBuf: null,
  rgnIndex: 0,
  rgnMax: 0,
  thePoly: null,
  polyMax: 0,

  _fontMeasure: null,
  _fontDraw: null,
  _screen: null,
};

// Inject a font measurement/drawing implementation from the OS
export function __injectFontFunctions(
  measure: (text: string) => number,
  draw: (text: string, x: number, y: number, port: GrafPort) => void
): void {
  globals._fontMeasure = measure;
  globals._fontDraw = draw;
}
