// QuickDraw type definitions — TypeScript equivalents of the Pascal records
// from reference/QuickDraw/QuickDraw.p

// -------------------------------------------------------------------------
// Primitive types
// -------------------------------------------------------------------------

/**
 * Drawing verb passed to all shape-drawing bottleneck procedures.
 * - `0` = frame (outline only, using pen)
 * - `1` = paint (fill with pen pattern)
 * - `2` = erase (fill with background pattern)
 * - `3` = invert (XOR all pixels)
 * - `4` = fill (fill with an explicit pattern)
 */
export type GrafVerb = 0 | 1 | 2 | 3 | 4; // frame, paint, erase, invert, fill

/**
 * An 8-byte packed 1-bit bitmap used as a repeating fill/pen/background
 * pattern.  Each byte is one row of 8 pixels; bit 7 (MSB) is the leftmost
 * pixel.  Matches the original Pascal `PACKED ARRAY[0..7] OF 0..255`.
 */
export type Pattern = Uint8Array; // exactly 8 bytes

/**
 * 16 words of cursor image or mask data (1-bit packed, MSB-first per word).
 * Used in {@link Cursor}.
 */
export type Bits16 = Uint16Array; // 16 entries

/**
 * Axis selector: `0` = vertical (v), `1` = horizontal (h).
 * Used by `ScalePt` and `MapPt`.
 */
export type VHSelect = 0 | 1;

/** Bold text style flag. */
export const bold = 0x01;
/** Italic text style flag. */
export const italic = 0x02;
/** Underline text style flag. */
export const underline = 0x04;
/** Outline text style flag. */
export const outline = 0x08;
/** Shadow text style flag. */
export const shadow = 0x10;
/** Condensed text style flag. */
export const condense = 0x20;
/** Extended (wide) text style flag. */
export const extend = 0x40;
/**
 * A bitfield of text style flags (`bold`, `italic`, `underline`, etc.).
 * Stored in {@link GrafPort.txFace}.
 */
export type Style = number; // bitfield of StyleItem flags

// -------------------------------------------------------------------------
// Point
// -------------------------------------------------------------------------

/**
 * A 2-D coordinate in QuickDraw local port space.
 *
 * Field order matches the original 68k memory layout: `v` (vertical / y)
 * comes before `h` (horizontal / x).
 */
export interface Point {
  /** Vertical coordinate (y-axis, increasing downward). */
  v: number;
  /** Horizontal coordinate (x-axis, increasing rightward). */
  h: number;
}

/**
 * Construct a {@link Point} from `(h, v)` coordinates.
 * @param h Horizontal (x) coordinate.
 * @param v Vertical (y) coordinate.
 */
export function makePoint(h: number, v: number): Point {
  return { v, h };
}

// -------------------------------------------------------------------------
// Rect
// -------------------------------------------------------------------------

/**
 * An axis-aligned rectangle defined by its four edges.
 *
 * QuickDraw uses a half-open convention: pixels at `top` and `left` are
 * inside the rect, while pixels at `bottom` and `right` are **outside**.
 * A rect is empty when `top >= bottom` or `left >= right`.
 */
