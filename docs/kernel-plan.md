# Mockintosh as a UNIX-shaped machine — namespace, kernel, processes, shell

Working plan, 9 September 2026; revised 10 September after review. Nothing here is implemented; this document fixes the design and the order of work.

## Why

Thijs Verreck's research preview of Prototyper (9 Sep 2026) makes one claim worth taking seriously: a "canvas" tool is orders of magnitude more usable by LLM agents when the thing under the GUI is a real operating system — a filesystem as the single namespace for all state, a small syscall table, processes, and text in/out — because agents are text machines that already know UNIX. His demo: `mkdir /shapes/rectangle` in a VFS terminal, and a rectangle appears on the canvas.

Mockintosh is already most of the way there without having said so. `bootOS(platform)` runs DOM-free, `src/platform/headless/` boots the whole shell in Node, `@mockintosh/fs` is a real virtual filesystem, and the framebuffer is 22 KB of packed bits any program can read. What is missing is the *shape*: the state that is not in the filesystem (windows, the UI tree, running apps, cursor, devices) is reachable only through several ad-hoc TypeScript surfaces, and there is no text interface at all.

The agent thesis is a bet on a demo. The plan is built so it does not depend on the bet: the first milestone — a namespace over live state, including the UI tree — pays for itself in test quality alone. `boot.test.ts` today finds the Apple menu by scanning menubar row 10 for the first black pixel; after the first milestone it asks for the menu by name and clicks a button by name. If Prototyper turns out to be wrong about agents, we still get tests that say what they mean.

"Everything works like UNIX" decomposes into four separable ideas, built in this order because each is the substrate of the next:

| Phase | Idea | UNIX precedent | What it buys | Who benefits |
| --- | --- | --- | --- | --- |
| **1** | Everything is a file, behind one syscall table | Plan 9 `/proc`, `/dev`; `open/read/write` | Agents and tests inspect and drive the machine — windows, buttons, menus, devices — with `ls`/`cat`/`write`; one seam every client goes through | tests, agents |
| **2** | The syscall table over the wire | RPC to a kernel | Agents (MCP, Cursor, Claude Code) operate a running Mockintosh with structured calls; no shell needed yet | agents |
| **3** | Processes, not just windows | pids, `fork/exec`, signals | Force-quit, open-document delivery to a running app, background helpers with no window | users |
| **4** | Text is the universal interface | `sh`, pipes, `/bin` | A Terminal for humans; a CLI pipe for scripts; tests as shell scripts | humans, scripts |

## Where we are

Surfaces an external program would have to learn today to operate Mockintosh:

| Surface | File | Who uses it |
| --- | --- | --- |
| `Platform` | `src/platform/types.ts` | hosts (web, headless) |
| `OSServices` | `src/os/context.ts` | shell components |
| `AppServices` (`useApp()`) | `packages/sdk/src/index.ts` | apps |
| `UIServices` | `packages/ui/src/services.ts` | UI framework |
| `FileSystem` | `packages/fs/src/fileSystem.ts` | everyone, id-based |
| window store | `src/os/state.ts` (`getWindows`, `openOSWindow`, `bringToFront`, …) | shell, `bootOS` |
| app registry | `src/os/apps.ts` (`registerApp`, `getApp`) | boot, installer |
| `HeadlessPlatform` injectors | `src/platform/headless/index.ts` (`click`, `key`, `tick`, `lastFrame`) | `boot.test.ts` |
| `BootedOS` | `src/os/boot.ts` | entry points |

There is no way to ask "where is the Apple menu", "which windows are open", "which app is active", or "where is the OK button" from outside the Solid tree — even though the renderer holds all of it: every `CanvasNode` (`packages/ui/src/nodes.ts`) has a `type`, a `layout` rect, `textContent`, and its event handlers (`hasMouseHandlers`). That is an accessibility tree that nothing exposes.

Assets already in place that the plan builds on rather than replaces:

- `FileSystem` over `FSBackend`, reactive catalog, roles, attributes, MIME types, durability rules (ARCHITECTURE.md § File System); `resolve(path)` and `pathOf(id)` already exist.
- `Platform` with required (screen, input, clock, disk) and optional (peripherals) members, and `platformCapabilities()` derived from it.
- `bootOS` owning boot order, frame loop, input policy (double-click, ⌘-shortcuts).
- Headless platform + `check:core` guaranteeing the core has no DOM dependency.
- `defineApp` / `SolidApp` as the app contract; `AppInstaller` loading bundles via `Platform.loadModule`.

