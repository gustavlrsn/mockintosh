// Picture record/playback routines — from QuickDraw.p Picture Routines section.
// Implements the QuickDraw picture opcode stream (PicFormat.txt).
//
// OpenPicture starts recording all drawing calls as opcodes.
// DrawPicture replays those opcodes through the current port.

import {
  Picture,
  PicHandle,
  Rect,
  RgnHandle,
  Point,
  Pattern,
  cloneRect,
} from "./types";
import { globals } from "./globals";
import { FrameRect, PaintRect, EraseRect, InvertRect, FillRect } from "./rects";
import {
  FrameRoundRect,
  PaintRoundRect,
  EraseRoundRect,
  InvertRoundRect,
  FillRoundRect,
} from "./arcs";
import { FrameOval, PaintOval, EraseOval, InvertOval, FillOval } from "./arcs";
import { FrameArc, PaintArc, EraseArc, InvertArc, FillArc } from "./arcs";
import { FrameRgn, PaintRgn, EraseRgn, InvertRgn, FillRgn } from "./regions";
import { MoveTo, LineTo, StdLine } from "./lines";
import { DrawText } from "./text";
import { SetOrigin, BackPat, ClipRect } from "./grafport";
import { TextFont, TextFace, TextMode, TextSize, SpaceExtra } from "./text";
import { ForeColor, BackColor } from "./utils";
import { PenSize, PenMode, PenPat } from "./lines";
import { CopyBits } from "./bitmaps";
import { NewRgn, SetRectRgn } from "./regions";

// Opcode constants (from PicFormat.txt)
const PIC_NOP = 0x00;
const PIC_CLIP_RGN = 0x01;
const PIC_BKPAT = 0x02;
const PIC_TX_FONT = 0x03;
const PIC_TX_FACE = 0x04;
const PIC_TX_MODE = 0x05;
const PIC_SP_EXTRA = 0x06;
const PIC_PN_SIZE = 0x07;
const PIC_PN_MODE = 0x08;
const PIC_PN_PAT = 0x09;
const PIC_OV_SIZE = 0x0b;
const PIC_ORIGIN = 0x0c;
const PIC_TX_SIZE = 0x0d;
const PIC_FG_COLOR = 0x0e;
const PIC_BK_COLOR = 0x0f;
const PIC_LINE = 0x20;
const PIC_LINE_FROM = 0x21;
const PIC_SHORT_LINE = 0x22;
const PIC_SHORT_LINE_FROM = 0x23;
const PIC_LONG_TEXT = 0x28;
const PIC_DH_TEXT = 0x29;
const PIC_DV_TEXT = 0x2a;
const PIC_DHDV_TEXT = 0x2b;
const PIC_END = 0xff;
const PIC_SHORT_COMMENT = 0xa0;
const PIC_LONG_COMMENT = 0xa1;

// -------------------------------------------------------------------------
// Picture playback state (cursor into the byte stream)
// -------------------------------------------------------------------------

let _playPic: PicHandle | null = null;
let _playIndex = 0;

function readByte(): number {
  if (!_playPic) return 0;
  return _playPic.pic._data[_playIndex++] ?? 0;
}

function readWord(): number {
  return (readByte() << 8) | readByte();
}

function readLong(): number {
  return ((readWord() << 16) | readWord()) >>> 0;
}

function readPoint(): Point {
  const v = (readWord() << 16) >> 16; // signed
  const h = (readWord() << 16) >> 16;
  return { v, h };
}

function readRect(): Rect {
  const top = (readWord() << 16) >> 16;
  const left = (readWord() << 16) >> 16;
  const bottom = (readWord() << 16) >> 16;
  const right = (readWord() << 16) >> 16;
  return { top, left, bottom, right };
}

function readPattern(): Pattern {
  const pat = new Uint8Array(8);
  for (let i = 0; i < 8; i++) pat[i] = readByte();
  return pat;
}

function readRegion(): RgnHandle {
  const size = readWord();
  const bbox = readRect();
  const rgn = NewRgn();
  SetRectRgn(rgn, bbox.left, bbox.top, bbox.right, bbox.bottom);
  // Skip any additional data beyond the bounding box
  for (let i = 10; i < size; i++) readByte();
  return rgn;
}

