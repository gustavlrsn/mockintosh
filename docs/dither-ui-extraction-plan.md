# Dither UI — standalone Solid UI kit extraction

Working plan, 13 September 2026; identity updated 18 September 2026. The kit stays **`@mockintosh/ui`**. The catalog site is **`ui.mockintosh.com`**. See [name research](ui-kit-name-research.md). **Dither UI** / `dither-ui` were working names only — do not publish under them.

## Product direction

Extract Mockintosh's reusable Solid renderer and controls into an independently usable UI kit for canvas and pixel framebuffers. Mockintosh becomes a consumer of that kit and a featured example on its website. Maintain one implementation: improvements to layout, controls, text, input, and rendering should benefit both projects.

Suggested positioning: **“Reactive interfaces for pixel displays.”** Explain immediately that developers compose Solid components and the kit handles layout, interaction, and drawing without requiring browser DOM rendering. Lead with small displays, focused tools, dashboards, creative interfaces, and testable headless rendering. Mockintosh demonstrates how far the kit can go; an early Macintosh appearance is one application of it.

The first release is deliberately monochrome. A browser canvas presents the same 1-bit output that a framebuffer host can consume. Broader appeal comes from useful controls, configurable typography and styling, a neutral default design, and examples outside desktop simulation. Full-color rendering is a separate future investment; changing a package name does not make the current rasterizer color-capable.

Success means an ordinary Solid developer can install published packages in a fresh project, build an interactive screen, display it on a canvas, and run the same view against an in-memory framebuffer without importing Mockintosh's OS, SDK, filesystem, or application registry.

## What exists and what needs extraction

The current implementation already contains most of a substantial kit. These observations come from the working tree, particularly [architecture](../ARCHITECTURE.md), [UI lifecycle](../packages/ui/src/ui.ts), and [M2 app building](m2-apps.md).

| Existing code | Reusable capability | Extraction work |
| --- | --- | --- |
| `packages/ui/src/renderer.ts`, `nodes.ts` | Solid universal renderer; retained box/text/image/raster tree | Replace global repaint hook with root ownership; narrow public node access; define invalid-element behavior |
| `layout.ts`, `draw.ts`, `measure.ts` | Layout, clipping, text measurement, painting | Keep implementation together behind a small lifecycle interface; preserve pixel behavior |
| `pointer.ts`, `focus.ts`, contexts | Hit testing, capture, focus, keyboard dispatch | Make root lifetime explicit; document input coordinates and cancellation |
| `components/` | Button, Checkbox, TextInput, TextEditor, ScrollView, Divider, Spacer | Separate appearance from behavior; consume instance-local fonts and theme |
| `fonts/`, `sprite.ts` | Bitmap fonts, text layout, glyphs, monochrome assets | Remove global font registry ownership; make Mockintosh symbol choices optional; preserve provenance |
| `inspection.ts` | Immutable semantic snapshots, clipped bounds, focus and password masking | Generalize `windowId` into optional host ownership metadata; preserve Mockintosh mapping |
| `packages/quickdraw` | Packed 1-bit drawing, bitmap operations, regions, drawing ports | Give reusable raster code independent packaging and explicit context ownership |
| `src/platform/web/CanvasPresenter.ts` | Packed bitmap presentation on canvas | Extract presentation; add an independently usable input/scheduling adapter |
| `src/platform/headless`, core typecheck | DOM-free host precedent, synthetic input and frame readback | Extract UI-only test host without storage or OS boot |
| Vite config, app template, both compilers | Universal JSX compilation and shared Solid runtime | Publish documented consumer build setup; migrate all renderer module references together |

This is more than moving a directory. `createUI` explicitly assumes one instance, `_setRepaintHook` is global, font registration is global, and QuickDraw stores current port/font functions/screen state in a singleton. Controls also contain fixed monochrome styling. Those are the main sources of coupling to resolve.

## Ownership and package shape

Start in the current monorepo so Mockintosh remains a continuously tested consumer. Establish independent package builds and external-consumer fixtures before moving repository ownership. Once the release candidate works, move the kit, its tests, docs, and generic examples to a dedicated repository, then have Mockintosh consume a pinned published version. A repository split must not leave two maintained copies.

Proposed public entry points, subject to the consumer spike:

