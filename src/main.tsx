import { BitCanvas, BLACK, WHITE } from "../lib/canvas/BitCanvas";
import { AppContext } from "../lib/canvas/AppContext";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { AppRegistry } from "../lib/canvas/AppRegistry";
import { EventManager, OSEvent } from "../lib/canvas/EventManager";
import {
  WindowManager,
  TITLE_BAR_HEIGHT,
  WindowKind,
} from "../lib/canvas/WindowManager";
import { SpriteRegistry } from "../lib/canvas/SpriteRegistry";
import { registerAllSprites } from "../lib/canvas/sprites";
import { HitRegionMap } from "../lib/canvas/HitRegion";
import { loadFonts } from "../lib/canvas/fontAdapter";
import { createOSServices } from "../lib/canvas/OSServices";
import { animateZoomRect, AnimRect } from "../lib/canvas/ZoomAnimation";
import {
  MenubarDefinition,
  createMenubarState,
  drawMenubar,
  MENUBAR_HEIGHT,
} from "../lib/canvas/ui/drawMenubar";
import { TEXT_CURSOR_BLINK_MS } from "../lib/canvas/ui/TextInput";
import { MockFS, ROOT_ID, FSFile } from "../lib/canvas/fs/MockFS";
import { OPFSBackend } from "../lib/canvas/fs/OPFSBackend";
import { AppLoader, AppManifest } from "../lib/canvas/AppLoader";

import { SplashscreenApp, setSplashSpriteRegistry } from "../apps/Splashscreen";
import {
  FinderApp,
  FinderServices,
  FinderWindowInfo,
  IconScreenRect,
  DESKTOP_WINDOW_ID,
  finderIsDragging,
  finderHandleMouseMove,
  finderHandleMouseUp,
  finderRenderDragGhost,
} from "../apps/Finder";
import { FileViewerApp } from "../apps/FileViewer";
import { AboutApp } from "../apps/About";
import { ControlPanelApp } from "../apps/ControlPanel";
import { PhotoBoothApp } from "../apps/PhotoBooth";
import { VideoPlayerApp } from "../apps/VideoPlayer";
import { SafariApp } from "../apps/Safari";
import { PictureApp } from "../apps/Picture";
import { AppStoreApp } from "../apps/AppStore";
import { ChatGippityApp } from "../apps/ChatGippity";
import { SpotifyPlayerApp } from "../apps/SpotifyPlayer";
import { spotifySprites } from "../apps/sprites/spotify";
import { DialogApp, computeDialogSize } from "../apps/Dialog";

import { resolution } from "../lib/config";
import getDefaultPosition from "../utils/getDefaultPosition";
// @ts-ignore
import pkg from "../package.json";

const version = pkg.version;
const BOOT_TIME = 1337;

const appTypeMap: Record<string, string> = {
  FINDER: "finder",
  FILE: "file",
  PHOTO_BOOTH: "photobooth",
  ABOUT_THIS_MOCKINTOSH: "about",
  VIDEO: "video",
  SAFARI: "safari",
  CONTROL_PANEL: "control_panel",
  PICTURE: "picture",
};

async function loadMarkdownFile(name: string): Promise<string> {
  try {
    const resp = await fetch(`/content/${name}.txt`);
    if (!resp.ok) return `Could not load ${name}`;
    return await resp.text();
  } catch {
    return `Could not load ${name}`;
  }
}

/**
 * Create the default volume and desktop from scratch (used on first boot and after Format Drive).
 */
async function bootstrapFreshFS(fs: MockFS): Promise<void> {
  const [readme, contributing] = await Promise.all([
    loadMarkdownFile("README.md"),
    loadMarkdownFile("CONTRIBUTING.md"),
  ]);

  const hd = fs.mkdir(ROOT_ID, "Mockintosh HD");
  hd.icon = "icon/hd";

  const dev = fs.mkdir(hd.id, "Development");
  await fs.writeFile(dev.id, "README.md", readme, "text");
  await fs.writeFile(dev.id, "CONTRIBUTING.md", contributing, "text");

  fs.mkdir(hd.id, "Applications");

  const desktop = fs.mkdir(hd.id, "Desktop Folder");

  for (const s of DESKTOP_SHORTCUTS) {
    await fs.writeFile(
      desktop.id,
      s.name,
      JSON.stringify({ appId: s.appId }),
      "app-shortcut",
      { icon: s.icon }
    );
  }

  await fs.flush();
}

async function populateDefaultFS(fs: MockFS): Promise<void> {
  const root = fs.readDir(ROOT_ID);
  if (root.length > 0) {
    ensureDesktopFolder(fs);
    await ensureDesktopShortcuts(fs);
    return;
  }

  await bootstrapFreshFS(fs);
}

function ensureDesktopFolder(fs: MockFS): void {
  const hd = fs.findByName(ROOT_ID, "Mockintosh HD");
  if (!hd) return;
  fs.mkdir(hd.id, "Desktop Folder");
}

/**
 * Single source of truth for which system apps get a desktop shortcut.
 * When you add/rename/remove an app in code, update this list; ensureDesktopShortcuts
 * will sync the Desktop Folder (add missing, remove ghosts and stale renames) on each boot.
 */