## Target architecture

```
  Solid shell (src/os, apps/*)          External clients
  Finder · Terminal · apps · dialogs    MCP server · CLI · tests
          │  sync, reactive                     │  async, serialisable
          ▼                                     ▼
  ┌──────────────────────┐   projection   ┌──────────────────────────┐
  │  VFS (mount table)   │ ─────────────▶ │  Kernel (syscall table)  │
  │  sync stat/children  │                │  stat readdir read write │
  │  reactive stores     │                │  mkdir unlink rename     │
  └──────────┬───────────┘                │  watch · spawn kill ps   │
             │                            │  wait · now sleep        │
             │                            └──────────────────────────┘
   ┌─────────┼──────────────────┬──────────────────┐
   ▼         ▼                  ▼                  ▼
 /disk     /windows /apps     /dev /sys         /proc
 FileSystem  window store,    Platform,          process table
 (catalog,   UI tree walk     inject path,       (phase 3)
  FSBackend) (@mockintosh/ui) capabilities
```

Two layers, one namespace. The **VFS** is synchronous and reactive: the Solid shell renders from it exactly as the Finder renders a folder today. The **Kernel** is an asynchronous, JSON-friendly projection of the same VFS plus process and time verbs; it is what tests, RPC, and the shell's commands use.

Two invariants the whole plan rests on:

1. **The VFS is the only namespace.** Every piece of state an agent might need — windows, UI nodes, processes, devices, capabilities, the framebuffer — has a path. Syscalls are the verbs; paths are the nouns.
2. **No shell-only backdoors.** Everything reachable through the sync layer is reachable through the Kernel projection. This is testable: enumerate the mounts and check each is exposed. It is what stops the table of surfaces above from growing again.

`OSServices` and `AppServices` become facades: they may keep sync reactive reads (through the VFS) and typed conveniences, but every mutation they offer must be a VFS write or a syscall.

---

## Phase 1 — Namespace: mount table, synthetic filesystems, kernel projection

### Goal

Make the VFS the single namespace and define `Kernel` as its projection. Live OS state gets paths; the persistent catalog becomes one mount among several; the UI tree is browsable and clickable by path. `boot.test.ts` stops scanning pixels for navigation.

### Design — mounts

`@mockintosh/fs` grows a **mount table**. A `MountableFS` is the minimal contract a mount must satisfy; the existing `FileSystem` implements it for the persistent volume, and small synthetic implementations expose OS state.

```ts
// packages/fs/src/mount.ts
export interface MountableFS {
  stat(subpath: string): FSNode | undefined;          // synchronous, reactive
  children(subpath: string): FSNode[];
  read(subpath: string): Promise<Uint8Array>;
  write?(subpath: string, data: Uint8Array): Promise<void>;
  mkdir?(subpath: string, name: string): Promise<void>;
  remove?(subpath: string): Promise<void>;
  rename?(subpath: string, name: string): Promise<void>;
}

export class VFS {
  mount(at: Path, fs: MountableFS, options?: { hidden?: boolean }): void;
  unmount(at: Path): void;
  resolve(path: Path): { mount: MountableFS; at: Path; subpath: string } | undefined;
  // …stat/children/read/write dispatch to the owning mount
}
```

Reads are synchronous and reactive (backed by Solid signals/stores in each synthetic FS) so the Finder can list `/windows` with the same memo it uses for a folder. Mutations are async. Missing optional methods raise `EACCES`/`ENOSYS`, so `/proc/<pid>/status` is read-only by construction.

Synthetic node ids use the convention `<mount>:<key>` (`win:finder-1725…`, `ui:finder-1725…/box.2/button.0`, `dev:screen`) so everything that keys by `NodeId` today — Finder selection, attributes — keeps working unchanged.

### Design — kernel

New directory `src/os/kernel/`. Types are explicit and JSON-friendly (paths and pids, not object handles) so the same table is exposed over JSON-RPC in phase 2 without an adapter layer.

