# M1: operating the visible Mockintosh


Browser app building works without a companion: run `npm run dev`, then use Source Editor → New Counter → Build & Run. The companion setup below is for external CLI/MCP access or optional remote compilation. See [M2 apps](m2-apps.md).

Terminal, the host CLI, and MCP send operations to the kernel inside the selected browser. They share its Finder filesystem, windows, input dispatch, framebuffer, and preferences. No command is executed in the host shell.

## Local setup and pairing

```sh
npm install
npm run dev
npm run companion
```

Open **http://localhost:5173**. Expand **Companion: disconnected**, paste the token printed by the companion into **Companion token**, and click **Connect**. The status shows the connected instance and boot generation. **Disconnect** revokes remote callers and cancels their pending work. Pairing is opt-in, development-only, and the token is kept in memory; reload requires pairing again.

The companion binds to `127.0.0.1:4318`. `MOCKINTOSH_PORT` changes its port; `MOCKINTOSH_ORIGIN` changes the exact allowed browser origin (default `http://localhost:5173`). Use the same port in the pairing panel. Browser origins must match, including hostname and port. Host clients must authenticate too. `MOCKINTOSH_TOKEN` can supply a shared token; otherwise the companion generates a random 256-bit token at startup. Keep it local. A private JSON file containing `{ "token": "..." }` can be reused with `npm run companion -- --token-file /path/to/file`; that mode does not print the token.

## Host CLI

Set `MOCKINTOSH_TOKEN` in the host environment to the pairing token, then discover and explicitly select a boot:

```sh
npm run mockintosh-sh -- --list
npm run mockintosh-sh -- --connect '<session from --list>' -c 'ls /disk; desktop_pattern'
npm run mockintosh-sh -- --connect '<session>' -c 'desktop_pattern black; menu  "Control Panel"; screenshot /disk/desktop.pbm'
```

Use `MOCKINTOSH_URL` to override `ws://127.0.0.1:4318`. Without `-c`, redirected stdin supplies the command text. Shell stdout and stderr are forwarded to their corresponding host streams as output is produced. Ctrl-C sends cancellation. Truncation is reported. For machine consumers that need clean output without npm's script banner, use `node --import tsx scripts/mockintosh-sh.ts` with the same arguments.

`--headless -c 'command'` explicitly creates an isolated in-memory OS in the CLI process, transforms the same universal Solid components, and advances its frame scheduler. It does not attach to the visible desktop, persist its disk between invocations, or activate automatically after disconnect. Live and headless sessions never silently substitute for one another.

## Stdio MCP

Configure an MCP client to launch Node in this repository:

```json
{
  "command": "node",
  "args": ["--import", "tsx", "scripts/companion/mcp.ts"],
  "env": {
    "MOCKINTOSH_TOKEN": "<pairing token>"
  }
}
```

