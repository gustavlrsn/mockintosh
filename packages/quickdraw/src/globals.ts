// QuickDraw global state
// Equivalent to the global variables declared in QuickDraw.p and GrafTypes.a.
// In the original, these lived at a fixed negative offset from register A5.
// Here they are a plain module-level object.

import { GrafPort, Pattern, Cursor, BitMap, RgnHandle, Region } from "./types";
import { makeRect } from "./types";

/**
 * The pixel surface passed to {@link InitGraf}.
 * Represents the OS-provided framebuffer that QuickDraw renders into.
 */
export interface QDScreen {
  width: number;
  height: number;
  /** Flat pixel buffer — 1 byte per pixel, `0`=white, `1`=black. */
  pixels: Uint8Array;
}

/**
 * The QuickDraw global state block.
 *
 * In the original 68k Mac ROM this record lived at a fixed negative offset
 * from register A5.  Here it is a plain singleton module object.
 *
 * Most fields are read-only from application code — use the public
 * QuickDraw procedures to manipulate them.
 */
export const globals: {
  /** The currently active drawing port.  All QuickDraw calls operate on this. */
  thePort: GrafPort | null;

  /** All-white 8×8 fill pattern (every pixel off). */
  white: Pattern;
  /** All-black 8×8 fill pattern (every pixel on). */
  black: Pattern;
  /** 50% gray: alternating 0xAA/0x55 rows. */
  gray: Pattern;
  /** 25% density (light gray). */
  ltGray: Pattern;
  /** 75% density (dark gray). */
  dkGray: Pattern;

  /**
   * The standard arrow cursor sprite.
   * Data taken from `reference/QuickDraw/GrafAsm.a` CURDATA resource.
   */
  arrow: Cursor;
  /**
   * BitMap describing the full screen.
   * Initialised by {@link InitGraf} from the {@link QDScreen} provided by the OS.
   */
  screenBits: BitMap;
  /**
   * Seed value for the {@link Random} pseudo-random number generator.
   * Can be set before calling `Random` to reproduce a sequence.
   */
  randSeed: number;

  /**
   * A pre-built wide-open rectangular region covering −32767..32767 in both
   * axes.  Used as the default clip region so nothing is clipped by default.
   */
  wideOpen: RgnHandle;
  /** Accumulation buffer for region recording (used by {@link OpenRgn}/{@link CloseRgn}). */
  rgnBuf: number[] | null;
  /** Current write index into `rgnBuf`. */
  rgnIndex: number;
  /** Capacity high-water mark for `rgnBuf`. */
  rgnMax: number;
  /** Handle to the polygon currently being recorded, or `null`. */
  thePoly: { poly: import("./types").Polygon } | null;
  /** Capacity high-water mark for `thePoly.poly.polyPoints`. */
  polyMax: number;

  /**
   * Injected font metric function.  Returns the pixel width of a string.
   * Set by {@link __injectFontFunctions}; `null` falls back to 6px/char.
   */
  _fontMeasure: ((text: string) => number) | null;
  /**
   * Injected font rendering function.  Draws `text` at `(x, y)` into `port`.
   * Set by {@link __injectFontFunctions}; `null` makes text drawing a no-op.
   */
  _fontDraw:
    | ((text: string, x: number, y: number, port: GrafPort) => void)
    | null;

  /**
   * The OS-provided screen surface passed to {@link InitGraf}.
   * `null` before `InitGraf` is called.
   */
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

/**
 * Inject font measurement and rendering implementations from the host OS layer.
 *
 * Call this once during system initialisation before any text is drawn.
 * Without injection, text measurement falls back to 6 pixels per character
 * and text drawing is a no-op.
 *
 * @param measure Returns the pixel width of `text` in the current port's font.
 * @param draw    Renders `text` at screen position `(x, y)` into `port`.
 */
export function __injectFontFunctions(
  measure: (text: string) => number,
  draw: (text: string, x: number, y: number, port: GrafPort) => void
): void {
  globals._fontMeasure = measure;
  globals._fontDraw = draw;
}
