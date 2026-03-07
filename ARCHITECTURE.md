# Mockintosh Architecture

Mockintosh is a mock operating system in the style of an early Macintosh, running in the browser. It emulates 1-bit (black and white) graphics at the original 512×342 resolution, scaled up to fit the browser window.

## High-Level Overview

The entire UI is rendered to a **single `<canvas>` element** backed by a 1-bit pixel buffer (`BitCanvas`). There is no HTML/CSS rendering within the simulated screen — every pixel is guaranteed to be either black or white, with no anti-aliasing, subpixel rendering, or color leaking from the browser's rendering engine.

The frontend is built with **Vite** (no framework — pure TypeScript). All rendering, state management, and event handling is handled by the canvas OS layer. The backend runs as **Vercel Edge Functions** in the same repo.

```
┌──────────────────────────────────────────────────────────────┐
│                         Browser                              │
│                                                              │
│   ┌──────────────────────────────────────────────────────┐   │
│   │  Single <canvas> element (512×342, scaled by zoom)   │   │
│   │                                                      │   │
│   │  ┌─────────────────────────────────────────────────┐ │   │
│   │  │ Menubar                                         │ │   │
│   │  ├─────────────────────────────────────────────────┤ │   │
│   │  │                                                 │ │   │
│   │  │  ┌──────────┐  ┌──────────┐   Desktop icons    │ │   │
│   │  │  │ Window A │  │ Window B │   (checkerboard bg) │ │   │
│   │  │  │ (system) │  │ (3rd pty)│                     │ │   │
│   │  │  └──────────┘  └──────────┘                     │ │   │
│   │  │                                                 │ │   │
│   │  │                         ↑ cursor                │ │   │
│   │  └─────────────────────────────────────────────────┘ │   │
│   └──────────────────────────────────────────────────────┘   │
│                                                              │
│   Hidden DOM: <video> (camera/video), <audio>, <input>       │
│   Overlay DOM: Polar checkout iframe (for paid app purchases)│
└──────────────────────────────────────────────────────────────┘
```

## App Types

There are two kinds of apps:

### System Apps

Bundled with the OS, imported at build time, can access OS internals. These are the core apps that ship with Mockintosh.

```typescript
interface SystemApp {
  id: string;
  title: string;
  icon: string;
  defaultSize: { width: number; height: number };
  scrollable?: boolean;
  resizable?: boolean;
  minSize?: { width: number; height: number };
  render(app: AppBuilder, ctx: AppContext, props: any): void;
  onEvent?(app: AppBuilder, event: OSEvent, props: any, size: WindowSize): void;
  getMenubar?(app: AppBuilder, props: any): MenubarDefinition[];
  getContentHeight?(app: AppBuilder, props: any, size: WindowSize): number;
  getContentWidth?(app: AppBuilder, props: any, size: WindowSize): number;
  getInfoBar?(app: AppBuilder, props: any): string[] | null;
}
```

Examples: Finder, Safari, PhotoBooth, ChatGippity, AppStore, SpotifyPlayer.

### Third-Party Apps

Developed externally against the `@mockintosh/sdk`, loaded at runtime from the App Store via `AppLoader`. Same rendering power as system apps, but constrained to the SDK's public API surface.

```typescript
// From @mockintosh/sdk
interface App {
  id: string;
  title: string;
  icon: string;
  defaultSize: { width: number; height: number };
  render(app: AppBuilder, ctx: AppContext, props: AppProps): void;
  onEvent?(
    app: AppBuilder,
    event: OSEvent,
    props: AppProps,
    size: WindowSize
  ): void;
  // ...same shape, but with typed AppProps instead of raw props: any
}
```

Third-party apps use typed `AppProps` (see SDK section) instead of raw OS internals. Both app types run on the main thread with the same `AppBuilder` + `AppContext` rendering model. The distinction is about trust level, API surface, and distribution — not runtime isolation.

### Multi-Window System Apps

Apps that own multiple windows and special surfaces (like the desktop). Only used by the Finder.

