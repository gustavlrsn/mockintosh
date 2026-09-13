# Toolbox cut — uncomplicate the kernel

Working plan, 14 September 2026. Near-term architecture amendment to [kernel-plan.md](kernel-plan.md). Experiences A and B stay; the public face of the machine is a **Toolbox** (named traps), not a VFS of live services. File Manager remains the id/role catalog. A path is a convenience for humans and agents, not the OS’s native address.

This document is the instruction set for simplifying the uncommitted kernel work. Do not add live mounts, grant UIs, or new `/sys` trees while it is in force.

## Decision

Mockintosh is a Macintosh Toolbox with a real disk and a trap dispatcher.

- **Traps** (`defineOperation`) are how you operate the machine: `open`, `click`, `inspect`, `read`, `write`, `build_submit`, …
- **Files** are documents and settings that already live on the volume (source, artifacts, Preferences).
- **Not files:** clicks, opens, pointer gestures, menu runs, build-submit. Those stay traps.

MCP, Terminal, Source Editor, and Control Panel all call the same traps. The shell is an adapter over traps, not a second filesystem. Finder and `useApp().fs` keep talking **node ids and roles**. They do not start talking kernel paths.

## What is already committed (leave it)

Nothing in `src/os/kernel/` is on `master`. The twelve local commits ahead of `origin/master` are plans, Platform, File Manager, windows, and SDK work. That committed code is already Toolbox-shaped. **Do not rewrite it for this cut.**

| Committed piece | Why it stays |
| --- | --- |
| [Platform](../src/platform/types.ts) | Host slot: display, input, storage, optional peripherals. Builder/loadArtifact on the working tree belong here, not in the kernel. |
| [`FileSystem`](../packages/fs/src/fileSystem.ts) | File Manager: ids, roles, reactive catalog. Already has `pathOf` / `resolve` for human paths. |
| App-owned windows, `AppContext` | Window Manager. Instances hang off this; they are not a process table. |
| SDK-only bundled apps | Apps call the Toolbox/SDK, not `src/os`. |
| Experiences A/B in kernel-plan | Still the product. Only the *namespace-as-OS* engineering is deferred. |

### Committed docs that must change

[docs/kernel-plan.md](kernel-plan.md) is the only committed kernel artifact that pulls toward a live VFS. After this cut lands in the working tree:

1. Banner the top: near-term work follows **this** file; Plan 9 mounts, `/dev/mouse`, and H1 are deferred.
2. Move “VFS and a real shell remain central” to “the trap table is central; the shell is an adapter; the disk is the File Manager.”
3. Leave Experience C, H1, and “explore later” as future text. Do not implement them from that plan while this cut is active.

`ARCHITECTURE.md` on the working tree already describes grants, live mounts, and `/sys`. Rewrite that section to match the Toolbox below when the code changes.

## Working-tree File Manager changes (keep)

These edits to committed `packages/fs` stay. They make the File Manager safer for two writers (human + agent); they are not a VFS.

- Catalog v3 **revisions** and `expectedRevision` compare-and-swap
- Serialized content writes and `conflict` errors
- `subscribe()` for non-Solid observers (desktop pattern)
- Persist/flush error propagation

Do **not** keep exporting `Namespace`, `VolumeProvider`, `ResourceProvider`, or `ServiceError` from `@mockintosh/fs` as the public File Manager. Path walking for traps uses `FileSystem.resolve` / `pathOf` (and a thin `/disk…` prefix helper if the shell wants a stable root). Service errors live next to the kernel.

## Target Toolbox

Managers are folders of traps, not packages you must create on day one. The registry stays a flat `defineOperation` table. Group them in docs and MCP descriptions.

| Manager | Traps | Notes |
| --- | --- | --- |
| File | `stat`, `list`, `read` / `read_bytes`, `write` / `write_bytes`, `mkdir`, `remove`, `move`, `copy` | Paths resolve through `FileSystem`. Return node id + revision + current path. No mount table. |
| Settings | typed get/set on `DesktopSettings` | Persistence is a real Preferences file. Control Panel and Desktop already use the service. Shell may `cat`/`write` that **disk** file, or call a `desktop_pattern` trap. No `/sys/settings` live node. |
| Window / Event | `apps`, `open`, `windows`, `activate`, `inspect`, `click`, `dblclick`, `drag`, `type`, `key`, `pointer`, `menu`, `render`, `screenshot` | Gestures use the same boot input path as a human. |
| Project | `project_create`, `source_open`, `build_submit`, `build_status`, `build_cancel`, `app_install`, `app_restart`, `app_restore`, `instances` | Host supplies `builder` and `loadArtifact`. |
| Session | `createSession`, revoke, cancellation, caller cleanup | Identity + lifetime. Not an ACL product. |

`Kernel` keeps: register, describe, invoke, boot instance/generation, caller session, cancellation. It drops: `namespace`, scoped `execution.fs` as a second filesystem, grant checks beyond “this caller is alive on this boot.”

Handlers that need the disk receive the boot `FileSystem` (or a path-resolving wrapper over it). Nested `execution.invoke` stays for Project/UI composition.

### What a path means after the cut

- Finder / SDK: **id + role** (unchanged).
- Shell / MCP file traps: a path string that `resolve` understands. Prefer the volume-relative form File Manager already has (`/Macintosh HD/…` via `pathOf`). If `/disk` is kept as a *shell convention*, it is a prefix alias for the volume root, not a mount.
- Source Editor: may keep a path in its UI; it translates through File Manager, not through `VolumeProvider`.

