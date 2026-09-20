# Data layers for a portable, multiplayer Mockintosh

Research checked 10 September 2026 against current official documentation. This is a recommendation for evaluation, not a dependency decision or a claim that these products have been tested in Mockintosh. Product capabilities and maturity can change; pin versions and repeat the proposed tests before adoption. See [the kernel plan](kernel-plan.md) for the OS boundary.

## Recommendation

If building a hosted control/job service, use PostgreSQL as the baseline for ownership, grants, runtime assignments, job acceptance, and durable action records; a private single-host experiment can use SQLite. Keep each computer's disk behind the existing storage/VFS contracts. A server disk can initially use a private persistent directory; evaluate SQLite for transactional catalog metadata when implementing the server storage adapter. Store backups and larger immutable file bodies in object storage when needed.

Do not require every browser or device to run the hosted service's database. A local computer must still boot and save without an account or network. A remote viewer needs a connection to its computer; a synchronized document can remain editable offline. Those are different experiences.

For the newer technology experiment, shortlist **Evolu for private key-owned local data**, **LiveStore and Jazz for app-level local-first state**, **PowerSync for offline relational data backed by PostgreSQL**, and **Automerge or Yjs for collaborative documents**. Evaluate a single small application first. Electric and Zero are useful alternatives when the primary need is reactive access to authoritative server data. Convex and SpacetimeDB are broader backend choices that would introduce more architectural coupling.

These rankings are architectural judgments based on the documented behavior below, not vendor benchmarks.

## Separate four kinds of state

| State | Required behavior | Proposed ownership |
| --- | --- | --- |
| Accounts, permissions, computer placement, write leases | Authoritative validation; prevent two hosts independently owning one disk | Hosted control service and transactional database |
| VFS catalog and arbitrary file bytes | Stable IDs, expected-revision checks, explicit conflicts, durable acknowledgements | One active computer authority and its storage adapter |
| App documents, notes, shared boards | Optional offline writes and useful merging; app-specific conflict UI | Optional sync/CRDT service behind an app-facing contract |
| Pointer position, pressed keys, frames, presence | Live ordering, cancellation, bounded buffering; discard obsolete state | Runtime connection protocol, not durable database replication |

Two viewers operating one server computer do not need two replicated OS kernels. They share the authoritative runtime, with explicit input ownership or serialized gestures. Running a separate local computer while the server copy also changes is a different, much harder synchronization feature.

For ordinary files, preserve both conflicting versions or reject a stale write. Automatically merging arbitrary executable bundles, PNGs, and folder moves as generic last-writer-wins records could silently lose work or violate directory invariants. CRDT convergence alone does not establish valid filesystem semantics.

## Traditional baseline

**PostgreSQL.** Transactions, conditional updates, constraints, and explicit isolation levels suit the hosted control service. Serializable transactions can abort and require retries; application code must still enforce the invariant and distinguish a retryable transaction from replaying an external side effect. Recommendation: use a normal relational schema and explicit operation IDs, rather than making access control or runtime leases depend on eventually synchronized client state. [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html)

**SQLite.** An embedded database is attractive for one computer's catalog and action journal, with local deployment and export under our control. SQLite allows many readers but one writer at a time; its own guidance advises a client/server database for many concurrent writers or data directly accessed over a network filesystem. Recommendation: give the active runtime exclusive ownership and access it through the kernel. SQLite alone does not supply cross-device synchronization. [SQLite appropriate uses](https://www.sqlite.org/whentouse.html)

Neither choice requires a cloud vendor in the kernel API. Backups, blob references, restoring a consistent catalog, and writer fencing remain our responsibility.

## PostgreSQL synchronization layers

### PowerSync — strongest relational offline candidate

