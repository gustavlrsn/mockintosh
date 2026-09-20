# App building on an ESP32

Research date: 2026-09-16. Complements [c-firmware-ts-os.md](c-firmware-ts-os.md) (who runs pixels) and [m2-apps.md](m2-apps.md) (who runs the compiler today). Moddable’s XS docs are the embedded primary source. No firmware was built.

## Short answers

| Question | Answer |
| --- | --- |
| Can the ESP32 *run* an installed app? | Yes, if the artifact is something XS can load and the SDK is already in the firmware. |
| Can it *compile* TSX like the browser does? | No. That toolchain does not fit, and it is the wrong ISA. |
| What’s stopping “compiler in ROM”? | Size, RAM, and the fact that today’s compiler is a V8/WASM desktop program, not a parser. |
| Can we write JS that needs no compile step? | Yes for authoring. The device still has to *parse or load bytecode*. |
| Build on a server, load dist on the ESP32? | **Yes — this is the path.** The kernel already splits `builder` from `loadArtifact`. |

The Macintosh analogy: the Plus did not ship MPW in ROM. People compiled on a bigger Mac (or bought a floppy). The 128K ran the application.

## What “building” is today

A user app is TSX. The browser/companion `BuildProvider` does **not** evaluate it. It:

1. Validates source ([buildPolicy.ts](../src/shared/buildPolicy.ts): ≤1 MB, ≤128 files, only relative + `solid-js` / `@mockintosh/ui` / `@mockintosh/sdk`).
2. Typechecks with the shipped SDK `.d.ts`.
3. Erases TypeScript (`ts.transpileModule`, JSX preserved).
4. Runs the Solid universal compiler (`@solidjs/compiler-wasm32-wasi`) so `<box>` becomes `createElement("box", …)` against `moduleName: "@mockintosh/ui/renderer"`.
5. Rolls the project into one ESM chunk with those packages **external**.

The artifact is a string of ESM. `Platform.loadArtifact` on the web is `import(blobUrl)`. [src/platform/web/index.ts](../src/platform/web/index.ts). The OS then `registerApp`s the default export.

Compiler assets are “about 12 MB before compression, plus a 577 KB parser,” loaded only when building. The Oxc WASM alone is ~5.8 MB and wants `crossOriginIsolated` shared memory. [m2-apps.md](m2-apps.md), [solid-2-migration-plan.md](solid-2-migration-plan.md).

`builder` and `loadArtifact` are already optional `Platform` slots. Pairing can point `builder` at the companion. An embedded host can omit `builder` and still implement `loadArtifact`. [ARCHITECTURE.md](../ARCHITECTURE.md), [src/platform/types.ts](../src/platform/types.ts).

## What’s stopping the compiler in ROM

“ROM” here means flash: typically 4–16 MB for the entire image (IDF, XS, OS, fonts, apps, file system).

1. **Wrong program.** The 12 MB toolchain is TypeScript + Oxc-on-WASI + Rollup-on-WASM. It expects a desktop JS engine and `wasm32`. ESP32-S3 is Xtensa; P4 is RISC-V. You cannot flash that `.wasm` and run it.

2. **Even a native port would not fit with the OS.** A hypothetical C rewrite of “tsc + Solid + rollup” is still megabytes of code plus megabytes of RAM for typecheck. The physical plan has not budgeted that next to a 1-bit shell.

