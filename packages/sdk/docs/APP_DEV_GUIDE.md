# Mockintosh App Developer Guide

## Overview

Mockintosh is a Macintosh-style simulator running in the browser. The entire UI is rendered on a single `<canvas>` element at **512×342 pixels** into a **1-bit** framebuffer (packed 8 pixels per byte, as on the original Macintosh): black, white, and dither patterns. There is no HTML/CSS inside the simulated screen.

**SDK v2 is Solid-only.** Third-party apps are ES modules that `defineApp({ Component })` and optionally export `sprites`. They are loaded at runtime via dynamic `import()`. The OS shares one Solid runtime; externalize `solid-js`, `solid-js/store`, `@mockintosh/ui`, and `@mockintosh/sdk` in your Vite build and consume them through the OS import map.

v1 `App.render` / `WindowContext` apps are not loaded. The App Store hides catalog entries with `sdk` major &lt; 2.

**SDK 2.1:** `<raster onPaint>` now receives a single `RasterSurface` argument instead of `(port, rect)`, and the framebuffer is packed 1 bpp — apps that indexed `port.portBits.baseAddr` directly must switch to `surface.setPixel` / `surface.blitPixels` (see below).

## Bundled apps

These ship with the OS. SDK-clean apps compile under the in-OS project compiler and are written against the public SDK exactly like a third-party app. Shell apps are part of the OS and use internal services.

| App | Source | Kind |
|---|---|---|
| MacPaint | `MacPaint.tsx` | SDK-clean |
| Safari | `Safari.tsx` | SDK-clean |
| Testing | `Testing.tsx` | SDK-clean |
| File | `FileViewer.tsx` | SDK-clean |
| Picture | `Picture.tsx` | SDK-clean |
| Video Player | `VideoPlayer.tsx` | SDK-clean |
| Photo Booth | `PhotoBooth.tsx` | SDK-clean |
| Source Editor | `SourceEditor.tsx` | SDK-clean |
| Terminal | `Terminal.tsx` | SDK-clean |
| ChatGippity | `ChatGippity.tsx` | SDK-clean |
| Spotify | `SpotifyPlayer.tsx` | SDK-clean |
| Finder | `Finder.solid.tsx` | Shell |
| App Store | `AppStore.tsx` | Shell |
| Icon Gallery | `IconGallery.tsx` | Shell |

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

JSX compiles through `@mockintosh/ui` (universal Solid renderer) into a retained `box` / `text` / `image` / `raster` / `bitmap` tree. The OS layouts that tree with flexbox and paints it through QuickDraw into the framebuffer.

```tsx
<box padding={8} flexDirection="column" gap={6} background={0}>
  <text font="menu">Hello</text>
  <image width={32} height={32} src={icon} />
  <bitmap width={80} height={40} pixels={buffer} />
  <raster width={80} height={40} onPaint={({ rect, setPixel }) => { /* pixel push */ }} />
</box>
```

**`<image>`** is a finished sprite asset. **`<bitmap>`** is a live unpacked pixel buffer you own (`Uint8Array`, `0` = white, nonzero = black, `width` bytes per row — not a QuickDraw `BitMap`). Replacing the array (typically `setPixels(new Uint8Array(old))`) is what redraws; there is no `onPaint` and no `revision`. Put `onMouseDown` / `onDrag` on the `<bitmap>` to ink it. Size the buffer smaller than the window if you also have chrome (buttons) in the same column.

```tsx
const [pixels, setPixels] = createSignal(new Uint8Array(80 * 40));
<bitmap
  width={80}
  height={40}
  pixels={pixels()}
  onMouseDown={(x, y) => {
    const next = new Uint8Array(pixels());
    next[y * 80 + x] = 1;
    setPixels(next);
  }}
/>
```

Use `<raster onPaint>` when the pixels come from somewhere Solid cannot see (dithered photos, video frames). The callback receives a `RasterSurface`:

