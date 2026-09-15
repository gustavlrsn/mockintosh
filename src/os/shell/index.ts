import { RetainedResults } from "../../shared/retainedResults";
import { shellOutcome, type Value } from "../kernel/schema";
import { Kernel, ServiceError, defineOperation, normalizePath, type KernelSession } from "../kernel";
import { Cancellation } from "../kernel/cancellation";
import { parseShell, ShellSyntaxError } from "./parser";
import { commandHelp, executeCommand, UsageError } from "./commands";
export type ShellOutcome = Value<typeof shellOutcome>;
class Output {
  data: number[] = [];
  get text() { return new TextDecoder().decode(new Uint8Array(this.data)); }
  bytes = 0;
  truncated = false;
  constructor(private limit: number, private sink?: (bytes: Uint8Array) => void) { }
  append(text: string) {
    let accepted = "";
    for (const char of text) {
      const size = new TextEncoder().encode(char).length;
      if (this.bytes + size > this.limit) {
        this.truncated = true;
        break;
      }
      this.bytes += size;
      accepted += char;
    }
    const encoded = new TextEncoder().encode(accepted);
    for (const byte of encoded) this.data.push(byte);
    if (encoded.length) this.sink?.(encoded);
  }
  write(body: Uint8Array) {
    const accepted = body.slice(0, Math.max(0, this.limit - this.bytes));
    this.truncated ||= accepted.length !== body.length;
    this.bytes += accepted.length;
    for (const byte of accepted) this.data.push(byte);
    if (accepted.length) this.sink?.(accepted);
  }
}
export class ShellSession {
  cwd: string;
  running = false;
  private closed = false;
  private token?: Cancellation;
  close() { this.closed = true; this.token?.cancel(); }
  constructor(readonly id: string, readonly caller: KernelSession, private kernel: Kernel, cwd = "/disk") {
    this.cwd = normalizePath(cwd);
  }
  async run(source: string, options: {
    id: string;
    cancellation?: Cancellation;
    outputLimit?: number;
    stdout?: (bytes: Uint8Array) => void;
    stderr?: (bytes: Uint8Array) => void;
  }): Promise<ShellOutcome> {
    if (this.closed) throw new ServiceError("disconnect", "Shell session ended");
    if (this.running) throw new ServiceError("conflict", "Shell session is already running");
    this.running = true;
    const token = this.token = options.cancellation ?? new Cancellation();
    const stdout = new Output(options.outputLimit ?? 65536, options.stdout),
      stderr = new Output(options.outputLimit ?? 65536, options.stderr);
    let exitCode = 0;
    const invoke = (name: string, args: Record<string, unknown> = {}) => this.kernel.invoke(this.caller, name, args, token);
    const path = (value: string) => normalizePath(value.startsWith("/") ? value : this.cwd + "/" + value);
    const target = (value: string, window?: string) => ({
      ...(/^\d+$/.test(value) ? {
        id: Number(value)
      } : {
        name: value
      }),
      ...(window ? {
        window
      } : {})
    });
    try {
      const commands = parseShell(source);
      for (const [name, ...args] of commands) {
        token.check();
        exitCode = 0;
        try {
          if (!Object.hasOwn(commandHelp, name)) {
            stderr.append(`${name}: command not found\n`);
            exitCode = 127;
            continue;
          }
          await executeCommand(name, args, {
            invoke,
            path,
            target,
            stdout,
            token,
            cwd: () => this.cwd,
            setCwd: value => {
              this.cwd = value;
            }
          });
        } catch (error) {
          if (token.cancelled) throw error;
          exitCode = error instanceof UsageError ? 2 : 1;
          stderr.append(`${name}: ${error instanceof Error ? error.message : String(error)}\n`);
        }
      }
    } catch (error) {
      exitCode = token.cancelled ? 130 : error instanceof ShellSyntaxError ? 2 : 1;
      stderr.append((error instanceof Error ? error.message : String(error)) + "\n");
    } finally {
      this.running = false;
      this.token = undefined;
    }
    return {
      id: options.id,
      session: this.id,
      cwd: this.cwd,
      stdout: stdout.text,
      stderr: stderr.text,
      stdoutBytes: stdout.data,
      stderrBytes: stderr.data,
      exitCode,
      truncated: {
        stdout: stdout.truncated,
        stderr: stderr.truncated
      }
    };
  }
}
/** Terminal and RPC own the same sessions and command execution limits. */
export class ShellManager {
  private sessions = new Map<string, {shell: ShellSession; used: number; keepAlive: boolean}>();
  private owners = new Map<string, () => void>();
  private outcomes = new RetainedResults<{owner: string; result: ShellOutcome}>();
  private counter = 0;
  constructor(private kernel: Kernel) {}
  open(caller: KernelSession, cwd?: string, options: {keepAlive?: boolean} = {}): string {
    for (const [id, entry] of this.sessions) if (!entry.keepAlive && !entry.shell.running && Date.now() - entry.used > 300000) this.dispose(id);
    if (this.sessions.size >= 128) {
      const oldest = [...this.sessions].filter(([, entry]) => !entry.keepAlive && !entry.shell.running).sort((a, b) => a[1].used - b[1].used)[0];
      if (oldest) this.dispose(oldest[0]);
    }
    if (this.sessions.size >= 128) throw new ServiceError("conflict", "Too many shell sessions; close an idle session");
    if (!this.owners.has(caller.id)) {
      this.owners.set(caller.id, this.kernel.onSessionEnd(caller, () => {
        for (const [id, entry] of this.sessions) if (entry.shell.caller.id === caller.id) { entry.shell.close(); this.sessions.delete(id); }
        for (const [id, entry] of this.outcomes.entries()) if (entry.owner === caller.id) this.outcomes.delete(id);
        this.owners.delete(caller.id);
      }));
    }
    const id = `shell-${++this.counter}`;
    this.sessions.set(id, {shell: new ShellSession(id, caller, this.kernel, cwd), used: Date.now(), keepAlive: options.keepAlive === true});
    return id;
  }
  close(caller: KernelSession, id: string) {
    const entry = this.sessions.get(id);
    if (!entry) return;
    if (entry.shell.caller.id !== caller.id) throw new ServiceError("permission", "Shell session does not belong to caller");
    this.dispose(id);
  }
  private dispose(id: string) { this.sessions.get(id)?.shell.close(); this.sessions.delete(id); }
  async run(caller: KernelSession, command: string, options: {
    session?: string; cwd?: string; timeout?: number; outputLimit?: number; keepAlive?: boolean;
    cancellation?: Cancellation; stdout?: (bytes: Uint8Array) => void; stderr?: (bytes: Uint8Array) => void;
  } = {}): Promise<ShellOutcome> {
    const timeout = options.timeout ?? 30000, outputLimit = options.outputLimit ?? 65536;
    if (!Number.isSafeInteger(timeout) || timeout < 1 || timeout > 3600000 || !Number.isSafeInteger(outputLimit) || outputLimit < 0 || outputLimit > 1048576)
      throw new ServiceError("invalid-argument", "Invalid timeout or output limit");
    if (options.session && options.cwd !== undefined) throw new ServiceError("invalid-argument", "Set cwd only when creating a session");
    const id = options.session ?? this.open(caller, options.cwd, { keepAlive: options.keepAlive === true });
    const entry = this.sessions.get(id);
    if (!entry || entry.shell.caller.id !== caller.id) throw new ServiceError("permission", "Shell session does not belong to caller");
    const token = options.cancellation ?? new Cancellation();
    const release = this.kernel.onSessionEnd(caller, () => token.cancel());
    const timer = setTimeout(() => token.cancel(), timeout);
    try {
      const result = await entry.shell.run(command, {...options, outputLimit, cancellation: token, id: `run-${++this.counter}`});
      entry.used = Date.now();
      if (this.owners.has(caller.id)) this.outcomes.set(result.id, {owner: caller.id, result});
      return result;
    } finally { clearTimeout(timer); release(); }
  }
  outcome(caller: KernelSession, id: string) {
    const entry = this.outcomes.get(id);
    if (!entry || entry.owner !== caller.id) throw new ServiceError("missing-resource", "No outcome for this caller");
    return entry.result;
  }
}
export function registerShell(kernel: Kernel): ShellManager {
  const manager = new ShellManager(kernel);
  kernel.register(defineOperation("run_shell", "Run S1 commands in this OS; fresh session by default. No host shell execution.", {
    command: {type: "string"}, session: {type: "string"}, cwd: {type: "string"},
    timeout: {type: "integer", minimum: 1, maximum: 3600000}, outputLimit: {type: "integer", minimum: 0, maximum: 1048576},
    keepAlive: {type: "boolean"},
  }, ["command"], shellOutcome, (args, e) => manager.run(e.caller, args.command, {...args, cancellation: e.cancellation, ...e.streams}), {cancellation: "return-result"}));
  kernel.register(defineOperation("shell_outcome", "Retrieve a retained shell result from this boot", {id: {type: "string"}}, ["id"], shellOutcome,
    async (args, e) => manager.outcome(e.caller, args.id)));
  kernel.register(defineOperation("shell_close", "Close a caller-owned shell session", {session: {type: "string"}}, ["session"], {type: "null"},
    async (args, e) => { manager.close(e.caller, args.session); return null; }));
  return manager;
}
