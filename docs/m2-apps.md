# M2 app-building slice

Mockintosh can now create a Counter project, compile its source, run it, edit and rebuild it, restart it, and restore its previous build. Source, compiled artifacts, and the selected build persist on the Mockintosh disk. This delivers the app-building slice of M2; shell S2 pipelines/scripts and a general multi-file project editor remain subsequent work. ChatGippity can drive the same traps (create, write, build, install, inspect, click) from a conversation; `/api/chat` only completes one model turn.

## Use it in the visible computer

1. Run `npm run dev` and open the local URL. No companion, token, or pairing is required.
2. Open **Source Editor** from the Apple menu. **New Counter** creates a project in the role-based Applications folder. The default app id is `counter`; use Terminal to create additional projects with different ids.
3. Click **Build & Run**. The browser worker typechecks and compiles the source; Counter opens when installation succeeds.
4. Return to Source Editor and change `count() + 1` to `count() + 5`. Build & Run saves and rebuilds. The new Counter starts at zero and adds five.
5. **Restore** launches the previous successful build. It changes the selected artifact; it does not overwrite your newer source text.

The editor supports multiline insertion, arrow keys, Home/End, Shift selection, Select All, dragging a selection, indentation, scrolling, and clipboard operations when available. It shows modified state and build diagnostics, moving to the first diagnostic's line. Its current editing surface is `src/index.tsx` in the selected project; helper source files can be written through the VFS. Save compares the loaded file revision, preserving unsaved text if another writer changed the file. Load asks before discarding an unsaved buffer. Save before closing the editor window.

Finder recognizes directories containing `mockintosh.json`: double-click launches a registered app, or opens Source Editor before the first install. Selecting a project bundle or its generated desktop shortcut enables **File → Open Source** and **Show Package Contents**.

## Terminal, CLI, and MCP

In Terminal:

```text
project /disk/Applications/Counter.app counter Counter
build --run /disk/Applications/Counter.app
edit /disk/Applications/Counter.app
restart counter
restore counter
instances
```

`build path` prints the completed build id without installing it. `install path build-id` selects that explicit successful artifact. Use the actual Applications path if you renamed its folder. `help` describes the commands; leading `--json` retains structured output.

The same commands work through `mockintosh-sh --connect <session> -c '<commands>'` and MCP `run_shell`. Explicit `--headless` uses an isolated ephemeral disk, the same compiler, and a platform module loader that shares the headless runtime.

Direct tools are `project_create`, `source_open`, `build_submit`, `build_status`, `build_cancel`, `app_install`, `app_restart`, `app_restore`, and `instances`. A submitted build returns immediately with an id and `building` state; poll status until `succeeded`, `failed`, or `cancelled`. Build status/cancellation belong to the submitting caller.

## Ownership and persistence

A kernel caller owns cleanup. Revocation and shutdown cancel its work and dispose its shell sessions. Terminal and RPC use one `ShellManager`, including timeout/output limits and cancellation. Open Terminal sessions last until closed; idle RPC sessions expire on later session creation after five minutes, or are evicted under the 128-session bound. `shell_close` closes an explicit session. Outcome retention is independent of shell-session retention and remains bounded.

Build jobs are caller-owned local work. Closing their editor, disconnecting the submitting caller, cancelling a shell build, or ending the boot requests cancellation. The companion runs each compiler in a child process, with a 60-second limit; cancellation terminates the worker. The parent removes its temporary workspace even when the worker is terminated. These are not durable server jobs and do not continue after a device closes.

The project module owns source snapshots, build records, and selected builds. The platform supplies compilation and module loading. Source snapshots include node ids and revisions; sources changing during a snapshot cause a conflict. Each successful build is written to a new `dist/<buildId>/` directory with `index.js`, a source map, and metadata recording its source revision, artifact revision, and toolchain. Generated artifacts are service-owned; editing their code makes them ineligible for loading until rebuilt. The files remain inspectable through the VFS.

Installing a new build checks its source revision against current source. A stale result remains available on disk but is not silently installed as current. Restart and Restore deliberately select already-installed versions. The selected and previous build ids are persisted in `project-installs.json` under Preferences. A single desktop shortcut is maintained for the installed app.

