import { FSError, type FileSystem, type FSNode } from "@mockintosh/fs";
import { ServiceError, normalizePath } from "./errors";

/** A File Manager node as a trap result. Paths are the `/disk` shell alias. */
export interface FileResource {
  readonly id: string;
  readonly revision: number;
  readonly path: string;
  readonly kind: "file" | "directory";
  readonly contentType: string;
}

/**
 * Path-resolving face of the boot FileSystem for traps and the shell.
 * `/disk` is a prefix for the volume root, not a mount. Finder still uses ids.
 */
export class Disk {
  constructor(private fs: FileSystem) {}

  volume() {
    const volume = this.fs.locate("volume");
    if (!volume) throw new ServiceError("missing-resource", "No persistent volume");
    return volume;
  }

  pathOf(id: string): string {
    const volume = this.volume();
    if (id === volume.id) return "/disk";
    const names: string[] = [];
    let node = this.fs.node(id);
    while (node && node.id !== volume.id) {
      names.unshift(node.name);
      node = node.parentId ? this.fs.node(node.parentId) : undefined;
    }
    if (!node) throw new ServiceError("missing-resource", "Resource is no longer on the disk");
    return "/disk/" + names.join("/");
  }

  node(path: string): FSNode {
    const normalized = normalizePath(path);
    const volume = this.volume();
    if (normalized === "/disk" || normalized.startsWith("/disk/")) {
      let node: FSNode | undefined = volume;
      for (const part of normalized.slice("/disk".length).split("/").filter(Boolean)) {
        node = node.kind === "directory" ? this.fs.child(node.id, part) : undefined;
        if (!node) throw new ServiceError("missing-resource", `No resource at ${path}`);
      }
      return node;
    }
    const resolved = this.fs.resolve(normalized);
    if (!resolved) throw new ServiceError("missing-resource", `No resource at ${path}`);
    return resolved;
  }

  resource(node: FSNode): FileResource {
    return {
      id: node.id,
      revision: node.revision,
      path: this.pathOf(node.id),
      kind: node.kind,
      contentType: node.kind === "file" ? node.type : "inode/directory",
    };
  }

  private parent(path: string) {
    path = normalizePath(path);
    if (path === "/disk") throw new ServiceError("permission", "Cannot replace the volume root");
    const split = path.lastIndexOf("/");
    const parent = this.node(path.slice(0, split) || "/disk");
    if (parent.kind !== "directory") throw new ServiceError("invalid-argument", "Parent is not a directory");
    return { parent, name: path.slice(split + 1) };
  }

  private async mutate<T>(action: () => T | Promise<T>): Promise<T> {
    try {
      const result = await action();
      await this.fs.flush();
      return result;
    } catch (error) {
      if (error instanceof FSError) {
        throw new ServiceError(
          error.code === "conflict" || error.code === "exists" ? "conflict"
            : error.code === "not-found" ? "missing-resource"
            : "invalid-argument",
          error.message,
        );
      }
      throw error;
    }
  }

  async stat(path: string) {
    return this.resource(this.node(path));
  }

  async list(path: string) {
    const node = this.node(path);
    if (node.kind !== "directory") throw new ServiceError("unsupported-operation", "Resource is not a directory");
    return this.fs.children(node.id).map(n => this.resource(n));
  }

  async read(path: string) {
    const node = this.node(path);
    if (node.kind !== "file") throw new ServiceError("unsupported-operation", "Resource is not a file");
    const bytes = await this.fs.readBytes(node.id);
    if (!bytes) throw new ServiceError("missing-resource", "Missing file body");
    return bytes;
  }

  async write(path: string, body: Uint8Array, expectedRevision?: number) {
    const { parent, name } = this.parent(path);
    return this.mutate(async () => this.resource(await this.fs.writeFile(parent.id, name, body, { expectedRevision })));
  }

  async mkdir(path: string) {
    const { parent, name } = this.parent(path);
    return this.mutate(() => this.resource(this.fs.mkdir(parent.id, name)));
  }

  async remove(path: string, recursive: boolean) {
    const node = this.node(path);
    if (node.id === this.volume().id) throw new ServiceError("permission", "Cannot remove the volume root");
    if (node.kind === "directory" && this.fs.childCount(node.id) && !recursive) {
      throw new ServiceError("invalid-argument", "Nonempty directory requires recursive removal");
    }
    await this.mutate(() => this.fs.remove(node.id));
  }

  async move(source: string, destination: string) {
    const node = this.node(source);
    const { parent, name } = this.parent(destination);
    if (node.id === this.volume().id) throw new ServiceError("permission", "Cannot move the volume root");
    if (this.fs.child(parent.id, name)) throw new ServiceError("conflict", "Destination exists");
    if (this.fs.child(parent.id, node.name) && parent.id !== node.parentId) {
      throw new ServiceError("conflict", "Destination contains source name");
    }
    return this.mutate(() => {
      this.fs.batch(() => {
        this.fs.move(node.id, parent.id);
        this.fs.rename(node.id, name);
      });
      return this.resource(this.node(destination));
    });
  }

  async copy(source: string, destination: string): Promise<FileResource> {
    const node = this.node(source);
    const { parent, name } = this.parent(destination);
    if (this.fs.child(parent.id, name)) throw new ServiceError("conflict", "Destination exists");
    if (this.fs.isWithin(parent.id, node.id)) throw new ServiceError("invalid-argument", "Cannot copy into source subtree");
    if (node.kind === "file") {
      return this.mutate(async () => this.resource(await this.fs.writeFile(parent.id, name, await this.read(source), {
        type: node.type,
        expectedRevision: 0,
      })));
    }
    await this.mkdir(destination);
    for (const child of await this.list(source)) {
      await this.copy(child.path, normalizePath(destination) + "/" + this.node(child.path).name);
    }
    return this.stat(destination);
  }
}
