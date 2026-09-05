# Mockintosh Architecture

Mockintosh is a mock operating system in the style of an early Macintosh, running in the browser. It renders at the original 512×342 resolution, scaled up to fit the browser window, using an indexed pixel buffer with a global palette and a device mode of either `monochrome` or `colors`.

## High-Level Overview

The entire UI is rendered to a **single `<canvas>` element** backed by an indexed pixel buffer (`BitCanvas`). There is no HTML/CSS rendering within the simulated screen. In `monochrome` mode, palette entries are resolved to black/white or dithered approximations at output time; in `colors` mode, those same entries resolve to RGB through the global palette.

The frontend is built with **Vite** and a **SolidJS custom renderer** (`@mockintosh/ui`) that paints a retained `box` / `text` / `image` / `raster` tree through QuickDraw into the same indexed buffer. The OS shell lives in `src/os` and boots from `src/solidMain.ts`. The backend runs as **Vercel Edge Functions** in the same repo.

```
┌──────────────────────────────────────────────────────────────┐
│                         Browser                              │
│   Single <canvas> (512×342, scaled by zoom)                  │
│   Menubar · Windows · Desktop icons · cursor                 │
│   Hidden DOM: <video>, <audio>                               │
└──────────────────────────────────────────────────────────────┘
```

## Layering

```
@mockintosh/quickdraw (GrafPort, CopyBits, fonts)
        ↓
@mockintosh/ui (Solid universal renderer, layout, draw, pointer + focus)
        ↓
src/os shell (signals, window chrome, menubar, dialogs, app registry)
        ↓
apps/*.tsx system apps          @mockintosh/sdk v2 → third-party ESM
```

`createUI` is a **single-instance** renderer (`_setRepaintHook`, QuickDraw font globals). The OS is the only caller.

## App model

### System apps

Bundled Solid components registered with `registerApp` (`src/os/apps.ts`):

```ts
interface SolidApp<P = Record<string, never>> {
  id: string;
  title: string;
  icon: string;
  defaultSize: { width: number; height: number };
  windowKind?: OSWindowKind;
  scrollable?: boolean;
  resizable?: boolean;
  minSize?: { width: number; height: number };
  singleInstance?: boolean;
  menus?: MenubarDefinition[];   // the app's menubar
  Component: (props: P) => JSX.Element;
}
```

`WindowContent` mounts `registry.get(win.appId).Component`. `useWindow()` exposes `{ id, width, height, isActive, scrollY, setTitle, setContentSize, setInfoBar, setMenus, close }`.

Finder is registered like any other app (`FINDER_APP_ID`): the desktop is its window-less surface and folder windows are its windows (`kind: "finder-folder"`, `props: { directoryId }`). Decker still paints its card surface through a `<raster>` host over `lib/decker` (`LegacyAppHost`).

### Apps, windows, and the menubar

Windows belong to apps via `OSWindow.appId`; the **active app** is derived, never stored: the active window's app, or the Finder when nothing is open (`getActiveAppId()` in `state.ts`). System-modal alerts borrow the menubar of the frontmost non-modal window.

Menus are owned by apps, not windows. `SolidApp.menus` (or `setAppMenus(appId, …)` for menus that change at runtime) registers an app's menubar; `useWindow().setMenus` sets a *per-window override* for menus that depend on window state (Finder's "Clean Up" is enabled only inside a folder). `getMenubarMenus()` resolves override → app menus → `[]`, so switching windows always shows the right menus with no imperative sync.

### Third-party apps (SDK v2)

```ts
export default defineApp({
  id: "myapp",
  title: "My App",
  icon: "myapp/icon",
  defaultSize: { width: 200, height: 120 },
  Component() { return <box padding={8}><text font="body">Hi</text></box>; },
});
```

Bundles externalize `solid-js`, `solid-js/store`, `@mockintosh/ui`, and `@mockintosh/sdk`. The OS serves those via an import map so one Solid runtime is shared. `AppLoader` validates `Component` and calls `registerApp`. The App Store filters catalog entries to `sdk` major ≥ 2.

