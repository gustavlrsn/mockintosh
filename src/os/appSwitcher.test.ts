import { describe, expect, it } from "vitest";
import { keyWindowId, orderWindowsForApp, runningAppIds } from "./appSwitcher";
import { FINDER_APP_ID, type OSWindow } from "./state";

function win(id: string, appId: string, kind: OSWindow["kind"] = "document"): OSWindow {
  return { id, appId, kind } as OSWindow;
}

describe("application switcher", () => {
  it("lists the Finder and each app that owns a window, in open order", () => {
    expect(runningAppIds([], FINDER_APP_ID)).toEqual([FINDER_APP_ID]);
    expect(runningAppIds([
      win("a", "paint"),
      win("b", "paint"),
      win("d", "__dialog__"),
      win("c", "safari"),
    ], FINDER_APP_ID)).toEqual([FINDER_APP_ID, "paint", "safari"]);
  });

  it("brings one app's windows forward without reordering within an app", () => {
    const windows = [win("f", FINDER_APP_ID), win("p1", "paint"), win("s", "safari"), win("p2", "paint")];
    expect(orderWindowsForApp(windows, "paint").map((w) => w.id)).toEqual(["f", "s", "p1", "p2"]);
    expect(orderWindowsForApp(windows, FINDER_APP_ID).map((w) => w.id)).toEqual(["p1", "s", "p2", "f"]);
  });

  it("keys the front document, not a palette floating above it", () => {
    const windows = [win("doc", "paint"), win("tools", "paint", "utility")];
    expect(keyWindowId(orderWindowsForApp(windows, "paint"), "paint")).toBe("doc");
    expect(keyWindowId([], FINDER_APP_ID)).toBeNull();
  });
});
