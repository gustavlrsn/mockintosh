# Mockintosh Architecture

Mockintosh is a mock operating system in the style of an early Macintosh, running in the browser. It emulates 1-bit (black and white) graphics at the original 512×342 resolution, scaled up to fit the browser window.

## High-Level Overview

The entire UI is rendered to a **single `<canvas>` element** backed by a 1-bit pixel buffer (`BitCanvas`). There is no HTML/CSS rendering within the simulated screen — every pixel is guaranteed to be either black or white, with no anti-aliasing, subpixel rendering, or color leaking from the browser's rendering engine.

The frontend is built with **Vite** (no framework — pure TypeScript). All rendering, state management, and event handling is handled by the canvas OS layer. The backend (LLM proxy) runs as a **Vercel Edge Function** in the same repo.

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
│   │  │  │ (native) │  │ (sandbox)│                     │ │   │
│   │  │  └──────────┘  └──────────┘                     │ │   │
│   │  │                                                 │ │   │
│   │  │                         ↑ cursor                │ │   │
│   │  └─────────────────────────────────────────────────┘ │   │
│   └──────────────────────────────────────────────────────┘   │
│                                                              │
│   Hidden DOM: <video> (camera/video), <audio>, <input>       │
└──────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
lib/canvas/                 Core OS engine
  BitCanvas.ts              1-bit pixel buffer and drawing primitives
  HitRegion.ts              Hit region map — retained interactive areas for event dispatch
  AppContext.ts             Scoped drawing context (per-window clipping + hit regions)
  AppBuilder.ts            Hook-based state management (useState, useEffect, etc.)
  AppRegistry.ts           App registration and lifecycle (single-window + multi-window)
  EventManager.ts          DOM event → OS event translation
  WindowManager.ts         Window list, z-order, dragging, focus, chrome rendering
  SpriteRegistry.ts        Sprite cache, PNG loading, and 2bpp format decoder
  OSServices.ts            System services (camera, audio, storage, clipboard, file system)
  fontAdapter.ts           Bridge between PixelFontCanvas and BitCanvas
  patterns.ts              8×8 fill patterns (checkers, stripes, grays)

  fs/                      Virtual file system
    MockFS.ts              Hierarchical FS with types, metadata, change subscriptions
    OPFSBackend.ts         OPFS persistence layer (metadata sidecar + content blobs)

  sprites/                 Inline sprite data (2bpp packed, base64-encoded)
    icons.ts               Desktop and app icons (32×32)
    cursors.ts             Mouse cursor sprites at multiple sizes
    ui.ts                  Miscellaneous UI sprites (apple logo, floppy disk, etc.)
    index.ts               Registers all inline sprites into a SpriteRegistry

  ui/                      OS chrome drawing functions
    drawMenubar.ts         Menubar with dropdowns, radio groups, shortcuts
    drawButton.ts          Classic Mac buttons
    drawDialog.ts          Modal dialogs
    drawScrollbar.ts       (handled within WindowManager.ts)
    TextInput.ts           Text input with cursor and keyboard handling

  sandbox/                 Sandboxed user app system
    workerRuntime.ts       JavaScript runtime injected into Web Workers
    AppHost.ts             Main-thread Worker manager
    protocol.ts            Message type definitions
    API_REFERENCE.ts       App API documentation (also used as LLM prompt)

apps/                      Application implementations
  Splashscreen.ts          Boot screen with happy Mac icon
  Finder.ts                Desktop + folder browser (multi-window app, owns desktop surface)
  FileViewer.ts            Plaintext/markdown file viewer — loads content from MockFS
  About.ts                 "About This Mockintosh" dialog
  ControlPanel.ts          System settings with pattern editor
  PhotoBooth.ts            Camera app with dithering
  VideoPlayer.ts           1-bit video player
  Safari.ts                Web browser with URL bar and site registry
  Picture.ts               Image viewer with print support
  AppStore.ts              Browse/install/uninstall user-created apps (backed by MockFS)
  AppBuilderApp.ts         AI-powered app generator (chat with LLM, streaming)

src/
  main.tsx                 Entry point — mounts canvas, boots OS, initializes MockFS, runs render loop

api/
  generate-app.ts          Vercel Edge Function — LLM proxy with SSE streaming

scripts/
  build-content.ts         Build-time markdown → HTML conversion