```tsx
<raster width={w} height={h} onPaint={(surface) => {
  surface.fill(WHITE);                          // whole raster
  surface.setPixel(x, y, BLACK);                // raster-local coordinates, clipped
  surface.blitPixels(pixels, imgW, imgH, 0, 0); // 1 byte per pixel, 0 = white, non-zero = black
  // surface.port is the QuickDraw port (already clipped to the raster);
  // offset QuickDraw coordinates by surface.rect.x / surface.rect.y.
}} />
```

`onPaint` runs at paint time, outside any reactive scope, so reading a signal inside it does not schedule a repaint. When the pixels come from somewhere else (a camera, a decoder, a timer), bump `revision` from a signal: `<raster revision={frame()} onPaint={…} />` redraws whenever `frame` changes.

Never index the framebuffer yourself: its memory layout (packed 1 bpp) is an implementation detail of the platform.

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

### Ink

The screen is 1-bit. Every colour prop (`background`, `color`, `borderColor`) takes an `Ink`: `WHITE` (`0`) or `BLACK` (`1`). Anything in between is a dither — use a `PatternName` (`"gray50"`, `"checker"`, …) for `background`.

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
      <Button label="Paint" onClick={() => app.os.openApp("macpaint")} />
    </box>
  );
}
```

### About boxes

The first Apple-menu item is always the frontmost app's: "About My App…" while your window is active, "About This Macintosh…" when the Finder is. You do not add it yourself. By default it opens a standard OS About box with your icon and title; declare `about` on `defineApp` to add a version and description, or supply your own component:

```tsx
export default defineApp({
  id: "myapp",
  title: "My App",
  icon: "myapp/icon",
  about: { version: "1.2", description: "Draws things, in one bit." },
  // or: about: { Component: MyAboutBox, size: { width: 300, height: 140 } },
  // …
});
```

- `getSprite(name)` — OS sprites plus your exported `sprites`
- `storage.read/write/remove/list` — per-app key-value storage (see [Storage](#storage))
- `fs` — the shared file system (see [Files](#files))
- `window` — the window this component is in (see [Windows](#windows))
- `openWindow(spec?)` — open another window of your app (see [Windows](#windows))
- `os.openApp / closeWindow / showDialog`
- `setMenus(menus)` — this window's menubar (see [Menus](#menus))
- `fetch` — network access, when this Macintosh has it (see [Capabilities](#capabilities))
- `print` — the system printer, when the platform has one (see [Printing](#printing))
- `images` / `video` / `camera` — decode rasters, play video, or open a camera (see [Capabilities](#capabilities))
- `scheduler` — `requestFrame` / `now` (no `requestAnimationFrame` / `performance`)
- `capabilities` — the set of things this Macintosh can do (see [Capabilities](#capabilities))
- `env.origin` / `env.config` — host origin and configuration (`SPOTIFY_CLIENT_ID`, …)
- `crypto.randomBytes` / `crypto.sha256`
- `browser` — `openExternal`, `authorize`, `loadScript`, when this Macintosh runs in a browser

`useApp()` reads a per-window context, so call it during component setup (not in a callback created elsewhere).

## Capabilities

Mockintosh runs in more than one place — a browser today, small devices with a 1-bit panel tomorrow — and not every machine has every peripheral. A `Capability` names one such thing:

| Capability  | Means                                                                 |
|-------------|-----------------------------------------------------------------------|
| `network`   | `useApp().fetch` is available                                         |
| `clipboard` | copy and paste work                                                   |
| `printer`   | `useApp().print` is available                                         |
| `camera`    | `useApp().camera` is available                                        |
| `video`     | `useApp().video` is available                                         |
| `images`    | `useApp().images` is available                                        |
| `browser`   | `useApp().browser` is available (`openExternal`, `authorize`, `loadScript`) |

Two ways to use them:

- **`requires`** — for things your app cannot work without. Put them on `defineApp` (and in the manifest, so the OS need not even load a bundle it cannot run). The OS refuses to launch the app and tells the user why: *"Snapshot" needs a camera, which this Macintosh does not have.*

  ```tsx
  export default defineApp({ id: "snapshot", requires: ["camera"], /* … */ });
  ```

- **`useApp().capabilities`** — for features your app can do without. Check at the point of use and degrade gracefully:

  ```tsx
  const { capabilities, fetch } = useApp();
  <Show when={capabilities.has("network")} fallback={<text>Offline</text>}>
    <Button label="Refresh" onClick={() => fetch!("/api/feed")} />
  </Show>
  ```

`fetch` has the portable signature `(url, { method?, headers?, body? }) => Promise<{ ok, status, headers, text(), json(), arrayBuffer() }>` — the browser's `fetch` satisfies it, and so will a device's HTTP client. Stay within that subset.

## Storage

`useApp().storage` is a string key/value store private to your app. Each key is a file in `System Folder/Preferences/<your app id>/`, so users can inspect and delete your data from the Finder.

```tsx
const app = useApp();
const saved = await app.storage.read("settings.json");
await app.storage.write("settings.json", JSON.stringify({ volume: 7 }));
await app.storage.remove("settings.json");
```

## Files

`useApp().fs` is the user's file system — the same one the Finder shows. Catalog reads are reactive (call them inside `createMemo`/`createEffect` and they re-run when that folder changes); bodies are read with `readText`/`readBytes`/`readJSON`.

```tsx
import { useApp, MIME, createMemo, For } from "@mockintosh/sdk";

