import { existsSync } from "fs";
import { describe, expect, it } from "vitest";
import { catalogFileFromPath, isNative1Bit, loadCatalog, resourceKind, slimRyosEntries } from "./catalog";
import { CATALOG_PATH } from "./paths";
import { searchIcons } from "./search";

describe("ryos catalog helpers", () => {
  it("decodes ICN%23 and keeps only native 1-bit entries", () => {
    expect(resourceKind("ICN%23/-3998")).toBe("ICN#");
    expect(isNative1Bit("ICN%23/-3998")).toBe(true);
    expect(isNative1Bit("icl8/128")).toBe(false);
    const icons = slimRyosEntries("system-7", [
      {
        type: "system",
        name: "System - Trash (System)",
        sourceFile: "System [zsys/MACS]",
        sourceResource: "ICN%23/-3998",
        catalogPath: "/public/resources/classic-mac-icon-catalogs/system-7/system/system-trash-system.png",
      },
      {
        type: "applications",
        name: "HyperCard color",
        sourceResource: "icl8/128",
        catalogPath: "/public/resources/classic-mac-icon-catalogs/system-7/applications/x.png",
      },
    ]);
    expect(icons).toHaveLength(1);
    expect(icons[0].file).toBe("system-7/system/system-trash-system.png");
    expect(icons[0].themes).toEqual(["ICN#", "system"]);
  });

  it("strips the published catalog prefix", () => {
    expect(
      catalogFileFromPath(
        "/public/resources/classic-mac-icon-catalogs/system-7/system/system-trash-system.png"
      )
    ).toBe("system-7/system/system-trash-system.png");
  });
});

describe("pinned catalog", () => {
  it("loads native 1-bit icons and can find trash", () => {
    expect(existsSync(CATALOG_PATH), "run `npm run icons:refresh-catalog`").toBe(true);
    const catalog = loadCatalog();
    expect(catalog.length).toBeGreaterThan(40);
    expect(catalog.every((icon) => icon.themes.includes("ICN#") || icon.themes.includes("ics#") || icon.themes.includes("SICN"))).toBe(true);
    const hits = searchIcons(catalog, "trash", { limit: 5 });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].icon.name.toLowerCase()).toContain("trash");
  });
});