export interface Rect {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

/**
 * Construct a {@link Rect} from explicit edge coordinates.
 * Parameter order matches the {@link Rect} field order (top, left, bottom, right).
 * Original Mac used SetRect(VAR r; left, top, right, bottom); this is a pure
 * functional helper we added when porting.
 *
 * @param top    Top edge (inclusive).
 * @param left   Left edge (inclusive).
 * @param bottom Bottom edge (exclusive).
 * @param right  Right edge (exclusive).
 */
export function makeRect(
  top: number,
  left: number,
  bottom: number,
  right: number
): Rect {
  return { top, left, bottom, right };
}

/** Return a shallow copy of `r`. */
export function cloneRect(r: Rect): Rect {
  return { top: r.top, left: r.left, bottom: r.bottom, right: r.right };
}

// -------------------------------------------------------------------------
// BitMap
// -------------------------------------------------------------------------

/**
 * A 1-bit-per-pixel off-screen or on-screen bitmap.
 *
 * In the original Mac toolbox this was a packed bitmap (1 bit per pixel,
 * padded to 2-byte row boundaries).  Here we use **1 byte per pixel** for
 * simplicity — `0` = white, `1` = black.
 *
 * `rowBytes` is the number of pixel columns in the buffer (i.e. the stride),
 * not a byte count.
 */
export interface BitMap {
  /** Flat pixel buffer — 1 byte per pixel, `0`=white, `1`=black. */
  baseAddr: Uint8Array;
  /** Row stride in pixels (not bytes). */
  rowBytes: number;
  /** Coordinate space of this bitmap (origin may be non-zero). */
  bounds: Rect;
}

// -------------------------------------------------------------------------
// Cursor
// -------------------------------------------------------------------------

/**
 * A 16×16 1-bit hardware cursor sprite.
 *
 * `data` controls which pixels are drawn; `mask` controls which pixels
 * are opaque vs. transparent.  Where `mask=0` the screen shows through;
 * where `mask=1` and `data=0` the pixel is white; where both are `1` it
 * is black.
 */
export interface Cursor {
  /** 16 rows × 16 columns of cursor image, 1-bit packed (MSB = left). */
  data: Bits16;
  /** 16 rows × 16 columns of cursor mask, 1-bit packed (MSB = left). */
  mask: Bits16;
  /** The pixel within the 16×16 bitmap that tracks the mouse position. */
  hotSpot: Point;
}

// -------------------------------------------------------------------------
// PenState
// -------------------------------------------------------------------------

/**
 * Complete snapshot of the current port's pen attributes.
 * Used by {@link GetPenState} and {@link SetPenState} to save/restore the pen.
 */
export interface PenState {
  /** Current pen position in local port coordinates. */
  pnLoc: Point;
  /** Pen size in pixels: `h` = width, `v` = height. */
  pnSize: Point;
  /** Transfer mode for pen drawing (see `srcCopy`, `patCopy`, etc.). */
  pnMode: number;
  /** 8-byte pattern used by the pen. */
  pnPat: Pattern;
}

// -------------------------------------------------------------------------
// Polygon
// -------------------------------------------------------------------------

/**
 * An arbitrary closed polygon defined as an ordered list of vertices.
 *
 * Polygons are created with {@link OpenPoly}/{@link ClosePoly} and drawn with
 * `FramePoly`, `PaintPoly`, etc.  The winding/fill rule is even-odd,
 * matching the original QuickDraw.
 */
export interface Polygon {
  /** Total byte size of the polygon record (mirrors original Pascal field). */
  polySize: number;
  /** Bounding box recomputed by {@link ClosePoly}. */
  polyBBox: Rect;
  /** Ordered list of vertices; first and last should coincide for a closed shape. */
  polyPoints: Point[];
}

/** Indirect reference to a {@link Polygon} (mirrors the original handle indirection). */
export type PolyHandle = { poly: Polygon };

// -------------------------------------------------------------------------
// Region
// -------------------------------------------------------------------------

/**
 * An arbitrary 1-bit mask region, represented as a bounding box plus an
 * optional list of scanline inversion points.
 *
 * **Rectangular region** — `rgnSize = 10`, `scanlines` absent or empty.
 * The region exactly equals its `rgnBBox`.
 *
 * **Complex region** — `rgnSize > 10`, `scanlines` present.
 * Each scanline entry `{ y, xs }` holds sorted x-inversion points for row
 * `y`.  A pixel `(h, v)` is inside the region if the number of `xs[i] <= h`
 * is **odd** (even-odd rule).
 */
export interface Region {
  /** Byte size of the region record (10 for rectangular, larger for complex). */
  rgnSize: number;
  /** Tight bounding box of the entire region. */
  rgnBBox: Rect;
  /**
   * Per-row inversion points for complex regions.
   * Each entry covers one horizontal scanline.
   * Absent or empty means the region is rectangular.
   */
  scanlines?: Array<{ y: number; xs: number[] }>;
}

/** Indirect reference to a {@link Region}. */
export type RgnHandle = { rgn: Region };

// -------------------------------------------------------------------------
// Picture
// -------------------------------------------------------------------------

/**
 * A recorded sequence of QuickDraw drawing operations (a "metafile").
 *
 * While a picture is open (`port.picSave` is set), all drawing calls append
 * opcodes to `_data`.  {@link DrawPicture} replays those opcodes.
 */
export interface Picture {
  /** Total byte size of the picture data, including the 10-byte header. */
  picSize: number;
  /** The coordinate frame that was active when {@link OpenPicture} was called. */
  picFrame: Rect;
  /** Internal opcode byte stream (built during recording, consumed during playback). */
  _data: number[];
}

/** Indirect reference to a {@link Picture}. */
export type PicHandle = { pic: Picture };

// -------------------------------------------------------------------------
// FontInfo
// -------------------------------------------------------------------------

/**
 * Vertical metrics for the current port's font.
 * All values are in pixels.  Filled in by {@link GetFontInfo}.
 */
export interface FontInfo {
  /** Distance from the baseline to the top of the tallest glyph. */
  ascent: number;
  /** Distance from the baseline downward to the bottom of the deepest descender. */
  descent: number;
  /** Width of the widest character in the font. */
  widMax: number;
  /** Extra vertical space between lines (external leading). */
  leading: number;
}

// -------------------------------------------------------------------------
// QDProcs (bottleneck record)
// -------------------------------------------------------------------------

/**
 * The QuickDraw *bottleneck record* — a table of function pointers that
 * intercept every drawing primitive routed through the port.
 *
 * Install a custom `QDProcs` via `port.grafProcs` to override drawing
 * behaviour (e.g. for printing, offscreen rendering, or PostScript output).
 * Use {@link SetStdProcs} to populate a record with the standard
 * implementations before patching individual slots.
 *
 * Each slot mirrors the original Pascal `QDProcs` field:
 * `textProc`, `lineProc`, `rectProc`, `rRectProc`, `ovalProc`,
 * `arcProc`, `polyProc`, `rgnProc`, `bitsProc`, `commentProc`,
 * `txMeasProc`, `getPicProc`, `putPicProc`.
 */
export interface QDProcs {
  textProc?:
    | ((count: number, textAddr: number[], numer: Point, denom: Point) => void)
    | null;
  lineProc?: ((newPt: Point) => void) | null;
  rectProc?: ((verb: GrafVerb, r: Rect) => void) | null;
  rRectProc?:
    | ((verb: GrafVerb, r: Rect, ovWd: number, ovHt: number) => void)
    | null;
  ovalProc?: ((verb: GrafVerb, r: Rect) => void) | null;
  arcProc?:
    | ((verb: GrafVerb, r: Rect, startAngle: number, arcAngle: number) => void)
    | null;
  polyProc?: ((verb: GrafVerb, poly: PolyHandle) => void) | null;
  rgnProc?: ((verb: GrafVerb, rgn: RgnHandle) => void) | null;
  bitsProc?:
    | ((
        srcBits: BitMap,
        srcRect: Rect,
        dstRect: Rect,
        mode: number,
        maskRgn: RgnHandle | null
      ) => void)
    | null;
  commentProc?:
    | ((kind: number, dataSize: number, dataHandle: number[] | null) => void)
    | null;
  txMeasProc?:
    | ((
        count: number,
        textAddr: number[],
        numer: Point,
        denom: Point,
        info: FontInfo
      ) => number)
    | null;
  getPicProc?: ((dataPtr: number[], byteCount: number) => void) | null;
  putPicProc?: ((dataPtr: number[], byteCount: number) => void) | null;
}

// -------------------------------------------------------------------------
// GrafPort
// -------------------------------------------------------------------------

/**
 * The central drawing context — analogous to a device context in Win32 or a
 * canvas `2dContext` in the browser.
 *
 * Every QuickDraw drawing call operates on `globals.thePort`, the *current
 * port*.  Switch ports with {@link SetPort}; create new ones with
 * {@link OpenPort} / {@link newGrafPort}.
 *
 * Field names and types mirror the original Pascal `GrafPort` record from
 * `reference/QuickDraw/QuickDraw.p`.
 */
export interface GrafPort {
  /** Device number (0 = main screen). */
  device: number;
  /** The bitmap backing this port (usually the screen or an offscreen buffer). */
  portBits: BitMap;
  /** The port's coordinate rectangle in local port coordinates. */
  portRect: Rect;
  /** Visible region — drawing is clipped to this (set by the Window Manager). */
  visRgn: RgnHandle;
  /** Application clip region — further restricts drawing. */
  clipRgn: RgnHandle;
  /** Pattern used by erase operations (`EraseRect`, `EraseOval`, etc.). */
  bkPat: Pattern;
  /** Pattern used by fill operations (`FillRect`, `FillOval`, etc.). */
  fillPat: Pattern;
  /** Current pen position in local port coordinates. */
  pnLoc: Point;
  /** Pen size in pixels: `h` = width, `v` = height. Minimum 1×1. */
  pnSize: Point;
  /** Transfer mode for pen/line drawing (e.g. `patCopy`, `srcXor`). */
  pnMode: number;
  /** 8-byte pattern used for pen/line drawing. */
  pnPat: Pattern;
  /**
   * Pen visibility counter.  The pen is visible when `pnVis >= 0`.
   * {@link HidePen} decrements; {@link ShowPen} increments.
   */
  pnVis: number;
  /** Font number for text drawing (0 = system font). */
  txFont: number;
  /** Text style flags (bold, italic, etc.) — see {@link Style}. */
  txFace: Style;
  /** Transfer mode for text drawing (typically `srcOr`). */
  txMode: number;
  /** Font size in points (0 = system default). */
  txSize: number;
  /** Extra space between words (Fixed-point, 16.16). */
  spExtra: number; // Fixed-point
  /** Foreground colour (from the QuickDraw colour constants). */
  fgColor: number;
  /** Background colour (from the QuickDraw colour constants). */
  bkColor: number;
  /** Colour bit plane selector (for colour separations). */
  colrBit: number;
  /** Pattern stretching factor (used internally during pattern rendering). */
  patStretch: number;
  /** Non-null while a picture is being recorded via {@link OpenPicture}. */
  picSave: PicHandle | null;
  /** Non-null while a region is being recorded via {@link OpenRgn}. */
  rgnSave: RgnHandle | null;
  /** Non-null while a polygon is being recorded via {@link OpenPoly}. */
  polySave: PolyHandle | null;
  /**
   * Optional bottleneck record.  When non-null, all drawing primitives are
   * dispatched through these function pointers instead of the default
   * `Std*` implementations.  See {@link QDProcs} and {@link SetStdProcs}.
   */
  grafProcs: QDProcs | null;
}

/** Alias for {@link GrafPort} — matches the original Pascal `GrafPtr` type. */
export type GrafPtr = GrafPort;
