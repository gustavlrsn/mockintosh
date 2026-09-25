import { describe, expect, it } from "vitest";
import { run, type CliIO } from "./run";
import type { LiveClient, Mac, OperationContract } from "./contract";
import { integer, object, string } from "../../src/shared/schema";

const frame = object({ width: integer, height: integer, rowBytes: integer, bytes: { type: "array", items: integer } });
const shell = object({
  exitCode: integer, stdout: string, stderr: string,
  truncated: object({ stdout: { type: "boolean" }, stderr: { type: "boolean" } }),
  stdoutBytes: { type: "array" }, stderrBytes: { type: "array" },
});

function op(name: string, properties: OperationContract["inputSchema"]["properties"], required: string[], resultSchema: OperationContract["resultSchema"]): OperationContract {
  return { name, description: `${name} does a thing`, inputSchema: { type: "object", properties, required, additionalProperties: false }, resultSchema };
}

function io(mac: Mac, extra: Partial<CliIO> = {}): CliIO & { out: string; err: string; files: Map<string, Uint8Array> } {
  const files = new Map<string, Uint8Array>();
  let out = "", err = "";
  const base: CliIO = {
    stdout: { write: chunk => { out += typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("binary"); } },
    stderr: { write: chunk => { err += typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("binary"); } },
    env: { MOCKINTOSH_TOKEN: "token" },
    stdinIsTTY: true,
    signal: new AbortController().signal,
    readFile: path => new Uint8Array(Buffer.from(path)),
    writeFile: (path, data) => { files.set(path, data); },
    useLive: async (_url, _token, work) => work({
      list: async () => [{ session: "only", instance: "os", generation: 1 }],
      open: async () => mac,
    } satisfies LiveClient),
    useHeadless: async work => work(mac),
    pair: async () => { err += "paired\n"; },
    ...extra,
  };
  return { ...base, files, get out() { return out; }, get err() { return err; } };
}

describe("run", () => {
  const operations = [
    op("list", { path: string, recursive: { type: "boolean" } }, ["path"], { type: "array" }),
    op("screenshot", {}, [], frame),
    op("run_shell", { command: string }, ["command"], shell),
  ];

  it("prints host help without booting a Mac", async () => {
    let booted = false;
    const cli = io({ operations, invoke: async () => null }, { useHeadless: async () => { booted = true; return 0; } });
    expect(await run(["help"], cli)).toBe(0);
    expect(cli.out).toContain("trap table");
    expect(booted).toBe(false);
  });

  it("calls the trap the Mac published", async () => {
    const seen: unknown[] = [];
    const cli = io({
      operations,
      invoke: async (name, args) => { seen.push({ name, args }); return [{ path: "/disk" }]; },
    });
    expect(await run(["--headless", "list", "/disk", "--recursive"], cli)).toBe(0);
    expect(seen).toEqual([{ name: "list", args: { path: "/disk", recursive: true } }]);
    expect(cli.out).toContain("/disk");
  });

  it("writes a screenshot PNG and leaves the pixels out of the JSON", async () => {
    const cli = io({
      operations,
      invoke: async () => ({ width: 8, height: 1, rowBytes: 1, bytes: [0] }),
    });
    expect(await run(["--headless", "screenshot", "--out", "shot.png"], cli)).toBe(0);
    expect([...cli.files.get("shot.png")!.slice(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    expect(cli.out).toContain("shot.png");
    expect(cli.out).not.toContain("\"bytes\"");
  });

  it("streams a shell trap and returns its exit code", async () => {
    const cli = io({
      operations,
      invoke: async (_name, _args, options) => {
        options.stdout?.(new TextEncoder().encode("hello\n"));
        return { exitCode: 3, stdout: "hello\n", stderr: "", truncated: { stdout: false, stderr: false }, stdoutBytes: [], stderrBytes: [] };
      },
    });
    expect(await run(["--headless", "run_shell", "help"], cli)).toBe(3);
    expect(cli.out).toBe("hello\n");
  });

  it("uses the only paired Mac", async () => {
    const cli = io({ operations, invoke: async () => [] });
    expect(await run(["list", "/disk"], cli)).toBe(0);
    expect(cli.err).toContain("Using session only");
  });

  it("starts pairing without a token", async () => {
    const cli = io({ operations, invoke: async () => null }, { env: {} });
    expect(await run(["pair"], cli)).toBe(0);
    expect(cli.err).toContain("paired");
  });
});
