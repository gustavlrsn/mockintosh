import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  GetPixel,
  HideCursor,
  InitCursor,
  InitGraf,
  ObscureCursor,
  OpenPort,
  PaintRect,
  QDError,
  SetCursor,
  ShieldCursor,
  ShowCursor,
  cursorState,
  globals,
  installCursorVectors,
  type Cursor,
  type GrafPort,
  type Rect,
} from "../src";
import { makePoint, makeRect, newBitMap } from "../src/bits";

function openPort(w = 16, h = 8): GrafPort {
  InitGraf(newBitMap(w, h));
  const port = {} as GrafPort;
  OpenPort(port);
  return port;
}

const otherCursor: Cursor = {
  data: globals.arrow.data,
  mask: globals.arrow.mask,
  hotSpot: makePoint(0, 0),
};

describe("cursor vectors", () => {
  beforeEach(() => {
    installCursorVectors();
    InitCursor();
  });

  afterEach(() => {
    installCursorVectors();
  });

  it("default shield does not ShowCursor after a blit", () => {
    openPort();
    HideCursor();
    expect(cursorState.hideCount).toBe(-1);
    PaintRect(makeRect(0, 0, 4, 4));
    expect(cursorState.hideCount).toBe(-1);
    expect(cursorState.visible).toBe(false);
  });

  it("ShowCursor saturates at hideCount 0", () => {
    ShowCursor();
    ShowCursor();
    expect(cursorState.hideCount).toBe(0);
    expect(cursorState.visible).toBe(true);

    HideCursor();
    HideCursor();
    expect(cursorState.hideCount).toBe(-2);
    ShowCursor();
    ShowCursor();
    ShowCursor();
    expect(cursorState.hideCount).toBe(0);
    expect(cursorState.visible).toBe(true);
  });

  it("SetCursor does not clear obscured", () => {
    ObscureCursor();
    expect(cursorState.obscured).toBe(true);
    SetCursor(otherCursor);
    expect(cursorState.cursor).toBe(otherCursor);
    expect(cursorState.obscured).toBe(true);
  });

  it("ShieldCursor subtracts offset then calls the shield vector", () => {
    const seen: Rect[] = [];
    const input = makeRect(10, 20, 30, 40);
    installCursorVectors({
      shieldCursor: (r) => {
        seen.push(r);
      },
    });
    ShieldCursor(input, makePoint(5, 2));
    expect(seen).toEqual([makeRect(8, 15, 28, 35)]);
    expect(input).toEqual(makeRect(10, 20, 30, 40));
  });

  it("InitCursor goes through SetCursor then the init vector", () => {
    const sets: Cursor[] = [];
    let inits = 0;
    installCursorVectors({
      setCursor: (crsr) => {
        sets.push(crsr);
      },
      initCursor: () => {
        inits++;
      },
    });
    InitCursor();
    expect(sets).toEqual([globals.arrow]);
    expect(inits).toBe(1);
  });
});

describe("GetPixel cursor nest", () => {
  beforeEach(() => {
    installCursorVectors();
    InitCursor();
  });

  afterEach(() => {
    installCursorVectors();
  });

  it("Hide/Show around a read restore hideCount", () => {
    const port = openPort();
    PaintRect(makeRect(1, 2, 2, 4));
    HideCursor();
    expect(cursorState.hideCount).toBe(-1);
    expect(GetPixel(2, 1)).toBe(true);
    expect(GetPixel(1, 1)).toBe(false);
    expect(cursorState.hideCount).toBe(-1);
    expect(cursorState.visible).toBe(false);
    void port;
  });

  it("bounds miss is white and still Hide/Show", () => {
    openPort();
    HideCursor();
    HideCursor();
    expect(cursorState.hideCount).toBe(-2);
    expect(GetPixel(-1, 0)).toBe(false);
    expect(GetPixel(0, -1)).toBe(false);
    expect(GetPixel(16, 0)).toBe(false);
    expect(GetPixel(0, 8)).toBe(false);
    expect(cursorState.hideCount).toBe(-2);
  });

  it("ShowCursor still runs if thePort is NIL", () => {
    globals.thePort = null;
    expect(() => GetPixel(0, 0)).toThrow(QDError);
    expect(cursorState.hideCount).toBe(0);
    expect(cursorState.visible).toBe(true);
  });
});
