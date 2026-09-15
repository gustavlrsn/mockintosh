/**
 * System windows — windows the shell opens on an app's behalf rather than the
 * app itself: the Finder's About box and Control Panel, and the About box the
 * Apple menu shows for whichever app is frontmost. At most one of each exists
 * per app; opening it again brings the existing one to the front, as the
 * original's `SelectWindow` on an already-open dialog did.
 */

import type { WindowKind } from "@mockintosh/sdk";
import type { OSServices } from "./context";
import { bringToFront, getWindows, type WindowComponent } from "./state";

export interface SystemWindowSpec {
  title: string;
  kind: WindowKind;
  /** Content size in pixels. */
  size: { width: number; height: number };
  scrollable?: boolean;
  resizable?: boolean;
  minSize?: { width: number; height: number };
  /** The content; also what identifies the window as "the" instance of this spec. */
  Component: WindowComponent;
  /** Props for `Component`. */
  props?: Record<string, unknown>;
}

/** The open window mounting `Component` under `appId`, if any. */
export function findSystemWindow(appId: string, Component: WindowComponent) {
  return getWindows().find((w) => w.appId === appId && w.Component === Component);
}

/**
 * Open the single instance of a system window under `appId`, or bring the
 * existing one to the front. Returns the window id either way.
 */
export function openSystemWindow(os: OSServices, appId: string, spec: SystemWindowSpec): string {
  const existing = findSystemWindow(appId, spec.Component);
  if (existing) {
    bringToFront(existing.id);
    return existing.id;
  }
  return os.openWindow(appId, {
    title: spec.title,
    kind: spec.kind,
    size: spec.size,
    scrollable: spec.scrollable ?? false,
    resizable: spec.resizable ?? false,
    minSize: spec.minSize,
    Component: spec.Component,
    props: spec.props,
  });
}
