/**
 * Picture record/playback routines — from `QuickDraw.p` Picture Routines
 * section.  Implements the QuickDraw picture opcode stream described in
 * `reference/QuickDraw/PicFormat.txt` and `Pictures.a`.
 *
 * ## Recording
 * Call {@link OpenPicture} to begin recording.  While `port.picSave` is set,
 * every drawing call also appends opcodes to the picture's internal byte
 * stream.  Call {@link ClosePicture} to write the end opcode and seal the
 * picture.
 *
 * ## Playback
 * Call {@link DrawPicture} to replay a recorded picture into the current
 * port.  The byte stream is interpreted sequentially; unknown opcodes are
 * NOP.  `$FF` ends the picture.
 */

import type {
  BitMap,
  GrafPort,
  GrafVerb,
  Pattern,
  PicHandle,
  Point,
  PolyHandle,
  Rect,
  RgnHandle,
} from "./types";
import { cloneRect } from "./types";
import { globals, requirePort } from "./globals";
import { asInt16 } from "./fixmath";
import { blackColor, patCopy, srcCopy, srcOr, whiteColor } from "./constants";
import { HidePen, ShowPen, StdLine } from "./lines";
import { ClipRect } from "./grafport";
import { MapPt, ScalePt } from "./points";
import { MapRect, StdRect } from "./rects";
import { StdArc, StdOval, StdRRect } from "./arcs";
import { MapPoly, StdPoly } from "./polygons";
import {
  CopyRgn,
  EqualRgn,
  MapRgn,
  NewRgn,
  SectRgn,
  StdRgn,
} from "./regions";
import { StdBits } from "./bitmaps";
import { StdText } from "./text";
import { UnpackBits } from "./packBits";
import {
  CheckPic,
  freshClipRgn,
  PutPicByte,
  PutPicWord,
  StdComment,
  StdPutPic,
} from "./picSave";

// -------------------------------------------------------------------------
// PicPlayState — Pictures.a:345-355 / :546-556
// -------------------------------------------------------------------------

/**
 * Picture-playback locals (`Pictures.a` PLAYREC). Lives here, not in
 * `types.ts`, so Phase 7 can land without a merge conflict.
 */
export interface PicPlayState {
  theRect: Rect;
  penLoc: Point;
  textLoc: Point;
  ovalSize: Point;
  fromRect: Rect;
  toRect: Rect;
  numer: Point;
  denom: Point;
  theClip: RgnHandle;
  userClip: RgnHandle;
}

// -------------------------------------------------------------------------
// OpenPicture / ClosePicture / KillPicture
// -------------------------------------------------------------------------

/**
 * Begin recording all drawing operations into a new picture.
 *
 * `picFrame` defines the coordinate frame for the picture (used when
 * scaling during playback).  All subsequent drawing calls append opcodes
 * to the returned handle until {@link ClosePicture} is called.
 *
 * `FUNCTION OpenPicture(picFrame: Rect): PicHandle`.
 */
/** `FUNCTION OpenPicture` (`Pictures.a:181-287`). Nested → nil. */
export function OpenPicture(picFrame: Rect): PicHandle | null {
  const port = requirePort();
  if (port.picSave) return null;
  HidePen();
  if (EqualRgn(port.clipRgn, globals.wideOpen)) ClipRect(picFrame);

  const handle: PicHandle = {
    pic: {
      picSize: 10,
      picFrame: cloneRect(picFrame),
      _data: [],
    },
  };
  globals.thePic = handle;
  const black = new Uint8Array(8).fill(0xff);
  port.picSave = {
    thePic: handle,
    picMax: 256,
    picIndex: 10,
    picClipRgn: freshClipRgn(),
    picBkPat: new Uint8Array(8),
    picTxFont: 0,
    picTxFace: 0,
    picTxMode: srcCopy,
    picTxSize: 0,
    picSpExtra: 0,
    picTxNumer: { h: 1, v: 1 },
    picTxDenom: { h: 1, v: 1 },
    picTxLoc: { h: 0, v: 0 },
    picPnLoc: { h: 0, v: 0 },
    picPnSize: { h: 1, v: 1 },
    picPnMode: patCopy,
    picPnPat: new Uint8Array(black),
    picFillPat: new Uint8Array(black),
    picTheRect: { top: 0, left: 0, bottom: 0, right: 0 },
    picOvSize: { h: 0, v: 0 },
    picOrigin: { h: port.portRect.left, v: port.portRect.top },
    picFgColor: blackColor,
    picBkColor: whiteColor,
  };
  PutPicWord(0x1101);
  return handle;
}