| Entry point | Interface |
| --- | --- |
| `@mockintosh/ui` | UI lifecycle, host elements, widgets, fonts, and public types |
| `@mockintosh/ui/renderer` | Solid compiler target; generated code uses this stable entry |
| `@mockintosh/ui/web` | Canvas presentation, browser input, sizing, and frame scheduling |
| `@mockintosh/ui/vite` | Build-time `?dither=` assets |
| Independent raster package (`@mockintosh/quickdraw` today) | Packed 1-bit drawing and explicit drawing contexts |

Use entry points rather than separate packages for every internal module. The raster package earns separate ownership because Mockintosh's shell drawing and printing also use QuickDraw directly. Initially move and adapt the working implementation; do not combine extraction with a new rasterizer. Historical QuickDraw procedure compatibility can remain an adapter for existing callers, while ordinary kit users should not have to initialize QuickDraw globals or learn `GrafPort` to mount a view.

Keep these in Mockintosh: `bootOS`, window management and chrome, Finder, desktop icons, menubar, system-modal policy, app lifecycle, `@mockintosh/sdk`, VFS/kernel/shell, app compiler service, installation, persistence, accounts, and platform peripherals. Reusable controls can support inert subtrees and capture without knowing what an active Macintosh window is.

The UI kit must have no runtime dependency on a package named `@mockintosh/*`, application code, or root-repository path aliases at release. Mockintosh may depend on both the kit and raster package.

## Core interfaces and design decisions

### A deep UI module with explicit hosts

Keep one small lifecycle interface responsible for mounting a Solid tree, measuring/layout, drawing a frame, receiving normalized input, inspecting semantics, and disposal. Hosts supply a target surface and scheduling; optional services supply clipboard access. Do not inherit Mockintosh's full `Platform`, which also requires storage and OS-specific capabilities.

Use the existing `createUI` contract as the starting point. The consumer spike should determine the exact signatures for create/mount, frame, resize, input, inspect, and dispose. Avoid publishing mutable root nodes, focus-manager internals, or a raw current port as required application interfaces. Put genuinely necessary low-level access behind an explicitly documented advanced interface.

There are two immediate adapters at this seam: canvas in the browser and an in-memory packed framebuffer. A physical display driver consumes the latter with its own transport. Define width, height, stride, bit order, pixel polarity, coordinate origin, and buffer ownership. Preserve the current packed layout initially; drivers convert when their hardware requires a different layout. Document whether a presented buffer is borrowed until the next frame and require a copy or completion handshake for asynchronous transports.

A browser adapter owns CSS-to-logical coordinate conversion, pixel ratio/scaling, canvas focus, pointer capture, wheel normalization, and event unsubscription. It must respect browser scrolling and shortcuts outside its own focused surface. Browser clipboard/text-input integration is optional host behavior. Mockintosh continues to layer its menu shortcuts, window activation, and double-click policy above normalized input.

The first renderer can repaint the complete buffer. Do not claim dirty-region rendering or e-paper refresh optimization until implemented and measured. E-paper waveform selection, partial/full refresh policy, transport speed, rotation, and ghosting belong to device adapters. Device suitability requires a compatible JS runtime and measured resources; a framebuffer interface alone does not prove microcontroller support.

### Independent roots and lifetime

Require two UI roots to coexist safely in one JavaScript realm before the public release. This is necessary for a documentation page with multiple demos as well as embedded use.

- Associate node mutations and invalidation with the owning root, including insertion, removal, and disposal. Address nodes created before attachment and prohibit unsupported cross-root transfers explicitly.
- Own font registration, measurement, focus, pointer state, theme, and pending scheduling per instance. Shared immutable decoded assets are fine; mutable registries are not.
- Make raster drawing contexts explicit. Audit current-port, font hooks, region/polygon recording, and any other mutable QuickDraw state. Merely replacing `_setRepaintHook` does not solve isolation. A temporary save/restore adapter must be synchronous, exception-safe, and tested for nested raster callbacks; it is not a substitute for an established instance contract.
- Disposal cancels pending work, releases input capture, unsubscribes host events, and disposes the Solid tree. Disposing one root must not affect another. Define remount and resize behavior.
- Keep snapshots detached from mutable nodes; scope node references to an instance/lifetime so old references cannot target a new root.

This work removes a UI limitation. It does not by itself make every Mockintosh OS singleton safe for multiple boots, or isolate untrusted JavaScript.

### A neutral design with a Mockintosh theme

Add a small instance-scoped theme interface for foreground/background inks, emphasis/disabled patterns, typography roles, spacing, borders, corner radius, and visible focus. Keep pixel values and bitmap font metrics honest; avoid presenting the layout subset as browser CSS.

