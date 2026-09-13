/**
 * Boots the whole OS on the headless platform and drives it like a user
 * would — proving the shell needs nothing from a browser, and that platform
 * events reach the UI through `bootOS`.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { JSX } from "solid-js";
import { useApp, type AppContext, type AppServices } from "@mockintosh/sdk";
import { createElement, setProp } from "@mockintosh/ui/renderer";
import { bootOS, type BootedOS } from "./boot";
import { createHeadlessPlatform, type HeadlessPlatform } from "../platform/headless";
import { registerApp } from "./apps";
import { getWindows } from "./state";
import { TITLE_BAR_H } from "./windowGeometry";

const WIDTH = 512;
const HEIGHT = 342;
const MENUBAR_HEIGHT = 20;

/** `<box width="100%" height="100%" background={1} />` without JSX (this file is `.ts`). */
function blackBox(): JSX.Element {
  const node = createElement("box");
  setProp(node, "width", "100%");
  setProp(node, "height", "100%");
  setProp(node, "background", 1);
  return node as unknown as JSX.Element;
}

/** Fraction of black pixels in a rectangle of the last presented frame. */
function inkCoverage(frame: Uint8Array, x0: number, y0: number, w: number, h: number): number {
  let black = 0;
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) black += frame[y * WIDTH + x];
  }
  return black / (w * h);
}

