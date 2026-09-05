/**
 * Boots the whole OS on the headless platform and drives it like a user
 * would — proving the shell needs nothing from a browser, and that platform
 * events reach the UI through `bootOS`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bootOS, type BootedOS } from "./boot";
import { createHeadlessPlatform, type HeadlessPlatform } from "../platform/headless";
import { registerApp } from "./apps";
import { getWindows } from "./state";

const WIDTH = 512;
const HEIGHT = 342;
const MENUBAR_HEIGHT = 20;

/** Fraction of black pixels in a rectangle of the last presented frame. */
function inkCoverage(frame: Uint8Array, x0: number, y0: number, w: number, h: number): number {
  let black = 0;
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) black += frame[y * WIDTH + x];
  }
  return black / (w * h);
}

describe("bootOS on the headless platform", () => {
  let platform: HeadlessPlatform;
  let os: BootedOS;

  beforeEach(async () => {
    vi.useFakeTimers();
    platform = createHeadlessPlatform({ width: WIDTH, height: HEIGHT });
    os = await bootOS(platform);
    vi.advanceTimersByTime(1000); // dismiss the splash
    platform.tick();
  });

  afterEach(() => {
    os.shutdown();
    vi.useRealTimers();
  });

  it("draws the Finder desktop: white menubar over a dithered desktop", () => {
    const frame = platform.lastFrame()!;
    expect(frame).not.toBeNull();
    expect(platform.frameCount).toBeGreaterThan(0);

    // Menubar background is white with a black bottom rule and some titles.
    expect(inkCoverage(frame, 0, 0, WIDTH, MENUBAR_HEIGHT - 1)).toBeLessThan(0.2);
    expect(inkCoverage(frame, 0, MENUBAR_HEIGHT - 1, WIDTH, 1)).toBe(1);

    // The desktop pattern is a 50% checkerboard.
    const desktop = inkCoverage(frame, 40, 100, 64, 64);
    expect(desktop).toBeGreaterThan(0.45);
    expect(desktop).toBeLessThan(0.55);
  });

  it("only presents a frame when something changed", () => {
    const before = platform.frameCount;
    platform.tick();
    platform.tick();
    expect(platform.frameCount).toBe(before);

    platform.pointer({ type: "move", x: 100, y: 100 });
    platform.tick();
    expect(platform.frameCount).toBe(before + 1);
  });

  it("opens a menu when its title is clicked and closes it on the next click", () => {
    // Find the Apple menu: the first black pixels in the menubar row.
    const frame = platform.lastFrame()!;
    let appleX = -1;
    for (let x = 0; x < WIDTH && appleX < 0; x++) {
      if (frame[10 * WIDTH + x]) appleX = x;
    }
    expect(appleX).toBeGreaterThan(0);

    platform.click(appleX + 3, 10);
    platform.tick();
    const open = platform.lastFrame()!;
    // A dropdown with a black frame now hangs below the menubar at the left.
    expect(inkCoverage(open, 0, MENUBAR_HEIGHT, 120, 40)).toBeGreaterThan(0.1);
    expect(inkCoverage(open, 0, MENUBAR_HEIGHT, 120, 40)).toBeLessThan(0.45); // not desktop pattern

    platform.click(300, 200); // click on the desktop dismisses it
    platform.tick();
    const closed = platform.lastFrame()!;
    const desktopAgain = inkCoverage(closed, 0, MENUBAR_HEIGHT + 2, 120, 40);
    expect(desktopAgain).toBeGreaterThan(0.45);
    expect(desktopAgain).toBeLessThan(0.55);
  });

  it("refuses to launch an app whose `requires` this platform lacks, and says why", () => {
    registerApp({
      id: "test-camera-app",
      title: "Snapshot",
      icon: "icon/computer",
      requires: ["camera"],
      defaultSize: { width: 100, height: 100 },
      Component: () => null,
    });
    const before = getWindows().length;

    os.services.openApp("test-camera-app");
    platform.tick();

    const windows = getWindows();
    expect(windows.length).toBe(before + 1);
    const dialog = windows[windows.length - 1];
    expect(dialog.appId).toBe("__dialog__");
    expect(dialog.props?.message).toBe(
      '"Snapshot" needs a camera, which this Macintosh does not have.'
    );
  });

  it("runs ⌘-shortcuts from the active menubar (⌘N creates a folder on the desktop)", () => {
    const before = platform.lastFrame()!.slice();
    const meta = { shift: false, ctrl: false, alt: false, meta: true };
    platform.key({ type: "down", key: "n", modifiers: meta });
    platform.key({ type: "up", key: "n", modifiers: meta });
    platform.tick();
    const after = platform.lastFrame()!;
    let changed = 0;
    for (let i = 0; i < after.length; i++) if (after[i] !== before[i]) changed++;
    expect(changed).toBeGreaterThan(100); // a new folder icon + label appeared
  });
});
