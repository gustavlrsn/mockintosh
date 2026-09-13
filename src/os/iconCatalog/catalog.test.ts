import { describe, expect, it } from "vitest";
import { alertIcon, familyLabel, loadIconCatalog, shippedIconCatalog } from "./catalog";

describe("System 7.5.3 icon catalog", () => {
  it("dumps the suitcase and Finder families from the IA image", () => {
    const all = loadIconCatalog();
    expect(all.length).toBeGreaterThan(300);
    expect(all.some((f) => f.source === "System" && f.id === -3993 && f.icn)).toBe(true);
    expect(all.some((f) => f.source === "System" && f.id === -3999 && f.icn)).toBe(true);
    expect(all.some((f) => f.source === "Finder" && f.icn)).toBe(true);
  });

  it("overlays update bags onto System IDs for the shipped view", () => {
    const shipped = shippedIconCatalog();
    expect(shipped.every((f) => f.group !== "update")).toBe(true);
    expect(shipped.some((f) => f.group === "system" && f.id === -3996)).toBe(true);
    expect(familyLabel(shipped.find((f) => f.id === -3998 && f.group === "system")!)).toBe(
      "Floppy Disk"
    );
  });

  it("resolves Stop / Note / Caution to System ICON 0 / 1 / 2", () => {
    const stop = alertIcon("stop");
    const note = alertIcon("note");
    const caution = alertIcon("caution");
    expect(stop).toMatchObject({ width: 32, height: 32 });
    expect(note).toMatchObject({ width: 32, height: 32 });
    expect(caution).toMatchObject({ width: 32, height: 32 });
    expect(stop!.data).not.toEqual(note!.data);
    expect(note!.data).not.toEqual(caution!.data);
  });
});