3. **XS already has a parser. That is not this compiler.** Moddable can leave `eval` on the device. The *parser* is ~57 KB of flash; a full unstripped XS is still under ~400 KB on ESP32. [Moddable, Compiling JavaScript on Embedded Devices](https://moddable.com/blog/eval/). That compiles **JavaScript source to XS bytecode**. It does not erase TypeScript, transform JSX, resolve a project, or typecheck.

4. **RAM, not flash, is the real kill.** Hoddie: bytecode from `eval` lives in the chunk heap; “dynamically compiling … uses considerably more RAM for anything but trivial scripts.” Precompiled bytecode executes from flash and uses no RAM for the code itself. A Counter-sized ESM string is fine; a game + source maps is not.

5. **Language features get stripped.** Firmware builds drop unused JS (`Promise`, `Proxy`, `eval`, …). An `eval`’d app that uses a stripped feature throws `"dead strip"`. Keeping the full language costs flash and still does not give you TSX.

6. **The host key table.** XS stores property names used by the preloaded host in flash. A late-loaded script that invents many new names pays RAM and can fight a slim host. Mods exist to manage this; they are compiled **off-device**. [Mods](https://www.moddable.com/documentation/xs/mods).

So: putting *a* compiler in ROM is possible (the XS parser). Putting *our* compiler in ROM is not a flash-size tweak; it is a different product.

## Write JavaScript that doesn’t need compiling

Possible, and useful as a **source** dialect, not as a substitute for a loader.

Solid’s compiler output is ordinary function calls:

```js
import { defineApp, createSignal, Button } from "@mockintosh/sdk";
import { createElement } from "@mockintosh/ui/renderer";

export default defineApp({
  id: "counter",
  title: "Counter",
  Component() {
    const [count, setCount] = createSignal(0);
    return createElement("box", { padding: 8 }, [
      createElement("text", { font: "menu" }, "Counter"),
      Button({ label: String(count()), onClick: () => setCount((c) => c + 1) }),
    ]);
  },
});
```

A hyperscript `h("box", props, …)` is the same idea. ChatGippity can emit this as easily as TSX. Humans will not enjoy it; a desktop Source Editor can still show TSX and compile elsewhere.

What this does **not** remove:

- Someone must still turn a multi-file project into one graph of modules (or you forbid imports).
- The device must still **load** the script: `eval` (RAM) or bytecode (flash).
- `@mockintosh/ui` / `solid-js` must already be in the firmware. An app must not bundle a second Solid. That is already `external` in the browser builder.

A “JS-only SDK” is a good *authoring* SKU for the device (or for an agent). It is not “no toolchain exists.”

## Build on a server, load the dist on the ESP32

This is the architecture we already have, with a missing `loadArtifact` for XS.

```
┌──────── device (ESP32) ─────────┐     ┌──────── bigger computer ────────┐
│ Source Editor / ChatGippity     │     │ BuildProvider                   │
│   project_create, source_open   │────▶│  tsc + Solid + rollup           │
│                                 │     │  (companion, Vercel, laptop)    │
│ Disk: source + build record     │◀────│  artifact bytes                 │
│ loadArtifact(code) → registerApp│     │  optional: xsc / mcrun → .xsb   │
└─────────────────────────────────┘     └─────────────────────────────────┘
```

Today the “bigger computer” is the browser worker or the companion process. [m2-apps.md](m2-apps.md). A cloud `BuildProvider` is already sketched. [vercel-sandbox-research.md](vercel-sandbox-research.md). The device needs `fetch` (or USB pairing) and a loader. It does **not** need Oxc.

### Artifact formats the device could accept

| Format | Who produces it | How the ESP32 loads it | Cost |
| --- | --- | --- | --- |
| **ESM string** (today’s `BuildResult.code`) | Existing builder | `eval` / XS parse, imports resolve to **preloaded** SDK | One toolchain for web + device; RAM at install/launch; parser in firmware (~57 KB+) |
| **XS bytecode / mod** | Extra server step (`xsc` / `mcrun` against the same host keys) | Map the `.xsb` into flash; execute from flash | Best runtime; second toolchain; artifact is **not** what Chrome `import()`s |
| **Catalog binary** | We prebuild App Store titles for the device SKU | Same as a factory-linked app, just in a data partition | No on-device compile; no user-authored TSX unless they have a server |

Recommendation: **one source pipeline, two optional backends.**

- Always produce the ESM artifact (browser, tests, Path A Linux).
- For Path B, either `eval` that ESM on the device (small apps, parser in ROM) **or** the server also emits an XS mod when the target is `esp32`.
- App Store listings for the device ship the prebuilt mod. User-authored apps require pairing or an account that can run `BuildProvider`.

`loadArtifact` on ESP32 is therefore not `import(blob)`. It is “parse this ESM against the preloaded import map” or “install this mod.” `loadModule` (URL install) stays optional; catalog fetch can write the file and call `loadArtifact`.

### What must be in the firmware for any of this

- Solid + `@mockintosh/ui` + `@mockintosh/sdk` **preloaded** (mods cannot cheaply carry them). [runmod](https://github.com/phoddie/runmod): put shared modules in the host, not the mod.
- The same `createElement` helper names the Solid compiler emitted (`@mockintosh/ui/renderer`).
- A stable set of JS features (do not strip `Promise` if apps use `async`).
- Disk space for the artifact (OPFS analog: LittleFS / a flash partition).
- No second copy of QuickDraw/Solid inside the app bundle.

If the ESM uses syntax the slim host stripped, install fails with `"dead strip"`. The device SKU’s `buildPolicy` must match the host’s strip list, or the server must transpile down.

## Three product SKUs

| SKU | Builder on device? | How apps arrive | Feels like |
| --- | --- | --- | --- |
| **Appliance** | No | Factory-linked Finder + a few games | 128K with the apps in ROM |
| **Paired Macintosh** | No | Source on device; compile on companion/cloud; `loadArtifact` | Plus + a Lisa in the other room |
| **Self-hosting** | Yes (XS `eval` of JS-only apps, or a fantasy 12 MB toolchain) | Type JS in Source Editor, run | REPL. Fine for Counter. Not for TSX+typecheck |

Self-hosting TSX on ESP32 is the one to refuse. Self-hosting a JS hyperscript Counter via `eval` is a demo, not the App Store.

## What we would gain / lose

**Server-built dist (recommended)**

- Gain: same TSX apps on web and device; ChatGippity on-device can still `build_submit`; App Store is a file copy; flash stays OS-sized.
- Lose: a network or a cable at compile time; offline authoring of *new* TSX on the train; a second artifact (bytecode) if we refuse `eval`.

**JS-only, eval on device**

- Gain: no Solid compiler on the device; a REPL/education story; tiny apps iterate without a server.
- Lose: no types, no JSX, RAM for every install, `"dead strip"` footguns, not a substitute for games.

**Full toolchain in flash**

- Gain: the romance of MPW in ROM.
- Lose: the rest of the product. Flash, RAM, and a WASM runtime we do not have.

## Decision

Do not put Oxc/tsc/Rollup on the ESP32. Implement `loadArtifact` for a preloaded XS host. Keep `BuildProvider` off-device (companion first, cloud later). Optionally accept hand-written JS for a REPL. Optionally add an XS-bytecode backend when `eval` RAM shows up in the heap budget.

That is “people write programs on this Macintosh” without pretending the ESP32 is the compiler.

## Sources

- [m2-apps.md](m2-apps.md) — browser/companion builders, ~12 MB toolchain, `loadArtifact`
- [ARCHITECTURE.md](../ARCHITECTURE.md) — `builder` / `loadModule` / no installer on embedded
- [src/platform/types.ts](../src/platform/types.ts), [src/platform/web/index.ts](../src/platform/web/index.ts) — `import(blob)` today
- [src/shared/buildPolicy.ts](../src/shared/buildPolicy.ts) — source limits and externals
- [src/platform/web/builder/compiler.ts](../src/platform/web/builder/compiler.ts) — tsc erase + Oxc + Rollup
- [docs/c-firmware-ts-os.md](c-firmware-ts-os.md) — firmware vs OS
- [docs/vercel-sandbox-research.md](vercel-sandbox-research.md) — remote `BuildProvider`
- [Moddable, eval on embedded](https://moddable.com/blog/eval/) — parser ~57 KB; bytecode-from-eval in RAM; prefer off-device compile
- [Moddable, Mods](https://www.moddable.com/documentation/xs/mods) — user-installed XS modules, built with `mcrun`
- [phoddie/runmod](https://github.com/phoddie/runmod) — host vs mod, shared modules in the host