lib/
  PixelFontCanvas.js       Bitmap font renderer (loads .fnt files)
  config.ts                Screen resolution (512×342)
  print.ts                 Thermal printer support
```

## Rendering Pipeline

Every frame follows this exact order, painting from back to front:

1. **Clear** — fill the pixel buffer with white
2. **Desktop** — the Finder's desktop window (first in window stack): checkerboard background + volume icons + Desktop Folder icons
3. **Windows** — iterate bottom-to-top through the remaining window stack:
   - Draw window chrome (border, title bar, close box, scrollbar)
   - Create a clipped `AppContext` for the content area
   - Call the app's `render()` / `renderWindow()` function (or execute sandboxed draw commands)
   - Release the clip
4. **Drag ghost** — if the Finder has an active icon drag, draw the ghost outline on top of all windows
5. **Menubar** — white bar at top with menu labels and open dropdown
6. **Dialog** — modal dialog if active (blocks everything behind it)
7. **Cursor** — 16×16 sprite at current mouse position
8. **Flush** — expand the 1-bit buffer to RGBA `ImageData` and `putImageData` to the real canvas

The entire buffer is 512×342 = ~175K pixels. Flushing converts each pixel: `1` → RGB(0,0,0), `0` → RGB(255,255,255).

## BitCanvas

The core primitive. A `Uint8Array` where each byte is `0` (white) or `1` (black).

Key capabilities:

- Pixel-level operations: `setPixel`, `getPixel`
- Shape primitives: `drawRect`, `fillRect`, `drawHLine`, `drawVLine`, `drawDottedHLine`
- Pattern fills: `fillPattern` with named 8×8 patterns (checkers, stripes, gray25/50/75)
- Sprite blitting: `blit`, `blitInverted`, `blitShadowOutline`, `blitImageData`
- Inversion: `invertRect` (XOR each pixel, used for selection highlighting)
- Clipping stack: `pushClip` / `popClip` (rectangle intersection)
- Output: `flush(ctx)` expands to RGBA and writes to a real canvas context

The 1-bit guarantee is structural — the buffer physically cannot store anything other than 0 or 1.

## AppContext

A scoped drawing proxy given to each app. Wraps `BitCanvas` with:

- **Coordinate offset** — (0,0) in the app maps to the window's content area origin
- **Automatic clipping** — drawing outside the window bounds is silently dropped
- **Hit region registration** — `hitRegion(id, rect, callbacks)` translates local coordinates to screen coordinates and registers on the global `HitRegionMap`
- **Button auto-registration** — `drawButton()` accepts optional `onClick`/`onMouseDown` callbacks and auto-registers a hit region

Apps never see screen coordinates or other windows. They draw in their own local coordinate space.

## AppBuilder (Hooks)

Lightweight state management modeled after React hooks:

```typescript
function myApp(app: AppBuilder, ctx: AppContext, props: any) {
  const [count, setCount] = app.useState(0);

  app.useEffect(() => {
    console.log("count changed:", count);
  }, [count]);

  ctx.drawRect(0, 0, ctx.width, ctx.height);
  drawBitmapText(ctx.getBitCanvas(), String(count), ...);
}
```

- `useState(initial)` — returns `[value, setter]`, setter triggers re-render
- `useEffect(fn, deps)` — runs after render when deps change
- `useMemo(fn, deps)` — memoized computation
- `useRef(initial)` — persistent mutable ref

Hook state is stored in a slot array indexed by call order (same pattern as React). When any setter is called, a re-render is scheduled via `requestAnimationFrame`.

## App Types

### Native Apps (Single-Window)

Trusted apps that run on the main thread with full browser API access. Defined as objects implementing the `NativeApp` interface:

```typescript
interface NativeApp {
  id: string;
  title: string;
  icon: string;
  defaultSize: { width: number; height: number };
  scrollable?: boolean;
  render(app: AppBuilder, ctx: AppContext, props: any): void;
  onEvent?(app: AppBuilder, event: OSEvent, props: any): void;
  getMenubar?(app: AppBuilder, props: any): MenubarDefinition[];
  getContentHeight?(app: AppBuilder, props: any): number;
}
```

Each single-window app gets one `AppBuilder` instance per window. The `AppBuilder` is created when the window opens and destroyed when it closes.

### Multi-Window Apps

Apps that own multiple windows and/or special surfaces like the desktop. Modeled after the original Macintosh architecture where the Finder was one application managing the desktop and all folder windows simultaneously.

```typescript
interface MultiWindowApp {
  id: string;
  title: string;
  icon: string;

