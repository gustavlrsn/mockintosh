/**
 * bootOS — bring the operating system up on a `Platform`.
 *
 * Owns the boot order (QuickDraw → sprites → UI → file system → apps →
 * peripherals), the frame loop, input translation from platform events to
 * UI dispatches, and the `OSServices` the Solid tree runs on. It knows
 * nothing about where the pixels go or where events come from: that is the
 * platform's job, so this file compiles without DOM types. Which apps are
 * bundled is likewise the entry point's decision (`systemApps.ts` for the
 * web build); the boot sequence only knows about the Finder and dialogs.
 */

import { InitGraf, InitCursor, cursorState, globals as qd } from "@mockintosh/quickdraw";
import { createUI, type Modifiers } from "@mockintosh/ui";
import { FileSystem } from "@mockintosh/fs";
import type { MenubarActionItem } from "@mockintosh/sdk";
import type { Platform, PlatformKeyEvent, PlatformPointerEvent } from "../platform/types";
import { SpriteRegistry, registerBuiltinSprites } from "./sprites";
import { drawCursor } from "./cursor";
import { animateZoomRect, type AnimRect } from "./zoomAnimation";
import { buildFolderWindow, windowOuterRect } from "../../apps/Finder.solid";
import { bootstrapFileSystem } from "./fsBootstrap";
import { resolveOpenAction } from "./openers";
import { makeOSRoot } from "./OSRoot.solid";
import {
  setSplashVisible,
  openOSWindow,
  closeOSWindow,
  getWindows,
  setWindowOutline,
  bringToFront,
  getMenubarMenus,
  setOpenMenuIndex,
  type OSWindow,
} from "./state";
import type { OSServices } from "./context";
import { getAllApps, getApp, registerApp } from "./apps";
import { DialogApp } from "./components/Dialog.solid";
import { createAppInstaller } from "./installedApps";
import {
  describeMissingCapabilities,
  missingCapabilities,
  platformCapabilities,
} from "./capabilities";
import { createPrintService } from "./printing";

const MENUBAR_HEIGHT = 20;
const SPLASH_MS = 800;

/** Two clicks this close in time and space are a double-click (Mac `DoubleTime`). */
const DOUBLE_CLICK_MS = 500;
const DOUBLE_CLICK_DIST = 4;

export interface BootedOS {
  /** The running OS, for hosts that open apps or dialogs themselves (kiosk mode, tests). */
  services: OSServices;
  /** Force a repaint on the next frame. */
  scheduleRepaint(): void;
  /** Unmount the UI tree. */
  shutdown(): void;
}

