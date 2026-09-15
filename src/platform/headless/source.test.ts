import { readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { createCheckoutSourceProvider } from "./source";

async function typecheckEmbeddedPaths(root: string): Promise<string[]> {
  const files: string[] = [];
  const walk = async (dir: string) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
        continue;
      }
      const rel = relative(root, full).split("\\").join("/");
      if (!/^packages\/[^/]+\/src\/.+\.(ts|tsx)$/.test(rel)) continue;
      if (rel.endsWith(".test.ts") || rel.endsWith(".test.tsx")) continue;
      files.push(rel);
    }
  };
  for (const pkg of await readdir(join(root, "packages"), { withFileTypes: true })) {
    if (!pkg.isDirectory()) continue;
    const src = join(root, "packages", pkg.name, "src");
    try {
      if ((await stat(src)).isDirectory()) await walk(src);
    } catch { /* no src */ }
  }
  return files;
}

describe("checkout source provider", () => {
  it("covers every packages/*/src path the compiler typecheck glob embeds", async () => {
    const source = createCheckoutSourceProvider();
    const manifest = await source.manifest();
    const paths = new Set(manifest.files.map((file) => file.path));
    const embedded = await typecheckEmbeddedPaths(process.cwd());
    expect(embedded.length).toBeGreaterThan(20);
    expect(embedded.filter((path) => !paths.has(path))).toEqual([]);
    expect(paths.has("ARCHITECTURE.md")).toBe(true);
    expect(manifest.files.some((file) => file.path.endsWith(".test.ts"))).toBe(false);
    expect(await source.read("packages/sdk/docs/APP_DEV_GUIDE.md")).toContain("Mockintosh");
  });
});