  onStart?(app: AppBuilder): void;
  onStop?(app: AppBuilder): void;

  renderWindow(app: AppBuilder, win: AppBuilder, ctx: AppContext,
               windowId: string, props: any): void;
  onWindowEvent?(app: AppBuilder, win: AppBuilder, event: OSEvent,
                 windowId: string, props: any, size: WindowSize): void;
  getMenubar?(app: AppBuilder, win: AppBuilder, windowId: string,
              props: any): MenubarDefinition[];
}
```

Multi-window apps have a **two-level state model** matching the original Mac:

| Original Mac concept | Our equivalent |
| --- | --- |
| App's global variables | App-level `AppBuilder` (one per app, lives from start to stop) |
| `WindowRecord` | `WindowState` in `WindowManager` (unchanged) |
| Document record via `SetWRefCon` | Per-window `AppBuilder` (one per window, lives from open to close) |

Every method receives both `app` (shared app-level state) and `win` (per-window state). This means a text editor can have different font sizes per window while the Finder shares drag state across all its windows.

Both levels use the same `AppBuilder` class — the difference is purely lifecycle. The app-level builder is created by `AppRegistry.startApp()` and lives until `stopApp()`. Per-window builders are created/destroyed with their windows.

The Finder is currently the only multi-window app. It owns:
- A **desktop window** (`__desktop__`) — chromeless, fullscreen behind all other windows, renders the checkerboard background, volume icons, and Desktop Folder contents
- **Folder windows** — standard windows showing directory contents, with title bars, scrollbars, and close boxes
- A **unified drag state** stored in the app-level builder, enabling seamless drag-and-drop across the desktop and all folder windows with no handover

### Sandboxed Apps (User-Created)

Untrusted apps that run in **Web Workers** with no DOM access. The isolation model:

```
┌─────────────────────────┐     postMessage     ┌──────────────────┐
│      Main Thread        │◄───────────────────►│   Web Worker     │
│                         │                      │                  │
│  AppHost validates and  │  draw commands ───►  │  User code runs  │
│  executes draw commands │  ◄─── events         │  with blocked    │
│  on a clipped AppContext│                      │  globals         │
└─────────────────────────┘                      └──────────────────┘
```

**Security layers:**

| Layer               | What it prevents                                                                       |
| ------------------- | -------------------------------------------------------------------------------------- |
| Web Worker          | DOM access, cookie theft, page manipulation                                            |
| Blocked globals     | `window`, `document`, `fetch`, `eval`, `Function`, `importScripts` are all `undefined` |
| AppContext clipping | Drawing outside window bounds                                                          |
| Command allowlist   | Only known draw operations are executed                                                |
| Timeout watchdog    | Infinite loops (Worker terminated after 2s)                                            |

Sandboxed apps write against a clean API:

```javascript
function app(api) {
  const [count, setCount] = api.useState(0);
  api.clear();
  api.drawRect(10, 10, 80, 30);
  api.bitmapText(String(count), 50, 18, { font: "ChiKareGo", align: "center" });
  api.hitRegion("counter-btn", 10, 10, 80, 30, {
    onClick: () => setCount(count + 1),
  });
}
```

The draw calls collect into a command array, which is sent to the main thread via `postMessage` and executed on a clipped `AppContext`. Hit region commands are also collected and registered on the global `HitRegionMap` — events matching a sandbox hit region are dispatched back to the worker with the region ID.

## Hit Regions

Interactive areas are declared during rendering via a `HitRegionMap`. Each frame, the map is cleared and rebuilt as components draw themselves. This eliminates the need to duplicate layout math between draw and hit-test code.

```
render() frame
  ├── hitRegions.clear()
  ├── Finder.renderWindow(__desktop__) ── registers desktop icon regions (on top of background)
  ├── drawWindowChrome() ── registers close box, title bar, scrollbar, content regions
  ├── app.render() / renderWindow() ── may register button/link regions via AppContext
  └── drawMenubar() ── registers label + dropdown item regions (topmost layer)
