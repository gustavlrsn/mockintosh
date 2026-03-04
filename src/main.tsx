import { BitCanvas, BLACK, WHITE } from "../lib/canvas/BitCanvas";
import { AppContext } from "../lib/canvas/AppContext";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { AppRegistry } from "../lib/canvas/AppRegistry";
import { EventManager, OSEvent } from "../lib/canvas/EventManager";
import { WindowManager, TITLE_BAR_HEIGHT } from "../lib/canvas/WindowManager";
import { SpriteRegistry } from "../lib/canvas/SpriteRegistry";
import { loadFonts } from "../lib/canvas/fontAdapter";
import { createOSServices } from "../lib/canvas/OSServices";
import {
  MenubarDefinition,
  createMenubarState,
  drawMenubar,
  handleMenubarEvent,
  MENUBAR_HEIGHT,
} from "../lib/canvas/ui/drawMenubar";
import {
  DesktopIcon,
  createDesktopState,
  drawDesktop,
  desktopHitTest,
} from "../lib/canvas/ui/drawDesktop";
import { createDialogState, drawDialog } from "../lib/canvas/ui/drawDialog";
import { TEXT_CURSOR_BLINK_MS } from "../lib/canvas/ui/TextInput";
import { AppHost, SandboxedApp } from "../lib/canvas/sandbox/AppHost";

import { SplashscreenApp, setSplashSpriteRegistry } from "../apps/Splashscreen";
import { FinderApp } from "../apps/Finder";
import { FileViewerApp } from "../apps/FileViewer";
import { AboutApp } from "../apps/About";
import { ControlPanelApp } from "../apps/ControlPanel";
import { PhotoBoothApp } from "../apps/PhotoBooth";
import { VideoPlayerApp } from "../apps/VideoPlayer";
import { SafariApp } from "../apps/Safari";
import { PictureApp } from "../apps/Picture";
import { AppStoreApp } from "../apps/AppStore";
import { AppBuilderApp } from "../apps/AppBuilderApp";

import { resolution } from "../lib/config";
import getDefaultPosition from "../utils/getDefaultPosition";
// @ts-ignore
import pkg from "../package.json";

const version = pkg.version;
const BOOT_TIME = 1337;

const PRELOAD_SPRITES = [
  "/icons/happy.png",
  "/icons/hd.png",
  "/icons/folder.png",
  "/icons/file.png",
  "/icons/photobooth-smr-32.png",
  "/icons/MacFlim.png",
  "/icons/safari.png",
  "/icons/computer.png",
  "/icons/appstore-smr-32x32.png",
  "/user2.png",
  "/eaten_apple.png",
  "/cursors/default-1x.png",
  "/microdesktop-disk.png",
];

const finderMenubar: MenubarDefinition[] = [
  {
    label: "File",
    items: [
      { label: "New Folder", shortcut: "⌘N", disabled: true },
      { label: "Open", shortcut: "⌘O", disabled: true },
      { label: "Print", disabled: true },
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
      { type: "separator" },
      { label: "Restart", disabled: true },
      { label: "Shut Down", disabled: true },
    ],
  },
];

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

async function buildDesktopFiles(): Promise<DesktopIcon[]> {
  const [readme, contributing] = await Promise.all([
    loadMarkdownFile("README.md"),
    loadMarkdownFile("CONTRIBUTING.md"),
  ]);

  return [
    {
      title: "Mockintosh HD",
      type: "FINDER",
      img: "/icons/hd.png",
      payload: {
        icons: [
          {
            title: "Development",
            type: "FINDER",
            img: "/icons/folder.png",
            payload: {
              icons: [
                {
                  title: "README.md",
                  type: "FILE",
                  img: "/icons/file.png",
                  payload: { content: readme },
                },
                {
                  title: "CONTRIBUTING.md",
                  type: "FILE",
                  img: "/icons/file.png",
                  payload: { content: contributing },
                },
              ],
            },
          },
        ],
      },
    },
    {
      title: "Photo Booth",
      type: "PHOTO_BOOTH",
      img: "/icons/photobooth-smr-32.png",
      defaultPosition: { y: 5, x: 45 },
    },
    { title: "1984.mp4", type: "VIDEO", img: "/icons/MacFlim.png" },
    { title: "Safari", type: "SAFARI", img: "/icons/safari.png" },
    { title: "App Store", type: "appstore", img: "/icons/safari.png" },
    { title: "App Builder", type: "appbuilder", img: "/icons/computer.png" },
  ];
}

