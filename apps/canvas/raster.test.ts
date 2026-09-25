import { describe, expect, it } from "vitest";
import { installFontBridge } from "../../packages/ui/src/fonts/bridge";
import { rasterizeCanvas } from "./raster";
import type { CanvasDocument } from "./document";

installFontBridge();

function doc(elements: CanvasDocument["elements"]): CanvasDocument {
  return { version: 1, width: 40, height: 20, elements };
}

describe("rasterizeCanvas", () => {
  it("paints a filled rectangle and leaves the rest white", () => {
    const page = rasterizeCanvas(
      doc([{ id: "e1", type: "rect", x: 1, y: 1, width: 3, height: 2, fill: "black", stroke: false }]),
      6,
      4,
    );
    expect(page.data[1 * 6 + 1]).toBe(1);
    expect(page.data[0]).toBe(0);
    expect(page.width).toBe(6);
  });

  it("draws a line", () => {
    const page = rasterizeCanvas(
      doc([{ id: "e1", type: "line", x: 0, y: 0, width: 4, height: 1, fill: "none", stroke: true }]),
      4,
      2,
    );
    expect(page.data[0]).toBe(1);
    expect(page.data[3]).toBe(1);
  });

  it("draws text in black", () => {
    const page = rasterizeCanvas(
      doc([{ id: "e1", type: "text", x: 0, y: 0, width: 40, height: 20, text: "A", font: "body", align: "left" }]),
      40,
      20,
    );
    expect(page.data.some((px) => px === 1)).toBe(true);
  });
});
