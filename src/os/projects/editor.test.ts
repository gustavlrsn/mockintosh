import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {bootOS, type BootedOS} from "../boot";
import {createHeadlessPlatform} from "../../platform/headless";
import type {KernelSession} from "../kernel";
import type {InspectionNode} from "@mockintosh/ui";

describe("source editing through shared input", () => {
  let os: BootedOS, caller: KernelSession;
  const path = "/disk/Applications/Editor.app", file = path + "/src/index.tsx";
  const invoke = (name: string, args = {}) => os.kernel.invoke(caller, name, args);
  beforeEach(async () => {
    vi.useFakeTimers(); os = await bootOS(createHeadlessPlatform({width: 640, height: 480})); vi.advanceTimersByTime(1000);
    caller = os.kernel.createSession();
    await invoke("project_create", {path, id: "editor_fixture", title: "Editor fixture"});
    await invoke("source_open", {path});
    for (let i = 0; i < 50; i++) {
      const nodes = await invoke("inspect") as InspectionNode[];
      if (nodes.find(n => n.name === "source-code")?.enabled && nodes.find(n => n.name === "source-code")?.value) break;
    }
  });
  afterEach(async () => { os.shutdown(); await os.services.fs.flush(); vi.useRealTimers(); });
  it("types multiline source, saves it, and preserves a concurrent writer on conflict", async () => {
    await invoke("click", {name: "source-code"});
    await invoke("key", {key: "a", meta: true});
    await invoke("type", {name: "source-code", text: "alpha\nbeta"});
    await invoke("click", {name: "source-save"});
    expect(await invoke("read", {path: file})).toBe("alpha\nbeta");
    await invoke("write", {path: file, body: "external winner"});
    await invoke("click", {name: "source-code"});
    await invoke("key", {key: "a", meta: true});
    await invoke("type", {name: "source-code", text: "unsaved local"});
    await invoke("click", {name: "source-save"});
    expect(await invoke("read", {path: file})).toBe("external winner");
    const nodes = await invoke("inspect") as InspectionNode[];
    expect(nodes.find(n => n.name === "source-code")?.value).toBe("unsaved local");
  });
});
