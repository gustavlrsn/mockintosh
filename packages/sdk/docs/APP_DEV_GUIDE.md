# Mockintosh App Developer Guide

## Overview

Mockintosh is a Macintosh-style simulator running in the browser. The entire UI is rendered on a single `<canvas>` element at **512×342 pixels** using an indexed pixel buffer. The OS can run in either **`monochrome`** or **`colors`** mode. There is no HTML/CSS inside the simulated screen.

**SDK v2 is Solid-only.** Third-party apps are ES modules that `defineApp({ Component })` and optionally export `sprites`. They are loaded at runtime via dynamic `import()`. The OS shares one Solid runtime; externalize `solid-js`, `solid-js/store`, `@mockintosh/ui`, and `@mockintosh/sdk` in your Vite build and consume them through the OS import map.

v1 `App.render` / `WindowContext` apps are not loaded. The App Store hides catalog entries with `sdk` major &lt; 2.

## Quick Start

```tsx
import { defineApp, Button, createSignal } from "@mockintosh/sdk";

export default defineApp({
  id: "myapp",
  title: "My App",
  icon: "myapp/icon",
  defaultSize: { width: 200, height: 150 },
  Component() {
    const [count, setCount] = createSignal(0);
    return (
      <box padding={8} flexDirection="column" gap={8} background={0}>
        <text font="menu">{`Count: ${count()}`}</text>
        <Button label="+1" onClick={() => setCount((c) => c + 1)} />
      </box>
    );
  },
});
```

## The Rendering Model

JSX compiles through `@mockintosh/ui` (universal Solid renderer) into a retained `box` / `text` / `image` / `raster` tree. The OS layouts that tree with flexbox and paints it through QuickDraw into the indexed buffer.

```tsx
<box padding={8} flexDirection="column" gap={6} background={0}>
  <text font="menu">Hello</text>
  <image width={32} height={32} src={icon} />
  <raster width={80} height={40} onPaint={(port, rect) => { /* pixel push */ }} />
</box>
```

Use `<raster onPaint>` when you need to write pixels directly (dithered photos, Decker cards, video frames).

### Layout

Layout is flexbox with the same defaults as CSS/Yoga: `flexDirection="column"`, `alignItems="stretch"`. A child with no explicit cross-axis size fills its parent, so `<text align="center">` centers within the parent without any manual width. Use `alignSelf`, an explicit `width`/`height`, or a `row` container to opt out. Prefer `flexGrow`, `gap`, `padding`, `justifyContent`, and `alignItems` over `position="absolute"` — reserve absolute placement for overlays and pixel-exact chrome.

Borders follow the CSS box model: `borderWidth` insets the padding box, so children (flow *and* absolute — `left={0}` means "just inside the border") are laid out inside it and never sit on top of it. `overflow="hidden"` / `"scroll"` clip children to the inside of the border. A bordered panel therefore keeps its border no matter what you put in it — you don't need to pad by hand.

```tsx
<box padding={8} gap={6}>
  <text font="menu" align="center">Centered heading</text>   {/* stretched to parent */}
  <Button label="OK" onClick={ok} />                          {/* content-sized */}
  <Button label="Wide" alignSelf="stretch" onClick={ok} />    {/* fills the column */}
</box>
```

### Color Indices and Device Mode

- `WHITE` = `0`
- `BLACK` = `1`
- Named palette exports (`RED`, `GREEN`, …) map to the default system palette

`colors` mode resolves indices through the RGB palette; `monochrome` approximates them as black/white or dither.

### Fonts

- `"body"` — general UI text
- `"menu"` — titles and control labels
- `"mono"` — fixed-width content

`measureText(text, font?)` is re-exported from `@mockintosh/ui`.

### Text alignment

Two different things are called "alignment"; keep them apart:

- **Where the `<text>` node sits in its parent** is flexbox: `alignSelf`, `alignItems`, `justifyContent`.
- **Where the glyphs sit inside the node's own box** is the text's job: `align` (`left` | `center` | `right`, per line — CSS `text-align`) and `verticalAlign` (`top` | `middle` | `bottom`, for the whole line block).

`wrap` word-wraps to the node's content width (padding respected); `\n` always breaks. `align` applies to each wrapped line, so `align="right" wrap` right-aligns a paragraph.

```tsx
<text width={200} height={40} align="center" verticalAlign="middle" font="menu">
  Centered both ways
</text>
<text wrap align="right" font="body">
  A paragraph whose every line hugs the right edge.
</text>
```

### Pointer events

A press goes to the topmost node under the cursor that has a mouse handler; there is no bubbling. The node that received `onMouseDown` keeps `onDragStart` / `onDrag` / `onDragEnd` / `onMouseUp` until release, and gets `onClick` if released over itself. Start visual drag feedback (rubber bands, ghosts) in `onDragStart`, not `onMouseDown` — a plain click never reaches `onDragStart`.

