import { describe, expect, it } from "vitest";
import { newBitMap, pixelsFromBitMap } from "@mockintosh/quickdraw/bits";
import { createUI } from "../src/ui";
import { useViewport } from "../src/viewport";
import { viewportLogicalSize } from "../src/web/screenCanvas";

describe("createUI.resize", () => {
  it("relayouts a full-screen tree onto a new bitmap without remounting", () => {
    const small = newBitMap(40, 20);
    const ui = createUI({ screen: small });
    let mounts = 0;
    ui.render(() => {
      mounts += 1;
      return <box width="100%" height="100%" background={1} />;
    });
    ui.frame();
    expect(ui.root.layout.width).toBe(40);
    expect(ui.root.layout.height).toBe(20);
    const afterMount = mounts;

    const large = newBitMap(80, 40);
    ui.resize(large);
    ui.frame();
    expect(ui.root.layout.width).toBe(80);
    expect(ui.root.layout.height).toBe(40);
    expect(mounts).toBe(afterMount);
    expect(pixelsFromBitMap(large)[0]).toBe(1);
  });

  it("useViewport tracks the framebuffer after resize", () => {
    const ui = createUI({ screen: newBitMap(40, 20) });
    let seen = { width: 0, height: 0 };
    ui.render(() => {
      const vp = useViewport();
      seen = vp();
      return <box width="100%" height="100%" />;
    });
    ui.frame();
    expect(seen).toEqual({ width: 40, height: 20 });
    ui.resize(newBitMap(80, 40));
    ui.frame();
    expect(seen).toEqual({ width: 80, height: 40 });
  });
});

describe("viewportLogicalSize", () => {
  it("divides the CSS viewport by scale and never returns zero", () => {
    expect(viewportLogicalSize(1440, 900, 2)).toEqual({ width: 720, height: 450 });
    expect(viewportLogicalSize(3, 3, 2)).toEqual({ width: 1, height: 1 });
    expect(viewportLogicalSize(100, 80, 0)).toEqual({ width: 100, height: 80 });
  });
});
