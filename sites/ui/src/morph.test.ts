import { describe, expect, it } from "vitest";
import { getBit, newBitMap, setBit } from "@mockintosh/quickdraw/bits";
import { collectInk, pairInk, paintDitherDissolve, paintMorph, sortInk, splitStationary, subsampleInk } from "./inkMorph";

describe("collectInk", () => {
  it("samples one point per ink block", () => {
    const bm = newBitMap(8, 8);
    setBit(bm, 1, 1, 1);
    setBit(bm, 1, 0, 1);
    setBit(bm, 6, 6, 1);
    const xy = collectInk(bm, 2);
    expect([...xy]).toEqual([1, 0, 6, 6]);
  });

  it("keeps every ink pixel at step 1", () => {
    const bm = newBitMap(4, 2);
    setBit(bm, 0, 0, 1);
    setBit(bm, 1, 0, 1);
    setBit(bm, 1, 1, 1);
    expect([...collectInk(bm, 1)]).toEqual([0, 0, 1, 0, 1, 1]);
  });
});

describe("sortInk / pairInk", () => {
  it("pairs 1:1 and drops leftover source ink out the bottom", () => {
    const from = sortInk(new Float32Array([4, 4, 0, 0]));
    expect([...from]).toEqual([0, 0, 4, 4]);
    const to = new Float32Array([1, 1]);
    const paired = pairInk(from, to, 8);
    expect(paired.length).toBe(12);
    expect([...paired.subarray(0, 4)]).toEqual([0, 0, 1, 1]);
    expect([...paired.subarray(6, 10)]).toEqual([4, 4, 4, 22]);
  });

  it("sends existing ink to the lower dest and drops extras onto the top", () => {
    const from = new Float32Array([0, 0]);
    const to = new Float32Array([1, 1, 3, 2]);
    const paired = pairInk(from, to, 8);
    expect([...paired.subarray(0, 4)]).toEqual([0, 0, 3, 2]);
    expect([...paired.subarray(6, 10)]).toEqual([1, -14, 1, 1]);
  });

  it("pairs nearest unused source for Near", () => {
    const from = new Float32Array([0, 0, 10, 0]);
    const to = new Float32Array([9, 0]);
    const paired = pairInk(from, to, 8, "nearest");
    expect([...paired.subarray(0, 4)]).toEqual([10, 0, 9, 0]);
    expect([...paired.subarray(6, 10)]).toEqual([0, 0, 0, 22]);
  });

  it("Snap uses the same nearest pairing as Near", () => {
    const from = new Float32Array([0, 0, 10, 0]);
    const to = new Float32Array([9, 0]);
    const paired = pairInk(from, to, 8, "snap");
    expect([...paired.subarray(0, 4)]).toEqual([10, 0, 9, 0]);
    expect([...paired.subarray(6, 10)]).toEqual([0, 0, 0, 22]);
  });

  it("reserves the top dest for Near extras", () => {
    const from = new Float32Array([9, 8]);
    const to = new Float32Array([1, 0, 9, 8]);
    const paired = pairInk(from, to, 8, "nearest");
    expect([...paired.subarray(0, 4)]).toEqual([1, -14, 1, 0]);
    expect([...paired.subarray(6, 10)]).toEqual([9, 8, 9, 8]);
  });

  it("edge pushes leftover dest in from the nearest side", () => {
    const from = new Float32Array([4, 4]);
    const to = new Float32Array([1, 1, 0, 3]);
    const paired = pairInk(from, to, 8, "throw", "edge");
    expect([...paired.subarray(0, 4)]).toEqual([4, 4, 1, 1]);
    expect([...paired.subarray(6, 10)]).toEqual([-14, 3, 0, 3]);
  });

  it("edge pushes leftover source out the nearest side", () => {
    const from = new Float32Array([0, 3, 7, 3]);
    const to = new Float32Array([4, 4]);
    const paired = pairInk(from, to, 8, "throw", "edge");
    expect([...paired.subarray(0, 4)]).toEqual([0, 3, 4, 4]);
    expect([...paired.subarray(6, 10)]).toEqual([7, 3, 22, 3]);
  });

  it("stack duplicates source onto extra dest", () => {
    const from = new Float32Array([2, 2]);
    const to = new Float32Array([2, 2, 5, 5]);
    const paired = pairInk(from, to, 8, "throw", "stack");
    expect([...paired.subarray(0, 4)]).toEqual([2, 2, 2, 2]);
    expect([...paired.subarray(6, 10)]).toEqual([2, 2, 5, 5]);
  });

  it("stack piles leftover source onto dest", () => {
    const from = new Float32Array([2, 2, 5, 5]);
    const to = new Float32Array([2, 2]);
    const paired = pairInk(from, to, 8, "throw", "stack");
    expect([...paired.subarray(0, 4)]).toEqual([2, 2, 2, 2]);
    expect([...paired.subarray(6, 10)]).toEqual([5, 5, 2, 2]);
  });

  it("Near stack piles unused source onto the nearest dest", () => {
    const from = new Float32Array([0, 0, 10, 0]);
    const to = new Float32Array([9, 0]);
    const paired = pairInk(from, to, 8, "nearest", "stack");
    expect([...paired.subarray(0, 4)]).toEqual([10, 0, 9, 0]);
    expect([...paired.subarray(6, 10)]).toEqual([0, 0, 9, 0]);
  });

  it("pins ink that already sits on both frames", () => {
    const { stay, movingFrom, movingTo } = splitStationary(
      new Float32Array([0, 0, 2, 2]),
      new Float32Array([2, 2, 5, 5]),
    );
    expect([...stay]).toEqual([2, 2]);
    expect([...movingFrom]).toEqual([0, 0]);
    expect([...movingTo]).toEqual([5, 5]);
  });

  it("caps a dense field", () => {
    const xy = new Float32Array(20);
    for (let i = 0; i < 10; i++) {
      xy[i * 2] = i;
      xy[i * 2 + 1] = 0;
    }
    expect(subsampleInk(xy, 4).length).toBe(8);
  });
});