function DesktopList() {
  const { fs } = useApp();
  // Find folders by role, never by name — the user may have renamed them.
  const desktop = () => fs.locate("desktop");
  const files = createMemo(() => (desktop() ? fs.children(desktop()!.id) : []));
  return <For each={files()}>{(n) => <text font="body">{n.name}</text>}</For>;
}

async function saveNote(fs: AppFileSystem, text: string) {
  const desktop = fs.locate("desktop")!;
  await fs.writeFile(desktop.id, "Note.txt", text, { type: MIME.text });
}
```

Files have one MIME `type` (`MIME.text`, `MIME.markdown`, `MIME.sprite`, …; `inferMimeType(name)` guesses from an extension). Mutations throw `FSError` (`isFSError(err, "exists")`) on name clashes and invalid moves — show the message in a dialog rather than swallowing it.

`<Markdown text={src} />` (and `parseMarkdown`) render markdown through the 1-bit layout tree. Import them from `@mockintosh/sdk`, not `@mockintosh/markdown`.

### Opening documents

Declare the types your app can open and the Finder will launch it on double-click, merging `FileDocumentProps` (`fileId`, `title`) into your props:

```tsx
export default defineApp<FileDocumentProps>({
  id: "notes",
  fileTypes: [MIME.text, MIME.markdown],
  Component(props) {
    const { fs } = useApp();
    const [text, setText] = createSignal("");
    onMount(async () => setText((await fs.readText(props.fileId)) ?? ""));
    return <text font="body">{text()}</text>;
  },
  // …
});
```

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

Prefix names with your app id (`"myapp/icon"`). OS sprites use `"icon/"` and `"chrome/"`.

Sprites are also a file type — `image/x-mockintosh-sprite`, `MIME.sprite` — which is how an app keeps a picture in the user's file system (PhotoBooth saves photos this way; Picture opens them). `readSpriteFile(fs, fileId)` decodes one; `writeSpriteFile(fs, parentId, name, sprite, { attributes })` writes one, optionally with a Finder `icon` attribute:

```tsx
const { fs } = useApp();
const desktop = fs.locate("desktop");
if (desktop) await writeSpriteFile(fs, desktop.id, "Photo", sprite, { attributes: { icon: "myapp/photo-icon" } });
```

## Printing

`useApp().print` is the system thermal printer. It is `undefined` on platforms that cannot reach one, so wrap printing UI in `<Show when={print}>`. Connecting prompts the user (a USB device picker on the web), so trigger it from a click.

```tsx
const { print } = useApp();

