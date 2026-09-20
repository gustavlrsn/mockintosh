import { describe, expect, it } from "vitest";
import { newBitMap, pixelsFromBitMap } from "@mockintosh/quickdraw/bits";
import { createUI } from "../src/ui";
import { Avatar } from "../src/widgets/Avatar";
import type { ImageFrame } from "../src/dither";

function blackFrame(width: number, height: number): ImageFrame {
  const rgba = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const o = i * 4;
    rgba[o] = 0;
    rgba[o + 1] = 0;
    rgba[o + 2] = 0;
    rgba[o + 3] = 255;
  }
  return { width, height, rgba };
}

describe("Avatar", () => {
  it("paints a 32px square well", () => {
    const W = 64;
    const H = 40;
    const screen = newBitMap(W, H);
    const ui = createUI({ screen });
    ui.render(() => <Avatar initials="CN" />);
    ui.frame();

    const node = ui.inspect().find((n) => n.role === "img")!;
    expect(node.bounds).toMatchObject({ x: 0, y: 0, width: 32, height: 32 });

    const pixels = pixelsFromBitMap(screen);
    const at = (x: number, y: number) => pixels[y * W + x];
    expect(at(0, 0)).toBe(1);
    expect(at(31, 0)).toBe(1);
    expect(at(0, 31)).toBe(1);
    expect(at(31, 31)).toBe(1);
    for (let y = 0; y < 32; y++) expect(at(32, y)).toBe(0);
  });

  it("cuts the corners after a live setTheme", () => {
    const W = 64;
    const H = 40;
    const screen = newBitMap(W, H);
    const ui = createUI({ screen });
    ui.render(() => <Avatar initials="CN" />);
    ui.frame();
    expect(pixelsFromBitMap(screen)[0]).toBe(1);

    ui.setTheme({ radius: "lg" });
    ui.frame();
    expect(pixelsFromBitMap(screen)[0]).toBe(0);
  });

  it("cuts the corners when the theme radius is lg", () => {
    const W = 64;
    const H = 40;
    const screen = newBitMap(W, H);
    const ui = createUI({ screen, theme: { radius: "lg" } });
    ui.render(() => <Avatar initials="CN" />);
    ui.frame();

    const pixels = pixelsFromBitMap(screen);
    expect(pixels[0]).toBe(0);
    expect(pixels[31]).toBe(0);
  });

  it("keeps a dithered photo inside the rounded 1px well", () => {
    const W = 64;
    const H = 40;
    const screen = newBitMap(W, H);
    const ui = createUI({ screen, theme: { radius: "lg" } });
    ui.render(() => <Avatar initials="BA" src={blackFrame(32, 32)} />);
    ui.frame();

    const pixels = pixelsFromBitMap(screen);
    const at = (x: number, y: number) => pixels[y * W + x];
    expect(at(0, 0)).toBe(0);
    expect(at(31, 0)).toBe(0);
    expect(at(0, 31)).toBe(0);
    expect(at(31, 31)).toBe(0);
    expect(at(16, 0)).toBe(1);
    expect(at(16, 16)).toBe(1);
  });

  it("paints initials in front of the dithered well", () => {
    const W = 64;
    const H = 40;
    const well = newBitMap(W, H);
    const named = newBitMap(W, H);
    const wellUi = createUI({ screen: well });
    const namedUi = createUI({ screen: named });
    wellUi.render(() => <Avatar initials="" />);
    namedUi.render(() => <Avatar initials="II" />);
    wellUi.frame();
    namedUi.frame();

    const text = namedUi.inspect().find((n) => n.role === "text");
    const img = namedUi.inspect().find((n) => n.role === "img");
    expect(img?.bounds).toMatchObject({ width: 32, height: 32 });
    expect(text?.text).toBe("II");
    expect(text?.bounds.width).toBeGreaterThan(4);
    expect(text?.bounds.height).toBeGreaterThan(6);

    const a = pixelsFromBitMap(well);
    const b = pixelsFromBitMap(named);
    let extraWhite = 0;
    let extraBlack = 0;
    for (let y = 8; y < 24; y++) {
      for (let x = 8; x < 24; x++) {
        const i = y * W + x;
        if (a[i] === 1 && b[i] === 0) extraWhite++;
        if (a[i] === 0 && b[i] === 1) extraBlack++;
      }
    }
    expect(extraWhite).toBeGreaterThan(4);
    expect(extraBlack).toBeGreaterThan(4);
  });

  it("dithers the initials well from mid-gray at the top-left to near-black at the bottom-right", () => {
    const W = 64;
    const H = 40;
    const screen = newBitMap(W, H);
    const ui = createUI({ screen });
    ui.render(() => <Avatar initials="SK" />);
    ui.frame();

    const pixels = pixelsFromBitMap(screen);
    const ink = (x0: number, y0: number, x1: number, y1: number) => {
      let n = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) n += pixels[y * W + x]!;
      }
      return n;
    };
    expect(ink(24, 24, 30, 30)).toBeGreaterThan(ink(2, 2, 8, 8));
  });
});
