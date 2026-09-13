/**
 * The byte-wide BitBlt must agree with the per-pixel reference for every
 * transfer mode, any bit alignment of source and destination, bitmaps whose
 * bounds do not start at a byte boundary, and overlapping self-copies.
 */
import { describe, expect, it } from "vitest";
import type { BitMap, Rect } from "../src";
import { newBitMap, pixelsFromBitMap, makeRect } from "../src/bits";
import { BitBltSlow } from "../src/bitblt";
import { BitBlt } from "../src/bitBltCore";

/** Small deterministic PRNG so failures reproduce. */
function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function randomBitMap(rand: () => number, width: number, height: number, left: number, top: number): BitMap {
  const bm = newBitMap(width, height);
  for (let i = 0; i < bm.baseAddr.length; i++) bm.baseAddr[i] = Math.floor(rand() * 256);
  bm.bounds = makeRect(top, left, top + height, left + width);
  return bm;
}

function clone(bm: BitMap): BitMap {
  return { baseAddr: bm.baseAddr.slice(), rowBytes: bm.rowBytes, bounds: { ...bm.bounds } };
}

function randomPattern(rand: () => number): Uint8Array {
  return Uint8Array.from({ length: 8 }, () => Math.floor(rand() * 256));
}

/** A rectangle of at most `maxW`×`maxH` that lies inside `bounds`. */
function randomRectIn(rand: () => number, bounds: Rect, maxW: number, maxH: number): Rect {
  const bw = bounds.right - bounds.left;
  const bh = bounds.bottom - bounds.top;
  const w = 1 + Math.floor(rand() * Math.min(maxW, bw));
  const h = 1 + Math.floor(rand() * Math.min(maxH, bh));
  const left = bounds.left + Math.floor(rand() * (bw - w + 1));
  const top = bounds.top + Math.floor(rand() * (bh - h + 1));
  return makeRect(top, left, top + h, left + w);
}

describe("BitBlt byte-wide paths", () => {
  it("matches the per-pixel reference for all 16 modes and arbitrary alignments", () => {
    const rand = rng(1234);
    for (let trial = 0; trial < 400; trial++) {
      const src = randomBitMap(rand, 40 + Math.floor(rand() * 30), 12, Math.floor(rand() * 13), Math.floor(rand() * 5));
      const dstA = randomBitMap(rand, 50 + Math.floor(rand() * 30), 14, Math.floor(rand() * 11), Math.floor(rand() * 5));
      const dstB = clone(dstA);
      const mode = trial % 16;
      const pat = randomPattern(rand);
      const srcRect = randomRectIn(rand, src.bounds, 37, 9);
      const w = srcRect.right - srcRect.left;
      const h = srcRect.bottom - srcRect.top;
      const dstBounds = dstA.bounds;
      const dLeft = dstBounds.left + Math.floor(rand() * (dstBounds.right - dstBounds.left - w + 1));
      const dTop = dstBounds.top + Math.floor(rand() * (dstBounds.bottom - dstBounds.top - h + 1));
      const dstRect = makeRect(dTop, dLeft, dTop + h, dLeft + w);

      BitBlt(src, dstA, srcRect, dstRect, mode, pat);
      BitBltSlow(src, dstB, srcRect, dstRect, mode, pat);
      expect(pixelsFromBitMap(dstA), `mode ${mode} trial ${trial}`).toEqual(pixelsFromBitMap(dstB));
    }
  });

  it("handles overlapping self-copies in every direction like a careful per-pixel copy", () => {
    const rand = rng(99);
    for (let trial = 0; trial < 200; trial++) {
      const bm = randomBitMap(rand, 48, 24, Math.floor(rand() * 9), 0);
      const expected = clone(bm);
      const srcRect = randomRectIn(rand, bm.bounds, 30, 16);
      const dh = Math.floor(rand() * 21) - 10;
      const dv = Math.floor(rand() * 11) - 5;
      const dstRect = makeRect(srcRect.top + dv, srcRect.left + dh, srcRect.bottom + dv, srcRect.right + dh);
      const b = bm.bounds;
      if (dstRect.left < b.left || dstRect.right > b.right || dstRect.top < b.top || dstRect.bottom > b.bottom) continue;

      // Reference: copy via a snapshot so overlap cannot corrupt it.
      const snapshot = clone(bm);
      BitBltSlow(snapshot, expected, srcRect, dstRect, 0, new Uint8Array(8));
      BitBlt(bm, bm, srcRect, dstRect, 0, new Uint8Array(8));
      expect(pixelsFromBitMap(bm), `dh ${dh} dv ${dv}`).toEqual(pixelsFromBitMap(expected));
    }
  });
});