<Show when={print}>
  <Button label="Print" onClick={() => print!.printPicture(image, { caption: "Hello" })} />
</Show>
```

- `printPicture(image, { caption?, scale? })` — a 1-bit image (`{ width, height, data }`, 1 byte per pixel, `1` = black; a `Sprite` works) printed as a polaroid-style card, enlarged and centred with the caption beneath.
- `printPage(height, (port, size) => …)` — draw a page yourself with QuickDraw; `port` is `paperWidth` dots wide.
- `connected()` — reactive; `connect()` — connect without printing.
- `paperWidth` — dots per line (576 on 80 mm paper).

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

## Windows

By default, opening your app opens one window — its *main window* — with `Component` inside, sized by `defaultSize`, of kind `windowKind` (a `document` unless you say otherwise), with `scrollable`, `resizable` and `minSize` as declared on `defineApp`.

`useApp().window` is the window your component is mounted in. `width()` and `height()` are the content size (reactive accessors — read them in JSX or effects), `isActive()` is whether it is frontmost, `scrollY()` the content scroll offset, `kind()` its current kind; `setTitle(title)` renames it, `setFullScreen(on)` takes it full screen and back, and `close()` closes it. A component that fills its window is:

```tsx
const { window: win } = useApp();
return <box width={win.width()} height={win.height()} flexDirection="column">…</box>;
```

### Window kinds

Like the Macintosh's `NewWindow`, you choose what kind of window you get:

| Kind         | Looks like                                                                 |
|--------------|----------------------------------------------------------------------------|
| `document`   | title bar with close and zoom boxes; grow box / scroll bars when `resizable` / `scrollable` |
| `dialog`     | title bar with a close box, fixed size                                     |
| `utility`    | like `dialog`, but floats above document windows (tool palettes)           |
| `plain`      | a bare 1px frame, no title bar, cannot be moved                            |
| `alert`      | `plain` and system-modal: nothing else takes input until it closes         |
| `fullscreen` | no chrome at all — the whole screen, menubar included (see below)          |

### Deciding what opening does: `onOpen`

Opening a window is your decision, not the OS's. `onOpen` is your app's `main`: the OS calls it when the user opens your app (`props` is `{}`) or one of your documents (`props` is `FileDocumentProps`). Without it, the OS opens the main window. With it, you open whatever you like through `app.openWindow(spec)` — or nothing:

```tsx
export default defineApp({
  id: "slides",
  title: "Slides",
  icon: "slides/icon",
  defaultSize: { width: 300, height: 200 },
  Component: Editor,
  onOpen(app, props) {
    if (props.fileId) {
      app.openWindow({ kind: "fullscreen", Component: Show, props });   // present it
    } else {
      app.openWindow({ props });                                         // the main window
    }
  },
});
```

`onOpen` receives an `AppContext`: everything `useApp()` has except `window` and `setMenus`, since there is no window yet. It runs outside any component — open windows and dialogs there; keep signals and effects inside components.

`openWindow(spec)` takes a `WindowSpec` whose every field is optional and defaults to your `defineApp`: `kind`, `title`, `size` (content pixels), `position`, `scrollable`, `resizable`, `minSize`, `Component` (a different component for this window — a preferences dialog, a palette) and `props`. It returns the window id, which `os.closeWindow` accepts. `openWindow()` with no argument is the main window.

### Full screen

A `fullscreen` window is the Macintosh "special presentation mode": your content covers the whole 512×342 screen and the menubar is not drawn. Two ways in — open a window as `kind: "fullscreen"`, or switch an existing window with `window.setFullScreen(true)`, which keeps your component mounted (camera streams, state, all of it) and remembers the windowed kind and bounds for `setFullScreen(false)`. A window that was *opened* full screen has nothing to go back to; close it instead.

The user must be able to leave (Human Interface Guidelines). Your menus stay live while the menubar is hidden, so a ⌘ shortcut still works; a visible "Menu Bar" button on screen is the other half. Photo Booth does both:

```tsx
const { window: win } = useApp();
const isFullScreen = () => win.kind() === "fullscreen";
createEffect(() => {
  app.setMenus([{ label: "View", items: [
    { label: isFullScreen() ? "Exit Full Screen" : "Full Screen", shortcut: "F",
      onClick: () => win.setFullScreen(!isFullScreen()) },
  ]}]);
});
// …and in the JSX:
<Show when={isFullScreen()}><Button label="Menu Bar" onClick={() => win.setFullScreen(false)} /></Show>
```

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
  "requires": ["network"],
  "entry": "./dist/index.js"
}
```