/**
 * Finish recording.  Appends the end-of-picture opcode, updates `picSize`,
 * and clears `port.picSave`.
 * `PROCEDURE ClosePicture`.
 */
export function ClosePicture(): void {
  const port = requirePort();
  if (!port.picSave) return;
  PutPicByte(0xff);
  port.picSave = null;
  globals.thePic = null;
  ShowPen();
}

/**
 * Release a picture handle.  In JS this is a no-op — the GC reclaims memory.
 * `PROCEDURE KillPicture(myPicture: PicHandle)`.
 */
export function KillPicture(_pic: PicHandle): void {
  // GC handles memory in JS
}

// -------------------------------------------------------------------------
// PicComment
// -------------------------------------------------------------------------

/**
 * Append a picture comment opcode to the current picture being recorded.
 *
 * Short comments (`dataSize = 0`) emit `$A0 + kind`.
 * Long comments emit `$A1 + kind + dataSize + data`.
 *
 * `PROCEDURE PicComment(kind, dataSize: INTEGER; dataHandle: QDHandle)`.
 */
export function PicComment(
  kind: number,
  dataSize: number,
  dataHandle: number[] | null
): void {
  const port = requirePort();
  const proc = port.grafProcs?.commentProc ?? StdComment;
  proc(kind, dataSize, dataHandle);
}

// -------------------------------------------------------------------------
// GetPicData / StdGetPic (`Pictures.a:70-89`, `:1306-1318`)
// -------------------------------------------------------------------------

/**
 * `PROCEDURE GetPicData` (`Pictures.a:1306-1318`).
 * `getPicProc ?? StdGetPic` via `globals.playPic` / `playIndex`.
 */
function GetPicData(dataPtr: number[], byteCount: number): void {
  const port = requirePort();
  const proc = port.grafProcs?.getPicProc ?? StdGetPic;
  proc(dataPtr, byteCount);
}

/**
 * Default picture-data source bottleneck.  Reads `byteCount` bytes from the
 * current playback stream into `dataPtr`.  `_data` is opcodes only — index 0
 * is the first opcode (`Pictures.a:434` uses `PICDATA` after the 10-byte
 * header; we start at 0).
 */
export function StdGetPic(dataPtr: number[], byteCount: number): void {
  const pic = globals.playPic;
  const n = byteCount | 0;
  if (!pic) {
    for (let i = 0; i < n; i++) dataPtr[i] = 0;
    return;
  }
  for (let i = 0; i < n; i++) {
    dataPtr[i] = pic.pic._data[globals.playIndex] ?? 0;
    globals.playIndex++;
  }
}

export { StdPutPic, StdComment, CheckPic };

// -------------------------------------------------------------------------
// Stream helpers — Pictures.a:1176-1219
// -------------------------------------------------------------------------

function getUByte(): number {
  const buf = [0];
  GetPicData(buf, 1);
  return buf[0]! & 0xff;
}

function getSByte(): number {
  return (getUByte() << 24) >> 24;
}

function getWord(): number {
  const buf = [0, 0];
  GetPicData(buf, 2);
  return asInt16((buf[0]! << 8) | buf[1]!);
}

