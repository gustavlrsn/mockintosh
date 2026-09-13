/**
 * Grow-only scratch for the blit / region pipeline.
 *
 * The 68k used stack slots. We keep the same buffers across calls so a frame
 * of `FrameRect` / `DrawString` does not allocate a new `RGNREC` and mask
 * on every primitive.
 */
import type { BitMap } from "./types";
import type { RegionData } from "./regionTypes";
import type { RGNREC } from "./seekRgn";

const EMPTY_RGN: RegionData = {
  rgnSize: 10,
  rgnBBox: { top: 0, left: 0, bottom: 0, right: 0 },
  data: new Int16Array(0),
};

export function growUint16(buf: Uint16Array | undefined, n: number): Uint16Array {
  if (buf && buf.length >= n) {
    buf.fill(0, 0, n);
    return buf;
  }
  return new Uint16Array(n);
}

export function growUint8(buf: Uint8Array | undefined, n: number, fill = true): Uint8Array {
  if (buf && buf.length >= n) {
    if (fill) buf.fill(0, 0, n);
    return buf;
  }
  return new Uint8Array(n);
}

let maskWords: Uint16Array | undefined;

/** Cleared scan-mask buffer of at least `n` words. */
export function acquireMaskWords(n: number): Uint16Array {
  maskWords = growUint16(maskWords, n);
  return maskWords;
}

let stretchSrc: Uint8Array | undefined;
let stretchDst: Uint8Array | undefined;

export function acquireStretchBufs(srcN: number, dstN: number): { src: Uint8Array; dst: Uint8Array } {
  stretchSrc = growUint8(stretchSrc, srcN);
  stretchDst = growUint8(stretchDst, dstN);
  return { src: stretchSrc, dst: stretchDst };
}

function makeState(): RGNREC {
  return {
    rgnPtr: EMPTY_RGN,
    dataPtr: 0,
    scanBuf: new Uint16Array(0),
    scanSize: 0,
    thisV: -32767,
    nextV: 32767,
    minH: 0,
    maxH: 0,
    leftH: 0,
  };
}

const slotA = makeState();
const slotB = makeState();
const slotC = makeState();

export function rgnSlots(): [RGNREC, RGNREC, RGNREC] {
  return [slotA, slotB, slotC];
}

let snap: Uint8Array | undefined;
const snapBm: BitMap = {
  baseAddr: new Uint8Array(0),
  rowBytes: 0,
  bounds: { top: 0, left: 0, bottom: 1, right: 0 },
};

/** Copy one source row into a reused 1-high bitmap (horizontal self-overlap). */
export function snapshotRow(src: BitMap, srcV: number): BitMap {
  const rb = src.rowBytes;
  const sRow = (srcV - src.bounds.top) * rb;
  snap = growUint8(snap, rb, false);
  snap.set(src.baseAddr.subarray(sRow, sRow + rb));
  snapBm.baseAddr = rb === snap.length ? snap : snap.subarray(0, rb);
  snapBm.rowBytes = rb;
  snapBm.bounds.top = srcV;
  snapBm.bounds.bottom = srcV + 1;
  snapBm.bounds.left = src.bounds.left;
  snapBm.bounds.right = src.bounds.right;
  return snapBm;
}

let bitRowA: Uint8Array | undefined;
let bitRowB: Uint8Array | undefined;

export function acquireBitRow(n: number, slot: 0 | 1): Uint8Array {
  if (slot === 0) {
    bitRowA = growUint8(bitRowA, n, false);
    return bitRowA;
  }
  bitRowB = growUint8(bitRowB, n, false);
  return bitRowB;
}
