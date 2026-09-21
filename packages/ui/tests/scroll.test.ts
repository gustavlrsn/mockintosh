import { describe, it, expect } from "vitest";
import { createNode } from "../src/nodes";
import { scrollOverflow, scrollPaintOffset, scrollTrack } from "../src/scroll";

function pane(height: number, contentHeight: number, offset = 0) {
  const box = createNode("box");
  box.style = { overflow: "scroll", width: 40, height };
  box.layout = { x: 0, y: 0, width: 40, height };
  box._scrollOffset = offset;
  const child = createNode("box");
  child.style = { width: 40, height: contentHeight };
  child.layout = { x: 0, y: 0, width: 40, height: contentHeight };
  child.parent = box;
  box.children = [child];
  return box;
}

describe("scrollPaintOffset", () => {
  it("snaps a half-pixel flick offset to a whole row", () => {
    const box = pane(40, 100, 10.5);
    expect(scrollPaintOffset(box)).toBe(11);
  });
});

describe("scrollOverflow", () => {
  it("is zero when content fits", () => {
    expect(scrollOverflow(pane(40, 40))).toBe(0);
  });

  it("is the extra content height", () => {
    expect(scrollOverflow(pane(40, 100))).toBe(60);
  });
});

describe("scrollTrack", () => {
  it("is absent when the pane cannot scroll", () => {
    expect(scrollTrack(pane(40, 40), 0, 0, 40, 40)).toBeNull();
  });

  it("is a 3px column inset from the right, top, and bottom", () => {
    const track = scrollTrack(pane(40, 100), 0, 0, 40, 40);
    expect(track).toMatchObject({ x: 36, y: 1, width: 3, height: 38 });
    expect(track!.thumbHeight).toBeGreaterThanOrEqual(2);
    expect(track!.thumbY).toBe(1);
  });

  it("moves the thumb with the offset", () => {
    const top = scrollTrack(pane(40, 100, 0), 0, 0, 40, 40)!;
    const mid = scrollTrack(pane(40, 100, 30), 0, 0, 40, 40)!;
    const end = scrollTrack(pane(40, 100, 60), 0, 0, 40, 40)!;
    expect(mid.thumbY).toBeGreaterThan(top.thumbY);
    expect(end.thumbY).toBeGreaterThan(mid.thumbY);
    expect(end.thumbY + end.thumbHeight).toBe(39);
  });
});