```

`HitRegionMap.hitTest(x, y)` scans in reverse insertion order — the last-registered region wins, matching the painter's algorithm. Background/catchall regions are registered first (lowest z-order), and specific interactive elements are registered after.

Each region has an ID and optional callbacks: `onMouseDown`, `onMouseUp`, `onClick`, `onDoubleClick`, `onMouseEnter`, `onMouseLeave`. The map tracks a `hoveredId` to automatically fire enter/leave events as the cursor moves.

Native apps register hit regions via `AppContext.hitRegion(id, rect, callbacks)` or by passing `onClick`/`onMouseDown` to `drawButton()`. Sandboxed apps use `api.hitRegion(id, x, y, w, h, callbacks)` — the commands are collected by `AppHost` and registered on the map with coordinate translation.

## Event Flow

```
DOM mouse/keyboard event
    │
    ▼
EventManager (translates to OS coordinates, detects double-clicks)
    │
    ▼
Is dialog open? ──yes──► Dialog handles it
    │ no
    ▼
Is dragging/resizing window? ──yes──► WindowManager continuous tracking
    │ no
    ▼
Is Finder dragging an icon? ──yes──► Finder drag state machine (screen coords)
    │ no
    ▼
hitRegions.handle*(x, y)
    │
    ├── Finds topmost region at (x, y)
    ├── Fires onMouseDown/onMouseUp/onClick/onDoubleClick
    ├── Tracks enter/leave for onMouseEnter/onMouseLeave
    └── Returns whether a region was hit
    │
    │ For mouseMove: also dispatches to active window for app hover effects
    │ For keyboard events: dispatches to active window's app
```

The manual cascade (menubar → window manager → desktop) has been replaced by a single flat hit region lookup. Z-order is implicit from render order.

## Fonts

Two bitmap fonts are used, loaded from `.fnt` files via `PixelFontCanvas`:

- **ChiKareGo** — 16px line height, used for menu items, title bars, buttons (the "Chicago" equivalent)
- **Geneva9** — 12px line height, used for body text, icon labels, file content

Text is rendered by `PixelFontCanvas` onto a temporary canvas, then the pixels are read and transferred to `BitCanvas` via `fontAdapter.ts`. This preserves the existing font rendering pipeline while ensuring all output ends up in the 1-bit buffer.

## Sprites

Sprites are small bitmaps with transparency, used for icons, cursors, and UI elements. The runtime type is:

```typescript
interface Sprite {
  width: number;
  height: number;
  data: Uint8Array; // 1 byte per pixel, 0=white, 1=black
  mask?: Uint8Array; // 1=opaque, 0=transparent
}
```

Each pixel has one of 3 states: **transparent**, **white**, or **black**.

### Inline Sprite Format (2bpp)

Most sprites are defined inline in TypeScript using a compact 2-bits-per-pixel encoding:

| Bits | Meaning     |
| ---- | ----------- |
| `00` | transparent |
| `01` | white       |
| `10` | black       |
| `11` | reserved    |

4 pixels pack into 1 byte, MSB-first. The packed bytes are stored as a base64 string. A 32×32 icon = 1024 pixels = 256 bytes = ~344 characters of base64.

```typescript
const ICON_FOLDER = defineSprite(32, 32, "AAAAAAAAAA...");
```

`defineSprite(width, height, b64)` decodes the base64 string into a `Sprite` at module load time. All built-in sprites are registered synchronously at boot via `registerAllSprites()` — no network requests needed.

Sprite data lives in `lib/canvas/sprites/` (icons, cursors, UI elements). A conversion script (`scripts/convert-sprites.ts`) can regenerate these files from PNG sources.

### Runtime PNG Loading

`SpriteRegistry.load()` can still fetch and convert PNGs at runtime (used for user-uploaded images, Safari inline images, etc.). The pipeline: fetch → decode to RGBA → threshold to 1-bit `Sprite`.

## File System (MockFS)

Mockintosh has a virtual hierarchical file system that stores text files, images, user-created apps, and directory structure. All data persists locally via the browser's Origin Private File System (OPFS).

### Architecture

The FS is split into two layers:

```
┌────────────────────────────────────────────────┐
│  MockFS (lib/canvas/fs/MockFS.ts)              │
│  In-memory metadata tree + high-level API      │
├────────────────────────────────────────────────┤
│  OPFSBackend (lib/canvas/fs/OPFSBackend.ts)    │
│  OPFS read/write for meta.json + content blobs │
└────────────────────────────────────────────────┘
```

On disk (within OPFS), the layout is:

```
mockintosh-fs/
  meta.json              ← full directory tree + file metadata (JSON)
  files/
    <id1>                ← content blob for file id1
    <id2>                ← content blob for file id2
    ...