```typescript
interface MultiWindowSystemApp {
  id: string;
  renderWindow(
    app: AppBuilder,
    win: AppBuilder,
    ctx: AppContext,
    windowId: string,
    props: any
  ): void;
  onWindowEvent?(
    app: AppBuilder,
    win: AppBuilder,
    event: OSEvent,
    windowId: string,
    props: any,
    size: WindowSize
  ): void;
  // ...
}
```

## Directory Structure

```
lib/canvas/                 Core OS engine
  BitCanvas.ts              1-bit pixel buffer and drawing primitives
  HitRegion.ts              Hit region map — retained interactive areas for event dispatch
  AppContext.ts             Scoped drawing context (per-window clipping + hit regions)
  AppBuilder.ts            Hook-based state management (useState, useEffect, etc.)
  AppRegistry.ts           App registration and lifecycle (SystemApp + MultiWindowSystemApp)
  AppLoader.ts             Dynamic ESM loading for third-party apps
  EventManager.ts          DOM event → OS event translation
  WindowManager.ts         Window list, z-order, dragging, focus, chrome rendering
  SpriteRegistry.ts        Sprite cache, PNG loading, and 2bpp format decoder
  OSServices.ts            System services (camera, audio, storage, clipboard, file system)
  fontAdapter.ts           Bridge between PixelFontCanvas and BitCanvas
  patterns.ts              8×8 fill patterns (checkers, stripes, grays)

  fs/                      Virtual file system
    MockFS.ts              Hierarchical FS with types, metadata, change subscriptions
    OPFSBackend.ts         OPFS persistence layer (metadata sidecar + content blobs)

  sprites/                 OS-owned sprite data (2bpp packed, base64-encoded)
    icons.ts               Desktop and app icons (32×32)
    cursors.ts             Mouse cursor sprites at multiple sizes
    ui.ts                  Miscellaneous UI sprites (apple logo, floppy disk, etc.)
    index.ts               Registers all OS sprites into a SpriteRegistry

  ui/                      OS chrome drawing functions
    drawMenubar.ts         Menubar with dropdowns, radio groups, shortcuts
    drawButton.ts          Classic Mac buttons
    drawDialog.ts          Modal dialogs
    TextInput.ts           Text input with cursor and keyboard handling
    TextBlock.ts           Word-wrapped text rendering

apps/                      System app implementations
  Splashscreen.ts          Boot screen with happy Mac icon
  Finder.ts                Desktop + folder browser (multi-window app)
  FileViewer.ts            Plaintext/markdown file viewer
  About.ts                 "About This Mockintosh" dialog
  ControlPanel.ts          System settings with pattern editor
  PhotoBooth.ts            Camera app with dithering
  VideoPlayer.ts           1-bit video player
  Safari.ts                Web browser with URL bar and site registry
  Picture.ts               Image viewer
  AppStore.ts              Browse/install third-party apps from remote registry
  ChatGippity.ts           Simple LLM chat interface
  SpotifyPlayer.ts         Spotify Web Playback SDK integration
  Dialog.ts                Modal dialog system app

  sprites/                 App-owned sprite data (for system apps that own their sprites)
    spotify.ts             Spotify Player sprite definitions

packages/sdk/              @mockintosh/sdk — the public API for third-party app developers
  src/index.ts             Type definitions, interfaces, and sprite utilities
  docs/APP_DEV_GUIDE.md    Comprehensive guide for app developers
  examples/                Example apps (counter, todo-list, image-viewer)

templates/app/             Starter template for external app repos
  src/index.ts             Example app with sprites
  mockintosh.json          App manifest
  vite.config.ts           Build config (ESM output, SDK externalized)

src/
  main.tsx                 Entry point — mounts canvas, boots OS, loads persisted apps

api/
  chat.ts                  Vercel Edge Function — LLM chat proxy for ChatGippity
  checkout.ts              Vercel Edge Function — Polar checkout session creation
  verify-purchase.ts       Vercel Edge Function — purchase validation and license issuance
```

## The SDK: @mockintosh/sdk

A standalone npm package at `packages/sdk/`. Third-party apps depend on this, not on OS internals.

**Exported from the SDK:**

