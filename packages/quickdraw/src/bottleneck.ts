// Bottleneck routines — from QuickDraw.p The Bottleneck Interface section
// SetStdProcs and the standard bottleneck implementations (mostly re-exports
// of the core Std* functions from their respective modules).

import {
  QDProcs,
  GrafPort,
  Rect,
  Point,
  RgnHandle,
  BitMap,
  FontInfo,
  Pattern,
} from "./types";
import { globals } from "./globals";
import { StdLine } from "./lines";
import { StdRect } from "./rects";
import { StdRRect, StdOval, StdArc } from "./arcs";
import { StdPoly } from "./polygons";
import { StdRgn } from "./regions";
import { StdText, StdTxMeas } from "./text";
import { StdGetPic, StdPutPic } from "./pictures";
import { CopyBits } from "./bitmaps";

// -------------------------------------------------------------------------
// SetStdProcs
// -------------------------------------------------------------------------

// PROCEDURE SetStdProcs(VAR procs: QDProcs);
// Fills in all bottleneck slots with the standard QuickDraw implementations.
export function SetStdProcs(procs: QDProcs): void {
  procs.textProc = StdText;
  procs.lineProc = (newPt: Point) => {
    const port = globals.thePort;
    if (port) StdLine(port, newPt);
  };
  procs.rectProc = (verb, r) => StdRect(verb as number, r);
  procs.rRectProc = (verb, r, ovWd, ovHt) =>
    StdRRect(verb as number, r, ovWd, ovHt);
  procs.ovalProc = (verb, r) => StdOval(verb as number, r);
  procs.arcProc = (verb, r, sa, aa) => StdArc(verb as number, r, sa, aa);
  procs.polyProc = (verb, poly) => StdPoly(verb as number, poly);
  procs.rgnProc = (verb, rgn) => StdRgn(verb as number, rgn);
  procs.bitsProc = (srcBits, srcRect, dstRect, mode, maskRgn) => {
    const port = globals.thePort;
    if (!port) return;
    CopyBits(srcBits, port.portBits, srcRect, dstRect, mode, maskRgn);
  };
  procs.commentProc = (_kind, _dataSize, _dataHandle) => {
    /* no-op */
  };
  procs.txMeasProc = StdTxMeas;
  procs.getPicProc = StdGetPic;
  procs.putPicProc = StdPutPic;
}

// -------------------------------------------------------------------------
// StdBits
// -------------------------------------------------------------------------

// PROCEDURE StdBits(VAR srcBits: BitMap; VAR srcRect, dstRect: Rect;
//                  mode: INTEGER; maskRgn: RgnHandle);
export function StdBits(
  srcBits: BitMap,
  srcRect: Rect,
  dstRect: Rect,
  mode: number,
  maskRgn: RgnHandle | null
): void {
  const port = globals.thePort;
  if (!port) return;
  CopyBits(srcBits, port.portBits, srcRect, dstRect, mode, maskRgn);
}

// -------------------------------------------------------------------------
// StdComment
// -------------------------------------------------------------------------

// PROCEDURE StdComment(kind, dataSize: INTEGER; dataHandle: QDHandle);
export function StdComment(
  _kind: number,
  _dataSize: number,
  _dataHandle: number[] | null
): void {
  // Default implementation is a no-op
}
