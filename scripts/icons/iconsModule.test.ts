import { describe, expect, it } from "vitest";
import {
  appendIconSource,
  constNameForKey,
  parseIconEntries,
  slugKey,
  uniqueKey,
} from "./iconsModule";
import type { ConvertedSprite } from "./types";

const FIXTURE = `import { defineSprite, fromGrid, type Sprite } from "@mockintosh/ui";

const ICON_STOP = fromGrid(2, 1, ["#."]);

export const iconSprites: Record<string, Sprite> = {
  "icon/stop": ICON_STOP,
};
`;

const SPRITE: ConvertedSprite = {
  width: 2,
  height: 1,
  b64: "AAAA",
  data: new Uint8Array([1, 0]),
  mask: new Uint8Array([1, 1]),
  blackPixels: 1,
  opaquePixels: 2,
};

describe("slugKey / constNameForKey", () => {
  it("slugs a display name and builds ICON_* consts", () => {
    expect(slugKey("Caution 2", "Icon Collection--Caution 2.png")).toBe("caution-2");
    expect(constNameForKey("icon/caution-2")).toBe("ICON_CAUTION_2");
  });

  it("falls back when the name is non-ascii", () => {
    expect(slugKey("あんまん", "hot--anman---16455.png")).toBe("icon");
  });
});

describe("appendIconSource", () => {
  it("inserts a defineSprite and registry entry", () => {
    const next = appendIconSource(FIXTURE, {
      key: "icon/caution",
      constName: "ICON_CAUTION",
      sprite: SPRITE,
      sourceFile: "Icon Collection--Caution.png",
      mode: "threshold",
    });
    const entries = parseIconEntries(next);
    expect(entries.map((e) => e.key)).toEqual(["icon/stop", "icon/caution"]);
    expect(next).toContain("/** ryos: Icon Collection--Caution.png · threshold */");
    expect(next).toContain('const ICON_CAUTION = defineSprite(');
    expect(next).toContain('"AAAA"');
  });

  it("refuses a duplicate key", () => {
    expect(() =>
      appendIconSource(FIXTURE, {
        key: "icon/stop",
        constName: "ICON_STOP_2",
        sprite: SPRITE,
        sourceFile: "x.png",
        mode: "threshold",
      })
    ).toThrow(/already exists/);
  });
});

describe("uniqueKey", () => {
  it("suffixes when the preferred key is taken", () => {
    expect(uniqueKey("icon/caution", new Set(["icon/caution"]))).toBe("icon/caution-2");
  });
});
