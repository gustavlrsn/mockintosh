/**
 * solidMain.ts — New Solid-OS entry point.
 *
 * Replaces main.tsx. Initialises only the services needed by the Solid OS
 * (canvas, QuickDraw, sprites, file system, preferences) and mounts the
 * OSRoot Solid component tree as the entire screen.
 *
 * Legacy apps are NOT loaded here; port them to Solid one-by-one.
 */

import { BitCanvas } from "../lib/canvas/BitCanvas";
import { EventManager } from "../lib/toolbox/EventManager";
import { ResourceManager } from "../lib/toolbox/ResourceManager";
import { registerAllSprites } from "../lib/canvas/sprites";
import { InitGraf } from "@mockintosh/quickdraw";
import { blitSprite } from "../lib/canvas/SpriteManager";
import { FileSystem, InMemoryBackend, OPFSBackend, isOPFSAvailable } from "@mockintosh/fs";
import { bootstrapFileSystem } from "./os/fsBootstrap";
import { resolveOpenAction } from "./os/openers";
import { loadSystemPreferences } from "./os/systemPreferences";
import { createUI } from "@mockintosh/ui";

import { animateZoomRect, type AnimRect } from "../lib/canvas/ZoomAnimation";
import { resolution } from "../lib/config";
import { makeOSRoot } from "./os/OSRoot.solid";
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
} from "./os/state";
import { buildFolderWindow, windowOuterRect } from "../apps/Finder.solid";
import type { OSServices } from "./os/context";
import { getApp } from "./os/apps";
import { registerApp } from "./os/apps";
import { DialogApp } from "./os/components/Dialog.solid";
import "./os/legacy/registerLegacy";
import type { MenubarActionItem } from "@mockintosh/sdk";
import { initInstalledApps, loadInstalledApps } from "./os/installedApps";

const MENUBAR_HEIGHT = 20;

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

