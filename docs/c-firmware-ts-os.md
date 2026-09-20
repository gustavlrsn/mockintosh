# C firmware, TypeScript OS

Research date: 2026-09-16. This is an architectural option, not a commitment to rewrite QuickDraw or to ship an ESP32 product. Apple’s 1984 split (native Toolbox, programmable apps) and Moddable’s XS-in-C / FFI docs are the primary precedents. No C was added to the tree as part of this note.

## Recommendation

Keep the **operating system and app authoring in TypeScript**. Introduce a small **C pixel-and-device library** with one ABI, bound differently on each host. Do not move Solid, the window manager, the kernel, the file system, or `@mockintosh/sdk` into C. Do not start by porting all of `@mockintosh/quickdraw`.

Call the C library something like `libmockbits` (headers `mockintosh/bits.h`). It owns packed 1-bit buffers and the loops that touch every pixel: `BitBlt` / `CopyBits` guts, Atkinson/Bayer, the qd3d scanline fill, and on a microcontroller the panel/camera/printer drivers. TypeScript keeps GrafPort state, regions, pictures, layout, apps, and policy.

That is the Macintosh split restated. 1984 put QuickDraw in assembly and applications in Pascal. We already said the same about a 3D engine: [1bit-3d-research.md](1bit-3d-research.md) (C-shaped rasterizer, TS scene). The physical-product plan already reserved native for scan, camera, and print. [physical-product-plan.md](physical-product-plan.md).

The only WASM in the repo today is **the Solid/Oxc compiler** (`@solidjs/compiler-wasm32-wasi`), used when building apps, not when painting a frame. [docs/solid-2-migration-plan.md](solid-2-migration-plan.md). Runtime pixels are 100% TypeScript. This document is about a *second*, runtime, use of native code.

## What the machine already is

The core compiles without DOM types. Hosts implement `Platform`. `InitGraf` allocates `screenBits` unless the display owns one (`display.framebuffer`, for DMA-backed panels). The shell hands that same `BitMap` to `createUI` and to `present()`. [ARCHITECTURE.md](../ARCHITECTURE.md), [src/platform/types.ts](../src/platform/types.ts).

A `BitMap` is already a C struct in TypeScript clothing:

```ts
interface BitMap {
  baseAddr: Uint8Array;  // packed 1-bit, MSB leftmost, 1 = black
  rowBytes: number;      // 16-bit word padded
  bounds: Rect;
}
```

A 512×342 screen is 22 KB. Those bytes are what a panel driver, an ESC/POS printer, and a C blitter all want. `CanvasPresenter` is the web-only expansion of the same bytes to RGBA. [src/platform/web/CanvasPresenter.ts](../src/platform/web/CanvasPresenter.ts).

`core-env.d.ts` allow-lists globals that “browsers, Node, and **Moddable XS**” share. QuickJS is called out as needing timer/codec polyfills. The embedded JS host has been a named target since that file was written. [src/platform/core-env.d.ts](../src/platform/core-env.d.ts).

## The split

```
TypeScript                              C (libmockbits)
────────────────────────────────        ────────────────────────────────
bootOS, windows, menus, dialogs         panel scan / DMA present
Solid tree, layout, hit-test            camera capture → 1-bit (device)
apps, SDK, in-OS builder                printer UART / ESC/POS stream
kernel, FS policy, Disk                 BitBlt / CopyBits inner loop
GrafPort, regions, pictures, fonts      Atkinson / Bayer / blue-noise
qd3d Scene, Mesh, MeshInstance          qd3d scanline + pattern stamp
scheduler / input policy                raw GPIO, crank/keys, SPI
```

Two rules:

1. **C never imports the OS.** It takes pointers, lengths, and POD structs. No GrafPort, no Solid node, no `Platform` object.
2. **TypeScript never includes C.** It calls a generated or hand-written binding. `@mockintosh/quickdraw`’s public functions stay the API apps and UI already use; the implementation of the *pixel* step may be native.

