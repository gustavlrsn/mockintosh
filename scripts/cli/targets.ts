import { randomUUID } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { Cancellation } from "../../src/os/kernel/cancellation";
import { CompanionClient } from "../companion/client";
import { withHeadless } from "../companion/headless";
import { startCompanion } from "../companion/server";
import type { CliIO } from "./run";
import type { LiveClient, Mac } from "./contract";

export function realIO(signal: AbortSignal): CliIO {
  return {
    stdout: process.stdout,
    stderr: process.stderr,
    env: process.env,
    stdinIsTTY: process.stdin.isTTY === true,
    signal,
    readFile: path => new Uint8Array(readFileSync(path)),
    writeFile: (path, data) => writeFileSync(path, data),
    useLive: withLive,
    useHeadless: withHeadlessMac,
    async pair(port) {
      const companion = startCompanion({
        origin: process.env.MOCKINTOSH_ORIGIN ?? "http://localhost:5173",
        port,
        token: process.env.MOCKINTOSH_TOKEN,
      });
      await new Promise<void>((resolve, reject) => {
        companion.server.once("listening", () => resolve());
        companion.server.once("error", reject);
      });
      process.stderr.write(`Mockintosh companion listening on ws://127.0.0.1:${port}\n`);
      process.stderr.write(`Pairing token: ${companion.token}\n`);
      process.stderr.write("Paste the token into the Companion panel, then use --connect.\n");
      await new Promise<void>(resolve => {
        if (signal.aborted) resolve();
        else signal.addEventListener("abort", () => resolve(), { once: true });
      });
      await companion.close();
    },
  };
}

export async function withHeadlessMac<T>(work: (mac: Mac) => Promise<T>): Promise<T> {
  return withHeadless(async os => {
    const caller = os.kernel.createSession();
    const mac: Mac = {
      operations: os.kernel.describe(),
      invoke(name, args, options) {
        const cancellation = new Cancellation();
        const stop = () => cancellation.cancel();
        if (options.signal.aborted) stop();
        else options.signal.addEventListener("abort", stop, { once: true });
        return os.kernel.invoke(caller, name, args, cancellation, {
          stdout: options.stdout,
          stderr: options.stderr,
        }).finally(() => options.signal.removeEventListener("abort", stop));
      },
    };
    return work(mac);
  });
}

export async function withLive<T>(url: string, token: string, work: (client: LiveClient) => Promise<T>): Promise<T> {
  const client = await CompanionClient.connect(url, token);
  try {
    return await work({
      async list() {
        return (await client.list()).map(session => ({
          session: session.session, instance: session.instance, generation: session.generation,
        }));
      },
      async open(session): Promise<Mac> {
        const selected = await client.select(session);
        return {
          operations: selected.operations as unknown as Mac["operations"],
          invoke(name, args, options) {
            const action = randomUUID();
            const stop = () => { void client.cancel(action).catch(() => {}); };
            if (options.signal.aborted) stop();
            else options.signal.addEventListener("abort", stop, { once: true });
            return client.invoke(selected, name, args, action, options.timeout ?? 65000, (channel, bytes) => {
              const sink = channel === "stdout" ? options.stdout : options.stderr;
              sink?.(new Uint8Array(bytes));
            }).finally(() => options.signal.removeEventListener("abort", stop));
          },
        };
      },
    });
  } finally {
    client.close();
  }
}