```ts
// src/os/kernel/types.ts
export type Path = string;                 // absolute, "/"-separated
export type Pid = number;

export interface KernelStat {
  path: Path;
  kind: "file" | "directory";
  type?: string;                           // MIME for files
  size?: number;
  modifiedAt: number;
  synthetic: boolean;                      // true for /dev, /proc, /windows, …
  attributes: NodeAttributes;
}

export interface KernelDirent { name: string; kind: "file" | "directory"; type?: string }

export interface SpawnSpec {
  app: string;                             // registered app id, or a /bin command in phase 4
  args?: Record<string, unknown>;          // today's `props`
  fromRect?: AnimRect;                     // zoom-open origin (GUI clients only)
}

export interface ProcessInfo {
  pid: Pid;
  app: string;
  args: Record<string, unknown>;
  state: "running" | "exited";
  startedAt: number;
  windows: string[];                       // window ids
}

export type KernelWatchEvent =
  | { type: "added" | "removed" | "changed"; path: Path };

export interface Kernel {
  // --- files ---
  stat(path: Path): Promise<KernelStat | null>;
  readdir(path: Path): Promise<KernelDirent[]>;
  read(path: Path): Promise<Uint8Array>;
  readText(path: Path): Promise<string>;
  write(path: Path, data: FileContent, options?: WriteFileOptions): Promise<void>;
  mkdir(path: Path): Promise<void>;
  unlink(path: Path): Promise<void>;
  rename(from: Path, to: Path): Promise<void>;
  setattr(path: Path, patch: NodeAttributes): Promise<void>;
  /** Fires on any change under `path`; a Solid effect internally. */
  watch(path: Path, cb: (event: KernelWatchEvent) => void): Unsubscribe;

  // --- processes (phase 1: spawn only, over openApp; ps/kill/wait arrive with phase 3) ---
  spawn(spec: SpawnSpec): Promise<Pid>;
  kill(pid: Pid): Promise<void>;
  ps(): Promise<ProcessInfo[]>;
  wait(pid: Pid): Promise<number>;         // exit code

  // --- time ---
  now(): number;
  sleep(ms: number): Promise<void>;
}
```

Deliberately **not** syscalls: windows, UI nodes, menus, dialogs, cursor, clipboard, printer, screen. Those are files — `write /windows/<id>/rect`, `write /windows/<id>/ui/…/click`, `read /dev/screen`, `write /dev/mouse`. Keeping the verb set to files + processes + time is what makes the table small enough to stay stable. The Macintosh analogy is the A-trap dispatch table: one indirection every caller goes through, so the implementation can move underneath.

Every syscall returns a `Promise` even where the VFS read is synchronous, so synthetic and remote backends can be slow later. GUI code that needs synchronous reactive reads uses the VFS directly through the facade — that is the two-layer model above, not a backdoor.

Errors: one `KernelError` with a UNIX-style `code` (`ENOENT`, `EEXIST`, `EISDIR`, `ENOTDIR`, `EACCES`, `ESRCH`, `ENOSYS`) so text tools and agents get a vocabulary they already know. `FSError` maps onto it.

Until phase 3 there is no process table. `spawn` calls today's `openApp` and returns a pid allocated per call; `ps`/`kill`/`wait` throw `ENOSYS`. No window→process adapter: that would be code written to be deleted, and nothing may depend on it.

### Namespace

```
/
├── disk/                        the persistent catalog; display name "Macintosh HD" is an attribute
├── dev/                         peripherals; a node exists iff the Platform provides it
│   ├── screen                   packed 1-bit framebuffer (read)
│   ├── mouse                    write "down 100 40" | "up" | "move 10 20" | "click 100 40" | "dblclick …"
│   ├── keyboard                 write raw text (typed) or "key Enter" / "key cmd+n"
│   ├── clipboard                read/write text/plain
│   ├── printer                  write a 1-bit page → PrintService
│   └── camera                   (later) last frame
├── proc/                        one directory per process (phase 3)
│   └── <pid>/{app,args,status,windows,parent}
├── windows/
│   └── <id>/
│       ├── title rect kind active app      write `rect` to move/resize, `active` = "1" to bring to front
│       └── ui/                             the window's UI tree (see below)
│           └── <node>/{type,rect,text,name,clickable,click}
├── apps/                        the registry: what can be launched
│   └── <appId>/{title,icon,requires,fileTypes}
└── sys/
    ├── resolution               "512 342"
    ├── capabilities             read-only view of platformCapabilities(), one per line
    ├── menubar/                 the active app's menus: <menu>/<item> — write "1" to invoke
    └── cursor                   "x y" + current cursor name
```

