import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bootOS, type BootedOS } from "../boot";
import { createHeadlessPlatform } from "../../platform/headless";
import { registerApp } from "../apps";
import IconGallery from "../../../apps/IconGallery";
import type { InspectionNode } from "@mockintosh/ui";
import type { KernelSession } from "../kernel";

describe("Icon Gallery", () => {
  let os: BootedOS;
  let caller: KernelSession;
  const invoke = (name: string, args = {}) => os.kernel.invoke(caller, name, args);

  beforeEach(async () => {
    vi.useFakeTimers();
    registerApp(IconGallery);
    os = await bootOS(createHeadlessPlatform({ width: 640, height: 480 }));
    vi.advanceTimersByTime(1000);
    caller = os.kernel.createSession();
  });

  afterEach(async () => {
    await os.services.fs.flush();
    os.shutdown();
    vi.useRealTimers();
  });

  it("opens the System 7.5.3 catalog", async () => {
    await invoke("open", { app: "icon_gallery" });
    const nodes = (await invoke("inspect")) as InspectionNode[];
    expect(nodes.some((n) => n.name === "icon-gallery-search")).toBe(true);
    const count = nodes.find((n) => n.name === "icon-gallery-count");
    expect(count?.text).toMatch(/^\d+ families$/);
    expect(Number(count!.text.split(" ")[0])).toBeGreaterThan(200);
    expect(nodes.some((n) => n.name === "icon-gallery-filter-system")).toBe(true);
    expect(nodes.some((n) => n.name === "icon-gallery-selection")).toBe(true);
    expect(nodes.some((n) => n.name?.startsWith("icon-gallery-member-"))).toBe(true);
  });

  it("accepts typing in the header search field", async () => {
    await invoke("open", { app: "icon_gallery" });
    const before = ((await invoke("inspect")) as InspectionNode[]).find(
      (n) => n.name === "icon-gallery-count"
    );
    expect(Number(before!.text.split(" ")[0])).toBeGreaterThan(0);

    await invoke("click", { name: "icon-gallery-search" });
    await invoke("type", { name: "icon-gallery-search", text: "zzzz-no-such-icon" });

    const nodes = (await invoke("inspect")) as InspectionNode[];
    const field = nodes.find((n) => n.name === "icon-gallery-search");
    expect(field?.value).toBe("zzzz-no-such-icon");
    expect(field?.focused).toBe(true);
    expect(nodes.find((n) => n.name === "icon-gallery-count")?.text).toBe("0 families");
  });
});
