/**
 * Host pixel helpers — not part of QuickDraw.p.
 *
 * Import from `@mockintosh/quickdraw/bits`. The main `@mockintosh/quickdraw`
 * entry is the Pascal surface (`QuickDraw.p` + `GrafUtil.p` + OS seams).
 */

export { makePoint, makeRect, cloneRect } from "./types";
export {
  rowBytesFor,
  newBitMap,
  bitMapWidth,
  bitMapHeight,
  getBit,
  setBit,
  clearBitMap,
  bitMapFromPixels,
  pixelsFromBitMap,
} from "./packedBits";