/** Solid black rows in the title-bar interior, away from close box and title. */
function titleBarStripeLines(frame: Uint8Array, winX: number, winY: number): number {
  let lines = 0;
  for (let y = winY + 1; y < winY + TITLE_BAR_H - 1; y++) {
    if (inkCoverage(frame, winX + 24, y, 12, 1) === 1) lines++;
  }
  return lines;
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

  it("draws a dBoxProc alert: 1px / 2px white / 2px band, stop icon, default-ring OK", () => {
    void os.services.showDialog({
      message: 'The application "Decker" could not be found.',
      buttons: ["OK"],
    });
    platform.tick();

    const dialog = getWindows().find((w) => w.appId === "__dialog__");
    expect(dialog).toBeDefined();
    expect(dialog!.kind).toBe("alert");
    expect(dialog!.width).toBe(376);
    expect(dialog!.height).toBe(112);
    expect(dialog!.x).toBe(Math.floor((WIDTH - 376) / 2));

    const frame = platform.lastFrame()!;
    const { x, y } = dialog!;
    const inset = 1 + 2 + 2;

    // Square picture frame: 1px outer, 2px white, 2px inner.
    expect(inkCoverage(frame, x + 20, y, 40, 1)).toBe(1);
    expect(inkCoverage(frame, x + 20, y + 1, 40, 2)).toBe(0);
    expect(inkCoverage(frame, x + 20, y + 3, 40, 2)).toBe(1);
    // Stop-hand ink in the icon cell (inside the frame + 16px pad).
    expect(inkCoverage(frame, x + inset + 16, y + inset + 16, 32, 32)).toBeGreaterThan(0.25);
    // Default-ring OK sits on the bottom-left (20px face + 4px ring + 16px pad).
    const btnTop = y + inset + 112 - 16 - 28;
    const btnLeft = x + inset + 16;
    expect(inkCoverage(frame, btnLeft + 10, btnTop, 40, 3)).toBe(1);

    // CDEF FontInfo: Chicago 12 in a 20px face → baseline 14, caps on 5–13.
    const faceTop = btnTop + 4;
    const faceLeft = btnLeft + 4;
    let inkMin = 20;
    let inkMax = -1;
    for (let row = 1; row < 19; row++) {
      if (inkCoverage(frame, faceLeft + 18, faceTop + row, 24, 1) > 0) {
        if (row < inkMin) inkMin = row;
        if (row > inkMax) inkMax = row;
      }
    }
    expect(inkMin).toBe(5);
    expect(inkMax).toBe(13);
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

  // Regression: a z-order bump used to remount every IconCell mid-press, so the
  // pointer dispatcher never delivered the click that starts inline rename.
  it("renames a desktop icon after a second click on its selected label", async () => {
    const meta = { shift: false, ctrl: false, alt: false, meta: true };
    const none = { shift: false, ctrl: false, alt: false, meta: false };
    platform.key({ type: "down", key: "n", modifiers: meta });
    platform.key({ type: "up", key: "n", modifiers: meta });
    platform.tick();

    const fs = os.services.fs;
    const desktop = fs.locate("desktop");
    expect(desktop).toBeTruthy();
    const folder = fs.children(desktop!.id).find((n) => n.name === "untitled folder");
    expect(folder).toBeTruthy();

    const pos = desktopCellPos(fs, folder!.id);
    expect(pos).not.toBeNull();

    // First click: the icon sprite (not the label) selects the icon.
    platform.click(pos!.iconX, pos!.iconY);
    platform.tick();

    // Second click: the label of the already-selected icon. Far enough from
    // the sprite that bootOS does not treat this as a double-click.
    platform.click(pos!.labelX, pos!.labelY);
    platform.tick();
    vi.advanceTimersByTime(350);
    await Promise.resolve(); // TextInput autoFocus is scheduled on a microtask
    platform.tick();

    platform.key({ type: "down", key: "a", modifiers: meta });
    platform.key({ type: "up", key: "a", modifiers: meta });
    for (const ch of "Renamed") {
      platform.key({ type: "down", key: ch, modifiers: none });
      platform.key({ type: "up", key: ch, modifiers: none });
    }
    platform.key({ type: "down", key: "Enter", modifiers: none });
    platform.key({ type: "up", key: "Enter", modifiers: none });
    platform.tick();

    expect(fs.node(folder!.id)?.name).toBe("Renamed");
  });

  it("lets an app decide what opening it does: `onOpen` may open no window at all", () => {
    const onOpen = vi.fn();
    registerApp({
      id: "test-windowless",
      title: "Windowless",
      icon: "icon/computer",
      defaultSize: { width: 100, height: 100 },
      Component: () => null,
      onOpen,
    });
    const before = getWindows().length;

    os.services.openApp("test-windowless", { fileId: "f1", title: "Doc" });
    platform.tick();

    expect(getWindows().length).toBe(before);
    expect(onOpen).toHaveBeenCalledTimes(1);
    const [context, props] = onOpen.mock.calls[0] as [AppContext, Record<string, unknown>];
    expect(props).toEqual({ fileId: "f1", title: "Doc" });
    expect(typeof context.openWindow).toBe("function");
    expect(context.fs).toBe(os.services.fs);
  });

  it("opens windows of the kind an app asks for: a `plain` box has a frame but no title bar", () => {
    registerApp({
      id: "test-kinds",
      title: "Kinds",
      icon: "icon/computer",
      defaultSize: { width: 100, height: 60 },
      Component: () => null,
      onOpen(app) {
        app.openWindow({ kind: "plain", position: { x: 40, y: 80 }, size: { width: 100, height: 50 } });
        app.openWindow({ kind: "document", position: { x: 300, y: 80 }, size: { width: 100, height: 50 } });
      },
    });

    os.services.openApp("test-kinds");
    platform.tick();

    const wins = getWindows().filter((w) => w.appId === "test-kinds");
    expect(wins.map((w) => w.kind)).toEqual(["plain", "document"]);

    const frame = platform.lastFrame()!;
    // Both draw their top frame line…
    expect(inkCoverage(frame, 41, 80, 98, 1)).toBe(1);
    expect(inkCoverage(frame, 301, 80, 98, 1)).toBe(1);
    // …but only the document window has a title bar, whose separator sits at TITLE_BAR_H - 1;
    // inside the plain box those rows are blank content.
    expect(inkCoverage(frame, 301, 80 + TITLE_BAR_H - 1, 98, 1)).toBe(1);
    expect(inkCoverage(frame, 41, 81, 98, TITLE_BAR_H - 1)).toBe(0);
  });

  it("paints six title-bar stripe lines whether the window sits on an even or odd row", () => {
    registerApp({
      id: "test-stripes",
      title: "X",
      icon: "icon/computer",
      defaultSize: { width: 180, height: 50 },
      Component: () => null,
      onOpen(app) {
        app.openWindow({ position: { x: 40, y: 80 }, size: { width: 180, height: 50 }, title: "X" });
        app.openWindow({ position: { x: 280, y: 81 }, size: { width: 180, height: 50 }, title: "X" });
      },
    });

    os.services.openApp("test-stripes");
    platform.tick();

    const even = getWindows().find((w) => w.appId === "test-stripes" && w.y === 80)!;
    const odd = getWindows().find((w) => w.appId === "test-stripes" && w.y === 81)!;
    expect(even).toBeDefined();
    expect(odd).toBeDefined();

    // The second window is frontmost. Sample a strip just right of the close
    // box, left of the title, so only the chrome stripes can fill a row.
    expect(titleBarStripeLines(platform.lastFrame()!, odd.x, odd.y)).toBe(6);

    platform.click(even.x + 50, even.y + 8);
    platform.tick();
    expect(titleBarStripeLines(platform.lastFrame()!, even.x, even.y)).toBe(6);
  });

  it("a window can go full screen — covering the menubar — and come back, by menu shortcut too", () => {
    let services: AppServices | undefined;
    registerApp({
      id: "test-fullscreen",
      title: "Show",
      icon: "icon/computer",
      defaultSize: { width: 120, height: 80 },
      Component: () => {
        services = useApp();
        return blackBox();
      },
      menus: [
        {
          label: "View",
          items: [{ label: "Menu Bar", shortcut: "M", onClick: () => services!.window.setFullScreen(false) }],
        },
      ],
    });

    os.services.openApp("test-fullscreen");
    platform.tick();
    expect(services).toBeDefined();
    const win = getWindows().find((w) => w.appId === "test-fullscreen")!;
    const windowed = { x: win.x, y: win.y, width: win.width, height: win.height };
    expect(services!.window.kind()).toBe("document");

    services!.window.setFullScreen(true);
    platform.tick();
    expect(services!.window.kind()).toBe("fullscreen");
    expect(services!.window.width()).toBe(WIDTH);
    expect(services!.window.height()).toBe(HEIGHT);
    // The app's black content is everywhere, menubar row included (only the cursor shows through).
    expect(inkCoverage(platform.lastFrame()!, 8, 0, WIDTH - 16, MENUBAR_HEIGHT)).toBe(1);
    expect(inkCoverage(platform.lastFrame()!, 8, 8, WIDTH - 16, HEIGHT - 16)).toBeGreaterThan(0.999);

    // The hidden menubar's shortcuts still work: this is the way back.
    const meta = { shift: false, ctrl: false, alt: false, meta: true };
    platform.key({ type: "down", key: "m", modifiers: meta });
    platform.key({ type: "up", key: "m", modifiers: meta });
    platform.tick();

    const restored = getWindows().find((w) => w.appId === "test-fullscreen")!;
    expect(restored.kind).toBe("document");
    expect({ x: restored.x, y: restored.y, width: restored.width, height: restored.height }).toEqual(windowed);
    expect(inkCoverage(platform.lastFrame()!, 0, 0, WIDTH, MENUBAR_HEIGHT - 1)).toBeLessThan(0.2);
  });
});

/** Layout constants mirrored from Finder.solid — desktop icons without a stored position. */
const DESKTOP_ICON_CELL_W = 64;
const DESKTOP_ICON_CELL_H = 64;
const DESKTOP_PADDING_TOP = 8;
const ICON_SIZE = 32;

function desktopCellPos(
  fs: BootedOS["services"]["fs"],
  nodeId: string,
): { iconX: number; iconY: number; labelX: number; labelY: number } | null {
  const ids: string[] = [];
  for (const vol of fs.volumes()) ids.push(vol.id);
  for (const vol of fs.volumes()) {
    const desktop = fs.locate("desktop", vol.id);
    if (!desktop) continue;
    for (const node of fs.children(desktop.id)) ids.push(node.id);
  }
  const trash = fs.locate("trash");
  if (trash && !ids.includes(trash.id)) ids.push(trash.id);

  const index = ids.indexOf(nodeId);
  if (index < 0) return null;

  const desktopH = HEIGHT - MENUBAR_HEIGHT;
  const maxRows = Math.max(1, Math.floor((desktopH - DESKTOP_PADDING_TOP) / DESKTOP_ICON_CELL_H));
  const col = Math.floor(index / maxRows);
  const row = index % maxRows;
  const cellX = WIDTH - (col + 1) * DESKTOP_ICON_CELL_W;
  const cellY = MENUBAR_HEIGHT + row * DESKTOP_ICON_CELL_H + DESKTOP_PADDING_TOP;
  const iconOffsetX = Math.floor((DESKTOP_ICON_CELL_W - ICON_SIZE) / 2);
  return {
    iconX: cellX + iconOffsetX + ICON_SIZE / 2,
    iconY: cellY + ICON_SIZE / 2,
    labelX: cellX + DESKTOP_ICON_CELL_W / 2,
    labelY: cellY + ICON_SIZE + 7,
  };
}
