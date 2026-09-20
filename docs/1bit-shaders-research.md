# Adding real GPU shaders without leaving the 1-bit QuickDraw screen

Research date: 2026-09-16. Official Shadertoy pages, Khronos / W3C / WHATWG specs, MDN (which cites those specs), Apple manuals, and this repository's source are the primary sources. Direct fetches of `shadertoy.com` on the research date were blocked by Cloudflare bot protection; quotations from those pages come from the search-indexed official documents at the cited URLs. This is an architectural recommendation, not an implemented service or app.

## Recommendation for Mockintosh

Add an optional platform **GPU / shader peripheral**, in the same family as `camera`, `video`, and `images`. The web host owns a hidden `OffscreenCanvas` + WebGL 2 context, compiles a user fragment shader, draws a fullscreen triangle, `readPixels` into an `ImageFrame`, and hands that RGBA buffer to the app. The app dithers with the existing `createDitherer` and blits 1-byte-per-pixel data through `<raster onPaint>` — the Photo Booth loop, with a GPU instead of a camera. Headless and embedded hosts omit the service. The first app declares `requires: ["gpu"]`.

Do **not** put WebGL on the OS screen, inside `@mockintosh/quickdraw`, or inside `@mockintosh/ui`. Do **not** route app shaders through the Three.js CRT in `src/3d/` (that path displays the finished 1-bit OS in colour 3D; it is the opposite direction). Do **not** let third-party apps import WebGL. RGB produced by a shader converts at the same boundary camera frames already use: `ImageFrame` → `toBits` / `createDitherer` → unpacked 1-bit → `RasterSurface.blitPixels`. That matches the Color QuickDraw note: colour arrives as a separate buffer and is reduced at a named conversion, never by bolting RGB onto the monochrome `BitMap`.

v1 is a single-pass Shadertoy-shaped `mainImage` with time, mouse, and resolution. No sound shaders, VR, cubemaps, video channels, or Buffer A–D. Do not fetch Shadertoy.com shaders automatically. Working name for the bundled app: **BitToy** (placeholder).

## What Shadertoy actually is

Shadertoy is a host for fragment shaders. The official howto states that the web client uses WebGL, and that native / iOS clients use OpenGL 2–4 or OpenGL ES. Image shaders implement `mainImage` so the host can compute a colour per pixel. The host, not the user shader, is responsible for feeding inputs and writing the returned colour to a pixel. The documented prototype is:

```text
void mainImage( out vec4 fragColor, in vec2 fragCoord );
```

