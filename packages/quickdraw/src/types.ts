// QuickDraw type definitions — TypeScript equivalents of the Pascal records
// from reference/QuickDraw/QuickDraw.p

// -------------------------------------------------------------------------
// Primitive types
// -------------------------------------------------------------------------

export type GrafVerb = 0 | 1 | 2 | 3 | 4; // frame, paint, erase, invert, fill

// Pattern: 8 bytes, each byte is a packed row of 8 pixels (bit 7 = leftmost)
// Matches original Pascal: PACKED ARRAY[0..7] OF 0..255
export type Pattern = Uint8Array; // exactly 8 bytes

// Bits16: 16 words (used for cursor data and mask)
export type Bits16 = Uint16Array; // 16 entries

// VHSelect: v=0, h=1
export type VHSelect = 0 | 1;

// Style flags
export const bold = 0x01;
export const italic = 0x02;
export const underline = 0x04;
export const outline = 0x08;
export const shadow = 0x10;
export const condense = 0x20;
export const extend = 0x40;
export type Style = number; // bitfield of StyleItem flags

// -------------------------------------------------------------------------
// Point
// -------------------------------------------------------------------------

export interface Point {
  v: number; // vertical (y), comes first in memory like original
  h: number; // horizontal (x)
}

export function makePoint(h: number, v: number): Point {
  return { v, h };
}

// -------------------------------------------------------------------------
// Rect
// -------------------------------------------------------------------------

export interface Rect {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export function makeRect(
  left: number,
  top: number,
  right: number,
  bottom: number
): Rect {
  return { top, left, bottom, right };
}

export function cloneRect(r: Rect): Rect {
  return { top: r.top, left: r.left, bottom: r.bottom, right: r.right };
}

// -------------------------------------------------------------------------
// BitMap
// -------------------------------------------------------------------------

// baseAddr: flat Uint8Array, 1 byte per pixel (0=white, 1=black)
// rowBytes: number of pixels per row (not bytes — we use 1bpp in memory)
export interface BitMap {
  baseAddr: Uint8Array;
  rowBytes: number; // width in pixels of the buffer row
  bounds: Rect;
}

// -------------------------------------------------------------------------
// Cursor
// -------------------------------------------------------------------------

export interface Cursor {
  data: Bits16; // 16 words of cursor image (1-bit packed, MSB first)
  mask: Bits16; // 16 words of cursor mask
  hotSpot: Point;
}

// -------------------------------------------------------------------------
// PenState
// -------------------------------------------------------------------------

export interface PenState {
  pnLoc: Point;
  pnSize: Point;
  pnMode: number;
  pnPat: Pattern;
}

// -------------------------------------------------------------------------
// Polygon
// -------------------------------------------------------------------------

export interface Polygon {
  polySize: number;
  polyBBox: Rect;
  polyPoints: Point[];
}

export type PolyHandle = { poly: Polygon };

// -------------------------------------------------------------------------
// Region
// -------------------------------------------------------------------------

// Rectangular region: rgnSize=10, no scanline data.
// Complex region: rgnSize>10, scanlines holds compressed data.
//
// Scanline format (matching original QuickDraw packed region encoding):
//   scanlines: array of { y: number, xs: number[] }
//   Each entry holds a sorted list of x inversion points for row y.
//   An empty scanlines array means the region equals its bounding box exactly.
export interface Region {
  rgnSize: number;
  rgnBBox: Rect;
  scanlines?: Array<{ y: number; xs: number[] }>;
}

export type RgnHandle = { rgn: Region };

// -------------------------------------------------------------------------
// Picture
// -------------------------------------------------------------------------

export interface Picture {
  picSize: number;
  picFrame: Rect;
  // Internal byte stream of opcodes (used during record/playback)
  _data: number[];
}

export type PicHandle = { pic: Picture };

// -------------------------------------------------------------------------
// FontInfo
// -------------------------------------------------------------------------

export interface FontInfo {
  ascent: number;
  descent: number;
  widMax: number;
  leading: number;
}

// -------------------------------------------------------------------------
// QDProcs (bottleneck record)
// -------------------------------------------------------------------------

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

export interface GrafPort {
  device: number;
  portBits: BitMap;
  portRect: Rect;
  visRgn: RgnHandle;
  clipRgn: RgnHandle;
  bkPat: Pattern;
  fillPat: Pattern;
  pnLoc: Point;
  pnSize: Point;
  pnMode: number;
  pnPat: Pattern;
  pnVis: number;
  txFont: number;
  txFace: Style;
  txMode: number;
  txSize: number;
  spExtra: number; // Fixed-point
  fgColor: number;
  bkColor: number;
  colrBit: number;
  patStretch: number;
  picSave: PicHandle | null;
  rgnSave: RgnHandle | null;
  polySave: PolyHandle | null;
  grafProcs: QDProcs | null;
}

export type GrafPtr = GrafPort;