async function main() {
  // --- Canvas ---
  const canvas = document.createElement("canvas");
  canvas.width  = resolution.width;
  canvas.height = resolution.height;
  document.getElementById("root")!.appendChild(canvas);
  const ctx2d = canvas.getContext("2d", { alpha: false })!;

  // --- BitCanvas + QuickDraw ---
  const bitCanvas = new BitCanvas(resolution.width, resolution.height);
  InitGraf({
    width:  resolution.width,
    height: resolution.height,
    pixels: bitCanvas.pixels,
  });

  // --- Sprites ---
  const sprites = new ResourceManager();
  registerAllSprites(sprites);

  // --- Zoom ---
  let zoom = 1;
  function updateZoom() {
    zoom = Math.max(
      1,
      Math.min(
        Math.floor(window.innerWidth  / resolution.width),
        Math.floor(window.innerHeight / resolution.height)
      )
    );
    canvas.style.width  = `${resolution.width  * zoom}px`;
    canvas.style.height = `${resolution.height * zoom}px`;
  }
  updateZoom();
  window.addEventListener("resize", updateZoom);
  let screenDirty = true;
  /** True while a zoom animation owns the pixel buffer — blocks the RAF loop. */
  let animating   = false;
  function scheduleRepaint() {
    screenDirty = true;
  }

  // --- UI instance (full-screen Solid renderer) ---
  const ui = createUI({
    pixels: bitCanvas.pixels,
    width:  resolution.width,
    height: resolution.height,
    scheduleRender: scheduleRepaint,
  });

  // --- File system ---
  if (!isOPFSAvailable()) {
    console.warn("OPFS unavailable — the file system will not persist across reloads.");
  }
  const mockFS = await FileSystem.open({
    backend: isOPFSAvailable() ? new OPFSBackend() : new InMemoryBackend(),
  });
  await bootstrapFileSystem(mockFS);

  // --- Installed third-party apps (manifests live in /Applications) ---
  initInstalledApps(sprites);
  await loadInstalledApps(mockFS);

  // --- System preferences (System Folder/Preferences/System Preferences) ---
  await loadSystemPreferences(mockFS);

  // --- OS services (passed to Solid components via context) ---
  const osServices: OSServices = {
    sprites,
    fs: mockFS,
    resolution: { width: resolution.width, height: resolution.height },
    menubarHeight: MENUBAR_HEIGHT,
    openApp(appId, props = {}, fromRect?) {
      const app = getApp(appId);
      if (!app) {
        console.warn(`Unknown app: ${appId}`);
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
      const win = buildFolderWindow(mockFS, {
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
    const action = await resolveOpenAction(mockFS, nodeId);
    switch (action.kind) {
      case "folder":
        osServices.openFolderWindow(action.title, action.directoryId, fromRect);
        return;
      case "launch":
        osServices.openApp(action.appId, action.props, fromRect);
        return;
      case "none":
        if (action.reason === "unknown-type") {
          const node = mockFS.file(nodeId);
          await osServices.showDialog({
            message: `There is no application to open "${node?.name ?? "this document"}".`,
            buttons: ["OK"],
          });
        }
        return;
    }
  }

  // --- Mount Solid tree ---
  const cleanup = ui.render(makeOSRoot(osServices, MENUBAR_HEIGHT));

  // --- Boot: dismiss splash after a short delay ---
  setTimeout(() => {
    setSplashVisible(false);
  }, 800);

  // --- Cursor position (plain vars — not signals, cursor drawn directly) ---
  let cursorX = Math.floor(resolution.width  / 2);
  let cursorY = Math.floor(resolution.height / 2);

  // --- RAF render loop ---
  function renderFrame() {
    ui.frame();

    const port = ui.port;
    const cursorSprite = sprites.get("cursor/default-1x");
    if (cursorSprite) {
      blitSprite(port, cursorSprite, cursorX, cursorY);
    }
    bitCanvas.flush(ctx2d);
  }

  /**
   * Play a zoom-open or zoom-close animation directly on the screen port
   * without going through the RAF loop. The render loop is blocked for the
   * duration so it doesn't overwrite the XOR frames.
   *
   * @param onDone  called after the last frame is erased (screen is clean again)
   */
  function playZoomAnimation(from: AnimRect, to: AnimRect, onDone?: () => void): void {
    animating = true;
    animateZoomRect(ui.port, ctx2d, from, to, 4, 30, undefined, () => {
      animating = false;
      scheduleRepaint();
      onDone?.();
    });
  }

  function frameLoop() {
    requestAnimationFrame(frameLoop);
    if (!screenDirty || animating) return;
    screenDirty = false;
    renderFrame();
  }
  requestAnimationFrame(frameLoop);

  // --- Event handling (EventManager handles zoom via setZoom) ---
  const eventManager = new EventManager(canvas);
  eventManager.setZoom(zoom);
  window.addEventListener("resize", () => eventManager.setZoom(zoom));

  eventManager.onEvent((e) => {
    const x = e.x ?? 0;
    const y = e.y ?? 0;

    if (e.type === "mouseMove") {
      cursorX = x;
      cursorY = y;
      screenDirty = true;
      ui.dispatchPointer("mousemove", x, y);
      return;
    }

    if (e.type === "mouseDown") {
      ui.dispatchPointer("mousedown", x, y);
      scheduleRepaint();
      return;
    }

    if (e.type === "mouseUp") {
      ui.dispatchPointer("mouseup", x, y);
      scheduleRepaint();
      return;
    }

    if (e.type === "doubleClick") {
      ui.dispatchPointer("dblclick", x, y);
      scheduleRepaint();
      return;
    }

    if (e.type === "scroll") {
      ui.dispatchPointer("scroll", x, y, { deltaY: e.deltaY ?? 0 });
      scheduleRepaint();
      return;
    }

    if (e.type === "keyDown") {
      const key  = e.key  ?? "";
      const mods = {
        shift: e.shiftKey ?? false,
        ctrl:  e.ctrlKey  ?? false,
        alt:   e.altKey   ?? false,
        meta:  e.metaKey  ?? false,
      };
      if (mods.meta && key.length === 1) {
        const menus = getMenubarMenus();
        for (const menu of menus) {
          for (const item of menu.items) {
            const ai = item as MenubarActionItem;
            if (ai.shortcut && ai.shortcut.toLowerCase() === key.toLowerCase() && !ai.disabled) {
              ai.onClick?.();
              setOpenMenuIndex(null);
              scheduleRepaint();
              return;
            }
          }
        }
      }
      ui.dispatchKeyboard("keydown", key, mods);
      if (key.length === 1 && !mods.ctrl && !mods.meta) {
        ui.dispatchKeyboard("keypress", key, mods);
      }
      scheduleRepaint();
      return;
    }

    if (e.type === "keyUp") {
      const key  = e.key  ?? "";
      const mods = {
        shift: e.shiftKey ?? false,
        ctrl:  e.ctrlKey  ?? false,
        alt:   e.altKey   ?? false,
        meta:  e.metaKey  ?? false,
      };
      ui.dispatchKeyboard("keyup", key, mods);
      return;
    }

    if (e.type === "paste" && e.pasteText) {
      for (const ch of e.pasteText) {
        ui.dispatchKeyboard("keypress", ch, {});
      }
      scheduleRepaint();
    }
  });
}

main().catch(console.error);
