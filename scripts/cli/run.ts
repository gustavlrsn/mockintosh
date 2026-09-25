import { parseCall, parseInvocation, UsageError } from "./args";
import type { LiveClient, Mac } from "./contract";
import { acceptsOut, globalHelp, operationHelp, presentsAsText } from "./help";
import { present } from "./present";

export interface CliIO {
  stdout: { write(chunk: Uint8Array | string): void };
  stderr: { write(chunk: Uint8Array | string): void };
  env: Record<string, string | undefined>;
  stdinIsTTY: boolean;
  signal: AbortSignal;
  readFile(path: string): Uint8Array;
  writeFile(path: string, data: Uint8Array): void;
  useLive<T>(url: string, token: string, work: (client: LiveClient) => Promise<T>): Promise<T>;
  useHeadless<T>(work: (mac: Mac) => Promise<T>): Promise<T>;
  /** Start the companion and resolve when `signal` aborts. */
  pair(port: number): Promise<void>;
}

/** Dispatch one invocation. Trap commands are whatever the selected Mac publishes. */
export async function run(argv: readonly string[], io: CliIO): Promise<number> {
  try {
    const invocation = parseInvocation(argv);
    if (invocation.command === "pair") {
      if (invocation.headless || invocation.connect) throw new UsageError("pair starts the companion; it does not select a Mac");
      const port = Number(io.env.MOCKINTOSH_PORT ?? 4318);
      await io.pair(port);
      return 0;
    }
    if (!invocation.command || (invocation.command === "help" && !invocation.headless && !invocation.connect) || (invocation.help && !invocation.command)) {
      io.stdout.write(globalHelp());
      return invocation.command === undefined && !invocation.help ? 1 : 0;
    }
    if (invocation.command === "sessions") {
      if (invocation.headless) throw new UsageError("sessions lists paired browsers");
      return await io.useLive(url(invocation, io), token(io), async client => {
        const sessions = await client.list();
        io.stdout.write(JSON.stringify(sessions.map(session => ({
          session: session.session, instance: session.instance, generation: session.generation,
        })), null, 2) + "\n");
        return 0;
      });
    }
    const finish = async (mac: Mac) => dispatch(mac, invocation, io);
    if (invocation.headless) return await io.useHeadless(finish);
    return await io.useLive(url(invocation, io), token(io), async client => {
      const sessions = await client.list();
      const id = invocation.connect ?? (sessions.length === 1 ? sessions[0]!.session : undefined);
      if (!id) {
        throw new UsageError(sessions.length === 0
          ? "No paired Mac. Run mockintosh pair, then connect from the Companion panel."
          : `Several Macs are paired. Pass --connect:\n${sessions.map(session => session.session).join("\n")}`);
      }
      if (!invocation.connect) io.stderr.write(`Using session ${id}\n`);
      return finish(await client.open(id));
    });
  } catch (error) {
    io.stderr.write((error instanceof Error ? error.message : String(error)) + "\n");
    if (error && typeof error === "object" && "action" in error && typeof error.action === "string") {
      io.stderr.write(`Reconcile action ${error.action} before retrying.\n`);
    }
    return io.signal.aborted ? 130 : 1;
  }
}

async function dispatch(mac: Mac, invocation: ReturnType<typeof parseInvocation>, io: CliIO): Promise<number> {
  if (invocation.command === "help") {
    const topic = invocation.commandArgs[0];
    if (invocation.commandArgs.length > 1) throw new UsageError("help takes one trap name");
    if (!topic) { io.stdout.write(globalHelp(mac.operations)); return 0; }
    const operation = mac.operations.find(item => item.name === topic);
    if (!operation) throw new UsageError(`Unknown trap ${topic}`);
    io.stdout.write(operationHelp(operation));
    return 0;
  }
  const operation = mac.operations.find(item => item.name === invocation.command);
  if (!operation) throw new UsageError(`Unknown trap ${invocation.command}. Run mockintosh help.`);
  const call = parseCall(operation, invocation.commandArgs, io.readFile);
  if (invocation.help || call.help) { io.stdout.write(operationHelp(operation)); return 0; }
  if (call.out !== undefined && !acceptsOut(operation)) throw new UsageError(`${operation.name} does not return bytes; --out is not used`);
  const shell = presentsAsText(operation);
  const json = invocation.json || call.json;
  const result = await mac.invoke(operation.name, call.args, {
    timeout: invocation.timeout,
    signal: io.signal,
    stdout: shell && !json ? bytes => io.stdout.write(bytes) : undefined,
    stderr: shell && !json ? bytes => io.stderr.write(bytes) : undefined,
  });
  return present({
    result, out: call.out, json, tty: io.stdinIsTTY, shell, hostFile: acceptsOut(operation),
    stdout: io.stdout, stderr: io.stderr, writeFile: io.writeFile,
  });
}

function url(invocation: ReturnType<typeof parseInvocation>, io: CliIO): string {
  return invocation.url ?? io.env.MOCKINTOSH_URL ?? "ws://127.0.0.1:4318";
}

function token(io: CliIO): string {
  const value = io.env.MOCKINTOSH_TOKEN;
  if (!value) throw new UsageError("Set MOCKINTOSH_TOKEN to the companion pairing token");
  return value;
}