Naming: mounts use lowercase UNIX names because their audience is programs and agents; the volume's *display* name stays Macintosh because its audience is people. The volume is mounted at a stable `/disk` (renaming the disk in the Finder must not move every path); the Finder shows the display name. Synthetic mounts are `hidden: true` — they do not appear as disks on the desktop — but the Finder can open them by path once a "Go to Folder…" exists.

### Design — the UI tree

`/windows/<id>/ui/` is the highest-value mount for tests and agents: "click the OK button" is what they actually want, far more than "move window rect".

**Node naming.** Solid node identities are ephemeral, so paths are structural: `<type>.<index>` among siblings of the same type (`box.0/text.1`, `box.2/button.0`), with an optional `name` prop apps and shell components can set — the equivalent of `aria-label` — that becomes an alias directory entry (`ui/ok` → the same node as `ui/box.2/button.0`). Structural paths are stable as long as the tree shape is; named paths are stable as long as the name is. Tests and agents should prefer names; the shell's own dialogs and Finder chrome name their controls.

**Per-node files.** `type` (`box`, `text`, `image`, `button`, …), `rect` (screen coordinates), `text` (`textContent`), `name`, `clickable` (`hasMouseHandlers`), and `click` — writing to it dispatches a click at the node's centre through the inject path (below), so a click by name and a click by coordinates are the same event.

**Layering.** `@mockintosh/ui` must expose a read-only walk of the tree without leaking `CanvasNode` internals: a `UINodeSnapshot { type, rect, text, name, clickable, children }` and `ui.snapshot(rootNode)` (or a per-window equivalent) on the UI instance. `UITreeFS` in `src/os/kernel/fs/` is a reactive view over that, keyed by window. This is a public API addition to the UI package; keep it to the snapshot type and one walk function.

### Design — input

`bootOS` gets one typed inject path: `injectPointer(event: PlatformPointerEvent)` and `injectKey(event: PlatformKeyEvent)`, which own the existing double-click and ⌘-shortcut policy. The platform's `onPointer`/`onKey` call it; so do the `/dev/mouse` and `/dev/keyboard` write handlers (after parsing their string format) and `ui/…/click`. Injected and real input are indistinguishable because they are the same code path — without a string parser on the pointer-move hot path and without losing the typed event.

### Where the existing code lands

| Today | Becomes |
| --- | --- |
| `platformCapabilities()` | Unchanged; `/sys/capabilities` is a read-only view. (`browser`, `video`, `images`, `network` are not devices, so `/dev` is not their source of truth.) |
| `state.ts` window store | Unchanged internally; `WindowsFS` (`src/os/kernel/fs/windows.ts`) is a reactive view over it |
| `apps.ts` registry | `AppsFS` view |
| Renderer node tree | `ui.snapshot()` in `@mockintosh/ui`; `UITreeFS` view under each window |
| `bootOS` input handlers + double-click / ⌘ policy | `injectPointer` / `injectKey`; platform and `/dev` both call them |
| `HeadlessPlatform.click/key/lastFrame` | Still exist for hosts, but tests and agents prefer `/dev/mouse`, `/dev/keyboard`, `/dev/screen`, `ui/…/click` because those work on *every* platform, including the browser |
| `getMenubarMenus()` | `MenubarFS` — invoking a menu item by writing to `/sys/menubar/File/New` replaces `runMenuShortcut`'s special-casing |
| `OSServices.openApp` | `kernel.spawn`; `OSServices` keeps the typed method as a facade |

### Implementation steps

