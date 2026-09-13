import { Lifetime } from "./lifetime";
import * as schemas from "./schema";
import { ServiceError } from "./errors";
import { Cancellation } from "./cancellation";
import { Disk } from "./disk";
import type { FileSystem } from "@mockintosh/fs";

export { ServiceError, normalizePath, type ServiceErrorCode } from "./errors";
export { Disk, type FileResource } from "./disk";

export interface KernelSession {
  readonly id: string;
  readonly instance: string;
  readonly generation: number;
}

type Arguments = Record<string, unknown>;

export interface OperationStreams {
  stdout?(bytes: Uint8Array): void;
  stderr?(bytes: Uint8Array): void;
}

export interface Operation {
  name: string;
  description: string;
  inputSchema: schemas.Schema & { type: "object"; properties: Record<string, schemas.Schema>; required: readonly string[]; additionalProperties: false };
  resultSchema: schemas.Schema;
  cancellation?: "return-result";
  handler(args: Arguments, execution: Execution): Promise<unknown>;
}

export interface Execution {
  readonly caller: KernelSession;
  readonly cancellation: Cancellation;
  readonly streams?: OperationStreams;
  readonly disk: Disk;
  invoke(name: string, args: Arguments): Promise<unknown>;
}

/** One definition connects wire validation, documentation, and inferred handler types. */
export function defineOperation<const P extends Record<string, schemas.Schema>, const R extends readonly (keyof P & string)[], const S extends schemas.Schema>(
  name: string, description: string, properties: P, required: R, resultSchema: S,
  handler: (args: schemas.Value<ReturnType<typeof schemas.object<P, R>>>, execution: Execution) => Promise<schemas.Value<S>>,
  options: { cancellation?: "return-result" } = {},
): Operation {
  return {
    ...options, name, description, inputSchema: schemas.object(properties, required), resultSchema,
    handler: (args, execution) => handler(args as schemas.Value<ReturnType<typeof schemas.object<P, R>>>, execution),
  };
}

let generation = 0;
const instance = `os-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

/** A boot owns its registry and callers. Sessions identify the caller; they are not an ACL. */
export class Kernel {
  readonly instance = instance;
  readonly generation = ++generation;
  disk?: Disk;
  private alive = true;
  private sessions = new Map<string, KernelSession>();
  private operations = new Map<string, Operation>();
  private nextSession = 0;
  private lifetimes = new Map<string, Lifetime>();

  attachDisk(fs: FileSystem) {
    this.disk = new Disk(fs);
  }

  register(operation: Operation) {
    if (this.operations.has(operation.name)) throw new ServiceError("conflict", "Operation already registered");
    this.operations.set(operation.name, { ...operation, inputSchema: JSON.parse(JSON.stringify(operation.inputSchema)), resultSchema: JSON.parse(JSON.stringify(operation.resultSchema)) });
  }

  requireOperation(name: string): Omit<Operation, "handler" | "cancellation"> {
    const operation = this.operations.get(name);
    if (!operation) throw new ServiceError("unsupported-operation", `Unknown operation: ${name}`);
    const { handler, cancellation, ...contract } = operation;
    return JSON.parse(JSON.stringify(contract)) as Omit<Operation, "handler" | "cancellation">;
  }

  describe() {
    return [...this.operations.keys()].map(name => this.requireOperation(name));
  }

  documentation(): string {
    return this.describe().map(o => `### ${o.name}\n\n${o.description}\n\n${JSON.stringify(o.inputSchema)}\n\nResult: ${JSON.stringify(o.resultSchema)}`).join("\n\n");
  }

  createSession(): KernelSession {
    this.assertAlive();
    const session = Object.freeze({
      id: `${this.generation}:${++this.nextSession}`,
      instance: this.instance,
      generation: this.generation,
    });
    this.sessions.set(session.id, session);
    this.lifetimes.set(session.id, new Lifetime());
    return session;
  }

  onSessionEnd(caller: KernelSession, cleanup: () => void): () => void {
    this.assertAlive();
    if (this.sessions.get(caller.id) !== caller) throw new ServiceError("permission", "Caller session is not active");
    return this.lifetimes.get(caller.id)!.own(cleanup);
  }

  revokeSession(id: string) {
    this.sessions.delete(id);
    this.lifetimes.get(id)?.close();
    this.lifetimes.delete(id);
  }

  async invoke(caller: Pick<KernelSession, "id" | "instance" | "generation">, name: string, args: Arguments, cancellation = new Cancellation(), streams?: OperationStreams): Promise<unknown> {
    this.assertAlive();
    if (caller.instance !== this.instance || caller.generation !== this.generation) throw new ServiceError("stale-reference", "Select the current boot generation");
    const session = this.sessions.get(caller.id);
    if (!session) throw new ServiceError("permission", "Caller session is not active");
    const operation = this.operations.get(name);
    if (!operation) throw new ServiceError("unsupported-operation", `Unknown operation: ${name}`);
    if (!args || typeof args !== "object" || Array.isArray(args)) throw new ServiceError("invalid-argument", "Expected an argument object");
    schemas.validate(operation.inputSchema, args, "arguments");
    cancellation.check();
    const release = this.onSessionEnd(session, () => cancellation.cancel());
    let result: unknown;
    try {
      result = await operation.handler(args, this.execution(session, cancellation, streams));
      if (operation.cancellation !== "return-result") cancellation.check();
    } catch (error) {
      this.assertAlive();
      if (!this.sessions.has(caller.id)) throw new ServiceError("disconnect", "Caller session ended during operation");
      throw error;
    } finally {
      release();
    }
    this.assertAlive();
    if (!this.sessions.has(caller.id)) throw new ServiceError("disconnect", "Caller session ended during operation");
    const normalized = result === undefined ? null : result;
    schemas.validate(operation.resultSchema, normalized, "operation result");
    return normalized;
  }

  private execution(caller: KernelSession, cancellation: Cancellation, streams?: OperationStreams): Execution {
    const disk = this.disk;
    return {
      caller, cancellation, streams,
      get disk() {
        if (!disk) throw new ServiceError("unsupported-operation", "No disk is attached to this kernel");
        return disk;
      },
      invoke: (name, args) => this.invoke(caller, name, args, cancellation),
    };
  }

  shutdown() {
    this.alive = false;
    for (const id of [...this.sessions.keys()]) this.revokeSession(id);
  }

  private assertAlive() {
    if (!this.alive) throw new ServiceError("disconnect", "Boot has ended");
  }
}
