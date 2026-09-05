/**
 * Bottleneck routines — from `QuickDraw.p` The Bottleneck Interface section.
 *
 * The *bottleneck* is the mechanism by which QuickDraw allows callers to
 * intercept every drawing primitive (lines, rects, ovals, text, bitmaps,
 * etc.).  Install a customised {@link QDProcs} record in `port.grafProcs` and
 * any drawing call will route through your hooks before (or instead of)
 * the default `Std*` implementations.
 *
 * ## Typical use
 * ```ts
 * const procs: QDProcs = {};
 * SetStdProcs(procs);          // fill all slots with defaults
 * procs.rectProc = myRectHook; // override just one
 * port.grafProcs = procs;
 * ```
 */

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

/**
 * Populate all slots of `procs` with the standard QuickDraw implementations.
 *
 * Call this before installing `procs` in `port.grafProcs` so that you only
 * need to override the specific operations you care about — unpatched slots
 * will behave identically to the default QuickDraw drawing.
 *
 * `PROCEDURE SetStdProcs(VAR procs: QDProcs)`.
 */
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

/**
 * Default bitmap bottleneck.  Copies `srcBits[srcRect]` to
 * `port.portBits[dstRect]` using the given mode and optional mask region.
 *
 * `PROCEDURE StdBits(VAR srcBits: BitMap; VAR srcRect, dstRect: Rect;
 *                    mode: INTEGER; maskRgn: RgnHandle)`.
 */
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

/**
 * Default picture-comment bottleneck.  The standard implementation is a
 * no-op; override via `grafProcs.commentProc` to handle application-defined
 * comments during picture playback.
 *
 * `PROCEDURE StdComment(kind, dataSize: INTEGER; dataHandle: QDHandle)`.
 */
export function StdComment(
  _kind: number,
  _dataSize: number,
  _dataHandle: number[] | null
): void {
  // Default implementation is a no-op
}