```

Content blobs are keyed by a unique ID (not by filename), so renaming and moving files only touches `meta.json`. This also makes future sync straightforward — the metadata is a single compact manifest, and content blobs are immutable by ID.

### Node Types

Every entry in the FS is an `FSNode`:

```typescript
interface FSNode {
  id: string; // unique ID, used as OPFS filename for content
  name: string; // display name (e.g. "README.md")
  kind: "file" | "directory";
  parentId: string | null; // null = root
  createdAt: number;
  modifiedAt: number;
  icon?: string; // sprite registry key override (e.g. "icon/hd")
  position?: { x: number; y: number }; // custom icon position in parent container
}
```

Files extend this with a type discriminator:

```typescript
interface FSFile extends FSNode {
  kind: "file";
  fileType: "text" | "image" | "app" | "app-shortcut" | "binary";
  size: number;
}
```

| `fileType`     | Content format                                | Opened by       |
| -------------- | --------------------------------------------- | --------------- |
| `text`         | Plain text string                             | FileViewer      |
| `image`        | JSON: `{ width, height, data }` (2bpp base64) | Picture         |
| `app`          | JSON: `{ id, title, description, code }`      | Sandbox Worker  |
| `app-shortcut` | JSON: `{ appId }` — points to a native app    | (direct launch) |
| `binary`       | Arbitrary string data                         | —               |

### Icons and the Sprite Registry

Each `FSNode` can have an `icon` field containing a sprite registry key. If not set, `getIconForNode()` returns a default based on the node's kind and file type:

- Directories → `"icon/folder"`
- Text files → `"icon/file"`
- Apps → `"icon/appstore-smr-32x32"`
- App shortcuts → the shortcut's own icon (e.g. `"icon/safari"`)
- Images → `"icon/camera"`

Image files stored in the FS use the same 2bpp sprite format as built-in sprites. When loaded, they are decoded via `defineSprite()` and registered in `SpriteRegistry` under the key `"fs:{fileId}"`. This means sandboxed apps can reference FS-stored images via `api.drawImage("fs:{fileId}", x, y)` without any protocol changes.

### API

`MockFS` exposes:

- `readDir(dirId)` — list children sorted by kind then name
- `readFile(fileId)` — read content string from OPFS
- `writeFile(parentId, name, content, fileType, opts?)` — create or update a file
- `writeImage(parentId, name, spriteData)` — write a 2bpp image + register as sprite
- `loadSprite(fileId)` — decode an image file into a `Sprite` and register it
- `mkdir(parentId, name)` — create a directory (idempotent)
- `rename(nodeId, newName)`, `move(nodeId, newParentId)`, `remove(nodeId)`
- `setPosition(nodeId, position)` — set or clear the custom icon position for a node
- `clearPositions(parentId)` — clear custom positions for all children of a directory
- `resolvePath(path)` — walk a `/`-separated path from root
- `findByName(parentId, name)` — find a child by name
- `onChange(callback)` — subscribe to mutations (used to refresh desktop icons and Finder views)
- `flush()` — force-write pending metadata to OPFS

Metadata is persisted with a 500ms debounce — multiple rapid mutations batch into a single OPFS write.

### Default File Tree

On first boot (no `meta.json` exists), `populateDefaultFS()` creates:

```
/ (root)
└── Mockintosh HD/              icon: "icon/hd"        (the volume)
    ├── Desktop Folder/         (loose desktop items live here)
    │   ├── Photo Booth         (app-shortcut → "photobooth")
    │   ├── 1984.mp4            (app-shortcut → "video")
    │   ├── Safari              (app-shortcut → "safari")
    │   ├── App Store           (app-shortcut → "appstore")
    │   └── App Builder         (app-shortcut → "appbuilder")
    ├── Development/
    │   ├── README.md           (text, loaded from /content/)
    │   └── CONTRIBUTING.md     (text, loaded from /content/)
    └── Applications/           (user-installed apps land here)