// -------------------------------------------------------------------------
// OpenPicture / ClosePicture / KillPicture
// -------------------------------------------------------------------------

// FUNCTION OpenPicture(picFrame: Rect): PicHandle;
export function OpenPicture(picFrame: Rect): PicHandle {
  const handle: PicHandle = {
    pic: {
      picSize: 10,
      picFrame: cloneRect(picFrame),
      _data: [],
    },
  };
  if (globals.thePort) globals.thePort.picSave = handle;
  // Write picture version opcode (0x11, version 1)
  picPutByte(handle, PIC_NOP);
  return handle;
}

// PROCEDURE ClosePicture;
export function ClosePicture(): void {
  const port = globals.thePort;
  if (!port || !port.picSave) return;
  const h = port.picSave;
  port.picSave = null;
  // Write end-of-picture opcode
  picPutByte(h, PIC_END);
  h.pic.picSize = h.pic._data.length + 10;
}

// PROCEDURE KillPicture(myPicture: PicHandle);
export function KillPicture(_pic: PicHandle): void {
  // GC handles memory in JS
}

// -------------------------------------------------------------------------
// PicComment
// -------------------------------------------------------------------------

// PROCEDURE PicComment(kind, dataSize: INTEGER; dataHandle: QDHandle);
export function PicComment(
  kind: number,
  dataSize: number,
  dataHandle: number[] | null
): void {
  const port = globals.thePort;
  if (!port || !port.picSave) return;
  const h = port.picSave;
  if (dataSize === 0 || !dataHandle) {
    picPutByte(h, PIC_SHORT_COMMENT);
    picPutWord(h, kind);
  } else {
    picPutByte(h, PIC_LONG_COMMENT);
    picPutWord(h, kind);
    picPutWord(h, dataSize);
    for (let i = 0; i < dataSize && i < dataHandle.length; i++) {
      picPutByte(h, dataHandle[i]);
    }
  }
}

// -------------------------------------------------------------------------
// StdGetPic / StdPutPic (bottleneck procedures)
// -------------------------------------------------------------------------

export function StdGetPic(dataPtr: number[], byteCount: number): void {
  if (!_playPic) return;
  for (let i = 0; i < byteCount; i++) {
    dataPtr[i] = _playPic.pic._data[_playIndex++] ?? 0;
  }
}

export function StdPutPic(dataPtr: number[], byteCount: number): void {
  const port = globals.thePort;
  if (!port || !port.picSave) return;
  for (let i = 0; i < byteCount; i++) {
    port.picSave.pic._data.push(dataPtr[i]);
  }
}

// -------------------------------------------------------------------------
// DrawPicture — replay the picture stream
// -------------------------------------------------------------------------