**Requires:** the capabilities the app cannot run without (see [Capabilities](#capabilities)); the OS skips loading the bundle on a machine that lacks any of them. Omit it if your app runs anywhere.

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

Installing from the App Store writes the manifest to `Applications/<title>` as a `MIME.app` file; opening it launches the app and trashing it uninstalls.

## Constraints

- **512×342 pixels** — the entire screen. Your window is smaller, unless it is `fullscreen`.
- **Indexed pixels** — `BLACK`/`WHITE` are safest.
- **No DOM UI** — do not render HTML into the screen. Decode images, video, and camera frames through `useApp().images` / `video` / `camera`.
- **No browser globals** — `alert`, `confirm`, `prompt`, `document`, `localStorage`, `sessionStorage`, and `fetch` are not in the project type environment and fail the compile. Use `useApp().os.showDialog`, `useApp().storage`, `useApp().fs`, and `useApp().fetch`. Import file-system types and `MIME` from `@mockintosh/sdk`, not `@mockintosh/fs`. Anything else you need from the host is a [capability](#capabilities): declare it in `requires` or check it at the point of use.
- `createUI` is a single-instance renderer inside the OS; third-party apps share that runtime via the import map.


## Semantic controls and live operation (M1)

Give controls stable developer names so Terminal and external tools can inspect and operate them through normal input dispatch:

```tsx
<Button name="save" label="Save" onClick={save} disabled={!canSave()} />
<Checkbox name="enabled" label="Enabled" checked={enabled()} onChange={setEnabled} />
<TextInput name="document-title" value={title()} onChange={setTitle} />
<box semantic={{ name: "preview", role: "preview" }} width={64} height={64} />
```

Names are optional and scoped by the containing OS window. Duplicate names require a window scope or numeric node id. Snapshots expose detached lifetime ids, role, text/value, enabled/focused state, clipped bounds, and supported actions. `password` TextInputs mask values and aggregate text. Removed or replaced nodes invalidate their references; reload also invalidates the boot selection. An inactive window must be explicitly activated before a semantic click. A field must be focused before `type`.

These metadata fields do not grant kernel privileges to third-party apps. OS-owned Terminal and Control Panel use internal services; ordinary app code continues to use the SDK. The host's `BootedOS.kernel` validates requests against the registered trap contracts (`kernel.describe()`). See [M1 operation guide](../../../docs/m1-operation.md) for live MCP/CLI setup, session lifetimes, shell syntax, and error semantics.

## Editable project builds and instance cleanup

Source Editor and the M2 project operations can compile SDK 2 source into an artifact loaded by the host. In the browser, Build & Run uses a local compiler worker without companion setup. A paired companion can optionally supply remote compilation through the same build-provider contract. Keep imports to the supported shared SDK/UI/Solid modules and relative project source modules. The OS shares one reactive runtime with installed apps. Compile errors preserve the working app; restart resets its instance and Restore selects the previous artifact without changing newer source.

For resources created outside a component, register cleanup through `app.onCleanup?.(() => clearInterval(timer))` in `onOpen`. Solid computations created during `onOpen` also have an owned root. To keep an instance alive after its last window closes, explicitly call `const release = app.keepAlive?.()` and call `release?.()` when that work finishes. Component `onCleanup` continues to handle component-owned resources. These lifetimes are local and cooperative; they do not create durable server jobs or preempt infinite loops.