Use an absolute script path and set the client's working directory to this repository if its configuration requires that. Do not launch through `npm run mcp` in a stdio client: npm prints a banner to stdout. The adapter itself uses the official SDK's `StdioServerTransport` and sends diagnostics only to stderr, following the [official MCP server guidance](https://modelcontextprotocol.io/docs/develop/build-server).

Call `sessions`, then `select_session` with the chosen session string. The tool list changes to include that boot's registered operations and input/result schemas. `MOCKINTOSH_SESSION` can make the initial selection explicit in configuration. `run_shell` is available alongside direct tools. `screenshot` returns PNG image content; the companion converts the browser's packed monochrome pixels.

A typical direct sequence is `open(app="control_panel")`, `windows`, `inspect(window=...)`, `activate(window=...)`, `click(name="desktop-pattern-black", window=...)`, and `screenshot`. An inactive window requires a separate activation. Duplicate names require a window scope or numeric node id. UI ids belong to a node lifetime and boot; reacquire them after replacement, closing, or reload.

## Terminal and S1 syntax

Open **Terminal** from the Apple menu, or with `open terminal`. Each window has its own cwd, history, scrollback, and cancellation token. Up/Down traverse command history. Ctrl-C interrupts; closing the window cancels its run.

S1 supports whitespace, single/double quotes, backslash escapes, and `;` sequences. Empty quoted arguments are preserved. The entire input is parsed before any command runs. Unquoted pipes, redirection, `&`, `$`, and backticks are rejected. There is no expansion, background execution, script execution, or host-shell escape. A semicolon sequence returns its last command's status unless cancelled.

`help` lists commands. `help command` exposes each command's usage. Commands include:

- Files: `ls`, `cat`, `stat`, `pwd`, `cd`, `echo`, `write`, `mkdir`, `rm`, `mv`, `cp`.
- Settings: `desktop_pattern`.
- UI: `open`, `apps`, `windows`, `inspect`, `activate`, `click`, `dblclick`, `drag`, `type`, `key`, `menu`.
- Project: `project`, `edit`, `build`, `install`, `restart`, `restore`, `instances`.
- Rendering/time: `render`, `screenshot`, `sleep`.

Shell output is human-readable by default: `ls` prints sorted names, one per line, with `/` after directories; `stat` prints labeled metadata; `apps` and `windows` print tables. `inspect` lists named/actionable nodes and text, omitting anonymous layout containers; `inspect --json` returns the full snapshot including bounds. `menu` lists items, selected radio choices, and disabled state. Successful file mutations and UI actions are quiet; `screenshot` prints the saved path. `cat` outputs the original file bytes, so reading a JSON service resource still prints JSON.

Commands whose help includes `[--json]` accept it immediately after the command, for example `ls --json /disk` or `windows --json`. This emits the full kernel result instead of formatted output. Use `--` before an operand named `--json`, for example `ls -- --json`. Options are not consumed inside operands: `write /disk/example --json` writes that literal text. Direct MCP tools always retain their structured results; `run_shell` wraps the selected shell output with exit status and stream metadata.

`write path text` submits one complete body. `rm -r path` is required for a nonempty directory. `screenshot path.pbm` writes binary PBM onto the disk.

Control Panel and "About This Macintosh…" are Finder windows, not apps, so they open from the Apple menu (the Apple glyph is U+F8FF, ``): `menu  "Control Panel"`.

```text
desktop_pattern white
menu  "Control Panel"
inspect
click desktop-pattern-black <window-id>
screenshot /disk/desktop.pbm
```

Click a Finder icon and press Enter to reveal its `rename` field. Select the existing name with `key a meta`, use `type rename 'New name.txt'`, and submit with `key Enter`.

Exit codes: **0** success, **1** operation failure, **2** syntax/usage, **127** unknown command, **130** cancellation. `run_shell` defaults to a fresh shell session, 30 seconds, and 64 KiB per output stream. Its `session` argument explicitly reuses a caller-owned shell session; `cwd` is accepted only for a fresh session. Results include cwd, exit code, bounded output, exact `stdoutBytes`/`stderrBytes`, truncation flags, run id, and shell-session id. `cat` preserves raw bytes; text fields provide a decoded view. `shell_outcome` retrieves retained results during that boot.

## Traps and the disk

The kernel is a Toolbox: MCP tools, Terminal commands, and Source Editor all call the same registered traps. `kernel.describe()` is the contract catalog. There is no live mount table.

File traps (`stat`, `list`, `read`, `write`, …) resolve paths through the File Manager. `/disk` is a stable prefix for the volume root; renaming the visible disk label does not change it. Finder and `useApp().fs` still use node ids and roles. File results include `id`, `revision`, `path`, `kind`, and `contentType`. Persistent writes accept `expectedRevision` (zero means the file must not already exist).

`desktop_pattern` reads or sets `checker` / `white` / `black`. Control Panel and Desktop use the same typed service. The bytes live in the role-based Preferences folder as `desktop-pattern`; a missing or malformed file uses `checker` and reports a diagnostic on the trap result. Writing that Preferences file through the File Manager is observed.

Catalog v3 persists monotonically increasing node revisions; v1/v2 disks migrate automatically. Asynchronous content writes are serialized. Conflicting compare-and-swap writes cannot both overwrite the same revision. Persistence errors propagate to callers, and a later flush can retry. Multi-resource copy and persistence are not transactions.

Errors include `missing-resource`, `permission`, `unsupported-operation`, `stale-reference`, `conflict`, `disconnect`, `cancellation`, `invalid-argument`, and `ambiguity`. Backend failures preserve their diagnostic message. A disconnect after dispatch can mean an **unknown mutation outcome**. Use the returned action id with `action_outcome`, then inspect state; never automatically replay. A browser reload invalidates the selected boot and all UI references. Select its new session and inspect again.

Each shell command has one definition for operand syntax, JSON support, execution, and formatting. `help` is derived from that table.

## Implementation contracts

`defineOperation` ties a handler's TypeScript input/result types to its runtime schemas. Boot composes a `Kernel`, attaches the File Manager through `registerFileOperations`, then registers UI, settings, project, and shell traps. The shell explicitly declares that cancellation returns its exit-130 outcome.

An operation receives an `Execution` with the caller, cancellation, streams, the boot `Disk`, and nested `invoke`. Sessions identify the caller and own cleanup; they are not an ACL.

All three bridge peers use the shared envelope contracts. They validate message direction, routing ids, boot generations, stream channels/bytes, and error shapes. Invalid incoming envelopes close the connection; host request construction rejects invalid arguments before sending. Dynamic operation arguments/results are still validated by the kernel's registered contract rather than copied into the transport.

## Verification and evidence

The 10 September architecture consolidation passed all 208 tests across 28 files, all three TypeScript checks, and the production build. This includes headless CLI execution and real loopback transport tests; the interactive live-browser demo below was not rerun for this refactor.

`npm run typecheck` checks the browser, DOM-free core, and host adapters. `npm test` includes actual loopback WebSocket tests and therefore needs permission to listen on localhost in a restricted sandbox.

`scripts/companion/demo.ts` is a real stdio MCP client. Set `MOCKINTOSH_DEMO_CONFIG` to a private JSON file containing `{ "token": "..." }` (default `/tmp/mockintosh-m1-connection.json`). Pair exactly one browser and run:

```sh
npm run test:m1 -- before
# Reload the browser and pair again through its UI.
npm run test:m1 -- after
npm run test:m1 -- rename
npm run test:m1 -- terminal
npm run test:m1 -- cli
```

Evidence is written to `/tmp/mockintosh-m1-evidence`. The optional `--pair` development harness uses terminal-browser and `MOCKINTOSH_DEMO_TAB` (default `4`) to operate the local pairing UI without printing the token. The before/after phases assert different boot identities and persistent black preference; other phases verify Finder rename, Terminal execution, and independent CLI/MCP control of the same browser.

M2 app-building operations are now described in [M2 apps](m2-apps.md); M3 ChatGippity execution ownership remains planned. The runtime retains the existing single-UI-instance-per-realm constraint.

### Reconciliation retention

The companion and browser each retain at most 256 completed/unknown outcomes, 8 MiB of serialized results, and five minutes of history; the earliest limit wins. Oversized results are delivered but not retained. Completed outcomes contain no socket references. Periodic cleanup expires idle journals, and disposing the browser bridge clears its journal. Active requests are separate and capped at 128; disconnect releases their socket references and retains an unknown outcome where appropriate. Shell result history uses the same retention limits.

An expired or evicted outcome is reported as missing, which does not mean the action failed or never ran. Duplicate-action protection applies within retained history. Never retry a mutation merely because its history is missing; inspect current state and use a new deliberate action if needed. Same-boot reconnect can reconcile retained unknown outcomes; old-boot references remain invalid.

Caller cleanup and shell retention now use the shared lifetime/session manager described in [M2 apps](m2-apps.md).