function getUWord(): number {
  const buf = [0, 0];
  GetPicData(buf, 2);
  return ((buf[0]! << 8) | buf[1]!) & 0xffff;
}

function getLong(): number {
  const buf = [0, 0, 0, 0];
  GetPicData(buf, 4);
  return (buf[0]! << 24) | (buf[1]! << 16) | (buf[2]! << 8) | buf[3]!;
}

function getBytes(n: number): number[] {
  const count = n | 0;
  const buf = new Array<number>(count > 0 ? count : 0);
  if (count > 0) GetPicData(buf, count);
  return buf;
}

function getPoint(): Point {
  return { v: getWord(), h: getWord() };
}

function getPattern(): Pattern {
  return Uint8Array.from(getBytes(8));
}

function getPicRgn(): RgnHandle {
  // GETHNDL (`Pictures.a:1257-1274`): size word + (size−2) payload.
  const size = getUWord();
  const rest = getBytes(Math.max(0, size - 2));
  return rgnFromPicBytes(size, rest);
}

function rgnFromPicBytes(size: number, rest: number[]): RgnHandle {
  const top = wordAt(rest, 0);
  const left = wordAt(rest, 2);
  const bottom = wordAt(rest, 4);
  const right = wordAt(rest, 6);
  const data: number[] = [];
  for (let i = 8; i + 1 < rest.length; i += 2) {
    data.push(wordAt(rest, i));
  }
  return {
    rgn: {
      rgnSize: size,
      rgnBBox: { top, left, bottom, right },
      data: data.length === 0 ? new Int16Array(0) : Int16Array.from(data),
    },
  };
}

function getPicPoly(): PolyHandle {
  const size = getUWord();
  const rest = getBytes(Math.max(0, size - 2));
  const top = wordAt(rest, 0);
  const left = wordAt(rest, 2);
  const bottom = wordAt(rest, 4);
  const right = wordAt(rest, 6);
  const n = Math.max(0, (size - 10) >> 2);
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) {
    const off = 8 + i * 4;
    pts.push({ v: wordAt(rest, off), h: wordAt(rest, off + 2) });
  }
  return {
    poly: {
      polySize: size,
      polyBBox: { top, left, bottom, right },
      polyPoints: pts,
    },
  };
}

function wordAt(bytes: number[], i: number): number {
  return asInt16(((bytes[i] ?? 0) << 8) | (bytes[i + 1] ?? 0));
}

function getMappedRect(state: PicPlayState, same: boolean): Rect {
  // GETRECT (`Pictures.a:1229-1246`)
  if (!same) {
    state.theRect.top = getWord();
    state.theRect.left = getWord();
    state.theRect.bottom = getWord();
    state.theRect.right = getWord();
  }
  const dst = cloneRect(state.theRect);
  MapRect(dst, state.fromRect, state.toRect);
  return dst;
}

function mapCopy(pt: Point, state: PicPlayState): Point {
  const p = { h: pt.h, v: pt.v };
  MapPt(p, state.fromRect, state.toRect);
  return p;
}

function asVerb(n: number): GrafVerb {
  return (n & 7) as GrafVerb;
}

function installClip(state: PicPlayState, mapped: RgnHandle, port: GrafPort): void {
  // Pictures.a:687-692 / :789-793
  MapRgn(mapped, state.fromRect, state.toRect);
  SectRgn(mapped, state.userClip, port.clipRgn);
}

function remapTheClip(state: PicPlayState, port: GrafPort): void {
  const tmp = NewRgn();
  CopyRgn(state.theClip, tmp);
  installClip(state, tmp, port);
}

// -------------------------------------------------------------------------
// Port snapshot / restore (`Pictures.a:419-425`, `:509-519`)
// -------------------------------------------------------------------------

