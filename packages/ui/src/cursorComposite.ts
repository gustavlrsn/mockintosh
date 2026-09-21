/**
 * Host software-cursor compositor — the stand-in for the Mac VBL task.
 *
 * QuickDraw never owns save-under. The UI framebuffer stays clean; the host
 * stamps the cursor onto a presentation copy so pointer motion does not
 * re-paint the tree.
 */

import { CopyBits, srcCopy, type BitMap, type Cursor, type Rect } from "@mockintosh/quickdraw";
import { makeRect } from "@mockintosh/quickdraw/bits";
import { blitQuickdrawCursorBits, CURSOR_SIZE } from "./cursorFace";

/** Unclipped 16×16 dest rect for a cursor whose hot spot is at (`x`, `y`). */
export function cursorStampRect(
  x: number,
  y: number,
  hotSpot: { h: number; v: number },
): Rect {
  const top = y - hotSpot.v;
  const left = x - hotSpot.h;
  return makeRect(top, left, top + CURSOR_SIZE, left + CURSOR_SIZE);
}

export function copyBitMapBytes(src: BitMap, dst: BitMap): void {
  dst.baseAddr.set(src.baseAddr);
}

export function copyBitRect(src: BitMap, dst: BitMap, rect: Rect): void {
  CopyBits(src, dst, rect, rect, srcCopy, null);
}

/**
 * Restore `prev` from `clean` onto `dest`, then stamp `cursor` at (`x`, `y`).
 * Returns the new unclipped stamp rect, or `null` when nothing is drawn.
 */
export function moveSoftwareCursor(
  clean: BitMap,
  dest: BitMap,
  prev: Rect | null,
  cursor: Cursor | undefined,
  x: number,
  y: number,
): Rect | null {
  if (prev) copyBitRect(clean, dest, prev);
  if (!cursor) return null;
  blitQuickdrawCursorBits(dest, cursor, x, y);
  return cursorStampRect(x, y, cursor.hotSpot);
}