- `App` interface — the third-party app contract
- `AppBuilder` interface — hooks (useState, useEffect, useMemo, useRef)
- `AppContext` interface — scoped drawing surface
- `AppProps` — typed interface for OS services available to apps
- `Sprite` type + `defineSprite()` + `fromGrid()` — sprite creation utilities
- `OSEvent`, `WindowSize`, `MenubarDefinition` — event and layout types
- `TextInputState` — text input state management
- `BLACK`, `WHITE` constants, `PatternName`, `FontName` types
- `measureText()`, `getLineHeight()` — font measurement (injected at runtime)
- `AppManifest` — manifest format for the registry

**Not exported (OS internals):**

- `SystemApp`, `MultiWindowSystemApp` — OS-internal interfaces
- `BitCanvas`, `WindowManager`, `HitRegionMap`, `EventManager`
- `MockFS` — apps use `AppProps.storage` instead
- `SpriteRegistry` class — apps use `AppProps.getSprite()` instead

## AppLoader

`lib/canvas/AppLoader.ts` handles dynamic loading of third-party apps at runtime.

```typescript
class AppLoader {
  async load(manifest: AppManifest): Promise<SystemApp>;
  async loadAll(manifests: AppManifest[]): Promise<void>;
  isLoaded(appId: string): boolean;
}
```

Loading sequence:

1. `import()` the ESM bundle from the manifest's `entry` URL
2. Register any exported `sprites` record into the global `SpriteRegistry`
3. Validate the default export has the required App shape (id, render, title, icon, defaultSize)
4. Register the app with `AppRegistry`

## App-Owned Sprites

Apps own their sprites. The OS only contains core sprites (icons, cursors, UI chrome).

Third-party apps export a `sprites` record alongside their default `App` export:

```typescript
export const sprites: Record<string, Sprite> = {
  "myapp/icon": defineSprite(32, 32, "..."),
  "myapp/play": fromGrid(16, 16, ["..##..", ...]),
};
```

**Naming convention:** App sprites use the app ID as prefix (`"spotify/play"`, `"calculator/icon"`). OS sprites use category prefixes (`"icon/"`, `"cursor/"`, `"ui/"`).

## Rendering Pipeline

Every frame follows this exact order, painting from back to front:

1. **Clear** — fill the pixel buffer with white
2. **Desktop** — the Finder's desktop window: checkerboard background + volume icons + Desktop Folder icons
3. **Windows** — iterate bottom-to-top through the remaining window stack:
   - Draw window chrome (border, title bar, close box, zoom box, scrollbar)
   - Create a clipped `AppContext` for the content area
   - Call the app's `render()` / `renderWindow()` function
   - Release the clip
4. **Drag ghost** — if the Finder has an active icon drag
5. **Drag/resize outline** — if a window is being dragged or resized, draw a dotted rectangle at the prospective position/size (Mac DragGrayRgn behaviour)
6. **Menubar** — white bar at top with menu labels and open dropdown
7. **Cursor** — 16×16 sprite at current mouse position
8. **Flush** — expand the 1-bit buffer to RGBA `ImageData` and `putImageData`

## Window Kinds

Every window carries a `windowKind` field that is the single source of truth for its type. This maps directly to the original Macintosh window classification:

| Kind         | Description                                           | Chrome                                                          | Modality              | Layer                                |
| ------------ | ----------------------------------------------------- | --------------------------------------------------------------- | --------------------- | ------------------------------------ |
| `"document"` | Primary app window (folder, viewer, editor…)          | title bar, close box, zoom box, optional scroll bars / size box | modeless              | lowest                               |
| `"dialog"`   | Modeless or movable-modal dialog                      | title bar, close box; no zoom                                   | modeless or app-modal | same as document                     |
| `"alert"`    | Strictly modal notification (no user can switch away) | chromeless, double-outline                                      | strictly modal        | above all others                     |
| `"utility"`  | Floating palette / tool panel                         | small title bar; no zoom (optional close)                       | modeless              | always above document/dialog windows |
| `"desktop"`  | Finder desktop background                             | chromeless, full screen                                         | none                  | behind all windows                   |