// PROCEDURE DrawPicture(myPicture: PicHandle; dstRect: Rect);
export function DrawPicture(myPicture: PicHandle, dstRect: Rect): void {
  const port = globals.thePort;
  if (!port) return;

  _playPic = myPicture;
  _playIndex = 0;

  // Saved state for "same" opcodes
  let lastRect: Rect = { top: 0, left: 0, bottom: 0, right: 0 };
  let ovWd = 0,
    ovHt = 0;
  let startAngle = 0,
    arcAngle = 0;

  // Safety limit
  const maxOps = myPicture.pic._data.length + 1;
  let opCount = 0;

  while (_playIndex < myPicture.pic._data.length && opCount++ < maxOps) {
    const op = readByte();
    switch (op) {
      case PIC_NOP:
        break;

      case PIC_CLIP_RGN: {
        const rgn = readRegion();
        ClipRect(rgn.rgn.rgnBBox);
        break;
      }
      case PIC_BKPAT:
        BackPat(readPattern());
        break;
      case PIC_TX_FONT:
        TextFont(readWord());
        break;
      case PIC_TX_FACE:
        TextFace(readByte());
        break;
      case PIC_TX_MODE:
        TextMode(readWord());
        break;
      case PIC_SP_EXTRA:
        SpaceExtra(readLong());
        break;
      case PIC_PN_SIZE: {
        const pt = readPoint();
        PenSize(pt.h, pt.v);
        break;
      }
      case PIC_PN_MODE:
        PenMode(readWord());
        break;
      case PIC_PN_PAT:
        PenPat(readPattern());
        break;
      case PIC_OV_SIZE: {
        const pt = readPoint();
        ovWd = pt.h;
        ovHt = pt.v;
        break;
      }
      case PIC_ORIGIN: {
        const dh = (readWord() << 16) >> 16;
        const dv = (readWord() << 16) >> 16;
        SetOrigin(dh, dv);
        break;
      }
      case PIC_TX_SIZE:
        TextSize(readWord());
        break;
      case PIC_FG_COLOR:
        ForeColor(readLong());
        break;
      case PIC_BK_COLOR:
        BackColor(readLong());
        break;

      // Lines
      case PIC_LINE: {
        const from = readPoint();
        const to = readPoint();
        MoveTo(from.h, from.v);
        LineTo(to.h, to.v);
        break;
      }
      case PIC_LINE_FROM: {
        const to = readPoint();
        LineTo(to.h, to.v);
        break;
      }
      case PIC_SHORT_LINE: {
        const from = readPoint();
        const dh = (readByte() << 24) >> 24;
        const dv = (readByte() << 24) >> 24;
        MoveTo(from.h, from.v);
        LineTo(from.h + dh, from.v + dv);
        break;
      }
      case PIC_SHORT_LINE_FROM: {
        const dh = (readByte() << 24) >> 24;
        const dv = (readByte() << 24) >> 24;
        LineTo(port.pnLoc.h + dh, port.pnLoc.v + dv);
        break;
      }

      // Text
      case PIC_LONG_TEXT: {
        const loc = readPoint();
        const cnt = readByte();
        const bytes: number[] = [];
        for (let i = 0; i < cnt; i++) bytes.push(readByte());
        MoveTo(loc.h, loc.v);
        DrawText(String.fromCharCode(...bytes), 0, cnt);
        break;
      }
      case PIC_DH_TEXT: {
        const dh = readByte();
        const cnt = readByte();
        const bytes: number[] = [];
        for (let i = 0; i < cnt; i++) bytes.push(readByte());
        MoveTo(port.pnLoc.h + dh, port.pnLoc.v);
        DrawText(String.fromCharCode(...bytes), 0, cnt);
        break;
      }
      case PIC_DV_TEXT: {
        const dv = readByte();
        const cnt = readByte();
        const bytes: number[] = [];
        for (let i = 0; i < cnt; i++) bytes.push(readByte());
        MoveTo(port.pnLoc.h, port.pnLoc.v + dv);
        DrawText(String.fromCharCode(...bytes), 0, cnt);
        break;
      }
      case PIC_DHDV_TEXT: {
        const dh = readByte();
        const dv = readByte();
        const cnt = readByte();
        const bytes: number[] = [];
        for (let i = 0; i < cnt; i++) bytes.push(readByte());
        MoveTo(port.pnLoc.h + dh, port.pnLoc.v + dv);
        DrawText(String.fromCharCode(...bytes), 0, cnt);
        break;
      }

      // Rects
      case 0x30:
        lastRect = readRect();
        FrameRect(lastRect);
        break;
      case 0x31:
        lastRect = readRect();
        PaintRect(lastRect);
        break;
      case 0x32:
        lastRect = readRect();
        EraseRect(lastRect);
        break;
      case 0x33:
        lastRect = readRect();
        InvertRect(lastRect);
        break;
      case 0x34:
        lastRect = readRect();
        FillRect(lastRect, port.fillPat);
        break;
      case 0x38:
        FrameRect(lastRect);
        break;
      case 0x39:
        PaintRect(lastRect);
        break;
      case 0x3a:
        EraseRect(lastRect);
        break;
      case 0x3b:
        InvertRect(lastRect);
        break;
      case 0x3c:
        FillRect(lastRect, port.fillPat);
        break;

      // RoundRects
      case 0x40:
        lastRect = readRect();
        FrameRoundRect(lastRect, ovWd, ovHt);
        break;
      case 0x41:
        lastRect = readRect();
        PaintRoundRect(lastRect, ovWd, ovHt);
        break;
      case 0x42:
        lastRect = readRect();
        EraseRoundRect(lastRect, ovWd, ovHt);
        break;
      case 0x43:
        lastRect = readRect();
        InvertRoundRect(lastRect, ovWd, ovHt);
        break;
      case 0x44:
        lastRect = readRect();
        FillRoundRect(lastRect, ovWd, ovHt, port.fillPat);
        break;
      case 0x48:
        FrameRoundRect(lastRect, ovWd, ovHt);
        break;
      case 0x49:
        PaintRoundRect(lastRect, ovWd, ovHt);
        break;
      case 0x4a:
        EraseRoundRect(lastRect, ovWd, ovHt);
        break;
      case 0x4b:
        InvertRoundRect(lastRect, ovWd, ovHt);
        break;
      case 0x4c:
        FillRoundRect(lastRect, ovWd, ovHt, port.fillPat);
        break;

      // Ovals
      case 0x50:
        lastRect = readRect();
        FrameOval(lastRect);
        break;
      case 0x51:
        lastRect = readRect();
        PaintOval(lastRect);
        break;
      case 0x52:
        lastRect = readRect();
        EraseOval(lastRect);
        break;
      case 0x53:
        lastRect = readRect();
        InvertOval(lastRect);
        break;
      case 0x54:
        lastRect = readRect();
        FillOval(lastRect, port.fillPat);
        break;
      case 0x58:
        FrameOval(lastRect);
        break;
      case 0x59:
        PaintOval(lastRect);
        break;
      case 0x5a:
        EraseOval(lastRect);
        break;
      case 0x5b:
        InvertOval(lastRect);
        break;
      case 0x5c:
        FillOval(lastRect, port.fillPat);
        break;

      // Arcs
      case 0x60: {
        lastRect = readRect();
        startAngle = readWord();
        arcAngle = readWord();
        FrameArc(lastRect, startAngle, arcAngle);
        break;
      }
      case 0x61: {
        lastRect = readRect();
        startAngle = readWord();
        arcAngle = readWord();
        PaintArc(lastRect, startAngle, arcAngle);
        break;
      }
      case 0x62: {
        lastRect = readRect();
        startAngle = readWord();
        arcAngle = readWord();
        EraseArc(lastRect, startAngle, arcAngle);
        break;
      }
      case 0x63: {
        lastRect = readRect();
        startAngle = readWord();
        arcAngle = readWord();
        InvertArc(lastRect, startAngle, arcAngle);
        break;
      }
      case 0x64: {
        lastRect = readRect();
        startAngle = readWord();
        arcAngle = readWord();
        FillArc(lastRect, startAngle, arcAngle, port.fillPat);
        break;
      }
      case 0x68:
        FrameArc(lastRect, startAngle, arcAngle);
        break;
      case 0x69:
        PaintArc(lastRect, startAngle, arcAngle);
        break;
      case 0x6a:
        EraseArc(lastRect, startAngle, arcAngle);
        break;
      case 0x6b:
        InvertArc(lastRect, startAngle, arcAngle);
        break;
      case 0x6c:
        FillArc(lastRect, startAngle, arcAngle, port.fillPat);
        break;

      // Comments
      case PIC_SHORT_COMMENT:
        readWord();
        break;
      case PIC_LONG_COMMENT: {
        readWord(); // kind
        const sz = readWord();
        for (let i = 0; i < sz; i++) readByte();
        break;
      }

      case PIC_END:
        _playIndex = myPicture.pic._data.length;
        break;

      default:
        // Unknown opcode — stop
        _playIndex = myPicture.pic._data.length;
        break;
    }
  }

  _playPic = null;
}

// -------------------------------------------------------------------------
// Helpers for building picture streams during recording
// -------------------------------------------------------------------------

function picPutByte(h: PicHandle, b: number): void {
  h.pic._data.push(b & 0xff);
}

function picPutWord(h: PicHandle, w: number): void {
  picPutByte(h, (w >> 8) & 0xff);
  picPutByte(h, w & 0xff);
}

function picPutLong(h: PicHandle, l: number): void {
  picPutWord(h, (l >> 16) & 0xffff);
  picPutWord(h, l & 0xffff);
}

function picPutRect(h: PicHandle, r: Rect): void {
  picPutWord(h, r.top);
  picPutWord(h, r.left);
  picPutWord(h, r.bottom);
  picPutWord(h, r.right);
}
