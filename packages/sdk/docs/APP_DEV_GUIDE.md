# Mockintosh App Developer Guide

## Overview

Mockintosh is a 1-bit Macintosh simulator running in the browser. The entire UI is rendered on a single `<canvas>` element at **512×342 pixels** — every pixel is either **black** (`1`) or **white** (`0`). There are no colors, no gradients, no anti-aliasing.

Third-party apps are ES modules that export an `App` object and an optional `sprites` record. They are loaded at runtime by the Mockintosh OS via dynamic `import()`.

## Quick Start

```typescript
import {
  App,
  AppBuilder,
  AppContext,
  AppProps,
  BLACK,
  WHITE,
} from "@mockintosh/sdk";

const MyApp: App = {
  id: "myapp",
  title: "My App",
  icon: "myapp/icon",
  defaultSize: { width: 200, height: 150 },

  render(app: AppBuilder, ctx: AppContext, props: AppProps) {
    const [count, setCount] = app.useState(0);

    ctx.clear(WHITE);
    ctx.drawText(`Count: ${count}`, 10, 10, {
      font: "ChiKareGo",
      color: BLACK,
    });
    const win = ctx.getWindow();
    if (win) {
      // Create controls once with useRef, then DrawControls(win, ctx.port).
      // See examples/counter.ts for full pattern with NewControl + contrlAction.
    }
  },
};

export default MyApp;
```

## The Rendering Model

Apps render imperatively — there is no virtual DOM, no reconciliation. Every frame, the OS calls your `render()` function and you draw directly to an `AppContext`.

### AppContext (Drawing Surface)

`AppContext` is your scoped drawing surface, clipped to your window's content area. Coordinates are local: `(0,0)` is the top-left of your window content.

**Pixel operations:**

- `setPixel(x, y, color?)` — set a single pixel
- `getPixel(x, y)` — read a pixel value
- `clear(color?)` — fill entire area

**Lines:**

- `drawHLine(x, y, w, color?)` — horizontal line
- `drawVLine(x, y, h, color?)` — vertical line
- `drawDottedHLine(x, y, w, color?)` — dotted horizontal
- `drawDottedVLine(x, y, h, color?)` — dotted vertical

**Rectangles:**

- `drawRect(x, y, w, h, color?)` — outline
- `fillRect(x, y, w, h, color?)` — filled
- `fillPattern(x, y, w, h, pattern)` — fill with named pattern
- `invertRect(x, y, w, h)` — XOR invert pixels

**Sprites:**

- `blit(sprite, x, y)` — draw a sprite with transparency
- `blitInverted(sprite, x, y)` — draw inverted
- `blitShadowOutline(sprite, x, y)` — draw with shadow effect
- `blitImageData(imageData, x, y)` — draw raw ImageData

**Text:**

- `drawText(text, x, y, opts?)` — draw bitmap text
- `drawTextBlock(opts)` — word-wrapped text with viewport culling
- `measureTextBlock(text, maxWidth, font?, lineSpacing?)` — measure without drawing

**UI Components:**

- `getWindow()` — return the window record (or null). Use with **NewControl** + **DrawControls** for buttons: create controls once (e.g. in a useRef), set `contrlAction` for click handling, call `DrawControls(win, ctx.port)` each frame. See `examples/counter.ts` and docs/control-manager-migration.md.
- `drawTextInput(state, x, y, width, height?, options?)` — draw a text input field

**Hit Regions:**

- `hitRegion(id, rect, callbacks)` — register a clickable region

**Clipping:**

- `pushClip(x, y, w, h)` / `popClip()` — nested clipping regions

### Available Patterns

`"black"`, `"white"`, `"checkers"`, `"stripes"`, `"gray25"`, `"gray50"`, `"gray75"`, `"darkCheckers"`

### Available Fonts

- `"Geneva9"` — 9px proportional font (default, good for body text)
- `"ChiKareGo"` — larger bitmap font (good for titles/headings)

## AppBuilder (State Management)

`AppBuilder` provides React-like hooks for state management. **Hooks must be called in the same order every render** (same rules as React hooks).

### useState

```typescript
const [value, setValue] = app.useState(initialValue);
setValue(newValue); // direct set
setValue((prev) => prev + 1); // updater function
```

### useEffect

```typescript
app.useEffect(() => {
  // runs when deps change (or on mount if deps=[])
  return () => {
    /* cleanup */
  };
}, [dep1, dep2]);
```

### useMemo

```typescript
const expensive = app.useMemo(() => computeSomething(), [dep]);
```

### useRef

```typescript
const ref = app.useRef(initialValue);
ref.current = newValue; // doesn't trigger re-render
```

### scheduleRender

```typescript
app.scheduleRender(); // request a re-render on next animation frame
```

## AppProps (OS Services)

Third-party apps receive typed `AppProps` instead of raw OS internals.

