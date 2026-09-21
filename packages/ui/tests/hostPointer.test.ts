import { describe, expect, it } from "vitest";
import { hostPresentsCursor, pointerKind } from "../src/web/hostPointer";

describe("hostPresentsCursor", () => {
  it("is true when the host has a hovering fine pointer", () => {
    expect(hostPresentsCursor(() => ({ matches: true }))).toBe(true);
    expect(hostPresentsCursor(() => ({ matches: false }))).toBe(false);
  });

  it("assumes a mouse when matchMedia is missing", () => {
    expect(hostPresentsCursor(() => null)).toBe(true);
  });
});

describe("pointerKind", () => {
  it("maps touch and pen, and treats a coarse mouse as touch", () => {
    expect(pointerKind({ pointerType: "touch" }, true)).toBe("touch");
    expect(pointerKind({ pointerType: "pen" }, true)).toBe("pen");
    expect(pointerKind({ pointerType: "mouse" }, true)).toBe("mouse");
    expect(pointerKind({ pointerType: "mouse" }, false)).toBe("touch");
  });
});
