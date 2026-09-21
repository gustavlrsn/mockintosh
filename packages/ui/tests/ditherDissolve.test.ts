import { describe, expect, it } from "vitest";
import { paintDitherDissolve } from "../src/ditherDissolve";

function pack(bits: number[]): Uint8Array {
  return new Uint8Array(bits);
}

describe("paintDitherDissolve", () => {
  it("keeps shared ink and lands on dest at t=1", () => {
    const from = pack([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const to = pack([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
    const out = new Uint8Array(16);
    paintDitherDissolve(out, from, to, 4, 4, 0);
    expect(out[0]).toBe(1);
    expect(out[15]).toBe(0);
    paintDitherDissolve(out, from, to, 4, 4, 0.5);
    expect(out[0]).toBe(1);
    paintDitherDissolve(out, from, to, 4, 4, 1);
    expect([...out]).toEqual([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
  });
});