function snapshotPort(port: GrafPort): GrafPort {
  return {
    device: port.device,
    portBits: port.portBits,
    portRect: cloneRect(port.portRect),
    visRgn: port.visRgn,
    clipRgn: port.clipRgn,
    bkPat: new Uint8Array(port.bkPat),
    fillPat: new Uint8Array(port.fillPat),
    pnLoc: { h: port.pnLoc.h, v: port.pnLoc.v },
    pnSize: { h: port.pnSize.h, v: port.pnSize.v },
    pnMode: port.pnMode,
    pnPat: new Uint8Array(port.pnPat),
    pnVis: port.pnVis,
    txFont: port.txFont,
    txFace: port.txFace,
    txMode: port.txMode,
    txSize: port.txSize,
    spExtra: port.spExtra,
    fgColor: port.fgColor,
    bkColor: port.bkColor,
    colrBit: port.colrBit,
    patStretch: port.patStretch,
    picSave: port.picSave,
    rgnSave: port.rgnSave,
    polySave: port.polySave,
    grafProcs: port.grafProcs,
  };
}

function restorePort(port: GrafPort, saved: GrafPort): void {
  port.device = saved.device;
  port.portBits = saved.portBits;
  port.portRect = saved.portRect;
  port.visRgn = saved.visRgn;
  port.clipRgn = saved.clipRgn;
  port.bkPat = saved.bkPat;
  port.fillPat = saved.fillPat;
  port.pnLoc = saved.pnLoc;
  port.pnSize = saved.pnSize;
  port.pnMode = saved.pnMode;
  port.pnPat = saved.pnPat;
  port.pnVis = saved.pnVis;
  port.txFont = saved.txFont;
  port.txFace = saved.txFace;
  port.txMode = saved.txMode;
  port.txSize = saved.txSize;
  port.spExtra = saved.spExtra;
  port.fgColor = saved.fgColor;
  port.bkColor = saved.bkColor;
  port.colrBit = saved.colrBit;
  port.patStretch = saved.patStretch;
  port.picSave = saved.picSave;
  port.rgnSave = saved.rgnSave;
  port.polySave = saved.polySave;
  port.grafProcs = saved.grafProcs;
}

/** Init most fields of thePort (`Pictures.a:464-485`). Leaves pnVis / colrBit / saves / grafProcs. */
function initPlayPort(port: GrafPort): void {
  port.clipRgn = NewRgn();
  port.bkPat = new Uint8Array(8);
  port.fillPat = new Uint8Array(globals.black);
  port.pnLoc = { v: 0, h: 0 };
  port.pnSize = { v: 1, h: 1 };
  port.pnMode = patCopy;
  port.pnPat = new Uint8Array(globals.black);
  port.txFont = 0;
  port.txFace = 0;
  port.txMode = srcOr;
  port.txSize = 0;
  port.spExtra = 0;
  port.fgColor = blackColor;
  port.bkColor = whiteColor;
}

// -------------------------------------------------------------------------
// PicItem (`Pictures.a:526-1300`)
// -------------------------------------------------------------------------

function picPastEnd(): boolean {
  const pic = globals.playPic;
  const port = globals.thePort;
  if (port?.grafProcs?.getPicProc) return false;
  if (!pic) return true;
  return globals.playIndex >= pic.pic._data.length;
}

/**
 * `FUNCTION PicItem` (`Pictures.a:534-537`).
 * Draws one item. Returns false on `$FF` (or past-end with StdGetPic).
 */
