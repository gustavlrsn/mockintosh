import { describe, expect, it } from "vitest";
import { FileSystem, InMemoryBackend, ROOT_ID, uniqueChildName } from "../src";

describe("uniqueChildName", () => {
  it("adds a numeric suffix before the extension", async () => {
    const fs = await FileSystem.open({ backend: new InMemoryBackend(), persistDelayMs: 0 });
    const hd = fs.mkdir(ROOT_ID, "HD", { role: "volume" });
    expect(uniqueChildName(fs, hd.id, "face.png")).toBe("face.png");
    await fs.writeFile(hd.id, "face.png", new Uint8Array([1]));
    expect(uniqueChildName(fs, hd.id, "face.png")).toBe("face 2.png");
    await fs.writeFile(hd.id, "face 2.png", new Uint8Array([1]));
    expect(uniqueChildName(fs, hd.id, "face.png")).toBe("face 3.png");
  });

  it("numbers names without an extension and names blanks", async () => {
    const fs = await FileSystem.open({ backend: new InMemoryBackend(), persistDelayMs: 0 });
    const hd = fs.mkdir(ROOT_ID, "HD", { role: "volume" });
    await fs.writeJSON(hd.id, "Surface Plot", {});
    expect(uniqueChildName(fs, hd.id, "Surface Plot")).toBe("Surface Plot 2");
    expect(uniqueChildName(fs, hd.id, "  ")).toBe("untitled");
  });
});