`modal` and `chromeless` are derived from `windowKind` at `openWindow` time (`WindowManager.isModal()` / `WindowManager.isChromeless()`). Layering is enforced by `_insertInLayerOrder` and `bringToFront` in `WindowManager`.

### Initial window size, position, and maximum size (open + resize)

Apps can specify any `defaultSize`; the OS ensures no window ever exceeds the available space and that it opens fully on screen:

- **Open (size):** `main.openWindow` clamps the app’s `defaultSize` to the desktop (gray region minus 3 px): `width ≤ screenWidth - 6`, `height ≤ screenHeight - menubarHeight - 6`.
- **Open (position):** The initial position (from `getDefaultPosition` or default 20, 30) is clamped so the window stays within the desktop: `x` and `y` are adjusted so the window’s right and bottom edges do not extend past the gray region minus 3 px. This matches the Mac guideline “don’t open a window off of a user’s screen”; the original Mac could reset to upper-left when staggering would have gone off-screen.
- **Resize:** When the user resizes via the size box, `WindowManager.handleMouseMove` clamps the prospective width/height to the same maximum (`_maxContentSize()`). Only minimum size is per-window (`minWidth` / `minHeight`); maximum is system-wide so no window can grow past the usable screen.

On the original Mac, the application passed a `sizeRect` (min/max) to `GrowWindow` and was advised to cap the maximum at the display size; here the system enforces that cap so apps cannot specify or resize to a larger-than-desktop size.

### Zoom box (standard / user state)

Document and utility windows support a zoom box in the right side of the title bar. Clicking it toggles between:

- **Standard state** — application-defined ideal size (`standardBounds` on `WindowState`). If the app does not set one, the system default is the full gray region (screen minus menu bar) minus a 3 px border on all sides.
- **User state** — the last position and size set by the user via drag or resize (`userBounds`).

The transition fires on **mouse release** while the cursor is still inside the box (Mac WM behaviour).

### Activate / deactivate events

When the frontmost window changes, `WindowManager` invokes its `onActivateChange(prevId, newId)` callback. `main.tsx` translates this into `{ type: 'deactivate' }` and `{ type: 'activate' }` OSEvents dispatched to the affected apps via `dispatchToApp`. Apps that don't handle these events are unaffected; apps that do can update controls and highlighting (e.g. dim inactive controls).

### FindWindow

`windowManager.findWindow(globalX, globalY)` returns a `FindWindowResult` containing the `windowId` and a `WindowHitPart` code (`inMenuBar`, `inDesktop`, `inDrag`, `inGoAway`, `inZoom`, `inGrow`, `inVScroll`, `inHScroll`, `inContent`, `inWindowBackground`). This is the Macintosh `FindWindow(pt)` equivalent — a single query API over the hit-region geometry without replacing the per-region callback dispatch.

### Drag outline / grow image

During a title-bar drag or a grow-box resize, the window **does not move or resize immediately**. Instead, `WindowManager` tracks prospective position/size internally and `drawDragOutline()` renders a dotted rectangle outline at those prospective bounds each frame. The actual `win.x`/`win.y`/`win.width`/`win.height` are updated only on mouse release. This matches the original Macintosh `DragWindow` / `GrowWindow` behaviour.

## BitCanvas

The core primitive. A `Uint8Array` where each byte is `0` (white) or `1` (black).

Key capabilities:

- Pixel-level operations: `setPixel`, `getPixel`
- Shape primitives: `drawRect`, `fillRect`, `drawHLine`, `drawVLine`, `drawDottedHLine`
- Pattern fills: `fillPattern` with named 8×8 patterns
- Sprite blitting: `blit`, `blitInverted`, `blitShadowOutline`, `blitImageData`
- Inversion: `invertRect` (XOR each pixel)
- Clipping stack: `pushClip` / `popClip`
- Output: `flush(ctx)` expands to RGBA

## AppContext

A scoped drawing proxy given to each app. Wraps `BitCanvas` with coordinate offset, automatic clipping, hit region registration, and UI component drawing (buttons, text inputs, text blocks, scroll areas).

### ScrollArea

