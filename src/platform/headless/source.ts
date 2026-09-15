import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { APP_SIBLING_DIRS, isSdkClean } from "../../../apps/sdkClean";
import type { SourceFile, SourceProvider } from "../types";

const SKIP = new Set(["node_modules", "dist", ".git"]);

function sdkCleanFlag(path: string): boolean | undefined {
  if (!path.startsWith("apps/")) return undefined;
  const rest = path.slice("apps/".length);
  if (isSdkClean(rest)) return true;
  const dir = rest.split("/")[0];
  for (const [entry, dirs] of Object.entries(APP_SIBLING_DIRS)) {
    if (dirs?.includes(dir)) return isSdkClean(entry);
  }
  return false;
}

function includeFile(rel: string): boolean {
  if (rel.endsWith(".test.ts") || rel.endsWith(".test.tsx")) return false;
  if (rel === "ARCHITECTURE.md") return true;
  if (rel === "packages/sdk/docs/APP_DEV_GUIDE.md") return true;
  if (/^apps\/.+\.(ts|tsx)$/.test(rel)) return true;
  if (/^packages\/[^/]+\/src\/.+\.(ts|tsx)$/.test(rel)) return true;
  return false;
}

async function walk(root: string, dir: string, files: SourceFile[]): Promise<void> {
  let entries: import("node:fs").Dirent[];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (SKIP.has(entry.name)) continue;
    const full = join(dir, entry.name);
    const rel = relative(root, full).split("\\").join("/");
    if (entry.isDirectory()) {
      await walk(root, full, files);
      continue;
    }
    if (!includeFile(rel)) continue;
    const info = await stat(full);
    files.push({ path: rel, size: info.size, sdkClean: sdkCleanFlag(rel) });
  }
}

export function createCheckoutSourceProvider(root = process.cwd()): SourceProvider {
  let cached: { commit: string; files: SourceFile[] } | undefined;
  return {
    async manifest() {
      if (cached) return cached;
      const files: SourceFile[] = [];
      await walk(root, join(root, "packages"), files);
      await walk(root, join(root, "apps"), files);
      for (const extra of ["ARCHITECTURE.md", "packages/sdk/docs/APP_DEV_GUIDE.md"]) {
        try {
          const info = await stat(join(root, extra));
          files.push({ path: extra, size: info.size });
        } catch { /* optional */ }
      }
      files.sort((a, b) => a.path.localeCompare(b.path));
      cached = { commit: "checkout", files };
      return cached;
    },
    async read(path) {
      return readFile(join(root, path), "utf8");
    },
  };
}