const DESKTOP_SHORTCUTS: Array<{ name: string; appId: string; icon: string }> =
  [
    {
      name: "Photo Booth",
      appId: "photobooth",
      icon: "icon/photobooth-smr-32",
    },
    { name: "1984.mp4", appId: "video", icon: "icon/MacFlim" },
    { name: "Safari", appId: "safari", icon: "icon/safari" },
    { name: "App Store", appId: "appstore", icon: "icon/appstore-smr-32x32" },
    { name: "ChatGippity", appId: "chatgippity", icon: "icon/computer" },
    { name: "Spotify Player", appId: "spotify", icon: "icon/spotify" },
  ];

/** Canonical appId -> shortcut entry. Used to reconcile desktop with code. */
const DESKTOP_SHORTCUTS_BY_APP_ID = new Map(
  DESKTOP_SHORTCUTS.map((s) => [s.appId, s])
);

/**
 * Sync desktop app-shortcuts to DESKTOP_SHORTCUTS (single source of truth).
 * - Adds missing shortcuts.
 * - Removes "ghost" shortcuts for apps no longer in the list (e.g. removed from code).
 * - Removes stale shortcuts after renames (same appId, wrong name) so only one icon per app remains.
 */
async function ensureDesktopShortcuts(fs: MockFS): Promise<void> {
  const hd = fs.findByName(ROOT_ID, "Mockintosh HD");
  if (!hd) return;
  const desktop = fs.findByName(hd.id, "Desktop Folder");
  if (!desktop) return;

  const contents = fs.readDir(desktop.id);
  for (const node of contents) {
    if (node.kind !== "file") continue;
    const file = node as FSFile;
    if (file.fileType !== "app-shortcut") continue;

    let appId: string | undefined;
    try {
      const raw = await fs.readFile(file.id);
      if (raw) appId = JSON.parse(raw).appId;
    } catch {}
    const canonical = appId
      ? DESKTOP_SHORTCUTS_BY_APP_ID.get(appId)
      : undefined;
    const remove = !canonical || canonical.name !== file.name;
    if (remove) await fs.remove(file.id);
  }

  for (const s of DESKTOP_SHORTCUTS) {
    const existing = fs.findByName(desktop.id, s.name);
    if (!existing) {
      await fs.writeFile(
        desktop.id,
        s.name,
        JSON.stringify({ appId: s.appId }),
        "app-shortcut",
        { icon: s.icon }
      );
    }
  }
}

/**
 * Load persisted third-party app manifests from MockFS and dynamically
 * register them via the AppLoader. Manifests are stored as JSON files
 * with fileType "app" under /Mockintosh HD/System/InstalledApps/.
 */
async function loadPersistedApps(fs: MockFS, loader: AppLoader): Promise<void> {
  const hd = fs.findByName(ROOT_ID, "Mockintosh HD");
  if (!hd) return;

  let systemDir = fs.findByName(hd.id, "System");
  if (!systemDir) {
    systemDir = fs.mkdir(hd.id, "System");
  }

  let appsDir = fs.findByName(systemDir.id, "InstalledApps");
  if (!appsDir) {
    appsDir = fs.mkdir(systemDir.id, "InstalledApps");
    return;
  }

  const children = fs.readDir(appsDir.id);
  const manifests: AppManifest[] = [];

  for (const node of children) {
    if (node.kind !== "file") continue;
    const file = node as FSFile;
    if (file.fileType !== "app") continue;
    const raw = await fs.readFile(file.id);
    if (!raw) continue;
    try {
      const manifest: AppManifest = JSON.parse(raw);
      if (manifest.id && manifest.entry) {
        manifests.push(manifest);
      }
    } catch {}
  }

  if (manifests.length > 0) {
    await loader.loadAll(manifests);
  }
}