`ctx.scrollArea(id, rect, opts, drawContent)` is a composable scrollable region. It handles clipping, scrollbar rendering (classic Mac style), and all scroll interaction (wheel, arrows, thumb drag) — the app only manages the scroll offset via `useState`.

Use `scrollArea` when only **part** of the window content should scroll (e.g., a message list with a fixed input bar). For windows where the entire content scrolls, set `scrollable: true` on the app and implement `getContentHeight` — the OS handles the scrollbar in the window chrome.

```typescript
const [scrollOffset, setScrollOffset] = app.useState(0);

ctx.scrollArea(
  "my-list",
  { x: 0, y: 0, w: ctx.width, h: ctx.height - TOOLBAR_HEIGHT },
  {
    contentHeight: totalHeight,
    scrollOffset,
    onScroll: setScrollOffset,
  },
  (scrollCtx) => {
    // draw content as if starting at (0,0) — scrollCtx handles the offset
  }
);
```

## AppBuilder (Hooks)

Lightweight state management modeled after React hooks:

- `useState(initial)` — returns `[value, setter]`, setter triggers re-render
- `useEffect(fn, deps)` — runs after render when deps change
- `useMemo(fn, deps)` — memoized computation
- `useRef(initial)` — persistent mutable ref

Hook state is stored in a slot array indexed by call order (same pattern as React).

## Hit Regions

Interactive areas declared during rendering. Each frame, the map is cleared and rebuilt. `HitRegionMap.hitTest(x, y)` scans in reverse insertion order (last-registered wins).

## Event Flow

```
DOM event → EventManager → Window drag check → Finder drag check → hitRegions.handle*()
    │                                                                      │
    └── keyboard events dispatched to active window's app                  └── fires callbacks
```

## File System (MockFS)

Virtual hierarchical FS persisted via OPFS. Split into `MockFS` (in-memory tree) and `OPFSBackend` (persistence).

File types: `"text"`, `"image"`, `"app"` (third-party manifests), `"app-shortcut"` (native app launchers), `"binary"`.

Third-party app manifests are stored under `/Mockintosh HD/System/InstalledApps/` and loaded at boot via `AppLoader`.

## ChatGippity

A simple LLM chat interface (system app). Sends messages to `/api/chat` and displays streamed responses. No code generation — purely conversational.

## App Store and Registry

The App Store browses a remote `registry.json` catalog hosted in a GitHub repository. Each entry includes app metadata, version, SDK compatibility, permissions, and pricing information.

The registry format:

```json
{
  "apps": [
    {
      "id": "calculator",
      "title": "Calculator",
      "author": "jane-doe",
      "version": "1.2.0",
      "sdk": "^1.0.0",
      "description": "A classic calculator",
      "entry": "https://cdn.../calculator@1.2.0/index.js",
      "permissions": [],
      "approved": true,
      "pricing": { "type": "free" }
    }
  ]
}
```

## Paid Apps (Polar.sh)

Developers can sell apps via [Polar.sh](https://polar.sh), which handles checkout, licensing, payouts, tax, and refunds.

Flow: App Store → `/api/checkout` → Polar API → Embedded checkout iframe → `/api/verify-purchase` → license stored in MockFS → app loaded.

Pricing types: `"free"`, `"one-time"`, `"subscription"`. Licenses stored under `/Mockintosh HD/System/Licenses/`.

## Dependencies

| Package           | Purpose                                              |
| ----------------- | ---------------------------------------------------- |
| `vite`            | Frontend build tool and dev server                   |
| `canvas-dither`   | Atkinson/Bayer dithering for camera and video frames |
| `dayjs`           | Date formatting (photo timestamps)                   |
| `@mockintosh/sdk` | SDK for third-party app development (workspace pkg)  |

## Deployment

The project deploys to **Vercel** as a Vite static site + Edge Functions:

- `dist/` — Vite build output
- `api/chat.ts` — LLM chat proxy
- `api/checkout.ts` — Polar checkout session creation
- `api/verify-purchase.ts` — Purchase validation
- Environment variables: `LLM_API_URL`, `LLM_API_KEY`, `LLM_MODEL`, `POLAR_ACCESS_TOKEN`