Move fixed control drawing choices into theme defaults and narrowly scoped component customization. Preserve a single control implementation for keyboard, pointer, selection, scrolling, and disabled state. Introduce slots or styling hooks only where the neutral and Mockintosh designs actually need different structure.

Ship a neutral monochrome theme demonstrated by a contemporary device dashboard or focused utility. Mockintosh supplies its classic theme, glyph additions, and OS chrome. Retain its current appearance through regression checks. Changing themes must update text measurement and layout consistently, not only paint colors.

Start with the existing control set. Add new controls when a real second example requires them. Defer a large component catalog, a general skin language, and color backends.

### Semantics, accessibility, and text

Preserve semantic names, roles, values, enabled/focused state, bounds, and password masking as a useful public capability for tests and automation. Replace the mandatory concept of a window with optional host metadata; the Mockintosh adapter preserves its existing window ownership and kernel validation. Snapshots describe a view; they do not grant permission to invoke callbacks or bypass input policy.

Canvas semantics alone do not provide browser accessibility. Document the initial support honestly. Include keyboard navigation and visible focus in release acceptance. Evaluate an optional DOM accessibility/text-input bridge with focus synchronization and native composition support; do not advertise screen-reader or IME support until end-to-end behavior is verified. Publish the actual glyph coverage, Unicode/fallback behavior, and text-editing limitations.

## Packaging and compatibility

Publish compiled ESM and declarations with correct export maps; consumers should not need this repository's TS/TSX transpilation rules. Build kit components with the universal renderer target. Provide one minimal Vite starter and the underlying Babel/Solid configuration so other build tools can reproduce it.

Declare Solid as a peer dependency and externalize its core, store, and universal runtime as appropriate. Verify supported package export conditions in browser and Node so headless rendering retains reactivity. Do not accidentally bundle a second Solid runtime in the kit, website examples, or Mockintosh app artifacts.

Audit JSX declarations: the current module augmentation introduces `box`, `text`, `image`, and `raster` into Solid's namespace. Prove typechecking and compilation when a normal DOM-rendered documentation site embeds kit demos. Use explicit compilation scopes or separate example modules; the website must not compile all HTML through the canvas renderer. Keep declaration-only files out of emitted runtime imports.

Migrate Mockintosh's root Vite configuration, browser and companion compilers, compiler type environment, allowed shared imports, app template, production/development import maps, runtime wrappers, SDK guide, and generated guide together. Maintain a temporary `@mockintosh/ui` and renderer compatibility facade that re-exports the exact same kit modules for existing SDK 2 artifacts. Preserve required old signatures through adapters where necessary; an import alias alone cannot repair changed behavior. Do not rewrite persisted built artifacts.

Define a compatibility table for kit version, Solid version range, Mockintosh SDK version, and artifact toolchain. Remove compatibility exports only through a separately announced SDK migration. Mockintosh's public SDK remains its own product even when applications import `@mockintosh/ui` widgets.

Before public distribution, inventory code, vendored Decker font data, added glyphs, sprites, and reference-derived graphics. Preserve required notices and establish redistribution rights for every shipped asset. Current package metadata declaring MIT is not evidence for every bundled asset; substitute independently redistributable defaults where provenance is unresolved. Check the working product/package/domain names at this stage.

## Delivery sequence and acceptance

### E1 — Prove standalone consumption

Create independent package build outputs and a fresh consumer fixture installed from packed artifacts. Render a small interactive settings panel without Mockintosh SDK, boot, storage, or root aliases. Use the existing raster implementation and current visual style first.

Acceptance: install, typecheck, production build, and run from the packed packages; button and text input respond; the same view renders into memory under Node without DOM globals. Record the baseline bundle size, frame cost, and text-editing behavior. No registry publication is needed for this milestone.

### E2 — Establish runtime and host ownership

Implement independent roots and UI-only web/headless adapters, with explicit surface and lifecycle contracts. Move mutable font and raster state behind the appropriate instance interfaces.

Acceptance: two views with different fonts, sizes, and themes remain independent during updates, resize, pointer capture, and disposal. Nested drawing and exceptions do not contaminate another view. A disposed view schedules no further frames or host input work. The core still compiles without DOM types.

### E3 — Separate design from application behavior

Introduce the neutral theme and a second, non-retro example. Move Mockintosh's visual choices into its theme and retain OS policy in its shell. Generalize inspection ownership metadata through an adapter.

Acceptance: the same controls serve a neutral dashboard and Mockintosh; each supports keyboard focus, disabled states, selection, scrolling, and clipboard where available. Existing Mockintosh window activation, modal behavior, screenshots, and named kernel controls still work. Publish the initial accessibility/text support matrix.