function PicItem(state: PicPlayState): boolean {
  const port = requirePort();
  if (picPastEnd()) return false;

  const op = getUByte();
  if (op === 0xff) return false; // Pictures.a:592-595

  if (op < 0x20) {
    playParamOp(op, state, port);
    return true;
  }

  const same = (op & 8) !== 0; // BTST #3 (`Pictures.a:609-610`)
  const verb = op & 7;
  const noun = op >> 4;

  switch (noun) {
    case 0x2:
      if (same) playTextOp(verb, state, port);
      else playLineOp(verb, state, port);
      break;
    case 0x3:
      (port.grafProcs?.rectProc ?? StdRect)(asVerb(verb), getMappedRect(state, same));
      break;
    case 0x4:
      (port.grafProcs?.rRectProc ?? StdRRect)(
        asVerb(verb),
        getMappedRect(state, same),
        state.ovalSize.h,
        state.ovalSize.v
      );
      break;
    case 0x5:
      (port.grafProcs?.ovalProc ?? StdOval)(asVerb(verb), getMappedRect(state, same));
      break;
    case 0x6: {
      // Pictures.a:947-958 — SAMEFLAG skips the rect only; angles are always read.
      const r = getMappedRect(state, same);
      const startAngle = getWord();
      const arcAngle = getWord();
      (port.grafProcs?.arcProc ?? StdArc)(asVerb(verb), r, startAngle, arcAngle);
      break;
    }
    case 0x7: {
      const poly = getPicPoly();
      MapPoly(poly, state.fromRect, state.toRect);
      (port.grafProcs?.polyProc ?? StdPoly)(asVerb(verb), poly);
      break;
    }
    case 0x8: {
      const rgn = getPicRgn();
      MapRgn(rgn, state.fromRect, state.toRect);
      (port.grafProcs?.rgnProc ?? StdRgn)(asVerb(verb), rgn);
      break;
    }
    case 0x9:
      playBitsOp(verb, same, state, port);
      break;
    case 0xa:
      playCommentOp(verb, port);
      break;
    default:
      // $B0–$FE: reserved nouns → DONE without fail (`Pictures.a:627-632`)
      break;
  }
  return true;
}

function playParamOp(op: number, state: PicPlayState, port: GrafPort): void {
  // PARMJMP (`Pictures.a:643-674`)
  switch (op & 0x1f) {
    case 0x00:
      break;
    case 0x01: {
      const src = getPicRgn();
      CopyRgn(src, state.theClip);
      installClip(state, src, port);
      break;
    }
    case 0x02:
      port.bkPat = getPattern();
      break;
    case 0x03:
      port.txFont = getWord();
      break;
    case 0x04:
      port.txFace = getUByte();
      break;
    case 0x05:
      port.txMode = getWord();
      break;
    case 0x06:
      port.spExtra = getLong();
      break;
    case 0x07: {
      port.pnSize = getPoint();
      ScalePt(port.pnSize, state.fromRect, state.toRect);
      break;
    }
    case 0x08:
      port.pnMode = getWord();
      break;
    case 0x09:
      port.pnPat = getPattern();
      break;
    case 0x0a:
      port.fillPat = getPattern();
      break;
    case 0x0b:
      state.ovalSize = getPoint();
      ScalePt(state.ovalSize, state.fromRect, state.toRect);
      break;
    case 0x0c: {
      // GETLONG is dh (high word), dv (low word) — PicFormat `$0C`. Pictures.a:777-793
      const raw = getLong();
      const dv = asInt16(raw);
      const dh = asInt16(raw >> 16);
      state.fromRect.top += dv;
      state.fromRect.bottom += dv;
      globals.patAlign.v += dv;
      state.fromRect.left += dh;
      state.fromRect.right += dh;
      globals.patAlign.h += dh;
      remapTheClip(state, port);
      break;
    }
    case 0x0d:
      port.txSize = getWord();
      break;
    case 0x0e:
      port.fgColor = getLong();
      break;
    case 0x0f:
      port.bkColor = getLong();
      break;
    case 0x10:
      state.numer = getPoint();
      state.denom = getPoint();
      ScalePt(state.numer, state.fromRect, state.toRect);
      break;
    case 0x11:
      getUByte(); // version byte ignored (`Pictures.a:751-752`)
      break;
    default:
      // $12–$1F reserved → NOP (`Pictures.a:661-674`)
      break;
  }
}

