import type { FileSystem } from "@mockintosh/fs";
import { Kernel, defineOperation } from "./index";
import * as s from "./schema";

/** File Manager traps. Paths resolve through Disk (`/disk` is the volume prefix). */
export function registerFileOperations(kernel: Kernel, fs: FileSystem) {
  kernel.attachDisk(fs);
  const add: typeof defineOperation = (...args) => { const operation = defineOperation(...args); kernel.register(operation); return operation; };
  const path = { path: s.string };
  add("stat", "Inspect a file or folder and its revision", path, ["path"], s.resource, (a, e) => e.disk.stat(a.path));
  add("list", "List a directory", path, ["path"], s.array(s.resource), (a, e) => e.disk.list(a.path));
  add("read", "Read a whole UTF-8 file", path, ["path"], s.string, async (a, e) => new TextDecoder().decode(await e.disk.read(a.path)));
  add("read_bytes", "Read a whole file without text decoding", path, ["path"], s.object({ bytes: s.bytes }), async (a, e) => ({ bytes: Array.from(await e.disk.read(a.path)) }));
  add("write", "Write a whole UTF-8 file, optionally comparing its revision", { ...path, body: s.string, expectedRevision: s.integer }, ["path", "body"], s.resource,
    (a, e) => e.disk.write(a.path, new TextEncoder().encode(a.body), a.expectedRevision));
  add("write_bytes", "Write a complete byte array", { ...path, bytes: s.bytes, expectedRevision: s.integer }, ["path", "bytes"], s.resource,
    (a, e) => e.disk.write(a.path, new Uint8Array(a.bytes), a.expectedRevision));
  add("mkdir", "Create a directory", path, ["path"], s.resource, (a, e) => e.disk.mkdir(a.path));
  add("remove", "Remove a resource; nonempty directories require recursive=true", { ...path, recursive: s.boolean }, ["path"], { type: "null" },
    async (a, e) => { await e.disk.remove(a.path, a.recursive === true); return null; });
  for (const operation of ["move", "copy"] as const)
    add(operation, `${operation} a file or folder on the disk`, { source: s.string, destination: s.string }, ["source", "destination"], s.resource,
      (a, e) => e.disk[operation](a.source, a.destination));
}
