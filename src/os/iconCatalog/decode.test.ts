import { describe, expect, it } from "vitest";
import { familyMembers, spriteFromIcnSharp, spriteFromIcsSharp, spriteFromIcon } from "./decode";
import type { IconFamily } from "./types";
import { defineSprite } from "@mockintosh/ui";

function setBit(raw: Uint8Array, rowBytes: number, x: number, y: number): void {
  raw[y * rowBytes + (x >> 3)] |= 1 << (7 - (x & 7));
}

describe("System 7 icon resource decoders", () => {
  it("reads ICN# icon and mask bits", () => {
    const raw = new Uint8Array(256);
    setBit(raw, 4, 0, 0);
    setBit(raw, 4, 31, 31);
    setBit(raw.subarray(128), 4, 0, 0);
    const s = spriteFromIcnSharp(raw);
    expect(s.width).toBe(32);
    expect(s.height).toBe(32);
    expect(s.data[0]).toBe(1);
    expect(s.data[31 * 32 + 31]).toBe(1);
    expect(s.data[1]).toBe(0);
    expect(s.mask![0]).toBe(1);
    expect(s.mask![1]).toBe(0);
  });

  it("reads ics# as 16×16", () => {
    const raw = new Uint8Array(64);
    raw.fill(0xff);
    const s = spriteFromIcsSharp(raw);
    expect(s.width).toBe(16);
    expect(s.height).toBe(16);
    expect(s.data.every((p) => p === 1)).toBe(true);
    expect(s.mask!.every((p) => p === 1)).toBe(true);
  });

  it("treats ICON as fully opaque", () => {
    const raw = new Uint8Array(128);
    const s = spriteFromIcon(raw);
    expect(s.mask!.every((p) => p === 1)).toBe(true);
  });

  it("lists every family member with size and depth", () => {
    const blank = defineSprite(32, 32, "A");
    const family: IconFamily = {
      source: "System",
      group: "system",
      id: -3993,
      name: "Trash",
      icn: blank,
      ics: defineSprite(16, 16, "A"),
      icl8: new Uint8Array(1024),
    };
    expect(familyMembers(family).map((m) => `${m.kind} ${m.width} ${m.depth}`)).toEqual([
      "ICN# 32 1-bit",
      "ics# 16 1-bit",
      "icl8 32 8-bit",
    ]);
  });
});