function playLineOp(verb: number, state: PicPlayState, port: GrafPort): void {
  // TXLNOP lines (`Pictures.a:807-844`). verb bit0 = from-prev; bit1 = short.
  let start: Point;
  if (verb & 1) {
    start = { h: state.penLoc.h, v: state.penLoc.v };
  } else {
    start = getPoint();
  }
  port.pnLoc = mapCopy(start, state);

  let newPt: Point;
  if (verb & 2) {
    newPt = { h: start.h + getSByte(), v: start.v + getSByte() };
  } else {
    newPt = getPoint();
  }
  state.penLoc = { h: newPt.h, v: newPt.v };
  const mapped = mapCopy(newPt, state);
  (port.grafProcs?.lineProc ?? StdLine)(mapped);
}

function playTextOp(verb: number, state: PicPlayState, port: GrafPort): void {
  // TEXTOP (`Pictures.a:854-896`). verb AND 3: 0=long, 1=DH, 2=DV, 3=DHDV.
  const kind = verb & 3;
  if (kind === 0) {
    state.textLoc = getPoint();
  } else {
    if (kind & 1) state.textLoc.h += getUByte();
    if (kind & 2) state.textLoc.v += getUByte();
  }
  const count = getUByte();
  const bytes = getBytes(count);
  port.pnLoc = mapCopy(state.textLoc, state);
  const numer = { h: state.numer.h, v: state.numer.v };
  const denom = { h: state.denom.h, v: state.denom.v };
  (port.grafProcs?.textProc ?? StdText)(count, bytes, numer, denom);
}

function playBitsOp(
  verb: number,
  packed: boolean,
  state: PicPlayState,
  port: GrafPort
): void {
  // BITSOP (`Pictures.a:1015-1088`): 26 bytes rowBytes+bounds+src+dst, then mode.
  const rowBytes = getUWord();
  const bounds: Rect = {
    top: getWord(),
    left: getWord(),
    bottom: getWord(),
    right: getWord(),
  };
  const srcRect: Rect = {
    top: getWord(),
    left: getWord(),
    bottom: getWord(),
    right: getWord(),
  };
  const dstRect: Rect = {
    top: getWord(),
    left: getWord(),
    bottom: getWord(),
    right: getWord(),
  };
  MapRect(dstRect, state.fromRect, state.toRect);
  const mode = getWord();

  let maskRgn: RgnHandle | null = null;
  if (verb !== 0) maskRgn = getPicRgn();

  const height = asInt16(bounds.bottom - bounds.top);
  const rows = height > 0 ? height : 0;
  const stride = rowBytes;
  const bits = new Uint8Array(Math.max(0, rows * stride));

  if (packed) {
    const dstPtr = { value: 0 };
    for (let row = 0; row < rows; row++) {
      const count = getUByte();
      const packedRow = Uint8Array.from(getBytes(count));
      UnpackBits(packedRow, { value: 0 }, bits, dstPtr, stride);
    }
  } else {
    const raw = getBytes(rows * stride);
    for (let i = 0; i < raw.length; i++) bits[i] = raw[i]!;
  }

  const srcBits: BitMap = { baseAddr: bits, rowBytes: stride, bounds };
  (port.grafProcs?.bitsProc ?? StdBits)(srcBits, srcRect, dstRect, mode, maskRgn);
}

function playCommentOp(verb: number, port: GrafPort): void {
  // COMMOP (`Pictures.a:1095-1118`). verb==0 → short; else long.
  const kind = getWord();
  const proc = port.grafProcs?.commentProc ?? StdComment;
  if (verb === 0) {
    proc(kind, 0, null);
    return;
  }
  const dataSize = getUWord();
  const data = getBytes(dataSize);
  proc(kind, dataSize, data);
}

// -------------------------------------------------------------------------
// DrawPicture (`Pictures.a:334-522`)
// -------------------------------------------------------------------------

