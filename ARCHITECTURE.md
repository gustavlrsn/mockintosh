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
  AppContext.ts             Scoped drawing context (per-window clipping)
  AppBuilder.ts            Hook-based state management (useState, useEffect, etc.)
  AppRegistry.ts           Native app registration and lifecycle
  EventManager.ts          DOM event → OS event translation
  WindowManager.ts         Window list, z-order, dragging, focus, chrome rendering
  SpriteRegistry.ts        Image preloading and 1-bit conversion
  OSServices.ts            System services (camera, audio, storage, clipboard)
  fontAdapter.ts           Bridge between PixelFontCanvas and BitCanvas
  patterns.ts              8×8 fill patterns (checkers, stripes, grays)

  ui/                      OS chrome drawing functions
    drawMenubar.ts         Menubar with dropdowns, radio groups, shortcuts
    drawButton.ts          Classic Mac buttons
    drawDialog.ts          Modal dialogs
    drawDesktop.ts         Desktop background and icon grid
    drawScrollbar.ts       (handled within WindowManager.ts)
    TextInput.ts           Text input with cursor and keyboard handling

  sandbox/                 Sandboxed user app system
    workerRuntime.ts       JavaScript runtime injected into Web Workers
    AppHost.ts             Main-thread Worker manager
    protocol.ts            Message type definitions
    API_REFERENCE.ts       App API documentation (also used as LLM prompt)

apps/                      Application implementations
  Splashscreen.ts          Boot screen with happy Mac icon
  Finder.ts                Folder browser with icon grid
  FileViewer.ts            Plaintext/markdown file viewer
  About.ts                 "About This Mockintosh" dialog
  ControlPanel.ts          System settings with pattern editor
  PhotoBooth.ts            Camera app with dithering
  VideoPlayer.ts           1-bit video player
  Safari.ts                Web browser with URL bar and site registry
  Picture.ts               Image viewer with print support
  AppStore.ts              Browse/install/uninstall user-created apps
  AppBuilderApp.ts         AI-powered app generator (chat with LLM, streaming)

src/
  main.tsx                 Entry point — mounts canvas, boots OS, runs render loop

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
2. **Desktop** — checkerboard pattern background + icon grid
3. **Windows** — iterate bottom-to-top through the window stack:
   - Draw window chrome (border, title bar, close box, scrollbar)
   - Create a clipped `AppContext` for the content area
   - Call the app's `render()` function (or execute sandboxed draw commands)
   - Release the clip
4. **Menubar** — white bar at top with menu labels and open dropdown
5. **Dialog** — modal dialog if active (blocks everything behind it)
6. **Cursor** — 16×16 sprite at current mouse position
7. **Flush** — expand the 1-bit buffer to RGBA `ImageData` and `putImageData` to the real canvas

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

### Native Apps

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

Native apps can access `OSServices` (camera, audio, storage) and hidden DOM elements (for video decoding, etc.).

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
  api.onMouseDown((x, y) => {
    if (x >= 10 && x < 90 && y >= 10 && y < 40) setCount(count + 1);
  });
}
```

The draw calls collect into a command array, which is sent to the main thread via `postMessage` and executed on a clipped `AppContext`.

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
Is menubar area or menu open? ──yes──► Menubar handles it
    │ no
    ▼
WindowManager.hitTest (which window was clicked?)
    │
    ├── Title bar ──► Start drag
    ├── Close box ──► Close window
    ├── Scrollbar ──► Scroll content
    └── Content area ──► Translate to local coords, dispatch to app
    │
    │ no window hit
    ▼
Desktop icon hit test ──► Select / double-click to open
```

## Fonts

Two bitmap fonts are used, loaded from `.fnt` files via `PixelFontCanvas`:

- **ChiKareGo** — 16px line height, used for menu items, title bars, buttons (the "Chicago" equivalent)
- **Geneva9** — 12px line height, used for body text, icon labels, file content

Text is rendered by `PixelFontCanvas` onto a temporary canvas, then the pixels are read and transferred to `BitCanvas` via `fontAdapter.ts`. This preserves the existing font rendering pipeline while ensuring all output ends up in the 1-bit buffer.

## Sprites

Images are preloaded by `SpriteRegistry`, which:

1. Fetches the image
2. Draws it to an `OffscreenCanvas`
3. Reads the pixel data
4. Converts to 1-bit: alpha < 128 → transparent, average RGB < 128 → black, else → white
5. Stores as a `Sprite` object: `{ width, height, data: Uint8Array, mask: Uint8Array }`

Sprites support transparency via the `mask` array (1 = opaque, 0 = transparent).

## AI App Builder

The App Builder is a native app that lets users describe apps in natural language. The flow:

1. User types a prompt in the chat interface
2. The prompt is sent to `/api/generate-app` (a Vercel Edge Function)
3. The API route forwards to a configurable LLM endpoint (set `LLM_API_URL` and `LLM_API_KEY` env vars)
4. The LLM system prompt includes the full Mockintosh App API reference from `API_REFERENCE.ts`
5. Responses are **streamed** via Server-Sent Events — tokens appear in the chat as they arrive
6. The generated code is returned and can be previewed (spawned in a sandboxed Worker)
7. If the user clicks "Publish", the app is saved to OPFS and appears in the App Store

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
| `opfs-tools`                             | Origin Private File System access                    |
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
