# Vercel Sandbox for Mockintosh

Research checked 11 September 2026 against current first-party documentation. Recommendations below are proposals; no Vercel integration or deployment was performed.

## Recommendation

Use Sandbox first as an optional remote build-and-test provider. Keep the desktop and authoritative local disk in the browser. The useful addition is access to isolated Linux tooling and behavioral validation, followed by explicitly durable remote jobs. Merely moving Counter compilation to a server offers little: [M2 already ships browser and companion compilers](m2-apps.md).

This follows the [kernel plan](kernel-plan.md): a source revision crosses the build-service boundary and returns an artifact; the builder does not acquire the live computer's whole disk. It also supports the [infrastructure plan](server-infrastructure-plan.md)'s preference for local execution, synchronized saved data, and optional remote helpers before a continuously hosted desktop. README's React description is historical; current plans and M2 describe the Solid universal renderer.

## Verified capabilities

- **Execution:** isolated Firecracker Linux microVMs, managed/custom images, privileged processes including Docker and FUSE. This supplies an execution boundary around an untrusted workload, but application-level authorization remains ours. [Overview](https://vercel.com/docs/sandbox).
- **SDK:** `@vercel/sandbox` manages commands, filesystem access and exposed ports. Detached commands provide IDs, output streaming through `logs()`, completion through `wait()`, and termination through `kill()`. `sandbox.fs` offers a Node-style filesystem API; `writeFiles` transfers inputs. `domain(port)` returns a public URL. This is enough for a build adapter with log forwarding, cancellation, artifact collection and temporary previews. [JS SDK](https://vercel.com/docs/sandbox/sdk-reference).
- **Persistence:** current SDK v2 creates persistent sandboxes by default. A named sandbox survives multiple VM sessions; stop saves the filesystem and subsequent SDK activity can resume it. `onResume` can restart services. Snapshot expiration defaults to 30 days after last use; indefinite retention is configurable. `getOrCreate` can recreate a sandbox whose snapshot expired, so our computer identity must never treat name reuse as proof the disk survived. [Persistence](https://vercel.com/docs/sandbox/concepts/persistent-sandboxes).
- **Snapshots:** capture filesystem and installed packages, and can seed multiple independent forks. Calling `snapshot()` stops the running session. Documentation describes filesystem restoration, not restoration of arbitrary process memory. Treat a resumed Mockintosh runtime as a fresh boot; checkpoint application state explicitly. [Snapshots](https://vercel.com/docs/sandbox/concepts/snapshots).
- **Drives:** beta, available on all plans; retain a directory independently of the sandbox environment until deletion. A drive supports one read-write mount and many read-only snapshot mounts; up to four drives can attach to a sandbox. This is a candidate for an agent workspace or computer disk, subject to storage-adapter crash/recovery tests. It is not document synchronization between browsers. [Drives](https://vercel.com/docs/sandbox/concepts/drives).
- **Network:** outbound access defaults to allow-all. Explicit deny-all and destination rules can be changed at runtime. Credentials brokering and request proxying allow secrets to stay outside the guest; hostname rules alone are not per-resource authorization. Use an appropriately constrained artifact/model gateway rather than supplying broad production credentials. [Firewall](https://vercel.com/docs/sandbox/concepts/firewall).
- **Authentication:** Vercel-hosted backends can use automatic OIDC; external backends use team/project identifiers and access tokens. Recommendation: keep provider credentials in a backend adapter and authorize users/jobs there, independently of Vercel project credentials. [Authentication](https://vercel.com/docs/sandbox/concepts/authentication).

## Cost and lifecycle constraints

Current quotas permit sessions up to 45 minutes on Hobby and 24 hours on Pro/Enterprise. A persistent sandbox can span many sessions, but this does not mean a running process survives each session boundary. Default timeout is five minutes. At the published `iad1` rates, active CPU costs $0.128/hour and allocated memory $0.0212/GB-hour. Memory is billed while running, including idle time, in minimum one-minute increments. Each vCPU includes 2 GB; the default allocation is 2 vCPUs. Network transfer, snapshots and drives add charges. Rates vary by region. [Pricing](https://vercel.com/docs/sandbox/pricing), [product FAQ](https://vercel.com/sandbox).

Illustrative calculation, not a measured workload: 2 GB kept running for 720 hours costs $30.53 in memory alone; default 4 GB costs $61.06. CPU, storage, transfer and plan costs are additional. This favors occasional helpers and stopped workspaces over permanently idle desktops. The pricing documentation lists 19 regions while the landing FAQ lists four: verify the selected region and SDK version when implementing rather than relying on older marketing examples. [Pricing](https://vercel.com/docs/sandbox/pricing).

## How this maps to the kernel plan

| Experience | Proposed use | What Mockintosh still owns |
| --- | --- | --- |
| A: build an app | Upload immutable source; compile and run validation in an isolated environment; return diagnostics, artifact and test evidence | Source revisions, SDK contract, install checks, shortcuts, persistence and visible launch |
| B: use my computer | Remote agent calls the existing authenticated live tools while using Sandbox for its own computation | Session pairing, grants, control ownership and actions in the exact visible OS |
| C: change the system | Fork a known disk/source state, test a changed shell in a separate runtime, show evidence, promote a selected result | New fork identity, explicit apply/restore, known-good recovery and compatibility |
| Remote helper after laptop closes | Named workspace plus detached execution, with checkpoints between sessions | Durable acceptance, job owner, status/event history, retries, cancellation and result reconciliation |
| H1: server computer | Candidate microVM host with independent persistent disk and remote display endpoint | Production host bundle, fresh boot IDs, disk commit semantics, writer fencing, frame/input protocol and backup/export |

These are architectural inferences from the capabilities above. Sandbox does not itself supply Mockintosh's semantic kernel, app SDK, mounts, shell language or computer ownership model. Linux commands should enter an explicit remote execution service; changing Mockintosh Terminal into an implicit Bash session would change its current semantics.

Two boundaries matter especially. Compiling or testing generated code inside Sandbox does **not** sandbox its subsequent execution in the browser: current installed applications still share a realm and an infinite loop can hang it. Likewise, testing a forked headless computer does **not** satisfy experience B's requirement to operate the user's exact live computer. [Current M2 limitations](m2-apps.md), [experience B](kernel-plan.md).

## Smallest useful experiment

1. Implement a server-side Sandbox-backed `BuildProvider`, initially preserving current source/import limits and compiler policy. Pin the image and toolchain, transfer only the immutable project snapshot, collect structured diagnostics and artifacts, and clean up on cancellation.
2. Add the differentiating test: boot a separate Mockintosh runtime with the Counter artifact, inspect/click controls, and return expected count transitions plus a screenshot. Validate production-compatible Solid compilation and runtime loading, not only successful JavaScript bundling.
3. Import the artifact into the live local computer using existing source-revision checks. A stale result remains inspectable and cannot silently replace newer work. Demonstrate local compilation still works without a Vercel account.
4. Measure startup, transfer, build/test time, cancellation and actual billed resources. Use non-persistent sandboxes for disposable builds or a retained base snapshot for a pinned toolchain; do not accumulate user project snapshots accidentally.
5. Only then add durable jobs as a separate ownership contract: acknowledge after input and job record are durably stored, let execution outlive its submitting connection, and retrieve/install the result after reconnect. SDK `detached: true` is a process-control facility, not a durable queue or exactly-once completion protocol.

The final step deliberately differs from today's caller-owned builds, which cancel on disconnect. A Sandbox provider alone should preserve that existing behavior. H1 can remain an independent experiment once the host/runtime and storage seams are ready.
