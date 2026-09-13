/**
 * @mockintosh/quickdraw
 *
 * TypeScript re-implementation of the original Macintosh QuickDraw graphics
 * library (1984, Bill Atkinson). The public surface is `QuickDraw.p` +
 * `GrafUtil.p` plus the three OS seams the original left outside the unit
 * (screen BitMap on `InitGraf`, Font Manager, cursor vectors). Pixel helpers
 * live on `@mockintosh/quickdraw/bits`.
 *
 * Usage:
 *   import { InitGraf, OpenPort, MoveTo, LineTo, FrameRect, ... } from "@mockintosh/quickdraw";
 *   import { newBitMap } from "@mockintosh/quickdraw/bits";
 *
 *   InitGraf(newBitMap(512, 342));
 *   const port = {} as GrafPort;
 *   OpenPort(port);
 *   MoveTo(10, 10);
 *   LineTo(100, 100);
 */

// -------------------------------------------------------------------------
// Types
// -------------------------------------------------------------------------

export type {
  GrafVerb,
  Pattern,
  Bits16,
  VHSelect,
  Style,
  Point,
  Rect,
  BitMap,
  Cursor,
  PenState,
  Polygon,
  PolyHandle,
  Region,
  RgnHandle,
  Picture,
  PicHandle,
  FontInfo,
  QDProcs,
  GrafPort,
  GrafPtr,
} from "./types";

export { QDError } from "./errors";

export {
  bold,
  italic,
  underline,
  outline,
  shadow,
  condense,
  extend,
} from "./types";

// -------------------------------------------------------------------------
// Constants
// -------------------------------------------------------------------------

export {
  srcCopy,
  srcOr,
  srcXor,
  srcBic,
  notSrcCopy,
  notSrcOr,
  notSrcXor,
  notSrcBic,
  patCopy,
  patOr,
  patXor,
  patBic,
  notPatCopy,
  notPatOr,
  notPatXor,
  notPatBic,
  normalBit,
  inverseBit,
  redBit,
  greenBit,
  blueBit,
  cyanBit,
  magentaBit,
  yellowBit,
  blackBit,
  blackColor,
  whiteColor,
  redColor,
  greenColor,
  blueColor,
  cyanColor,
  magentaColor,
  yellowColor,
  picLParen,
  picRParen,
  FRAME,
  PAINT,
  ERASE,
  INVERT,
  FILL,
} from "./constants";

// -------------------------------------------------------------------------
// Globals + InitGraf + Font Manager seam
// -------------------------------------------------------------------------

export { globals } from "./globals";
export type { FMInput, FMOutput, FontStrike } from "./fontManager";
export { installFontManager } from "./fontManager";

// -------------------------------------------------------------------------
// Fixed-point math and bit utilities (GrafUtil.p)
// -------------------------------------------------------------------------

export type { Fixed, Int64Bit } from "./fixmath";
export {
  BitAnd,
  BitOr,
  BitXor,
  BitNot,
  BitShift,
  BitTst,
  BitSet,
  BitClr,
  LongMul,
  FixMul,
  FixRatio,
  HiWord,
  LoWord,
  FixRound,
} from "./fixmath";

// -------------------------------------------------------------------------
// Point calculations
// -------------------------------------------------------------------------

export {
  SetPt,
  EqualPt,
  AddPt,
  SubPt,
  LocalToGlobal,
  GlobalToLocal,
  ScalePt,
  MapPt,
} from "./points";

// -------------------------------------------------------------------------
// Rectangle calculations (pure math)
// -------------------------------------------------------------------------

export {
  SetRect,
  EqualRect,
  EmptyRect,
  PtInRect,
  OffsetRect,
  InsetRect,
  SectRect,
  UnionRect,
  MapRect,
  Pt2Rect,
} from "./rects";

// -------------------------------------------------------------------------
// GrafPort routines
// -------------------------------------------------------------------------

export {
  InitGraf,
  OpenPort,
  InitPort,
  ClosePort,
  SetPort,
  GetPort,
  GrafDevice,
  SetPortBits,
  PortSize,
  MovePortTo,
  SetOrigin,
  SetClip,
  GetClip,
  ClipRect,
  BackPat,
} from "./grafport";

