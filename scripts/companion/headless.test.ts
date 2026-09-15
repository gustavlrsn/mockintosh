import { it, expect } from "vitest";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
it("explicit headless CLI operates the reactive UI and captures its frame", async () => {
  const result = await promisify(execFile)(process.execPath, ["--import", "tsx", "scripts/mockintosh-sh.ts", "--headless", "-c", "menu \uF8FF 'Control Panel'; click desktop-pattern-black; screenshot /disk/headless.pbm; desktop_pattern"], { timeout: 15000 });
  expect(result.stderr).toBe("");
  expect(result.stdout).toBe("/disk/headless.pbm\nblack\n");
  expect(result.stdout.endsWith("black\n")).toBe(true);
}, 20000);
