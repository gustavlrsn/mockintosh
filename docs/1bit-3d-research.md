# Adding 3D without a GPU, and without leaving 1-bit

Research date: 2026-09-16; updated the same day after deciding the 3D layer is a **game engine**, not a cube helper. Primary sources are official documentation, first-party source, and Apple technical publications. Several Apple links point at archival mirrors because the original ADC hosting has disappeared. No 3D code was written as part of this note.

## Recommendation for Mockintosh

Build `@mockintosh/qd3d` as a **1-bit software game engine**: scene, camera, mesh instances, draw styles, and (later) collision. Games are ordinary `defineApp` apps that paint a `<raster>` every frame. The OS does not grow a 3D Manager. Do not wrap Three.js. Do not add a `<scene3d>` node. Do not make WebGL a requirement of the OS.

The engine is inspired **more by PlayDators than by Mini3D+**. PlayDators is a flat list of mesh instances, painter’s sort, pattern/blue-noise dither, and draw flags (`Solid` / `Lighting` / `Wire` / `SilhouetteWire`) that write a packed 1-bit buffer. That is the core we want. Mini3D+ is what PlayDators’ author started from and then replaced; we take a shopping list from it (near-plane clip, optional parent groups, imposters, a separate collide module), not its node tree, textures, or `#ifdef` soup. See [Which engine](#which-engine-playdators-not-mini3d).

Name: `@mockintosh/qd3d`. Apple’s 3D layer sat *beside* QuickDraw, wrote into a draw context, and shipped wireframe as a first-class renderer. Do not call it `@mockintosh/three`.

The first *useful* artifact is not a spinning cube. It is a **playable Spectre-class slice**: a tank (or walker) on a plane of obstacles, filled dithered faces, keyboard/pointer steer, 15–30 Hz in a window or fullscreen. The cube is only the renderer boot that makes that game possible. The engine is extracted as a package on day one — a game engine that lives in an app folder never gets a second consumer.

Treat offscreen WebGL → dither as an optional later experiment for “a photograph of 3D.” Gate it on a platform peripheral. Never let it become the default 3D path.

Declarative 3D JSX (the solid-three *pattern*) waits until the engine has a scene graph worth declaring. Games construct `Scene` / `MeshInstance` in TypeScript.

## What the machine already is

Mockintosh renders exclusively to a packed 1-bit QuickDraw `BitMap`: 512×342, 8 pixels per byte, most-significant bit leftmost, `1` = black, rows padded to a 16-bit word. A full screen is 22 KB. There is no HTML or WebGL inside the simulated screen. Colour, if it ever returns, arrives the way Color QuickDraw did — a `PixMap` beside the 1-bit `BitMap` — not as a palette bolted onto the monochrome path. [ARCHITECTURE.md](../ARCHITECTURE.md).

The layering is load-bearing:

```
@mockintosh/quickdraw  →  @mockintosh/ui  →  src/os  →  apps / @mockintosh/sdk
```

`@mockintosh/ui` is a Solid custom renderer (`createRenderer` from `@solidjs/universal`) that paints a retained `box` / `text` / `image` / `raster` / `bitmap` tree through QuickDraw. The only app-level pixel paths are:

- `<bitmap pixels>` — retained unpacked `Uint8Array` (`0` = white, nonzero = black). Replacing the array repaints.
- `<raster onPaint>` — immediate-mode. The callback receives a `RasterSurface` (`setPixel` / `blitPixels` / `fill` in raster-local coordinates, plus the already-clipped QuickDraw `port`) and a `revision` to dirty the frame.

Apps never see packed bits. SDK-clean apps never import `@mockintosh/quickdraw`; they reach the port only as `surface.port`. [packages/ui/src/nodes.ts](../packages/ui/src/nodes.ts), [packages/sdk/docs/APP_DEV_GUIDE.md](../packages/sdk/docs/APP_DEV_GUIDE.md).

The core compiles without DOM types (`npm run check:core`). The host is not assumed to have a GPU. `src/platform/headless/` boots the shell in Node. A physical product plan targets packed 1-bit presentation on e-paper, where WebGL will not exist. [ARCHITECTURE.md](../ARCHITECTURE.md), [physical-product-plan.md](physical-product-plan.md).

RGBA → 1-bit already exists in `@mockintosh/ui` as `toBits` / `createDitherer`: `threshold`, Atkinson error diffusion, and 4×4 Bayer. Photo Booth, Video Player, Picture, and Spotify album art all ingest through that conversion and blit the unpacked result. There is no Floyd–Steinberg kernel in the tree; Atkinson is the Macintosh-native error-diffusion choice. [packages/ui/src/dither.ts](../packages/ui/src/dither.ts).

QuickDraw already draws 1-bit lines. `MoveTo` / `LineTo` / `StdLine` are a Bresenham port of `Lines.a`. A wireframe engine that projects vertices and strokes edges is therefore a few dozen lines on top of an existing primitive, not a new rasterizer. [packages/quickdraw/src/lines.ts](../packages/quickdraw/src/lines.ts), [Apple, LineTo](https://dev.os9.ca/techpubs/mac/QuickDraw/QuickDraw-83.html).

## What the historical systems did

### 1984–1990: software 3D on a 1-bit framebuffer

The original Macintosh had no 3D manager. Applications that wanted perspective projected points in software and stroked them with QuickDraw. `MoveTo`/`LineTo` are ordinary pen operations against the current `GrafPort`; they were present on the 128K. [Apple, Images (IM: Imaging)](https://dev.os9.ca/techpubs/mac/QuickDraw/QuickDraw-12.html).

That is the entire 128K 3D story: wireframe. Hidden-line removal, filled faces, and lighting were application code, and they were expensive enough that shipping titles stayed simple.

Known Macintosh precedents, in increasing cost:

| Title | When | What it actually drew | Notes |
| --- | --- | --- | --- |
| Super 3D (Silicon Beach) | 1988 | Modeling + hidden-line / shaded preview | 512KE minimum. [Macintosh Repository](https://www.macintoshrepository.org/622-super-3d) |
| Swivel 3D (Paracomp) | late 1980s | Linked 3D models, animation | 1 MB recommended; not a 128K title. [Macintosh Repository](https://www.macintoshrepository.org/1496-swivel-3d) |
| Spectre (Velocity) | 1991 | Real-time vector / polygonal tank combat | Battlezone-class filled/outlined polygons, not a raytracer. [Wikipedia, Spectre (1991)](https://en.wikipedia.org/wiki/Spectre_(1991_video_game)) |
| Virtus WalkThrough | 1990 | Real-time filled walkthrough | Plus-class machine, 2 MB; explicitly *not* photorealistic. Contemporary review on [Macintosh Repository](https://www.macintoshrepository.org/38511-virtus-walkthrough-1-x) |
| Infini-D (Specular) | 1990s | Offline shaded/rendered 3D | A production renderer, not a 1-bit interactive engine. Later versions wanted a PowerPC. [Macintosh Repository](https://www.macintoshrepository.org/10227-infini-d-4-0) |

MacDraw is 2D. There was no “MacDraw 3D.” Dark Castle (Silicon Beach, 1986) is a side-view platformer with painted perspective — 2.5D, not a 3D engine. Do not cite it as a rasterizer precedent.

The 128K/512K video path itself is relevant: the screen is a packed 1-bit buffer the DMA reads autonomously; the CPU shares memory bandwidth with the display. Double-buffering two 21 KB screens was “unpopular” because it consumed so much of 128 KB. [Macintosh 128K/512K technical details](https://en.wikipedia.org/wiki/Macintosh_128K/512K_technical_details). Mockintosh's 22 KB packed `BitMap` is the same constraint, restated.

### 1995: QuickDraw 3D, not QuickDraw-with-a-z-buffer

Apple's 3D system arrived on Power Macintosh as a *separate* library. The book the user named is Apple's own *3D Graphics Programming with QuickDraw 3D* (Addison-Wesley, 1995, ISBN 0-201-48926-0) — the Inside Macintosh QD3D volume. It is not a chapter of Imaging with QuickDraw. [Apple, 3D Graphics Programming with QuickDraw 3D](https://dev.os9.ca/techpubs/mac/QuickDraw3D/QuickDraw3D-2.html), [Addison-Wesley listing](https://books.google.com/books/about/3D_Graphics_Programming_with_QuickDraw_3.html?id=Z7JQAAAAMAAJ).

QD3D's architecture is the one we should steal:

- A **model** (geometric objects, groups, attributes, textures).
- A **view** that binds one camera, a group of lights, a **renderer**, and a **draw context**.
- A **draw context** that isolates window-system specifics (Macintosh window, pixmap, later Windows HWND). The 3D library does not own the framebuffer format.
- Two shipped renderers: **wireframe** and **interactive**. Wireframe is a first-class mode, not a debug overlay. [Apple, About QuickDraw 3D](https://dev.os9.ca/techpubs/mac/QuickDraw3D/chap01_intro/QuickDraw3D-11.html).

RAVE (Renderer Acceleration Virtual Engine) is the layer *under* the interactive renderer: a low-level triangle/driver API that could talk to a software rasterizer or to hardware. Applications were told to use QD3D unless they were writing a game framework or a driver. [Apple, QuickDraw 3D RAVE](https://dev.os9.ca/techpubs/mac/QuickDraw3DRAVE/QuickDraw3DRAVE-2.html).

QD3D was dropped from Mac OS X in 1999 in favour of OpenGL. That is a historical fact, not a reason to import OpenGL/WebGL into Mockintosh. The transferable lesson is the split: scene graph and camera in one package, destination isolated in a draw context, wireframe as a real renderer.

### The algorithms, as their authors stated them

**Painter's algorithm.** Sort primitives by depth, draw back-to-front. tinyrenderer's course notes (ssloy) state the failure mode plainly: some scenes cannot be ordered, and every camera move re-sorts the world. [ssloy, Hidden faces removal](https://haqr.eu/tinyrenderer/z-buffer/).

**Z-buffer.** Keep a per-pixel depth and accept a fragment only when it is closer. One extra buffer, no global sort, handles intersecting triangles. tinyrenderer implements this as an 8-bit grayscale TGA the same size as the framebuffer. [ssloy, Hidden faces removal](https://haqr.eu/tinyrenderer/z-buffer/).

On Mockintosh a 16-bit z-buffer for the *whole* 512×342 screen is 350 KB — sixteen times the 22 KB packed `BitMap`. A 200×160 window is 64 KB. The cost is not the allocation; it is a compare and a write on every covered pixel, against a destination that can store only black or white. A z-buffer does not buy you greyscale. It buys correct occlusion so you can then *choose* a 1-bit paint (solid, pattern, or dither) for the winning fragment.

**Hidden-line removal** is a different problem from a z-buffer. Wireframe with hidden edges erased is a computational-geometry pass (Appel-style quantitative invisibility, or “is this edge behind a front-facing face?”). It is the Super 3D look. It is more code than a rotating cube, and it is the right second slice if we want filled-looking objects without a depth buffer.

**Dithered shading.** Floyd and Steinberg published error diffusion in 1976. [Floyd & Steinberg, “An Adaptive Algorithm for Spatial Greyscale,” *Proc. SID* 17(2):75–77 (1976)](http://wwwisg.cs.uni-magdeburg.de/~stefans/npr/entry-Floyd-1976-AAS.html). Bill Atkinson's Macintosh variant (HyperScan / HyperCard) spreads only ¾ of the error, which is what `atkinsonTo1bit` in this repo already implements. [Tinrocket write-up of Atkinson's description](https://2002-2010.tinrocket.com/projects/programming/graphics/00158/index.html). Ordered Bayer is also already here. For a *rotating* object, ordered dither is the less shimmering choice; Atkinson will crawl. Photo Booth already exposes that trade-off for camera frames.

## Approach 1 — Write our own 1-bit engine

### How it works

A software rasterizer that never leaves 1-bit:

1. Own a small scene: vertices, edges and/or triangles, a camera (eye, look, up, focal length).
2. Transform and project into the raster's integer rectangle.
3. Paint through `RasterSurface` (or the clipped `GrafPort`):
   - **Wireframe:** `MoveTo`/`LineTo` per edge, or Bresenham via `setPixel`. Back-face cull optional.
   - **Painter's fill:** sort faces by centroid z, `fill` or pattern-stamp each projected polygon. Fine for a cube; fails on intersecting geometry.
   - **Z-buffer + 1-bit paint:** per-pixel depth in a side buffer the size of the *raster*, not the screen; the colour of a winning fragment is black, white, or a screen-door/Bayer sample of a shade.
   - **Hidden-line:** after projection, discard or clip edges occluded by front faces.

tinyrenderer is the right teaching source: 500 lines of C++, no GPU, `set(x,y,color)` as the only output primitive, then Bresenham, triangle fill, barycentric interpolation, z-buffer, camera, and only then shading. [ssloy/tinyrenderer](https://github.com/ssloy/tinyrenderer), [course notes](https://haqr.eu/tinyrenderer/). We stop much earlier than their head model. A cube does not need textures, tangent space, or SSAO.

Playdate is the closest *shipping* 1-bit analogue. The official Lua/C graphics API is 2D: 400×240, 1-bit memory LCD, `drawLine` / `fillPolygon` / `drawPolygon` / images. There is no OpenGL. [Inside Playdate](https://sdk.play.date/3.1.1/Inside%20Playdate.html), [Inside Playdate with C](https://sdk.play.date/3.1.1/Inside%20Playdate%20with%20C.html). 3D on Playdate is:

- `image:drawSampled(...)` — an official Mode-7-style affine + perspective helper. The Mode7Driver demo lives under `Examples`. [Inside Playdate, `drawSampled`](https://sdk.play.date/3.1.1/Inside%20Playdate.html#f-graphics.image.drawSampled).
- **Mini3D** — a triangle rasterizer with a scene hierarchy, shipped as `C_API/Examples`, not as a public SDK module. Community fork: [nstbayless/mini3d-plus](https://github.com/nstbayless/mini3d-plus).
- Community Lua engines such as pd3d (OBJ load, dithered flats, wire mode). Not first-party.

The Playdate lesson is the one we should copy: the OS stays a 1-bit 2D blitter; 3D is a **game engine** that writes pixels. Which Playdate engine is decided in [Which engine](#which-engine-playdators-not-mini3d).

picoCAD (Johan Peitz, PICO-8) is the dithered-low-poly aesthetic people now mean by “1-bit 3D.” The editor is closed source; the look is documented by the official product page and by the MIT viewer that reverse-engineers its light-map (32-wide columns, pair-of-pixels dither per shade). [picoCAD](https://johanpeitz.itch.io/picocad), [lucatronica/picocad-web-viewer](https://github.com/lucatronica/picocad-web-viewer). That look is *PICO-8*, 16 colours dithered, not 1984 Macintosh. Useful as a later shading mode, not as the fidelity target.

js13k engines (various 1–13 KB WebGL or software demos) prove a rotating cube fits in a handful of kilobytes. They are not a dependency; they are a size budget.

### Fit with Mockintosh layers

`@mockintosh/qd3d` depends on `@mockintosh/quickdraw` (math + `MoveTo`/`LineTo` / `GrafPort`) and optionally on the `RasterSurface` type from `@mockintosh/ui`. It does not depend on the Solid renderer, the shell, or any platform.

```
@mockintosh/quickdraw          packed BitMap, LineTo, ClipRect
        ↑
@mockintosh/qd3d               Scene, Mesh, MeshInstance, draw, collide?
        ↑
game app  ── <raster onPaint> ── @mockintosh/ui
```

The OS does not know 3D exists. No capability flag is required for software 3D: every host that can present a `BitMap` can run it. That is the opposite of `camera` / `images`. The OS *does* own the game loop’s clock and input: `scheduler.requestFrame`, pointer, and keys. PlayDators owns those itself because it *is* the process; Mini3D+ is a library a game calls. We are Mini3D+ on that axis (library) and PlayDators on the renderer axis.

SDK-clean apps must not import `@mockintosh/quickdraw`. The engine accepts a `RasterSurface` and hides `LineTo`. Re-export from `@mockintosh/sdk` once `Scene` / `draw` are boring.

The engine does **not** own: windowing, menubar, filesystem, audio (until a game needs it), or a second JSX world.

### Language

Write `@mockintosh/qd3d` in **TypeScript**. Not a second language, not WASM, not a PlayDators C port.

PlayDators is C because the Playdate *is* a C machine (180 MHz, no JS). Mockintosh’s hosts are a JS realm: Vite apps, the in-OS builder (TS/TSX only — [buildPolicy](../src/shared/buildPolicy.ts)), and Node headless tests. The engine has to live in that realm or games cannot import it.

A few hundred lit tris into a ~400×250 raster is a desktop-JS budget if the inner loop is a scanline stamp on a `Uint8Array`, not `setPixel`. Playdate needed C to hit 45 fps on a microcontroller; we need C only if we *measure* a miss.

Keep the rasterizer C-shaped so that rewrite is possible: `drawTriangle(buffer, rowstride, p0, p1, p2, pattern)` — PlayDators’ `draw_tri_pattern` signature, no Solid, no classes. Scene/camera/game stay TypeScript forever.

| Language | Use? | Why |
| --- | --- | --- |
| TypeScript | yes, default | one toolchain, SDK-importable, testable, matches every current host |
| C → WASM (Emscripten / PlayDators) | later, inner loop only | possible (they already ship a web build); second toolchain; copy-out to `RasterSurface` every frame; SDK builder cannot compile C |
| Rust / Zig → WASM | no | same WASM tax, no in-repo culture |
| AssemblyScript | no | looks like TS, is not; still WASM |
| C as the whole engine + TS glue | no | Mini3D+ Lua shape; fights “the OS is JS” |

Do not start in C “for speed.” Start in TS, measure slice 1 at 30 Hz, extract the scanline to WASM/native if it fails. That is the same rule as QuickDraw: the hot blit is allowed to be ugly; the package boundary is not.

### App-author API (engine)

```ts
const mesh = box({ size: 1 });
const inst: MeshInstance = {
  mesh,
  transform: lookAt(...), // or translate/rotate
  flags: Draw.Solid | Draw.Lighting,
  color: 0.6,
};
scene.add(inst);
scene.setCamera(eye, look, up);
scene.setLight(towardLight);

<raster
  width={win.width} height={win.height} revision={frame()}
  onPaint={(surface) => {
    surface.fill(WHITE);
    scene.draw(surface); // PlayDators: scene_draw(buffer, rowstride, flags)
  }}
/>
```

Draw flags match PlayDators: `Solid`, `Lighting`, `Wire`, `SilhouetteWire`. Pattern vs Bayer/blue-noise is a scene flag, not a material.

### Fidelity

Fidelity target for a *game* is the PlayDators demo look: flat-lit triangles, a shade ramp stamped as an 8×8 pattern or compared to a blue-noise tile, then black silhouette edges. That is [`draw_tri_pattern` / `draw_tri_bluenoise`](https://github.com/aras-p/playdators/blob/main/src/draw_style.c) plus `SilhouetteWire`. Spectre / Battlezone is the same machine with fewer tris and chunkier patterns. Super 3D wireframe is a debug flag. Atkinson on a moving mesh crawls — do not use it for this look. A dithered Three.js teapot is Photo Booth, not this.

### Hosts

Pure JS + integer pixels. Headless tests assert bits. E-paper presents the same packed `BitMap`. No WebGL, no DOM, no `<canvas>` inside the scene.

### Complexity

| Slice | Effort | What ships |
| --- | --- | --- |
| 0. Renderer boot | days | `Scene` + cube mesh + `Wire` + `draw(surface)` + golden bits |
| 1. Playable engine | 2–3 weeks | `MeshInstance`, painter sort, `Solid`/`Lighting`, pattern/Bayer, first game |
| 2. World | 2–3 weeks | near-plane clip, `SilhouetteWire`, mesh animation frames |
| 3. Stagecraft | a month | parent `Group`, imposters (billboard sprites) |
| 4. Collide | a month | sphere/AABB vs mesh, *not* inside the rasterizer |
| 5. Z-buffer | only if a game needs intersecting tris | depth buffer sized to the *raster* |

This is not tinyrenderer’s 10%. It is PlayDators’ core without the Dog Walk content pipeline.

### Risks

- JS per-pixel fills: a cube is fine; Spectre-scale (low hundreds of tris in a 400×250 window) needs a scanline fill or packed scratch + `CopyBits`, not `setPixel`. Measure at slice 1.
- Atkinson on a moving mesh crawls. Prefer Bayer or a static pattern for animation.
- XOR-outline window drags and 3D animation in the same window will fight if we paint outside the raster clip. Stay inside `RasterSurface`. Fullscreen (`kind: "fullscreen"`) avoids chrome contention.
- A Mini3D+-shaped node tree on day one will become a bad Three.js. Flat instances first; `Group` is a transform parent, not a FaceInstance cache.
- Collision inside `draw()` couples physics timestep to paint. Keep collide a sibling.

## Which engine: PlayDators, not Mini3D+

Both are 1-bit CPU engines that `draw(packedBuffer, rowstride)`. That is why they are in this note. They are not interchangeable once the goal is a **game engine**.

### What each actually is

**Mini3D+** ([nstbayless/mini3d-plus](https://github.com/nstbayless/mini3d-plus)) is Panic’s Mini3D example plus a kart game. Dave Hayden’s `Scene3D` is a node tree (`Scene3DNode` parent/child, cached world points, `FaceInstance`s). The “plus” is near-plane clip, projective textures, imposters, collision, fog, interlace, and a compile-time menu of occlusion strategies (z-buffer, order table, instance sort, face sort) documented at length in [`mini3d.h`](https://github.com/nstbayless/mini3d-plus/blob/main/mini3d-plus/mini3d.h). Default viewport is the full 400×240 LCD. The author tells you not to get your hopes up: 20 fps is the dream. The repo reads as abandoned.

**PlayDators** ([aras-p/playdators](https://github.com/aras-p/playdators)) is a later 1-bit game (Chocomel on a 3D curve, 500–1000 visible tris, 45–50 fps on device, also PC and web). [`src/render.h`](https://github.com/aras-p/playdators/blob/main/src/render.h) is the engine: `Mesh` + `MeshInstance` + `Scene` + `scene_draw`. Draw flags are `Solid`, `Lighting` (wrapped diffuse), `Wire` (optional per-edge flags), `SilhouetteWire` (adjacency, computed on first use). Occlusion is painter’s sort of instances then triangles, with a `sort_bias`. No z-buffer. Dither is a fixed 8×8 ramp or a blue-noise texture. Meshes can have animation frames, per-face colors, and a Blender exporter. The readme is explicit: parts were based on Mini3D and Mini3D+, **“but by now I have replaced them.”**

### Decision

**Inspire the engine from PlayDators.** Mini3D+ already ran the “is a bigger engine better?” experiment; PlayDators is the result of throwing most of it away and keeping what a 1-bit game actually uses.

| | Mini3D+ | PlayDators | `@mockintosh/qd3d` |
| --- | --- | --- | --- |
| Scene | Node tree, cached faces | Flat `MeshInstance[]` | PlayDators; add `Group` later as a matrix parent |
| Draw | `Scene3D_draw(buf, stride)` | `scene_draw(buf, stride, flags)` | `scene.draw(surface)` |
| Occlusion | `#ifdef` z-buffer / order table / sorts | Painter only | Painter; z-buffer only if a title needs intersecting tris |
| Styles | filled / wire / wire-back | solid / lit / wire / silhouette | PlayDators flags |
| Shade | 33 × 8-byte patterns | patterns or blue-noise | Mac 8×8 patterns + Bayer |
| Clip | near-plane (the “plus”) | not a headline feature | **steal from Mini3D+** at slice 2 |
| Textures | projective, greyscale, scanline | “fairly useless currently” | do not take |
| Imposters | yes | no | **steal later** (billboard sprites are cheap 1-bit) |
| Collision | in-engine, sphere/tri | game-side | **steal as a sibling module**, not inside `draw` |
| Integration | library a game calls | owns `main` / platform | Mini3D+ (we already have a platform and a frame clock) |
| Pipeline | C + Lua glue | C + custom mesh + Blender | TypeScript + later a mesh file; no Lua, no second JSX |

Steal from Mini3D+ only what PlayDators under-built for *our* games: near-plane clip (walkthrough / first-person), imposters, and a collide package. Steal Mini3D+’s *commentary* on z-buffer vs sort — `mini3d.h` is the best written decision record in this space — and then pick painter’s, as PlayDators did.

Do not take: the FaceInstance tree, projective textures, interlace, fog-in-the-rasterizer, or the `#ifdef` combinatorial explosion.

Do not port either codebase. Both write `uint8_t*` + rowstride into a framebuffer they own. We write a clipped `RasterSurface` so window chrome, overflow, and print stay QuickDraw’s. Their `drawLine` / `fillTriangle` become `MoveTo`/`LineTo` plus a scanline fill that stamps an 8×8 pattern.

### Why not Mini3D+ if we want “a game engine”

A scene graph, collision, and textures *sound* like an engine. They are also the parts PlayDators deleted after shipping a real game on the same 1-bit machine. On Mockintosh they are worse: a node tree fights the “five UI nodes, 3D is a library” rule; textures on a 512×342 1-bit window are a 1995 QD3D feature, not a 1984/Spectre feature; collision inside the rasterizer couples physics to paint. We can add a thin `Group` and a `collide` module without becoming Mini3D+.

## Approach 2 — solid-three as a custom renderer

### How it works

[solid-three](https://github.com/solidjs-community/solid-three) is a Solid port of [`@react-three/fiber`](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction). It is published as `solid-three@0.2.0`, peers on `solid-js` and `three`, pins `three@0.149.0`, and the README still says it is “not yet ready for production.” It is a Solid 1.x codebase (`createRenderer` from `solid-js/universal`, not `@solidjs/universal`).

The architecture is three layers, copied from R3F:

1. **Catalogue.** `extend(THREE)` dumps the Three.js constructor table into a name map. JSX `<mesh>` becomes `new THREE.Mesh(...)`. [src/core/renderer.ts](https://github.com/solidjs-community/solid-three/blob/main/src/core/renderer.ts).
2. **Solid universal renderer.** `createSolidRenderer` in [src/solid.ts](https://github.com/solidjs-community/solid-three/blob/main/src/solid.ts) implements the `createRenderer` host: `createElement` instantiates from the catalogue, `setProperty` writes Three.js fields (including dashed `position-x` paths and `attach="geometry"`), `insertNode`/`removeNode` call `Object3D.add`/`remove`.
3. **Web `Canvas`.** [src/web/Canvas.tsx](https://github.com/solidjs-community/solid-three/blob/main/src/web/Canvas.tsx) allocates an `HTMLCanvasElement`, constructs `THREE.WebGLRenderer` in `createRendererInstance` ([src/core/index.tsx](https://github.com/solidjs-community/solid-three/blob/main/src/core/index.tsx)), stores state in zustand, and `insert`s the Solid children into `scene`. Pointer events are raycasts against that canvas.

R3F's own explanation of the same pattern: `<mesh>` ≡ `new THREE.Mesh()`, `<boxGeometry args={[2,2,2]}>` ≡ `new THREE.BoxGeometry(2,2,2)`, `attach` assigns `mesh.geometry` / `mesh.material`, and the render loop is `renderer.render(scene, camera)` on a WebGLRenderer. [R3F, How does it work?](https://docs.pmnd.rs/react-three-fiber/tutorials/how-it-works).

Solid's official contract for any of this is `createRenderer` from the universal package. The compiler must emit helpers from a chosen `moduleName`. Mixing two JSX implementations in one program requires per-file pragmas. [solid/packages/solid/universal/README.md](https://github.com/solidjs/solid/blob/main/packages/solid/universal/README.md). The docs URL in the request, `https://docs.solidjs.com/reference/rendering/solid-universal`, 404s as of this research; the README and `@solidjs/universal` are the source of truth. Mockintosh already uses `@solidjs/universal@2.0.0-rc.8` with `moduleName: "@mockintosh/ui/renderer"` at every compile site (Vite, companion builder, in-OS builder). [docs/solid-2-migration-plan.md](solid-2-migration-plan.md).

### What current Three.js can render

Three.js is a WebGL (and now WebGPU) engine. Official renderers today:

| Renderer | Status | Destination |
| --- | --- | --- |
| `WebGLRenderer` | current, documented | WebGL 2 canvas |
| `WebGPURenderer` | next-gen, WebGL 2 fallback | GPU |
| `SVGRenderer` | addon, limited | DOM SVG; no textures, no shadows, no real shading. [Three.js SVGRenderer](https://threejs.org/docs/pages/SVGRenderer.html) |
| `CSS3DRenderer` | addon | DOM/CSS 3D transforms; no geometries |
| `CanvasRenderer` | **removed** (r98, PR [#15029](https://github.com/mrdoob/three.js/pull/15029)) | 2D canvas |
| `SoftwareRenderer` | **removed** (r109 era, PR [#17809](https://github.com/mrdoob/three.js/pull/17809)) | CPU framebuffer |

The migration guide records both deletions. [three.js Migration Guide](https://github.com/mrdoob/three.js/wiki/Migration-Guide). Forum guidance for anyone who still wants a CPU path is: fork the old renderer, pin an ancient three revision, or write your own `renderer.render(scene, camera)`. [three.js discourse, forking CanvasRenderer](https://discourse.threejs.org/t/question-forking-the-canvasrenderer/58995).

The **math** (`Vector3`, `Matrix4`, `Quaternion`, `Euler`) lives under `three/src/math` and does not need a WebGL context. [three.js/src/math](https://github.com/mrdoob/three.js/tree/dev/src/math). The **scene graph** (`Object3D`, `Scene`, `Mesh`, `Camera`) is usable on the CPU. `WebGLRenderer` is the part that talks to a GPU.

So: *could* we keep Three.js as a scene graph + math library and write a 1-bit `render(scene, camera, surface)`? Yes, in the same sense we could keep a 747 for the seatbelts. `MeshStandardMaterial`, geometries, textures, lights, and the default render loop all assume a GPU shader. solid-three's `Canvas` constructs a `WebGLRenderer` with `powerPreference: "high-performance"`. There is no supported software backend to point at our `BitMap`.

### What we would keep vs throw away

| Keep (the pattern) | Throw away (the product) |
| --- | --- |
| `createRenderer` host that maps tags → scene objects | `THREE.WebGLRenderer`, `HTMLCanvasElement`, ResizeObserver |
| Catalogue / `extend` so `<mesh>` constructs something | The Three.js material/geometry/shader catalogue |
| `attach` for non-child bindings | Raycaster against a DOM canvas |
| A host component that *composites* the scene into a destination | zustand store, tone mapping, DPR, shadows |
| Per-file `jsxImportSource` if we ever want JSX scenes | solid-three itself (Solid 1.x, three r149, unmaintained) |

### Fit with Mockintosh layers

Using solid-three as-is would punch WebGL through every layer: the app would mount an `HTMLCanvasElement` that `@mockintosh/ui` cannot parent, the OS would have to composite a foreign canvas into the 1-bit screen, and headless/e-paper would fail. That violates “no HTML inside the simulated screen” and “no GPU requirement.”

A *reimplementation* of the pattern — `@mockintosh/qd3d/jsx` compiling to our own mesh types and painting a `RasterSurface` — could sit above `@mockintosh/qd3d` without touching the OS. It still needs a second compiler `moduleName` and a way to nest that tree inside a window compiled with `@mockintosh/ui/renderer`. See [Could we reuse @solidjs/universal?](#could-we-reuse-solidjsuniversal-for-a-second-renderer) below.

### App-author API (if we did this later)

```tsx
{/* compiled with @mockintosh/ui */}
<raster width={200} height={160} revision={frame()} onPaint={paint} />

{/* compiled with @mockintosh/qd3d/jsx — different file or pragma */}
<scene>
  <camera perspective fov={50} near={0.1} far={100} position={[0, 0, 3]} />
  <mesh rotation={[0.4, yaw(), 0]}>
    <box />
  </mesh>
</scene>
```

The host file owns the raster; the scene file owns the graph. This is the R3F `Canvas` split, without a DOM canvas.

### Fidelity

Default Three.js shading is grey Gouraud on a colour framebuffer. Even if we dither the result, we get Photo Booth's look (a dithered *picture* of a lit mesh), not Super 3D's look (authored 1-bit strokes and patterns). Getting a Classic Mac aesthetic out of Three.js means throwing away most of what people install Three.js for.

### Hosts

solid-three / WebGLRenderer: browser with a GPU (or SwiftShader, which Chromium is retiring). Not headless. Not e-paper.

Three.js math + our rasterizer: any JS host, but we would be carrying a large graph library to transform eight vertices.

### Complexity

Adopting solid-three: small integration, large fidelity and host failure. Reimplementing the pattern against our engine: a Solid 2 universal renderer, a jsx-runtime, a second `moduleName` in Vite *and* both app builders, import-map entries, and the Solid 2 migration already in flight. That is a quarter's work for syntax sugar over Approach 1.

### Risks

- solid-three is not production software and is a major behind ours.
- Two JSX worlds in one SDK is a compiler and support tax (see Solid 2 plan: all three compile sites must emit the same helpers).
- Three.js as a dependency in third-party bundles blows the “small Classic Mac app” story.
- A custom Three.js software renderer is a permanent fork of a deleted addon.

## Approach 3 — Offscreen WebGL → dither to 1-bit

### How it works

This is Photo Booth, with a GPU instead of a camera.

1. On a host that has WebGL, create an `OffscreenCanvas` (or a hidden host canvas — already how video/photos enter).
2. Render Three.js / Babylon / raw WebGL into it.
3. `readPixels` → `ImageFrame` `{width, height, rgba}`.
4. `createDitherer(w, h, "atkinson" | "bayer" | "threshold")` → unpacked `Uint8Array`.
5. `<raster revision={n} onPaint={s => s.blitPixels(bits, w, h)} />`.

Picture already does step 3–5 with `toBits(frame, "threshold")`. Photo Booth does 3–5 at ~15 Hz with Atkinson or Bayer. Video Player uses threshold. [apps/PhotoBooth.tsx](../apps/PhotoBooth.tsx), [apps/Picture.tsx](../apps/Picture.tsx), [packages/ui/src/dither.ts](../packages/ui/src/dither.ts).

Floyd–Steinberg is *not* in the repo. Adding it would be a dither-kernel change, not a 3D change, and it is the wrong default: Atkinson is the Macintosh photograph look; Bayer is the stable-animation look. Floyd–Steinberg is what Photoshop does, which is the comparison Atkinson was designed to beat. [Tinrocket / Atkinson](https://2002-2010.tinrocket.com/projects/programming/graphics/00158/index.html).

### Fit with Mockintosh layers

WebGL is a **platform peripheral**, exactly like `camera` and `images`. It belongs on `Platform` as something like `webgl?: { createTarget(w, h): WebGLTarget }`, implemented only in `src/platform/web/`. The OS derives a capability and refuses apps that `requires: ["webgl"]` on headless and e-paper, with the same sentence shape as Photo Booth (“needs a camera, which this Macintosh does not have”). [ARCHITECTURE.md, Capabilities](../ARCHITECTURE.md).

The dither and blit stay in `@mockintosh/ui`. The 3D scene stays in the app or in an optional `@mockintosh/webgl-dither` helper that must not be imported by the OS. QuickDraw never sees RGBA.

If the helper is written carelessly (a `<canvas>` composited over the CRT, a WebGL context created inside `packages/ui`), the layering is already lost. The test is: `npm run check:core` still passes; headless boot tests still run.

### App-author API

```tsx
const gl = useApp().webgl; // undefined on e-paper
<raster
  width={view().width}
  height={view().height}
  revision={frame()}
  onPaint={(s) => {
    if (!pixels) return s.fill(WHITE);
    s.blitPixels(pixels, w, h);
  }}
/>
```

The Three.js scene lives in the app's `requestFrame` loop, not in JSX, unless we also adopt Approach 2 on the WebGL side — which we should not.

### Fidelity

This looks like a dithered screenshot of a modern renderer placed in a Classic window. That is a legitimate Mockintosh genre (Photo Booth, Picture, Spotify art). It is not Classic Mac 3D. Anti-aliased edges become grey ramps become Atkinson worms. A 60 Hz spinning PBR helmet will shimmer. Bayer reduces crawl and looks more “patterned,” which is closer to a Mac but still a photograph of a lit mesh.

72 dpi / 512×342 is fine — we dither at the raster size, not at device pixels — but the *content* is wrong for System 6.

### Hosts

Requires a WebGL (or WebGPU) implementation. `src/platform/headless/` does not have one. Chromium is removing automatic SwiftShader fallback. An ESP32 e-paper product will not grow a GL driver so a cube can spin. Babylon's official server path is `NullEngine`, which **does not produce an image** — it is for tests and loaders, not software rasterization. [Babylon.js, NullEngine](https://github.com/BabylonJS/Documentation/blob/master/content/setup/support/serverSide.md).

### Complexity

Low *if* we already accept “browser-only demo.” A weekend to prove a teapot in Photo Booth's viewfinder. High if we then pretend it is the 3D strategy: capability plumbing, fallback UX, two visual languages, and a dependency (three / babylon) in the SDK import map.

### Risks

- Becomes the path of least resistance (“just use Three.js”) and permanently splits the aesthetic.
- Headless tests cannot golden-image a GL-dithered frame without a GL implementation in Node.
- `readPixels` + Atkinson at full-window size every frame is the Photo Booth budget; two such apps plus a spinning mesh will miss 30 fps on e-paper-class CPUs.
- WebGL context limits, lost contexts, and hidden-canvas lifecycle are host bugs the OS should not own.

## Approach 4 — Hybrid and the other names

### Babylon.js

Official headless support is `NullEngine`: no WebGL device, **no pixels**. [Babylon.js server-side docs](https://github.com/BabylonJS/Documentation/blob/master/content/setup/support/serverSide.md). There is no shipping CPU rasterizer. Using Babylon for pixels is Approach 3 with a different engine. Reject as a 1-bit backend.

### wgpu

A GPU API (WebGPU in the browser, native on desktop). The opposite of “platform already has no GPU requirement.” Reject.

### Magnum

C++ middleware. The GL wrapper is optional; official docs show using Magnum math/assets with a *custom* renderer (their example uses sokol, which is still GPU). [Magnum triangle-sokol example](https://github.com/mosra/magnum-examples/blob/master/doc/triangle-sokol.dox), [mosra/magnum](https://github.com/mosra/magnum/). Not a TypeScript 1-bit engine. At most, a reading source for scene/math structure.

### Jet (CubeCoders)

[CubeCoders/Jet](https://github.com/CubeCoders/Jet) is a C++17 fixed-function software rasteriser aimed at ESP32-class parts: integer math, no heap on the hot path, compile-time feature flags, **no window or main loop** — `scene.render()` fills a buffer you pass in. On an S3 they claim ~40k flat tris/s, ~650 on-screen tris at 60 fps / 480×320, and a Wipeout-style demo at 60 fps interlaced. That is the best public existence proof that Path B can do real software 3D.

It is not a 1-bit engine. Colour is **RGB565 only** (native to ST7796 / ILI9488). A 320×240 colour + Z pair is already ~300 KB; a 512×342 RGB565 screen is ~350 KB before depth — sixteen times our packed `BitMap`. Shading is Saturn-class (Gouraud, Phong, affine textures, bloom, water). Dither is screen-door / noise for *transparency in colour*, not a lighting ramp into black and white. Using Jet and then Atkinson-ing the 565 buffer is Approach 3 in C: a photograph of Wipeout in a Macintosh window.

The library shape is a C buffer you fill and a host that presents it. The scene/material API is Mini3D+-sized and lives in C++, which fights a TS `qd3d`.

License is **AGPL-3.0-or-later** plus a paid commercial grant. Linking Jet into firmware or a WASM module means the linking application (the OS image) is AGPL unless CubeCoders sells a license. [Jet README](https://github.com/CubeCoders/Jet). PlayDators’ own code is Unlicense. Do not vendor Jet. Steal the *host contract* (you own present; we fill bits) and the S3 budget numbers; keep PlayDators as the 1-bit look.

### a3d (0015)

[0015/a3d](https://github.com/0015/a3d) is a header-only C++17 software renderer for ESP32, Apache-2.0. It is a **character viewer**, not a game engine: `.glb` → `.a3d` container (quantised verts, RGB565 textures, skeleton, clips), two-weight skinning, tile-binned raster, a four-call `Viewer`. The core names no vendor API. A panel is five function pointers; `sendTile` must not return until the RGB565 strip can be reused. There is **no full colour framebuffer** — the screen is horizontal strips, which is how they run 800×1280 without 2 MB of RAM.

Measured on hardware (ESP-IDF 5.5.4, 240×320 off-screen, animated CesiumMan, 4,672 tris): **S3 ≈ 24 fps** (two workers), **P4 ≈ 55 fps**, **C6 ≈ 1.7 fps**. The C6 has no FPU; the same FOX model is 27.7 ms on an S3 and 265.6 ms on a C6 (9.6×), and skinning is 23×. They say this on page one: if you want 3D and have a choice, buy a Pi. Every number is from a board.

That is better *measurement* than Jet, and a better *license* than Jet. It is still the wrong pixels. Colour is RGB565 textures and Gouraud; there is no alpha and no 1-bit lighting ramp. `sendTile` is a colour LCD blit, not a packed `BitMap`. Using a3d and dithering each strip is Approach 3 in bands. The scene is a skinned glTF node tree — Mini3D+ plus bones — which fights a TS `qd3d` of mesh instances.

Steal three facts, not the library:

1. **FPU is load-bearing.** A float rasterizer is dead on C6. a3d kills it as a 3D coprocessor unless the fill is integer (Jet / PlayDators), not float (a3d).
2. **Viewport beats triangle count.** Cost is per covered pixel. 512×342 is ~2.3× 240×320; a Spectre window that covers a third of the screen is cheaper than a character that fills it. Budget games by ink, not by mesh size.
3. **Tile present.** a3d’s strip buffers avoid a full colour frame. If a rasterizer ever leaves JavaScript, write packed bits (or 1-bit strips) into the existing 22 KB `BitMap`. Do not allocate a colour screen “just this once.”

Do not vendor a3d. Apache-2.0 would let us; the look and the ABI would not.

### dim3, TinyGL, Mesa swrast, SwiftShader

Native software GL stacks. They output colour framebuffers we would then dither (Approach 3, heavier). They do not run in the DOM-free core. Out of scope.

### QuickDraw 3D / RAVE as something to port

A C scene graph from 1995 with handle-based objects, 3DMF files, and a RAVE driver interface. We already have the lesson (draw context + wireframe renderer). Porting QD3D would be a multi-year fidelity project in the same class as QuickDraw itself, for an API Apple abandoned. Do not port it. Name our package after it.

### Virtus WalkThrough / Infini-D / Super 3D / Swivel 3D / Spectre

These are *looks*, not engines we can vendor. Spectre and Super 3D are the fidelity references for Approach 1. Virtus is the reference for cheap filled polygons. Infini-D is the reference for “offline render, then dither the picture” — which is Approach 3 used as a *Picture* document, not as a live window.

### E-ink 3D

There is no first-party e-ink 3D API analogous to Playdate Mini3D. The relevant constraint is already in-repo: packed 1-bit frames, no GPU, refresh budgets around 30 fps of *content*, not 30 fps of optical settling. [physical-product-plan.md](physical-product-plan.md). A wireframe cube is an e-paper-friendly animation (few pixels change). A Spectre-class filled scene is heavier but still 1-bit and local to a window. A full-frame Atkinson teapot is a worst case (every pixel may toggle). That alone should kill Approach 3 as the default.

## Comparison

| | Own 1-bit engine | solid-three / Three.js graph | WebGL → dither |
| --- | --- | --- | --- |
| Destination | `RasterSurface` / `LineTo` | WebGL canvas (or a custom CPU renderer we would write anyway) | RGBA → existing dither → `blitPixels` |
| OS / QuickDraw leak | none | WebGL into the host | WebGL as a peripheral |
| Classic Mac look | yes (Spectre filled + pattern / silhouette / wire) | no, unless we ignore most of Three | no (photo of 3D) |
| Headless / e-paper | yes | no | no |
| App API | `scene.draw(surface)` in a game app | JSX scene + DOM `Canvas` | function + `<raster>` + capability |
| Effort to a playable slice | weeks (PlayDators core + Spectre-class app) | days to integrate, then a fidelity fight | days on web, dead elsewhere |
| Effort to a *good* world | months (clip, silhouette, groups, collide) | rewrite the renderer | never (wrong look) |
| Risk | we own a 1-bit game engine | we own a WebGL binding | we fork the product aesthetic |

## Should 3D be a node, a helper, a package, or an app library?

**A package on day one: `@mockintosh/qd3d`.** A game engine that starts life inside `apps/Spectre.tsx` will not get a second consumer. The package depends on QuickDraw (and the `RasterSurface` type), not on the shell. `@mockintosh/sdk` re-exports `Scene` / `Mesh` / `draw` once they are boring. Same move as Color QuickDraw: a new package beside QuickDraw, not a flag inside it. [color-quickdraw-research.md](color-quickdraw-research.md).

**Games are apps.** `defineApp`, a window (document or `kind: "fullscreen"`), `requestFrame` → `revision`, `scene.draw(surface)` in `onPaint`. The engine is not a process and does not own input.

**No `<scene3d>` node.** Layout, hit-testing, and inspection stay 2D. The raster already clips to overflow and chrome. Pointer hits the raster; the game raycasts in engine space if it needs 3D picking.

**`scene.draw(surface)` is the stable seam.** It is PlayDators’ `scene_draw`. It keeps 3D out of `draw.ts`.

**Not `@mockintosh/three`.** **Not an OS feature.** Finder does not grow a 3D Viewer.

## Could we reuse `@solidjs/universal` for a second renderer?

Yes, mechanically. `createRenderer` is a function; we can call it again with a different node type (`Qd3dNode` instead of `CanvasNode`). Solid's own README lists “canvas or WebGL” as intended targets and requires a distinct compiler `moduleName` plus a `jsx-runtime` for types. Mixing JSX worlds needs per-file pragmas. [Solid Universal README](https://github.com/solidjs/solid/blob/main/packages/solid/universal/README.md).

The nesting problem is the real one. Every Mockintosh TSX file today is compiled with `moduleName: "@mockintosh/ui/renderer"` (Vite, companion, in-browser builder). A `<mesh>` in an app file becomes `createElement("mesh")` on the *UI* renderer, which falls back to `box`. solid-three avoids this by compiling the *entire consumer* against its own renderer and mounting to a DOM canvas. R3F avoids this by running a second React reconciler root inside `<Canvas>`.

Solid does not give us a second reconciler root for free. Practical options:

1. **Per-file `jsxImportSource` / pragma** for scene files, plus a host component in the UI world that calls `qd3dRenderer.render(() => <Scene/>, root)` and blits the result. Two compile graphs. The in-OS builder must learn a second `moduleName` or we forbid 3D JSX in user-built apps.
2. **No 3D JSX.** The helper is TypeScript. This is the first-slice answer.
3. **Catalogue without a second renderer.** `<mesh>` stays illegal; apps construct `new Mesh()` in script. We get a scene graph without a compiler fork.

Option 1 is how a future `@mockintosh/qd3d/jsx` should work if several games want it. It is not justified by the first title. It also lands in the middle of the Solid 2 migration, which already has to keep three compile sites in lockstep. [solid-2-migration-plan.md](solid-2-migration-plan.md).

So: we *can* nest a second universal renderer inside a window. We should not, until the engine’s `Scene` / `MeshInstance` / `Group` are real and a second game wants to declare them.

## Engine slices

### 0 — Renderer boot (days)

`packages/qd3d`: vec/mat, `Mesh`, `Scene`, `draw` with `Wire` only. One cube. Golden 1-bit fixture. Proves `RasterSurface` is a draw context. Not a shippable game.

### 1 — Playable engine (the real first slice)

PlayDators’ *look*, in TypeScript, painting a window:

- Scanline triangle fill (not `setPixel`). Stamp an 8×8 shade ramp, or Bayer / blue-noise compare — same split as `draw_tri_pattern` vs `draw_tri_bluenoise`.
- `MeshInstance` + painter’s sort (`sort_bias`)
- `Solid` | `Lighting` (wrapped diffuse → one shade per face)
- `SilhouetteWire` in this slice if the title is meant to read like Chocomel; otherwise slice 2
- A mesh denser than a cube (even a decimated animal + a ground plane). The look *is* a few hundred lit tris.
- Bundled game app: steer a thing across a small world
- Headless: after a scripted input sequence, chrome is untouched and the raster is not empty

This is what answers “does 1-bit 3D feel like PlayDators on this computer?”

### 2 — World

Near-plane clip (Mini3D+). `SilhouetteWire` via adjacency (PlayDators). Mesh animation frames if the title needs them.

### 3 — Stagecraft

`Group` as a parent transform (not a FaceInstance cache). Imposters: a 1-bit sprite billboarded in the scene (Mini3D+).

### 4 — Collide

`@mockintosh/qd3d/collide` or a sibling file: sphere / AABB vs mesh. Games call it on the tick, not from `draw`.

### 5 — Only if needed

Z-buffer sized to the raster. OBJ/glTF loader. A mesh file format + exporter. 3D JSX. WebGL-dither as a *Picture* of a level, not as the live renderer.

Success looks like Spectre in a Macintosh window, not like a dithered Three.js example and not like Mini3D+’s textured kart.

## Sources

### Mockintosh

- [ARCHITECTURE.md](../ARCHITECTURE.md) — 1-bit `BitMap`, layering, `<raster>` / `<bitmap>`, platform, no GPU requirement
- [packages/ui/src/renderer.ts](../packages/ui/src/renderer.ts) — `createRenderer` from `@solidjs/universal`
- [packages/ui/src/nodes.ts](../packages/ui/src/nodes.ts) — `RasterSurface`, `BitmapProps`
- [packages/ui/src/dither.ts](../packages/ui/src/dither.ts) — Atkinson, Bayer, threshold
- [packages/ui/src/draw.ts](../packages/ui/src/draw.ts) — clipped raster paint
- [packages/quickdraw/src/lines.ts](../packages/quickdraw/src/lines.ts) — `MoveTo` / `LineTo` / `StdLine`
- [packages/sdk/docs/APP_DEV_GUIDE.md](../packages/sdk/docs/APP_DEV_GUIDE.md) — app-facing raster/bitmap contract
- [docs/color-quickdraw-research.md](color-quickdraw-research.md) — separate-package precedent
- [docs/solid-2-migration-plan.md](solid-2-migration-plan.md) — single `moduleName` at all compile sites
- [docs/physical-product-plan.md](physical-product-plan.md) — e-paper, packed frames, no assumed GL

### Solid / Three.js / R3F

- [solidjs-community/solid-three](https://github.com/solidjs-community/solid-three) — README, [src/solid.ts](https://github.com/solidjs-community/solid-three/blob/main/src/solid.ts), [src/web/Canvas.tsx](https://github.com/solidjs-community/solid-three/blob/main/src/web/Canvas.tsx), [src/core/index.tsx](https://github.com/solidjs-community/solid-three/blob/main/src/core/index.tsx), [src/core/renderer.ts](https://github.com/solidjs-community/solid-three/blob/main/src/core/renderer.ts)
- [solid/packages/solid/universal/README.md](https://github.com/solidjs/solid/blob/main/packages/solid/universal/README.md) — `createRenderer` contract, per-file pragmas
- [@solidjs/universal on npm](https://www.npmjs.com/package/@solidjs/universal)
- [R3F introduction](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)
- [R3F, How does it work?](https://docs.pmnd.rs/react-three-fiber/tutorials/how-it-works)
- [Three.js Creating a scene](https://threejs.org/docs/#manual/en/introduction/Creating-a-scene)
- [Three.js SVGRenderer](https://threejs.org/docs/pages/SVGRenderer.html)
- [Three.js WebGPURenderer manual](https://threejs.org/manual/en/webgpurenderer.html)
- [three.js Migration Guide](https://github.com/mrdoob/three.js/wiki/Migration-Guide) — CanvasRenderer / SoftwareRenderer removed
- [Remove CanvasRenderer, PR #15029](https://github.com/mrdoob/three.js/pull/15029)
- [Removed SoftwareRenderer, PR #17809](https://github.com/mrdoob/three.js/pull/17809)
- [three.js/src/math](https://github.com/mrdoob/three.js/tree/dev/src/math)

### 1-bit engines and algorithms

- [ssloy/tinyrenderer](https://github.com/ssloy/tinyrenderer)
- [tinyrenderer course notes](https://haqr.eu/tinyrenderer/)
- [tinyrenderer, z-buffer / painter's](https://haqr.eu/tinyrenderer/z-buffer/)
- [Inside Playdate 3.1.1](https://sdk.play.date/3.1.1/Inside%20Playdate.html)
- [Inside Playdate with C 3.1.1](https://sdk.play.date/3.1.1/Inside%20Playdate%20with%20C.html)
- [Playdate `drawSampled`](https://sdk.play.date/3.1.1/Inside%20Playdate.html#f-graphics.image.drawSampled)
- [nstbayless/mini3d-plus](https://github.com/nstbayless/mini3d-plus) — [scene.h](https://github.com/nstbayless/mini3d-plus/blob/main/mini3d-plus/scene.h), [mini3d.h](https://github.com/nstbayless/mini3d-plus/blob/main/mini3d-plus/mini3d.h) (z-buffer vs sort commentary)
- [aras-p/playdators](https://github.com/aras-p/playdators) — [readme](https://github.com/aras-p/playdators/blob/main/readme.md), [src/render.h](https://github.com/aras-p/playdators/blob/main/src/render.h) (`Mesh` / `MeshInstance` / draw flags / painter’s sort)
- [picoCAD](https://johanpeitz.itch.io/picocad)
- [lucatronica/picocad-web-viewer](https://github.com/lucatronica/picocad-web-viewer)
- Floyd & Steinberg, “An Adaptive Algorithm for Spatial Greyscale,” *Proc. SID* 17(2):75–77 (1976), [bib record](http://wwwisg.cs.uni-magdeburg.de/~stefans/npr/entry-Floyd-1976-AAS.html)
- [Tinrocket, Atkinson's description of his dither](https://2002-2010.tinrocket.com/projects/programming/graphics/00158/index.html)

### Apple 3D and QuickDraw

- [3D Graphics Programming with QuickDraw 3D (IM: QD3D)](https://dev.os9.ca/techpubs/mac/QuickDraw3D/QuickDraw3D-2.html)
- [About QuickDraw 3D](https://dev.os9.ca/techpubs/mac/QuickDraw3D/chap01_intro/QuickDraw3D-11.html)
- [QuickDraw 3D RAVE](https://dev.os9.ca/techpubs/mac/QuickDraw3DRAVE/QuickDraw3DRAVE-2.html)
- [Using QuickDraw 3D RAVE](https://dev.os9.ca/techpubs/mac/QuickDraw3DRAVE/QuickDraw3DRAVE-4.html)
- Apple Computer, *3D Graphics Programming with QuickDraw 3D*, Addison-Wesley, 1995, ISBN 0-201-48926-0
- [LineTo (IM: Imaging)](https://dev.os9.ca/techpubs/mac/QuickDraw/QuickDraw-83.html)
- [Images (IM: Imaging)](https://dev.os9.ca/techpubs/mac/QuickDraw/QuickDraw-12.html)

### Other engines and titles

- [Babylon.js NullEngine (no pixels)](https://github.com/BabylonJS/Documentation/blob/master/content/setup/support/serverSide.md)
- [Magnum (GPU middleware; custom renderer possible)](https://github.com/mosra/magnum/)
- [CubeCoders/Jet](https://github.com/CubeCoders/Jet) — ESP32 C++17 RGB565 rasteriser; AGPL + commercial; library fills a buffer (not 1-bit)
- [0015/a3d](https://github.com/0015/a3d) — ESP32 C++17 RGB565 tile raster + skeletal viewer; Apache-2.0; measured S3/P4/C6 (not 1-bit)
- [Super 3D](https://www.macintoshrepository.org/622-super-3d)
- [Swivel 3D](https://www.macintoshrepository.org/1496-swivel-3d)
- [Virtus WalkThrough 1.x](https://www.macintoshrepository.org/38511-virtus-walkthrough-1-x)
- [Infini-D 4.0](https://www.macintoshrepository.org/10227-infini-d-4-0)
- [Spectre (1991)](https://en.wikipedia.org/wiki/Spectre_(1991_video_game))

No implementation or tests were run as part of this research; only this note was added.