Clients write to local SQLite, queue changes, and upload through application backend code; source database changes return through the sync service. Conflict handling belongs to that backend. Default behavior is broadly field-level last-write-wins, with recommended delete handling, but custom revision checks or conflict records can replace it. Upload handling must be idempotent. This fits a future offline app dataset while preserving our own authoritative mutation API. [Write flow and custom conflicts](https://docs.powersync.com/handling-writes/custom-conflict-resolution), [update conflicts](https://docs.powersync.com/handling-writes/handling-update-conflicts)

PowerSync has cloud and self-hosted setups; the current setup guide supports PostgreSQL for the source and sync storage. It adds a service and client database lifecycle to operate. An optimistic local write is not the same as an accepted kernel write: rejection reporting and restoration of server state need an explicit user experience. Do not transparently substitute its upload queue for M1's completed-write acknowledgements. [Setup](https://docs.powersync.com/intro/setup-guide), [write validation failures](https://docs.powersync.com/handling-writes/handling-write-validation-errors)

### Electric — composable read synchronization

Current Electric synchronizes data out of PostgreSQL. It explicitly does not implement the write path; applications supply an API, persistent outbox, or another write mechanism. This gives us control of revision validation and operation outcomes, but means Electric alone is not a complete offline-write solution. It is a plausible layer for dashboards, file metadata browsing, and shared app queries. Distinguish current documentation from the older bidirectional Electric architecture under the legacy documentation domain. [Electric writes guide](https://electric.ax/docs/sync/guides/writes)

### Zero — online-first reactive applications

Zero runs optimistic mutators locally and runs server mutators transactionally against the authoritative database. Self-hosting requires PostgreSQL, zero-cache, and API/query/mutation endpoints. This is useful for responsive service administration and shared structured data. [Mutators](https://zero.rocicorp.dev/docs/mutators), [self-hosting](https://zero.rocicorp.dev/docs/self-host)

An important current limitation: Zero rejects writes in its disconnected, error, and needs-auth states. It permits a queue during connecting to absorb brief outages, but explicitly does not support sustained offline writes. Do not choose it on the assumption that it delivers an offline-editable computer. [Connection and offline behavior](https://zero.rocicorp.dev/docs/connection)

## Local-first application frameworks

### LiveStore — particularly relevant to an event-driven OS project

LiveStore exposes SQLite state, events/materializers, adapters for browser and Node, Solid integration, and multiple sync-provider options. Its sync model tracks acknowledged and pending events and rebases pending events when upstream history changes. That makes it an interesting experiment for an app with inspectable history and deterministic state changes. It does not mean arbitrary kernel actions can safely run again: materialization must be separated from file uploads, network requests, and other external effects. [Documentation and adapter inventory](https://docs.livestore.dev/), [sync state model](https://docs.livestore.dev/api/livestore/livestore/namespaces/syncstate/classes/syncstate/)

Recommendation: prototype a shared board or settings-like app, not the OS disk. Verify the chosen adapter's durable offline queue, event migration, authorization, and rebase behavior. The current docs identify themselves as work in progress; integration and operational maturity need direct testing.

### Jazz — promising, but version selection matters

Current Jazz documentation describes a local-first relational model, local replicas, row permissions, and browser persistence in OPFS. Concurrent writes to one field use last-writer-wins while retaining row history. Local, edge, and global durability waits are distinct; only the local wait can complete offline. This is especially relevant to clearly labeling whether work is saved on-device or acknowledged remotely. [Sync and conflicts](https://jazz.tools/docs/concepts/how-sync-works), [durability tiers](https://jazz.tools/docs/writing/writing-data)

The current client setup supports a local-only mode and self-hosted server URLs, while documenting an alpha deployment CLI. Older CoValue-oriented material is under the classic site. Pin a specific generation before evaluating; do not mix the APIs or assume their data models and migration paths are interchangeable. Recommendation: a bounded prototype for collaborative app data, with explicit tests for same-field conflicts, export, permission revocation, and browser storage loss. [Client setup](https://jazz.tools/docs/getting-started/client-setup), [server setup](https://jazz.tools/docs/getting-started/server-setup), [classic documentation](https://classic.jazz.tools/docs/svelte/key-features/version-control)

### InstantDB — useful reference, unsuitable managed default now

Instant combines relational queries, persisted client caches/outbox, real-time updates, permissions, and presence. It also documents self-hosting. However, its official announcement says **new signups are closed**, cloud apps shut down **31 August 2027**, and backups remain available until August 2028. Managed Instant is therefore excluded from the default for this new project. A self-hosted fork would mean accepting stewardship and operations work, not merely avoiding a cloud bill. [Architecture](https://www.instantdb.com/essays/architecture), [self-hosting](https://www.instantdb.com/docs/self-hosting), [official service announcement](https://www.instantdb.com/essays/instant_team_joins_openai)

## Evolu — the service the user identified

The user confirmed [Evolu](https://www.evolu.dev/docs) as the service they remembered. The initial comparison below explains its relationship to adjacent approaches; those alternatives are not proposed replacements for the identified product.

| Candidate | What matches | What remains different or uncertain |
| --- | --- | --- |
| **Evolu** | Owners derive from random entropy into an owner ID, encryption key, and write key. Its current relay docs advertise a free test relay and self-hosting. | The free relay is expressly for testing. This is not evidence of a production hosting commitment. |
| **GUN / SEA** | SEA can generate keys and authenticate a user with the key pair, without a username/password registration flow. | This identifies a cryptographic database mechanism, not a particular dependable free storage service. |
| **Nostr** | Its base protocol uses public keys, signed events, and interchangeable relays. | It is a protocol rather than one database/service; event retention, payment, and policy depend on the relay. |
| **DXOS** | Its identity guide creates an identity on first browser use and adds devices through invitations. | The retrieved identity page is labeled technology preview; it is not evidence of a current free hosted service. |
| **Peerbit** | Its official repository describes a P2P database framework with encryption, sharding, and search. | No comparable free hosted service was established in this review. |

Sources: [current Evolu owner contracts](https://www.evolu.dev/docs/api-reference/common/local-first/Owner), [current Evolu relay offering](https://www.evolu.dev/docs/relay), [GUN's official SEA API and key-pair authentication example](https://github.com/amark/gun/wiki/SEA), [Nostr NIP-01](https://github.com/nostr-protocol/nips/blob/master/01.md), [DXOS identity](https://docs.dxos.org/composer/user-guide/), [Peerbit repository](https://github.com/dao-xyz/peerbit).

**Evolu should be the first focused local-data experiment.** Its current platform combines reactive SQLite, CRDT synchronization, and encrypted data; relay documentation allows multiple relays and self-hosted/cloud combinations. The relay sees encrypted messages rather than the application data. That is a good conceptual match for a local Mockintosh that owns its data and optionally backs it up/synchronizes without conventional registration. It is an inference about fit, not proof of filesystem correctness. [Evolu platform](https://www.evolu.dev/), [relay](https://www.evolu.dev/docs/relay), [privacy model](https://www.evolu.dev/docs/privacy)

A blind encrypted relay cannot execute a desktop it cannot decrypt. A server-hosted Mockintosh would need the relevant decryption capability inside its runtime, which changes the trust boundary. Keep owner recovery keys separate from short-lived, scoped MCP access. Key-based identity can also be used with PostgreSQL; it does not force a particular database choice. Losing all recoverable copies of the key, authorizing a new device, revoking a stolen device, and paying for hosted compute still require designed flows.

Before selecting Evolu, specifically test current collaboration support and permission revocation, verify local and remote durability acknowledgements, and establish export/restore independently of the free relay. Its protocol defines owner/write-key checks, quota failures, and version errors, which are useful building blocks but do not by themselves implement the OS's expected-revision filesystem contract. [Protocol reference](https://www.evolu.dev/docs/api-reference/common/local-first/Protocol)

The integration gap is substantial enough to keep the experiment outside the kernel initially. Mockintosh currently persists a catalog plus file bodies through its filesystem storage interface; switching to a SQLite-backed sync library is not merely changing a connection string. We would need a data model for parent/name uniqueness, role folders, stable identities, binary content, revisions, deletion, history retention, and migration from existing disks. A locally accepted CRDT update cannot honestly promise that no other offline writer accepted the same expected revision. Choose either one authoritative writer for the disk or an explicit replicated-disk contract with conflict recovery. Start by syncing one app document or backing up immutable disk snapshots before considering live disk replication.

## Collaborative document engines

**Automerge** provides per-document synchronization with pluggable storage/network adapters; official adapters cover IndexedDB and a Node filesystem. Concurrent text/list edits merge, while conflicting assignments to the same property select a deterministic visible winner and retain alternate values accessible through a conflicts API. This is a strong fit for portable documents with history and conflict inspection. A repository/document model still needs application authorization, discovery, backups, and size limits. [Core concepts](https://automerge.org/docs/tutorial/concepts/), [storage](https://automerge.org/docs/reference/repositories/storage/), [conflicts](https://automerge.org/docs/reference/documents/conflicts/)

**Yjs** supplies shared types and editor integrations. Its IndexedDB provider supports offline persistence; its WebSocket provider carries document updates and awareness, with server integration points for authentication and persistence. This is a focused candidate for a collaborative source/text editor. It is not an account database or a complete filesystem. A server accepting Yjs updates needs document-level authorization and a deliberate relationship between document state and exported file revisions. [Yjs overview](https://docs.yjs.dev/), [offline editing](https://docs.yjs.dev/getting-started/allowing-offline-editing), [WebSocket provider](https://docs.yjs.dev/ecosystem/connection-provider/y-websocket)

Recommendation: compare these two using an actual editor when collaborative editing becomes a goal. Avoid storing an entire disk as one CRDT document. Keep document history and file snapshots separate; kernel reads can expose a current snapshot while document operations use a specialized service.

## Integrated realtime backends

**Convex** offers transactional server mutations with optimistic concurrency control and reactive client behavior. It can be self-hosted, with current licensing described as FSL converting to Apache 2.0 after two years. This could accelerate the hosted control service, but adopts its database/function model rather than a portable SQL interface. Optimistic UI updates alone do not establish a persistent offline-write protocol; that capability was not established by the reviewed sources and must be tested separately. Prefer PostgreSQL unless the reduction in application backend work outweighs that coupling. [OCC and atomicity](https://docs.convex.dev/database/advanced/occ), [optimistic updates](https://docs.convex.dev/client/react/optimistic-updates), [self-hosting and license](https://docs.convex.dev/self-hosting)

**SpacetimeDB** combines a database with server logic: reducers mutate tables, each reducer invocation is a transaction, and subscribed state reaches clients. It supports self-hosting. This is compelling for authoritative multiplayer simulations or a shared world inside Mockintosh. Using it as the OS kernel would instead move core behavior into its execution model; it is not a drop-in host for the existing renderer and runtime. The reviewed model establishes server-authoritative multiplayer, not independent offline writers merging a disk. [Reducers](https://spacetimedb.com/docs/functions/reducers/), [transactions](https://spacetimedb.com/docs/databases/transactions-atomicity/), [architecture and hosting FAQ](https://spacetimedb.com/docs/intro/faq/)

## Evaluation gates before adopting a sync layer

Use the same two-browser/one-server fixture for shortlisted candidates. Record observed outcomes and exact versions; a todo demo is insufficient evidence for disk correctness.

1. Edit offline, close the tab, restart, reconnect, and prove the pending write survives.
2. Concurrently rename/delete/edit the same object; expose both intent and final state. For ordinary file writes, prove one expected revision cannot be accepted twice.
3. Revoke write access while a client is offline; show how its queued work is rejected or recovered without silently disappearing.
4. Crash after server commit but before acknowledgement; reconcile by operation ID without repeating an external side effect.
5. Export data, restore to a fresh self-hosted instance, and reopen with stable resource identities.
6. Upgrade schema with an old offline client returning; verify migration or an explicit recovery route.
7. Measure bundle size, startup memory, history growth, blob handling, and sustained synchronization on target devices.
8. Distinguish local durability, remote acceptance, replication, and backup in both APIs and UI.

Current product direction prioritizes local execution with synchronized saved data and optional remote helper jobs. Evaluate Evolu on that experience first. A persistent hosted computer remains optional; job execution ownership belongs to a durable job service rather than a convergent data replica. See the [infrastructure plan](server-infrastructure-plan.md) for acceptance, checkpoint transfer, cancellation, and concurrent-edit behavior.