### Sprites

```typescript
const icon = props.getSprite("myapp/icon");
if (icon) ctx.blit(icon, 10, 10);

// OS sprites are also available
const folder = props.getSprite("icon/folder");
```

### Storage

```typescript
const data = await props.storage.read("settings");
await props.storage.write("settings", JSON.stringify({ theme: "dark" }));
const keys = await props.storage.list();
```

### OS Services

```typescript
props.os.openWindow("some-app-id");
props.os.closeWindow(windowId);
const result = await props.os.showDialog({
  message: "Are you sure?",
  buttons: ["Cancel", "OK"],
});
```

### Gated Capabilities (require permissions)

These are only available if declared in `mockintosh.json`:

```typescript
// "network" permission
const resp = await props.fetch!("https://api.example.com/data");
props.openPopup!("https://example.com/auth", { width: 400, height: 600 });
const unsub = props.onPopupMessage!((data) => console.log(data));

// "script" permission
await props.loadScript!("https://cdn.example.com/library.js");
const lib = props.getGlobal!("LibraryName");
```

### Environment

```typescript
const origin = props.env.origin; // e.g., "https://mockintosh.com"
```

## Sprites

Apps own their sprites. Export a `sprites` record alongside your default app export:

```typescript
import { Sprite, defineSprite, fromGrid } from "@mockintosh/sdk";

const ICON = defineSprite(32, 32, "base64encodeddata...");

const PLAY = fromGrid(16, 16, [
  "................",
  "..##............",
  "..####..........",
  "..######........",
  "..########......",
  "..##########....",
  "..########......",
  "..######........",
  "..####..........",
  "..##............",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
]);

export const sprites: Record<string, Sprite> = {
  "myapp/icon": ICON,
  "myapp/play": PLAY,
};
```

**Naming convention:** Use your app ID as prefix: `"myapp/icon"`, `"myapp/play"`. OS sprites use category prefixes: `"icon/"`, `"cursor/"`, `"ui/"`.

### defineSprite(width, height, base64)

Decode a base64-encoded 2bpp sprite. Pixel encoding: `00`=transparent, `01`=white, `10`=black.

### fromGrid(width, height, rows)

Create a sprite from ASCII art:

- `#` = black (opaque)
- `.` = transparent
- ` ` (space) = white (opaque)

## Event Handling

Implement `onEvent` on your app to handle user input:

```typescript
onEvent(app: AppBuilder, event: OSEvent, props: AppProps, size: WindowSize) {
  if (event.type === "mouseDown") {
    // event.x, event.y are in window-local coordinates
  }
  if (event.type === "keyDown") {
    // event.key, event.code, event.shiftKey, etc.
  }
  if (event.type === "scroll") {
    // event.deltaY
  }
}
```

## Menubars

Apps can define their own menubar items:

```typescript
getMenubar(app: AppBuilder, props: AppProps): MenubarDefinition[] {
  return [
    {
      label: "File",
      items: [
        { label: "New", shortcut: "⌘N", onClick: () => { ... } },
        { type: "separator" },
        { label: "Save", shortcut: "⌘S", onClick: () => { ... } },
      ],
    },
    {
      label: "Edit",
      items: [
        { label: "Undo", shortcut: "⌘Z", disabled: true },
      ],
    },
  ];
}
```

## Scrollable Content

There are two scrolling patterns. Choose based on what scrolls.

### Full-window scrolling

Use this when the entire content area of the window scrolls (e.g., a list, a document viewer). Set `scrollable: true` and implement `getContentHeight`. The OS renders the scrollbar in the window chrome and offsets the entire `AppContext`.

```typescript
const MyApp: App = {
  scrollable: true,
  resizable: true,
  minSize: { width: 150, height: 100 },

  getContentHeight(app, props, size) {
    return items.length * ITEM_HEIGHT + HEADER_HEIGHT;
  },

  render(app, ctx, props) {
    // Draw as if starting at (0,0) with unlimited height.
    // The OS clips and offsets automatically.
    // ctx.scrollY gives the current scroll offset if you need it.
  },
};
```

### Fixed strip above the scrollbar (content top inset)

For a window with a **fixed toolbar or header** at the top and scrollable content below (e.g. a browser URL bar), use the content top inset pattern so the **window** scrollbar sits alongside only the scrollable region (classic Mac behaviour). Implement optional `getContentTopInset(app, props, size)` returning the height of the fixed strip in pixels. Set `scrollable: true` and implement `getContentHeight` to return only the **scrollable** content height (the part below the strip). In `render`, draw the fixed strip in the main context, then call `ctx.drawScrollableContent((scrollCtx) => { ... })` and draw the scrollable content inside the callback. Mouse events include `contentRegion: "fixed" | "scrollable"` when the window has an inset; use it to tell clicks in the strip from clicks in the scrollable area. In the scrollable region, `event.y` is in scrollable-content space (0 = top of scrollable content). `WindowSize` may include `contentTopInset`, `scrollY`, and `scrollX` for coordinate conversion.

