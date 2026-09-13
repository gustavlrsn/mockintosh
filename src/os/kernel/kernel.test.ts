import { registerFileOperations } from "./files";
import { describe, expect, it } from "vitest";
import { FileSystem, InMemoryBackend, ROOT_ID } from "@mockintosh/fs";
import { Kernel } from "./index";

async function setup(backend = new InMemoryBackend()) {
  const fs = await FileSystem.open({ backend });
  const disk = fs.mkdir(ROOT_ID, "Macintosh HD", { role: "volume" });
  const kernel = new Kernel();
  registerFileOperations(kernel, fs);
  const caller = kernel.createSession();
  return { fs, disk, kernel, caller, backend };
}

describe("kernel persistent volume", () => {
  it("shares GUI nodes and keeps /disk after a disk rename", async () => {
    const { fs, disk, kernel, caller } = await setup();
    const file = await fs.writeFile(disk.id, "gui.txt", "visible");
    fs.rename(disk.id, "Renamed disk");
    expect(await kernel.invoke(caller, "read", { path: "/disk/gui.txt" })).toBe("visible");
    await kernel.invoke(caller, "write", { path: "/disk/tool.txt", body: "tool" });
    expect(await fs.readText(fs.child(disk.id, "tool.txt")!.id)).toBe("tool");
    expect(await kernel.invoke(caller, "stat", { path: "/disk/gui.txt" })).toMatchObject({
      id: file.id,
      path: "/disk/gui.txt",
    });
  });

  it("allows only one concurrent compare-and-swap writer", async () => {
    const { fs, disk, kernel, caller } = await setup();
    const file = await fs.writeFile(disk.id, "file", "initial");
    const revision = file.revision;
    const results = await Promise.allSettled([
      kernel.invoke(caller, "write", { path: "/disk/file", body: "winner", expectedRevision: revision }),
      fs.writeFile(disk.id, "file", "loser", { expectedRevision: revision }),
    ]);
    expect(results.map(r => r.status)).toEqual(["fulfilled", "rejected"]);
    expect(await fs.readText(file.id)).toBe("winner");
    await fs.flush();
  });

  it("persists revisions and defaults legacy nodes", async () => {
    const { fs, disk, backend } = await setup();
    const file = await fs.writeFile(disk.id, "file", "a");
    fs.rename(file.id, "renamed");
    fs.setAttributes(file.id, { icon: "x" });
    await fs.flush();
    const loaded = await FileSystem.open({ backend });
    expect(loaded.node(file.id)!.revision).toBe(fs.node(file.id)!.revision);
    const doc = JSON.parse((await backend.readCatalog())!);
    doc.version = 2;
    for (const node of Object.values(doc.nodes) as { revision?: number }[]) delete node.revision;
    const legacy = await FileSystem.open({ backend: new InMemoryBackend(JSON.stringify(doc)) });
    expect(legacy.node(file.id)!.revision).toBe(1);
    await Promise.all([loaded.flush(), legacy.flush()]);
  });

  it("rejects stale boots, bad revisions, and work after shutdown", async () => {
    const { kernel, caller, fs } = await setup();
    await expect(kernel.invoke({ ...caller, generation: 0 }, "list", { path: "/disk" })).rejects.toMatchObject({
      code: "stale-reference",
    });
    await expect(kernel.invoke(caller, "write", { path: "/disk/a", body: "x", expectedRevision: -1 })).rejects.toMatchObject({
      code: "invalid-argument",
    });
    kernel.shutdown();
    await expect(kernel.invoke(caller, "list", { path: "/disk" })).rejects.toMatchObject({
      code: "disconnect",
    });
    await fs.flush();
  });

  it("requires recursive removal and copies within the disk", async () => {
    const { kernel, caller } = await setup();
    await kernel.invoke(caller, "mkdir", { path: "/disk/folder" });
    await kernel.invoke(caller, "write", { path: "/disk/folder/a", body: "x" });
    await expect(kernel.invoke(caller, "remove", { path: "/disk/folder" })).rejects.toMatchObject({
      code: "invalid-argument",
    });
    await kernel.invoke(caller, "copy", { source: "/disk/folder", destination: "/disk/copy" });
    expect(await kernel.invoke(caller, "read", { path: "/disk/copy/a" })).toBe("x");
    await kernel.invoke(caller, "remove", { path: "/disk/folder", recursive: true });
  });

  it("reports catalog persistence failure and can retry", async () => {
    class FailingBackend extends InMemoryBackend {
      fail = false;
      override async writeCatalog(json: string) {
        if (this.fail) throw new Error("disk full");
        await super.writeCatalog(json);
      }
    }
    const backend = new FailingBackend();
    const { kernel, caller, fs } = await setup(backend);
    backend.fail = true;
    await expect(kernel.invoke(caller, "write", { path: "/disk/a", body: "x" })).rejects.toThrow("disk full");
    backend.fail = false;
    await fs.flush();
    expect((await backend.readCatalog())!).toContain('"name":"a"');
  });
});