### E4 — Make Mockintosh the real consumer

Migrate the complete compiler/import-map/SDK integration using the compatibility facade. Remove duplicated renderer/control code and test against built package outputs, rather than development source aliases alone.

Acceptance: browser-local and companion Counter creation, build, editing, install, restart, restore, and reboot persistence pass. A saved artifact importing the old UI package still loads on the same reactive runtime. Human input and kernel automation agree. The app bundle does not contain a second Solid runtime. Printing and direct shell raster drawing retain their output.

### E5 — Release independently and launch the website

Move ownership to the standalone repository, publish an initial version after packaging/provenance checks, and pin Mockintosh to it. Keep the independent-consumer fixture in kit CI and a downstream Mockintosh integration check for release candidates. Prefer a documented release process over a cross-repository automation system at this stage.

Acceptance: a developer follows public docs in a clean project without private paths or unpublished workspace dependencies. Website examples use the released package. Mockintosh consumes that same release. Package contents, notices, source links, changelog, and compatibility policy are complete.

E1 → E2 → E3 → E4 → E5 is the preferred order. Keep each step runnable and retain Mockintosh as the regression consumer throughout. Estimate calendar time after E1 exposes packaging and raster-context work; avoid committing to a cosmetic-rename estimate.

## Website and examples

The website should answer “what can I build?” before explaining implementation. Use an ordinary accessible DOM site for documentation and embed the kit's canvases as demos.

- **Home:** concise positioning, a neutral interactive example, a short Solid code sample, and links to getting started and examples. State monochrome support plainly.
- **Getting started:** install, compiler configuration, mount on canvas, normalized input, cleanup, and production build. Offer a downloadable minimal project.
- **Components and theming:** live states alongside code; neutral and classic designs side by side. Multiple demos exercise independent roots.
- **Targets:** canvas, headless framebuffer, and a documented custom display adapter. Label hardware demos as simulated or physically verified, including the actual host/runtime.
- **Examples:** a focused utility, a monochrome dashboard, and Mockintosh. A printer or device example can follow once validated.
- **Mockintosh case study:** “A programmable desktop built with `@mockintosh/ui`.” Link to the working app and source; explain which parts come from the kit and which are OS features. Use a lazy iframe for the complete OS initially so its own boot/global assumptions do not contaminate the documentation page.
- **Reference:** lifecycle, layout subset, pixel format, fonts/assets, semantics, capabilities/limitations, and migration notes.

Mockintosh should link back with “Built with `@mockintosh/ui`.” It can remain the most ambitious showcase while the catalog at `ui.mockintosh.com` makes the kit's wider purpose clear. That site should be a 1-bit widget gallery, not a retro desktop.

## Verification and decision gates

Reuse current layout, pointer, focus, raster, font, renderer, and inspection tests in the extracted package. Add tests where extraction introduces a new contract: independent roots, cleanup, host coordinate conversion, packed-package consumption, JSX coexistence, and old-artifact compatibility. Prefer deterministic pixel assertions for fixed bitmap fonts plus behavioral input tests; screenshots alone do not prove controls work.

For each release candidate run the kit suite, DOM-free typecheck, clean consumer production build, and relevant Mockintosh integration checks. Measure initial bytes, idle work, input-to-frame latency, framebuffer allocation, and representative full-frame cost against E1's baseline. Set budgets from those measurements. Do not claim device performance based on a desktop browser benchmark.

Decisions to settle during the work:

| Decision | Working choice | Revisit when |
| --- | --- | --- |
| Product name | `@mockintosh/ui` + `ui.mockintosh.com` | Only if the kit outgrows the Mockintosh namespace |
| Initial raster scope | Packed 1-bit, arbitrary validated dimensions | A concrete second pixel format is needed |
| Default style | Neutral monochrome | Second example reveals missing customization |
| Repository | Incubate here, then independent kit repository | Packed consumer and Mockintosh migration pass |
| Raster ownership | Separate package; preserve working implementation | Explicit-context spike reveals the actual migration cost |
| Hardware claims | Adapter contract plus honest support matrix | A selected physical target passes input/render tests |
| Advanced compatibility | Temporary Mockintosh facades | A planned SDK migration can retire them |

The next concrete action is E1: package the existing UI and raster implementation sufficiently to run one independent interactive view on canvas and in memory. That establishes the extraction's real starting point while the larger product direction remains explicit.
