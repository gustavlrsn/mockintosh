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

  it("enforces session operation grants", async () => {
    const { kernel } = await setup();
    const limited = kernel.createSession({ operations: ["stat", "list"] });
    await expect(kernel.invoke(limited, "stat", { path: "/disk" })).resolves.toMatchObject({ kind: "directory" });
    await expect(kernel.invoke(limited, "write", { path: "/disk/x", body: "no" })).rejects.toMatchObject({
      code: "permission",
    });
    expect(kernel.describe(limited).map(o => o.name).sort()).toEqual(["list", "stat"]);
    const open = kernel.createSession();
    await expect(kernel.invoke(open, "write", { path: "/disk/ok", body: "yes" })).resolves.toMatchObject({ path: "/disk/ok" });
  });

  it("rejects revoked and stale granted sessions", async () => {
    const { kernel } = await setup();
    const limited = kernel.createSession({ operations: ["stat"] });
    kernel.revokeSession(limited.id);
    await expect(kernel.invoke(limited, "stat", { path: "/disk" })).rejects.toMatchObject({ code: "permission" });
    const stale = kernel.createSession({ operations: ["stat"] });
    await expect(kernel.invoke({ ...stale, generation: 0 }, "stat", { path: "/disk" })).rejects.toMatchObject({
      code: "stale-reference",
    });
  });

  it("edits by exact string with uniqueness and CAS", async () => {
    const { kernel, caller } = await setup();
    const written = await kernel.invoke(caller, "write", { path: "/disk/a.ts", body: "const a = 1;\nconst b = 1;\n" }) as { revision: number };
    await expect(kernel.invoke(caller, "edit", {
      path: "/disk/a.ts", oldText: "const a = 1;", newText: "const a = 2;", expectedRevision: written.revision,
    })).resolves.toMatchObject({ path: "/disk/a.ts" });
    expect(await kernel.invoke(caller, "read", { path: "/disk/a.ts" })).toContain("const a = 2;");
    const again = await kernel.invoke(caller, "stat", { path: "/disk/a.ts" }) as { revision: number };
    await expect(kernel.invoke(caller, "edit", {
      path: "/disk/a.ts", oldText: "const b = 1;", newText: "x", expectedRevision: 0,
    })).rejects.toMatchObject({ code: "conflict" });
    await expect(kernel.invoke(caller, "edit", {
      path: "/disk/a.ts", oldText: "missing", newText: "x", expectedRevision: again.revision,
    })).rejects.toMatchObject({ code: "conflict" });
    await kernel.invoke(caller, "write", { path: "/disk/dup.ts", body: "aa aa\n" });
    const dup = await kernel.invoke(caller, "stat", { path: "/disk/dup.ts" }) as { revision: number };
    await expect(kernel.invoke(caller, "edit", {
      path: "/disk/dup.ts", oldText: "aa", newText: "bb", expectedRevision: dup.revision,
    })).rejects.toMatchObject({ code: "conflict" });
    await expect(kernel.invoke(caller, "edit", {
      path: "/disk/dup.ts", oldText: "aa", newText: "bb", expectedRevision: dup.revision, replaceAll: true,
    })).resolves.toMatchObject({ path: "/disk/dup.ts" });
  });

  it("searches a subtree and lists recursively", async () => {
    const { kernel, caller } = await setup();
    await kernel.invoke(caller, "mkdir", { path: "/disk/src" });
    await kernel.invoke(caller, "write", { path: "/disk/src/a.ts", body: "onDrag\n" });
    expect(await kernel.invoke(caller, "search", { path: "/disk", pattern: "onDrag" })).toEqual([
      { path: "/disk/src/a.ts", line: 1, text: "onDrag" },
    ]);
    const listed = await kernel.invoke(caller, "list", { path: "/disk", recursive: true }) as { path: string }[];
    expect(listed.map(item => item.path)).toContain("/disk/src/a.ts");
  });

  it("exposes a read-only source volume", async () => {
    const fs = await FileSystem.open({ backend: new InMemoryBackend() });
    fs.mkdir(ROOT_ID, "Macintosh HD", { role: "volume" });
    const kernel = new Kernel();
    registerFileOperations(kernel, fs, {
      async manifest() {
        return { commit: "test", files: [{ path: "packages/ui/src/pointer.ts", size: 4 }] };
      },
      async read(path) { return path === "packages/ui/src/pointer.ts" ? "drag" : Promise.reject(new Error("missing")); },
    });
    const caller = kernel.createSession();
    expect(await kernel.invoke(caller, "read", { path: "/system/source/packages/ui/src/pointer.ts" })).toBe("drag");
    await expect(kernel.invoke(caller, "write", { path: "/system/source/x.ts", body: "no" })).rejects.toMatchObject({
      code: "permission",
    });
    expect(await kernel.invoke(caller, "search", { path: "/system/source", pattern: "drag" })).toEqual([
      { path: "/system/source/packages/ui/src/pointer.ts", line: 1, text: "drag" },
    ]);
    await fs.flush();
  });
});
