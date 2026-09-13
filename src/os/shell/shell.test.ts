import { registerFileOperations } from "../kernel/files";
import { describe, expect, it } from "vitest";
import { FileSystem, InMemoryBackend, ROOT_ID } from "@mockintosh/fs";
import { Kernel } from "../kernel";
import { registerShell } from "./index";
import { parseShell } from "./parser";
async function setup() {
  const fs = await FileSystem.open({
    backend: new InMemoryBackend()
  });
  fs.mkdir(ROOT_ID, "Disk", {
    role: "volume"
  });
  const kernel = new Kernel();
  registerFileOperations(kernel, fs);
  registerShell(kernel);
  const caller = kernel.createSession();
  return {
    fs,
    kernel,
    caller,
    run: (args: Record<string, unknown>) => kernel.invoke(caller, "run_shell", args) as Promise<any>
  };
}
describe("S1 shell", () => {
  it("parses empty quoted arguments, escapes, and semicolons", () => {
    expect(parseShell('echo "" \'a b\' c\\ d; echo "a;b"')).toEqual([["echo", "", "a b", "c d"], ["echo", "a;b"]]);
    for (const input of ['echo "unterminated', "echo ok | cat", "echo x > file", "echo $HOME", "echo `pwd`", "echo x &", "echo \\"]) expect(() => parseShell(input)).toThrow();
  });
  it("rejects unsupported syntax before any mutation", async () => {
    const {
      run,
      fs
    } = await setup();
    expect(await run({
      command: 'write /disk/a yes; echo x | cat'
    })).toMatchObject({
      exitCode: 2
    });
    expect(fs.locate("volume") && fs.children(fs.locate("volume")!.id)).toHaveLength(0);
    await fs.flush();
  });
  it("isolates fresh cwd and reuses only explicit caller-owned sessions", async () => {
    const {
      run,
      fs,
      kernel
    } = await setup();
    const first = await run({
      command: "mkdir folder; cd folder; pwd"
    });
    expect(first.cwd).toBe("/disk/folder");
    expect((await run({
      command: "pwd"
    })).cwd).toBe("/disk");
    expect((await run({
      session: first.session,
      command: "pwd"
    })).stdout).toBe("/disk/folder\n");
    const another = kernel.createSession();
    await expect(kernel.invoke(another, "run_shell", {
      session: first.session,
      command: "pwd"
    })).rejects.toMatchObject({
      code: "permission"
    });
    await fs.flush();
  });
  it("preserves binary file bytes through cat and streamed output", async () => {
    const { kernel, caller, fs } = await setup();
    const bytes = [0, 255, 128, 13, 10];
    await kernel.invoke(caller, "write_bytes", { path: "/disk/binary", bytes });
    const chunks: number[] = [];
    const result = await kernel.invoke(caller, "run_shell", { command: "cat /disk/binary" }, undefined, { stdout: chunk => { for (const byte of chunk) chunks.push(byte); } });
    expect(chunks).toEqual(bytes);
    expect(result).toMatchObject({ exitCode: 0, stdoutBytes: bytes });
    await fs.flush();
  });
  it("returns the last command status and bounds UTF-8 output", async () => {
    const {
      run,
      fs
    } = await setup();
    expect(await run({
      command: "unknown"
    })).toMatchObject({
      exitCode: 127
    });
    expect(await run({
      command: "write one"
    })).toMatchObject({
      exitCode: 2
    });
    expect(await run({
      command: "cat missing"
    })).toMatchObject({
      exitCode: 1
    });
    expect(await run({
      command: "unknown; echo ok"
    })).toMatchObject({
      exitCode: 0
    });
    expect(await run({
      command: "echo ééé",
      outputLimit: 5
    })).toMatchObject({
      stdout: "éé",
      truncated: {
        stdout: true
      }
    });
    await fs.flush();
  });
});

it("formats filesystem commands for people and keeps structured results opt-in", async () => {
  const { run, kernel, caller } = await setup();
  expect(await run({ command: "mkdir 'My folder'; write zebra hello; write apple world" }))
    .toMatchObject({ exitCode: 0, stdout: "", stderr: "" });
  expect(await run({ command: "ls /disk" })).toMatchObject({ stdout: "My folder/\napple\nzebra\n" });
  expect(await run({ command: "ls 'My folder'" })).toMatchObject({ stdout: "" });
  const direct = await kernel.invoke(caller, "list", { path: "/disk" });
  const structured = await run({ command: "ls --json /disk" });
  expect(JSON.parse(structured.stdout)).toEqual(direct);
  expect(await run({ command: "stat apple" })).toMatchObject({ stdout: expect.stringContaining("Path: /disk/apple\nType: file\n") });
  expect(await run({ command: "mv apple renamed; cp renamed copy; rm copy; cat renamed" }))
    .toMatchObject({ exitCode: 0, stdout: "world" });
  expect(await run({ command: "write flag --json; cat flag" })).toMatchObject({ stdout: "--json" });
  expect(await run({ command: "mkdir -- --json; ls -- --json" })).toMatchObject({ exitCode: 0, stdout: "" });
});

it("validates nested operation results and detaches advertised contracts", async () => {
  const {kernel} = await setup();
  const schema = { type: ["object"], properties: { count: {type: "integer", minimum: 0} }, required: ["count"], additionalProperties: false };
  kernel.register({name: "broken", description: "fixture", inputSchema: {type: "object", properties: {}, required: [], additionalProperties: false}, resultSchema: schema, handler: async () => ({count: "wrong"})});
  const advertised = kernel.describe().find(operation => operation.name === "broken")!;
  advertised.resultSchema.properties!.count.type = "string";
  schema.properties.count.type = "string";
  expect(kernel.describe().find(operation => operation.name === "broken")!.resultSchema.properties!.count.type).toBe("integer");
  const caller = kernel.createSession();
  await expect(kernel.invoke(caller, "broken", {})).rejects.toMatchObject({code: "invalid-argument"});
});