async function main() {
  const canvas = document.createElement("canvas");
  canvas.width = resolution.width;
  canvas.height = resolution.height;
  document.getElementById("root")!.appendChild(canvas);

  const video = document.createElement("video");
  video.playsInline = true;
  video.muted = true;
  document.body.appendChild(video);

  const ctx2d = canvas.getContext("2d", { alpha: false })!;
  const bitCanvas = new BitCanvas(resolution.width, resolution.height);
  const sprites = new SpriteRegistry();
  const appRegistry = new AppRegistry();
  const hitRegions = new HitRegionMap();
  const windowManager = new WindowManager({
    screenWidth: resolution.width,
    screenHeight: resolution.height,
    menubarHeight: MENUBAR_HEIGHT,
    onActivateChange: (prevId, newId) => {
      if (prevId) {
        dispatchToApp(prevId, { type: "deactivate" });
      }
      if (newId) {
        dispatchToApp(newId, { type: "activate" });
      }
      updateMenubar();
      scheduleRender();
    },
  });

  // Register single-window apps
  [
    SplashscreenApp,
    FileViewerApp,
    AboutApp,
    ControlPanelApp,
    PhotoBoothApp,
    VideoPlayerApp,
    SafariApp,
    PictureApp,
    AppStoreApp,
    ChatGippityApp,
    SpotifyPlayerApp,
    DialogApp,
  ].forEach((a) => appRegistry.register(a));

  // Register multi-window apps
  appRegistry.registerMultiWindow(FinderApp);

  const appLoader = new AppLoader(sprites, appRegistry);

  setSplashSpriteRegistry(sprites);

  let menubarState = createMenubarState([]);
  let showingSplashscreen = true;
  let cursorX = 0;
  let cursorY = 0;
  let zoom = 1;
  let mockFS!: MockFS;
  let finderAppBuilder!: AppBuilder;
  let finderServices!: FinderServices;

  function updateZoom() {
    const ww = window.innerWidth;
    const wh = window.innerHeight;
    zoom = Math.max(
      1,
      Math.min(
        Math.floor(ww / resolution.width),
        Math.floor(wh / resolution.height)
      )
    );
    canvas.style.width = `${resolution.width * zoom}px`;
    canvas.style.height = `${resolution.height * zoom}px`;
  }
  updateZoom();
  window.addEventListener("resize", updateZoom);

  const osServices = createOSServices({
    openWindow: (appId, props) => openWindow(appId, undefined, props),
    closeWindow: (windowId) => {
      windowManager.closeWindow(windowId);
      if (appRegistry.isMultiWindowApp("finder")) {
        appRegistry.destroyWindowForApp("finder", windowId);
      }
      appRegistry.destroyInstance(windowId);
      scheduleRender();
    },
    showDialog: (options) => {
      return new Promise((resolve) => {
        const dialogId = "__dialog__";
        const size = computeDialogSize(options.message, options.showInput);
        const dialogProps = {
          message: options.message,
          buttons: options.buttons ?? ["OK"],
          showInput: options.showInput,
          inputDefault: options.inputDefault,
          _resolve: (val: string | null) => {
            windowManager.closeWindow(dialogId);
            appRegistry.destroyInstance(dialogId);
            updateMenubar();
            scheduleRender();
            resolve(val);
          },
        };

        const instance = appRegistry.createInstance("__dialog__", dialogId, {
          ...dialogProps,
          _sprites: sprites,
          _os: osServices,
        });
        if (instance) {
          instance.builder.setRenderFunction(scheduleRender);
        }

        windowManager.openWindow({
          id: dialogId,
          title: "",
          x: Math.floor((resolution.width - size.width) / 2),
          y: Math.floor((resolution.height - size.height) / 2),
          width: size.width,
          height: size.height,
          contentHeight: size.height,
          contentWidth: size.width,
          appId: "__dialog__",
          props: dialogProps,
          scrollable: false,
          resizable: false,
          minWidth: size.width,
          minHeight: size.height,
          windowKind: "alert",
          modal: true,
          chromeless: true,
        });

        updateMenubar();
        scheduleRender();
      });
    },
    videoElement: video,
  });

  async function openFinderWindow(
    title: string,
    directoryId: string,
    fromRect?: AnimRect
  ) {
    const windowId = title;

    const existing = windowManager.windows.find((w) => w.id === windowId);
    if (existing) {
      windowManager.bringToFront(windowId);
      scheduleRender();
      return;
    }

    const pos = getDefaultPosition(windowManager.windows);
    const props = {
      directoryId,
      _finderServices: finderServices,
    };

    const inst = appRegistry.createWindowForApp("finder", windowId, props);
    if (inst) {
      inst.winBuilder.setRenderFunction(scheduleRender);
    }

    const winW = 340;
    const winH = 180;
    const leftMin = 3;
    const topMin = MENUBAR_HEIGHT + 3;
    const rightMax = resolution.width - 3;
    // win.y is title-bar top; window bottom = win.y + TITLE_BAR_HEIGHT + win.height
    const bottomMax = resolution.height - 3;
    let winX = Math.max(leftMin, Math.min(pos.x ?? 20, rightMax - winW));
    let winY = Math.max(
      topMin,
      Math.min(
        (pos.y ?? 30) + MENUBAR_HEIGHT,
        bottomMax - TITLE_BAR_HEIGHT - winH
      )
    );

    // Zoom-open animation plays before the window appears (Mac ShowWindow order)
    if (fromRect) {
      const toRect: AnimRect = {
        x: winX,
        y: winY,
        width: winW,
        height: winH + TITLE_BAR_HEIGHT,
      };
      await playZoomAnimation(fromRect, toRect);
    }

    windowManager.openWindow({
      id: windowId,
      title,
      x: winX,
      y: winY,
      width: winW,
      height: winH,
      contentHeight: winH,
      contentWidth: winW,
      appId: "finder",
      props,
      scrollable: true,
      resizable: true,
      minWidth: 160,
      minHeight: 80,
      windowKind: "document",
      openedFromRect: fromRect,
    });

    updateMenubar();
    scheduleRender();
  }

  async function openWindow(
    appId: string,
    title?: string,
    props?: any,
    defaultPosition?: any,
    fromRect?: AnimRect
  ) {
    const appDef = appRegistry.get(appId);
    if (!appDef) return;
    const windowId = title ?? appDef.title;

    const existing = windowManager.windows.find((w) => w.id === windowId);
    if (existing) {
      windowManager.bringToFront(windowId);
      scheduleRender();
      return;
    }

    const pos = defaultPosition ?? getDefaultPosition(windowManager.windows);
    const instance = appRegistry.createInstance(appId, windowId, {
      ...props,
      _sprites: sprites,
      _os: osServices,
      _fs: mockFS,
      _appLoader: appLoader,
      _openFSNode: (nodeId: string) => openFSNode(nodeId),
      _openWindow: (type: string, t: string, payload: any, defPos: any) => {
        const mappedId = appTypeMap[type] ?? type;
        openWindow(mappedId, t, payload, defPos);
      },
      _bitCanvas: bitCanvas,
      _windowManager: windowManager,
    });

    if (instance) {
      instance.builder.setRenderFunction(scheduleRender);
    }

    // Clamp size to desktop (gray region minus 3px), per original Mac Window Manager
    const maxW = resolution.width - 6;
    const maxH = resolution.height - MENUBAR_HEIGHT - 6;
    const winW = Math.min(appDef.defaultSize.width, maxW);
    const winH = Math.min(appDef.defaultSize.height, maxH);
    // Keep position on screen: don't open with window extending past desktop (Mac: "don't open a window off of a user's screen")
    // win.y is title-bar top; window bottom = win.y + TITLE_BAR_HEIGHT + win.height
    const leftMin = 3;
    const topMin = MENUBAR_HEIGHT + 3;
    const rightMax = resolution.width - 3;
    const bottomMax = resolution.height - 3;
    const winX = Math.max(leftMin, Math.min(pos.x ?? 20, rightMax - winW));
    const winY = Math.max(
      topMin,
      Math.min(
        (pos.y ?? 30) + MENUBAR_HEIGHT,
        bottomMax - TITLE_BAR_HEIGHT - winH
      )
    );

    // Zoom-open animation plays before the window appears (Mac ShowWindow order)
    if (fromRect) {
      const toRect: AnimRect = {
        x: winX,
        y: winY,
        width: winW,
        height: winH + TITLE_BAR_HEIGHT,
      };
      await playZoomAnimation(fromRect, toRect);
    }

    windowManager.openWindow({
      id: windowId,
      title: title ?? appDef.title,
      x: winX,
      y: winY,
      width: winW,
      height: winH,
      contentHeight: winH,
      contentWidth: winW,
      appId,
      props: props ?? {},
      scrollable: appDef.scrollable ?? false,
      resizable: appDef.resizable ?? false,
      minWidth: appDef.minSize?.width ?? 100,
      minHeight: appDef.minSize?.height ?? 60,
      windowKind: "document",
      openedFromRect: fromRect,
    });

    updateMenubar();
    scheduleRender();
  }

  async function openFSNode(nodeId: string, iconRect?: IconScreenRect) {
    const node = mockFS.getNode(nodeId);
    if (!node) return;

    if (node.kind === "directory") {
      openFinderWindow(node.name, node.id, iconRect);
      return;
    }

    const file = node as FSFile;

    if (file.fileType === "app-shortcut") {
      const raw = await mockFS.readFile(file.id);
      if (raw) {
        try {
          const { appId } = JSON.parse(raw);
          openWindow(appId, undefined, undefined, undefined, iconRect);
        } catch {}
      }
      return;
    }

    if (file.fileType === "app") {
      const raw = await mockFS.readFile(file.id);
      if (raw) {
        try {
          const manifest: AppManifest = JSON.parse(raw);
          if (manifest.id && manifest.entry) {
            await appLoader.load(manifest);
            openWindow(manifest.id, undefined, undefined, undefined, iconRect);
          }
        } catch {}
      }
      return;
    }

    if (file.fileType === "text") {
      openWindow(
        "file",
        file.name,
        { fileId: file.id, _fs: mockFS },
        undefined,
        iconRect
      );
      return;
    }

    if (file.fileType === "image") {
      const sprite = await mockFS.loadSprite(file.id);
      if (sprite) {
        openWindow(
          "picture",
          file.name,
          { src: `fs:${file.id}`, title: file.name },
          undefined,
          iconRect
        );
      }
      return;
    }
  }

  function updateMenubar() {
    const sysMenus = getSystemMenubar();
    const active = windowManager.getActiveWindow();
    let appMenus: MenubarDefinition[] | undefined;

    if (active) {
      // Check if this is a multi-window app (Finder)
      if (active.appId === "finder") {
        const mwInst = appRegistry.getMultiWindowInstance("finder", active.id);
        if (mwInst?.app.getMenubar) {
          mwInst.appBuilder.resetForRender();
          mwInst.winBuilder.resetForRender();
          appMenus = mwInst.app.getMenubar(
            mwInst.appBuilder,
            mwInst.winBuilder,
            active.id,
            mwInst.props
          );
        }
      } else {
        const instance = appRegistry.getInstance(active.id);
        if (instance?.app.getMenubar) {
          instance.builder.resetForRender();
          appMenus = instance.app.getMenubar(instance.builder, instance.props);
        }
      }
    }

    // Fallback to desktop Finder menubar
    if (!appMenus) {
      const desktopInst = appRegistry.getMultiWindowInstance(
        "finder",
        DESKTOP_WINDOW_ID
      );
      if (desktopInst?.app.getMenubar) {
        desktopInst.appBuilder.resetForRender();
        desktopInst.winBuilder.resetForRender();
        appMenus = desktopInst.app.getMenubar(
          desktopInst.appBuilder,
          desktopInst.winBuilder,
          DESKTOP_WINDOW_ID,
          desktopInst.props
        );
      }
    }

    if (!appMenus) {
      appMenus = getMinimalDesktopMenubar();
    }

    menubarState.menus = [...sysMenus, ...appMenus];
  }

  function getMinimalDesktopMenubar(): MenubarDefinition[] {
    return [
      {
        label: "File",
        items: [
          { label: "Open", shortcut: "⌘O", disabled: true },
          { label: "Close", disabled: true },
        ],
      },
      {
        label: "Edit",
        items: [
          { label: "Undo", shortcut: "⌘Z", disabled: true },
          { label: "Cut", shortcut: "⌘X", disabled: true },
          { label: "Copy", shortcut: "⌘C", disabled: true },
          { label: "Paste", shortcut: "⌘V", disabled: true },
        ],
      },
      {
        label: "View",
        items: [
          { label: "By Icon", disabled: true },
          { label: "By Name", disabled: true },
          { label: "By Date", disabled: true },
        ],
      },
      {
        label: "Special",
        items: [
          { label: "Clean Up Desktop", disabled: true },
          { label: "Empty Trash", disabled: true },
          { type: "separator" as const },
          { label: "Restart", disabled: true },
          { label: "Shut Down", disabled: true },
        ],
      },
    ];
  }

  function getSystemMenubar(): MenubarDefinition[] {
    return [
      {
        label: "\uF8FF",
        items: [
          {
            label: "About this Mockintosh...",
            onClick: () => openWindow("about"),
          },
          { type: "separator" },
          {
            label: "Control Panel",
            onClick: () => openWindow("control_panel"),
          },
        ],
      },
    ];
  }

  function dispatchToApp(windowId: string, event: OSEvent) {
    // Multi-window app (Finder)
    const win = windowManager.windows.find((w) => w.id === windowId);
    if (win && appRegistry.isMultiWindowApp(win.appId)) {
      const mwInst = appRegistry.getMultiWindowInstance(win.appId, windowId);
      if (mwInst?.app.onWindowEvent) {
        mwInst.appBuilder.resetForRender();
        mwInst.winBuilder.resetForRender();
        const contentRect = windowManager.getContentRect(win);
        const size = {
          width: win.width,
          height: win.height,
          contentOriginX: contentRect.x,
          contentOriginY: contentRect.y,
        };
        mwInst.app.onWindowEvent(
          mwInst.appBuilder,
          mwInst.winBuilder,
          event,
          windowId,
          mwInst.props,
          size
        );
      }
      return;
    }

    // Single-window app
    const instance = appRegistry.getInstance(windowId);
    if (instance?.app.onEvent) {
      const winState = windowManager.windows.find((w) => w.id === windowId);
      const size = winState
        ? { width: winState.width, height: winState.height }
        : instance.app.defaultSize;
      instance.builder.resetForRender();
      instance.app.onEvent(instance.builder, event, instance.props, size);
    }
  }

  // Window chrome callbacks
  const windowCallbacks = {
    onClose: (id: string) => {
      // Capture the window rect and its origin icon rect before closing
      const win = windowManager.windows.find((w) => w.id === id);
      const closeFromRect: AnimRect | null = win
        ? {
            x: win.x,
            y: win.y,
            width: win.width,
            height: win.height + TITLE_BAR_HEIGHT,
          }
        : null;
      // Retreat toward the icon the window was opened from (Mac behaviour)
      const closeToRect: AnimRect | null = win?.openedFromRect
        ? { ...win.openedFromRect }
        : null;

      // Remove the window first — animation plays over the closed screen state
      windowManager.closeWindow(id);
      if (appRegistry.isMultiWindowApp("finder")) {
        appRegistry.destroyWindowForApp("finder", id);
      }
      appRegistry.destroyInstance(id);
      updateMenubar();
      scheduleRender();

      if (closeFromRect && closeToRect) {
        playZoomAnimation(closeFromRect, closeToRect);
      }
    },
    onBringToFront: (id: string) => {
      windowManager.bringToFront(id);
      updateMenubar();
      scheduleRender();
    },
    onContentEvent: (id: string, event: OSEvent) => {
      dispatchToApp(id, event);
      scheduleRender();
    },
    onZoom: (id: string) => {
      const win = windowManager.windows.find((w) => w.id === id);
      if (win) {
        windowManager.zoomWindow(win);
        updateMenubar();
        scheduleRender();
      }
    },
    scheduleRender: () => scheduleRender(),
  };

  // --- Events ---
  const eventManager = new EventManager(canvas);
  eventManager.setZoom(zoom);

  eventManager.onEvent((event: OSEvent) => {
    eventManager.setZoom(zoom);

    if (event.type === "mouseMove") {
      cursorX = event.x ?? 0;
      cursorY = event.y ?? 0;
    }

    if (showingSplashscreen) {
      if (event.type === "mouseDown" || event.type === "keyDown") {
        showingSplashscreen = false;
        scheduleRender();
      }
      return;
    }

    // Window drag/resize takes priority
    if (windowManager.isDraggingOrResizing()) {
      if (event.type === "mouseMove") {
        windowManager.handleMouseMove(event.x!, event.y!);
        scheduleRender();
        return;
      }
      if (event.type === "mouseUp") {
        windowManager.handleMouseUp();
        scheduleRender();
        return;
      }
    }

    // Finder drag capture: when a Finder drag is active, route mouse events to Finder
    if (finderAppBuilder && finderIsDragging(finderAppBuilder)) {
      if (event.type === "mouseMove") {
        finderAppBuilder.resetForRender();
        finderHandleMouseMove(
          finderAppBuilder,
          event.x!,
          event.y!,
          finderServices
        );
        scheduleRender();
        return;
      }
      if (event.type === "mouseUp") {
        finderAppBuilder.resetForRender();
        finderHandleMouseUp(
          finderAppBuilder,
          event.x!,
          event.y!,
          finderServices
        );
        hitRegions.clearPressed();
        scheduleRender();
        return;
      }
    }

    // All other events dispatch through hit regions
    if (event.type === "mouseMove") {
      hitRegions.handleMouseMove(event.x!, event.y!);

      const active = windowManager.getActiveWindow();
      if (active && active.id !== DESKTOP_WINDOW_ID) {
        const contentRect = windowManager.getContentRect(active);
        const local = windowManager.toContentLocal(active, event.x!, event.y!);
        const isInside =
          event.x! >= contentRect.x &&
          event.x! < contentRect.x + contentRect.w &&
          event.y! >= contentRect.y &&
          event.y! < contentRect.y + contentRect.h;

        if (isInside) {
          dispatchToApp(active.id, {
            type: "mouseMove",
            x: local.x,
            y: local.y,
          });
        } else if (active.appId === "finder") {
          dispatchToApp(active.id, {
            type: "mouseMove",
            x: local.x,
            y: local.y,
          });
        }
      }
      scheduleRender();
      return;
    }

    if (event.type === "mouseDown") {
      if (menubarState.openMenuIndex !== null) {
        const hit = hitRegions.hitTest(event.x!, event.y!);
        const isMenubarHit =
          hit !== null &&
          (hit.id.startsWith("menubar-") || hit.id === "menubar-bg");
        if (!isMenubarHit) {
          menubarState.openMenuIndex = null;
          menubarState.highlightedItem = null;
          scheduleRender();
          return;
        }
      }

      hitRegions.handleMouseDown(event.x!, event.y!);
      scheduleRender();
      return;
    }

    if (event.type === "mouseUp") {
      hitRegions.handleMouseUp(event.x!, event.y!);
      scheduleRender();
      return;
    }

    if (event.type === "doubleClick") {
      hitRegions.handleDoubleClick(event.x!, event.y!);
      scheduleRender();
      return;
    }

    if (event.type === "scroll") {
      const id = windowManager.windows
        .slice()
        .reverse()
        .find((w) => {
          if (w.id === DESKTOP_WINDOW_ID) return false;
          const headerH = TITLE_BAR_HEIGHT + (w.infoBar ? 20 : 0);
          const totalW = w.width + 1;
          const totalH = headerH + w.height + 1;
          return (
            event.x! >= w.x &&
            event.x! < w.x + totalW &&
            event.y! >= w.y &&
            event.y! < w.y + totalH
          );
        });
      if (id) {
        // ScrollArea hit regions take priority — they handle their own wheel events
        const consumedByScrollArea = hitRegions.handleScroll(
          event.x!,
          event.y!,
          event.deltaY ?? 0
        );
        if (!consumedByScrollArea) {
          if (id.scrollable) {
            windowManager.handleScroll(id, event.deltaY ?? 0);
            const deltaX = event.deltaX ?? 0;
            if (deltaX !== 0) {
              windowManager.handleHScroll(id, deltaX);
            }
          } else {
            dispatchToApp(id.id, event);
          }
        }
        scheduleRender();
      }
      return;
    }

    if (event.type === "keyDown" || event.type === "keyUp") {
      const active = windowManager.getActiveWindow();
      if (active && active.id !== DESKTOP_WINDOW_ID) {
        dispatchToApp(active.id, event);
      }
      scheduleRender();
    }
  });

  // --- Render ---
  let renderScheduled = false;
  /** True while a zoom animation owns the pixel buffer — blocks scheduleRender */
  let animating = false;

  function scheduleRender() {
    if (renderScheduled || animating) return;
    renderScheduled = true;
    requestAnimationFrame(render);
  }

  /** Wrapper around animateZoomRect that pauses/resumes the render loop. */
  function playZoomAnimation(from: AnimRect, to: AnimRect): Promise<void> {
    // Set animating immediately — before the first tick — so any RAF already
    // queued by scheduleRender() is cancelled when it fires (render() checks
    // animating at the top and bails out before clearing the canvas).
    animating = true;
    return animateZoomRect(bitCanvas, ctx2d, from, to, 4, 30, undefined, () => {
      animating = false;
      scheduleRender();
    });
  }

  function drawCornerMasks() {
    const lt = sprites.get("corner-lt");
    const rt = sprites.get("corner-rt");
    const lb = sprites.get("corner-lb");
    const rb = sprites.get("corner-rb");
    if (lt) bitCanvas.blit(lt, 0, 0);
    if (rt) bitCanvas.blit(rt, resolution.width - rt.width, 0);
    if (lb) bitCanvas.blit(lb, 0, resolution.height - lb.height);
    if (rb)
      bitCanvas.blit(
        rb,
        resolution.width - rb.width,
        resolution.height - rb.height
      );
  }

  function render() {
    renderScheduled = false;
    if (animating) return;
    bitCanvas.clear(WHITE);
    hitRegions.clear();

    if (showingSplashscreen) {
      bitCanvas.fillPattern(
        0,
        0,
        resolution.width,
        resolution.height,
        "checkers"
      );
      const sprite = sprites.get("icon/happy");
      if (sprite)
        bitCanvas.blit(
          sprite,
          Math.floor((resolution.width - sprite.width) / 2),
          Math.floor((resolution.height - sprite.height) / 2)
        );
      const cur = sprites.get("cursor/default-1x");
      if (cur) bitCanvas.blit(cur, cursorX, cursorY);
      drawCornerMasks();
      bitCanvas.flush(ctx2d);
      return;
    }

    // Update content heights / info bars for all windows
    for (const win of windowManager.windows) {
      if (win.appId === "finder") {
        const mwInst = appRegistry.getMultiWindowInstance("finder", win.id);
        if (mwInst) {
          if (mwInst.app.getContentHeight) {
            mwInst.appBuilder.resetForRender();
            mwInst.winBuilder.resetForRender();
            win.contentHeight = mwInst.app.getContentHeight(
              mwInst.appBuilder,
              mwInst.winBuilder,
              win.id,
              mwInst.props,
              { width: win.width, height: win.height }
            );
          }
          if (mwInst.app.getInfoBar) {
            mwInst.appBuilder.resetForRender();
            mwInst.winBuilder.resetForRender();
            win.infoBar =
              mwInst.app.getInfoBar(
                mwInst.appBuilder,
                mwInst.winBuilder,
                win.id,
                mwInst.props
              ) ?? undefined;
          }
        }
        continue;
      }

      const instance = appRegistry.getInstance(win.id);
      if (instance?.app.getContentHeight) {
        instance.builder.resetForRender();
        win.contentHeight = instance.app.getContentHeight(
          instance.builder,
          instance.props,
          { width: win.width, height: win.height }
        );
      }
      if (instance?.app.getContentWidth) {
        instance.builder.resetForRender();
        win.contentWidth = instance.app.getContentWidth(
          instance.builder,
          instance.props,
          { width: win.width, height: win.height }
        );
      }
      if (instance?.app.getInfoBar) {
        instance.builder.resetForRender();
        win.infoBar =
          instance.app.getInfoBar(instance.builder, instance.props) ??
          undefined;
      }
    }

    // Draw all windows (desktop is the first, then folder windows + app windows)
    for (const win of windowManager.windows) {
      // Desktop window is chromeless and doesn't go through drawWindowChrome
      if (win.id === DESKTOP_WINDOW_ID) {
        const mwInst = appRegistry.getMultiWindowInstance("finder", win.id);
        if (mwInst) {
          const desktopCtx = new AppContext(
            bitCanvas,
            0,
            MENUBAR_HEIGHT,
            resolution.width,
            resolution.height - MENUBAR_HEIGHT,
            0,
            0,
            hitRegions
          );
          mwInst.appBuilder.resetForRender();
          mwInst.winBuilder.resetForRender();
          mwInst.app.renderWindow(
            mwInst.appBuilder,
            mwInst.winBuilder,
            desktopCtx,
            DESKTOP_WINDOW_ID,
            mwInst.props
          );
          mwInst.winBuilder.flushEffects();

          // Register desktop background hit region for clicks on empty space
          hitRegions.add({
            id: "desktop-bg",
            x: 0,
            y: MENUBAR_HEIGHT,
            w: resolution.width,
            h: resolution.height - MENUBAR_HEIGHT,
            onMouseDown: (_lx: number, _ly: number) => {
              dispatchToApp(DESKTOP_WINDOW_ID, {
                type: "mouseDown",
                x: _lx,
                y: _ly + MENUBAR_HEIGHT,
              });
            },
            onMouseUp: (_lx: number, _ly: number) => {
              dispatchToApp(DESKTOP_WINDOW_ID, {
                type: "mouseUp",
                x: _lx,
                y: _ly + MENUBAR_HEIGHT,
              });
            },
            onDoubleClick: (_lx: number, _ly: number) => {
              dispatchToApp(DESKTOP_WINDOW_ID, {
                type: "doubleClick",
                x: _lx,
                y: _ly + MENUBAR_HEIGHT,
              });
            },
            onDrag: (sx: number, sy: number) => {
              dispatchToApp(DESKTOP_WINDOW_ID, {
                type: "mouseMove",
                x: sx,
                y: sy,
              });
            },
          });

          desktopCtx.release();
        }
        continue;
      }

      windowManager.drawWindowChrome(
        bitCanvas,
        win,
        sprites,
        hitRegions,
        windowCallbacks
      );

      const contentCtx = windowManager.createAppContext(
        bitCanvas,
        win,
        hitRegions
      );

      if (win.appId === "finder") {
        const mwInst = appRegistry.getMultiWindowInstance("finder", win.id);
        if (mwInst) {
          mwInst.appBuilder.resetForRender();
          mwInst.winBuilder.resetForRender();
          mwInst.app.renderWindow(
            mwInst.appBuilder,
            mwInst.winBuilder,
            contentCtx,
            win.id,
            mwInst.props
          );
          mwInst.winBuilder.flushEffects();
        }
      } else {
        const instance = appRegistry.getInstance(win.id);
        if (instance) {
          instance.builder.resetForRender();
          instance.app.render(instance.builder, contentCtx, instance.props);
          instance.builder.flushEffects();
        }
      }

      contentCtx.release();
    }

    // Draw drag ghost on top of everything (except menubar and cursor)
    if (finderAppBuilder) {
      finderAppBuilder.resetForRender();
      finderRenderDragGhost(finderAppBuilder, bitCanvas, finderServices);
    }

    // Draw drag/resize outline over all windows (Mac DragGrayRgn behaviour)
    windowManager.drawDragOutline(bitCanvas);

    drawMenubar(
      bitCanvas,
      menubarState,
      sprites.get("eaten_apple"),
      resolution.width,
      hitRegions,
      scheduleRender
    );

    const cur = sprites.get("cursor/default-1x");
    if (cur) bitCanvas.blit(cur, cursorX, cursorY);

    drawCornerMasks();

    bitCanvas.flush(ctx2d);
  }

  // --- Boot ---
  registerAllSprites(sprites);
  sprites.registerAll(spotifySprites);
  scheduleRender();

  const bootStart = Date.now();

  await loadFonts();

  const fsBackend = new OPFSBackend();
  mockFS = new MockFS(fsBackend, sprites);
  await mockFS.init();
  await populateDefaultFS(mockFS);

  osServices.fs = mockFS;

  // Start the Finder as a multi-window app
  finderAppBuilder = appRegistry.startApp("finder")!;
  finderAppBuilder.setRenderFunction(scheduleRender);

  finderServices = {
    sprites,
    fs: mockFS,
    os: osServices,
    openFSNode: (nodeId: string, iconRect?: IconScreenRect) =>
      openFSNode(nodeId, iconRect),
    scheduleRender,
    screenWidth: resolution.width,
    screenHeight: resolution.height,
    menubarHeight: MENUBAR_HEIGHT,
    getOpenFolderWindows: (): FinderWindowInfo[] => {
      const result: FinderWindowInfo[] = [];
      for (const win of windowManager.windows) {
        if (win.id === DESKTOP_WINDOW_ID) continue;
        if (win.appId !== "finder") continue;
        const mwInst = appRegistry.getMultiWindowInstance("finder", win.id);
        if (!mwInst) continue;
        const directoryId = mwInst.props.directoryId;
        if (!directoryId) continue;
        const contentRect = windowManager.getContentRect(win);
        result.push({
          windowId: win.id,
          directoryId,
          contentX: contentRect.x,
          contentY: contentRect.y,
          contentW: contentRect.w,
          contentH: contentRect.h,
          scrollY: win.scrollY,
          scrollX: win.scrollX,
        });
      }
      return result;
    },
    formatDrive: async (): Promise<void> => {
      const result = await osServices.showDialog({
        message:
          "Erase Mockintosh HD and restore to factory state? This cannot be undone.",
        buttons: ["Erase", "Cancel"],
      });
      if (result !== "Erase") return;

      const toClose = windowManager.windows
        .filter((w) => w.appId === "finder" && w.id !== DESKTOP_WINDOW_ID)
        .map((w) => w.id);
      for (const id of toClose) {
        windowManager.closeWindow(id);
        if (appRegistry.isMultiWindowApp("finder")) {
          appRegistry.destroyWindowForApp("finder", id);
        }
        appRegistry.destroyInstance(id);
      }

      const rootChildren = mockFS.readDir(ROOT_ID);
      for (const node of rootChildren) {
        await mockFS.remove(node.id);
      }
      await bootstrapFreshFS(mockFS);
      scheduleRender();
    },
  };

  // Create the desktop window (Finder's special background window)
  const desktopProps = { _finderServices: finderServices };
  const desktopInst = appRegistry.createWindowForApp(
    "finder",
    DESKTOP_WINDOW_ID,
    desktopProps
  );
  if (desktopInst) {
    desktopInst.winBuilder.setRenderFunction(scheduleRender);
  }

  windowManager.openWindow({
    id: DESKTOP_WINDOW_ID,
    title: "",
    x: 0,
    y: MENUBAR_HEIGHT,
    width: resolution.width,
    height: resolution.height - MENUBAR_HEIGHT,
    contentHeight: resolution.height - MENUBAR_HEIGHT,
    contentWidth: resolution.width,
    appId: "finder",
    props: desktopProps,
    scrollable: false,
    resizable: false,
    minWidth: resolution.width,
    minHeight: resolution.height - MENUBAR_HEIGHT,
    windowKind: "desktop",
    chromeless: true,
  });

  mockFS.onChange(() => scheduleRender());
  updateMenubar();

  // Load persisted third-party apps from MockFS
  await loadPersistedApps(mockFS, appLoader);

  const elapsed = Date.now() - bootStart;
  const remaining = Math.max(0, BOOT_TIME - elapsed);
  await new Promise((r) => setTimeout(r, remaining));

  showingSplashscreen = false;
  setInterval(scheduleRender, TEXT_CURSOR_BLINK_MS);
  scheduleRender();
}

main();