1. `packages/fs`: `MountableFS`, `VFS`. `FileSystem` implements `MountableFS`. Tests for resolution across mount boundaries and for id round-tripping.
2. `packages/ui`: `UINodeSnapshot`, `ui.snapshot()`, and the `name` prop on layout nodes.
3. `src/os/kernel/types.ts`, `createKernel(vfs, …)`: the projection, `KernelError`, `watch` over Solid effects.
4. `src/os/kernel/fs/`: `DevFS`, `WindowsFS`, `UITreeFS`, `AppsFS`, `SysFS`, `MenubarFS`. Each is a small reactive view plus write handlers.
5. `bootOS`: `injectPointer`/`injectKey`; mount the volume and synthetic mounts right after the file system opens; construct the kernel; build `OSServices` from it; `BootedOS` gains `kernel` and `vfs`.
6. `boot.test.ts` rewrites: `await kernel.write("/windows/<id>/ui/ok/click", "1")`, `await kernel.readText("/windows/<id>/title")`, `await kernel.write("/dev/mouse", "click 8 10")` replace pixel scans. Pixel assertions stay only where pixels are the thing under test. A test enumerates mounts and asserts invariant 2.
7. `ARCHITECTURE.md`: § File System gains "Mounts" and the namespace table; new § Kernel with the two-layer diagram; `OSServices` documented as a facade.

### Acceptance

- `check:core` still passes; `Kernel` and `UINodeSnapshot` have no DOM or Solid types in their public signatures.
- `ls /` from the kernel lists `disk dev windows apps sys`; `ls /dev` on the headless platform lists `screen mouse keyboard` only; on the web platform it adds `clipboard`, and `printer` when WebUSB is granted.
- A headless test, through `Kernel` only: opens the Apple menu by writing to `/sys/menubar`, spawns an app, reads its window's title, clicks a named button in its UI tree, writes a new `rect` and sees the next `/dev/screen` read reflect the move — with no reference to `state.ts` or pixel scanning for navigation.
- Finder can list `/windows` (via a test helper or Go to Folder) with no Finder code changes beyond hiding non-volume mounts from the desktop.

---

## Phase 2 — The syscall table over the wire

### Goal

Let an agent operate a running Mockintosh with structured calls. This comes before processes and the shell because, with the UI tree in place, it is a thin layer and delivers most of the agent value.

### Design

The `Kernel` types were made JSON-friendly for this. A JSON-RPC 2.0 server maps one method per syscall (`stat`, `readdir`, `read` with base64 bodies, `write`, `spawn`, …) plus `screenshot` (PBM P4 from `/dev/screen` — 1-bit needs no image codec, so it works everywhere). An MCP server is the same table as tools, with `readdir`/`readText`/`write`/`spawn`/`screenshot` as the ones an agent reaches for. Structured calls beat shell quoting for agents; `sh` (phase 4) is for humans and scripts.

Two transports for the same server: in-process for tests and the headless CLI; a browser bridge (postMessage or a dev-server WebSocket, cf. `docs/mockintosh-devtools-extension.md`) so the same tools reach a live web instance.

### Implementation steps

1. `packages/kernel-rpc` (or `src/os/kernel/rpc.ts` if it stays small): `serveKernel(kernel, transport)` and `connectKernel(transport): Kernel`, round-trip tested against the headless boot.
2. `scripts/mockintosh-mcp.ts`: boots headless (or connects to a browser bridge) and exposes the tools.
3. Web platform: opt-in dev bridge.

### Acceptance

- From Cursor / Claude Code, via MCP: list windows, spawn the Finder, click a named button, read the resulting window title, take a screenshot — against both a headless boot and a running browser instance.

---

## Phase 3 — Processes

### Goal

Separate "a running program" from "a window". Give it a pid, a lifetime, an owner scope, and an entry in `/proc`; make `kill` a real operation; allow programs with no window at all. This is the phase whose beneficiary is the user: force-quit, open-document delivery to a running app, background helpers.

### Design

```ts
// src/os/kernel/process.ts
export interface Process {
  pid: Pid;
  app: string;
  args: Record<string, unknown>;
  parent: Pid | null;
  state: "running" | "exited";
  exitCode?: number;
  startedAt: number;
  /** Solid owner for everything the process creates that is not a window: intervals, subscriptions, effects. */
  owner: Owner;
  windows: Set<string>;
  io?: ProcessIO;                          // phase 4: stdin/stdout/stderr text streams
}
```

Rules:

- `spawn(app)` creates a process and opens the app's first window with `OSWindow.pid` set. Window *content* runs under `runWithOwner(process.owner)` so effects created inside components are attributable to the pid; window *existence* stays in the window store, which drives the tree through `<For>` as today. Windows opened by that app (`useApp().os.openWindow`) belong to the same pid.
- `kill(pid)` is **store-driven**: remove the process's windows from the store (the tree unmounts through the mechanism that already works), then dispose `owner` for everything else, then mark the process exited in `ProcFS`. Not dispose-first: that would invert Solid's model and reintroduce the `<For>` reorder/remount risk.
- A process exits on its own when its last window closes *and* it has no `io` (GUI apps), or when `main` returns (phase 4 text programs).
- `singleInstance` and the current open-document dedupe in `openApp` become **"send to running process"**: if an app is running and a document is opened with it, the kernel delivers an `open-document` event to the existing pid instead of spawning — the Macintosh `odoc` AppleEvent. Apps opt in with an `onOpenDocument` handler on `SolidApp`; apps without one get a new process per document, as today.
- Scheduling is cooperative and single-threaded; there is no preemption. "Process" here means an accounting and lifetime unit, exactly what Switcher/MultiFinder provided.

`/proc/<pid>/`:

```
app        app id
args       JSON
status     running | exited <code>
windows    one window id per line
parent     pid
```

`/proc/self` resolves to the caller's pid when the kernel call is made from within a process context (an `AppServices.pid` is set per window; Terminal's commands run inside the shell's pid).

### Implementation steps