### Partial scrolling with ScrollArea

Use `ctx.scrollArea()` when only **part** of the window scrolls — for example, a chat message list with a fixed input bar at the bottom, or a panel with a fixed header and scrollable body.

The app owns the scroll state (via `useState`). The `ScrollArea` handles clipping, the classic Mac scrollbar, and all interaction (wheel, arrows, thumb drag).

```typescript
const MyApp: App = {
  // Note: scrollable is false (or omitted) — the window chrome has no scrollbar

  render(app, ctx, props) {
    const [scrollOffset, setScrollOffset] = app.useState(0);

    const FIXED_BAR_HEIGHT = 30;
    const scrollableH = ctx.height - FIXED_BAR_HEIGHT;
    const totalContentHeight = items.length * ITEM_HEIGHT;

    ctx.scrollArea(
      "my-list",
      { x: 0, y: 0, w: ctx.width, h: scrollableH },
      {
        contentHeight: totalContentHeight,
        scrollOffset,
        onScroll: setScrollOffset,
      },
      (scrollCtx) => {
        // scrollCtx is clipped and offset — draw content starting at (0,0).
        // Available width is ctx.width - 15 (scrollbar takes 15px on the right).
        for (let i = 0; i < items.length; i++) {
          scrollCtx.drawText(items[i], 4, i * ITEM_HEIGHT, { font: "Geneva9" });
        }
      }
    );

    // This draws below the scroll area, fixed in place
    ctx.drawHLine(0, scrollableH, ctx.width, BLACK);
    // Use ctx.getWindow() and NewControl + DrawControls for buttons (see counter example).
  },
};
```

To programmatically scroll (e.g., auto-scroll to bottom when new content arrives), update the `scrollOffset` state directly:

```typescript
// Scroll to bottom after adding a new message
const newContentHeight = computeNewHeight();
setScrollOffset(Math.max(0, newContentHeight - visibleHeight));
```

## The Manifest: mockintosh.json

Every app repo needs a `mockintosh.json` manifest:

```json
{
  "id": "myapp",
  "title": "My App",
  "description": "A brief description of what the app does",
  "icon": "myapp/icon",
  "author": "your-github-username",
  "version": "1.0.0",
  "sdk": "^1.0.0",
  "permissions": [],
  "entry": "./dist/index.js"
}
```

**Permissions:**

- `"network"` — enables `props.fetch`, `props.openPopup`, `props.onPopupMessage`
- `"script"` — enables `props.loadScript`, `props.getGlobal`

## Building Your App

Apps are built as ES modules with the SDK externalized:

```typescript
// vite.config.ts
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: ["@mockintosh/sdk"],
    },
  },
});
```

The output is a single `dist/index.js` that exports:

- `default` — your `App` object
- `sprites` — your sprite definitions (optional)

## Common Patterns

### Async data loading

```typescript
render(app, ctx, props) {
  const [data, setData] = app.useState<string | null>(null);
  const [loading, setLoading] = app.useState(true);

  app.useEffect(() => {
    props.fetch!("https://api.example.com/data")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  ctx.clear();
  if (loading) {
    ctx.drawText("Loading...", 10, 10);
    return;
  }
  ctx.drawText(data ?? "No data", 10, 10);
}
```

### Scrollable list

```typescript
const ITEM_H = 20;
render(app, ctx, props) {
  const [items] = app.useState(["Item 1", "Item 2", "Item 3"]);
  ctx.clear();
  for (let i = 0; i < items.length; i++) {
    const y = i * ITEM_H;
    ctx.drawText(items[i], 4, y + 4);
    ctx.drawHLine(0, y + ITEM_H - 1, ctx.width);
  }
}
```

### Text input

```typescript
import { TextInputState } from "@mockintosh/sdk";

render(app, ctx, props) {
  const [input] = app.useState<TextInputState>({
    value: "", cursor: 0, selectionStart: null,
    scrollOffset: 0, focused: true,
  });

  ctx.clear();
  ctx.drawTextInput(input, 10, 10, 180, 16, {
    id: "my-input",
    onChange: () => app.scheduleRender(),
  });
}
```

## Constraints

- **512×342 pixels** — the entire screen. Your window will be smaller.
- **1-bit only** — every pixel is black or white.
- **No DOM access** — don't use `document.*` or `window.*` directly.
- **No direct fetch** — use `props.fetch` (requires `"network"` permission).
- **No localStorage** — use `props.storage`.
- **Hooks order** — same rules as React: call hooks in the same order every render.
- **Synchronous render** — `render()` must be synchronous. Use `useEffect` for async work.