async function main() {
  // Create DOM elements
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
  const windowManager = new WindowManager({
    screenWidth: resolution.width,
    screenHeight: resolution.height,
    menubarHeight: MENUBAR_HEIGHT,
  });

  [
    SplashscreenApp,
    FinderApp,
    FileViewerApp,
    AboutApp,
    ControlPanelApp,
    PhotoBoothApp,
    VideoPlayerApp,
    SafariApp,
    PictureApp,
    AppStoreApp,
    AppBuilderApp,
  ].forEach((a) => appRegistry.register(a));

  setSplashSpriteRegistry(sprites);

  let menubarState = createMenubarState(finderMenubar);
  let desktopState = createDesktopState([]);
  let dialogState = createDialogState();
  let showingSplashscreen = true;
  let cursorX = 0;
  let cursorY = 0;
  let zoom = 1;

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
      appRegistry.destroyInstance(windowId);
      scheduleRender();
    },
    showDialog: (options) => {
      return new Promise((resolve) => {
        dialogState.def = {
          message: options.message,
          buttons: (options.buttons ?? ["OK"]).map((label) => ({
            label,
            onClick: () => {
              const val = options.showInput ? dialogState.inputValue : label;
              dialogState.def = null;
              resolve(val);
              scheduleRender();
            },
          })),
          showInput: options.showInput,
        };
        dialogState.inputValue = options.inputDefault ?? "";
        scheduleRender();
      });
    },
    videoElement: video,
  });

  const appHost = new AppHost(sprites, osServices, scheduleRender);

  function openWindow(
    appId: string,
    title?: string,
    props?: any,
    defaultPosition?: any
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
      _openWindow: (type: string, t: string, payload: any, defPos: any) => {
        const mappedId = appTypeMap[type] ?? type;
        openWindow(mappedId, t, payload, defPos);
      },
      _openSandboxedApp: (app: SandboxedApp) => {
        const winId = app.title ?? "User App";
        windowManager.openWindow({
          id: winId,
          title: app.title ?? "User App",
          x: pos.x ?? 40,
          y: pos.y ?? 40,
          width: app.defaultSize?.width ?? 200,
          height: app.defaultSize?.height ?? 150,
          contentHeight: app.defaultSize?.height ?? 150,
          appId: "__sandboxed__",
          props: {},
          scrollable: false,
        });
        appHost.spawn(winId, app);
        scheduleRender();
      },
    });

    if (instance) {
      instance.builder.setRenderFunction(scheduleRender);
    }

    windowManager.openWindow({
      id: windowId,
      title: title ?? appDef.title,
      x: pos.x ?? 20,
      y: (pos.y ?? 30) + MENUBAR_HEIGHT,
      width: appDef.defaultSize.width,
      height: appDef.defaultSize.height,
      contentHeight: appDef.defaultSize.height,
      appId,
      props: props ?? {},
      scrollable: appDef.scrollable ?? false,
    });

    updateMenubar();
    scheduleRender();
  }

  function updateMenubar() {
    const active = windowManager.getActiveWindow();
    if (active) {
      const instance = appRegistry.getInstance(active.id);
      if (instance?.app.getMenubar) {
        const appMenus = instance.app.getMenubar(
          instance.builder,
          instance.props
        );
        menubarState = createMenubarState([
          ...finderMenubar.slice(0, 1),
          ...appMenus,
        ]);
        return;
      }
    }
    menubarState = createMenubarState(finderMenubar);
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

    if (dialogState.def) {
      if (event.type === "mouseDown") {
        const btns = dialogState.def.buttons;
        if (btns.length > 0) btns[0].onClick();
      }
      return;
    }

    if (
      event.type === "mouseDown" ||
      event.type === "mouseMove" ||
      event.type === "mouseUp"
    ) {
      if (event.y! < MENUBAR_HEIGHT || menubarState.openMenuIndex !== null) {
        const result = handleMenubarEvent(
          menubarState,
          event,
          resolution.width
        );
        if (result.handled) {
          if (result.action) result.action();
          if (result.stateChanged) scheduleRender();
          return;
        }
      }
    }

    if (event.type === "mouseDown") {
      const result = windowManager.handleMouseDown(event.x!, event.y!);
      if (result.consumed) {
        updateMenubar();
        if (result.contentEvent && result.windowId)
          dispatchToApp(result.windowId, result.contentEvent);
        scheduleRender();
        return;
      }
      const iconIdx = desktopHitTest(
        desktopState,
        event.x!,
        event.y!,
        resolution.width,
        MENUBAR_HEIGHT
      );
      desktopState.selectedIndex = iconIdx >= 0 ? iconIdx : null;
      scheduleRender();
      return;
    }

    if (event.type === "mouseUp") {
      const result = windowManager.handleMouseUp(event.x!, event.y!);
      if (result.consumed && result.contentEvent && result.windowId)
        dispatchToApp(result.windowId, result.contentEvent);
      scheduleRender();
      return;
    }

    if (event.type === "mouseMove") {
      const result = windowManager.handleMouseMove(event.x!, event.y!);
      if (result.consumed && result.contentEvent && result.windowId)
        dispatchToApp(result.windowId, result.contentEvent);
      scheduleRender();
      return;
    }

    if (event.type === "doubleClick") {
      const result = windowManager.handleDoubleClick(event.x!, event.y!);
      if (result.consumed && result.contentEvent && result.windowId) {
        dispatchToApp(result.windowId, result.contentEvent);
        scheduleRender();
        return;
      }
      const iconIdx = desktopHitTest(
        desktopState,
        event.x!,
        event.y!,
        resolution.width,
        MENUBAR_HEIGHT
      );
      if (iconIdx >= 0) {
        const icon = desktopState.icons[iconIdx];
        const mappedId = appTypeMap[icon.type] ?? icon.type;
        openWindow(mappedId, icon.title, icon.payload, icon.defaultPosition);
      }
      scheduleRender();
      return;
    }

    if (event.type === "scroll") {
      const id = windowManager.hitTest(event.x!, event.y!);
      if (id) {
        const win = windowManager.windows.find((w) => w.id === id);
        if (win && win.scrollable) {
          const maxScroll = Math.max(0, win.contentHeight - win.height);
          win.scrollY = Math.max(
            0,
            Math.min(maxScroll, win.scrollY + (event.deltaY ?? 0))
          );
          scheduleRender();
        }
      }
      return;
    }

    if (event.type === "keyDown" || event.type === "keyUp") {
      const active = windowManager.getActiveWindow();
      if (active) dispatchToApp(active.id, event);
      scheduleRender();
    }
  });

  function dispatchToApp(windowId: string, event: OSEvent) {
    if (appHost.isRunning(windowId)) {
      appHost.sendEvent(windowId, {
        kind: event.type,
        x: event.x,
        y: event.y,
        key: event.key,
        code: event.code,
      });
      return;
    }
    const instance = appRegistry.getInstance(windowId);
    if (instance?.app.onEvent) {
      const win = windowManager.windows.find((w) => w.id === windowId);
      const size = win
        ? { width: win.width, height: win.height }
        : instance.app.defaultSize;
      instance.builder.resetForRender();
      instance.app.onEvent(instance.builder, event, instance.props, size);
    }
  }

  // --- Render ---
  let renderScheduled = false;

  function scheduleRender() {
    if (renderScheduled) return;
    renderScheduled = true;
    requestAnimationFrame(render);
  }

  function render() {
    renderScheduled = false;
    bitCanvas.clear(WHITE);

    if (showingSplashscreen) {
      bitCanvas.fillPattern(
        0,
        0,
        resolution.width,
        resolution.height,
        "checkers"
      );
      const sprite = sprites.get("/icons/happy.png");
      if (sprite)
        bitCanvas.blit(
          sprite,
          Math.floor((resolution.width - sprite.width) / 2),
          Math.floor((resolution.height - sprite.height) / 2)
        );
      const cur = sprites.get("/cursors/default-1x.png");
      if (cur) bitCanvas.blit(cur, cursorX, cursorY);
      bitCanvas.flush(ctx2d);
      return;
    }

    desktopState.openWindowTitles = new Set(
      windowManager.windows.map((w) => w.title)
    );
    drawDesktop(
      bitCanvas,
      desktopState,
      sprites,
      resolution.width,
      resolution.height,
      MENUBAR_HEIGHT
    );

    for (const win of windowManager.windows) {
      const instance = appRegistry.getInstance(win.id);
      if (instance?.app.getContentHeight) {
        instance.builder.resetForRender();
        win.contentHeight = instance.app.getContentHeight(
          instance.builder,
          instance.props,
          { width: win.width, height: win.height }
        );
      }
    }

    for (const win of windowManager.windows) {
      windowManager.drawWindowChrome(bitCanvas, win, sprites);

      const contentCtx = windowManager.createAppContext(bitCanvas, win);

      if (appHost.isRunning(win.id)) {
        appHost.executeCommands(win.id, contentCtx);
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

    const sysMenus = getSystemMenubar();
    const activeWin = windowManager.getActiveWindow();
    let appMenus: MenubarDefinition[] = finderMenubar;
    if (activeWin) {
      const inst = appRegistry.getInstance(activeWin.id);
      if (inst?.app.getMenubar)
        appMenus = inst.app.getMenubar(inst.builder, inst.props);
    }
    menubarState.menus = [...sysMenus, ...appMenus];
    drawMenubar(
      bitCanvas,
      menubarState,
      sprites.get("/eaten_apple.png"),
      resolution.width
    );

    if (dialogState.def)
      drawDialog(bitCanvas, dialogState, resolution.width, resolution.height);

    const cur = sprites.get("/cursors/default-1x.png");
    if (cur) bitCanvas.blit(cur, cursorX, cursorY);

    bitCanvas.flush(ctx2d);
  }

  // --- Boot ---
  await loadFonts();
  await sprites.preload(PRELOAD_SPRITES);

  const files = await buildDesktopFiles();
  desktopState = createDesktopState(files);

  // Global cursor blink: re-renders at the blink cadence so focused
  // text inputs animate without any per-app timer setup.
  setInterval(scheduleRender, TEXT_CURSOR_BLINK_MS);

  scheduleRender();
  setTimeout(() => {
    showingSplashscreen = false;
    scheduleRender();
  }, BOOT_TIME);
}

main();