1. `ProcessTable` (a Solid store) + `ProcFS`; `Kernel.spawn/kill/ps/wait` implemented over it (replacing phase 1's `ENOSYS`).
2. `Window.solid.tsx` runs `WindowContent` under the process owner; `OSWindow.pid` added; `closeOSWindow` notifies the process table so last-window exit works.
3. `AppServices` gains `pid` and `onOpenDocument`; `openers.ts` routes through `spawn`-or-deliver.
4. Dialogs are processes with `parent` = the requesting pid; killing the parent kills its dialogs.
5. Tests: kill closes all of an app's windows and releases effects (assert with an `onCleanup` spy and a `setInterval` that must stop); `ps` matches `/proc`; open-document delivery to a running Finder; reordering windows does not remount content under a new owner.

### Acceptance

- Two Picture windows are one process if Picture handles `onOpenDocument`, two processes otherwise — verifiable via `/proc`.
- `kill` of an app with a pending `setInterval` stops the interval (owner disposal), and its windows vanish in the next frame.

---

## Phase 4 — Text is the universal interface: `/bin`, `sh`, Terminal

### Goal

A text REPL over the whole machine, for humans in a Terminal app and for scripts through a CLI pipe. It is also what `apps/Testing.tsx` should have been.

### Design

**Commands** are ordinary TypeScript modules with a tiny contract, registered into `/bin` (an `AppsFS`-like synthetic mount over a command registry):

```ts
// src/os/shell/command.ts
export interface CommandContext {
  argv: string[];
  cwd: Path;
  kernel: Kernel;
  stdin: TextStream;
  stdout: TextStream;
  stderr: TextStream;
  env: Readonly<Record<string, string>>;
}
export interface Command {
  name: string;
  usage: string;
  run(ctx: CommandContext): Promise<number>;   // exit code
}
```

Initial `/bin` (each ≤ 40 lines because the kernel does the work):

| Command | Notes |
| --- | --- |
| `ls [-l] [path]`, `cat`, `echo`, `stat`, `mkdir`, `rm`, `mv`, `cp`, `pwd`, `cd` | straight syscall wrappers |
| `open <path\|appId> [args]` | `spawn`; `open /disk/Desktop/Readme` routes through `openers.ts` |
| `ps`, `kill <pid>`, `wait <pid>` | process table |
| `windows` | `ls -l /windows` with a readable table |
| `click <x> <y> \| <window> <name>`, `dblclick`, `drag x1 y1 x2 y2`, `type "text"`, `key cmd+n` | writes to `/dev/mouse`, `/dev/keyboard`, `ui/…/click` |
| `menu "File" "New Folder"` | writes to `/sys/menubar/...` |
| `screenshot [path]` | `/dev/screen` → PBM (P4) file, or ASCII art to stdout when no path |
| `sleep ms`, `frame [n]` | advance; `frame` waits for `n` presented frames so scripts can be deterministic |
| `sh [-c cmd \| script]` | the shell itself, so scripts can be files |

**Shell** (`src/os/shell/sh.ts`): starts as `sh -c` with `;` and single/double quotes. Pipelines (`|`), redirects, `&&`/`||`, and `$VAR` are added when a concrete script needs them; control flow, globbing, and job control are a program's job. Each command runs as a process (phase 3) with `io`, so `ps` shows running commands and `kill` works on them.

**Two front ends over the same shell:**

1. **Terminal app** (`apps/Terminal.tsx`): a Solid app using the mono font, a `TextInput` line editor, and a scrollback `TextBlock`. Anachronistic on a 1984 Macintosh and worth it; it is also the fastest way for a human to verify what an agent did.
2. **Headless CLI** (`scripts/mockintosh-sh.ts`, later `packages/cli`): boots on the headless platform and pipes host stdin/stdout to `sh`. `echo 'open finder; windows' | npx mockintosh-sh` is the whole script integration.

`apps/Testing.tsx` is retired in favour of shell scripts under `tests/shell/*.sh` run by a vitest harness that boots headless and asserts on stdout.

### Acceptance

- `echo 'mkdir /disk/Desktop/Notes; open finder; frame; windows' | mockintosh-sh` prints a window table including a Finder window, on Node, with no browser.
- The Terminal app runs the same line inside the GUI and the folder appears on the desktop.
- Every existing `boot.test.ts` scenario can be expressed as a shell script; at least the menu and ⌘N scenarios are.

---

## Cross-cutting concerns

**SDK impact.** Phases 1–3 are internal; `defineApp`/`useApp` keep working. Additive SDK changes: the `name` prop on UI nodes (phase 1), `AppServices.pid` and `SolidApp.onOpenDocument` (phase 3), and an opt-in `AppServices.kernel` (narrowed: no `kill` of foreign pids, writes confined to the app's storage, its own windows' `ui`, and `/dev`) when the first app needs it. Third-party apps thereby gain the same text-driven testability. Document in `packages/sdk/docs/APP_DEV_GUIDE.md` once phase 4 lands.

**Security model.** There is none today because everything is first-party. The kernel is where one would go: a per-process capability set (which mounts are writable) is a natural extension of `requires`. Not in scope for these phases; design so it can be added at `createKernel` without touching callers.

**Physical product.** `docs/physical-product-plan.md` wants the same OS on a microcontroller. The kernel and `/dev` are what a device build needs anyway — a UART console running `sh` is the classic embedded debug port, and `/dev/screen` over serial is the screenshot tool. Nothing here adds host requirements beyond `core-env.d.ts`.

**Performance.** Synthetic reads are store reads; no polling. `/dev/screen` reads copy 22 KB. `watch` uses Solid effects, so an agent subscribing to `/windows` costs the same as the Finder rendering it. `UITreeFS` snapshots lazily per window on read, not per frame. Real input never passes through a string parser.

**Documentation.** `ARCHITECTURE.md` is updated at the end of each phase (the layering diagram, § File System, § Capabilities, a new § Kernel and § Shell). This document stays as the plan; decisions taken along the way are appended under Decisions log.

---

## Sequencing and milestones

| Milestone | Contents | Exit criterion |
| --- | --- | --- |
| **M1 — Namespace** (phase 1) | `VFS`/mounts in `@mockintosh/fs`; `ui.snapshot()`; `Kernel` projection; `DevFS`, `WindowsFS`, `UITreeFS`, `AppsFS`, `SysFS`, `MenubarFS`; typed inject path | `boot.test.ts` navigates by name, not pixels; `/dev` differs correctly between web and headless; invariant 2 test passes |
| **M2 — Agent surface** (phase 2) | JSON-RPC over `Kernel`; MCP server; browser bridge | Cursor / Claude Code opens apps, clicks named controls, reads windows, screenshots a live Mockintosh |
| **M3 — Processes** (phase 3) | `ProcessTable`, `ProcFS`, owner-scoped content, store-driven `kill`, `onOpenDocument`, dialogs as child processes | `kill` releases effects and windows; `/proc` matches `ps` |
| **M4 — Text** (phase 4) | `Command`, `/bin`, `sh -c`, Terminal app, `mockintosh-sh` CLI, shell-script tests replacing `Testing.tsx` | Script scenario runs end-to-end on Node from a one-line pipe; Terminal runs it in the GUI |

Relative size: M1 medium-large (most new code, but each synthetic FS is small and independent; the UI package API is the part to get right), M2 small, M3 medium (touches window mounting, the riskiest change), M4 medium (mostly additive).

**Land the platform/headless refactor first.** It is already ~200 changed files; adding a kernel makes it unreviewable. M1 starts on a clean tree as its own PR; M2–M4 are separate PRs.

---

## Risks

- **UI node naming.** Structural paths shift whenever a component adds a sibling. Mitigation: names on every control the shell owns; tests and agents told to prefer names; a `stat` on a structural path that no longer exists fails loudly with `ENOENT` rather than clicking the wrong thing.
- **UI package API leak.** `ui.snapshot()` must not expose `CanvasNode`; keep the snapshot type minimal and immutable, and let `UITreeFS` derive `clickable`/`rect` from it rather than reaching in.
- **Owner-scoped content (M3)** changes where Solid disposes app trees. Store-driven `kill` keeps window lifetime where it is today; still test that reordering a window does not remount its content.
- **Reactive synthetic reads** must not create write-during-read cycles: a `/windows/<id>/rect` write that triggers a `watch` that writes again. Keep write handlers batched (`fs.batch()` style) and untracked.
- **Shell scope creep.** Say no to control flow, globbing, and job control until a concrete script needs them; each is a program's job.
- **Naming.** UNIX names in `/` beside a Macintosh-named disk looks odd in the Finder. Hidden mounts make it invisible to users; if that proves insufficient, mounts can be moved under a Mac-named `System` mount without changing the kernel.

## Open questions

1. `/dev`, `/proc`, `/windows` vs Mac-flavoured `System/Devices`, `System/Processes`, `System/Windows`? Recommendation: UNIX names, hidden from the desktop — programs are the audience.
2. UI node `name`: a plain prop on every layout node, or only on interactive ones (`button`, `TextInput`, menu items)? Recommendation: any node, since tests also want to read text by name (`ui/status/text`).
3. Should `/windows/<id>/ui` also expose the OS chrome (close box, title bar, scrollbars) as nodes, or only the content tree? Recommendation: chrome too, named (`close`, `zoom`, `titlebar`), since "close the window" is a common agent action and the chrome is already Solid nodes.
4. Should third-party apps ever get `spawn`? Recommendation: yes but narrowed (own app id and `open` of documents only), when the first app needs it.

## Decisions log

- 2026-09-09 — Plan written. Kernel is path-based and async; windows/menus/devices are files, not syscalls.
- 2026-09-10 — Revised after review:
  - Dropped the standalone "seam" milestone and its window→process adapter; the kernel is defined as a projection of the VFS and lands with the first synthetic mounts.
  - Invariant 1 restated: two layers (sync reactive VFS, async serialisable Kernel), one namespace, no shell-only backdoors — testable by enumerating mounts.
  - Added `/windows/<id>/ui` (UI tree with structural + named paths, `click` files) and the `ui.snapshot()` API in `@mockintosh/ui`; this is the highest-value mount and belongs in M1.
  - Real input goes through a typed `injectPointer`/`injectKey` in `bootOS` that owns the double-click and ⌘ policy; `/dev/mouse` and `ui/…/click` are clients of it, not the pipeline.
  - Capabilities are not derived from `/dev`; `/sys/capabilities` is a view of `platformCapabilities()`.
  - `kill` is store-driven (remove windows, then dispose the owner); window content still runs under the process owner so effects are attributable.
  - The agent surface is the syscall table over JSON-RPC/MCP and moves up to M2; `sh` is for humans and scripts and starts as `sh -c` + `;`.
  - Persistent volume mounted at stable `/disk`; "Macintosh HD" is its display name.
  - `pathOf(id)` already exists; removed from the work list.
  - Phases renumbered to match build order; the platform/headless refactor ships before M1 starts.

## References

- Thijs Verreck, Prototyper research preview, 9 Sep 2026 — `x.com/ThijsVerreck/status/2097596777503363507`: kernel with VFS (`/apps`, `/agents`, `/shapes`, `/proc`, `/dev`, `/mounts`), syscall table, headless operation, `mkdir /shapes/rectangle` creating a shape.
- Plan 9 from Bell Labs: everything is a file server; `/proc`, `/dev`, per-process namespaces.
- Inside Macintosh: A-trap dispatch table; Switcher/MultiFinder process model; `odoc` AppleEvent.
- `ARCHITECTURE.md`, `docs/physical-product-plan.md`, `docs/mockintosh-devtools-extension.md` in this repo.