Each actual app launch owns its windows and cleanup. `AppContext.onCleanup()` registers cleanup for timers/subscriptions, including work created in `onOpen`; Solid effects created there have an owned root. `AppContext.keepAlive()` explicitly retains an instance for background work and returns its release function. Without retained work, closing the last window ends the instance. Restart closes owned windows through the store and disposes resources before launching the selected build. Window reordering does not intentionally create a new app instance.

Compilation or preflight validation failure leaves the running build intact. Initialization failure after a switch restores the prior registration and selected build. Startup artifact failures remain inspectable through `/projects/installed`, and Restore can recover the previous build. Filesystem persistence is not a transaction across every file: a persistence failure can require state inspection and retry. Same-realm infinite loops cannot be preempted; reload remains the recovery route for a hung app. Loaded ESM modules may remain cached until reload.

## Compiler scope

The editable source-project descriptor is `mockintosh.json`:

```json
{"id":"counter","title":"Counter","entry":"src/index.tsx","sdkVersion":"2"}
```

This descriptor names source for the fixed compiler. Existing published App Store manifests continue to use their SDK compatibility range and compiled entry URL; the older installation format is preserved.

Both compiler providers accept SDK 2 projects with at most 128 source resources and 1 MiB of source text. It supports relative JS/TS/JSX/TSX modules and the shared imports `solid-js`, `solid-js/store`, `@mockintosh/sdk`, `@mockintosh/ui`, and `@mockintosh/ui/renderer`. It does not execute project build scripts, install arbitrary dependencies, or execute app source on the companion. TypeScript diagnostics include source locations; Solid JSX compiles for the universal canvas renderer. Source maps are stored with artifacts for inspection.

The browser supplies its own `BuildProvider` by default. It lazily loads a module worker containing TypeScript, Babel with the Solid universal preset, Rollup, and the shipped SDK type environment. Each build owns a worker; completion, cancellation, timeout (60 seconds), or caller shutdown terminates it. All compiler assets are served by the same website, including Rollup's WebAssembly parser; no CDN, account, or compiler server is contacted. The compiler assets are substantial (about 12 MB before compression, plus a 577 KB parser) but are loaded only when building, not when opening the desktop. This does not add offline website caching.

Source limits, allowed shared imports, and TypeScript options are shared with the companion compiler in `src/shared/buildPolicy.ts`. Browser typechecking uses the actual shipped SDK sources/declarations. Each provider records its toolchain in the artifact. Pairing a companion selects its compiler while connected; disconnect restores the browser provider for subsequent builds. In-flight remote builds still cancel on disconnect and are never automatically replayed locally. The companion remains useful for external CLI/MCP access and compilation on another machine.

The browser loads bundled ESM through `Platform.loadArtifact`; temporary Blob URLs never become durable manifest entries. Development import-map wrappers and prebundled Solid core/store/universal exports keep installed apps on the same reactive runtime as the OS. Production import maps refer to the bundled runtime entries.

## Verification

The original M2 slice was verified on 10 September with 218 tests, TypeScript checks, a production build, and the browser/MCP/editor workflow. On 11 September, companion-free browser compilation passed all 219 tests across 34 files, all three TypeScript checks, and the production build. It adds shared-policy coverage and a real browser test: `npm run test:browser-build` (first install its browser with `npx playwright install chromium`). It exercises Source Editor build/edit/rebuild, Counter clicks, Restore, OPFS reload persistence, type and SDK errors, relative modules, cancellation, and emitted production worker/artifact loading. It runs on an isolated browser disk without installing or pairing the companion bridge.

Automated coverage includes real compiler/type errors, the full isolated app workflow, reload persistence, artifact recovery, source conflicts, multiline UI editing, caller cleanup, and retained background ownership. `npm test` includes child compiler processes and loopback transport tests.

A real stdio MCP/browser demonstration is available in `scripts/builder/demo.ts`. It expects a paired companion on port 4320 by default and a private token file at `/tmp/mockintosh-m2-connection.json`; override `MOCKINTOSH_PORT`, `MOCKINTOSH_DEMO_CONFIG`, and `MOCKINTOSH_DEMO_TAB` as needed. `--pair` operates the local connection panel without printing the token. Run once, reload and re-pair, then run with `--after` to verify persistence. Recorded PNGs are in `/tmp/mockintosh-m2-evidence`: editor, increment-five, restored, and reloaded states.