export async function bootOS(platform: Platform): Promise<BootedOS> {
  const { display, scheduler } = platform;
  const resolution = { width: display.width, height: display.height };

  // --- QuickDraw framebuffer ---
  InitGraf({ width: display.width, height: display.height, bits: display.framebuffer });
  const screen = qd.screenBits;
  const present = () => display.present(screen);

  InitCursor();

  // --- Sprites: built-ins, then whatever the bundled apps brought along ---
  const sprites = new SpriteRegistry();
  registerBuiltinSprites(sprites);
  for (const app of getAllApps()) if (app.sprites) sprites.registerAll(app.sprites);

  // --- Frame scheduling ---
  let screenDirty = true;
  /** True while a zoom animation owns the framebuffer — blocks the frame loop. */
  let animating = false;
  function scheduleRepaint() {
    screenDirty = true;
  }

  // --- UI instance (full-screen Solid renderer) ---
  const ui = createUI({
    screen,
    scheduleRender: scheduleRepaint,
    services: { clipboard: platform.clipboard },
  });

  // --- File system ---
  const fs = await FileSystem.open({ backend: platform.storage });
  await bootstrapFileSystem(fs);

  // --- Installed third-party apps (manifests live in /Applications) ---
  const capabilities = platformCapabilities(platform);
  const installer = platform.loadModule
    ? createAppInstaller({ fs, sprites, capabilities, loadModule: platform.loadModule })
    : undefined;
  await installer?.loadInstalled();

  // --- Printer ---
  const printer = platform.printer ? createPrintService(platform.printer) : undefined;

  // --- OS services (passed to Solid components via context) ---
  const osServices: OSServices = {
    sprites,
    fs,
    resolution,
    menubarHeight: MENUBAR_HEIGHT,
    env: platform.env,
    capabilities,
    fetch: platform.fetch,
    printer,
    installer,
    openApp(appId, props = {}, fromRect?) {
      const app = getApp(appId);
      if (!app) {
        console.warn(`Unknown app: ${appId}`);
        return;
      }
      const missing = missingCapabilities(app.requires, capabilities);
      if (missing.length > 0) {
        void osServices.showDialog({ message: describeMissingCapabilities(app.title, missing) });
        return;
      }
      const existing = getWindows().find((w) => {
        if (w.appId !== appId) return false;
        const a = w.props ?? {};
        const b = props ?? {};
        if (a.fileId || b.fileId) return a.fileId === b.fileId;
        if (a.directoryId || b.directoryId) return a.directoryId === b.directoryId;
        return app.singleInstance !== false;
      });
      if (existing) {
        bringToFront(existing.id);
        return;
      }
      const maxW = resolution.width - 6;
      const maxH = resolution.height - MENUBAR_HEIGHT - 6;
      const w = Math.min(app.defaultSize.width, maxW);
      const h = Math.min(app.defaultSize.height, maxH);
      const n = getWindows().length;
      let x = Math.min(20 + (n % 6) * 16, resolution.width - w - 3);
      let y = Math.min(MENUBAR_HEIGHT + 20 + (n % 6) * 16, resolution.height - h - 3);
      x = Math.max(3, x);
      y = Math.max(MENUBAR_HEIGHT + 3, y);
      const id = `${appId}-${Date.now()}`;
      const win: OSWindow = {
        id,
        appId,
        title: (props.title as string) || app.title,
        x,
        y,
        width: w,
        height: h,
        kind: app.windowKind ?? "document",
        props,
        scrollY: 0,
        scrollX: 0,
        contentHeight: app.scrollable ? Math.max(h, 200) : h,
        contentWidth: w,
        scrollable: app.scrollable ?? false,
        resizable: app.resizable ?? false,
        minWidth: app.minSize?.width,
        minHeight: app.minSize?.height,
        openedFromRect: fromRect,
        standardBounds: {
          x: 3,
          y: MENUBAR_HEIGHT + 3,
          width: maxW,
          height: maxH,
        },
        userBounds: { x, y, width: w, height: h },
      };
      const doOpen = () => openOSWindow(win);
      if (fromRect) {
        renderFrame();
        playZoomAnimation(fromRect, windowOuterRect(win), doOpen);
      } else {
        doOpen();
      }
    },
    showDialog(options) {
      return new Promise<string | null>((resolve) => {
        osServices.openApp("__dialog__", {
          message: options.message,
          buttons: options.buttons ?? ["OK"],
          showInput: options.showInput,
          inputDefault: options.inputDefault,
          resolve,
        });
      });
    },
    openFolderWindow(title, directoryId, fromRect?) {
      const win = buildFolderWindow(fs, {
        title,
        directoryId,
        x: 60,
        y: MENUBAR_HEIGHT + 50,
        width: Math.min(400, resolution.width - 80),
        height: Math.min(200, resolution.height - MENUBAR_HEIGHT - 60),
        openedFromRect: fromRect,
      });
      const doOpen = () => openOSWindow(win);
      if (fromRect) {
        renderFrame(); // snapshot current screen into port
        playZoomAnimation(fromRect, windowOuterRect(win), doOpen);
      } else {
        doOpen();
      }
    },
    openFSNode(nodeId, fromRect?) {
      void openFSNodeImpl(nodeId, fromRect);
    },
    closeWindow(id) {
      const win = getWindows().find((w) => w.id === id);
      const fromRect: AnimRect | null = win ? windowOuterRect(win) : null;
      const toRect: AnimRect | null = win?.openedFromRect ?? null;
      closeOSWindow(id);
      if (fromRect && toRect) {
        renderFrame(); // render state without the closed window
        playZoomAnimation(fromRect, toRect);
      }
    },
    playWindowOpenAnimation(fromRect, toRect, onDone) {
      renderFrame();
      playZoomAnimation(fromRect, toRect, onDone);
    },
    showWindowOutline(rect, _onCommit) {
      setWindowOutline(rect);
    },
    hideWindowOutline() {
      setWindowOutline(null);
    },
    scheduleRepaint,
  };

  registerApp({
    id: "__dialog__",
    title: "",
    icon: "icon/computer",
    defaultSize: { width: 260, height: 140 },
    windowKind: "alert",
    scrollable: false,
    resizable: false,
    singleInstance: false,
    Component: DialogApp as any,
  });

  async function openFSNodeImpl(nodeId: string, fromRect?: AnimRect): Promise<void> {
    const action = await resolveOpenAction(fs, nodeId);
    switch (action.kind) {
      case "folder":
        osServices.openFolderWindow(action.title, action.directoryId, fromRect);
        return;
      case "launch":
        osServices.openApp(action.appId, action.props, fromRect);
        return;
      case "none": {
        const name = fs.file(nodeId)?.name ?? "this document";
        if (action.reason === "unknown-type") {
          await osServices.showDialog({
            message: `There is no application to open "${name}".`,
            buttons: ["OK"],
          });
        } else if (action.reason === "unknown-app") {
          await osServices.showDialog({
            message: `The application "${name}" could not be found.`,
            buttons: ["OK"],
          });
        } else if (action.reason === "unavailable") {
          await osServices.showDialog({
            message: describeMissingCapabilities(action.title, action.missing),
            buttons: ["OK"],
          });
        }
        return;
      }
    }
  }

  // --- Mount Solid tree ---
  const unmount = ui.render(makeOSRoot(osServices, MENUBAR_HEIGHT));

  // --- Boot: dismiss splash after a short delay ---
  setTimeout(() => setSplashVisible(false), SPLASH_MS);

  // --- Cursor position (plain vars — not signals, cursor drawn directly) ---
  let cursorX = Math.floor(resolution.width / 2);
  let cursorY = Math.floor(resolution.height / 2);

  // --- Frame loop ---
  function renderFrame() {
    ui.frame();
    drawCursor(ui.port, cursorX, cursorY);
    present();
  }

  /**
   * Play a zoom-open or zoom-close animation directly on the screen port
   * without going through the frame loop, which is blocked for the duration
   * so it doesn't overwrite the XOR frames.
   *
   * @param onDone  called after the last frame is erased (screen is clean again)
   */
  function playZoomAnimation(from: AnimRect, to: AnimRect, onDone?: () => void): void {
    animating = true;
    void animateZoomRect({
      port: ui.port,
      present,
      from,
      to,
      onEnd: () => {
        animating = false;
        scheduleRepaint();
        onDone?.();
      },
    });
  }

  function frameLoop() {
    scheduler.requestFrame(frameLoop);
    if (!screenDirty || animating) return;
    screenDirty = false;
    renderFrame();
  }
  scheduler.requestFrame(frameLoop);

  // --- Input ---
  let lastClickTime = -Infinity;
  let lastClickX = 0;
  let lastClickY = 0;

  function onPointer(e: PlatformPointerEvent): void {
    switch (e.type) {
      case "move":
        cursorX = e.x;
        cursorY = e.y;
        cursorState.obscured = false;
        screenDirty = true;
        ui.dispatchPointer("mousemove", e.x, e.y);
        return;
      case "down": {
        const now = scheduler.now();
        const isDouble =
          now - lastClickTime < DOUBLE_CLICK_MS &&
          Math.abs(e.x - lastClickX) < DOUBLE_CLICK_DIST &&
          Math.abs(e.y - lastClickY) < DOUBLE_CLICK_DIST;
        if (isDouble) {
          ui.dispatchPointer("dblclick", e.x, e.y);
          lastClickTime = -Infinity;
        } else {
          ui.dispatchPointer("mousedown", e.x, e.y);
          lastClickTime = now;
          lastClickX = e.x;
          lastClickY = e.y;
        }
        scheduleRepaint();
        return;
      }
      case "up":
        ui.dispatchPointer("mouseup", e.x, e.y);
        scheduleRepaint();
        return;
      case "scroll":
        ui.dispatchPointer("scroll", e.x, e.y, { deltaY: e.deltaY ?? 0 });
        scheduleRepaint();
        return;
    }
  }

  /** ⌘-shortcut from the current menubar, if any. Returns true when handled. */
  function runMenuShortcut(key: string): boolean {
    for (const menu of getMenubarMenus()) {
      for (const item of menu.items) {
        const ai = item as MenubarActionItem;
        if (ai.shortcut && ai.shortcut.toLowerCase() === key.toLowerCase() && !ai.disabled) {
          ai.onClick?.();
          setOpenMenuIndex(null);
          return true;
        }
      }
    }
    return false;
  }

  function pasteFromClipboard(): void {
    platform.clipboard
      ?.readText()
      .then((text) => {
        for (const ch of text) ui.dispatchKeyboard("keypress", ch, {});
        scheduleRepaint();
      })
      .catch(() => {
        // Clipboard read denied or unavailable — nothing to paste.
      });
  }

  function onKey(e: PlatformKeyEvent): void {
    const mods: Modifiers = e.modifiers;
    if (e.type === "up") {
      ui.dispatchKeyboard("keyup", e.key, mods);
      return;
    }
    const command = mods.meta || mods.ctrl;
    if (command && e.key.toLowerCase() === "v") {
      pasteFromClipboard();
      return;
    }
    if (mods.meta && e.key.length === 1 && runMenuShortcut(e.key)) {
      scheduleRepaint();
      return;
    }
    ui.dispatchKeyboard("keydown", e.key, mods);
    if (e.key.length === 1 && !command) {
      ui.dispatchKeyboard("keypress", e.key, mods);
    }
    scheduleRepaint();
  }

  const offPointer = platform.input.onPointer(onPointer);
  const offKey = platform.input.onKey(onKey);

  return {
    services: osServices,
    scheduleRepaint,
    shutdown() {
      offPointer();
      offKey();
      unmount();
    },
  };
}
