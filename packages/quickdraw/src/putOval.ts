/**
 * Oval / RoundRect → inversion points — `reference/QuickDraw/PutOval.a`.
 *
 * Consecutive duplicate points cancel (`PutOval.a:231-241`).
 */

import type { Point, Rect } from "./types";
import { asInt16, HiWord } from "./fixmath";
import { BumpOval, InitOval, newOvalRec } from "./drawArc";

function putPt(dst: Point[], v: number, h: number): void {
  if (dst.length > 0) {
    const prev = dst[dst.length - 1];
    if (prev.v === v && prev.h === h) {
      dst.pop(); // PutOval.a:236-240
      return;
    }
  }
  dst.push({ v, h });
}

/**
 * `PROCEDURE PutOval(dstRect; ovalWidth, ovalHeight; bufHandle; VAR index, size)`
 * (`PutOval.a:28-185`), appending inversion points to `dst`.
 */
export function PutOval(
  dstRect: Rect,
  ovalWidth: number,
  ovalHeight: number,
  dst: Point[]
): void {
  const oval = newOvalRec();
  InitOval(dstRect, oval, ovalWidth, ovalHeight);

  let oldLeft = HiWord(oval.leftEdge);
  let oldRight = HiWord(oval.rightEdge);

  // skipTop/skipBot use the raw ovalHeight (`PutOval.a:80-89`).
  const skipTop = asInt16(oval.ovalTop + (asInt16(ovalHeight) >> 1));
  const skipBot = asInt16(
    asInt16(
      asInt16(skipTop + asInt16(dstRect.bottom)) - asInt16(dstRect.top)
    ) - asInt16(ovalHeight)
  );

  let vert = oval.ovalTop;
  putPt(dst, vert, oldLeft); // PutOval.a:116-120
  putPt(dst, vert, oldRight);

  while (vert < oval.ovalBot) {
    if (vert < skipTop || vert >= skipBot) {
      BumpOval(oval, vert); // PutOval.a:129-138
    }

    const newLeft = HiWord(oval.leftEdge);
    if (newLeft !== oldLeft) {
      putPt(dst, vert, newLeft); // PutOval.a:143-149
      putPt(dst, vert, oldLeft);
      oldLeft = newLeft;
    }

    const newRight = HiWord(oval.rightEdge);
    if (newRight !== oldRight) {
      putPt(dst, vert, newRight); // PutOval.a:153-159
      putPt(dst, vert, oldRight);
      oldRight = newRight;
    }

    vert = asInt16(vert + 1);
  }

  putPt(dst, vert, oldLeft); // PutOval.a:170-173
  putPt(dst, vert, oldRight);
}