If a function needs a `GrafPort` or a region handle, it stays in TypeScript (or becomes a larger QuickDraw-in-C project — see [What we would not move first](#what-we-would-not-move-first)).

## The ABI

One header, compiled once, linked three ways. Sketch only — names can move:

```c
/* mockintosh/bits.h — packed 1-bit, Macintosh BitMap layout */
typedef struct {
  uint8_t *baseAddr;
  int16_t  rowBytes;
  int16_t  top, left, bottom, right;
} MBits;

void mbits_fill(MBits *dst, uint8_t ink /* 0 white, 1 black */);
void mbits_copy(const MBits *src, MBits *dst,
                int16_t sL, int16_t sT, int16_t sR, int16_t sB,
                int16_t dL, int16_t dT, int16_t dR, int16_t dB,
                int mode /* srcCopy / srcOr / srcXor / srcBic */);

void mbits_dither_atkinson(const uint8_t *rgba, int w, int h, uint8_t *out);
void mbits_dither_bayer(const uint8_t *rgba, int w, int h, uint8_t *out, int cut);

void mbits_tri_pattern(uint8_t *buf, int rowBytes, int width, int height,
                       const float p0[3], const float p1[3], const float p2[3],
                       const uint8_t pattern[8]);
void mbits_tri_bluenoise(uint8_t *buf, int rowBytes, int width, int height,
                         const float p0[3], const float p1[3], const float p2[3],
                         uint8_t shade, const uint8_t *noise);
```

This is PlayDators’ `draw_tri_pattern(bitmap, rowstride, …)` plus the QuickDraw `BitMap` we already have. TypeScript `qd3d` would project and sort, then call `mbits_tri_*` per face. TypeScript QuickDraw would clip and pick a mode, then call `mbits_copy`.

Golden tests stay in TypeScript: build a `BitMap`, run the op, compare bytes to a fixture. The C path and the current TS path must match until the TS inner loop is deleted.

## How each target binds

The ABI does not change. The **glue** does. Microcontrollers cannot `dlopen` a game’s `.so` at runtime; Moddable says so for FFI mods. [XS FFI](https://www.moddable.com/documentation/xs/XS%20FFI). So firmware C is linked at image-build time. Desktop C can be WASM (one binary for every JS host) or a native library.

| Host | JS engine | How C is present | Who owns `baseAddr` | `present()` |
| --- | --- | --- | --- | --- |
| **Browser** | V8 | `libmockbits` → WASM (Emscripten / WASI / Zig). Same module as Node. | Allocate the 22 KB screen **inside WASM** (or a `SharedArrayBuffer` view). JS `BitMap.baseAddr` is a `Uint8Array` onto that memory. | `CanvasPresenter` stays TS, or a C expand-to-RGBA if we measure it |
| **Headless / vitest** | Node | Same `.wasm` | Same as browser | Read-back of the `Uint8Array` for tests — no new oracle |
| **Linux HDMI (Path A)** | Chromium (browser build) *or* XS/QuickJS in a small process | WASM if we keep the browser; `.so` if we ship a native host | WASM heap, or POSIX shared memory / mmap for a kiosk | HDMI / Modos driver in C; `present` is a pointer handoff |
| **ESP32-S3/P4 (Path B)** | Moddable XS (named in `core-env.d.ts`) | Statically linked. Bind with [XS `native()`](https://moddable.com/blog/new-native-api-in-xs/) or [XS FFI buffers](https://www.moddable.com/documentation/xs/XS%20FFI) (`uint8_t*`, offset, length) | `display.framebuffer`: C allocates DMA-capable SRAM/PSRAM. JS is handed a view. JS must not relocate it. | C kicks the panel scan. JS never expands to RGBA |

PlayDators already ships the 3D half of this on the web: C rasterizer, Emscripten, 1-bit buffer. [aras-p/playdators](https://github.com/aras-p/playdators) (`cmake --preset emscripten-release`). We would not vendor their game; we would copy the *binding shape*.

```
                    ┌──────────── TS OS (one source) ────────────┐
                    │  bootOS → createUI → qd3d.draw(surface)    │
                    └───────────────┬────────────────────────────┘
                                    │ mbits_* 
              ┌─────────────────────┼─────────────────────┐
              ▼                     ▼                     ▼
        WASM (web/Node)      .so (Linux host)     static lib (ESP32)
        V8 / Node            XS or V8             Moddable XS
        canvas present       HDMI / Modos         DMA panel
```

`Platform.loadModule` stays absent on firmware: third-party apps are linked into the image or omitted. That is already the documented App Store rule. [ARCHITECTURE.md](../ARCHITECTURE.md). The in-OS TypeScript builder is a **web/companion** feature; it does not compile C and it does not run on the ESP32 image.

## Memory ownership (the load-bearing constraint)

C cannot blit a `Uint8Array` that the JS GC moved. Three legal patterns:

1. **C allocates, JS views.** Firmware and WASM default. `InitGraf(display.framebuffer)` already means this. The view is detached from JS heap movement (WASM memory is the heap; XS can pin a host buffer).
2. **JS allocates, C is passed a pointer for the duration of one call.** Fine for a dither of a photo that lives in JS. Not fine for `screenBits` that C and a DMA engine share across frames.
3. **Copy every frame.** Safe and slow. Acceptable for a prototype WASM BitBlt; forbidden for a 30 Hz panel.

`present(screen)` on a panel is “the scan hardware now owns this `baseAddr` until vsync.” The physical plan already requires that. JS must not mutate a buffer being scanned. Double-buffer in C (two 22 KB screens) if the JS frame loop and the panel scan overlap.

## Full QuickDraw in C — valid later, not “use the ROM”

The incremental plan above (blit first) is the default. A **complete** C QuickDraw is a reasonable *second* product if Path B is real and we want one Toolbox for WASM and firmware. It does not get us the 1984 sources “for free.”

### What the original package actually is

`reference/QuickDraw` (CHM-licensed 1984 dump) is:

| Piece | Role | Runs on |
| --- | --- | --- |
| `QuickDraw.p`, `GrafUtil.p` | Published API (types, traps, comments) | Lisa/MPW Pascal compiler, 68k |
| `*.a` (`BitBlt.a`, `RgnBlt.a`, `Lines.a`, …) | The implementation | 68000 Macintosh ROM |

Pascal is the *header*. Assembly is the *engine*. There is no C. Color QuickDraw in SuperMario is later 68k and **has no license** — reading source only; do not transcribe it. [color-quickdraw-research.md](color-quickdraw-research.md).

Shipping those `.a` files means a **68000**. We are not that machine (browser = WASM/x86/ARM, ESP32 = Xtensa or RISC-V). The adaptation policy already says the TS port is not a 68k emulator. [ARCHITECTURE.md](../ARCHITECTURE.md) §QuickDraw.

So: **assembly + TypeScript in one package is not “Pascal + asm, but TS instead of Pascal.”** Vite cannot assemble 68k into a `BitMap`. The honest mappings are:

| Idea | What it really is | Do it? |
| --- | --- | --- |
| Keep `.a` as the spec, implement in TS | Today. `file:line` comments. | Yes |
| Keep `.a` as the spec, implement in C | A second fidelity port, same eight deviations (handles → malloc, traps → functions, …) | Yes, if we want native QD |
| Mix 68k `.a` into the TS package and call it | A 68k interpreter/JIT (Mini vMac) | No — different product |
| New asm for *our* CPU (RISC-V blitters) | `libmockbits` inner loops, not Atkinson’s listing | Only if C is still too slow |
| Auto-translate 68k → C | Unreadable C that still assumes 68k handles and A5 | No |

TypeScript already plays the Pascal role: the public barrel *is* `QuickDraw.p`. A C port should keep that barrel as thin FFI (`OpenPort`, `LineTo`, …) so UI and tests do not move.

### Does full C improve architecture or capabilities?

**Capabilities.** Language does not restore `RgnBlt`, packed regions, or picture recording. Those are missing *algorithms* in the TS port ([quickdraw-fidelity-plan.md](quickdraw-fidelity-plan.md) R1–R3). Fix them in TS or in C; C does not fix them by existing.

**Architecture, on a microcontroller.** Yes: one GrafPort in C, `thePort` a pointer, `screenBits.baseAddr` the DMA buffer, no WASM copy, no GC of region handles mid-blit. That is closer to 1984 than TS. Apps still never include C.

**Architecture, in the browser.** A C QD compiled to WASM is a second implementation we must golden-test against the current suite. Until the C port is *the* port, we pay twice. The win is shared code with firmware, not prettier canvas.

**Fidelity process.** Transcribe C from the **CHM assembly**, not from `packages/quickdraw/src`. The TS is a peer port, not the original. Pixel fixtures stay language-independent.

If we commit to full C QD, the TS package becomes bindings + `./bits` helpers, and the incremental “only BitBlt in C” phase collapses into that project. Do not run both as long-term dual oracles.

## What we would not move first

**Not all of QuickDraw on day one.** Regions, pictures, `RgnBlt`, and `grafProcs` are a year-class fidelity port in *any* language. Prefer **`BitBlt` / packed copy** (and new code: dither, qd3d) behind the existing TS functions until Path B or a profiler forces the rest. A full C Toolbox is a later fork of this plan, not a contradiction of it.

**Not Solid, not layout, not the kernel.** Those are the reason the product is a computer. C here is a firmware tax with no pixel win.

**Not app authoring.** Games and desktop apps stay TSX. They call `scene.draw(surface)` and `<raster>`. They never see `libmockbits`. The SDK builder still only accepts `.ts`/`.tsx`. [buildPolicy.ts](../src/shared/buildPolicy.ts).

**Not the Oxc WASM compiler.** It is a build tool. It does not paint. Do not conflate “we already have WASM” with “pixels are native.”

## Suggested phases

### 0 — ABI on paper, TS still implements it

Write `bits.h` and a TypeScript module that *is* the ABI (`@mockintosh/bits`). QuickDraw and a future qd3d call that module, not `setBit` scattered around. Headless tests lock bytes. No C yet. This is the Color QuickDraw move: a package boundary before a second implementation.

### 1 — New C only (dither + 3D scanline)

Implement Atkinson/Bayer and `mbits_tri_*` in C. Bind WASM for web/Node. Keep the TS versions as the test oracle until they match, then delete the TS inner loops. This is the PlayDators look on desktop, and the first native win that does not fight QuickDraw fidelity.

### 2 — `mbits_copy` behind `CopyBits`

C BitBlt, same modes as today. TS `CopyBits` still does clipping, scaling policy, and region walks; it calls C for the rectangle of bits. Fidelity tests in `packages/quickdraw/tests` must stay green.

### 3 — Device C, on a real host

Path A: `present` as a C driver if we leave the browser. Path B: XS `native()` wrappers, `display.framebuffer` in DMA RAM, camera/print as already planned. The OS TypeScript is the same tree, compiled for XS (subset + preload) rather than Vite.

### 4 — Only if measured

More QuickDraw in C. A C GrafPort. A second language for the shell. None of these are implied by phases 0–3.

## What we would gain

- **A 30 Hz 1-bit game on a microcontroller** that Chrome already runs in TS. Scanline fill and dither are the loops PlayDators wrote in C for a reason.
- **One pixel format from app to panel to printer.** C `present` and ESC/POS both consume `MBits`. No RGBA on the device path.
- **DMA without lying.** `display.framebuffer` becomes a real pointer, not a TS object the GC happens not to move.
- **An honest Platform story.** Web = WASM blit + canvas expand. Device = same blit + hardware present. Headless = same blit + byte compare.
- **A rewrite hatch for qd3d** that we already wanted: TS scene, C `draw_tri_pattern`.
- **Leave-the-door-open without a rewrite.** If Path A (Linux + browser) is the product, WASM C is optional. If Path B fails heap/GC, we have somewhere to put the pixels besides “start over in C.”

## What we would lose

- **One language.** CI grows a C toolchain (CMake or Zig, Emscripten or WASI, ESP-IDF). Reviewers must read C. AI-assisted OS work stays in TS; blitters do not.
- **A second oracle.** Until C matches TS fixtures, every QuickDraw or dither change is done twice. If we skip the TS oracle, we skip the fidelity suite.
- **Binding tax.** WASM memory model, XS `native()` vs FFI, and (on Linux) a `.so` are three glues around one ABI. Get the ABI wrong and we glue it three times.
- **Debuggability of a frame.** Today a missed pixel is a TS stack in vitest. A C blit is a core dump on device and a WASM trap in Chrome.
- **No C in user apps.** Firmware cannot load a game’s native plugin (`dlopen` is not an MCU feature). A third-party 3D game extends `qd3d` in TypeScript or it does not ship on the device. That is acceptable; it must be stated.
- **XS is not V8.** Preload, a smaller standard library, and no `import(blob)` of Vite ESM. The *source* of the OS can stay TS; the *image* is an XS-compiled subset. How apps still get onto the device (server build, JS-only `eval`, not Oxc in flash) is [esp32-app-building.md](esp32-app-building.md).
- **Time.** Phase 1 is weeks. Phase 2 is a careful month if CopyBits stays pixel-identical. Phase 3 is a product. A full QuickDraw-in-C is a year-class project and is not this plan.

## Gains and losses by target

| | Browser / Path A (Linux HDMI) | Headless | ESP32 Path B |
| --- | --- | --- | --- |
| Gain if we add C | Maybe 3D fill headroom; almost nothing for the shell | Faster golden-image tests, same bytes | The difference between 5 Hz and 30 Hz; DMA present; camera |
| Lose | WASM download and COOP/COEP already paid for Oxc; a second `.wasm` | Extra test binary | Heap still held by XS + Solid; C only saves the inner loop |
| If we never add C | Fine. This is today’s product | Fine | 3D games and camera preview become the “validate JS engine” experiment; they may fail |

So: **C is not required to justify TypeScript**, and **TypeScript is not a dead end on ESP32**. C is how Path B absorbs the pixel budget without throwing away the OS.

## Decision

Adopt the *boundary* now (phase 0): one module that looks like `bits.h`, implemented in TypeScript. Do not compile C until a slice 1 3D game or a panel prototype misses its frame budget, or until we start an ESP32 platform tree.

When we do compile C, start with **new** code (dither, qd3d scanline, drivers), not a second QuickDraw. Keep the OS programmable.

## Sources

- [ARCHITECTURE.md](../ARCHITECTURE.md) — `BitMap`, `display.framebuffer`, `present`, layering
- [src/platform/types.ts](../src/platform/types.ts) — Platform display / loadModule
- [src/platform/core-env.d.ts](../src/platform/core-env.d.ts) — browsers, Node, Moddable XS
- [src/platform/web/CanvasPresenter.ts](../src/platform/web/CanvasPresenter.ts) — TS expand-to-RGBA
- [packages/quickdraw/src/types.ts](../packages/quickdraw/src/types.ts) — `BitMap` layout
- [docs/quickdraw-fidelity-plan.md](quickdraw-fidelity-plan.md) — why a full C QuickDraw is a second port
- [docs/physical-product-plan.md](physical-product-plan.md) — native for scan/camera/print; validate embedded JS
- [docs/1bit-3d-research.md](1bit-3d-research.md) — TS engine, C-shaped rasterizer
- [docs/solid-2-migration-plan.md](solid-2-migration-plan.md) — Oxc WASM is the compiler, not the framebuffer
- [src/shared/buildPolicy.ts](../src/shared/buildPolicy.ts) — apps are TS/TSX only
- [Moddable, XS in C](https://moddable.com/documentation/xs/XS%20in%20C) — host callbacks, native classes
- [Moddable, Native API](https://moddable.com/blog/new-native-api-in-xs/) — `native()` / `Native()` for TypeScript-friendly bindings
- [Moddable, XS FFI](https://www.moddable.com/documentation/xs/XS%20FFI) — `uint8_t*` buffers; no `dlopen` on MCUs
- [Moddable, ESP32](https://www.moddable.com/documentation/devices/esp32)
- [PlayDators Emscripten build](https://github.com/aras-p/playdators) — C 1-bit rasterizer in the browser
