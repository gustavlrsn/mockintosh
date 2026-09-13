import {describe, expect, it, vi} from "vitest";
import {FileSystem, InMemoryBackend, ROOT_ID} from "@mockintosh/fs";
import {Kernel} from "./index";
import {Lifetime} from "./lifetime";
import {registerFileOperations} from "./files";
import {registerShell} from "../shell";

describe("caller lifetime ownership", () => {
  it("disposes once and releases other resources when cleanup throws", () => {
    const lifetime = new Lifetime(), calls: number[] = [];
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    lifetime.own(() => calls.push(1)); lifetime.own(() => { throw new Error("fixture"); }); lifetime.own(() => calls.push(3));
    lifetime.close(); lifetime.close(); lifetime.own(() => calls.push(4));
    expect(calls).toEqual([3, 1, 4]);
    expect(log).toHaveBeenCalledTimes(1); log.mockRestore();
  });
  it.each(["revoke", "shutdown"])("ends local shell work and sessions on %s", async mode => {
    const fs = await FileSystem.open({backend: new InMemoryBackend()}); fs.mkdir(ROOT_ID, "Disk", {role: "volume"});
    const kernel = new Kernel(); registerFileOperations(kernel, fs); const shell = registerShell(kernel);
    const caller = kernel.createSession();
    const other = kernel.createSession();
    const id = shell.open(caller, undefined, {keepAlive: true});
    const pending = shell.run(caller, "sleep 3600", {session: id});
    if (mode === "shutdown") kernel.shutdown(); else kernel.revokeSession(caller.id);
    expect((await pending).exitCode).toBe(130);
    await expect(shell.run(caller, "echo escaped", {session: id})).rejects.toMatchObject({code: "permission"});
    if (mode === "revoke") expect((await shell.run(other, "echo alive")).stdout).toBe("alive\n");
    kernel.shutdown(); await fs.flush();
  });
  it("bounds idle RPC sessions without expiring open Terminal sessions or their outcomes", async () => {
    const kernel = new Kernel(), shell = registerShell(kernel);
    const caller = kernel.createSession();
    const terminal = shell.open(caller, undefined, {keepAlive: true});
    const first = await shell.run(caller, "echo retained");
    for (let i = 0; i < 130; i++) await shell.run(caller, "echo short");
    expect((await shell.run(caller, "echo terminal", {session: terminal})).stdout).toBe("terminal\n");
    expect(shell.outcome(caller, first.id).stdout).toBe("retained\n");
    kernel.shutdown();
  });
});
