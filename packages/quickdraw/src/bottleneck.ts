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

import type { QDProcs } from "./types";
import { StdLine } from "./lines";
import { StdRect } from "./rects";
import { StdRRect, StdOval, StdArc } from "./arcs";
import { StdPoly } from "./polygons";
import { StdRgn } from "./regions";
import { StdText, StdTxMeas } from "./text";
import { StdGetPic, StdPutPic } from "./pictures";
import { StdComment } from "./picSave";
import { StdBits } from "./bitmaps";

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
  procs.lineProc = StdLine;
  procs.rectProc = StdRect;
  procs.rRectProc = StdRRect;
  procs.ovalProc = StdOval;
  procs.arcProc = StdArc;
  procs.polyProc = StdPoly;
  procs.rgnProc = StdRgn;
  procs.bitsProc = StdBits;
  procs.commentProc = StdComment;
  procs.txMeasProc = StdTxMeas;
  procs.getPicProc = StdGetPic;
  procs.putPicProc = StdPutPic;
}

// -------------------------------------------------------------------------
// StdBits
// -------------------------------------------------------------------------

export { StdBits } from "./bitmaps";
export { StdComment } from "./picSave";