// -------------------------------------------------------------------------
// Cursor vectors (OS seam — LCursor.a)
// -------------------------------------------------------------------------

export type { CursorState, CursorVectors } from "./cursors";
export {
  cursorState,
  installCursorVectors,
  InitCursor,
  SetCursor,
  HideCursor,
  ShowCursor,
  ObscureCursor,
  ShieldCursor,
} from "./cursors";

// -------------------------------------------------------------------------
// Pen and Line routines
// -------------------------------------------------------------------------

export {
  HidePen,
  ShowPen,
  GetPen,
  GetPenState,
  SetPenState,
  PenSize,
  PenMode,
  PenPat,
  PenNormal,
  MoveTo,
  Move,
  LineTo,
  Line,
  StdLine,
} from "./lines";

// -------------------------------------------------------------------------
// Text routines
// -------------------------------------------------------------------------

export {
  TextFont,
  TextFace,
  TextMode,
  TextSize,
  SpaceExtra,
  DrawChar,
  DrawString,
  DrawText,
  CharWidth,
  StringWidth,
  TextWidth,
  GetFontInfo,
  MeasureText,
  StdText,
  StdTxMeas,
} from "./text";

// -------------------------------------------------------------------------
// Rect drawing
// -------------------------------------------------------------------------

export {
  StdRect,
  FrameRect,
  PaintRect,
  EraseRect,
  InvertRect,
  FillRect,
} from "./rects";

// -------------------------------------------------------------------------
// RoundRect
// -------------------------------------------------------------------------

export {
  StdRRect,
  FrameRoundRect,
  PaintRoundRect,
  EraseRoundRect,
  InvertRoundRect,
  FillRoundRect,
} from "./arcs";

// -------------------------------------------------------------------------
// Oval
// -------------------------------------------------------------------------

export {
  StdOval,
  FrameOval,
  PaintOval,
  EraseOval,
  InvertOval,
  FillOval,
} from "./arcs";

// -------------------------------------------------------------------------
// Arc
// -------------------------------------------------------------------------

export {
  StdArc,
  FrameArc,
  PaintArc,
  EraseArc,
  InvertArc,
  FillArc,
} from "./arcs";
export { PtToAngle } from "./angles";

// -------------------------------------------------------------------------
// Polygon
// -------------------------------------------------------------------------

export {
  OpenPoly,
  ClosePoly,
  KillPoly,
  OffsetPoly,
  MapPoly,
  StdPoly,
  FramePoly,
  PaintPoly,
  ErasePoly,
  InvertPoly,
  FillPoly,
} from "./polygons";

// -------------------------------------------------------------------------
// Region calculations
// -------------------------------------------------------------------------

export {
  NewRgn,
  DisposeRgn,
  CopyRgn,
  SetEmptyRgn,
  SetRectRgn,
  RectRgn,
  OpenRgn,
  CloseRgn,
  OffsetRgn,
  MapRgn,
  InsetRgn,
  SectRgn,
  UnionRgn,
  DiffRgn,
  XorRgn,
  EqualRgn,
  EmptyRgn,
  PtInRgn,
  RectInRgn,
} from "./regions";

// -------------------------------------------------------------------------
// Region drawing
// -------------------------------------------------------------------------

export {
  StdRgn,
  FrameRgn,
  PaintRgn,
  EraseRgn,
  InvertRgn,
  FillRgn,
} from "./regions";

// -------------------------------------------------------------------------
// BitMap operations
// -------------------------------------------------------------------------

export { CopyBits, ScrollRect, StdBits } from "./bitmaps";

// -------------------------------------------------------------------------
// Picture routines
// -------------------------------------------------------------------------

export {
  OpenPicture,
  ClosePicture,
  KillPicture,
  DrawPicture,
  PicComment,
  StdGetPic,
  StdPutPic,
  serializePicture,
  parsePicture,
} from "./pictures";

// -------------------------------------------------------------------------
// Bottleneck
// -------------------------------------------------------------------------

export { SetStdProcs, StdComment } from "./bottleneck";

// -------------------------------------------------------------------------
// Misc utilities
// -------------------------------------------------------------------------

export {
  GetPixel,
  Random,
  StuffHex,
  ForeColor,
  BackColor,
  ColorBit,
} from "./utils";
