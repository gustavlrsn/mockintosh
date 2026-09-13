import type { FileSystem } from "@mockintosh/fs";
import { Disk } from "../kernel";

export function diskPath(fs: FileSystem, id: string): string {
  return new Disk(fs).pathOf(id);
}
