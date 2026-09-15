import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { compile } from "../scripts/builder/compiler";
import {
  APP_SIBLING_DIRS,
  APP_TITLES,
  BUNDLED_APPS,
  bundledAppsGuideRows,
  isSdkClean,
  type BundledAppEntry,
} from "./sdkClean";

const appsDir = dirname(fileURLToPath(import.meta.url));
const guidePath = fileURLToPath(new URL("../packages/sdk/docs/APP_DEV_GUIDE.md", import.meta.url));

function walk(dir: string, visit: (abs: string) => void): void {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) walk(abs, visit);
    else visit(abs);
  }
}

function projectFiles(entry: BundledAppEntry): { path: string; text: string }[] {
  const files: { path: string; text: string }[] = [];
  const add = (abs: string) => {
    if (/\.test\.(ts|tsx)$/.test(abs)) return;
    if (!/\.(tsx?|jsx?)$/.test(abs)) return;
    const rel = relative(appsDir, abs).replaceAll("\\", "/");
    files.push({ path: `src/${rel}`, text: readFileSync(abs, "utf8") });
  };
  add(join(appsDir, entry));
  for (const dir of APP_SIBLING_DIRS[entry] ?? []) walk(join(appsDir, dir), add);
  return files;
}

function compileApp(entry: BundledAppEntry) {
  return compile({
    requestId: `sdk-clean-${entry}`,
    sourceRevision: "sdk-clean",
    entry: `src/${entry}`,
    sdkVersion: "2",
    files: projectFiles(entry),
  });
}

describe("SDK-clean bundled apps", () => {
  it.each([...BUNDLED_APPS])("%s", async (entry) => {
    const result = await compileApp(entry);
    if (isSdkClean(entry)) {
      expect(result.diagnostics, result.diagnostics.map((d) => d.message).join("\n")).toEqual([]);
      expect(result.code).toBeTruthy();
    } else {
      expect(result.diagnostics.length, `${entry} (${APP_TITLES[entry]}) compiled clean; add it to SDK_CLEAN`).toBeGreaterThan(0);
    }
  }, 60_000);

  it("lists SDK_CLEAN and SHELL_APPS in the App Developer Guide table", () => {
    const guide = readFileSync(guidePath, "utf8");
    const section = guide.split("## Bundled apps")[1] ?? "";
    expect(section, "APP_DEV_GUIDE.md is missing a ## Bundled apps section").toBeTruthy();
    const rows = [...section.matchAll(/^\| ([^|]+) \| `([^`]+)` \| (SDK-clean|Shell) \|$/gm)].map((m) => ({
      title: m[1].trim(),
      source: m[2],
      kind: m[3] as "SDK-clean" | "Shell",
    }));
    expect(rows).toEqual(bundledAppsGuideRows());
  });
});