describe("paintMorph", () => {
  it("lands on the dest at t=1", () => {
    const dest = newBitMap(8, 8);
    paintMorph(dest, new Float32Array([0, 0, 5, 3, 0, 0]), 1);
    const xy = collectInk(dest, 1);
    expect([...xy]).toEqual([5, 3]);
  });

  it("keeps leftover dest ink above the frame at t=0", () => {
    const dest = newBitMap(8, 8);
    paintMorph(dest, new Float32Array([3, -14, 3, 2, 0, 0]), 0);
    expect(collectInk(dest, 1).length).toBe(0);
  });

  it("drops leftover source ink out of the frame at t=1", () => {
    const dest = newBitMap(8, 8);
    paintMorph(dest, new Float32Array([4, 4, 4, 22, 0, 0]), 1);
    expect(collectInk(dest, 1).length).toBe(0);
  });

  it("keeps stationary ink put while other particles move", () => {
    const dest = newBitMap(8, 8);
    paintMorph(dest, new Float32Array([0, 0, 5, 3, 0, 0]), 0.5, "throw", new Float32Array([1, 1]));
    const xy = collectInk(dest, 1);
    expect([...xy].slice(0, 2)).toEqual([1, 1]);
  });
});

describe("paintDitherDissolve", () => {
  it("keeps shared ink and lands on dest at t=1", () => {
    const from = newBitMap(4, 4);
    const to = newBitMap(4, 4);
    const dest = newBitMap(4, 4);
    setBit(from, 0, 0, 1);
    setBit(from, 1, 1, 1);
    setBit(to, 0, 0, 1);
    setBit(to, 3, 3, 1);
    paintDitherDissolve(dest, from, to, 0);
    expect(getBit(dest, 0, 0)).toBe(1);
    expect(getBit(dest, 3, 3)).toBe(0);
    paintDitherDissolve(dest, from, to, 0.5);
    expect(getBit(dest, 0, 0)).toBe(1);
    paintDitherDissolve(dest, from, to, 1);
    expect([...collectInk(dest, 1)]).toEqual([0, 0, 3, 3]);
  });
});
