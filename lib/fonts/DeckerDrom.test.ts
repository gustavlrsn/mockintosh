import { describe, expect, it } from "vitest";
import { deckerOrdinalForCharCode } from "./DeckerDrom";

describe("deckerOrdinalForCharCode", () => {
  it("matches Decker drom_to_ord for ASCII and å", () => {
    expect(deckerOrdinalForCharCode(10)).toBe(10);
    expect(deckerOrdinalForCharCode(32)).toBe(32);
    expect(deckerOrdinalForCharCode(122)).toBe(122);
    expect(deckerOrdinalForCharCode("å".charCodeAt(0))).toBe(164);
    expect(deckerOrdinalForCharCode("Å".charCodeAt(0))).toBe(133);
    expect(deckerOrdinalForCharCode(0x2026)).toBe(127);
  });

  it("returns 255 for unmapped code units", () => {
    expect(deckerOrdinalForCharCode(9)).toBe(255);
    expect(deckerOrdinalForCharCode(0xd800)).toBe(255);
  });
});