`useApp()` provides `getSprite`, `storage`, `os.openWindow/closeWindow/showDialog`, `setMenus` (this window's menubar), optional `fetch`, and `env`. The OS supplies one `AppServices` per window through the SDK's `AppServicesContext`, so each window's components see their own.

The SDK is the single source of the app contract shared with the OS: `SolidApp` (the internal `src/os/apps.ts` type extends it) and the menubar types (`MenubarDefinition`, `MenubarItemDef`, …) live in `packages/sdk/src` and the shell imports them from `@mockintosh/sdk`.

## Directory Structure

```
lib/canvas/                 Pixel buffer, sprites, FS, color, zoom
  BitCanvas.ts
  AppLoader.ts              Dynamic ESM loading (SDK v2 Component)
  AppBuilder.ts             Hook slots — used by Decker host only
  AppRegistry.ts            SystemApp type — used by Decker host only
  HitRegion.ts              Retained hit map — used by Decker host only
  qdDraw.ts                 GrafPort conveniences
  OSServices.ts             Toolbox-facing services for the Decker host
  ColorSystem.ts
  SystemPreferences.ts
  fs/OPFSBackend.ts
  sprites/

lib/toolbox/                Event, file, font, control, window record
  WindowRecord.ts           Window record + chrome constants
  WindowContext.ts          GrafPort drawing helper (Decker)
  FileManager.ts
  EventManager.ts
  ControlManager.ts

lib/decker/                 Lil runtime + Decker card engine
  core.ts
  systemApp.ts              Decker SystemApp painted via LegacyAppHost

packages/ui/                Solid universal renderer
packages/sdk/               defineApp, useApp, menubar types, UI re-exports
packages/markdown/          mdast → LayoutNode
packages/quickdraw/         GrafPort, CopyBits, fonts

apps/                       Solid system apps (*.tsx)
  Finder.solid.tsx
  MarkdownView.tsx
  …

src/
  solidMain.ts              Boot: canvas, createUI, OSRoot, events
  os/                       Shell
    apps.ts                 SolidApp registry
    state.ts                Window store, active app, app menus
    windowContext.ts        useWindow()
    windowGeometry.ts       Chrome metrics + content-rect helpers (single source of truth)
    layering.ts             Kind-aware z-order
    installedApps.ts        Persist + load App Store installs
    legacy/LegacyAppHost    Decker raster bridge
    components/             Desktop, Window, Menubar, Dialog, Splash

templates/app/              vite-plugin-solid universal starter
```

## Rendering pipeline

Each dirty frame:

1. Solid tree → layout → QuickDraw paint (`ui.frame()`). The tree ends with `ScreenCorners`, an inert layer that anchors the rounded-CRT corner sprites with `right`/`bottom` absolute layout above every window and menu.
2. Cursor sprite blits on the UI port (the only thing drawn outside the tree)
3. `BitCanvas.flush` to the 2D canvas

Layout snaps every node to the pixel grid (positions floor, sizes round) so centering and percentages never produce half-pixels, which QuickDraw would refuse to draw.

Pointer events hit-test the node tree (`ui.dispatchPointer`) with capture: the node that received `mouseDown` keeps `drag` / `mouseUp`. There is no bubbling — a press goes to the topmost node with a handler — but there *is* a capture phase: `onMouseDownCapture` runs on every ancestor of the hit (root-most first) before the target's `onMouseDown`, and `preventDefault()` swallows the press along with its mouseup / click / drag. A press also makes the nearest `focusScope` the active one. Keyboard goes to the focus manager; ⌘ shortcuts are handled by the shell first.

The node tree follows DOM semantics: `insertChild` *moves* an already-attached node, which is what Solid's `<For>` relies on when `WindowStack` reorders windows.

Window drag/resize uses an XOR outline (`penMode="xor"` / `darkCheckers`) driven by `state.ts`.

### Window chrome invariant

Nothing inside a window can alter its chrome. The body box draws the 1px frame as its border and clips children (`overflow="hidden"`); `@mockintosh/ui` follows the CSS box model, so children are laid out *inside* the border and clipped to it. Header content that belongs to the window (e.g. Finder's item count) goes through `win.infoBar`, not the content area. All chrome metrics live in `src/os/windowGeometry.ts`; apps needing screen-space geometry use `windowContentRect()` rather than hardcoding title-bar heights.

### Window activation invariant

Activation is owned by the shell, not by content. The window body's `onMouseDownCapture` (`handleActivationPress` in `Window.solid.tsx`) is the only place `bringToFront` is called from a pointer event. A press on an inactive window brings it to the front; if the press is on the title bar it continues as a drag, anywhere else it is swallowed so content never reacts to the click that focused its window (classic Mac). While an `alert` is open, presses on every other window are swallowed (`isBlockedByModal`). Apps therefore never need to — and must not — call `bringToFront` themselves.

## Window kinds and layering

| Kind            | Chrome                                      | Layer                         |
| --------------- | ------------------------------------------- | ----------------------------- |
| `"desktop"`     | none                                        | behind everything             |
| `"document"`    | title, close, zoom, optional scroll / grow  | documents                     |
| `"dialog"`      | title, close; no zoom                       | documents                     |
| `"utility"`     | small title                                 | above documents               |
| `"alert"`       | chromeless / modal                          | front; other windows `inert`  |
| `"presentation"`| chromeless app surface                      | documents                     |

`openApp` clamps size/position to the desktop (gray region minus 3 px). Zoom box toggles `standardBounds` vs `userBounds`. Opening from a Finder icon plays the zoom-rect animation.

## Event flow

```
DOM → EventManager → ui.dispatchPointer / dispatchKeyboard
                   → ⌘ shortcut scan of active menubar
```

## File System

Virtual hierarchical FS persisted via OPFS (`FileManager` + `OPFSBackend`).

File types: `"text"`, `"image"`, `"app"`, `"app-shortcut"`, `"binary"`.

Finder launches: app-shortcut → `openApp`; `.md`/text → FileViewer; image → Picture; `.deck`/`.html` → Decker.

Installed third-party manifests persist in `localStorage` (`mockintosh:installed-apps`) and are loaded at boot by `AppLoader`.

## App Store

Browses `registry.json`. Only `sdk` major ≥ 2 entries are shown. Install imports the ESM bundle, registers the Solid app, and persists the manifest.

## Dependencies

| Package            | Purpose                                      |
| ------------------ | -------------------------------------------- |
| `vite`             | Build and dev server                         |
| `solid-js`         | Reactivity (universal renderer, not DOM)     |
| `vite-plugin-solid`| JSX → `@mockintosh/ui/renderer`              |
| `@mockintosh/sdk`  | Third-party app API                          |

## Deployment

Vercel: Vite static site + Edge Functions (`api/chat`, `api/checkout`, `api/verify-purchase`, browse/spotify proxies).
