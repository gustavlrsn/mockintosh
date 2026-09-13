import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bootOS, type BootedOS } from "../boot";
import { createHeadlessPlatform } from "../../platform/headless";
import { registerApp } from "../apps";
import ControlPanel from "../../../apps/ControlPanel";
import type { KernelSession } from "./index";
import { getWindows } from "../state";
import { InMemoryBackend } from "@mockintosh/fs";
import { Cancellation } from "./cancellation";
import type { InspectionNode } from "@mockintosh/ui";
describe("visible kernel UI operations", () => {
  let os: BootedOS, caller: KernelSession;
  const invoke = (name: string, args = {}) => os.kernel.invoke(caller, name, args);
  beforeEach(async () => {
    vi.useFakeTimers();
    registerApp(ControlPanel);
    os = await bootOS(createHeadlessPlatform({
      width: 640,
      height: 480
    }));
    vi.advanceTimersByTime(1000);
    caller = os.kernel.createSession();
  });
  afterEach(async () => {
    await os.services.fs.flush();
    os.shutdown();
    vi.useRealTimers();
  });
  it("exposes desktop pattern as a typed trap backed by the Preferences file", async () => {
    expect(os.kernel.describe().some(operation => operation.name === "desktop_pattern")).toBe(true);
    expect(await invoke("desktop_pattern", {value: "black"})).toMatchObject({pattern: "black", diagnostic: ""});
    expect(os.services.desktopSettings!.pattern()).toBe("black");
    const preferences = os.services.fs.locate("preferences")!;
    expect(await os.services.fs.readText(os.services.fs.child(preferences.id, "desktop-pattern")!.id)).toBe("black\n");
  });
  it("saves screenshots onto the disk", async () => {
    expect(await invoke("screenshot_save", {path: "/disk/capture.pbm"})).toMatchObject({path: "/disk/capture.pbm"});
  });
  it("retains the desktop setting across reboot", async () => {
    os.shutdown();
    const backend = new InMemoryBackend();
    const reboot = async () => {
      os = await bootOS({...createHeadlessPlatform({width: 640, height: 480}), storage: backend});
      vi.advanceTimersByTime(1000);
      caller = os.kernel.createSession();
    };
    await reboot();
    expect(await invoke("desktop_pattern")).toMatchObject({pattern: "checker", diagnostic: expect.stringContaining("missing")});
    await invoke("desktop_pattern", {value: "black"});
    expect(await invoke("desktop_pattern")).toMatchObject({pattern: "black", diagnostic: ""});
    await invoke("open", {app: "control_panel"});
    const window = getWindows().find(window => window.appId === "control_panel")!;
    const nodes = await invoke("inspect", {window: window.id}) as InspectionNode[];
    expect(nodes.some(node => node.name === "desktop-pattern-white")).toBe(true);
    await invoke("click", {name: "desktop-pattern-white", window: window.id});
    os.shutdown();
    await reboot();
    expect(await invoke("desktop_pattern")).toMatchObject({pattern: "white", diagnostic: ""});
    const preferences = os.services.fs.locate("preferences")!;
    await os.services.fs.writeFile(preferences.id, "desktop-pattern", "invalid");
    await os.services.desktopSettings!.settled();
    expect(await invoke("desktop_pattern")).toMatchObject({pattern: "checker", diagnostic: expect.stringContaining("Expected checker")});
  });
  it("cancels nested invoke when the caller is revoked", async () => {
    let started!: () => void;
    const began = new Promise<void>(resolve => { started = resolve; });
    let innerCancelled = false;
    os.kernel.register({name: "pause_fixture", description: "fixture", inputSchema: {type: "object", properties: {}, required: [], additionalProperties: false}, resultSchema: {type: "null"}, handler: async (_, {cancellation: token}) => {
      started();
      try { await token.delay(10000); } finally { innerCancelled = token.cancelled; }
    }});
    os.kernel.register({name: "outer_fixture", description: "fixture", inputSchema: {type: "object", properties: {}, required: [], additionalProperties: false}, resultSchema: {type: "null"}, handler: async (_, execution) => {
      await execution.invoke("pause_fixture", {});
      return null;
    }});
    const restricted = os.kernel.createSession();
    const pending = os.kernel.invoke(restricted, "outer_fixture", {});
    const rejected = expect(pending).rejects.toMatchObject({code: "disconnect"});
    await began;
    os.kernel.revokeSession(restricted.id);
    await rejected;
    expect(innerCancelled).toBe(true);
  });
  it.each(["cancel", "shutdown"])("interrupts stalled render on %s", async mode => {
    os.shutdown();
    let release!: () => void;
    class StalledBackend extends InMemoryBackend {
      stall = false;
      override async writeBlob(id: string, bytes: Uint8Array) {
        if (this.stall) await new Promise<void>(resolve => { release = resolve; });
        return super.writeBlob(id, bytes);
      }
    }
    const backend = new StalledBackend();
    os = await bootOS({ ...createHeadlessPlatform({ width: 640, height: 480 }), storage: backend });
    vi.advanceTimersByTime(1000);
    backend.stall = true;
    const write = os.services.desktopSettings!.set("black");
    await Promise.resolve();
    const token = new Cancellation();
    let outcome = "pending";
    const rendering = os.render(token).then(() => { outcome = "rendered"; }, () => { outcome = "cancelled"; });
    if (mode === "shutdown") os.shutdown(); else token.cancel();
    for (let i = 0; i < 10; i++) await Promise.resolve();
    const observed = outcome;
    release();
    await write;
    await rendering;
    expect(observed).toBe("cancelled");
  });
  it("provides readable UI shell output while retaining direct and JSON snapshots", async () => {
    expect(await invoke("run_shell", { command: "open control_panel; render" })).toMatchObject({ stdout: "", exitCode: 0 });
    expect(await invoke("run_shell", { command: "apps; windows; inspect; menu" })).toMatchObject({
      stdout: expect.stringContaining("desktop-pattern-black"), exitCode: 0,
    });
    const listing = await invoke("run_shell", { command: "windows" }) as { stdout: string };
    expect(listing.stdout).toContain("WINDOW");
    expect(listing.stdout).toContain("active");
    expect(listing.stdout).toContain("Control Panel");
    const snapshot = await invoke("run_shell", { command: "inspect --json" }) as { stdout: string };
    expect(JSON.parse(snapshot.stdout)).toEqual(await invoke("inspect"));
    const menu = await invoke("run_shell", { command: "menu" }) as { stdout: string };
    expect(menu.stdout).toContain("  Control Panel\n");
    expect(menu.stdout).toContain("(disabled)");
  });
  it("operates a named Control Panel setting and captures an idle frame", async () => {
    await invoke("open", {
      app: "control_panel"
    });
    const nodes = (await invoke("inspect")) as InspectionNode[];
    expect(nodes.some(n => n.name === "desktop-pattern-black")).toBe(true);
    await invoke("click", {
      name: "desktop-pattern-black"
    });
    await os.services.fs.flush();
    expect(await invoke("desktop_pattern")).toMatchObject({pattern: "black"});
    const frame = (await invoke("screenshot")) as {
      bytes: number[];
      width: number;
    };
    expect(frame.width).toBe(640);
    expect(frame.bytes.length).toBeGreaterThan(0);
    await invoke("screenshot_save", {
      path: "/disk/screen.pbm"
    });
    expect(((await invoke("read", {
      path: "/disk/screen.pbm"
    })) as string).startsWith("P4\n640 480\n")).toBe(true);
  });
  it("does not acknowledge a setting click until delayed storage commits", async () => {
    os.shutdown();
    let release: (() => void) | undefined;
    class DelayedBackend extends InMemoryBackend {
      delay = false;
      override async writeBlob(id: string, bytes: Uint8Array) {
        if (this.delay) await new Promise<void>(resolve => {
          release = resolve;
        });
        await super.writeBlob(id, bytes);
      }
    }
    const backend = new DelayedBackend(),
      platform = createHeadlessPlatform({
        width: 640,
        height: 480
      });
    os = await bootOS({
      ...platform,
      storage: backend
    });
    vi.advanceTimersByTime(1000);
    caller = os.kernel.createSession();
    await invoke("open", {
      app: "control_panel"
    });
    backend.delay = true;
    let completed = false;
    const click = invoke("click", {
      name: "desktop-pattern-black"
    }).then(() => {
      completed = true;
    });
    for (let i = 0; i < 40; i++) await Promise.resolve();
    const acknowledgedBeforeWrite = completed;
    release?.();
    await click;
    expect(acknowledgedBeforeWrite).toBe(false);
    expect(os.services.desktopSettings!.pattern()).toBe("black");
  });
  it("keeps the Terminal command field visible and accepts named typing", async () => {
    await invoke("open", {
      app: "terminal"
    });
    const field = ((await invoke("inspect")) as InspectionNode[]).find(n => n.name === "terminal-command")!;
    expect(field.bounds.height).toBeGreaterThan(0);
    await invoke("click", {
      id: field.id
    });
    await invoke("type", {
      id: field.id,
      text: "echo terminal-test"
    });
    await invoke("key", {
      key: "Enter"
    });
    expect(((await invoke("inspect")) as InspectionNode[]).some(n => n.text.includes("terminal-test\n"))).toBe(true);
  });
  it("rejects inactive and stale controls", async () => {
    await invoke("open", {
      app: "control_panel"
    });
    const first = getWindows().find(w => w.appId === "control_panel")!;
    const node = ((await invoke("inspect")) as InspectionNode[]).find(n => n.name === "desktop-pattern-black")!;
    await invoke("open", {
      app: "terminal"
    });
    await expect(invoke("click", {
      id: node.id
    })).rejects.toMatchObject({
      code: "permission"
    });
    await invoke("activate", {
      window: first.id
    });
    os.services.closeWindow(first.id);
    await expect(invoke("click", {
      id: node.id
    })).rejects.toMatchObject({
      code: "stale-reference"
    });
  });
  it("uses the same validated persistent setting through shell and Preferences", async () => {
    const result = (await invoke("run_shell", {
      command: "desktop_pattern white"
    })) as {
      exitCode: number;
      stdout: string;
    };
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("white");
    await expect(invoke("desktop_pattern", {value: "purple"})).rejects.toMatchObject({
      code: "invalid-argument"
    });
    const fs = os.services.fs,
      preferences = fs.locate("preferences")!;
    await fs.writeFile(preferences.id, "desktop-pattern", "black\n");
    await os.services.desktopSettings!.settled();
    expect(os.services.desktopSettings!.pattern()).toBe("black");
    expect(await invoke("desktop_pattern")).toMatchObject({pattern: "black"});
  });
  it("rejects ambiguous names and controls behind a modal", async () => {
    await invoke("open", {
      app: "terminal"
    });
    await invoke("open", {
      app: "terminal"
    });
    await expect(invoke("click", {
      name: "terminal-command"
    })).rejects.toMatchObject({
      code: "ambiguity"
    });
    await invoke("open", {
      app: "control_panel"
    });
    const panel = getWindows().find(w => w.appId === "control_panel")!;
    os.services.openApp("__dialog__", {
      message: "Modal",
      buttons: ["OK"],
      resolve: () => {}
    });
    await expect(invoke("activate", {
      window: panel.id
    })).rejects.toMatchObject({
      code: "permission"
    });
    await expect(invoke("click", {
      name: "desktop-pattern-black"
    })).rejects.toMatchObject({
      code: "permission"
    });
  });
  it("captures exact white and black desktop pixels", async () => {
    for (const [value, expected] of [["white", 0], ["black", 1]] as const) {
      await invoke("desktop_pattern", {value});
      const frame = (await invoke("screenshot")) as {
        rowBytes: number;
        bytes: number[];
      };
      for (let y = 200; y < 208; y++) for (let x = 4; x < 12; x++) expect(frame.bytes[y * frame.rowBytes + (x >> 3)] >> 7 - (x & 7) & 1).toBe(expected);
    }
  });
  it("cancels a long typed gesture and leaves subsequent input usable", async () => {
    await invoke("open", {
      app: "terminal"
    });
    const field = ((await invoke("inspect")) as InspectionNode[]).find(n => n.name === "terminal-command")!;
    await invoke("click", {
      id: field.id
    });
    const token = new Cancellation();
    const typing = os.kernel.invoke(caller, "type", {
      id: field.id,
      text: "x".repeat(200)
    }, token);
    const rejected = expect(typing).rejects.toMatchObject({
      code: "cancellation"
    });
    for (let i = 0; i < 100; i++) await Promise.resolve();
    token.cancel();
    await rejected;
    await invoke("key", {
      key: "a",
      meta: true
    });
    await invoke("type", {
      id: field.id,
      text: "recovered"
    });
    expect(((await invoke("inspect")) as InspectionNode[]).find(n => n.id === field.id)?.value).toBe("recovered");
  });
  it("returns cancellation status and rejects work after shutdown", async () => {
    const token = new Cancellation();
    const running = os.kernel.invoke(caller, "run_shell", {
      command: "sleep 10; echo never"
    }, token);
    await Promise.resolve();
    token.cancel();
    expect(await running).toMatchObject({
      exitCode: 130
    });
    os.shutdown();
    await expect(invoke("inspect")).rejects.toMatchObject({
      code: "disconnect"
    });
  });
});