`fragCoord` is in pixel units, ranging from 0.5 to resolution−0.5 over the rendering surface. Resolution arrives as the `iResolution` uniform. [Shadertoy, How To](https://www.shadertoy.com/howto).

The same page lists the per-frame uniforms:

```text
uniform vec3      iResolution;
uniform float     iTime;
uniform float     iTimeDelta;
uniform float     iFrame;
uniform float     iChannelTime[4];
uniform vec4      iMouse;
uniform vec4      iDate;
uniform float     iSampleRate;
uniform vec3      iChannelResolution[4];
uniform samplerXX iChanneli;
```

The new-shader comment block on Shadertoy's own editor restates the same contract and adds `iFrameRate`, types `iFrame` as `int`, and documents `iMouse` as “xy: current (if MLB down), zw: click”. Channel samplers are `samplerXX` because a channel may be 2D or cube. [Shadertoy, new shader](https://www.shadertoy.com/new).

The howto also documents two other entry points, which v1 should **not** implement:

| Entry | Prototype | Role |
| --- | --- | --- |
| Image | `void mainImage(out vec4 fragColor, in vec2 fragCoord)` | Colour per pixel |
| Sound | `vec2 mainSound(float time)` | Stereo audio sample |
| VR | `void mainVR(out vec4 fragColor, in vec2 fragCoord, in vec3 fragRayOri, in vec3 fragRayDir)` | Per-pixel ray in tracker space |

[Shadertoy, How To](https://www.shadertoy.com/howto).

The public site exposes Buffer A–D and a Multipass filter, and the howto's API section talks about shader `inputs` (`ctype` texture / video / keyboard / sound). The official howto does **not** specify a Common-tab include rule or a Buffer A–D ping-pong algorithm. Treat Common and multipass as later work whose exact host semantics need a first-party citation before we claim compatibility. An unofficial write-up describes Common as source included into every other tab, and Buffers A–D as offscreen passes sampled as `iChannel*`; that is useful context, not a spec. [shadertoy-unofficial, Special Shadertoy features](https://shadertoyunofficial.wordpress.com/2016/07/20/special-shadertoy-features/).

**Minimum v1 subset** (architectural proposal, implementing the documented Image contract):

- User writes a `mainImage` body (or we wrap one).
- Host supplies `iResolution`, `iTime`, `iTimeDelta`, `iFrame`, `iMouse`.
- `iDate` is cheap and documented; include it if the wrapper is already declaring uniforms.
- Skip `iSampleRate`, `iChannelTime`, `iChannelResolution`, `iChannel0–3`, `mainSound`, `mainVR`, cubemaps, webcam / video / keyboard / SoundCloud inputs, and Buffer A–D.

**Wrapping.** Shadertoy does not publish the exact GLSL preamble it concatenates. The howto only says the host must call `mainImage` and assign `fragColor`. A Mockintosh wrapper that implements that documented contract — declare the uniforms, compile as GLSL ES 3.00, and append a `main()` that calls `mainImage` — is a proposal, not a transcription of shadertoy.com. Greggman's WebGL Fundamentals lesson shows the same host-side idea (`main()` calling `mainImage`, uniforms renamed to `iResolution` / `iTime` / `iMouse`) as pedagogy, not as Shadertoy source. [WebGL Fundamentals, Shadertoy](https://webglfundamentals.org/webgl/lessons/webgl-shadertoy.html).

**License.** Shadertoy's terms: authors own their shaders and choose a license. If a shader has no license comment, the default is [CC BY-NC-SA 3.0 Unported](http://creativecommons.org/licenses/by-nc-sa/3.0/deed.en_US) (attribution, non-commercial, share-alike). Authors also grant Shadertoy a license to host and display the work for operating the site. The API howto says you may download shaders “to use them on your own software (check licenses)”, must respect each shader's license, and any product using the Shadertoy.com API must mention that it uses the API. [Shadertoy, Terms](https://www.shadertoy.com/terms); [Shadertoy, How To](https://www.shadertoy.com/howto).

Consequence for Mockintosh: do **not** ship a gallery fetched from shadertoy.com, and do **not** embed published Shadertoy sources in the repo, without per-shader license review. A BitToy that lets the *user* paste or type code they have the right to run is fine. First-party demo shaders we write ourselves are fine.

## What Mockintosh already has that this plugs into

These observations describe the tree as of the research date.

| Boundary | Finding |
| --- | --- |
| [ARCHITECTURE.md](../ARCHITECTURE.md) | Layering is `@mockintosh/quickdraw` → `@mockintosh/ui` → `src/os` → apps / SDK. The screen is one packed 1-bit QuickDraw `BitMap` (8 pixels/byte, MSB left, `1` = black). A 512×342 screen is 22 KB. Colour, if it returns, is a `PixMap` beside that `BitMap`, not RGB on the mono path. There is no HTML/CSS/WebGL *inside* the simulated screen. |
| [tsconfig.core.json](../tsconfig.core.json), `npm run check:core` | OS core, UI, SDK, QuickDraw compile with `lib: es2022` and no DOM types. WebGL / `OffscreenCanvas` / `window` cannot enter those trees. |
| [packages/ui/src/nodes.ts](../packages/ui/src/nodes.ts) | Apps never see packed bits. `<raster onPaint>` gets a `RasterSurface` (`setPixel` / `blitPixels` / `fill` + clipped `GrafPort`). `blitPixels` takes unpacked `Uint8Array`, `0` = white, nonzero = black. `<bitmap pixels>` is the retained form of the same buffer. |
| [packages/ui/src/dither.ts](../packages/ui/src/dither.ts) | `ImageFrame` is `{width, height, rgba: Uint8ClampedArray}`. `toBits` / `createDitherer` convert RGBA → 1 byte/pixel with `threshold`, `atkinson`, or `bayer` (4×4). Photo Booth and Video Player already use this. |
| [packages/sdk/src/media.ts](../packages/sdk/src/media.ts) | `ImageService`, `VideoService`, `CameraService` return `ImageFrame`. `AppScheduler` is `requestFrame` + `now()`. No GPU type exists. |
| [src/platform/types.ts](../src/platform/types.ts), [src/os/capabilities.ts](../src/os/capabilities.ts), [packages/sdk/src/index.ts](../packages/sdk/src/index.ts) | Optional peripherals (`images?`, `video?`, `camera?`, …) become capabilities. `Capability` is currently `"network" \| "clipboard" \| "printer" \| "camera" \| "video" \| "images" \| "browser"`. Apps declare `requires`; the OS refuses launch when a capability is missing. |
| [src/platform/web/media/](../src/platform/web/media/) | Web media uses hidden canvas + 2D `getImageData` (images: `OffscreenCanvas`; camera/video: `HTMLCanvasElement`). Apps never see those objects. |
| [src/platform/headless/index.ts](../src/platform/headless/index.ts) | Headless omits every optional peripheral. [capabilities.test.ts](../src/os/capabilities.test.ts) expects a bare headless platform to advertise no capabilities. |
| [apps/PhotoBooth.tsx](../apps/PhotoBooth.tsx) | The pattern to copy: `requires: ["camera"]`, `app.camera.open()`, `app.scheduler.requestFrame`, `createDitherer`, `<raster revision={frame()} onPaint>` → `surface.blitPixels`. |
| [src/os/appContext.ts](../src/os/appContext.ts) | `AppContext` forwards `images` / `video` / `camera` / `scheduler` from `OSServices`. A new service is one more optional field on that object. |
| [src/shared/buildPolicy.ts](../src/shared/buildPolicy.ts) | Third-party apps may import only `solid-js`, `@mockintosh/sdk`, `@mockintosh/ui`, `@mockintosh/ui/renderer`, `@mockintosh/agent`. Host globals such as `document` are banned. A shader runtime cannot assume user apps can import WebGL. |
| [src/3d/](../src/3d/) | Three.js `WebGLRenderer` plus a CRT shader that *displays* the OS framebuffer on a 3D Mac. Opposite direction (1-bit → colour 3D). Not an in-OS shader path. |
| [src/platform/web/CanvasPresenter.ts](../src/platform/web/CanvasPresenter.ts) | Every presented frame already expands the packed 512×342 `BitMap` to RGBA on a 2D canvas. Extra GPU→CPU traffic at window size sits on top of that existing expand. |
| [packages/ui/src/widgets/TextEditor.tsx](../packages/ui/src/widgets/TextEditor.tsx) | Multiline 1-bit editor widget. Source Editor already embeds it. Reusable inside a dedicated shader app; it is not itself a project builder. |
| [packages/fs/src/types.ts](../packages/fs/src/types.ts), [packages/fs/src/mime.ts](../packages/fs/src/mime.ts) | `fileTypes` + `inferMimeType` already open documents from the Finder. No `.glsl` / `.shade` mapping exists. `text/*` is readable via `readText`. |
| [docs/color-quickdraw-research.md](./color-quickdraw-research.md) | Colour should be a separate package / `PixMap`. Conversion (including dither) happens at one boundary. Shader RGB is the same kind of foreign buffer. |
| [docs/1bit-3d-research.md](./1bit-3d-research.md) | Offscreen WebGL → dither is already called out as a valid *web-host app trick*, not an OS 3D primitive. This note designs that trick as a real peripheral. |

## Recommended architecture (SDK service + app)

This section is a design sketch, not an implemented API.

### Why a peripheral

Camera, video, and images already prove the pattern: the web platform hides DOM/`OffscreenCanvas`; the SDK exposes a named service; the OS derives a capability from service presence; headless omits it; the app stays SDK-clean and paints through `<raster>`. A GPU that compiles user GLSL is the same kind of machine feature — present on a desktop browser, absent on a panel or in Node tests. [ARCHITECTURE.md, Platform layer](../ARCHITECTURE.md); [src/os/capabilities.ts](../src/os/capabilities.ts).

Name the capability after the hardware (`"gpu"`) and the service after what apps do with it (`shaders`), or name both `gpu` to match `camera`/`camera`. Proposal: capability `"gpu"`, service `Platform.gpu` / `useApp().gpu`, description *“a GPU for compiling shaders”*. Either naming is fine if it is consistent in `Capability`, `platformCapabilities`, `DESCRIPTIONS`, and `AppContext`.

### Proposed SDK types

```ts
/** How the fragment source should be wrapped before compile. */
export type ShaderDialect = "shadertoy" | "glsl-es-300";

export interface ShaderSource {
  dialect: ShaderDialect;
  /** User GLSL. `shadertoy`: a `mainImage` body. `glsl-es-300`: a full fragment shader. */
  fragment: string;
}

export interface ShaderCompileError {
  ok: false;
  stage: "compile" | "link" | "context";
  infoLog: string;
}

export interface ShaderMouse {
  /** Current fragment-space x/y while the button is down; 0,0 when up. */
  x: number;
  y: number;
  /** Click position (Shadertoy `iMouse.zw`); 0,0 if never clicked. */
  clickX: number;
  clickY: number;
  down: boolean;
}

export interface ShaderDrawState {
  time: number;
  timeDelta: number;
  frame: number;
  mouse?: ShaderMouse;
  /** Calendar uniform; omit if the host should leave `iDate` at zero. */
  date?: { year: number; month: number; day: number; seconds: number };
}

export interface ShaderProgram {
  readonly width: number;
  readonly height: number;
  resize(width: number, height: number): void;
  /**
   * Draw one frame into an RGBA `ImageFrame` (same contract as `camera.frame()`).
   * The service owns the buffer; the caller must copy or dither before the next draw.
   */
  draw(state: ShaderDrawState): ImageFrame;
  dispose(): void;
}

export interface ShaderService {
  compile(source: ShaderSource, size: { width: number; height: number }): Promise<ShaderProgram | ShaderCompileError>;
}
```

`compile` is async so the web implementation can create a context, compile/link, and optionally poll `KHR_parallel_shader_compile` without pretending the GPU is synchronous. `draw` is sync and cheap at window size, matching `CameraSource.frame()`. Uniforms are a single `ShaderDrawState` rather than a bag of `setUniform` calls: v1 only has the Shadertoy Image uniforms, and a typed object keeps the SDK explicit.

RGBA vs already-1-bit: **return `ImageFrame`**. Same type camera, video, and `images.decode` already return. The app chooses Atkinson vs Bayer vs threshold, exactly as Photo Booth does. A future colour `PixMap` can consume the same frame. Returning packed bits from the service would hide the colour, freeze the dither policy inside the platform, and force every consumer to unpack if they wanted a different conversion. GPU-side Bayer can be a later *opt-in* on `ShaderDrawState` (or a second `drawToBits` method) without changing the RGBA default.

### Web implementation (proposal)

Lives only in `src/platform/web/` — the same rule as [src/platform/web/media/](../src/platform/web/media/). Suggested shape:

1. Construct `new OffscreenCanvas(w, h)` and `getContext("webgl2")`. WHATWG defines `OffscreenCanvas.getContext` for `"webgl"` / `"webgl2"` / `"webgpu"`; the WebGL 2 spec creates a `WebGL2RenderingContext` on an `HTMLCanvasElement` or `OffscreenCanvas`. [WHATWG HTML, canvas](https://html.spec.whatwg.org/multipage/canvas.html); [WebGL 2.0 Specification](https://registry.khronos.org/webgl/specs/latest/2.0/).
2. Compile a trivial vertex shader (fullscreen triangle) plus the wrapped fragment. `shaderSource` → `compileShader` → `attachShader` → `linkProgram` → `useProgram`, checking `COMPILE_STATUS` / `LINK_STATUS` and `isContextLost()`. [WebGL 1.0 Specification, GLSL](https://registry.khronos.org/webgl/specs/latest/1.0/).
3. Draw, then `readPixels(0, 0, w, h, RGBA, UNSIGNED_BYTE, pixels)` **in the same turn** (`preserveDrawingBuffer` defaults to false; the spec says in-turn `readPixels` is the portable way to read the drawing buffer). [WebGL 1.0 Specification, drawing buffer](https://registry.khronos.org/webgl/specs/latest/1.0/).
4. Flip rows. `readPixels` origin is the **lower-left** pixel. [MDN, readPixels](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/readPixels). `ImageData` / our `ImageFrame` (and the 2D `getImageData` camera path) are **top-left**. [WHATWG HTML, ImageData](https://html.spec.whatwg.org/multipage/canvas.html). Without a flip, Shadertoy Y and Photo Booth Y disagree.
5. Return `{width, height, rgba}` as `ImageFrame`. The app dithers and blits.

v1 can stay on the main thread, like camera/video. OffscreenCanvas + WebGL is also exposed in workers ([MDN, OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas); WHATWG `Exposed` includes `Worker`), which is a later move if compile or draw janks the shell.

If `getContext("webgl2")` returns `null`, omit `platform.gpu` so the OS reports the Macintosh has no GPU. Do not silently fall back to a JS interpreter and claim `"gpu"`.

### App loop (proposal)

BitToy, bundled, SDK-clean, `requires: ["gpu"]`:

```text
compile on text change
  → app.scheduler.requestFrame
    → program.draw({ time: (now - start) / 1000, timeDelta, frame, mouse })
    → createDitherer(w, h, mode)(frame, bits)
    → setFrame(n + 1)
<raster width={previewW} height={previewH} revision={frame()}
        onMouseDown/onDrag/onMouseUp  → iMouse
        onPaint={surface => surface.blitPixels(bits, w, h)} />
```

Uniforms:

| Shadertoy | Mockintosh source |
| --- | --- |
| `iResolution` | Preview raster size (window body, or a pane inside it) as `vec3(w, h, 1)`. Not the 512×342 screen unless the window is fullscreen and the raster fills it. |
| `iTime`, `iTimeDelta`, `iFrame` | `app.scheduler.now()` and a frame counter. |
| `iMouse` | `<raster>` pointer handlers already deliver local x/y ([nodes.ts, MouseEventHandlers](../packages/ui/src/nodes.ts)). Map to Shadertoy's xy-if-down / zw-click. Remember that fragment Y is bottom-up after the host flip policy is chosen — pick one convention and apply it to both `fragCoord` and `iMouse`. |
| `iDate` | `Date` via a small SDK helper, or omit in v1. |

Resolution is the **raster**, not the CRT, not the browser window.

### Editor, files, channels

- **Editor.** A dedicated BitToy window: `TextEditor` + preview raster + a dither menu. Do not overload Source Editor; that app is the project/kernel editor ([apps/SourceEditor.tsx](../apps/SourceEditor.tsx)).
- **Files.** Add `MIME.glsl = "text/x-glsl"` (or `text/plain`) and `inferMimeType` for `.glsl` / optionally `.shade`. BitToy declares `fileTypes`. Finder opens via existing `FileDocumentProps` + `readText`. `text/*` is already a text type in [mime.ts](../packages/fs/src/mime.ts). This is a proposal; `text/x-glsl` is not an IANA-registered type in the OS today.
- **Channels.** v1: none. A later `setChannel(0, ImageFrame)` can upload `texImage2D` from bytes the `images` service already decoded, staying CORS-clean because the bytes came through our decoder, not a raw cross-origin `<img>`. WebGL forbids non-CORS cross-origin textures precisely because shaders can time-attack texel values. [WebGL 1.0, Origin Restrictions](https://registry.khronos.org/webgl/specs/latest/1.0/).

### Security

User GLSL compiled in the page is confined by the WebGL implementation: no DOM, no filesystem, no network from the shader. That is not hang-proof. The WebGL spec's “Defense Against Denial of Service” section says it is **not possible** to impose structural limits that prevent long-running shaders, and that user-agent safeguards (draw-call timing, OS watchdogs, a separate GPU process) are **recommended but unspecified**. There is no application-facing “run this draw for at most N ms” API. `WEBGL_lose_context` only *simulates* loss; `KHR_parallel_shader_compile` only lets you poll compile/link completion without stalling. [WebGL 1.0, DoS](https://registry.khronos.org/webgl/specs/latest/1.0/); [KHR_parallel_shader_compile](https://registry.khronos.org/webgl/extensions/KHR_parallel_shader_compile/); [WEBGL_lose_context](https://registry.khronos.org/webgl/extensions/WEBGL_lose_context/).

Do not compile or run shaders on the server. Do not auto-fetch the Shadertoy API. Surface compile/link `infoLog` in the BitToy window. On `webglcontextlost`, dispose and show a dialog; require an explicit recompile after restore.

### Performance (envelope, not a benchmark)

A 512×342 RGBA `readPixels` is 512 × 342 × 4 = 700,416 bytes. A typical document-window preview around 300×200 is 240,000 bytes. At 30 Hz that is about 21 MB/s or 7 MB/s of readback. Atkinson over the same pixels is one sequential pass ([dither.ts](../packages/ui/src/dither.ts)). The presenter already expands the full 512×342 packed screen to RGBA every frame ([CanvasPresenter.ts](../src/platform/web/CanvasPresenter.ts)). Extra GPU → CPU → dither → pack → present at these sizes is acceptable on that arithmetic. Measure before optimizing; do not invent a software GLSL fallback “for speed.”

## Dither / 1-bit conversion policy

Keep v1 conversion on the CPU, in the app, with `createDitherer`. That is what Photo Booth already does, it is testable without a GPU, and it leaves the visible 1-bit look as an app/OS choice rather than a GPU accident.

| Algorithm | Why it matters | GPU fit |
| --- | --- | --- |
| Threshold | Luminance cut. Already in `dither.ts`. | Trivial in a fragment shader. |
| Ordered / Bayer | Tile a threshold matrix; each pixel is independent. Bayer 1973 is the canonical 4×4 / power-of-two construction. [B. E. Bayer, “An Optimum Method for Two-Level Rendition of Continuous-Tone Pictures,” IEEE ICC 1973, pp. 11–15](https://en.wikipedia.org/wiki/Ordered_dithering). IBM later notes ordered dither “can be done in parallel since the threshold values are all preassigned.” [Stucki, IBM J. Res. Dev. 26(6), 1982](https://bitsavers.org/pdf/ibm/IBM_Journal_of_Research_and_Development/266/ibmrd2606F.pdf). Our 4×4 `BAYER_MAP` is this family. | Natural fragment-shader or LUT. |
| Error diffusion (Floyd–Steinberg, Atkinson) | Sequential: each pixel's quantization error is pushed to neighbours not yet visited. Floyd & Steinberg, “An Adaptive Algorithm for Spatial Grey Scale,” *Proc. SID* 17 (1976), 75–77. Atkinson's Macintosh-era kernel (six neighbours, 1/8 each, 2/8 discarded) is what Photo Booth defaults to; it is not a separately published paper in the sources reviewed. Our implementation is [dither.ts `atkinsonTo1bit`](../packages/ui/src/dither.ts). | Hard as a *single* fragment shader; needs ping-pong, compute, or CPU. |
| Blue-noise / void-and-cluster | Ulichney's method builds an isotropic ordered-dither array by relaxing voids and clusters. [R. Ulichney, “Void-and-cluster method for dither array generation,” Proc. SPIE 1913, 1993, pp. 332–343](https://doi.org/10.1117/12.152707). | GPU-friendly as a tiled LUT, same as Bayer. |

**Policy.** v1: RGBA from the GPU, Atkinson or Bayer on the CPU (user-selectable, Photo Booth menus). Later: optional Bayer (or a void-and-cluster texture) *inside* the host wrapper as a post-pass, still producing `ImageFrame` or 1-bit bytes at the service boundary — never inside QuickDraw. Do not embed third-party Shadertoy “1-bit dither” sources as our converter; the default license is CC BY-NC-SA 3.0.

Apple's historical analogue is offscreen colour → `CopyBits` / `ditherCopy` onto a 1-bit destination, not a programmable GPU. 32-Bit QuickDraw 1.2 (1990) already dithered to one-bit indexed destinations. [Apple Technical Note QD01](https://leopard-adc.pepas.com/technotes/qd/qd_01.html); [docs/color-quickdraw-research.md](./color-quickdraw-research.md). GWorlds are offscreen rasters. The original 128K/512K/Plus had no programmable shading hardware. Do not claim otherwise.

## Shader language and wrapping

| Language | What the specs say | Fit |
| --- | --- | --- |
| GLSL ES 1.00 | WebGL 1 must accept only GLSL ES 1.00. [WebGL 1.0 Specification](https://registry.khronos.org/webgl/specs/latest/1.0/). `texture2D`, `gl_FragColor`, no `#version 300 es`. | Older Shadertoy pastes. |
| GLSL ES 3.00 | WebGL 2 `SHADING_LANGUAGE_VERSION` is `WebGL GLSL ES 3.00`. [WebGL 2.0 Specification](https://registry.khronos.org/webgl/specs/latest/2.0/). `#version 300 es` must be first; fragment colour is a declared `out`; sampling is `texture()`. [GLSL ES 3.00 Specification](https://registry.khronos.org/OpenGL/specs/es/3.0/GLSL_ES_Specification_3.00.pdf). | Current Shadertoy dialect (`texture()`, `int iFrame`, `mainImage` `out`/`in`). |
| WGSL | “WGSL is the shader language for WebGPU.” [W3C, WGSL](https://www.w3.org/TR/WGSL/). `GPUDevice.createShaderModule` takes a WGSL string. [MDN, createShaderModule](https://developer.mozilla.org/en-US/docs/Web/API/GPUDevice/createShaderModule). | Shadertoy GLSL cannot run as-is. Translation is not a Web API. Google Dawn's Tint and wgpu's naga are engine compilers, not something a page can call. |

**v1 language: GLSL ES 3.00 + a Shadertoy wrapper.** Request `webgl2`. Prepend `#version 300 es`, precision, uniform declarations, and a fragment `out`. Append:

```glsl
void main() {
  vec4 color;
  mainImage(color, gl_FragCoord.xy);
  fragColor = color;
}
```

That implements the documented `mainImage` contract. `gl_FragCoord.xy` is already at pixel centres (0.5 …), which matches the howto's `fragCoord` range. Users who write a full `#version 300 es` fragment (`dialect: "glsl-es-300"`) skip the wrapper. Reject `#version` in `shadertoy` bodies so we do not emit two version lines.

An unofficial 2017 note claims Shadertoy moved its web client to WebGL 2 on 2017-02-15. That is not a first-party citation; the official howto still says “WebGL.” The editor's own uniform block is nevertheless the GLSL ES 3.00-shaped dialect (`texture` / `samplerXX` / `int iFrame`). [shadertoy-unofficial, WebGL 2.0 vs 1.0](https://shadertoyunofficial.wordpress.com/2017/02/16/webgl-2-0-vs-webgl-1-0/).

**Single-channel readback.** WebGL 1 `readPixels` portably accepts `RGBA` / `UNSIGNED_BYTE`, plus one implementation-chosen `IMPLEMENTATION_COLOR_READ_FORMAT` / `TYPE` pair. [WebGL 1.0, readPixels](https://registry.khronos.org/webgl/specs/latest/1.0/). WebGL 2 adds `RED`, but the default drawing buffer is still an RGBA surface. Reading `RED` from it is not a portable v1 path. Keep RGBA; luminance happens in `dither.ts`. A later R8 framebuffer for GPU-side 1-bit is option D, not v1.

## Options considered

### A. Platform `gpu` / `shaders` peripheral — **recommended**

Described above. Matches camera/video, keeps the core DOM-free, works for BitToy *and* later live wallpaper / effects apps, and fails closed on headless / e-paper.

Trade-offs: web-only at first; compile errors and GPU hangs are real; Shadertoy compatibility is a subset, not a clone; `readPixels` every frame is extra work (fine at these resolutions).

### B. App-only hidden canvas — **reject as the architecture**

A privileged bundled app that imports WebGL the way `src/3d` does. Breaks the “bundled apps are SDK-shaped” rule in [ARCHITECTURE.md](../ARCHITECTURE.md). Cannot ship as a third-party bundle ([buildPolicy.ts](../src/shared/buildPolicy.ts)). Does not help a second app. Acceptable only as a weekend prototype that is then deleted or rewritten against option A.

### C. Software GLSL / JS shade functions — **fallback, not the product**

A CPU `shade(x, y, uniforms) → luma` or a software GLSL interpreter would run headless and on e-paper. It is not “real shaders.” The user asked for GLSL/WGSL compiled on a GPU. Keep option C in mind as an honest `requires`-free sketch app later; do not advertise it as `gpu`.

### D. WebGPU compute writing packed 1-bit — **later, not v1**

WGSL compute can `textureStore` into a storage texture ([WebGPU Samples](https://webgpu.github.io/webgpu-samples/); W3C WGSL). Attractive for an e-paper host that wants bits without an RGBA round-trip. Shadertoy culture is fragment `mainImage`, not WGSL compute. Translation is a project. Safari/WebGPU availability is a moving target and not assumed here. Revisit when we want packed GPU output, not when we want paste-a-Shadertoy.

## v1 scope vs later

| v1 | Later |
| --- | --- |
| Optional `Platform.gpu` + `"gpu"` capability | Same service on a future desktop-class embedded host |
| WebGL 2 + GLSL ES 3.00 + `mainImage` wrapper | `glsl-es-300` dialect; maybe WebGL 1 fallback for `texture2D` pastes |
| `iResolution`, `iTime`, `iTimeDelta`, `iFrame`, `iMouse` (`iDate` optional) | Keyboard texture, `iFrameRate` |
| No channels | One `ImageFrame` channel via `images` (and later camera) |
| No Buffer A–D, no Common | Multipass once we cite or define host semantics |
| No `mainSound`, no `mainVR`, no cubemaps, no video / mic / SoundCloud | Never, unless product demand is explicit |
| CPU Atkinson / Bayer | Optional GPU Bayer / blue-noise LUT; WebGPU packed 1-bit |
| BitToy editor + `.glsl` files + first-party demos we write | User gallery of *their* files; no automatic Shadertoy scrape |
| Main-thread OffscreenCanvas | Worker compile/draw if the shell janks |
| Compile errors in the window | Parallel-compile polling via `KHR_parallel_shader_compile` |

## App sketch — BitToy (placeholder name)

**BitToy** is a working title, not a product name. Alternatives that are equally fine: Shade, Dithertoy. It should look like Photo Booth's cousin, not like VS Code.

```text
┌─ BitToy ─────────────────────────────────────┐
│ File  Edit  Dithering                        │
├──────────────┬───────────────────────────────┤
│              │  // BitToy                    │
│   <raster>   │  void mainImage(out vec4 o,   │
│   preview    │       in vec2 p) {            │
│   (1-bit)    │    vec2 u = p/iResolution.xy; │
│              │    o = vec4(u, 0.0, 1.0);     │
│              │  }                            │
│              │           <TextEditor>        │
├──────────────┴───────────────────────────────┤
│ Atkinson ●  Bayer ○     Compile error: …     │
└──────────────────────────────────────────────┘
```

`defineApp` sketch (proposal):

- `id: "bittoy"`, `title: "BitToy"`, `requires: ["gpu"]`
- `fileTypes: [MIME.glsl]` (once defined)
- `scrollable: false`, resizable, `defaultSize` large enough for preview + editor
- Menus: File (New / Open / Save — ordinary `fs` + `writeFile`), Dithering (Atkinson / Bayer, Photo Booth style), maybe Play/Pause time
- `onOpen`: if `FileDocumentProps`, `readText` and compile; else a first-party hello-`mainImage` we author
- Paint path identical to Photo Booth: `revision` + `blitPixels`
- About box: one sentence that this Macintosh has no colour screen, so the GPU's RGB is dithered

A second consumer (live desktop pattern, a “shader poster” document) should be possible against the same `app.gpu` without opening BitToy. That is the test that option A is the right seam.

## Open questions / risks

1. **Y-axis convention.** Shadertoy `fragCoord.y` grows up. Our rasters and `iMouse` local coordinates grow down. The wrapper must pick one: flip `fragCoord`/`iMouse` into Shadertoy space and flip `readPixels` rows into `ImageFrame` space. Get this wrong and pasted shaders and mouse interaction both invert.
2. **How much Shadertoy is enough?** Many “simple” toys still sample `iChannel0` noise. v1 with zero channels will reject a lot of pastes. That is acceptable if the window says so. A single generated noise `ImageFrame` is tempting and is still a product decision.
3. **Compile bombs / infinite loops.** No standard API stops them. The browser GPU process may reset and fire `webglcontextlost` on *every* page. BitToy must survive that.
4. **License scrape temptation.** The Shadertoy API is documented and easy. Default CC BY-NC-SA 3.0 plus per-author licenses make an in-OS “Browse Shadertoy” feature a legal review, not an afternoon.
5. **WebGL 2 availability.** If a host has WebGL 1 only, v1 should omit `"gpu"` rather than half-support GLSL ES 1.00 unless we later add a second dialect.
6. **Context loss vs. multiple apps.** Two shader apps sharing one hidden context is a lifetime mess. Prefer one `OffscreenCanvas` per `ShaderProgram` (or a small pool) and `dispose()` from `onCleanup`.
7. **E-paper.** A panel host with no GPU will not run BitToy. That is correct. A later software shade or pre-dithered movie is option C, not a fake `"gpu"`.
8. **Color QuickDraw.** If a `PixMap` package arrives, shader RGBA should feed *that* conversion boundary, not a third dither. Until then, `dither.ts` is the boundary.

## Sources

### This repository

- [ARCHITECTURE.md](../ARCHITECTURE.md)
- [docs/color-quickdraw-research.md](./color-quickdraw-research.md)
- [docs/1bit-3d-research.md](./1bit-3d-research.md)
- [packages/ui/src/nodes.ts](../packages/ui/src/nodes.ts), [packages/ui/src/dither.ts](../packages/ui/src/dither.ts), [packages/ui/src/widgets/TextEditor.tsx](../packages/ui/src/widgets/TextEditor.tsx)
- [packages/sdk/src/media.ts](../packages/sdk/src/media.ts), [packages/sdk/src/index.ts](../packages/sdk/src/index.ts) (`AppContext`, `Capability`, `fileTypes`)
- [packages/fs/src/types.ts](../packages/fs/src/types.ts), [packages/fs/src/mime.ts](../packages/fs/src/mime.ts)
- [src/platform/types.ts](../src/platform/types.ts), [src/platform/headless/index.ts](../src/platform/headless/index.ts), [src/platform/web/media/](../src/platform/web/media/), [src/platform/web/CanvasPresenter.ts](../src/platform/web/CanvasPresenter.ts)
- [src/os/capabilities.ts](../src/os/capabilities.ts), [src/os/appContext.ts](../src/os/appContext.ts)
- [src/shared/buildPolicy.ts](../src/shared/buildPolicy.ts), [tsconfig.core.json](../tsconfig.core.json)
- [apps/PhotoBooth.tsx](../apps/PhotoBooth.tsx), [apps/VideoPlayer.tsx](../apps/VideoPlayer.tsx), [apps/SourceEditor.tsx](../apps/SourceEditor.tsx)
- [src/3d/main.ts](../src/3d/main.ts), [src/3d/screenShader.ts](../src/3d/screenShader.ts)

### Shadertoy / GLSL culture (first-party or labelled otherwise)

- [Shadertoy How To](https://www.shadertoy.com/howto) — `mainImage`, uniforms, sound, VR, API license reminder
- [Shadertoy Terms](https://www.shadertoy.com/terms) — authorship, default CC BY-NC-SA 3.0, site license
- [Shadertoy new shader](https://www.shadertoy.com/new) — editor uniform comment block
- [The Book of Shaders](https://thebookofshaders.com/) — Patricio Gonzalez Vivo & Jen Lowe; pedagogical GLSL, not a runtime we should adopt
- [twigl.app](https://twigl.app/) / [doxas/twigl](https://github.com/doxas/twigl) — first-party tweet-sized colour GLSL editor (classic mode claims GLSLSandbox uniforms). Colour toy, not 1-bit.
- [GLSL Sandbox](https://glslsandbox.com/) — colour fragment-shader gallery (site was in maintenance mode on the research date)
- [shadertoy-unofficial](https://shadertoyunofficial.wordpress.com/2016/07/20/special-shadertoy-features/) — Common / Buffer A–D; **not** first-party
- [WebGL Fundamentals, Shadertoy](https://webglfundamentals.org/webgl/lessons/webgl-shadertoy.html) — pedagogical wrapping; **not** Shadertoy source

### WebGL / WebGPU / HTML

- [WebGL 1.0 Specification](https://registry.khronos.org/webgl/specs/latest/1.0/) — GLSL ES 1.00, `readPixels` formats, drawing-buffer preservation, DoS/watchdogs, origin restrictions, compile/link
- [WebGL 2.0 Specification](https://registry.khronos.org/webgl/specs/latest/2.0/) — OpenGL ES 3.0, `OffscreenCanvas`, `SHADING_LANGUAGE_VERSION`
- [GLSL ES 3.00 Specification](https://registry.khronos.org/OpenGL/specs/es/3.0/GLSL_ES_Specification_3.00.pdf)
- [KHR_parallel_shader_compile](https://registry.khronos.org/webgl/extensions/KHR_parallel_shader_compile/)
- [WEBGL_lose_context](https://registry.khronos.org/webgl/extensions/WEBGL_lose_context/)
- [WHATWG HTML, canvas / OffscreenCanvas](https://html.spec.whatwg.org/multipage/canvas.html)
- [MDN OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas), [MDN OffscreenCanvas.getContext](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas/getContext), [MDN readPixels](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/readPixels)
- [W3C WebGPU Shading Language](https://www.w3.org/TR/WGSL/), [MDN GPUDevice.createShaderModule](https://developer.mozilla.org/en-US/docs/Web/API/GPUDevice/createShaderModule)
- [WebGPU Samples](https://webgpu.github.io/webgpu-samples/)

### Dithering (canonical papers)

- B. E. Bayer, “An Optimum Method for Two-Level Rendition of Continuous-Tone Pictures,” *IEEE International Conference on Communications*, 1973, pp. 11–15
- R. W. Floyd and L. Steinberg, “An Adaptive Algorithm for Spatial Grey Scale,” *Proceedings of the SID* 17 (1976), 75–77
- R. Ulichney, “Void-and-cluster method for dither array generation,” *Proc. SPIE* 1913 (1993), 332–343, [doi:10.1117/12.152707](https://doi.org/10.1117/12.152707)
- P. Stucki, “Image Processing for Document Reproduction,” *IBM J. Res. Develop.* 26(6) (1982) — ordered dither is parallel; [PDF](https://bitsavers.org/pdf/ibm/IBM_Journal_of_Research_and_Development/266/ibmrd2606F.pdf)

### Macintosh / adjacent 1-bit

- [Apple, Using Basic QuickDraw](https://dev.os9.ca/techpubs/mac/QuickDraw/QuickDraw-20.html) — offscreen graphics worlds on basic QuickDraw
- [Apple Technical Note QD01](https://leopard-adc.pepas.com/technotes/qd/qd_01.html) — `ditherCopy` to 1-bit
- [Decker](https://beyondloom.com/decker/) and [Decker reference manual](https://github.com/JohnEarnest/Decker/blob/main/docs/decker.md) — 1-bit / HyperCard-adjacent creative coding already next to this project (fonts, `.deck`). The official manual has **no** GLSL/WebGL/shader API; John Earnest's GLSL work lives in a separate project (Special-K), not in Decker.

No implementation or tests were run as part of this research; only this note was added.