### What MCP and Terminal see

- MCP: the trap list and schemas from `kernel.describe()`. Direct tools only. No tools that write JSON to a live path to invoke another trap.
- Terminal / `mockintosh-sh`: S1 commands that call traps. `ls` / `cat` / `write` are File Manager. `open` / `click` / `build` are other managers. `help` comes from the command table, not `/bin`.

## Uncommitted work: keep / cut / rewrite

### Keep (may tidy, do not replace)

- `src/os/kernel/index.ts` dispatcher, `defineOperation`, `schema.ts`, `cancellation.ts`, `lifetime.ts`
- `src/os/kernel/uiService.ts`, `menus.ts`, `settings.ts`
- `src/os/kernel/files.ts` as File Manager traps (rewrite the body off `execution.fs`)
- `src/os/projects/`, `src/os/instances.ts`
- `src/os/shell/` as a trap adapter (drop `/bin` mount)
- UI inspection (`packages/ui/src/inspection.ts`)
- Source Editor, Terminal, Control Panel setting, Finder Open Source
- Companion + MCP + CLI **calling traps** (`companionProtocol.ts`, `scripts/companion/`, `scripts/mockintosh-sh.ts`)
- Browser/companion `BuildProvider`, `src/shared/buildPolicy.ts`, `buildContract.ts`
- Disconnect policy: no headless fallback, no automatic mutation replay
- Boot instance + generation so Experience B talks to *this* boot

### Cut

- `src/os/kernel/liveProvider.ts`
- `src/os/kernel/mounts.ts` (`/windows`, `/apps`, `/dev`, `/sys`, `/projects`, `/instances` as live trees)
- `packages/fs/src/namespace.ts`, `packages/fs/src/volumeProvider.ts`, and their re-exports
- `kernel.namespace` and `execution.fs` as a `ResourceProvider`
- Live action aliases (`/windows/click`, `/apps/open`, `/dev/mouse`, `/projects/build`, …)
- `/sys/capabilities`, `/sys/services`, `/bin` as files — replace with traps / `describe()` / `help`
- Production grant + namespace ACL (every real caller today gets all traps and `/`)
- Tests whose only purpose is live-alias dispatch, cross-mount rejection, or grant-on-path

### Keep but do not grow

- Companion outcome journal and retention caps — transport, not a manager
- `Platform.builder` swap on companion pair — one slot, not `/services/build`
- `AppInstances` — launch cleanup only
- Catalog revisions — File Manager CAS, not provider-qualified identity strings as a public model

### Rewrite

- File traps: `fs.resolve` / `fs.pathOf` / `fs.writeFile(…, { expectedRevision })` instead of `VolumeProvider`
- Settings: one service + Preferences file; delete the `/sys` live file
- `Execution`: caller, cancellation, streams, `invoke`; disk via File Manager, not a scoped VFS
- `docs/m1-operation.md`: trap catalog, S1 syntax, pairing; delete the namespace table of live endpoints
- `ARCHITECTURE.md` kernel section: Toolbox + File Manager; no live mounts
- Project snapshot identity: node id + revision is enough; drop `provider:id:revision` joins if the provider is always the volume

## What this does not uniquely lose

| Live VFS feature | Toolbox equivalent |
| --- | --- |
| `cat` a setting | It is already a Preferences file, or a `desktop_pattern` trap |
| Discover operations | `describe()` / MCP tool list / `help` |
| Swap builder | `platform.builder` (already) |
| Restrict a caller | Deferred. Session lifetime is enough. |
| `ls /windows` | `windows` + `inspect` traps |

Substitution, per-caller namespaces, and 9P-shaped trees stay in kernel-plan “explore later.” They are not a seam we maintain in the working tree.

## Phases

Do this on the current working tree. No new features (ChatGippity tool loop, S2 shell, H1) until the cut is green.

1. **Docs first.** This file is the cut. Banner `docs/kernel-plan.md`. Rewrite the ARCHITECTURE kernel section to the Toolbox table above so the next edit does not reintroduce mounts.
2. **Delete live VFS.** Remove mounts, LiveProvider, Namespace, VolumeProvider. Kernel no longer owns a namespace. Fix compile by pointing File traps at `FileSystem`.
3. **Slim Kernel / Execution.** Sessions identify the caller and own cleanup. Drop grant/namespace checks. Keep stale boot-generation checks.
4. **Retarget tests.** Keep UI, file CAS, project, shell, companion loopback tests. Drop live-alias / grant-path / cross-mount cases. Re-run `npm test`, `npm run typecheck`, and the existing M1/M2 demos against traps only (`open`, `click`, `write` on disk files).
5. **Shell and MCP copy.** `m1-operation.md` / `m2-apps.md` describe traps and disk paths. No `/sys`, `/dev`, `/windows/click`.

## Done when

- No `LiveProvider`, `Namespace.mount`, or `/sys` / `/dev` / `/windows` live trees remain
- Finder and `useApp().fs` still use ids and roles only
- Terminal can `ls` / `cat` / `write` disk files and `open` / `click` / `build` via traps
- MCP lists traps from `describe()`, not from a mount table
- Control Panel, Desktop, and a file write to Preferences agree on desktop pattern
- Counter create → build → edit → restore still works without a companion
- Committed Platform / File Manager / window / SDK code is not rewritten, only used

## Out of scope until someone reopens it

Per-caller grants, union mounts, live action files, `/services/build`, persistent computer identity, remote display, 9P, ChatGippity’s multi-step tool loop (M3), shell pipelines (S2).