`onMouseDownCapture` is the exception to "no bubbling": it runs on every *ancestor* of the hit node, outermost first, before the target's `onMouseDown`. Calling `event.preventDefault()` swallows the press and everything that would follow it. Use it when a container must decide before its children react (a disabled overlay, a "click to activate" surface).

Window activation is handled for you: the first click on an inactive window brings it to the front and is *not* delivered to your content, so you never need to track focus or call anything to come forward.

## useApp() (OS Services)

```tsx
import { useApp } from "@mockintosh/sdk";

function MyView() {
  const app = useApp();
  const icon = app.getSprite("myapp/icon");
  return (
    <box padding={8}>
      <Button label="About" onClick={() => app.os.openWindow("about")} />
    </box>
  );
}
```

- `getSprite(name)` — OS sprites plus your exported `sprites`
- `storage.read/write/list` — namespaced key-value storage
- `os.openWindow / closeWindow / showDialog`
- `setMenus(menus)` — this window's menubar (see [Menus](#menus))
- `fetch` — only if the manifest declares `"network"`
- `env.origin`

`useApp()` reads a per-window context, so call it during component setup (not in a callback created elsewhere).

## Sprites

Export a `sprites` record beside your default app:

```tsx
import { fromGrid, type Sprite } from "@mockintosh/sdk";

export const sprites: Record<string, Sprite> = {
  "myapp/icon": fromGrid(32, 32, [
    "................................",
    "..############################..",
    // ...
  ]),
};
```

Prefix names with your app id (`"myapp/icon"`). OS sprites use `"icon/"`, `"cursor/"`, `"chrome/"`.

## Menus

The menubar always shows the menus of the *active app* — the app that owns the front window. Your menus appear when one of your windows is active and disappear when the user switches away; you never manage that. ⌘ shortcuts declared on items are bound automatically while your menus are showing.

There are two levels:

- **App-level** — `menus` on `defineApp`. Declared once, shown for every window of your app. Use it for menus that don't depend on component state.
- **Window-level** — `useApp().setMenus(menus)` from inside your component. Replaces the app-level menus while *that* window is active, so items can close over the window's own signals. Call it from `createEffect` so `disabled` flags and radio values track state.

```tsx
import { defineApp, useApp, createSignal, createEffect } from "@mockintosh/sdk";

export default defineApp({
  id: "counter",
  title: "Counter",
  icon: "counter/icon",
  defaultSize: { width: 140, height: 100 },
  menus: [{ label: "Help", items: [{ label: "Counter Help", disabled: true }] }],
  Component() {
    const app = useApp();
    const [count, setCount] = createSignal(0);
    const [step, setStep] = createSignal(1);

    createEffect(() => {
      app.setMenus([
        {
          label: "Counter",
          items: [
            { label: "Reset", shortcut: "R", disabled: count() === 0, onClick: () => setCount(0) },
            { type: "separator" },
            {
              type: "radiogroup",
              value: String(step()),
              onValueChange: (v) => setStep(Number(v)),
              items: [
                { label: "Step by 1", value: "1" },
                { label: "Step by 10", value: "10" },
              ],
            },
          ],
        },
      ]);
    });
    // ...
  },
});
```

Item types (`MenubarItemDef`): an action `{ label, shortcut?, disabled?, onClick? }`, a `{ type: "separator" }`, or a `{ type: "radiogroup", value, onValueChange, items }`. The Apple menu is the OS's; you can't add to it.

## Window chrome

Third-party apps live inside a standard document window. Set `scrollable`, `resizable`, and `minSize` on `defineApp`.

## The Manifest: mockintosh.json

```json
{
  "id": "myapp",
  "title": "My App",
  "description": "A brief description",
  "icon": "myapp/icon",
  "author": "your-github-username",
  "version": "1.0.0",
  "sdk": "^2.0.0",
  "permissions": [],
  "entry": "./dist/index.js"
}
```

**Permissions:**

- `"network"` — enables `useApp().fetch`

## Building Your App

```ts
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [
    solid({
      solid: {
        generate: "universal",
        moduleName: "@mockintosh/ui/renderer",
      },
    }),
  ],
  build: {
    lib: { entry: "src/index.tsx", formats: ["es"], fileName: "index" },
    rollupOptions: {
      external: ["@mockintosh/sdk", "@mockintosh/ui", "solid-js", "solid-js/store"],
    },
  },
});
```

The bundle's default export is the `defineApp({...})` object. Optional named export: `sprites`.

## Constraints

- **512×342 pixels** — the entire screen. Your window is smaller.
- **Indexed pixels** — `BLACK`/`WHITE` are safest.
- **No DOM UI** — hidden `<video>`/`<audio>` for media is fine; do not render HTML into the screen.
- **No direct fetch / localStorage** — use `useApp().fetch` and `useApp().storage`.
- `createUI` is a single-instance renderer inside the OS; third-party apps share that runtime via the import map.