/**
 * Replay a recorded picture into the current port, scaled to fit `dstRect`.
 *
 * `PROCEDURE DrawPicture(myPicture: PicHandle; dstRect: Rect)`.
 */
export function DrawPicture(myPicture: PicHandle, dstRect: Rect): void {
  const port = requirePort();
  if (!myPicture) return; // Pictures.a:373-374

  const dstW = asInt16(asInt16(dstRect.right) - asInt16(dstRect.left));
  const dstH = asInt16(asInt16(dstRect.bottom) - asInt16(dstRect.top));
  if (dstW <= 0 || dstH <= 0) return; // Pictures.a:382-390

  const frame = myPicture.pic.picFrame;
  const srcW = asInt16(asInt16(frame.right) - asInt16(frame.left));
  const srcH = asInt16(asInt16(frame.bottom) - asInt16(frame.top));
  if (srcW <= 0 || srcH <= 0) return; // Pictures.a:401-411

  const saved = snapshotPort(port);

  globals.patAlign = { h: 0, v: 0 };
  globals.playPic = myPicture;
  globals.playIndex = 0; // _data is opcodes only (`Pictures.a:434` PICDATA)

  const state: PicPlayState = {
    theRect: { top: 0, left: 0, bottom: 0, right: 0 },
    penLoc: { h: 0, v: 0 },
    textLoc: { h: 0, v: 0 },
    ovalSize: { h: 0, v: 0 },
    fromRect: cloneRect(frame),
    toRect: cloneRect(dstRect),
    numer: { h: dstW, v: dstH },
    denom: { h: srcW, v: srcH },
    theClip: NewRgn(),
    userClip: saved.clipRgn,
  };

  initPlayPort(port);

  try {
    while (PicItem(state)) {
      /* Pictures.a:498-502 */
    }
  } finally {
    restorePort(port, saved);
    globals.patAlign = { h: 0, v: 0 };
    globals.playPic = null;
    globals.playIndex = 0;
  }
}

// -------------------------------------------------------------------------
// serializePicture / parsePicture — PICT v1 bytes (plan §4.7 / Phase 6)
// -------------------------------------------------------------------------

function writeWord(out: Uint8Array, i: number, w: number): void {
  const v = asInt16(w);
  out[i] = (v >> 8) & 0xff;
  out[i + 1] = v & 0xff;
}

function readSWord(bytes: ArrayLike<number>, i: number): number {
  return asInt16((((bytes[i] ?? 0) & 0xff) << 8) | ((bytes[i + 1] ?? 0) & 0xff));
}

/**
 * Exact PICT v1 bytes: `picSize` word + `picFrame` (4 words) + opcode `_data`.
 * The 10-byte header is **not** stored inside `_data`.
 */
export function serializePicture(pic: PicHandle): Uint8Array {
  const data = pic.pic._data;
  const out = new Uint8Array(10 + data.length);
  writeWord(out, 0, 10 + data.length);
  writeWord(out, 2, pic.pic.picFrame.top);
  writeWord(out, 4, pic.pic.picFrame.left);
  writeWord(out, 6, pic.pic.picFrame.bottom);
  writeWord(out, 8, pic.pic.picFrame.right);
  for (let i = 0; i < data.length; i++) out[10 + i] = data[i]! & 0xff;
  return out;
}

/**
 * Parse PICT v1 bytes into a {@link PicHandle}. Bytes after the 10-byte
 * header become `_data`.
 */
export function parsePicture(bytes: ArrayLike<number>): PicHandle {
  const picSize = readSWord(bytes, 0) & 0xffff;
  const picFrame: Rect = {
    top: readSWord(bytes, 2),
    left: readSWord(bytes, 4),
    bottom: readSWord(bytes, 6),
    right: readSWord(bytes, 8),
  };
  const data: number[] = [];
  for (let i = 10; i < bytes.length; i++) data.push((bytes[i] ?? 0) & 0xff);
  return { pic: { picSize, picFrame, _data: data } };
}
