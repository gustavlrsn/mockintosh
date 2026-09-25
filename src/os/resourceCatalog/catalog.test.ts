import { describe, expect, it } from "vitest";
import {
  catalogPatternValue,
  cursorSprite,
  desktopFill,
  desktopPatternRecord,
  desktopPatterns,
  patternBytes,
  shippedCursor,
  shippedCursors,
  systemPatterns,
  watchAnimation,
} from "./catalog";

describe("System 7.5.3 pattern and cursor catalogs", () => {
  it("dumps Desktop Patterns ppats and the System PAT# list", () => {
    const desktop = desktopPatterns();
    expect(desktop.length).toBe(74);
    expect(desktop.every((p) => p.pat.length === 16)).toBe(true);
    expect(desktop.some((p) => p.width === 8 && p.height === 8)).toBe(true);
    expect(desktop.some((p) => p.width === 64 && p.height === 64)).toBe(true);

    const pats = systemPatterns();
    expect(pats).toHaveLength(38);
    expect(pats[3].pat).toBe("aa55aa55aa55aa55");
    expect(patternBytes(pats[3].pat)).toEqual(new Uint8Array([0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55]));
    expect(desktopPatternRecord(136)?.pat).toBe("aa55aa55aa55aa55");
    expect(catalogPatternValue(136)).toBe("ppat:136");
    expect(desktopFill("white")).toBe(0);
    expect(desktopFill("black")).toBe(1);
    expect(desktopFill("checker")).toBe("checker");
    expect(desktopFill("ppat:136")).toEqual(patternBytes("aa55aa55aa55aa55"));
    expect(desktopFill("ppat:99999")).toBe("checker");
    expect(desktopFill("pat:1122448811224488")).toEqual(patternBytes("1122448811224488"));
  });

  it("ships System cursors 1–4 as iBeam / cross / plus / watch", () => {
    expect(shippedCursor(1)?.name).toBe("iBeam");
    expect(shippedCursor(2)?.name).toBe("cross");
    expect(shippedCursor(3)?.name).toBe("plus");
    expect(shippedCursor(4)?.name).toBe("watch");
    const watch = cursorSprite(shippedCursor(4)!);
    expect(watch.sprite.width).toBe(16);
    expect(watch.hotSpot).toEqual({ v: 8, h: 8 });
    expect(shippedCursors().some((c) => c.source === "Finder")).toBe(true);
    expect(watchAnimation()?.frames[0]).toBe(4);
  });
});