```

### Integration with the OS

- **Finder** — a multi-window app (the only one currently) that owns the desktop and all folder windows, matching the original Macintosh architecture. The Finder is started at boot and never stopped. It manages a special `__desktop__` window (chromeless, fullscreen, behind all other windows) that renders volume icons and Desktop Folder contents on a checkerboard background, plus normal folder windows opened by double-clicking directories. Drag-and-drop uses a unified drag state in the Finder's app-level `AppBuilder`, so icons can be seamlessly dragged between the desktop and any folder window without handover logic. Dragging onto a folder or volume icon moves the item into that directory via `MockFS.move()`. The Finder's menubar includes "New Folder", "New Text File", and "Clean Up" actions. `mockFS.onChange()` triggers a re-render so FS changes appear immediately.
- **FileViewer** — accepts a `fileId` prop and loads content asynchronously from MockFS.
- **App Store** — reads installed apps from the `/Mockintosh HD/Applications` directory. `saveApp()` and `removeApp()` write through MockFS.
- **App Builder** — "Publish" saves the generated app to MockFS via `saveApp()`.
- **OSServices** — exposes `fs: MockFS` so any native app can access the file system.

### Sync-Ready Design

The metadata/content split is designed for a future cloud sync layer:

- **Metadata** is a single JSON blob that can be diffed and merged
- **Content** blobs are keyed by UUID — a sync engine only needs to upload/download changed IDs
- `onChange()` provides a hook for a sync engine to observe mutations
- `modifiedAt` timestamps enable conflict detection

## AI App Builder

The App Builder is a native app that lets users describe apps in natural language. The flow:

1. User types a prompt in the chat interface
2. The prompt is sent to `/api/generate-app` (a Vercel Edge Function)
3. The API route forwards to a configurable LLM endpoint (set `LLM_API_URL` and `LLM_API_KEY` env vars)
4. The LLM system prompt includes the full Mockintosh App API reference from `API_REFERENCE.ts`
5. Responses are **streamed** via Server-Sent Events — tokens appear in the chat as they arrive
6. The generated code is returned and can be previewed (spawned in a sandboxed Worker)
7. If the user clicks "Publish", the app is saved to MockFS (under `/Mockintosh HD/Applications`) and appears in the App Store

If no LLM API key is configured, the endpoint returns a sample counter app as a fallback.

### Streaming

The `/api/generate-app` endpoint supports `stream: true` in the request body. When enabled:

- The upstream LLM call uses `stream: true`
- The response is a `ReadableStream` of SSE events: `data: {"token":"..."}\n\n`
- The client-side `generateApp()` function reads these tokens incrementally, updating the chat in real time
- Final `data: [DONE]\n\n` signals completion
- Falls back to non-streaming JSON if `stream` is omitted

## Patterns

Fill patterns are 8×8 lookup tables stored as `Uint8Array[64]`:

| Pattern    | Description                                         |
| ---------- | --------------------------------------------------- |
| `black`    | All pixels black                                    |
| `white`    | All pixels white                                    |
| `checkers` | Alternating black/white pixels (desktop background) |
| `stripes`  | Horizontal lines with 1px gaps (active title bar)   |
| `gray25`   | 25% black density dither                            |
| `gray50`   | 50% black density (same as checkers)                |
| `gray75`   | 75% black density dither                            |

To sample a pattern at any coordinate: `pattern[(y & 7) * 8 + (x & 7)]`. The `& 7` ensures seamless tiling regardless of position.

## Dependencies

| Package                                  | Purpose                                              |
| ---------------------------------------- | ---------------------------------------------------- |
| `vite`                                   | Frontend build tool and dev server                   |
| `canvas-dither`                          | Atkinson/Bayer dithering for camera and video frames |
| `dayjs`                                  | Date formatting (photo timestamps)                   |
| `esc-pos-encoder` / `codepage-encoder`   | Thermal printer support                              |
| `gray-matter` / `remark` / `remark-html` | Markdown file processing at build time               |

All UI rendering dependencies (React, Next.js, Radix UI, Tailwind, react-draggable, clsx) have been removed. The canvas engine has zero external dependencies.

## Deployment

The project deploys to **Vercel** as a Vite static site + Edge Functions:

- `dist/` — Vite build output (static HTML/JS/CSS)
- `api/generate-app.ts` — Vercel Edge Function (auto-detected by Vercel from the `api/` directory)
- `vercel.json` — routes rewrites for `/api/*` and build configuration
- Environment variables (`LLM_API_URL`, `LLM_API_KEY`, `LLM_MODEL`) are set in Vercel project settings
