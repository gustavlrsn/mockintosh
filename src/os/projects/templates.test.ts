import { describe, expect, it } from "vitest";
import { compile } from "../../../scripts/builder/compiler";
import { blankSource, canvasSource, counterSource } from "./templates";

describe("project templates", () => {
  it("compile under the in-OS project compiler", async () => {
    for (const [name, source] of [
      ["counter", counterSource("t_counter", "T Counter")],
      ["blank", blankSource("t_blank", "T Blank")],
      ["canvas", canvasSource("t_canvas", "T Canvas")],
    ] as const) {
      const result = await compile({
        requestId: name,
        sourceRevision: "1",
        entry: "src/index.tsx",
        sdkVersion: "2",
        files: [{ path: "src/index.tsx", text: source }],
      });
      expect(result.diagnostics, name).toEqual([]);
      expect(result.code, name).toBeTruthy();
    }
  }, 30000);
});
