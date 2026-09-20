import { describe, expect, it } from "vitest";
import { hostKeyStrokes } from "../src/web/hostKeyboard";

const NONE = { shift: false, ctrl: false, alt: false, meta: false };

describe("hostKeyStrokes", () => {
  it("sends keypress after keydown for a printable character", () => {
    expect(hostKeyStrokes("a", NONE)).toEqual(["keydown", "keypress"]);
  });

  it("does not keypress Backspace or a command chord", () => {
    expect(hostKeyStrokes("Backspace", NONE)).toEqual(["keydown"]);
    expect(hostKeyStrokes("v", { ...NONE, meta: true })).toEqual(["keydown"]);
  });
});
